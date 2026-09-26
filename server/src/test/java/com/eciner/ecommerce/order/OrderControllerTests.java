package com.eciner.ecommerce.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.UUID;
import java.util.List;
import java.time.Instant;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired RoleRepository roles;
    @Autowired UserRepository users;
    @Autowired JdbcTemplate jdbc;
    @Autowired OrderService service;
    @MockitoSpyBean OrderRepository orderRepository;
    @PersistenceContext EntityManager entityManager;

    @Test
    void authenticationIsRequiredForBothEndpoints() throws Exception {
        mvc.perform(post("/order").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/order")).andExpect(status().isUnauthorized());
    }

    @Test
    void creationUsesDatabasePriceAndUpdatesInventoryWithoutSavingPaymentSecrets() throws Exception {
        Account a = account();
        long address = address(a.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        try {
            String body = payload(address, "[{\"product_id\":1,\"count\":2,\"detail\":\"blue xl\"}]");
            JsonNode created = json(mvc.perform(post("/order").header("Authorization", a.token())
                    .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.price").value(599.8))
                    .andExpect(jsonPath("$.products[0].detail").value("blue xl"))
                    .andExpect(jsonPath("$.card_no").doesNotExist())
                    .andExpect(jsonPath("$.card_ccv").doesNotExist()).andReturn().getResponse().getContentAsString());
            assertThat(number("select stock from product where id=1")).isEqualTo(stock - 2);
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 2);
            JsonNode history = json(mvc.perform(get("/order").header("Authorization", a.token()))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
            assertThat(history.get(0).path("id").asLong()).isEqualTo(created.path("id").asLong());
            assertThat(history.toString()).doesNotContain("4111111111111111", "321", "card_no", "card_ccv");
            assertThat(jdbc.queryForObject("select count(*) from information_schema.columns where table_name in ('CUSTOMER_ORDER','ORDER_ITEM') and column_name in ('CARD_NO','CARD_CCV','CVV','CVC','CCV')", Integer.class)).isZero();
        } finally {
            jdbc.update("update product set stock=?, sell_count=? where id=1", stock, sold);
        }
    }

    @Test
    void utcOrderDateSurvivesPostPersistenceAndHistory() throws Exception {
        Account a = account();
        long address = address(a.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        Instant submitted = Instant.parse("2026-09-26T16:30:00Z");
        try {
            JsonNode created = json(submit(a.token(), payload(address,
                    "[{\"product_id\":1,\"count\":1}]"))
                    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
            assertThat(Instant.parse(created.path("order_date").asText())).isEqualTo(submitted);
            JsonNode history = json(mvc.perform(get("/order").header("Authorization", a.token()))
                    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
            assertThat(Instant.parse(history.get(0).path("order_date").asText())).isEqualTo(submitted);
            assertThat(history.get(0).path("id").asLong()).isEqualTo(created.path("id").asLong());
        } finally {
            jdbc.update("update product set stock=?, sell_count=? where id=1", stock, sold);
        }
    }

    @Test
    void validationAndOwnershipFailuresHaveExpectedStatuses() throws Exception {
        Account a = account();
        Account b = account();
        long aAddress = address(a.token());
        long bAddress = address(b.token());
        submit(a.token(), payload(aAddress, "[]")).andExpect(status().isBadRequest());
        submit(a.token(), payload(aAddress, "[{\"product_id\":1,\"count\":0}]"))
                .andExpect(status().isBadRequest());
        submit(a.token(), payload(aAddress, "[{\"product_id\":999999,\"count\":1}]"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
        submit(a.token(), payload(aAddress, "[{\"product_id\":1,\"count\":999999}]"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"));
        submit(a.token(), payload(bAddress, "[{\"product_id\":1,\"count\":1}]"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("ADDRESS_NOT_FOUND"));
    }

    @Test
    void historyIsOwnerScopedAndFailedMultiProductOrderLeavesDatabaseUnchanged() throws Exception {
        Account a = account();
        Account b = account();
        long aAddress = address(a.token());
        long bAddress = address(b.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        long before = jdbc.queryForObject("select count(*) from customer_order", Long.class);
        submit(a.token(), payload(aAddress, "[{\"product_id\":1,\"count\":1},{\"product_id\":2,\"count\":999999}]"))
                .andExpect(status().isConflict());
        assertThat(number("select stock from product where id=1")).isEqualTo(stock);
        assertThat(number("select sell_count from product where id=1")).isEqualTo(sold);
        assertThat(jdbc.queryForObject("select count(*) from customer_order", Long.class)).isEqualTo(before);
        assertThat(jdbc.queryForObject("select count(*) from order_item", Long.class))
                .isEqualTo(jdbc.queryForObject("select count(*) from order_item where order_id in (select id from customer_order)", Long.class));
        try {
            submit(b.token(), payload(bAddress, "[{\"product_id\":1,\"count\":1}]"))
                    .andExpect(status().isCreated());
            mvc.perform(get("/order").header("Authorization", a.token()))
                    .andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
            mvc.perform(get("/order").header("Authorization", b.token()))
                    .andExpect(status().isOk()).andExpect(jsonPath("$[0].products[0].product_id").value(1));
        } finally {
            jdbc.update("update product set stock=?, sell_count=? where id=1", stock, sold);
        }
    }

    @Test
    void runtimeFailureAfterFlushRollsBackOrderItemsAndAllInventory() throws Exception {
        Account a = account();
        long address = address(a.token());
        int firstStock = number("select stock from product where id=1");
        int firstSold = number("select sell_count from product where id=1");
        int secondStock = number("select stock from product where id=2");
        int secondSold = number("select sell_count from product where id=2");
        long ordersBefore = count("select count(*) from customer_order");
        long itemsBefore = count("select count(*) from order_item");
        var flushed = new java.util.concurrent.atomic.AtomicBoolean();
        doAnswer(invocation -> {
            entityManager.persist((Order) invocation.getArgument(0));
            entityManager.flush();
            flushed.set(true);
            throw new IllegalStateException("Injected failure after order flush");
        }).when(orderRepository).saveAndFlush(any(Order.class));

        assertThatThrownBy(() -> service.create(a.id(), new OrderRequest(address,
                Instant.parse("2026-09-26T16:30:00Z"), null,
                List.of(new OrderRequest.Line(1L, 1, "first"),
                        new OrderRequest.Line(2L, 1, "second")))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Injected failure after order flush");
        assertThat(flushed).isTrue();
        // JdbcTemplate reads through a fresh connection after the service transaction has ended.
        assertThat(count("select count(*) from customer_order")).isEqualTo(ordersBefore);
        assertThat(count("select count(*) from order_item")).isEqualTo(itemsBefore);
        assertThat(number("select stock from product where id=1")).isEqualTo(firstStock);
        assertThat(number("select sell_count from product where id=1")).isEqualTo(firstSold);
        assertThat(number("select stock from product where id=2")).isEqualTo(secondStock);
        assertThat(number("select sell_count from product where id=2")).isEqualTo(secondSold);
    }

    @Test
    void duplicateProductIdsUseCombinedQuantityForStockAndSales() throws Exception {
        Account a = account();
        long address = address(a.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        jdbc.update("update product set stock=2 where id=1");
        try {
            submit(a.token(), payload(address,
                    "[{\"product_id\":1,\"count\":2},{\"product_id\":1,\"count\":1}]"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"));
            assertThat(number("select stock from product where id=1")).isEqualTo(2);
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold);
            submit(a.token(), payload(address,
                    "[{\"product_id\":1,\"count\":1},{\"product_id\":1,\"count\":1}]"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.products.length()").value(2));
            assertThat(number("select stock from product where id=1")).isZero();
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 2);
        } finally {
            jdbc.update("update product set stock=?, sell_count=? where id=1", stock, sold);
        }
    }

    @Test
    void concurrentOrdersCannotConsumeTheSameLastUnit() throws Exception {
        Account a = account();
        long address = address(a.token());
        int stock = number("select stock from product where id=1");
        int sold = number("select sell_count from product where id=1");
        long ordersBefore = count("select count(*) from customer_order");
        long itemsBefore = count("select count(*) from order_item");
        jdbc.update("update product set stock=1 where id=1");
        var pool = Executors.newFixedThreadPool(2);
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var request = new OrderRequest(address, null, null,
                List.of(new OrderRequest.Line(1L, 1, "")));
        try {
            java.util.concurrent.Callable<String> task = () -> {
                ready.countDown();
                start.await();
                try {
                    service.create(a.id(), request);
                    return "created";
                } catch (com.eciner.ecommerce.common.error.ConflictException exception) {
                    return exception.getCode();
                }
            };
            Future<String> first = pool.submit(task);
            Future<String> second = pool.submit(task);
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder("created", "INSUFFICIENT_STOCK");
            assertThat(number("select stock from product where id=1")).isZero();
            assertThat(number("select sell_count from product where id=1")).isEqualTo(sold + 1);
            assertThat(count("select count(*) from customer_order")).isEqualTo(ordersBefore + 1);
            assertThat(count("select count(*) from order_item")).isEqualTo(itemsBefore + 1);
            assertThat(count("select count(*) from order_item where product_id=1 and order_id in (select id from customer_order where user_id=" + a.id() + ")")).isEqualTo(1);
        } finally {
            pool.shutdownNow();
            jdbc.update("update product set stock=?, sell_count=? where id=1", stock, sold);
        }
    }

    private org.springframework.test.web.servlet.ResultActions submit(String token, String body) throws Exception {
        return mvc.perform(post("/order").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private String payload(long address, String products) {
        return "{\"address_id\":" + address + ",\"order_date\":\"2026-09-26T16:30:00Z\","
                + "\"card_no\":\"4111111111111111\",\"card_name\":\"Test\","
                + "\"card_expire_month\":12,\"card_expire_year\":2030,\"card_ccv\":321,"
                + "\"price\":0.01,\"products\":" + products + "}";
    }

    private int number(String sql) { return jdbc.queryForObject(sql, Integer.class); }
    private long count(String sql) { return jdbc.queryForObject(sql, Long.class); }
    private JsonNode json(String value) throws Exception { return mapper.readTree(value); }

    private Account account() throws Exception {
        String email = "order-" + UUID.randomUUID() + "@example.com";
        long role = roles.findByCode("customer").orElseThrow().getId();
        mvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Order Test\",\"email\":\"" + email
                        + "\",\"password\":\"StrongPass1!\",\"role_id\":" + role + "}"))
                .andExpect(status().isCreated());
        String result = mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"StrongPass1!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return new Account(json(result).path("token").asText(), users.findByEmailIgnoreCase(email).orElseThrow().getId());
    }

    private long address(String token) throws Exception {
        String result = mvc.perform(post("/user/address").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Home\",\"name\":\"Test\",\"surname\":\"Person\","
                        + "\"phone\":\"05551112233\",\"city\":\"Istanbul\",\"district\":\"Central\","
                        + "\"neighborhood\":\"Street\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json(result).path("id").asLong();
    }

    private record Account(String token, long id) {}
}
