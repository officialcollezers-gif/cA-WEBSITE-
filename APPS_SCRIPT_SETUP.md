# Connect your Sheet using Apps Script

This is the recommended setup. You do **not** need Google Cloud Console, a
service account, a private key, or a Google OAuth client. Your two Vercel projects
and private Google Sheet stay in use.

- Public website: https://c-a-website-virid.vercel.app/
- Admin panel: https://c-a-website-admin.vercel.app/
- Sheet: https://docs.google.com/spreadsheets/d/16xL2e0SeGBlLNrYYFS3J5HIcuwX8fHihoaavW-zqGUQ/edit

## One-time work in your Google account

1. Open the Sheet as its owner (or an editor permitted to create its bound script).
2. Choose **Extensions → Apps Script**.
3. In a new script project, replace the example `myFunction` in `Code.gs` with
   the complete contents of this repository's [apps-script/Code.gs](apps-script/Code.gs).
   If your Sheet already has a working script, preserve it and check for existing
   `doGet`, `doPost` or other function name conflicts before adding this code.
4. Save. Select **setupWebsite** from the function dropdown and click **Run**.
5. Review Google's permission request and authorize your own script. It needs
   spreadsheet access and permission to display its setup dialog. This is normal
   Apps Script authorization; no Google Cloud project configuration is required.
6. Return to the Sheet for the setup dialog. Enter your admin email. Use the same
   email saved in the admin project's Vercel `ADMIN_EMAILS` (currently expected
   to be `Officialcollezers@gmail.com`, compared case-insensitively).
7. The Sheet displays a **connection secret** and a generated **admin password**.
   Save the password in your password manager. Keep both values private; do not
   put them in chat, source code, logs, or spreadsheet cells.
8. Return to the Apps Script editor. Choose **Deploy → New deployment → Web app**.
   Set **Execute as: Me**, **Who has access: Anyone**, then click **Deploy**.
   If a Workspace policy does not offer Anyone, an administrator must allow it
   or another backend arrangement is required. Do not weaken organization policy
   through workarounds.
9. Copy the **Web app URL** ending in `/exec`. The test URL ending in `/dev` is
   not suitable for production. The deployment URL itself may be shared in chat.

The web app runs as you, so it can access the private Sheet. Every data operation
requires the private connection secret. The public health response does not
return spreadsheet contents, IDs, passwords, or connection secrets.

## Add just two connection values in Vercel

In the **c-a-website-admin** Vercel project, open **Settings → Environment Variables**:

| Name | Value | Target |
| --- | --- | --- |
| `APPS_SCRIPT_URL` | Web app `/exec` URL | Production |
| `APPS_SCRIPT_SECRET` | Secret shown by `setupWebsite` | Production |

Use encrypted/sensitive settings for the secret. Do not prefix it with `VITE_`.
Do not add these fields as requirements to the Codex cloud environment. They
belong on the admin project's server only. The public frontend needs no secrets.

The existing Vercel settings `SESSION_SECRET`, `ADMIN_EMAILS`, `APP_ORIGIN`,
`PUBLIC_SITE_ORIGIN` and public URL/build mode variables remain in place.
No admin password environment variable is required: Apps Script verifies it.

Redeploy the **admin project** after adding the two values. If an assistant already
has authorized Vercel access, it can handle the redeployment once you share the
public `/exec` URL and confirm the private secret was saved in Vercel.

## Start editing

1. Open the admin link and enter the email and generated password.
2. Click **Initialize Google Sheet** once. The app creates Content and Enquiries
   tabs and imports the existing starter website content. Repeat initialization
   preserves existing content records. Use a dedicated Sheet if unrelated tabs
   already have those names.
3. Edit an article or service, choose Published, and save.
4. Open the public website; changes refresh within roughly one minute.
5. Submit an enquiry and check that it appears in admin only.

HTML is sanitized on the Vercel server and again in the browser. The browser
never receives the Apps Script secret, raw password hash, or private enquiry list
from the public content endpoint. No user-facing JavaScript, API key, or Sheet
sharing change can substitute for the server-side connection secret.

## Enquiry protection without another account

In Apps Script mode, no Turnstile/Cloudflare keys are required. The Vercel API
validates fields, contact consent and origin, then Apps Script enforces persistent
submission limits under a script lock: three requests per IP hash in ten minutes,
three per email hash per hour, and 100 accepted submissions per UTC day. Only
salted/HMAC-derived identifiers are stored for throttling. Existing optional
Turnstile settings, if configured, take precedence. A failed or limited submission
shows an error and does not claim to have been saved.

These limits reduce stored spam; they are not a bot-detection service and cannot
prevent all abuse or requests from consuming Apps Script quotas. Apps Script has
execution and service quotas and is suitable for this small content website.

## Passwords, secrets and updates

- The password is a high-entropy generated value, not a weak human password. Only
  a salted digest is stored in Script Properties. Login attempts are throttled.
- To reset it, select **resetAdminPassword** in Apps Script and Run. Existing
  signed admin sessions expire within eight hours. For immediate revocation,
  rotate the admin server's `SESSION_SECRET` in Vercel and redeploy as well.
- To see the connection secret again, run **showConnectionSecret** as a Sheet editor.
- Changing Script Properties applies immediately. Editing script code requires
  **Deploy → Manage deployments → Edit → New version → Deploy** so the same `/exec`
  URL serves the new version.
- Preserve your other Sheet tabs and scripts. Do not manually edit the JSON rows
  in Content or Enquiries. Back up and archive old history as described below.

## Storage and scope

Content is an append-only history in columns A–E: kind, ID, JSON, timestamp,
editor. The last record for each kind/ID wins; deletions append a tombstone.
Enquiries stores ID, timestamp and JSON. Script Properties stores connection/auth
configuration and bounded rate-limit data; credentials are not written to cells.
The script serializes Sheet writes with LockService. Initialization adds missing
tabs only. Content records are limited to 45,000 serialized characters.

The editor manages blogs, service categories and individual services, optional
HTML bodies, site contact/home heading fields, and custom pages. Decorative layout,
static testimonials and unexposed React copy remain in source. Images use external
HTTPS URLs; file uploads are not stored in Sheets. Concurrent editor saves use
last-write-wins. Periodically archive old history while retaining the latest
record for each ID, including deletion tombstones. A large history, high write
volume or complex transactions calls for a database.

## Local development and verification

Use Node 22.12+ and run `npm ci`. Preserve any existing `.env.local`; add the two
Apps Script values privately only if live local testing is required. Set local
`APP_ORIGIN` and other existing server settings as documented in `.env.example`.
Run `npm run dev`; Vite serves the real API handlers locally. Do not commit local
secret files or generate browser variables from private configuration.

Run `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`.
The Apps Script tests execute the actual Code.gs in a mock Google runtime,
including the real adapter, HTTP auth, initialization, publishing, enquiry limits
and secret checks. They do not prove a live Google deployment works. Live readiness
requires successful sign-in, a saved/published edit and a private enquiry through
the deployed `/exec` URL after the one-time setup above.

Server egress requires `script.google.com` and `script.googleusercontent.com`
(Apps Script redirects) in addition to Vercel and the two website domains.
