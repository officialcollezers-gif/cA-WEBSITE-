import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:5173",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  webServer: [
    { command: 'npm run dev -- --host 0.0.0.0', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
    { command: 'npm run dev -- --host 0.0.0.0 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI, env: { VITE_APP_MODE: 'admin', VITE_PUBLIC_SITE_URL: 'http://127.0.0.1:5175', APP_ORIGIN: 'http://127.0.0.1:5174', PUBLIC_SITE_ORIGIN: 'http://127.0.0.1:5175' } },
    { command: 'npm run dev -- --host 0.0.0.0 --port 5175 --strictPort', url: 'http://127.0.0.1:5175', reuseExistingServer: !process.env.CI, env: { VITE_APP_MODE: 'public', VITE_API_BASE_URL: 'http://127.0.0.1:5174', VITE_ADMIN_URL: 'http://127.0.0.1:5174' } },
  ],
});
