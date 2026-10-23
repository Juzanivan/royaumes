import { type Browser, expect, type Page, test } from '@playwright/test'

/** Suffixe propre à cette exécution : les comptes créés n'entrent pas en conflit. */
const RUN = Date.now().toString(36)

/** Crée un compte dans un nouveau navigateur, et fonde son village. */
async function newPlayer(browser: Browser, name: string, village: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage()
  await page.goto('/login')
  // Le lien bascule le formulaire en création de compte : le champ du nom apparaît alors.
  await page.getByText('Pas de compte ? En créer un').click()
  await expect(page.locator('input[name=name]')).toBeVisible()
  await page.fill('input[name=name]', name)
  await page.fill('input[name=email]', `${name.toLowerCase()}-${RUN}@example.com`)
  await page.fill('input[name=password]', 'motdepasse-solide')
  await page.getByRole('button', { name: 'Créer mon compte' }).click({ force: true })
  await page.waitForURL('**/village')
  await page.fill('#name', village)
  await page.getByRole('button', { name: 'Fonder' }).click()
  await expect(page.locator('.vmap-scene')).toBeVisible()
  return page
}

test.describe('Caravane', () => {
  test("envoie une caravane d'un village à l'autre, et la suit sur sa vue de profil", async ({
    browser,
  }) => {
    const bobVillage = `Roche-${RUN}`
    const alice = await newPlayer(browser, `Alice${RUN}`, `Valombre-${RUN}`)
    const bob = await newPlayer(browser, `Bob${RUN}`, bobVillage)

    // Alice se rend au relais depuis la carte de son village.
    await alice.getByRole('link', { name: /Relais des caravanes/ }).click()
    await alice.waitForURL('**/caravan')
    // La liste des destinations est tenue par une projection : le village que Bob vient de
    // fonder peut n'y paraître qu'après quelques secondes (README, « Limites actuelles »).
    const option = alice.locator('#caravan-recipient option', { hasText: bobVillage })
    await expect(async () => {
      await alice.reload()
      await expect(option).toHaveCount(1, { timeout: 2_000 })
    }).toPass({ timeout: 45_000 })
    await alice.selectOption('#caravan-recipient', { label: bobVillage })
    await alice.locator('.caravan-amount input').first().fill('40')
    // La jauge de risque suit la cargaison et l'escorte.
    await expect(alice.locator('.caravan-risk-label')).toContainText('%')
    await alice.getByRole('button', { name: 'Envoyer la caravane' }).click()
    await expect(alice.getByText(`La caravane est partie vers ${bobVillage} !`)).toBeVisible()

    // Sa vue de profil présente la route et la barre de progression.
    await alice.getByRole('link', { name: 'Suivre la caravane' }).click()
    await expect(alice.locator('.journey-scene')).toBeVisible()
    await expect(alice.locator('.journey-caption')).toContainText(`En route vers ${bobVillage}`)

    // Bob voit la caravane qu'il attend au relais, et peut la suivre à son tour.
    const expected = bob.locator('.caravans li', { hasText: `De Alice${RUN}` })
    await expect(async () => {
      await bob.goto('/caravan')
      await expect(expected).toContainText('En route', { timeout: 2_000 })
    }).toPass({ timeout: 45_000 })
    await expected.getByRole('link', { name: 'Suivre' }).click()
    await expect(bob.locator('.journey-progress')).toContainText('Votre village')
  })

  test('part en expédition vers la grotte, et la suit sur sa vue de profil', async ({
    browser,
  }) => {
    const page = await newPlayer(browser, `Carol${RUN}`, `Grisval-${RUN}`)
    await page.goto('/caravan')
    const form = page.getByRole('form', { name: 'Expédition vers la grotte' })
    // Sans or, Carol part sans escorte : seules les provisions de bois sont prélevées.
    await form.locator('.caravan-escort').first().click()
    await form.getByRole('button', { name: /Partir en expédition/ }).click()
    await page.waitForURL(/\/caravan\/[^/]+$/)
    await expect(page.locator('.journey-caption')).toContainText(
      'En route vers la Grotte aux Échos',
    )
    // L'expédition figure dans sa liste, sans révéler de butin avant son retour.
    await page.goto('/caravan')
    await expect(page.locator('.caravans li').first()).toContainText(
      'Expédition vers la Grotte aux Échos',
    )
    await expect(page.locator('.caravans li').first()).toContainText('En route')
  })
})
