import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "dubnov-quick-payment.spec.ts",
  timeout: 90000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3012", trace: "off", screenshot: "off", video: "off" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: [
    { command: "node tests/fixtures/quick-payment-server.cjs", url: "http://127.0.0.1:4012/ready", reuseExistingServer: false, timeout: 30000 },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3012",
      url: "http://127.0.0.1:3012",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NODE_OPTIONS: (process.env.NODE_OPTIONS || "") + " --require ./tests/fixtures/quick-payment-fetch.cjs",
        KV_REST_API_URL: "http://127.0.0.1:4012",
        KV_REST_API_TOKEN: "fixture-only",
        GROW_API_ORIGIN: "https://sandboxapi.grow.link",
        GROW_PAYMENT_MODE: "sandbox",
        GROW_CALLBACK_ORIGIN: "https://quick-payment-tests.example.test",
        GROW_USER_ID: "fixture-user-id",
        GROW_PAGE_CODE: "fixture-page-code",
        GROW_VAT_TYPE: "3",
        GROW_QUICK_PAYMENT_ENABLED: "true",
        ADMIN_USERNAME: "fixture-admin",
        ADMIN_PASSWORD: "fixture-password",
        ADMIN_SESSION_SECRET: "fixture-only-32-character-session-secret"
      }
    }
  ]
});
