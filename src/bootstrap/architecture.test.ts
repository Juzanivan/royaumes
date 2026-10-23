import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { createTestDatabase } from '@/platform/db/client'

/** Répertoires des modules métier. */
const MODULES = readdirSync(path.join(process.cwd(), 'src/modules'))

/**
 * Fonctions d'aptitude (TD11) : des règles d'architecture que dependency-cruiser ne peut pas
 * vérifier, parce qu'elles ne portent pas sur les importations, sont vérifiées par des tests.
 */
describe("Fonctions d'aptitude", () => {
  it("range chaque table dans le schéma d'une brique de la plateforme ou d'un module", async () => {
    const db = await createTestDatabase()
    const result = await db.execute(sql`
      SELECT DISTINCT table_schema FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'drizzle')`)
    const schemas = (result as unknown as { rows: { table_schema: string }[] }).rows.map(
      (row) => row.table_schema,
    )

    // Aucune table dans le schéma public, et chaque schéma correspond à un propriétaire connu.
    const owners = ['platform', 'identity', ...MODULES]
    expect(schemas).not.toContain('public')
    for (const schema of schemas) expect(owners).toContain(schema)
  })

  it('déclare les données personnelles de chaque module qui conserve des données', () => {
    // Le module system ne conserve aucune donnée ; tous les autres doivent participer
    // aux droits des joueurs (TD10).
    const withData = MODULES.filter((module) => module !== 'system')
    for (const module of withData) {
      const file = path.join(process.cwd(), 'src/modules', module, 'personal-data.ts')
      expect(existsSync(file), `${module} n'a pas de fichier personal-data.ts`).toBe(true)
    }
  })

  it("ne fait sortir la graine d'une caravane ni du domaine, ni du journal", () => {
    // Évaluation finale, bonus B8 : la graine décide de l'issue d'un voyage (ADR 0012). Hors du
    // domaine, seul le service la tire au sort, à l'envoi ; aucune vue, aucune table, aucun
    // contrat, aucune route ni aucun écran n'en parle.
    const root = path.join(process.cwd(), 'src/modules/caravan')
    const files = readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(
      (file) =>
        /\.tsx?$/.test(file) && !file.startsWith(`domain${path.sep}`) && !file.includes('.test.'),
    )
    for (const file of files) {
      const lines = readFileSync(path.join(root, file), 'utf8')
        .split('\n')
        .filter((line) => /seed/i.test(line) && !line.trim().startsWith('//'))
      const allowed = (line: string) => /seed: newSeed\(\)|newSeed/.test(line)
      expect(
        lines.filter((line) => !allowed(line)),
        `${file} manipule la graine`,
      ).toEqual([])
    }
  })
})
