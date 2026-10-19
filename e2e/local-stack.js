import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";
import net from "node:net";
import {
  assertOwnedDatabase,
  createDisposablePostgres,
} from "./disposable-postgres.js";

// Only a freshly issued, verified local container can supply a connection.
export function javaLaunch(database, parent = process.env) {
  assertOwnedDatabase(database);
  const javaHome = parent.JAVA_HOME || "C:/Program Files/Java/jdk-21.0.12";
  const executable = path.join(javaHome, "bin/java.exe");
  // Java needs Windows/temp locations, not inherited application, JVM or DB options.
  const env = Object.fromEntries(
    ["SystemRoot", "WINDIR", "TEMP", "TMP"]
      .filter((key) => parent[key] !== undefined)
      .map((key) => [key, parent[key]]),
  );
  Object.assign(env, {
    JAVA_HOME: javaHome,
    DEMO_DB_PORT: String(database.port),
    DEMO_DB_PASSWORD: database.password,
    JWT_SECRET: randomBytes(48).toString("hex"),
    DEMO_API_PORT: "8083",
    CORS_ALLOWED_ORIGINS: "http://127.0.0.1:5176",
  });
  const version = spawnSync(executable, ["-version"], {
    env,
    encoding: "utf8",
    windowsHide: true,
  });
  if (
    version.status !== 0 ||
    !/version "21\./.test(version.stdout + version.stderr)
  )
    throw new Error(
      "E2E requires Java 21; inherited JVM options are not accepted.",
    );
  return {
    executable,
    env,
    args: [
      "--spring.config.location=classpath:/application.yml,classpath:/application-local-demo.yml",
      "--spring.config.additional-location=",
      "--spring.config.import=",
      "--spring.profiles.active=local-demo",
      "--spring.profiles.include=",
      "--app.demo.provision=false",
      `--spring.datasource.url=${database.jdbcUrl}`,
      `--spring.datasource.username=${database.username}`,
      "--spring.datasource.password=${DEMO_DB_PASSWORD}",
      `--spring.flyway.url=${database.jdbcUrl}`,
      `--spring.flyway.user=${database.username}`,
      "--spring.flyway.password=${DEMO_DB_PASSWORD}",
      "--spring.flyway.enabled=true",
      "--spring.flyway.locations=classpath:db/migration",
      "--spring.jpa.hibernate.ddl-auto=validate",
      "--server.address=127.0.0.1",
      "--server.port=8083",
    ],
  };
}

export default async function localStack({ database: supplied } = {}) {
  // Reject fabricated/external connections before starting a process or migration.
  if (supplied) assertOwnedDatabase(supplied);
  const jar = path.resolve("server/target/ecommerce-api-0.0.1-SNAPSHOT.jar");
  if (!existsSync(jar))
    throw new Error("Run Java 21 backend clean verify before E2E.");
  const pending = [path.resolve("server/src/main")];
  while (pending.length)
    for (const entry of readdirSync(pending.pop(), { withFileTypes: true })) {
      const file = path.join(entry.parentPath, entry.name);
      if (entry.isDirectory()) pending.push(file);
      else if (statSync(file).mtimeMs > statSync(jar).mtimeMs)
        throw new Error("Backend JAR is older than source; run clean verify.");
    }
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", () =>
      reject(new Error("Local E2E API port 8083 is in use.")),
    );
    probe.listen(8083, "127.0.0.1", () => probe.close(resolve));
  });
  const database = supplied || (await createDisposablePostgres());
  let api;
  const cleanup = async () => {
    if (api && api.exitCode === null && api.signalCode === null) {
      let closed = false;
      const exited = new Promise((resolve) =>
        api.once("exit", () => {
          closed = true;
          resolve();
        }),
      );
      api.kill();
      await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
      if (!closed)
        throw new Error("Owned API did not exit; database cleanup withheld.");
    }
    database.cleanup();
  };
  try {
    const launch = javaLaunch(database);
    api = spawn(launch.executable, ["-jar", jar, ...launch.args], {
      env: launch.env,
      stdio: ["ignore", "ignore", "ignore"],
      windowsHide: true,
    });
    let launchFailed = false;
    api.once("error", () => {
      launchFailed = true;
    });
    let ready = false;
    for (let i = 0; i < 120; i++) {
      if (launchFailed || api.exitCode !== null)
        throw new Error(
          "Isolated API exited before readiness; connection details are suppressed.",
        );
      try {
        if ((await fetch("http://127.0.0.1:8083/health")).ok) {
          ready = true;
          break;
        }
      } catch {
        /* Await owned API startup only. */
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!ready) throw new Error("Isolated API did not become healthy.");
    assertOwnedDatabase(database);
    if (
      database.query(
        "select max(version::int) from flyway_schema_history where success and version is not null",
      ) !== "13"
    )
      throw new Error(
        "Migrations were not observed in the fixture-owned database.",
      );
    process.env.E2E_OWNED_CONTAINER = database.id;
    process.env.E2E_DOCKER = database.docker.executable;
    process.env.E2E_DOCKER_HOST = database.docker.host;
    console.log(
      "Disposable loopback PostgreSQL/API ready; credentials remain in process memory.",
    );
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
}
