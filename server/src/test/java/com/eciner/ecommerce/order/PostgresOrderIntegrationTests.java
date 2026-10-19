package com.eciner.ecommerce.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eciner.ecommerce.common.error.ConflictException;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = "logging.level.org.springframework.web=INFO")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class PostgresOrderIntegrationTests {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.flyway.locations",
                () -> "classpath:db/migration,classpath:db/test-migration");
        registry.add("spring.jpa.show-sql", () -> false);
    }

    @Autowired Flyway flyway;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired RoleRepository roles;
    @Autowired UserRepository users;
    @Autowired OrderRepository orders;
    @Autowired OrderService service;

    @Test
    void productionMigrationsAndHibernateMappingsValidateOnPostgres() {
        assertThat(postgres.isRunning()).isTrue();
        assertThat(flyway.info().applied()).filteredOn(migration -> migration.getVersion() != null)
                .hasSize(13);
        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("13");
        assertThat(jdbc.queryForObject("select data_type from information_schema.columns "
                + "where table_schema = current_schema() and table_name = 'customer_order' and column_name = 'order_date'", String.class))
                .isEqualTo("timestamp with time zone");
        // Reaching this assertion requires Spring context startup and Hibernate ddl-auto=validate.
        assertThat(orders.count()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void additiveUpgradeFromV7PreservesExistingOrderAndInventoryData() throws Exception {
        Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
            .schemas("upgrade_check").locations("classpath:db/migration").target("7").load().migrate();
        try (var connection = java.sql.DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
            connection.setSchema("upgrade_check");
            try (var statement = connection.createStatement()) {
                statement.executeUpdate("insert into app_user(id,name,email,password_hash,role_id) select 100,'Upgrade Fixture','upgrade@example.test','non-login-fixture',id from role where code='customer'");
                statement.executeUpdate("insert into customer_order(id,user_id,address_id,order_date,price) values(100,100,42,CURRENT_TIMESTAMP,299.90)");
                statement.executeUpdate("insert into order_item(order_id,product_id,count,unit_price,detail) values(100,1,1,299.90,'historical detail')");
                statement.executeUpdate("update product set stock=39,sell_count=121 where id=1");
            }
        }
        Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
            .schemas("upgrade_check").locations("classpath:db/migration").load().migrate();
        try (var connection = java.sql.DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
            connection.setSchema("upgrade_check");
            try (var statement = connection.createStatement(); var result = statement.executeQuery("select price,shipping_address,receipt_address,request_id,request_fingerprint from customer_order where id=100")) {
                assertThat(result.next()).isTrue();
                assertThat(result.getBigDecimal(1)).isEqualByComparingTo("299.90");
                assertThat(result.getString(2)).isNull(); assertThat(result.getString(3)).isNull();
                assertThat(result.getObject(4)).isNull(); assertThat(result.getString(5)).isNull();
            }
            try (var statement = connection.createStatement(); var result = statement.executeQuery("select stock,sell_count,name from product where id=1")) {
                assertThat(result.next()).isTrue(); assertThat(result.getInt(1)).isEqualTo(39);
                assertThat(result.getInt(2)).isEqualTo(121); assertThat(result.getString(3)).isEqualTo("Siyah Kadin Elbise");
            }
            try (var statement = connection.createStatement(); var result = statement.executeQuery("select detail,unit_price,product_name from order_item where order_id=100")) {
                assertThat(result.next()).isTrue(); assertThat(result.getString(1)).isEqualTo("historical detail");
                assertThat(result.getBigDecimal(2)).isEqualByComparingTo("299.90"); assertThat(result.getString(3)).isNull();
            }
        }
    }

    @Test
    void orderInstantSurvivesFreshPostgresReads() throws Exception {
        Account account = account();
        long address = address(account.token());
        int stock = number("select stock from product where id = 1");
        int sold = number("select sell_count from product where id = 1");
        Instant submitted = Instant.parse("2026-09-26T16:30:00Z");
        try {
            JsonNode created = mapper.readTree(mvc.perform(post("/order")
                    .header("Authorization", account.token()).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"address_id\":" + address + ",\"order_date\":\"" + submitted
                            + "\",\"price\":0.01,\"products\":[{\"product_id\":1,\"count\":1}]}"))
                    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
            long orderId = created.path("id").asLong();
            assertThat(orders.findById(orderId).orElseThrow().getOrderDate()).isEqualTo(submitted);
            OffsetDateTime stored = jdbc.queryForObject(
                    "select order_date from customer_order where id = ?", OffsetDateTime.class, orderId);
            assertThat(stored.toInstant()).isEqualTo(submitted);
        } finally {
            jdbc.update("update product set stock = ?, sell_count = ? where id = 1", stock, sold);
        }
    }

    @Test
    void pessimisticLockAllowsOnlyOneOrderForLastUnit() throws Exception {
        Account account = account();
        long address = address(account.token());
        int stock = number("select stock from product where id = 1");
        int sold = number("select sell_count from product where id = 1");
        long ordersBefore = count("select count(*) from customer_order");
        long itemsBefore = count("select count(*) from order_item");
        jdbc.update("update product set stock = 1 where id = 1");
        var pool = Executors.newFixedThreadPool(2);
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var request = new OrderRequest(address, null, null,
                List.of(new OrderRequest.Line(1L, 1, "postgres lock")));
        try {
            Callable<String> attempt = () -> {
                ready.countDown();
                if (!start.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("Both order attempts did not start");
                }
                try {
                    service.create(account.id(), request);
                    return "created";
                } catch (ConflictException exception) {
                    return exception.getCode();
                }
            };
            Future<String> first = pool.submit(attempt);
            Future<String> second = pool.submit(attempt);
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(List.of(first.get(30, TimeUnit.SECONDS), second.get(30, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder("created", "INSUFFICIENT_STOCK");
            assertThat(number("select stock from product where id = 1")).isZero();
            assertThat(number("select sell_count from product where id = 1")).isEqualTo(sold + 1);
            assertThat(count("select count(*) from customer_order")).isEqualTo(ordersBefore + 1);
            assertThat(count("select count(*) from order_item")).isEqualTo(itemsBefore + 1);
        } finally {
            start.countDown();
            pool.shutdownNow();
            jdbc.update("update product set stock = ?, sell_count = ? where id = 1", stock, sold);
        }
    }

    @Test
    void concurrentIdenticalRequestsAndLostResponseReplayCreateExactlyOneOrder() throws Exception {
        Account account = account(); long address = address(account.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        long before = orders.count(); long lines = count("select count(*) from order_item");
        var request = new OrderRequest(UUID.randomUUID(), address, null, Instant.parse("2026-10-17T00:00:00Z"),
            null, List.of(new OrderRequest.Line(1L, 1, "idempotent")));
        var pool = Executors.newFixedThreadPool(2);
        var start = new CountDownLatch(1); var ready = new CountDownLatch(2);
        try {
            Callable<OrderResponse> attempt = () -> { ready.countDown(); start.await(10, TimeUnit.SECONDS); return service.create(account.id(), request); };
            var first = pool.submit(attempt); var second = pool.submit(attempt);
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue(); start.countDown();
            var a = first.get(30, TimeUnit.SECONDS); var b = second.get(30, TimeUnit.SECONDS);
            assertThat(a).isEqualTo(b);
            // Discard both responses as if transport lost them; even deleted addresses cannot prevent replay.
            jdbc.update("delete from user_address where id=?", address);
            assertThat(service.create(account.id(), request)).isEqualTo(a);
            assertThat(orders.count()).isEqualTo(before + 1);
            assertThat(count("select count(*) from order_item")).isEqualTo(lines + 1);
            assertThat(number("select stock from product where id=1")).isEqualTo(stock - 1);
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 1);
        } finally { start.countDown(); pool.shutdownNow(); jdbc.update("update product set stock=?,sell_count=? where id=1", stock, sold); }
    }

    @Test
    void keyIsOwnerScopedRejectsChangedIntentAndDoesNotDeduplicateDistinctOrders() throws Exception {
        Account a = account(); Account b = account(); long addressA = address(a.token()); long addressB = address(b.token());
        UUID key = UUID.randomUUID();
        int stock = number("select stock from product where id=1"); int sold = number("select sell_count from product where id=1");
        var lines = List.of(new OrderRequest.Line(1L, 1, "first intent"));
        var request = new OrderRequest(key, addressA, null, null, null, lines);
        try {
            var first = service.create(a.id(), request);
            org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.create(a.id(), new OrderRequest(key, addressA, null, null, null,
                List.of(new OrderRequest.Line(1L, 2, "first intent")))))
                .isInstanceOf(ConflictException.class).hasMessageContaining("different order intent");
            var own = service.create(b.id(), new OrderRequest(key, addressB, null, null, null, lines));
            var distinct = service.create(a.id(), new OrderRequest(UUID.randomUUID(), addressA, null, null, null, lines));
            assertThat(own.id()).isNotEqualTo(first.id()); assertThat(distinct.id()).isNotEqualTo(first.id());
            assertThat(service.list(b.id())).extracting(OrderResponse::id).doesNotContain(first.id());
            assertThat(number("select stock from product where id=1")).isEqualTo(stock - 3);
        } finally { jdbc.update("update product set stock=?,sell_count=? where id=1", stock, sold); }
    }

    @Test
    void rolledBackFailureDoesNotReserveKeyOrPartiallyConsumeInventory() throws Exception {
        Account account = account(); long address = address(account.token());
        int stock = number("select stock from product where id=1"); int sold = number("select sell_count from product where id=1");
        long before = orders.count(); UUID key = UUID.randomUUID();
        var request = new OrderRequest(key, address, null, null, null, List.of(new OrderRequest.Line(1L, 1, "retry after rollback")));
        try {
            jdbc.update("update product set stock=0 where id=1");
            org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.create(account.id(), request)).isInstanceOf(ConflictException.class);
            assertThat(orders.count()).isEqualTo(before);
            assertThat(orders.findByOwner_IdAndRequestId(account.id(), key)).isEmpty();
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold);
            jdbc.update("update product set stock=1 where id=1");
            var result = service.create(account.id(), request);
            assertThat(service.create(account.id(), request)).isEqualTo(result);
            assertThat(orders.count()).isEqualTo(before + 1);
            assertThat(number("select stock from product where id=1")).isZero();
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 1);
        } finally { jdbc.update("update product set stock=?,sell_count=? where id=1", stock, sold); }
    }

    @Test
    void mixedLegacyAndKeyedRequestsCompleteWithoutDuplicateOrInventoryLoss() throws Exception {
        Account account = account(); long address = address(account.token());
        int stock = number("select stock from product where id=1"); int sold = number("select sell_count from product where id=1");
        long before = orders.count(); var pool = Executors.newFixedThreadPool(2); var start = new CountDownLatch(1);
        var lines = List.of(new OrderRequest.Line(1L, 1, "mixed clients"));
        var keyed = new OrderRequest(UUID.randomUUID(), address, null, null, null, lines);
        var legacy = new OrderRequest(address, null, null, lines);
        try {
            var a = pool.submit(() -> { start.await(); return service.create(account.id(), keyed); });
            var b = pool.submit(() -> { start.await(); return service.create(account.id(), legacy); }); start.countDown();
            assertThat(a.get(30, TimeUnit.SECONDS).id()).isNotEqualTo(b.get(30, TimeUnit.SECONDS).id());
            assertThat(orders.count()).isEqualTo(before + 2);
            assertThat(number("select stock from product where id=1")).isEqualTo(stock - 2);
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 2);
        } finally { start.countDown(); pool.shutdownNow(); jdbc.update("update product set stock=?,sell_count=? where id=1",stock,sold); }
    }

    @Test
    void concurrentDifferentPayloadsUnderOneKeyCommitOnlyTheWinningIntent() throws Exception {
        Account account = account(); long address = address(account.token()); UUID key = UUID.randomUUID();
        int stock = number("select stock from product where id=1"); int sold = number("select sell_count from product where id=1");
        long before = orders.count(); var pool = Executors.newFixedThreadPool(2); var start = new CountDownLatch(1);
        try {
            var attempts = new java.util.ArrayList<Future<Object>>();
            for (int quantity : List.of(1,2)) attempts.add(pool.submit(() -> {
                start.await();
                try { return service.create(account.id(),new OrderRequest(key,address,null,null,null,List.of(new OrderRequest.Line(1L,quantity,"race")))); }
                catch (ConflictException error) { return error.getCode(); }
            }));
            start.countDown(); var results = List.of(attempts.get(0).get(30,TimeUnit.SECONDS),attempts.get(1).get(30,TimeUnit.SECONDS));
            assertThat(results).filteredOn(result -> result instanceof String).containsExactly("ORDER_REQUEST_CONFLICT");
            var winner = (OrderResponse) results.stream().filter(result -> result instanceof OrderResponse).findFirst().orElseThrow();
            int quantity = winner.products().get(0).count();
            assertThat(orders.count()).isEqualTo(before + 1);
            assertThat(number("select stock from product where id=1")).isEqualTo(stock - quantity);
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + quantity);
        } finally { start.countDown(); pool.shutdownNow(); jdbc.update("update product set stock=?,sell_count=? where id=1",stock,sold); }
    }

    private int number(String sql) { return jdbc.queryForObject(sql, Integer.class); }
    private long count(String sql) { return jdbc.queryForObject(sql, Long.class); }

    private Account account() throws Exception {
        String email = "postgres-order-" + UUID.randomUUID() + "@example.com";
        long role = roles.findByCode("customer").orElseThrow().getId();
        mvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Order Test\",\"email\":\"" + email
                        + "\",\"password\":\"StrongPass1!\",\"role_id\":" + role + "}"))
                .andExpect(status().isCreated());
        String response = mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"StrongPass1!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return new Account(mapper.readTree(response).path("token").asText(),
                users.findByEmailIgnoreCase(email).orElseThrow().getId());
    }

    private long address(String token) throws Exception {
        String response = mvc.perform(post("/user/address").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Home\",\"name\":\"Test\",\"surname\":\"Person\","
                        + "\"phone\":\"05551112233\",\"city\":\"Istanbul\",\"district\":\"Central\","
                        + "\"neighborhood\":\"Street\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).path("id").asLong();
    }

    private record Account(String token, long id) {}
}
