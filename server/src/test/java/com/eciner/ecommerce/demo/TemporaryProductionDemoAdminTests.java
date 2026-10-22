package com.eciner.ecommerce.demo;

import static org.assertj.core.api.Assertions.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class TemporaryProductionDemoAdminTests {
    @Container static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("fsweb0825_ecommerce_db_v2").withUsername("fsweb0825_ecommerce_db_v2_user")
            .withPassword(UUID.randomUUID().toString());
    static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();
    static final String PASSWORD = "Test!" + UUID.randomUUID() + "aA1";
    static JdbcTemplate jdbc;
    static DataSourceTransactionManager transactions;

    @BeforeAll static void database() {
        var ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(ds);
        transactions = new DataSourceTransactionManager(ds);
        Flyway.configure().dataSource(ds).locations("classpath:db/migration").load().migrate();
    }

    @BeforeEach void preserveOriginalFixtures() {
        jdbc.execute("truncate table app_user, store restart identity cascade");
        jdbc.update("insert into store(name,phone,tax_no,bank_account) values('Original Store','05000000001','ORIGINAL','ORIGINAL')");
        jdbc.update("insert into app_user(name,email,password_hash,role_id,store_id) select 'Original Customer','original@example.test',?,id,null from role where code='customer'",
                ENCODER.encode(PASSWORD));
    }

    MockEnvironment environment() {
        var env = new MockEnvironment().withProperty("RENDER_SERVICE_ID", "srv-dasf14jncjis7398l5e0")
                .withProperty("APP_DEMO_ADMIN_ONCE_PASSWORD", PASSWORD)
                .withProperty("APP_DEMO_ADMIN_ONCE_DEADLINE", Instant.now().plusSeconds(3600).toString());
        env.setActiveProfiles("prod");
        return env;
    }

    TemporaryProductionDemoAdmin runner(MockEnvironment env) {
        return new TemporaryProductionDemoAdmin(jdbc, transactions, ENCODER, env);
    }

    String protectedSnapshot() {
        return jdbc.queryForObject("select coalesce(jsonb_agg(to_jsonb(u) order by id)::text,'[]') from app_user u where email <> 'admin@admin.com'", String.class)
                + jdbc.queryForObject("select jsonb_agg(to_jsonb(s) order by id)::text from store s", String.class)
                + jdbc.queryForObject("select jsonb_agg(to_jsonb(p) order by id)::text from product p", String.class)
                + jdbc.queryForObject("select jsonb_agg(to_jsonb(f) order by installed_rank)::text from flyway_schema_history f", String.class);
    }

    long adminCount() {
        return jdbc.queryForObject("select count(*) from app_user where email='admin@admin.com'", Long.class);
    }

    void existing(String role, Long storeId, String password) {
        jdbc.update("insert into app_user(name,email,password_hash,role_id,store_id) select 'Existing','admin@admin.com',?,id,? from role where code=?",
                ENCODER.encode(password), storeId, role);
    }

    @Test void createsOnlyOneAdminWithBcryptAndNullStoreAndPreservesData() {
        String before = protectedSnapshot();
        runner(environment()).run();
        assertThat(adminCount()).isEqualTo(1);
        assertThat(jdbc.queryForObject("select r.code from app_user u join role r on r.id=u.role_id where u.email='admin@admin.com'", String.class)).isEqualTo("admin");
        assertThat(jdbc.queryForObject("select store_id from app_user where email='admin@admin.com'", Long.class)).isNull();
        assertThat(ENCODER.matches(PASSWORD, jdbc.queryForObject("select password_hash from app_user where email='admin@admin.com'", String.class))).isTrue();
        assertThat(protectedSnapshot()).isEqualTo(before);
    }

    @Test void rerunReusesMatchingAdminWithoutChangingPasswordHash() {
        runner(environment()).run();
        String hash = jdbc.queryForObject("select password_hash from app_user where email='admin@admin.com'", String.class);
        runner(environment()).run();
        assertThat(adminCount()).isEqualTo(1);
        assertThat(jdbc.queryForObject("select password_hash from app_user where email='admin@admin.com'", String.class)).isEqualTo(hash);
    }

    @Test void refusesConflictingRoleWithoutPromotion() {
        existing("customer", null, PASSWORD);
        assertThatThrownBy(() -> runner(environment()).run()).isInstanceOf(IllegalStateException.class).hasNoCause();
        assertThat(jdbc.queryForObject("select r.code from app_user u join role r on r.id=u.role_id where u.email='admin@admin.com'", String.class)).isEqualTo("customer");
    }

    @Test void refusesConflictingCredentialWithoutReset() {
        existing("admin", null, "Different!" + UUID.randomUUID());
        String hash = jdbc.queryForObject("select password_hash from app_user where email='admin@admin.com'", String.class);
        assertThatThrownBy(() -> runner(environment()).run()).isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select password_hash from app_user where email='admin@admin.com'", String.class)).isEqualTo(hash);
    }

    @Test void refusesExistingStoreAssociation() {
        existing("admin", 1L, PASSWORD);
        assertThatThrownBy(() -> runner(environment()).run()).isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select store_id from app_user where email='admin@admin.com'", Long.class)).isEqualTo(1L);
    }

    @Test void refusesWrongServiceAndExpiredActivationAndMissingPassword() {
        for (MockEnvironment env : List.of(
                environment().withProperty("RENDER_SERVICE_ID", "another-service"),
                environment().withProperty("APP_DEMO_ADMIN_ONCE_DEADLINE", Instant.now().minusSeconds(1).toString()),
                environment().withProperty("APP_DEMO_ADMIN_ONCE_DEADLINE", Instant.now().plusSeconds(10800).toString()),
                environment().withProperty("APP_DEMO_ADMIN_ONCE_PASSWORD", ""))) {
            assertThatThrownBy(() -> runner(env).run()).isInstanceOf(IllegalStateException.class).hasNoCause();
            assertThat(adminCount()).isZero();
        }
    }

    @Test void refusesNonProductionProfile() {
        var env = environment(); env.setActiveProfiles("local-demo");
        assertThatThrownBy(() -> runner(env).run()).isInstanceOf(IllegalStateException.class);
        assertThat(adminCount()).isZero();
    }

    @Test void refusesDifferentDatabaseIdentity() {
        jdbc.execute("create schema if not exists unrelated");
        var other = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        // A JDBC session with a different current_user must fail before an INSERT.
        jdbc.execute("create role wrong_demo_operator");
        try {
            other.setConnectionProperties(new java.util.Properties() {{ setProperty("options", "-c role=wrong_demo_operator"); }});
            var tx = new DataSourceTransactionManager(other);
            assertThatThrownBy(() -> new TemporaryProductionDemoAdmin(new JdbcTemplate(other), tx, ENCODER, environment()).run())
                    .isInstanceOf(IllegalStateException.class).hasNoCause();
            assertThat(adminCount()).isZero();
        } finally { jdbc.execute("drop role wrong_demo_operator"); }
    }

    @Test void concurrentExecutionsCreateExactlyOneIdentity() throws Exception {
        String before = protectedSnapshot();
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> runner(environment()).run());
            var second = executor.submit(() -> runner(environment()).run());
            first.get(); second.get();
        }
        assertThat(adminCount()).isEqualTo(1);
        assertThat(protectedSnapshot()).isEqualTo(before);
    }

    @Test void insertionFailureRollsBackAndDoesNotExposeDatabaseDetails() {
        jdbc.execute("alter table app_user add constraint reject_demo_admin check (email <> 'admin@admin.com')");
        String before = protectedSnapshot();
        try {
            assertThatThrownBy(() -> runner(environment()).run()).isInstanceOf(IllegalStateException.class)
                    .hasNoCause().hasMessage("Dedicated demo Admin provisioning refused; no existing account was changed.");
            assertThat(adminCount()).isZero();
            assertThat(protectedSnapshot()).isEqualTo(before);
        } finally { jdbc.execute("alter table app_user drop constraint reject_demo_admin"); }
    }

    @Test void disabledOrAbsentActivationNeverRegistersStartupRunner() {
        for (String activation : List.of("false", "")) {
            new ApplicationContextRunner().withUserConfiguration(TemporaryProductionDemoAdmin.class)
                    .withPropertyValues("spring.profiles.active=prod", "app.production-demo-admin-once=" + activation)
                    .run(context -> assertThat(context).doesNotHaveBean(TemporaryProductionDemoAdmin.class));
        }
        new ApplicationContextRunner().withUserConfiguration(TemporaryProductionDemoAdmin.class)
                .withPropertyValues("spring.profiles.active=local-demo", "app.production-demo-admin-once=true")
                .run(context -> assertThat(context).doesNotHaveBean(TemporaryProductionDemoAdmin.class));
    }
}
