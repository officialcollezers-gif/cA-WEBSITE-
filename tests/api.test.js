import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { JWT, OAuth2Client } from "google-auth-library";
import admin from "../api/admin.js";
import content from "../api/content.js";
import auth from "../api/auth.js";
import enquiries from "../api/enquiries.js";
import { sessionToken, readSession } from "../server/auth.js";
import { validateRecord, assemble } from "../server/content.js";
let server, base;
const originalFetch = globalThis.fetch;
const originalAccessToken = JWT.prototype.getAccessToken;
const originalVerify = OAuth2Client.prototype.verifyIdToken;
const store = { Content: [], Enquiries: [] };
const titles = new Set();
let failWrites = false;
const routes = {
  "/api/admin": admin,
  "/api/content": content,
  "/api/auth": auth,
  "/api/enquiries": enquiries,
};
before(async () => {
  Object.assign(process.env, {
    GOOGLE_SHEET_ID: "test-sheet",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "service@example.com",
    GOOGLE_PRIVATE_KEY: "test-only-placeholder",
    GOOGLE_CLIENT_ID: "client-id",
    ADMIN_EMAILS: "admin@example.com",
    SESSION_SECRET: "test-secret-longer-than-32-characters-only",
    TURNSTILE_SECRET_KEY: "test-key",
  });
  JWT.prototype.getAccessToken = async () => ({
    token: "test-only-google-token",
  });
  OAuth2Client.prototype.verifyIdToken = async ({ idToken, audience }) => {
    assert.equal(audience, "client-id");
    if (idToken === "invalid") throw new Error("invalid");
    return {
      getPayload: () => ({
        email:
          idToken === "allowed" ? "admin@example.com" : "visitor@example.com",
        email_verified: true,
      }),
    };
  };
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    if (u.hostname === "challenges.cloudflare.com")
      return Response.json({
        success: options.body.get("response") === "valid-challenge",
        hostname: new URL(base).hostname,
      });
    if (u.hostname !== "sheets.googleapis.com")
      return originalFetch(url, options);
    assert.equal(
      options.headers.Authorization,
      "Bearer test-only-google-token",
    );
    if (u.pathname.endsWith(":batchUpdate")) {
      JSON.parse(options.body).requests.forEach((r) =>
        titles.add(r.addSheet.properties.title),
      );
      return Response.json({});
    }
    if (!u.pathname.includes("/values/"))
      return Response.json({
        sheets: [...titles].map((title) => ({ properties: { title } })),
      });
    const tab = decodeURIComponent(u.pathname.split("/values/")[1]).split(
      "!",
    )[0];
    if (options.method === "POST") {
      if (failWrites)
        return Response.json({ error: "denied" }, { status: 403 });
      assert.equal(u.searchParams.get("valueInputOption"), "RAW");
      store[tab].push(...JSON.parse(options.body).values);
      return Response.json({ updates: { updatedRows: 1 } });
    }
    return Response.json({ values: store[tab] });
  };
  server = createServer((req, res) => {
    const handler = routes[new URL(req.url, "http://localhost").pathname];
    if (handler) handler(req, res);
    else {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  process.env.APP_ORIGIN = base;
});
after(async () => {
  globalThis.fetch = originalFetch;
  JWT.prototype.getAccessToken = originalAccessToken;
  OAuth2Client.prototype.verifyIdToken = originalVerify;
  await new Promise((resolve) => server.close(resolve));
});
function call(
  path,
  {
    data,
    method = data ? "POST" : "GET",
    authorized = false,
    origin = base,
  } = {},
) {
  return originalFetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(authorized
        ? { Cookie: `fincore_session=${sessionToken("admin@example.com")}` }
        : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}
test("unauthenticated callers cannot read private content or mutate Sheets", async () => {
  assert.equal((await call("/api/admin")).status, 401);
  assert.equal(
    (await call("/api/admin", { data: { action: "initialize" } })).status,
    401,
  );
  assert.equal(store.Content.length, 0);
});
test("Google sign-in validates audience, allowlist and session cookie", async () => {
  assert.equal(
    (await call("/api/auth", { data: { credential: "other" } })).status,
    403,
  );
  assert.equal(
    (await call("/api/auth", { data: { credential: "invalid" } })).status,
    401,
  );
  const result = await call("/api/auth", { data: { credential: "allowed" } });
  assert.equal(result.status, 200);
  assert.match(result.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
  const user = await (
    await originalFetch(base + "/api/auth", {
      headers: { Cookie: result.headers.get("set-cookie").split(";")[0] },
    })
  ).json();
  assert.equal(user.user, "admin@example.com");
  assert.equal(
    readSession({
      headers: {
        cookie: `fincore_session=${sessionToken("admin@example.com")}tampered`,
      },
    }),
    null,
  );
  const logout = await call("/api/auth", { method: "DELETE" });
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
});
test("initialization imports 6 categories and 36 services and is repeatable", async () => {
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "initialize" },
      })
    ).status,
    200,
  );
  const count = store.Content.length;
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "initialize" },
      })
    ).status,
    200,
  );
  assert.equal(store.Content.length, count);
  const data = await (await call("/api/content")).json();
  assert.equal(data.categories.length, 6);
  assert.equal(
    data.categories.reduce((n, c) => n + c.subServices.length, 0),
    36,
  );
  assert.equal(data.blogs.length, 6);
  assert.equal(data.pages.length, 0);
});
test("draft, publish, edit and delete flow preserves private content and sanitizes HTML", async () => {
  const record = {
    id: "test-article",
    title: "Draft",
    status: "draft",
    contentHtml:
      '<h2>Hello</h2><script>alert(1)</script><img src=x onerror=alert(2)><a href="javascript:alert(3)">x</a>',
  };
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "save", kind: "blogs", record },
      })
    ).status,
    200,
  );
  let data = await (await call("/api/content")).json();
  assert.ok(!data.blogs.find((b) => b.id === record.id));
  const privateData = await (
    await call("/api/admin", { authorized: true })
  ).json();
  assert.ok(privateData.content.blogs.find((b) => b.id === record.id));
  record.status = "published";
  record.title = "Published article";
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "save", kind: "blogs", record },
      })
    ).status,
    200,
  );
  data = await (await call("/api/content")).json();
  const article = data.blogs.find((b) => b.id === record.id);
  assert.equal(article.title, "Published article");
  assert.match(article.contentHtml, /<h2>Hello<\/h2>/);
  assert.doesNotMatch(article.contentHtml, /script|onerror|javascript:/);
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "delete", kind: "blogs", record },
      })
    ).status,
    200,
  );
  data = await (await call("/api/content")).json();
  assert.ok(!data.blogs.find((b) => b.id === record.id));
});
test("cross-origin writes are rejected and invalid records cannot reach Sheets", async () => {
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        origin: "https://attacker.example",
        data: { action: "initialize" },
      })
    ).status,
    403,
  );
  const count = store.Content.length;
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: {
          action: "save",
          kind: "blogs",
          record: { id: "../bad", title: "Bad" },
        },
      })
    ).status,
    400,
  );
  assert.equal(store.Content.length, count);
  assert.throws(
    () =>
      validateRecord("categories", {
        id: "tax",
        title: "Tax",
        subServices: [
          { slug: "same", title: "A" },
          { slug: "same", title: "B" },
        ],
      }),
    /unique/,
  );
});
test("settings and nested services survive Sheets serialization and frontend reads", async () => {
  const current = assemble(store.Content);
  const record = {
    ...current.categories[0],
    title: "Updated tax",
    subServices: current.categories[0].subServices.map((s, i) =>
      i
        ? s
        : {
            ...s,
            title: "New service title",
            contentHtml: "<p>Custom <strong>HTML</strong></p>",
          },
    ),
  };
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "save", kind: "categories", record },
      })
    ).status,
    200,
  );
  const data = await (await call("/api/content")).json();
  assert.equal(
    data.categories.find((c) => c.id === record.id).subServices[0].title,
    "New service title",
  );
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: {
          action: "save",
          kind: "settings",
          record: { ...data.settings, name: "Test Advisors" },
        },
      })
    ).status,
    200,
  );
  assert.equal(
    (await (await call("/api/content")).json()).settings.name,
    "Test Advisors",
  );
});
test("enquiries require validation and anti-spam verification, persist RAW and stay private", async () => {
  const data = {
    name: "=NOT_A_FORMULA()",
    email: "customer@example.com",
    phone: "+91 9876543210",
    service: "Tax",
    message: "Please help me file my taxes.",
    consent: true,
    challengeToken: "invalid",
  };
  assert.equal((await call("/api/enquiries", { data })).status, 400);
  data.challengeToken = "valid-challenge";
  assert.equal(
    (await call("/api/enquiries", { data: { ...data, consent: false } }))
      .status,
    400,
  );
  assert.equal((await call("/api/enquiries", { data })).status, 200);
  assert.equal(store.Enquiries.length, 1);
  const result = await (await call("/api/admin", { authorized: true })).json();
  assert.equal(result.enquiries[0].name, "=NOT_A_FORMULA()");
  assert.equal(
    (await (await call("/api/content")).json()).enquiries,
    undefined,
  );
});
test("Google write failure is reported without claiming success", async () => {
  failWrites = true;
  const record = { id: "failing", title: "Should fail", status: "published" };
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "save", kind: "blogs", record },
      })
    ).status,
    502,
  );
  assert.ok(!assemble(store.Content).blogs.find((b) => b.id === "failing"));
  failWrites = false;
});

