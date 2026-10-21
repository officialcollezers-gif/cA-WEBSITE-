# FinCore Advisors

React/Vite website with a Google Sheets content backend, Google-authenticated
admin at `/admin`, Vercel serverless APIs and protected enquiry forms.

Start with [SETUP.md](SETUP.md) for Google Sheet access, admin sign-in, environment
variables, local development and Vercel deployment. Private credentials belong
only in server environment settings.

```sh
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` only if a local configuration does not already
exist, then configure the required values. Without Google configuration, public
pages show the starter content and admin editing stays unavailable.

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

For separate public frontend and admin links sharing one Google Sheet, use
[DEPLOYMENT.md](DEPLOYMENT.md). Deploy the same source as two Vercel projects;
keep Google credentials only on the admin project.
