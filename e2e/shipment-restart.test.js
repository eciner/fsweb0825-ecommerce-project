import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomBytes, randomUUID } from "node:crypto";
import net from "node:net";
import { createDisposablePostgres } from "./disposable-postgres.js";
import { javaLaunch } from "./local-stack.js";

test("shipment ownership, status, audit and inventory survive an actual API restart", { timeout: 120000 }, async () => {
  await new Promise((resolve, reject) => {
    const probe = net.createServer(); probe.once("error", () => reject(new Error("Restart test port 8084 is occupied; no process was stopped.")));
    probe.listen(8084, "127.0.0.1", () => probe.close(resolve));
  });
  const database = await createDisposablePostgres();
  const launch = javaLaunch(database);
  const passwords = Object.fromEntries(["customer", "store", "admin"].map(role => [role, `Local-${randomBytes(20).toString("hex")}Aa1!`]));
  for (const [role, password] of Object.entries(passwords)) launch.env[`DEMO_${role.toUpperCase()}_PASSWORD`] = password;
  let api;
  const stop = async () => {
    if (!api || api.exitCode !== null || api.signalCode !== null) return;
    const closed = once(api, "exit"); api.kill();
    let timer;
    try { await Promise.race([closed, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Owned API did not stop; database cleanup withheld.")), 10000); })]); }
    finally { clearTimeout(timer); }
  };
  const start = async provision => {
    api = spawn(launch.executable, ["-jar", "server/target/ecommerce-api-0.0.1-SNAPSHOT.jar", ...launch.args.map(arg =>
      arg === "--server.port=8083" ? "--server.port=8084" : arg === "--app.demo.provision=false" ? `--app.demo.provision=${provision}` : arg)],
    { env: launch.env, stdio: "ignore", windowsHide: true });
    for (let attempt = 0; attempt < 120; attempt++) {
      if (api.exitCode !== null) throw new Error("Owned restart-test API exited before readiness.");
      try { if ((await fetch("http://127.0.0.1:8084/health")).ok && database.query("select count(*) from app_user") === "3") return; } catch { /* Await fixture readiness. */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error("Owned restart-test API did not become ready.");
  };
  const call = async (path, method = "GET", data, token, status = 200) => {
    const response = await fetch(`http://127.0.0.1:8084${path}`, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
    assert.equal(response.status, status, `Expected local ${method} ${path} outcome`);
    return response.json();
  };
  const login = role => call("/login", "POST", { email: `${role}.demo@example.test`, password: passwords[role] });
  try {
    await start(true);
    const customer = await login("customer"), store = await login("store"), admin = await login("admin");
    await call("/fulfillment/products/1/store", "PUT", { store_id: store.store_id }, admin.token);
    const address = await call("/user/address", "POST", { title: "Synthetic shipping", name: "Synthetic", surname: "Buyer", phone: "+905551112233", city: "Ankara", district: "Manual", neighborhood: "Synthetic street" }, customer.token, 201);
    const order = await call("/order", "POST", { address_id: address.id, price: 0, request_id: randomUUID(), products: [{ product_id: 1, count: 1 }] }, customer.token, 201);
    const owned = await call(`/order/${order.id}/shipments`, "GET", null, customer.token);
    const id = owned.shipments[0].id;
    await call(`/fulfillment/shipments/${id}`, "PUT", { request_id: crypto.randomUUID(), version: 0, status: "PREPARING" }, store.token);
    const shipped = await call(`/fulfillment/shipments/${id}`, "PUT", { request_id: crypto.randomUUID(), version: 1, status: "SHIPPED", carrier: "Synthetic carrier", tracking_number: "DEMO-RESTART-1" }, store.token);
    const customerBefore = await call(`/order/${order.id}/shipments`, "GET", null, customer.token);
    for (const event of customerBefore.shipments[0].history) assert.equal(Object.hasOwn(event, "actor_id"), false);
    const inventory = database.query("select stock,sell_count from product where id=1");
    await stop(); await start(false);
    const signedIn = await login("customer");
    const restored = await call(`/order/${order.id}/shipments`, "GET", null, signedIn.token);
    assert.equal(restored.status, "SHIPPED");
    assert.deepEqual(restored, customerBefore);
    const signedInStore = await login("store");
    const management = await call("/fulfillment/shipments", "GET", null, signedInStore.token);
    assert.deepEqual(management.shipments.find(row => row.id === id), shipped);
    assert.equal(restored.shipments[0].history.length, 3);
    assert.equal(database.query("select stock,sell_count from product where id=1"), inventory);
  } finally { await stop(); database.cleanup(); }
});
