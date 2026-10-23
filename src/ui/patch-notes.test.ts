import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PATCH_NOTES } from './patch-notes'

const changelog = readFileSync(new URL('../../CHANGELOG.md', import.meta.url), 'utf8')

/** Versions annoncées par le CHANGELOG, dans l'ordre : lignes « ## [1.2] - 2026-10-23 ». */
const changelogVersions = [...changelog.matchAll(/^## \[(\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/gm)].map(
  ([, version, date]) => ({ version, date }),
)

describe('Notes de version', () => {
  it('annoncent les mêmes versions, aux mêmes dates, que le CHANGELOG', () => {
    expect(PATCH_NOTES.map(({ version, date }) => ({ version, date }))).toEqual(changelogVersions)
  })

  it('vont de la plus récente à la plus ancienne, avec au moins une nouveauté chacune', () => {
    const numbers = PATCH_NOTES.map((n) => Number(n.version))
    expect(numbers).toEqual([...numbers].sort((a, b) => b - a))
    for (const note of PATCH_NOTES) expect(note.changes.length).toBeGreaterThan(0)
  })
})
