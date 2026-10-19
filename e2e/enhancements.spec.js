import { test, expect } from "@playwright/test";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
const API = "http://127.0.0.1:8083";
test.use({ hasTouch: true });
const address = { title: "Synthetic shipping", name: "Synthetic", surname: "Buyer", phone: "+905551112233", city: "Ankara", district: "Manual district", neighborhood: "Synthetic street building 2 apartment 3 ZIP 00000" };
function sql(query) {
  if (!/^[0-9a-f]{64}$/.test(process.env.E2E_OWNED_CONTAINER || "") || !process.env.E2E_DOCKER_HOST?.startsWith("npipe:")) throw new Error("Owned local fixture identity is missing.");
  return execFileSync(process.env.E2E_DOCKER, ["--host", process.env.E2E_DOCKER_HOST, "exec", process.env.E2E_OWNED_CONTAINER, "psql", "-U", "enhancement_demo", "-d", "enhancement_demo", "-tAc", query], { encoding: "utf8", windowsHide: true }).trim();
}
async function account(request, role = "customer") {
  const suffix = randomBytes(8).toString("hex"), email = `next-${suffix}@example.test`, password = `Local-${randomBytes(18).toString("hex")}Aa1!`;
  const roles = await (await request.get(`${API}/roles`)).json();
  const body = { name: `Synthetic ${role} ${suffix}`, email, password, role_id: roles.find(item => item.code === (role === "admin" ? "customer" : role)).id };
  if (role === "store") {
    const bban = (BigInt(`0x${randomBytes(12).toString("hex")}`) % (10n ** 22n)).toString().padStart(22, "0");
    body.store = { name: `Synthetic Store ${suffix}`, phone: "05550000000", tax_no: `T${String(randomInt(10000)).padStart(4, "0")}V${String(randomInt(1000000)).padStart(6, "0")}`, bank_account: `TR${String(98n - BigInt(`${bban}292700`) % 97n).padStart(2, "0")}${bban}` };
  }
  const created = await request.post(`${API}/signup`, { data: body }); expect(created.status()).toBe(201);
  const identity = await created.json();
  if (role === "admin") {
    // Restricted fixture-only bootstrap; public Admin registration stays forbidden.
    expect(Number.isSafeInteger(identity.id) && identity.id > 0).toBe(true);
    sql(`update app_user set role_id=(select id from role where code='admin') where id=${identity.id}`);
  }
  const login = await request.post(`${API}/login`, { data: { email, password } }); expect(login.status()).toBe(200);
  return { ...await login.json(), email, password };
}
async function signIn(page, identity) {
  await page.goto("/login"); await page.getByLabel("Email", { exact: true }).fill(identity.email);
  await page.getByLabel("Password", { exact: true }).fill(identity.password); await page.getByLabel("Remember me").check();
  const response = page.waitForResponse(value => value.url().endsWith("/login") && value.request().method() === "POST");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  const authenticated = await response; expect(authenticated.status()).toBe(200);
  const session = await authenticated.json();
  await expect(page.locator('header button[aria-haspopup="menu"]')).toContainText(session.name);
  await expect(page).not.toHaveURL(/\/login$/);
}
async function logout(page) { await page.locator('header button[aria-haspopup="menu"]').click(); await page.getByRole("menuitem", { name: "Logout", exact: true }).click(); }
test.beforeEach(async ({ context, page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await context.route("**/*", route => { const u = new URL(route.request().url()); return u.hostname === "127.0.0.1" && ["5176", "8083"].includes(u.port) ? route.continue() : route.abort(); });
  page.runtimeErrors = []; page.on("pageerror", error => page.runtimeErrors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.runtimeErrors).toEqual([]));

test("guest card action survives refresh, browser return, signup/login and isolated account switching", async ({ page, request, context }) => {
  await page.goto("/shop"); const add = page.getByRole("button", { name: /^Add .* to cart$/ }).first();
  await add.click(); await expect(page.getByText("Added to cart", { exact: true })).toBeVisible();
  await page.reload(); await page.goto("/cart"); await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  const returned = await context.newPage(); await returned.goto("http://127.0.0.1:5176/cart"); await expect(returned.locator("tbody tr")).toHaveCount(1); await returned.close();
  await page.getByRole("link", { name: "Create Order", exact: true }).click(); await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("link", { name: "Create an account" }).click();
  const email = `ui-${randomBytes(8).toString("hex")}@example.test`, password = `Local-${randomBytes(18).toString("hex")}Aa1!`;
  await page.locator("#name").fill("Synthetic new shopper"); await page.locator("#email").fill(email); await page.locator("#password").fill(password); await page.locator("#passwordConfirm").fill(password);
  await page.getByRole("button", { name: "Create Account", exact: true }).click(); await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email", { exact: true }).fill(email); await page.getByLabel("Password", { exact: true }).fill(password); await page.getByLabel("Remember me").check();
  await page.getByRole("button", { name: "Login", exact: true }).click(); await expect(page).toHaveURL(/\/order$/);
  await page.goto("/cart"); await expect(page.locator("tbody tr")).toHaveCount(1); await page.reload(); await expect(page.locator("tbody tr")).toHaveCount(1);
  await logout(page); await page.goto("/cart"); await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  const other = await account(request); await signIn(page, other); await page.goto("/cart"); await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  await logout(page); await signIn(page, { email, password }); await page.goto("/cart"); await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("duplicate card clicks, failed reads, stale saved prices and stock changes remain safe", async ({ page }) => {
  await page.goto("/shop"); const add = page.getByRole("button", { name: /^Add .* to cart$/ }).first();
  await page.route(`${API}/products/1`, async route => { await new Promise(resolve => setTimeout(resolve, 200)); await route.continue(); });
  await add.dblclick(); await expect(page.getByText("Added to cart", { exact: true })).toBeVisible();
  await page.unroute(`${API}/products/1`);
  await page.route(`${API}/products/1`, route => route.fulfill({ status: 503, json: { message: "Synthetic catalog outage" } }));
  await add.click(); await expect(page.getByRole("alert").filter({ hasText: "Synthetic catalog outage" })).toBeVisible(); await page.unroute(`${API}/products/1`);
  await page.evaluate(() => { const saved = JSON.parse(localStorage.getItem("wit.cart.v1:guest")); saved.lines[0].price = 0.01; localStorage.setItem("wit.cart.v1:guest", JSON.stringify(saved)); });
  await page.goto("/cart"); await expect(page.locator("tbody tr")).toHaveCount(1); await expect(page.locator("tbody").getByText("$299.90", { exact: true })).toHaveCount(2);
  const stock = Number(sql("select stock from product where id=1"));
  try { sql("update product set stock=0 where id=1"); await page.reload(); await expect(page.getByText(/Only 0 available/)).toBeVisible(); await expect(page.getByRole("button", { name: /^Increase / })).toBeDisabled(); }
  finally { sql(`update product set stock=${stock} where id=1`); }
});

for (const width of [375, 1440]) test(`collection links activate with real mobile/keyboard navigation at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto("/");
  for (const [name, gender, keyboard] of [["KADIN", "k", false], ["ERKEK", "e", false], ...(width >= 768 ? [["KADIN", "k", true], ["ERKEK", "e", true]] : [])]) {
    if (width < 768) { await page.getByRole("button", { name: "Toggle menu" }).click(); await page.getByRole("button", { name: "Categories", exact: true }).click(); }
    else { const button = page.getByRole("button", { name: "Shop", exact: true }); await button.focus(); await page.keyboard.press("Enter"); }
    const link = page.getByRole("link", { name, exact: true });
    if (width < 768) await link.tap(); else if (keyboard) { await link.focus(); await page.keyboard.press("Enter"); } else await link.click();
    await expect(page).toHaveURL(new RegExp(`gender=${gender}`)); await expect(page.locator("main article")).toHaveCount(8);
    await page.reload(); await expect(page.locator("main article")).toHaveCount(8);
    await page.screenshot({ path: test.info().outputPath(`collection-${gender}.png`) });
  }
});

test("global Turkish search escapes every route and integrates with contextual filters and history", async ({ page }) => {
  for (const route of ["/shop?gender=k", "/shop?gender=e", "/shop/kadin/kadin-elbise/1", "/shop/kadin/kadin-elbise/1/siyah-kadin-elbise/1"]) {
    await page.goto(route); await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByRole("searchbox").fill("  SİYAH  "); await page.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/\/shop\?filter=/); expect(new URL(page.url()).searchParams.has("gender")).toBe(false); expect(new URL(page.url()).searchParams.has("category")).toBe(false);
    await expect(page.locator("main article")).toHaveCount(2);
  }
  await page.getByRole("form", { name: "Shop filters" }).getByRole("combobox", { name: "Collection", exact: true }).selectOption("e");
  await page.getByRole("button", { name: "Apply filters", exact: true }).click(); await expect(page.locator("main article")).toHaveCount(1);
  await page.reload(); await expect(page.locator("main article")).toHaveCount(1); await page.goBack(); await expect(page.locator("main article")).toHaveCount(2);
});

for (const width of [375, 1440]) test(`combined filters, sorting, URL reload and reset at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto("/shop?filter=Kadin&sort=price%3Adesc&gender=k");
  if (width < 1024) await page.getByRole("button", { name: "Filters", exact: true }).click();
  const form = page.getByRole("form", { name: "Shop filters" });
  await form.getByLabel("Minimum price").fill("500"); await form.getByLabel("Maximum price").fill("100"); await form.getByRole("button", { name: "Apply filters" }).click();
  await expect(form.getByRole("alert")).toContainText("must not exceed");
  await form.getByLabel("Minimum price").fill("250"); await form.getByLabel("Maximum price").fill("300"); await form.getByLabel("In stock only").check();
  await form.getByRole("button", { name: "Apply filters" }).click(); await expect(page.locator("main article")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Remove filter Min $250", exact: true })).toBeVisible();
  await page.reload(); await expect(page.locator("main article")).toHaveCount(4);
  if (width < 1024) { await page.getByRole("button", { name: "Filters", exact: true }).click(); await page.keyboard.press("Tab"); expect(await page.evaluate(() => Boolean(document.activeElement.closest("dialog")))).toBe(true); }
  await page.getByRole("form", { name: "Shop filters" }).getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("main article")).toHaveCount(8); expect(new URL(page.url()).searchParams.get("sort")).toBe("price:desc"); expect(new URL(page.url()).searchParams.get("filter")).toBe("Kadin");
});

test("city combobox keeps 81 provinces, popular order, Turkish keyboard matching and address details", async ({ page, request }) => {
  const customer = await account(request); await signIn(page, customer); await page.goto("/shop"); await page.getByRole("button", { name: /^Add .* to cart$/ }).first().click(); await expect(page.getByText("Added to cart", { exact: true })).toBeVisible();
  await page.goto("/order"); await page.setViewportSize({ width: 375, height: 812 }); await page.getByRole("button", { name: "Add Address", exact: true }).click();
  const form = page.getByRole("form", { name: "Add address" });
  for (const [label, value] of [["Address title", "Home"], ["Name", "Synthetic"], ["Surname", "Buyer"], ["Phone", "05551112233"]]) await form.getByLabel(label, { exact: true }).fill(value);
  const city = form.getByRole("combobox", { name: "City / province" }); await city.click();
  const options = page.getByRole("listbox", { name: "Turkish provinces" }).getByRole("option"); await expect(options).toHaveCount(81);
  expect((await options.allTextContents()).slice(0, 3)).toEqual(["İstanbul", "Ankara", "İzmir"]);
  await city.scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath("city-list-mobile.png") });
  await city.fill("IZMIR"); await city.press("ArrowDown"); await city.press("Enter"); await expect(city).toHaveValue("İzmir");
  await form.getByLabel("District", { exact: true }).fill("Manual district"); await form.getByLabel("Neighborhood / street, building, apartment and postal details").fill(address.neighborhood);
  await form.getByRole("button", { name: "Save Address", exact: true }).click(); await page.getByRole("button", { name: "Edit address Home", exact: true }).click();
  const edit = page.getByRole("form", { name: "Edit address" }); const editedCity = edit.getByRole("combobox", { name: "City / province" }); await expect(editedCity).toHaveValue("İzmir");
  await editedCity.fill("ankara"); await editedCity.press("ArrowDown"); await editedCity.press("Enter"); await expect(edit.getByLabel("District", { exact: true })).toHaveValue("");
  await expect(edit.getByLabel("Neighborhood / street, building, apartment and postal details")).toHaveValue(address.neighborhood);
  await page.screenshot({ path: test.info().outputPath("address-mobile.png") });
});

test("real multi-store fulfillment UI and API authorization isolate lines and persist audited progress", async ({ page, request }) => {
  const [customer, other, a, b, admin] = await Promise.all([account(request), account(request), account(request, "store"), account(request, "store"), account(request, "admin")]);
  await signIn(page, admin); await page.goto("/fulfillment"); await page.getByText("Verified store ownership for future orders", { exact: true }).click();
  for (const [id, owner] of [[1, a], [4, b]]) {
    const form = page.locator("form").filter({ hasText: new RegExp(`#${id} ·`) }); await form.locator("select").selectOption(String(owner.store_id));
    const saved = page.waitForResponse(response => response.url().endsWith(`/fulfillment/products/${id}/store`) && response.request().method() === "PUT");
    await form.getByRole("button", { name: "Save verified owner" }).click(); expect((await saved).status()).toBe(200);
  }
  const headers = { Authorization: customer.token }; const savedAddress = await (await request.post(`${API}/user/address`, { headers, data: address })).json();
  const response = await request.post(`${API}/order`, { headers, data: { address_id: savedAddress.id, price: 0.01, request_id: randomUUID(), products: [{ product_id: 1, count: 1 }, { product_id: 4, count: 1 }] } }); expect(response.status()).toBe(201);
  const order = await response.json(); expect(Number(order.price)).toBe(1198.9);
  const shipments = (await (await request.get(`${API}/order/${order.id}/shipments`, { headers })).json()).shipments;
  const sa = shipments.find(row => row.store_id === a.store_id), sb = shipments.find(row => row.store_id === b.store_id); expect(shipments).toHaveLength(2);
  expect((await request.get(`${API}/order/${order.id}/shipments`, { headers: { Authorization: other.token } })).status()).toBe(404);
  expect((await request.put(`${API}/fulfillment/shipments/${sb.id}`, { headers: { Authorization: a.token }, data: { request_id: randomUUID(), version: 0, status: "PREPARING" } })).status()).toBe(404);
  expect((await request.put(`${API}/fulfillment/shipments/${sa.id}`, { headers, data: { request_id: randomUUID(), version: 0, status: "PREPARING" } })).status()).toBe(403);
  await signIn(page, a); await page.goto("/fulfillment"); await expect(page.getByRole("heading", { name: `Shipment #${sa.id}`, exact: true })).toBeVisible(); await expect(page.getByRole("heading", { name: `Shipment #${sb.id}`, exact: true })).toHaveCount(0);
  let form = page.getByRole("form", { name: `Manage shipment ${sa.id}`, exact: true }); await form.getByRole("combobox", { name: "Status", exact: true }).selectOption("PREPARING"); await form.getByRole("button", { name: "Save shipment" }).click(); await expect(page.getByText(`Shipment #${sa.id} updated.`, { exact: true })).toBeVisible();
  form = page.getByRole("form", { name: `Manage shipment ${sa.id}`, exact: true }); await form.getByRole("combobox", { name: "Status", exact: true }).selectOption("SHIPPED"); await form.getByRole("button", { name: "Save shipment" }).click(); await expect(form.getByRole("alert")).toContainText("required before shipping");
  await form.getByLabel("Carrier", { exact: true }).fill("Synthetic carrier"); await form.getByLabel("Tracking number", { exact: true }).fill("TEST-STORE-A"); await form.getByRole("button", { name: "Save shipment" }).click();
  await expect(page.getByRole("form", { name: `Manage shipment ${sa.id}`, exact: true }).getByRole("combobox", { name: "Status", exact: true })).toHaveValue("SHIPPED");
  await page.setViewportSize({ width: 375, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.getByRole("heading", { name: "Store fulfillment", exact: true }).scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath("store-fulfillment-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, customer); await page.goto(`/orders?order=${order.id}`); await expect(page.getByText("Overall fulfillment: Partially shipped")).toBeVisible(); await expect(page.getByText("TEST-STORE-A", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.locator('section[aria-label="Shipment details"]').screenshot({ path: test.info().outputPath("shipments-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 900 }); await signIn(page, admin); await page.goto("/fulfillment");
  const managed = page.getByRole("form", { name: `Manage shipment ${sb.id}`, exact: true }); await managed.getByRole("combobox", { name: "Status", exact: true }).selectOption("PREPARING");
  const savedByAdmin = page.waitForResponse(value => value.url().endsWith(`/fulfillment/shipments/${sb.id}`) && value.request().method() === "PUT");
  await managed.getByRole("button", { name: "Save shipment" }).click(); expect((await savedByAdmin).status()).toBe(200);
  await expect(page.getByText(`Shipment #${sb.id} updated.`, { exact: true })).toBeVisible();
  await expect(page.getByRole("form", { name: `Manage shipment ${sb.id}`, exact: true }).getByRole("combobox", { name: "Status", exact: true })).toHaveValue("PREPARING");
  const persisted = await (await request.get(`${API}/order/${order.id}/shipments`, { headers })).json();
  for (const shipment of persisted.shipments) for (const event of shipment.history) expect(event).not.toHaveProperty("actor_id");
  const managementAudit = await (await request.get(`${API}/fulfillment/shipments`, { headers: { Authorization: admin.token } })).json();
  expect(managementAudit.shipments.find(row => row.id === sb.id).history.at(-1).actor_id).toBe(admin.id);
  await page.screenshot({ path: test.info().outputPath("admin-fulfillment.png") });
});

for (const width of [320, 375, 768, 1024, 1440]) test(`complete route theme and responsive boundaries at ${width}px`, async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width, height: 900 }); await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/shop", "/favorites", "/cart", "/login", "/signup", "/about", "/team", "/contact", "/blog", "/blog/what-a-demo-order-actually-records", "/careers", "/privacy", "/terms", "/cookies", "/license", "/partners", "/how-it-works", "/faq", "/apps", "/demo", "/customer-stories", "/developers", "/order", "/orders", "/fulfillment"]) {
    await page.goto(route); await expect(page.locator("main h1, main h2").first()).toBeVisible(); await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), route).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily), route).toContain("Montserrat");
    if (route === "/shop") await page.screenshot({ path: test.info().outputPath("shop-theme.png") });
  }
});
