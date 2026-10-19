import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

export function windowsEnvironment(parent = process.env) {
  return Object.fromEntries(
    [
      "SystemRoot",
      "WINDIR",
      "TEMP",
      "TMP",
      "USERPROFILE",
      "APPDATA",
      "LOCALAPPDATA",
      "PATH",
      "PATHEXT",
    ]
      .filter((key) => parent[key] !== undefined)
      .map((key) => [key, parent[key]]),
  );
}
export function localDocker() {
  const localAppData = process.env.LOCALAPPDATA;
  const programFiles = process.env.ProgramFiles;
  const candidates = [
    localAppData && path.join(localAppData, "Programs/DockerDesktop/resources/bin/docker.exe"),
    programFiles && path.join(programFiles, "Docker/Docker/resources/bin/docker.exe"),
  ].filter(Boolean);
  const executable =
    process.env.E2E_DOCKER ||
    candidates.find(candidate => existsSync(candidate)) || "docker";
  const env = windowsEnvironment();
  const contexts = JSON.parse(
    execFileSync(executable, ["context", "inspect"], {
      env,
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  const host = contexts[0]?.Endpoints?.docker?.Host;
  if (
    !/^npipe:\/\/\/\/\.\/pipe\/(?:dockerDesktopLinuxEngine|docker_engine)$/.test(
      host || "",
    )
  )
    throw new Error("E2E requires a local Docker Desktop named pipe.");
  return {
    executable,
    host,
    run(args, extraEnv = {}) {
      try {
        return execFileSync(executable, ["--host", host, ...args], {
          env: { ...env, ...extraEnv },
          encoding: "utf8",
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        }).trim();
      } catch {
        throw new Error(
          "Disposable Docker operation failed; connection details are suppressed.",
        );
      }
    },
  };
}
const issued = new WeakSet();
export function assertOwnedDatabase(database) {
  if (!issued.has(database))
    throw new Error(
      "Database was not created by this fixture; refusing Java startup.",
    );
  database.verify();
}
export async function createDisposablePostgres() {
  const docker = localDocker();
  const owner = randomBytes(16).toString("hex");
  const password = randomBytes(24).toString("hex");
  let id,
    released = false;
  const cleanup = () => {
    if (!id || released) return;
    const info = JSON.parse(docker.run(["inspect", id]))[0];
    if (info.Id !== id || info.Config.Labels?.["fsweb0825.e2e.owner"] !== owner)
      throw new Error(
        "Container ownership could not be verified; cleanup refused.",
      );
    docker.run(["rm", "-f", id]);
    released = true;
  };
  try {
    id = docker.run(
      [
        "run",
        "--rm",
        "-d",
        "--name",
        `fsweb0825-critical-e2e-${owner}`,
        "--label",
        `fsweb0825.e2e.owner=${owner}`,
        "-p",
        "127.0.0.1::5432",
        "-e",
        "POSTGRES_DB=enhancement_demo",
        "-e",
        "POSTGRES_USER=enhancement_demo",
        "-e",
        "POSTGRES_PASSWORD",
        "postgres:16-alpine",
      ],
      { POSTGRES_PASSWORD: password },
    );
    if (!/^[0-9a-f]{64}$/.test(id))
      throw new Error("Docker did not return a container identity.");
    const mapping = docker.run(["port", id, "5432/tcp"]);
    if (!/^127\.0\.0\.1:\d+$/.test(mapping))
      throw new Error("Disposable database must bind loopback only.");
    const port = Number(mapping.split(":")[1]);
    const database = Object.freeze({
      id,
      password,
      username: "enhancement_demo",
      name: "enhancement_demo",
      port,
      jdbcUrl: `jdbc:postgresql://${mapping}/enhancement_demo`,
      docker,
      verify() {
        if (released)
          throw new Error("Disposable database has already been removed.");
        const info = JSON.parse(docker.run(["inspect", id]))[0];
        const binding = info.NetworkSettings.Ports?.["5432/tcp"];
        if (
          info.Id !== id ||
          !info.State.Running ||
          info.Config.Labels?.["fsweb0825.e2e.owner"] !== owner ||
          binding?.length !== 1 ||
          binding[0].HostIp !== "127.0.0.1" ||
          Number(binding[0].HostPort) !== port
        )
          throw new Error(
            "Disposable database identity or loopback binding changed; startup refused.",
          );
      },
      query(sql) {
        database.verify();
        return docker.run([
          "exec",
          id,
          "psql",
          "-U",
          "enhancement_demo",
          "-d",
          "enhancement_demo",
          "-tAc",
          sql,
        ]);
      },
      cleanup,
    });
    issued.add(database);
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        // PostgreSQL's initialization server accepts Unix sockets before the final
        // TCP listener/database is ready. Require an actual authenticated TCP query.
        if (
          docker.run([
            "exec",
            id,
            "psql",
            "-h",
            "127.0.0.1",
            "-U",
            "enhancement_demo",
            "-d",
            "enhancement_demo",
            "-tAc",
            "select 1",
          ]) !== "1"
        )
          throw new Error("Disposable database is not ready.");
        assertOwnedDatabase(database);
        return database;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    throw new Error("Disposable PostgreSQL did not become ready.");
  } catch (error) {
    cleanup();
    throw error;
  }
}
