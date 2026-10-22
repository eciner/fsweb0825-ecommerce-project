package com.eciner.ecommerce.demo;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Temporary owner-operated provisioning for one dedicated demonstration identity. */
@Component
@Profile("prod")
@ConditionalOnProperty(name = "app.production-demo-admin-once", havingValue = "true")
public class TemporaryProductionDemoAdmin implements CommandLineRunner {
    private static final Logger LOG = LoggerFactory.getLogger(TemporaryProductionDemoAdmin.class);
    private static final String EMAIL = "admin@admin.com";
    private static final String DATABASE = "fsweb0825_ecommerce_db_v2";
    private static final String DATABASE_USER = DATABASE + "_user";
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;
    private final PasswordEncoder encoder;
    private final Environment environment;

    public TemporaryProductionDemoAdmin(JdbcTemplate jdbc, PlatformTransactionManager transactions,
            PasswordEncoder encoder, Environment environment) {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(transactions);
        this.encoder = encoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        try {
            require(List.of(environment.getActiveProfiles()).contains("prod"));
            require("srv-dasf14jncjis7398l5e0".equals(environment.getProperty("RENDER_SERVICE_ID")));
            Instant deadline = Instant.parse(environment.getRequiredProperty("APP_DEMO_ADMIN_ONCE_DEADLINE"));
            require(Instant.now().isBefore(deadline));
            require(deadline.isBefore(Instant.now().plusSeconds(7200)));
            String password = environment.getRequiredProperty("APP_DEMO_ADMIN_ONCE_PASSWORD");
            require(password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,72}$"));
            Result result = transaction.execute(status -> provision(password));
            // Log only after commit. Never include credentials, SQL, hashes or raw identities.
            LOG.info("DEMO_ADMIN_ONCE status={} userId={} protectedDataPreserved=true",
                    result.status(), result.userId());
            for (String role : List.of("customer", "store")) {
                List<Long> ids = jdbc.queryForList("select id from app_user where lower(email) = ?",
                        Long.class, role + "@" + role + ".com");
                LOG.info("DEMO_ADMIN_ONCE {}Identity={} userIds={}", role,
                        ids.isEmpty() ? "ABSENT" : "PRESENT", ids);
            }
        } catch (RuntimeException refused) {
            // Database errors can contain sensitive row values; deliberately omit the cause.
            throw new IllegalStateException("Dedicated demo Admin provisioning refused; no existing account was changed.");
        }
    }

    private Result provision(String password) {
        require(DATABASE.equals(jdbc.queryForObject("select current_database()", String.class)));
        require(DATABASE_USER.equals(jdbc.queryForObject("select current_user", String.class)));
        require(jdbc.queryForObject("show server_version_num", Integer.class) / 10000 == 16);
        jdbc.execute("set local lock_timeout = '5s'");
        jdbc.execute("set local statement_timeout = '15s'");
        // Serializes competing startup executions and public signups until this transaction commits.
        jdbc.execute("lock table app_user in share row exclusive mode");
        List<Long> adminRoles = jdbc.queryForList("select id from role where code = 'admin'", Long.class);
        require(adminRoles.size() == 1);
        List<Map<String, Object>> existing = jdbc.queryForList(
                "select id, email, role_id, store_id, password_hash from app_user where lower(email) = ?", EMAIL);
        require(existing.size() <= 1);
        if (!existing.isEmpty()) {
            Map<String, Object> user = existing.getFirst();
            require(EMAIL.equals(user.get("email")));
            require(adminRoles.getFirst().equals(((Number) user.get("role_id")).longValue()));
            require(user.get("store_id") == null);
            require(encoder.matches(password, (String) user.get("password_hash")));
            return new Result("REUSED", ((Number) user.get("id")).longValue());
        }
        Map<String, String> before = protectedData();
        Long id = jdbc.queryForObject(
                "insert into app_user(name,email,password_hash,role_id,store_id) values(?,?,?,?,null) returning id",
                Long.class, "FSWEB0825 Demo Administrator", EMAIL, encoder.encode(password), adminRoles.getFirst());
        require(id != null);
        require(before.equals(protectedData()));
        require(jdbc.queryForObject("select count(*) from app_user where id = ? and email = ? and role_id = ? and store_id is null",
                Long.class, id, EMAIL, adminRoles.getFirst()) == 1L);
        return new Result("CREATED", id);
    }

    private Map<String, String> protectedData() {
        Map<String, String> fingerprints = new LinkedHashMap<>();
        for (String table : jdbc.queryForList(
                "select tablename from pg_tables where schemaname = 'public' order by tablename", String.class)) {
            require(table.matches("[a-z_][a-z0-9_]*"));
            String filter = "app_user".equals(table) ? " where lower(email) <> 'admin@admin.com'" : "";
            fingerprints.put(table, jdbc.queryForObject(
                    "select md5(coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text)::text, '[]')) from public.\""
                            + table + "\" t" + filter, String.class));
        }
        return fingerprints;
    }

    private static void require(boolean condition) {
        if (!condition) throw new IllegalStateException("Unexpected provisioning state.");
    }

    private record Result(String status, Long userId) { }
}
