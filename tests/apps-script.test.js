import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { createContext, runInContext } from "node:vm";
import { createServer } from "node:http";
import auth from "../api/auth.js";
import admin from "../api/admin.js";
import content from "../api/content.js";
import enquiries from "../api/enquiries.js";
import config from "../api/config.js";
import { scriptRequest } from "../server/apps-script.js";
const secret = "test-bridge-secret-only-never-a-production-value";
const password = "a".repeat(64);
const salt = "test-salt";
const props = new Map(
  Object.entries({
    SHEET_ID: "test-sheet",
    BRIDGE_SECRET: secret,
    ADMIN_EMAIL: "admin@example.com",
    PASSWORD_SALT: salt,
    PASSWORD_HASH: createHash("sha256")
      .update(salt + ":" + password)
      .digest("hex"),
  }),
);
const tabs = new Map();
const cache = new Map();
let locked = false;
let server, base;
const realFetch = globalThis.fetch;
const makeTab = () => {
  const cells = [];
  return {
    cells,
    getLastRow: () => cells.length,
    getRange: (start, _col, n) => ({
      setNumberFormat() {
        return this;
      },
      setValues(rows) {
        rows.forEach((r, i) => {
          cells[start - 1 + i] = [...r];
        });
        return this;
      },
      getDisplayValues() {
        return cells.slice(start - 1, start - 1 + n);
      },
    }),
  };
};
const context = createContext({
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => props.get(k) || null,
      setProperty: (k, v) => props.set(k, v),
      setProperties: (o) =>
        Object.entries(o).forEach(([k, v]) => props.set(k, v)),
    }),
  },
  SpreadsheetApp: {
    openById: (id) => {
      assert.equal(id, "test-sheet");
      return {
        getSheetByName: (n) => tabs.get(n) || null,
        insertSheet: (n) => {
          const t = makeTab();
          tabs.set(n, t);
          return t;
        },
      };
    },
  },
  CacheService: {
    getScriptCache: () => ({
      get: (k) => cache.get(k),
      put: (k, v) => cache.set(k, v),
      remove: (k) => cache.delete(k),
    }),
  },
  LockService: {
    getScriptLock: () => ({
      waitLock: () => {
        assert.equal(locked, false);
        locked = true;
      },
      releaseLock: () => {
        locked = false;
      },
    }),
  },
  ContentService: {
    MimeType: { JSON: "json" },
    createTextOutput: (s) => ({
      text: s,
      setMimeType() {
        return this;
      },
    }),
  },
  Utilities: {
    DigestAlgorithm: { SHA_256: "sha256" },
    Charset: { UTF_8: "utf8" },
    getUuid: randomUUID,
    computeDigest: (_a, v) => [...createHash("sha256").update(v).digest()],
  },
});
runInContext(
  readFileSync(new URL("../apps-script/Code.gs", import.meta.url), "utf8"),
  context,
);
function gas(data) {
  return JSON.parse(
    context.doPost({ postData: { contents: JSON.stringify(data) } }).text,
  );
}
before(async () => {
  Object.assign(process.env, {
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/test-deployment/exec",
    APPS_SCRIPT_SECRET: secret,
    ADMIN_EMAILS: "admin@example.com",
    SESSION_SECRET: "test-secret-of-more-than-32-characters",
  });
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  delete process.env.GOOGLE_PRIVATE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  globalThis.fetch = async (url, opts) => {
    if (new URL(url).hostname !== "script.google.com")
      return realFetch(url, opts);
    assert.equal(opts.method, "POST");
    assert.equal(opts.redirect, "follow");
    return Response.json(gas(JSON.parse(opts.body)));
  };
  const routes = {
    "/api/auth": auth,
    "/api/admin": admin,
    "/api/content": content,
    "/api/enquiries": enquiries,
    "/api/config": config,
  };
  server = createServer((req, res) => routes[req.url](req, res));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  process.env.APP_ORIGIN = base;
});
after(async () => {
  globalThis.fetch = realFetch;
  await new Promise((resolve) => server.close(resolve));
});
let cookie;
async function call(
  path,
  { data, authorized = false, method = data ? "POST" : "GET" } = {},
) {
  return realFetch(base + path, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(authorized ? { Cookie: cookie } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}
test("Apps Script rejects unauthenticated reads/writes and never reveals secrets in health response", () => {
  assert.equal(gas({ action: "read", tab: "Content" }).status, 403);
  assert.equal(gas({ action: "initialize", secret: "wrong" }).status, 403);
  const health = context.doGet().text;
  assert.doesNotMatch(health, new RegExp(secret));
  assert.doesNotMatch(health, /PASSWORD|SHEET_ID/);
  assert.equal(tabs.size, 0);
});
test("Apps Script adapter verifies deployment URL and handles non-JSON access errors", async () => {
  const old = process.env.APPS_SCRIPT_URL;
  process.env.APPS_SCRIPT_URL = "https://attacker.example/exec";
  await assert.rejects(() => scriptRequest("status"), /deployed Apps Script/);
  process.env.APPS_SCRIPT_URL = old;
  const f = globalThis.fetch;
  globalThis.fetch = async () => new Response("<html>Login required</html>");
  await assert.rejects(() => scriptRequest("status"), /did not return JSON/);
  globalThis.fetch = f;
});
test("password sign-in works through real HTTP handler and Apps Script without Google credentials", async () => {
  const conf = await (await call("/api/auth")).json();
  assert.equal(conf.loginMethod, "password");
  assert.equal(conf.configured, true);
  assert.equal((await call("/api/admin")).status, 401);
  assert.equal(
    (
      await call("/api/auth", {
        data: { email: "admin@example.com", password: "bad" },
      })
    ).status,
    401,
  );
  const response = await call("/api/auth", {
    data: { email: "admin@example.com", password },
  });
  assert.equal(response.status, 200);
  cookie = response.headers.get("set-cookie").split(";")[0];
  assert.match(response.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
  assert.equal(
    (await (await call("/api/auth", { authorized: true })).json()).user,
    "admin@example.com",
  );
});
test("Apps Script initialization is repeatable and publishing reaches the public API", async () => {
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "initialize" },
      })
    ).status,
    200,
  );
  const count = tabs.get("Content").cells.length;
  assert.equal(
    (
      await call("/api/admin", {
        authorized: true,
        data: { action: "initialize" },
      })
    ).status,
    200,
  );
  assert.equal(tabs.get("Content").cells.length, count);
  const record = {
    id: "apps-script-article",
    title: "Saved through Apps Script",
    status: "draft",
    contentHtml: "<h2>Published HTML</h2><script>bad()</script>",
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
  record.status = "published";
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
  const b = data.blogs.find((b) => b.id === record.id);
  assert.equal(b.title, record.title);
  assert.equal(b.contentHtml, "<h2>Published HTML</h2>");
});
test("enquiries use Apps Script submission limits with no CAPTCHA keys and remain private", async () => {
  const conf = await (await call("/api/config")).json();
  assert.equal(conf.protection, "rate-limit");
  const data = {
    name: "Client",
    email: "client@example.com",
    phone: "+91 9876543210",
    message: "Help with tax filings.",
    consent: true,
  };
  for (let i = 0; i < 3; i++)
    assert.equal((await call("/api/enquiries", { data })).status, 200);
  assert.equal((await call("/api/enquiries", { data })).status, 429);
  assert.equal(tabs.get("Enquiries").cells.length, 3);
  const publicData = await (await call("/api/content")).json();
  assert.equal(publicData.enquiries, undefined);
  const privateData = await (
    await call("/api/admin", { authorized: true })
  ).json();
  assert.equal(privateData.enquiries.length, 3);
});
test("Apps Script throttles repeated password failures and blocks invalid tabs", () => {
  for (let i = 0; i < 8; i++)
    assert.equal(
      gas({
        secret,
        action: "login",
        email: "admin@example.com",
        password: "bad",
        rateKey: "b".repeat(64),
      }).status,
      401,
    );
  assert.equal(
    gas({
      secret,
      action: "login",
      email: "admin@example.com",
      password,
      rateKey: "b".repeat(64),
    }).status,
    429,
  );
  assert.equal(gas({ secret, action: "read", tab: "Unrelated" }).status, 400);
});