test('separate public origin can read content and preflight enquiry requests without admin cookies', async () => {
  process.env.PUBLIC_SITE_ORIGIN = 'https://public.example.com';
  const read = await call('/api/content', { origin: process.env.PUBLIC_SITE_ORIGIN });
  assert.equal(read.status, 200);
  assert.equal(read.headers.get('access-control-allow-origin'), process.env.PUBLIC_SITE_ORIGIN);
  assert.equal(read.headers.get('access-control-allow-credentials'), null);
  const preflight = await call('/api/enquiries', { method: 'OPTIONS', origin: process.env.PUBLIC_SITE_ORIGIN });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-methods'), 'POST');
  assert.equal((await call('/api/content', { origin: 'https://attacker.example' })).status, 403);
  assert.equal((await call('/api/enquiries', { method: 'OPTIONS', origin: 'https://attacker.example' })).status, 403);
  delete process.env.PUBLIC_SITE_ORIGIN;
});
test('public origin cannot use an admin session to write content', async () => {
  process.env.PUBLIC_SITE_ORIGIN = 'https://public.example.com';
  assert.equal((await call('/api/admin', { authorized: true, origin: process.env.PUBLIC_SITE_ORIGIN, data: { action: 'initialize' } })).status, 403);
  assert.equal((await call('/api/auth', { origin: process.env.PUBLIC_SITE_ORIGIN, data: { credential: 'allowed' } })).status, 403);
  delete process.env.PUBLIC_SITE_ORIGIN;
});
