package com.eciner.ecommerce.demo;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import com.eciner.ecommerce.auth.AuthService;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.UserRepository;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

class DemoAccountProvisionerTests {
    private final AuthService auth = mock(AuthService.class);
    private final UserRepository users = mock(UserRepository.class);
    private DemoAccountProvisioner provisioner(String url, String... profiles) {
        var properties = new DataSourceProperties(); properties.setUrl(url);
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(profiles);
        return new DemoAccountProvisioner(properties, environment, auth, users,
                mock(RoleRepository.class), mock(PasswordEncoder.class), mock(Validator.class));
    }
    @Test void refusesRemoteOrNonDemoDatabasesBeforeWriting() {
        for (String url : java.util.List.of("jdbc:postgresql://remote.example:5432/enhancement_demo", "jdbc:postgresql://127.0.0.1:5432/ecommerce")) {
            assertThatThrownBy(() -> provisioner(url, "local-demo").run()).isInstanceOf(IllegalStateException.class);
        }
        verifyNoInteractions(users, auth);
    }
    @Test void refusesProductionProfileEvenWithLoopbackDatabase() {
        assertThatThrownBy(() -> provisioner("jdbc:postgresql://127.0.0.1:5432/enhancement_demo", "local-demo", "prod").run()).isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(users, auth);
    }
    @Test void refusesToOverwriteExistingIdentities() {
        when(users.existsByEmailIgnoreCase("customer.demo@example.test")).thenReturn(true);
        assertThatThrownBy(() -> provisioner("jdbc:postgresql://127.0.0.1:5432/enhancement_demo", "local-demo").run()).isInstanceOf(IllegalStateException.class).hasMessageContaining("already exists");
        verifyNoInteractions(auth);
        verify(users, never()).save(any());
    }
}
