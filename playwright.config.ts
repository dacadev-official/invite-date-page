import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Ver docs/PRD.md §4 "Verificación" — proyectos: Desktop Chrome, iPhone 13
 * (mouse vs. touch para el botón evasivo) y un proyecto con reducedMotion
 * para confirmar que el flujo completo funciona sin animaciones.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: !!process.env.CI,
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    {
      // `reducedMotion` no está entre las PlaywrightTestOptions "planas";
      // en esta versión de @playwright/test viaja dentro de contextOptions.
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } },
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    port: process.env.CI ? 4173 : 5173,
    reuseExistingServer: !process.env.CI,
  },
})
