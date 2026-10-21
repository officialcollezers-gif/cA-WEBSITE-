import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
function localApi() {
  return {
    name: "local-serverless-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, "http://localhost").pathname;
        if (!pathname.startsWith("/api/")) return next();
        const routes = ["auth", "content", "admin", "enquiries", "config"];
        const name = pathname.slice(5);
        if (!routes.includes(name)) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        try {
          const module = await server.ssrLoadModule(`/api/${name}.js`);
          await module.default(req, res);
        } catch (e) {
          server.ssrFixStacktrace(e);
          console.error(e.message);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({ error: "Local API failed. Check the terminal." }),
          );
        }
      });
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Only explicitly named server configuration is passed to Node. Vite exposes
  // only VITE_ variables to browser code; credentials must never use that prefix.
  for (const key of [
    "APPS_SCRIPT_URL",
    "APPS_SCRIPT_SECRET",
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_CLIENT_ID",
    "ADMIN_EMAILS",
    "SESSION_SECRET",
    "APP_ORIGIN",
    "PUBLIC_SITE_ORIGIN",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
  ])
    if (env[key] !== undefined) process.env[key] = env[key];
  return { plugins: [react(), localApi()] };
});
