import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'security.spec.ts', workers: 1, timeout: 45000,
  use: { baseURL: process.env.SECURITY_BASE_URL || 'http://127.0.0.1:5175', viewport: { width: 1440, height: 900 } },
  webServer: process.env.SECURITY_BASE_URL ? undefined : {
    command: 'node scripts/security-preview.mjs', url: 'http://127.0.0.1:5175', reuseExistingServer: false,
  },
});
