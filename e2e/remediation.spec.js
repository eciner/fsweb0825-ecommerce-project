import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
const API = "http://127.0.0.1:8083";
const addr = (title = "Shipping") => ({
  title,
  name: "Synthetic",
  surname: "Reviewer",
  phone: "+905551112233",
  city: "Ankara",
  district: "Manual district",
  neighborhood: "Synthetic street apartment 2",
});
async function account(request, page) {
  const roles = await (await request.get(`${API}/roles`)).json();
  const role = roles.find((r) => r.code === "customer");
  const email = `e2e-${randomBytes(8).toString("hex")}@example.test`;
  const password = `Local-${randomBytes(16).toString("hex")}Aa1!`;
  expect(
    (
      await request.post(`${API}/signup`, {
        data: { name: "Synthetic Reviewer", email, password, role_id: role.id },
      })
    ).status(),
  ).toBe(201);
  const response = await request.post(`${API}/login`, {
    data: { email, password },
  });
  expect(response.status()).toBe(200);
  const { token } = await response.json();
  await page.goto("/");
  await page.evaluate((token) => localStorage.setItem("token", token), token);
  await page.reload();
  return { Authorization: token };
}
async function goCheckout(page) {
  await page.getByRole("button", { name: "Cart", exact: true }).click();
  await page.getByRole("link", { name: "View cart", exact: true }).click();
  await page.getByRole("link", { name: "Create Order", exact: true }).click();
}
test.beforeEach(async ({ context, page }) => {
  await context.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === "127.0.0.1" && ["5176", "8083"].includes(u.port))
      return route.continue();
    return route.abort();
  });
  page.pageErrors = [];
  page.on("pageerror", (error) => page.pageErrors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(page.pageErrors).toEqual([]);
});

for (const width of [320, 375, 768, 1024, 1440])
  test(`public layouts, real assets, hash focus and reduced motion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of [
      "/",
      "/shop?gender=k",
      "/team",
      "/about",
      "/contact",
      "/faq",
      "/blog",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1, main h2").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const metric = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        font: document.fonts.check('16px "Montserrat"'),
      }));
      expect(metric.overflow).toBeLessThanOrEqual(1);
      expect(metric.font).toBe(true);
    }
    await page.goto("/careers#open-positions");
    await expect(page.locator("#open-positions")).toBeFocused();
    await page.goto("/shop?gender=k");
    await page.locator('main article a[href^="/shop/"]').first().click();
    const description = page
      .locator("main p")
      .filter({ hasText: /Siyah|Kadin|Elbise|Demo|demo|elbise/ })
      .last();
    void description;
    const action = page.getByRole("button", {
      name: "Add to Cart",
      exact: true,
    });
    await expect(action).toBeVisible();
    const colors = await action.evaluate((e) => {
      const c = getComputedStyle(e);
      return {
        bg: c.backgroundColor,
        text: c.color,
        motion: c.transitionDuration,
      };
    });
    expect(colors.bg).toBe("rgb(33, 110, 172)");
    expect(colors.text).toBe("rgb(255, 255, 255)");
    expect(
      colors.motion.split(",").every((value) => parseFloat(value) <= 0.001),
    ).toBe(true);
    await expect(page.locator("main img").first()).toHaveCSS(
      "object-fit",
      "contain",
    );
    await expect(
      page.getByRole("heading", { name: "Built with" }),
    ).toBeVisible();
    await expect(page.getByText("Hooli", { exact: true })).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    // Keyboard focus-visible remains visible under reduced motion.
    await action.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(action).toBeFocused();
    expect(
      await action.evaluate((e) => getComputedStyle(e).outlineStyle),
    ).not.toBe("none");
    await page.screenshot({ path: test.info().outputPath("review.png") });
  });

for (const reload of [false, true])
  test(`committed lost-response order replays once (reload=${reload}) and refreshes inventory`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const headers = await account(request, page);
    const shipping = await (
      await request.post(`${API}/user/address`, { headers, data: addr() })
    ).json();
    const billing = await (
      await request.post(`${API}/user/address`, {
        headers,
        data: { ...addr("Billing"), city: "London", phone: "+442079460000" },
      })
    ).json();
    expect(shipping.id).toBeTruthy();
    expect(billing.id).toBeTruthy();
    await page.goto("/shop?gender=k&filter=siyah");
    await page.locator('main article a[href^="/shop/"]').first().click();
    const stockBefore = Number(
      (await page.getByText(/In Stock - \d+ available/).innerText()).match(
        /\d+/,
      )[0],
    );
    await page.getByRole("button", { name: /Save .* to favorites/ }).click();
    await page.reload();
    await expect(
      page.getByRole("button", { name: /Remove .* from favorites/ }),
    ).toBeVisible();
    const detailPath = new URL(page.url()).pathname;
    await page
      .getByRole("button", { name: "Add to Cart", exact: true })
      .click();
    await goCheckout(page);
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
    await expect(page.getByLabel("CCV", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Add Card", exact: true }).click();
    await page
      .getByLabel("Card number", { exact: true })
      .fill("4111111111111111");
    await page
      .getByLabel("Name on card", { exact: true })
      .fill("Synthetic Reviewer");
    await page
      .getByLabel("Expiration year")
      .selectOption(String(new Date().getFullYear() + 1));
    await page.getByLabel("Expiration month").selectOption("12");
    await page.getByRole("button", { name: "Save Card", exact: true }).click();
    await page.getByRole("radio", { name: /1111/ }).check();
    await page.getByLabel("CCV", { exact: true }).fill("12");
    await expect(
      page.getByRole("button", { name: "Complete Order", exact: true }),
    ).toBeDisabled();
    await page.getByLabel("CCV", { exact: true }).fill("123");
    let original;
    let calls = 0;
    await page.route(`${API}/order`, async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      calls++;
      const payload = route.request().postDataJSON();
      expect(payload.card_no).toBeUndefined();
      expect(payload.card_ccv).toBeUndefined();
      if (calls === 1) {
        original = payload;
        const response = await route.fetch();
        expect(response.status()).toBe(201);
        await route.abort();
      } else {
        expect(payload).toEqual(original);
        await route.continue();
      }
    });
    await page
      .getByRole("button", { name: "Complete Order", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Order outcome is uncertain" }),
    ).toBeVisible();
    if (reload) {
      await page.reload();
      await expect(
        page.getByText(/pending purchase is retained/),
      ).toBeVisible();
    }
    await expect(page.getByLabel("CCV", { exact: true })).toHaveValue("");
    await page.getByLabel("CCV", { exact: true }).fill("456");
    await page.getByRole("button", { name: "Retry same order safely" }).click();
    await expect(
      page.getByText("Order completed", { exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("confirmation.png") });
    expect(calls).toBe(2);
    const orders = await (
      await request.get(`${API}/order`, { headers })
    ).json();
    expect(orders.length).toBe(1);
    expect(orders[0].receipt_address_id).toBe(billing.id);
    expect(
      await page.evaluate(() =>
        Object.values(localStorage).some((v) => v.includes("4111111111111111")),
      ),
    ).toBe(false);
    // SPA case preserves the old detail cache; reload case verifies recovered purchase stock.
    await page
      .getByRole("link", { name: "Continue Shopping", exact: true })
      .click();
    await page
      .locator('main article a[href="' + detailPath + '"]')
      .first()
      .click();
    await expect(
      page.getByText(`In Stock - ${stockBefore - 1} available`, {
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/orders");
    await expect(
      page.getByText(`Order #${orders[0].id}`, { exact: true }),
    ).toBeVisible();
  });

