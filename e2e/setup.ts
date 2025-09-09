import { test as base, expect } from '@playwright/test'

// Extend the base test to setup MSW.
// This new `test` object will be used in all our E2E tests.
export const test = base.extend({
  page: async ({ page }, run) => {
    // We are adding an init script to run on the page before any other script.
    // This script will start the MSW service worker.
    await page.addInitScript(async () => {
      const { worker } = await import('../src/mocks/browser')
      // Start the worker with quiet option to avoid excessive console logs.
      await worker.start({ quiet: true })
    })
    await run(page)
  },
})

export { expect }
