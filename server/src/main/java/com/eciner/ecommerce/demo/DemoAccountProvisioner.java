package com.eciner.ecommerce.demo;

import com.eciner.ecommerce.auth.AuthService;
import com.eciner.ecommerce.auth.AuthSignupRequest;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import jakarta.validation.Validator;
import java.math.BigInteger;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local-demo")
@ConditionalOnProperty(name = "app.demo.provision", havingValue = "true")
public class DemoAccountProvisioner implements CommandLineRunner {
    private final DataSourceProperties dataSource;
    private final Environment environment;
    private final AuthService auth;
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final Validator validator;
    public DemoAccountProvisioner(DataSourceProperties dataSource, Environment environment,
            AuthService auth, UserRepository users, RoleRepository roles, PasswordEncoder encoder, Validator validator) {
        this.dataSource = dataSource; this.environment = environment; this.auth = auth;
        this.users = users; this.roles = roles; this.encoder = encoder; this.validator = validator;
    }
    @Override
    @Transactional
    public void run(String... args) {
        String url = dataSource.getUrl();
        if (List.of(environment.getActiveProfiles()).contains("prod") || url == null
                || !url.matches("jdbc:postgresql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/enhancement_demo")) {
            throw new IllegalStateException("Demo provisioning requires an isolated loopback enhancement_demo database and no prod profile.");
        }
        for (String role : List.of("customer", "store", "admin")) {
            if (users.existsByEmailIgnoreCase(role + ".demo@example.test")) {
                throw new IllegalStateException("Demo identity already exists; existing users were not changed.");
            }
        }
        String customerPassword = password("DEMO_CUSTOMER_PASSWORD");
        String storePassword = password("DEMO_STORE_PASSWORD");
        String adminPassword = password("DEMO_ADMIN_PASSWORD");
        String bban = "0000000000000000000001";
        String iban = "TR" + String.format("%02d", 98 - new BigInteger(bban + "292700").mod(BigInteger.valueOf(97)).intValue()) + bban;
        var customer = new AuthSignupRequest("Demo Customer", "customer.demo@example.test", customerPassword,
                roles.findByCode("customer").orElseThrow().getId(), null);
        var store = new AuthSignupRequest("Demo Store User", "store.demo@example.test", storePassword,
                roles.findByCode("store").orElseThrow().getId(),
                new AuthSignupRequest.StoreSignupRequest("Synthetic Demo Store", "05550000000", "T0000V000001", iban));
        if (!validator.validate(customer).isEmpty() || !validator.validate(store).isEmpty()) {
            throw new IllegalStateException("Demo signup payload failed validation; no identities created.");
        }
        auth.signup(customer);
        auth.signup(store);
        users.save(new User("Demo Administrator", "admin.demo@example.test", encoder.encode(adminPassword),
                roles.findByCode("admin").orElseThrow(), null));
    }
    private String password(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.length() < 16 || !value.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{16,}$")) {
            throw new IllegalStateException("Required strong demo password environment value is missing or invalid.");
        }
        return value;
    }
}