test("successful address creation plus failed refresh only retries GET; edits/deletes remain confirmed", async ({
  page,
  request,
}) => {
  const headers = await account(request, page);
  const products = await (await request.get(`${API}/products?limit=1`)).json();
  await page.goto("/shop");
  await page.locator('main article a[href^="/shop/"]').first().click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await goCheckout(page);
  await page.getByRole("button", { name: "Add Address", exact: true }).click();
  let writes = 0,
    failNext = false;
  await page.route(`${API}/user/address`, async (route) => {
    if (route.request().method() === "POST") {
      writes++;
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      failNext = true;
      return route.fulfill({ response });
    }
    if (failNext) {
      failNext = false;
      return route.fulfill({
        status: 503,
        json: { message: "Injected refresh failure" },
      });
    }
    return route.continue();
  });
  for (const [label, value] of [
    ["Address title", "Created once"],
    ["Name", "Synthetic"],
    ["Surname", "Reviewer"],
    ["Phone", "05551112233"],
    ["City / province", "Manual city"],
    ["District", "Manual district"],
    [
      "Neighborhood / street, building, apartment and postal details",
      "Synthetic street apartment 2",
    ],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Save Address", exact: true }).click();
  await expect(page.getByText(/Change saved successfully/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save Address", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Refresh saved records" }).click();
  await expect(page.getByText(/Change saved successfully/)).toHaveCount(0);
  expect(writes).toBe(1);
  expect(
    (await (await request.get(`${API}/user/address`, { headers })).json())
      .length,
  ).toBe(1);
  await page.getByRole("button", { name: "Edit address Created once" }).click();
  await page.getByLabel("Address title", { exact: true }).fill("Edited once");
  await page.getByRole("button", { name: "Save Address", exact: true }).click();
  await page
    .getByRole("group", { name: "Shipping address", exact: true })
    .getByRole("radio")
    .first()
    .check();
  await page
    .getByRole("button", { name: "Delete address Edited once" })
    .click();
  await expect(page.getByText("No saved addresses yet.")).toBeVisible();
  expect(
    (await (await request.get(`${API}/user/address`, { headers })).json())
      .length,
  ).toBe(0);
  expect(products.total).toBe(16);
});

test("contact failure retains data then persists one acknowledgement on retry", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "CONTACT OUR COMPANY" }).click();
  for (const [label, value] of [
    ["Name", "Synthetic"],
    ["Email", "sender@example.test"],
    ["Subject", "E2E isolated"],
    ["Message", "A synthetic local test message."],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("checkbox").check();
  let calls = 0;
  let id;
  await page.route(`${API}/contact`, async (route) => {
    calls++;
    const payload = route.request().postDataJSON();
    if (calls === 1) {
      id = payload.submission_id;
      return route.fulfill({
        status: 503,
        json: { message: "Injected contact failure" },
      });
    }
    expect(payload.submission_id).toBe(id);
    return route.continue();
  });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Injected contact failure",
  );
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    "A synthetic local test message.",
  );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("Message received", { exact: true }),
  ).toBeVisible();
  const count = execFileSync(
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
      "select count(*) from contact_message",
    ],
    { encoding: "utf8" },
  ).trim();
  expect(count).toBe("1");
});
