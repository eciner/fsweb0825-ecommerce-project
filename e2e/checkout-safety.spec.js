import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
const API = "http://127.0.0.1:8083";
const sql = (query) =>
  execFileSync(
    process.env.E2E_DOCKER,
    [
      "--host",
      process.env.E2E_DOCKER_HOST,
      "exec",
      process.env.E2E_OWNED_CONTAINER,
      "psql",
      "-U",
      "enhancement_demo",
      "-d",
      "enhancement_demo",
      "-tAc",
      query,
    ],
    { encoding: "utf8", windowsHide: true },
  ).trim();
test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" && ["5176", "8083"].includes(url.port)
      ? route.continue()
      : route.abort();
  });
  page.runtimeErrors = [];
  page.on("pageerror", (error) => page.runtimeErrors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.runtimeErrors).toEqual([]));
async function customer(request, page) {
  const email = `critical-${randomBytes(8).toString("hex")}@example.test`;
  const password = `Local-${randomBytes(16).toString("hex")}Aa1!`;
  const roles = await (await request.get(`${API}/roles`)).json();
  expect(
    (
      await request.post(`${API}/signup`, {
        data: {
          email,
          password,
          name: "Synthetic Recovery",
          role_id: roles.find((r) => r.code === "customer").id,
        },
      })
    ).status(),
  ).toBe(201);
  const { token } = await (
    await request.post(`${API}/login`, { data: { email, password } })
  ).json();
  const headers = { Authorization: token };
  const address = await (
    await request.post(`${API}/user/address`, {
      headers,
      data: {
        title: "Shipping",
        name: "Synthetic",
        surname: "Reviewer",
        phone: "+905551112233",
        city: "Ankara",
        district: "Manual district",
        neighborhood: "Synthetic street apartment 2",
      },
    })
  ).json();
  const receipt = await (
    await request.post(`${API}/user/address`, {
      headers,
      data: {
        title: "Receipt",
        name: "Synthetic",
        surname: "Reviewer",
        phone: "+905551112233",
        city: "London",
        district: "Manual district",
        neighborhood: "Synthetic billing apartment 3",
      },
    })
  ).json();
  expect(address.id).toBeTruthy();
  expect(receipt.id).toBeTruthy();
  expect(
    (
      await request.post(`${API}/user/card`, {
        headers,
        data: {
          card_no: "4111111111111111",
          expire_month: 12,
          expire_year: new Date().getFullYear() + 1,
          name_on_card: "Synthetic Reviewer",
        },
      })
    ).status(),
  ).toBe(201);
  await page.goto("/");
  await page.evaluate((token) => localStorage.setItem("token", token), token);
  await page.reload();
  return { email, password, headers, address, receipt };
}

