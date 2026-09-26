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
                .hasSize(7);
        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("7");
        assertThat(jdbc.queryForObject("select data_type from information_schema.columns "
                + "where table_name = 'customer_order' and column_name = 'order_date'", String.class))
                .isEqualTo("timestamp with time zone");
        // Reaching this assertion requires Spring context startup and Hibernate ddl-auto=validate.
        assertThat(orders.count()).isGreaterThanOrEqualTo(0);
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
