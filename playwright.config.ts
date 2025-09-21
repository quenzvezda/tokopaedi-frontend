import { defineConfig, devices } from '@playwright/test'

const workersFromEnv = process.env.PLAYWRIGHT_WORKERS
const parsedWorkers =
  workersFromEnv != null ? Number.parseInt(workersFromEnv, 10) : undefined
const workers = Number.isNaN(parsedWorkers) || parsedWorkers == null ? 1 : parsedWorkers

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  workers,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
