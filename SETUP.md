# Website setup

Use [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md) to connect your private Google
Sheet using Google Apps Script. No Google Cloud project, service account key or
OAuth client is needed for this route.

The public frontend and separate admin panel are already Vercel projects. Their
URLs and build modes are described in [DEPLOYMENT.md](DEPLOYMENT.md). Keep private
backend configuration only on the admin project's server.

```sh
npm ci
npm run dev
```

Preserve existing local configuration. Without a configured backend, public pages
show starter content and admin editing is unavailable. Never use dummy credentials
or disable authentication to bypass setup.

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```
