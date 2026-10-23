import { defineConfig, devices } from '@playwright/test'

/**
 * Tests de bout en bout de l'interface, avec Playwright (bonus B10, piste du TD11).
 *
 * Ils ne font pas partie de `pnpm verify` : ils demandent une application démarrée et un
 * navigateur, et durent plus d'une minute. Ils s'exécutent séparément, avant une publication,
 * par `pnpm test:e2e` : contre l'application construite et démarrée en mode production, ou
 * contre l'adresse donnée par E2E_BASE_URL (le déploiement de production, par exemple).
 *
 * Le serveur de développement ne convient pas : il compile chaque page à sa première visite
 * et peut recharger la page en cours de test. Le port 3000 doit donc être libre (arrêter
 * `pnpm dev`), car l'authentification n'accepte que l'adresse http://localhost:3000.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Sans adresse imposée, l'application est construite puis démarrée en mode production.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: `${baseURL}/login`,
        reuseExistingServer: false,
        timeout: 300_000,
      },
})
