import { test, expect } from "@playwright/test";
import { defaults, validateRecord } from "../server/content.js";
async function workspace(page) {
  const state = structuredClone(defaults);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/auth", (route) =>
    route.fulfill({ json: { clientId: "", user: "admin@example.com" } }),
  );
  await page.route("**/api/content", (route) =>
    route.fulfill({
      json: {
        ...state,
        blogs: state.blogs.filter((b) => b.status === "published"),
        categories: state.categories.filter((c) => c.status === "published"),
        pages: state.pages.filter((p) => p.status === "published"),
      },
    }),
  );
  await page.route("**/api/admin", async (route) => {
    if (route.request().method() === "POST") {
      const { action, kind, record } = route.request().postDataJSON();
      if (kind === "settings") state.settings = record;
      else {
        state[kind] = state[kind].filter((r) => r.id !== record.id);
        if (action !== "delete") state[kind].push(validateRecord(kind, record));
      }
      await route.fulfill({ json: { ok: true } });
    } else
      await route.fulfill({
        json: {
          configured: true,
          initialized: true,
          content: state,
          enquiries: [],
        },
      });
  });
  return { state, errors };
}
test("public routes render starter services, blogs and article details without runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/",
    "/services",
    "/services/income-tax-advisory",
    "/services/income-tax-advisory/individual-income-tax-return-filing",
    "/blogs",
    "/blogs/income-tax-return-filing-guide",
    "/about",
    "/contact",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible({
      timeout: 15000,
    });
  }
  expect(errors).toEqual([]);
});
test("admin creates and publishes HTML article which renders on the frontend", async ({
  page,
}) => {
  const { state, errors } = await workspace(page);
  await page.goto("/admin");
  await expect(page.getByText("Google Sheets connected")).toBeVisible();
  await page.getByRole("button", { name: "Articles", exact: true }).click();
  await page.getByRole("button", { name: "New article" }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Tax updates from admin");
  await page.getByLabel("URL slug").fill("tax-updates");
  await page
    .getByLabel("HTML content")
    .fill(
      "<h2>Updated guidance</h2><p>A new <strong>published article</strong>.</p>",
    );
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Updated guidance" }),
  ).toBeVisible();
  await page.getByLabel("Visibility").selectOption("published");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved to Google Sheets",
  );
  expect(state.blogs.find((b) => b.id === "tax-updates").status).toBe(
    "published",
  );
  await page.goto("/blogs/tax-updates");
  await expect(
    page.getByRole("heading", { name: "Tax updates from admin" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Updated guidance" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile admin edits settings and an individual service", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { state, errors } = await workspace(page);
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Site settings", exact: true })
    .click();
  await page.getByLabel("Business name").fill("Pranjal Advisors");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved to Google Sheets",
  );
  expect(state.settings.name).toBe("Pranjal Advisors");
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await page.getByRole("button", { name: /Income Tax Advisory/ }).click();
  await page
    .getByLabel("Service title", { exact: true })
    .fill("Updated individual tax filing");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Saved to Google Sheets",
  );
  expect(
    state.categories.find((c) => c.id === "income-tax-advisory").subServices[0]
      .title,
  ).toBe("Updated individual tax filing");
  await page.screenshot({ path: "/tmp/ca-admin-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("unauthenticated admin displays a setup screen without editable content", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: /Behind the scenes/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Complete the Apps Script connection", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(
    0,
  );
});

test("Apps Script admin displays password login and handles invalid and valid credentials", async ({
  page,
}) => {
  await workspace(page);
  await page.unroute("**/api/auth");
  let loggedIn = false;
  await page.route("**/api/auth", async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      if (data.password !== "test-password-only")
        return route.fulfill({
          status: 401,
          json: { error: "Incorrect admin email or password." },
        });
      loggedIn = true;
    }
    await route.fulfill({
      json: {
        loginMethod: "password",
        configured: true,
        clientId: "",
        user: loggedIn ? "admin@example.com" : null,
      },
    });
  });
  await page.goto("/admin");
  await page.getByLabel("Admin email").fill("admin@example.com");
  await expect(page.getByLabel("Admin password")).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByLabel("Admin password").fill("wrong");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Incorrect admin email or password.",
  );
  await page.getByLabel("Admin password").fill("test-password-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Google Sheets connected")).toBeVisible();
});
