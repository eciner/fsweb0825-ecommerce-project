import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import localStack from "./local-stack.js";
import { createDisposablePostgres } from "./disposable-postgres.js";

for (const mode of ["datasource", "flyway-json", "config-jvm"])
  test(
    `inherited ${mode} cannot migrate or write the separate disposable canary`,
    { timeout: 120000 },
    async () => {
      const canary = await createDisposablePostgres();
      const changed =
        /^(SPRING_|FLYWAY_|DATABASE_URL$|JAVA_TOOL_OPTIONS$|JDK_JAVA_OPTIONS$|_JAVA_OPTIONS$)/;
      const previous = Object.fromEntries(
        Object.entries(process.env).filter(([key]) => changed.test(key)),
      );
      let cleanup;
      let configFile;
      const messages = [];
      const originalLog = console.log;
      console.log = (...parts) => messages.push(parts.join(" "));
      try {
        // Before launching even the old fixture, remove all unknown overrides. The only
        // conflicting connection below is this test's freshly created loopback canary.
        for (const key of Object.keys(process.env).filter((key) =>
          changed.test(key),
        ))
          delete process.env[key];
        canary.query(
          "create schema containment_guard; create table containment_guard.marker (value text primary key); insert into containment_guard.marker values ('unchanged')",
        );
        const before = canary.query(
          "select tablename from pg_tables where schemaname='public' order by tablename",
        );
        process.env.SPRING_DATASOURCE_URL = canary.jdbcUrl;
        process.env.SPRING_DATASOURCE_USERNAME = canary.username;
        process.env.SPRING_DATASOURCE_PASSWORD = canary.password;
        process.env.SPRING_DATASOURCE_HIKARI_JDBC_URL = canary.jdbcUrl;
        process.env.DATABASE_URL = canary.jdbcUrl;
        if (mode !== "datasource") {
          Object.assign(process.env, {
            SPRING_FLYWAY_URL: canary.jdbcUrl,
            SPRING_FLYWAY_USER: canary.username,
            SPRING_FLYWAY_PASSWORD: canary.password,
            FLYWAY_URL: canary.jdbcUrl,
            FLYWAY_USER: canary.username,
            FLYWAY_PASSWORD: canary.password,
            SPRING_PROFILES_ACTIVE: "prod",
            SPRING_FLYWAY_ENABLED: "false",
            SPRING_APPLICATION_JSON: JSON.stringify({
              spring: {
                datasource: {
                  url: canary.jdbcUrl,
                  username: canary.username,
                  password: canary.password,
                },
                flyway: {
                  url: canary.jdbcUrl,
                  user: canary.username,
                  password: canary.password,
                },
              },
            }),
          });
        }
        if (mode === "config-jvm") {
          configFile = path.join(
            tmpdir(),
            `fsweb0825-isolation-${randomBytes(12).toString("hex")}.properties`,
          );
          writeFileSync(
            configFile,
            `spring.datasource.url=${canary.jdbcUrl}\nspring.datasource.hikari.jdbc-url=${canary.jdbcUrl}\nspring.flyway.url=${canary.jdbcUrl}\nspring.profiles.active=prod\n`,
            { flag: "wx" },
          );
          const location = pathToFileURL(configFile).href;
          Object.assign(process.env, {
            SPRING_CONFIG_LOCATION: location,
            SPRING_CONFIG_ADDITIONAL_LOCATION: location,
            SPRING_CONFIG_IMPORT: location,
            JAVA_TOOL_OPTIONS: `-Dspring.config.location=${location}`,
            JDK_JAVA_OPTIONS: `-Dspring.datasource.url=${canary.jdbcUrl}`,
            _JAVA_OPTIONS: `-Dspring.flyway.url=${canary.jdbcUrl}`,
          });
        }
        cleanup = await localStack();
        const docker = canary.docker;
        const sqlA = (query) =>
          docker.run([
            "exec",
            process.env.E2E_OWNED_CONTAINER,
            "psql",
            "-U",
            "enhancement_demo",
            "-d",
            "enhancement_demo",
            "-tAc",
            query,
          ]);
        assert.equal(
          sqlA(
            "select exists(select 1 from information_schema.tables where table_schema='public' and table_name='customer_order')",
          ),
          "t",
        );
        assert.equal(
          sqlA(
            "select max(version::int) from flyway_schema_history where version is not null",
          ),
          "13",
        );
        const roles = await (await fetch("http://127.0.0.1:8083/roles")).json();
        const email = `containment-${randomBytes(8).toString("hex")}@example.test`;
        const response = await fetch("http://127.0.0.1:8083/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: "Synthetic Containment",
            password: `Local-${randomBytes(16).toString("hex")}Aa1!`,
            role_id: roles.find((role) => role.code === "customer").id,
          }),
        });
        assert.equal(response.status, 201);
        assert.equal(
          sqlA(`select count(*) from app_user where email='${email}'`),
          "1",
        );
        assert.equal(
          canary.query(
            "select tablename from pg_tables where schemaname='public' order by tablename",
          ),
          before,
        );
        assert.equal(
          canary.query("select value from containment_guard.marker"),
          "unchanged",
        );
        assert.equal(
          [canary.password, canary.jdbcUrl, process.env.SPRING_APPLICATION_JSON]
            .filter(Boolean)
            .some((value) => messages.join("\n").includes(value)),
          false,
          "Fixture output must not disclose connection values.",
        );
        const ownedId = process.env.E2E_OWNED_CONTAINER;
        await cleanup();
        cleanup = null;
        assert.throws(
          () => docker.run(["inspect", ownedId]),
          /Disposable Docker operation failed/,
        );
        canary.verify(); // Teardown removed A, while the separately owned B still exists.
      } finally {
        try {
          if (cleanup) await cleanup();
        } finally {
          canary.cleanup();
          if (configFile) unlinkSync(configFile);
          console.log = originalLog;
          for (const key of Object.keys(process.env).filter((key) =>
            changed.test(key),
          ))
            delete process.env[key];
          Object.assign(process.env, previous);
        }
      }
    },
  );

test(
  "refuses an unissued connection before launching Java or migrating",
  { timeout: 30000 },
  async () => {
    const canary = await createDisposablePostgres();
    try {
      const before = canary.query(
        "select tablename from pg_tables where schemaname='public' order by tablename",
      );
      await assert.rejects(
        localStack({ database: { ...canary } }),
        /not created by this fixture/,
      );
      assert.equal(
        canary.query(
          "select tablename from pg_tables where schemaname='public' order by tablename",
        ),
        before,
      );
    } finally {
      canary.cleanup();
    }
  },
);
