# Two links, one private Google Sheet

Deploy this same GitHub repository as **two Vercel projects**. One project serves
only the public website, and the other opens directly to the admin sign-in panel.
The admin project also hosts the serverless content/enquiry API. There is no
separate rented server. Google credentials belong only in the admin project.

## Admin project

Import `officialcollezers-gif/cA-WEBSITE-`, project root `.`, Vite framework, build
`npm run build`, output `dist`. Choose an available project name (for example
`fincore-admin`; actual Vercel URLs depend on availability and your account).

Add these environment variables:

| Variable | Value |
| --- | --- |
| `VITE_APP_MODE` | `admin` |
| `VITE_PUBLIC_SITE_URL` | Exact public website HTTPS origin |
| `APP_ORIGIN` | Exact admin deployment HTTPS origin |
| `PUBLIC_SITE_ORIGIN` | Exact public website HTTPS origin |
| `GOOGLE_SHEET_ID` | `16xL2e0SeGBlLNrYYFS3J5HIcuwX8fHihoaavW-zqGUQ` |
| `ADMIN_EMAILS` | `pranjal.geduconnect@gmail.com` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account `client_email` |
| `GOOGLE_PRIVATE_KEY` | Service account `private_key`, entered securely |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `SESSION_SECRET` | Private random value of at least 32 characters |
| `TURNSTILE_SITE_KEY` | Public Turnstile widget key |
| `TURNSTILE_SECRET_KEY` | Private Turnstile verification key |

No `VITE_API_BASE_URL` is needed on this project: admin API requests are same-origin.
Authorize the **admin** HTTPS origin in Google OAuth's JavaScript origins. Share
the Sheet with the service account as Editor. The Turnstile widget must allow the
**public** website hostname. See SETUP.md for Google/Turnstile creation steps.

## Public frontend project

Import the same repository as a second Vercel project with the same build settings.
Set only these public configuration variables (no Google credentials):

| Variable | Value |
| --- | --- |
| `VITE_APP_MODE` | `public` |
| `VITE_API_BASE_URL` | Exact admin deployment HTTPS origin, no trailing slash |
| `VITE_ADMIN_URL` | Exact admin deployment HTTPS origin |

Browser requests for public content, form configuration and enquiry submission
now go to the admin project's API. They carry no admin cookie across origins.
The API allows only the configured public origin; admin mutations and Google
sign-in still accept only the admin origin. Do not set a wildcard CORS origin.

Vercel assigns the actual deployment URLs. After both projects exist, update the
variables with their stable production origins and redeploy **both projects**.
`VITE_` values are compiled into the browser bundle, so they require a rebuild.
Never set secrets using a `VITE_` prefix.

## Activate and verify

1. Open the admin link (its root directly displays the admin panel).
2. Sign in as `pranjal.geduconnect@gmail.com` and initialize the Sheet once.
3. Publish a test article and confirm it appears on the other frontend link.
4. Save a draft and confirm it is absent from public content responses.
5. Submit an enquiry from the public site and check its private admin listing.

Use the production origins for validation, not changing preview URLs. Later, the
same two projects can use `yourdomain.com` and `admin.yourdomain.com`; update the
Google authorized origin, Turnstile hostname and all origin/URL variables, then
redeploy. Keeping the default `VITE_APP_MODE=combined` preserves the original
single-deployment arrangement for local development.

## Access needed for an automated deployment

This workspace needs authorized Vercel API/CLI access (such as a scoped
`VERCEL_TOKEN`) plus the Google configuration above. A login in the Codex browser
panel is not automatically available to shell commands or API tools. Do not paste
private tokens, passwords, service account keys or browser cookies into chat.
Keep them in secure environment settings. Public repository access alone does
not establish Vercel or Google permissions.