for (const mode of ["session", "reload", "storage-unavailable"])
  test(`lost commit response -> 401 -> real reauthentication -> one PostgreSQL order (${mode})`, async ({
    page,
    request,
    context,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    if (mode === "storage-unavailable")
      await context.addInitScript(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (...args) {
          if (this === window.sessionStorage)
            throw new Error("Synthetic unavailable session storage");
          return original.apply(this, args);
        };
      });
    const user = await customer(request, page);
    const product = (
      await (
        await request.get(`${API}/products?filter=siyah&gender=k&limit=1`)
      ).json()
    ).products[0];
    const inventory = () =>
      sql(`select stock,sell_count from product where id=${Number(product.id)}`)
        .split("|")
        .map(Number);
    const [stock, sold] = inventory();
    await page.goto("/shop?gender=k&filter=siyah");
    await page.locator('main article a[href^="/shop/"]').first().click();
    await page
      .getByRole("button", { name: "Add to Cart", exact: true })
      .click();
    await page.getByRole("button", { name: "Cart", exact: true }).click();
    await page.getByRole("link", { name: "View cart", exact: true }).click();
    await page.getByRole("link", { name: "Create Order", exact: true }).click();
    await page
      .getByRole("group", { name: "Shipping address", exact: true })
      .getByRole("radio")
      .first()
      .check();
    await page
      .getByLabel("Billing / receipt address is the same as shipping")
      .uncheck();
    await page
      .getByRole("group", { name: "Receipt address", exact: true })
      .getByRole("radio")
      .nth(1)
      .check();
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: /1111/ }).check();
    let calls = 0,
      original,
      committedId;
    await page.route(`${API}/order`, async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      calls++;
      const body = route.request().postDataJSON();
      expect(body).not.toHaveProperty("card_no");
      expect(body).not.toHaveProperty("card_ccv");
      if (calls === 1) {
        original = body;
        const response = await route.fetch();
        expect(response.status()).toBe(201);
        committedId = (await response.json()).id;
        return route.abort();
      }
      expect(body).toEqual(original);
      if (calls === 2)
        return route.fulfill({
          status: 401,
          json: {
            code: "UNAUTHORIZED",
            message: "Synthetic expired authentication",
          },
        });
      return route.continue();
    });
    await page.getByLabel("CCV", { exact: true }).fill("123");
    await page
      .getByRole("button", { name: "Complete Order", exact: true })
      .click();
    await expect(
      page
        .locator("main [role=alert]")
        .filter({ hasText: "Order outcome is uncertain" }),
    ).toBeVisible();
    expect(inventory()).toEqual([stock - 1, sold + 1]);
    if (mode === "reload") await page.reload();
    await page.getByLabel("CCV", { exact: true }).fill("456");
    await page.getByRole("button", { name: "Retry same order safely" }).click();
    const signIn = page.getByRole("link", {
      name: "Sign in to reconcile the original purchase",
    });
    await expect(signIn).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Complete Order", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Retry same order safely" }),
    ).toBeDisabled();
    if (mode !== "storage-unavailable")
      expect(
        await page.evaluate(
          (email) =>
            JSON.parse(sessionStorage.getItem("fsweb0825.pending-order"))
              .entries[email].payload,
          user.email,
        ),
      ).toEqual(original);
    await signIn.click();
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Retry same order safely" }),
    ).toBeVisible();
    await page.getByLabel("CCV", { exact: true }).fill("789");
    await page.getByRole("button", { name: "Retry same order safely" }).click();
    await expect(
      page.getByText("Order completed", { exact: true }),
    ).toBeVisible();
    const orders = await (
      await request.get(`${API}/order`, { headers: user.headers })
    ).json();
    expect(calls).toBe(3);
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(committedId);
    expect(orders[0].receipt_address_id).toBe(user.receipt.id);
    expect(orders[0].products[0].count).toBe(1);
    expect(orders[0].price).toBe(product.price);
    expect(
      sql(
        `select count(*) from customer_order where user_id=(select id from app_user where email='${user.email}')`,
      ),
    ).toBe("1");
    expect(inventory()).toEqual([stock - 1, sold + 1]);
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("fsweb0825.pending-order"),
      ),
    ).toBeNull();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });

test("information hashes tolerate malformed direct URLs and preserve client-side keyboard focus", async ({
  page,
}) => {
  for (const fragment of [
    "",
    "#unknown",
    "#%",
    "#%2",
    "#%E0%A4%A",
    "#%FF",
    "#%6fpen-positions",
    "#open-positions",
  ]) {
    await page.goto("/careers" + fragment);
    await expect(
      page.getByRole("heading", { name: "Careers at WiT", exact: true }),
    ).toBeVisible();
    if (["#open-positions", "#%6fpen-positions"].includes(fragment))
      await expect(page.locator("#open-positions")).toBeFocused();
  }
  await page.goto("/privacy");
  await page.getByRole("link", { name: "Open positions", exact: true }).click();
  await expect(page.locator("#open-positions")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.tagName)).not.toBe(
    "BODY",
  );
});
