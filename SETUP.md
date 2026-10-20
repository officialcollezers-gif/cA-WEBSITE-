# FinCore website and Google Sheets admin

The public website and `/admin` are one React/Vite deployment. Vercel runs the
`api/` functions on demand. You do not need to rent or maintain a server.
The Google Sheet stays private. Browser code never receives its credentials.

## 1. Give the server permission to use your Sheet

The selected spreadsheet ID is already in `.env.example`:
`1IFPwHwq65K-VrWgJ5iEWUhWfhXUOaINGfZ_kr3d8zp0`.

1. In Google Cloud Console, create or select a project.
2. Enable **Google Sheets API** in that project.
3. Create a service account. It does not need project-wide Owner or Editor roles.
4. Create a JSON key for the service account. Keep this file private and outside
   the repository. Copy only the needed fields into secure server environment
   settings; never upload the JSON key to the frontend or commit it.
5. Open your Google Sheet and share it with the JSON key's `client_email`, giving
   that service account **Editor** access. This is different from your admin email.
   Do not publish the spreadsheet to the web or enable public editing.
6. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` to `client_email` and `GOOGLE_PRIVATE_KEY`
   to `private_key`. Actual multiline keys and keys with literal `\n` both work.

The existing Sheet link alone is not authentication. No live read or write has
been verified until the service account is configured and the connection tested.

## 2. Configure administrator Google sign-in

1. In the same Google Cloud project, configure the OAuth consent/branding screen.
2. Create an OAuth client ID with application type **Web application**.
3. Add your exact website origin under **Authorized JavaScript origins**:
   - `http://localhost:5173` for local development.
   - Your production Vercel origin and, when purchased, `https://yourdomain.com`.
   Origins have no trailing paths. This integration uses Google Identity Services
   ID tokens, so it does not need a client secret or redirect handler.
4. If the Google app is in testing mode, add your administrator account as a test
   user. Complete any Google requirements before opening it to additional users.
5. Set `GOOGLE_CLIENT_ID` to that client ID.
6. Set `ADMIN_EMAILS=pranjal.geduconnect@gmail.com`. Additional administrators
   may be added as comma-separated email addresses. Only Google-verified emails
   matching this list can create an admin session.
7. Generate a random secret of at least 32 characters (for example, locally run
   `openssl rand -hex 32`) and store it as `SESSION_SECRET` in secure settings.
8. Set `APP_ORIGIN` to the exact origin the browser uses. Production requires
   HTTPS. Requests from other origins are rejected. Changing from the Vercel
   URL to your custom domain requires updating this setting and Google origins.

Sessions use signed HttpOnly cookies, SameSite=Strict and Secure on HTTPS.
They expire after eight hours. Removing an address from `ADMIN_EMAILS` removes
that user's access; rotating `SESSION_SECRET` invalidates all sessions.

## 3. Protect public enquiry forms

Create a **Cloudflare Turnstile** widget for your website's hostnames. Set:

- `TURNSTILE_SITE_KEY`: the widget's public site key.
- `TURNSTILE_SECRET_KEY`: its private server verification key.

Both contact forms submit through `/api/enquiries`. The server requires valid
fields, explicit contact consent, a same-origin JSON request, and a verified
Turnstile token with a matching hostname. Submissions remain unavailable when
these keys are missing. Add hostnames to the Turnstile widget when changing domains.
Do not use test keys in production.

## 4. Run locally

Use Node.js 22.12+ (validated with Node 24) and npm.

```sh
cd /workspace/Codex
npm ci
```

Copy `.env.example` to `.env.local` only if you do not already have a local config.
The provided local file contains only the Sheet ID, admin email and local origin.
Fill in the remaining fields privately. `.env.local` is ignored by Git. Never
prefix private configuration with `VITE_`: that would expose it to browser code.
Restart Vite after changing server configuration.

```sh
npm run dev -- --host 0.0.0.0
```

Use the origin configured in `APP_ORIGIN` for sign-in and write operations.
Vite serves real `api/` handlers through local middleware; frontend-only
`npm run preview` does not run those handlers. There is no fake admin password
or authentication bypass in the application.

When no Google credentials are configured, public pages show starter content.
When Google is configured but unavailable, the public site reports a loading
failure and shows the last loaded version, or starter content on a fresh visit.
The admin always shows the connection error and cannot claim an unsuccessful save.

## 5. Initialize and edit

1. Visit `/admin` and sign in using `pranjal.geduconnect@gmail.com`.
2. Click **Initialize Google Sheet**. This adds `Content` and `Enquiries` tabs and
   imports six categories, 36 services, six sample articles, three draft pages
   and the business settings. Existing records are not overwritten on re-import.
