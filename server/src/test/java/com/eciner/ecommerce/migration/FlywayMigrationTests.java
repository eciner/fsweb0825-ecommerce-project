package com.eciner.ecommerce.migration;

import static org.assertj.core.api.Assertions.assertThat;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FlywayMigrationTests {

    @Autowired
    private Flyway flyway;

    @Test
    void appliesAllMigrationsSuccessfully() {
        MigrationInfo[] applied = flyway.info().applied();

        assertThat(applied).isNotEmpty();
        assertThat(flyway.info().pending()).isEmpty();
        assertThat(flyway.info().applied()).filteredOn(info -> info.getVersion() != null)
            .extracting(MigrationInfo::getVersion)
            .containsExactly(
                MigrationVersion.fromVersion("1"),
                MigrationVersion.fromVersion("2"),
                MigrationVersion.fromVersion("3"),
                        MigrationVersion.fromVersion("4"),
                        MigrationVersion.fromVersion("5"));
        assertThat(flyway.info().applied()).extracting(MigrationInfo::getScript)
            .contains("R__create_system_probe_table.sql");
    }

}
