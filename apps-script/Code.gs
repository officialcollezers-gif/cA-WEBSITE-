/**
 * CA Website private Sheets bridge. Paste into a script bound to your Sheet.
 * Run setupWebsite() once, then deploy as a web app (Execute as: Me; Access: Anyone).
 * Never paste the generated connection secret or admin password into chat/GitHub.
 */
function setupWebsite() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!sheet)
    throw new Error("Open your Google Sheet, then Extensions > Apps Script.");
  var ui = SpreadsheetApp.getUi();
  var prompt = ui.prompt(
    "Website administrator",
    "Enter the admin email used in Vercel ADMIN_EMAILS (for example Officialcollezers@gmail.com).",
    ui.ButtonSet.OK_CANCEL,
  );
  if (prompt.getSelectedButton() !== ui.Button.OK) return;
  var email = prompt.getResponseText().trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter a valid administrator email.");
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty("PASSWORD_HASH"))
    throw new Error(
      "Already configured. Run showConnectionSecret() to view the bridge key or resetAdminPassword() to reset the password.",
    );
  var secret = randomSecret_();
  var password = randomSecret_();
  var salt = randomSecret_();
  props.setProperties({
    SHEET_ID: sheet.getId(),
    BRIDGE_SECRET: secret,
    ADMIN_EMAIL: email,
    PASSWORD_SALT: salt,
    PASSWORD_HASH: digest_(salt + ":" + password),
  });
  showValues_("Website connection ready", [
    ["APPS_SCRIPT_SECRET — add securely in Vercel", secret],
    ["Admin email", email],
    ["Admin password — save in your password manager", password],
  ]);
}
function showConnectionSecret() {
  var secret =
    PropertiesService.getScriptProperties().getProperty("BRIDGE_SECRET");
  if (!secret) throw new Error("Run setupWebsite() first.");
  showValues_("Website connection secret", [
    ["APPS_SCRIPT_SECRET — add securely in Vercel", secret],
  ]);
}
function resetAdminPassword() {
  var ui = SpreadsheetApp.getUi();
  if (
    ui.alert(
      "Reset admin password?",
      "This generates a new random password. Existing admin sessions expire within eight hours.",
      ui.ButtonSet.YES_NO,
    ) !== ui.Button.YES
  )
    return;
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("BRIDGE_SECRET"))
    throw new Error("Run setupWebsite() first.");
  var password = randomSecret_();
  var salt = randomSecret_();
  props.setProperties({
    PASSWORD_SALT: salt,
    PASSWORD_HASH: digest_(salt + ":" + password),
  });
  CacheService.getScriptCache().remove(
    "email-login:" + digest_(props.getProperty("ADMIN_EMAIL")),
  );
  showValues_("New admin password", [
    ["Admin password — save privately", password],
  ]);
}
function randomSecret_() {
  return (
    Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "")
  );
}
function digest_(value) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8,
  )
    .map(function (b) {
      return ("0" + ((b + 256) % 256).toString(16)).slice(-2);
    })
    .join("");
}
function equal_(a, b) {
  a = String(a || "");
  b = String(b || "");
  var diff = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++)
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
function showValues_(title, values) {
  var escape = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
  var html =
    '<div style="font:14px Arial;padding:20px"><p>Keep these values private. They are not written to your spreadsheet or logs.</p>' +
    values
      .map(function (v) {
        return (
          "<p><b>" +
          escape(v[0]) +
          '</b></p><input readonly style="width:100%;padding:10px;box-sizing:border-box" value="' +
          escape(v[1]) +
          '" onclick="this.select()">'
        );
      })
      .join("") +
    "<p>Your Sheet stays private. Only the Vercel server uses the connection secret.</p></div>";
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(650).setHeight(420),
    title,
  );
}
function response_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function doGet() {
  return response_({
    ok: true,
    service: "CA Website Apps Script bridge",
    version: 1,
  });
}
function doPost(e) {
  try {
    if (
      !e ||
      !e.postData ||
      !e.postData.contents ||
      e.postData.contents.length > 180000
    )
      return response_({ ok: false, status: 400, error: "Invalid request." });
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (_) {
      return response_({ ok: false, status: 400, error: "Invalid JSON." });
    }
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty("BRIDGE_SECRET");
    if (!secret || !equal_(data.secret, secret))
      return response_({
        ok: false,
        status: 403,
        error: "Apps Script connection secret does not match.",
      });
    var sheet = SpreadsheetApp.openById(props.getProperty("SHEET_ID"));
    if (data.action === "status")
      return response_({
        ok: true,
        result: {
          initialized:
            !!sheet.getSheetByName("Content") &&
            !!sheet.getSheetByName("Enquiries"),
        },
      });
    if (data.action === "login")
      return response_({ ok: true, result: login_(data, props) });
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (data.action === "initialize") {
        ["Content", "Enquiries"].forEach(function (t) {
          if (!sheet.getSheetByName(t)) sheet.insertSheet(t);
        });
        return response_({ ok: true, result: {} });
      }
      if (data.action === "enquiry")
        return response_({ ok: true, result: enquiry_(data, sheet, props) });
      if (data.tab !== "Content" && data.tab !== "Enquiries")
        return response_({ ok: false, status: 400, error: "Unknown tab." });
      var tab = sheet.getSheetByName(data.tab);
      if (!tab)
        return response_({
          ok: false,
          status: 409,
          error: "Initialize the Google Sheet first.",
        });
      if (data.action === "read") {
        var count = tab.getLastRow();
        return response_({
          ok: true,
          result: {
            rows: count ? tab.getRange(1, 1, count, 5).getDisplayValues() : [],
          },
        });
      }
      if (data.action === "append") {
        if (
          !Array.isArray(data.values) ||
          !data.values.length ||
          data.values.length > 100
        )
          return response_({ ok: false, status: 400, error: "Invalid rows." });
        var rows = data.values.map(function (row) {
          if (!Array.isArray(row) || row.length > 5)
            throw new Error("Invalid row.");
          return [0, 1, 2, 3, 4].map(function (i) {
            var value = row[i] == null ? "" : String(row[i]);
            if (value.length > 45000) throw new Error("A cell is too large.");
            return value.charAt(0) === "=" ? "'" + value : value;
          });
        });
        tab
          .getRange(tab.getLastRow() + 1, 1, rows.length, 5)
          .setNumberFormat("@")
          .setValues(rows);
        return response_({ ok: true, result: {} });
      }
      return response_({ ok: false, status: 400, error: "Unknown action." });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return response_({
      ok: false,
      status: err.websiteStatus || 502,
      error: err.websiteStatus
        ? err.message
        : "Apps Script operation failed. Check the Sheet and script configuration.",
    });
  }
}
function login_(data, props) {
  var email = String(data.email || "")
    .trim()
    .toLowerCase();
  if (
    typeof data.password !== "string" ||
    data.password.length > 200 ||
    !/^[a-f0-9]{64}$/.test(data.rateKey || "")
  )
    throw Object.assign(new Error("Invalid login request."), {
      websiteStatus: 400,
    });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var cache = CacheService.getScriptCache();
    var key = "ip-login:" + data.rateKey;
    var emailKey = "email-login:" + digest_(email);
    var tries = Number(cache.get(key) || 0);
    var emailTries = Number(cache.get(emailKey) || 0);
    if (tries >= 8 || emailTries >= 30)
      throw Object.assign(
        new Error("Too many attempts. Try again in ten minutes."),
        { websiteStatus: 429 },
      );
    var valid = equal_(
      digest_(props.getProperty("PASSWORD_SALT") + ":" + data.password),
      props.getProperty("PASSWORD_HASH"),
    );
    if (!valid || !equal_(email, props.getProperty("ADMIN_EMAIL"))) {
      cache.put(key, String(tries + 1), 600);
      cache.put(emailKey, String(emailTries + 1), 600);
      throw Object.assign(new Error("Incorrect admin email or password."), {
        websiteStatus: 401,
      });
    }
    cache.remove(key);
    cache.remove(emailKey);
    return { email: email };
  } finally {
    lock.releaseLock();
  }
}