3. Edit business/contact details and homepage title in **Site settings**.
4. In **Services**, edit a category, then its individual services, documents,
   inclusions, FAQs and optional HTML content. Save the category to persist changes.
5. In **Articles**, create or edit an article, preview HTML, select Draft or
   Published, then save. Published articles appear at `/blogs/<slug>`.
6. In **Pages**, publish `about`, `privacy-policy` or `terms` to replace those
   existing pages. Other pages are available at `/pages/<slug>`; link them from
   your content as needed. Their links are not automatically added to the navbar.
7. Check **Enquiries** for successfully saved form submissions.

The admin manages the content fields above. Decorative layout, animation copy,
static testimonials and other unexposed design text remain in React components.
This is a content editor, not a drag-and-drop layout builder.

Allowed HTML includes text, headings, lists, tables, links and HTTPS images.
The server sanitizes stored HTML; the browser sanitizes again before rendering.
Scripts, arbitrary JavaScript, inline event handlers, forms and unsafe links
are not supported. Upload images to your preferred image host and paste HTTPS
URLs; this project does not upload files to Google Sheets.

Content is cached in each API instance for 20 seconds and refreshed in an open
public browser every 30 seconds. Published changes generally appear within one
minute; an admin save updates the editor immediately.

## 6. Deploy on Vercel

1. Push this project to your GitHub repository and import it in Vercel, or deploy
   with your existing authorized Vercel workflow. Select the project root as the
   root directory. The repository includes build and routing settings in
   `vercel.json`.
2. Use `npm run build`, output directory `dist`, and Node.js 22 or newer.
3. Add every variable from `.env.example` in **Vercel → Project → Settings →
   Environment Variables**. Enter private values there, not in chat or source.
4. Set `APP_ORIGIN` to your deployed HTTPS origin. Do not keep localhost in
   production. Use separate origins/settings for preview environments as needed.
5. Redeploy after setting variables. Updating environment settings alone does
   not update an existing deployment.
6. Sign in, initialize, publish a test article, and verify it on the public site.
   Then submit an enquiry and verify it appears only in the admin and Sheet.
7. When you buy your domain, attach it to this Vercel project and update DNS as
   Vercel instructs. Update `APP_ORIGIN`, Google authorized origins and Turnstile
   hostnames. Both `/admin` and the public frontend use that single domain.

Existing metadata in `index.html` still contains example.com social/structured
URLs from the supplied project. Replace those with the real domain before launch.
No live Vercel deployment, DNS change or Google Sheet initialization is performed
by installing this source code.

## Storage and limits

`Content` stores an append-only history: kind, ID, JSON value, updated time, editor
email (columns A–E). The last row for a kind/ID wins. Deletions add a tombstone.
`Enquiries` stores ID, timestamp and a JSON record in columns A–C. Cells are written
using Google Sheets `RAW` mode to avoid evaluating submitted content as formulas.
Do not rename these tabs or edit their stored JSON manually. Use separate tabs
for unrelated data; use a dedicated Sheet if existing tabs have these names.

This suits a small content website with one primary editor. Concurrent edits use
last-write-wins; there is no transactional conflict resolution. Repeated content
history and enquiries grow over time; back up the Sheet and periodically archive
old history, retaining the latest row for every content record, including deletion
tombstones. The app reads these tabs into memory, so a large history requires
archiving or moving to a database. Google imposes request quotas and per-cell
limits; a content record is limited to 45,000 serialized characters. Large article
bodies or service categories should be split. Serverless hosting also has plan
and usage limits. These services are not an unlimited free database.

For runtime egress, the server needs `sheets.googleapis.com`,
`oauth2.googleapis.com`, `www.googleapis.com` (Google signing certificates),
`challenges.cloudflare.com`, and the npm registry during installation.
The browser also loads Google sign-in, Turnstile, existing Google Fonts and
Unsplash images. Keep TLS and package integrity checks enabled.

## Validation

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

API tests mock only external Google and Turnstile responses and exercise real
HTTP handlers, auth cookies, allowlists, initialization, draft/public filtering,
HTML sanitization, service edits, validation, enquiry privacy and write failures.
Browser tests cover real public routes and admin editing using controlled API
responses. These tests do not replace the live Google/Vercel checks in step 6.
Playwright uses `/usr/bin/chromium` by default; set `CHROMIUM_PATH` to an installed
Chromium executable on another machine. No browser download is needed here.
