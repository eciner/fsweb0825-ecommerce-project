package com.eciner.ecommerce.probe;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * With hibernate.ddl-auto=validate, a successful context load already proves Flyway created the
 * schema; the save/find round trip additionally proves persistence works end to end.
 */
@SpringBootTest
@ActiveProfiles("test")
class SystemProbeRepositoryTests {

    @Autowired
    private SystemProbeRepository repository;

    @Test
    void savesAndReadsProbe() {
        SystemProbe saved = repository.save(new SystemProbe("startup-check", Instant.now()));

        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findById(saved.getId()))
                .isPresent()
                .get()
                .satisfies(probe -> assertThat(probe.getNote()).isEqualTo("startup-check"));
    }

}