// Persistent submission limits protect Sheet writes without another CAPTCHA account.
// This function runs under the doPost script lock.
function enquiry_(data, sheet, props) {
  var r = data.record;
  if (
    !r ||
    typeof r.name !== "string" ||
    !r.name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email || "") ||
    !/^[+\d\s()-]{10,20}$/.test(r.phone || "") ||
    !r.message ||
    !/^[a-f0-9]{64}$/.test(data.rateKey || "")
  )
    throw Object.assign(new Error("Invalid enquiry."), { websiteStatus: 400 });
  var tab = sheet.getSheetByName("Enquiries");
  if (!tab)
    throw Object.assign(new Error("Initialize the Google Sheet first."), {
      websiteStatus: 409,
    });
  var day = new Date().toISOString().slice(0, 10);
  var state = JSON.parse(props.getProperty("ENQUIRY_LIMITS") || "{}");
  if (state.day !== day) state = { day: day, total: 0, keys: {} };
  var now = Date.now();
  var ipKey = "ip:" + data.rateKey;
  var emailKey = "email:" + digest_(r.email.toLowerCase());
  var ips = (state.keys[ipKey] || []).filter(function (t) {
    return now - t < 600000;
  });
  var emails = (state.keys[emailKey] || []).filter(function (t) {
    return now - t < 3600000;
  });
  if (state.total >= 100 || ips.length >= 3 || emails.length >= 3)
    throw Object.assign(
      new Error(
        "Submission limit reached. Please try again later or contact us directly.",
      ),
      { websiteStatus: 429 },
    );
  var json = JSON.stringify(r);
  if (json.length > 10000)
    throw Object.assign(new Error("Enquiry is too large."), {
      websiteStatus: 400,
    });
  tab
    .getRange(tab.getLastRow() + 1, 1, 1, 5)
    .setNumberFormat("@")
    .setValues([[String(r.id), String(r.createdAt), json, "", ""]]);
  state.total++;
  state.keys[ipKey] = ips.concat([now]);
  state.keys[emailKey] = emails.concat([now]);
  props.setProperty("ENQUIRY_LIMITS", JSON.stringify(state));
  return {};
}
