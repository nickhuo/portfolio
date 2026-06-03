import { describe, expect, test } from 'bun:test'
import path from 'node:path'
import { sortEssays } from './parse'
import { scanEssays } from './scan'

const FIXTURES = path.join(import.meta.dir, '__fixtures__', 'writing')

describe('scanEssays', () => {
  test('returns one Essay per folder that has a page.mdx', () => {
    const essays = scanEssays(FIXTURES)
    expect(essays.map((e) => e.slug).sort()).toEqual([
      'alpha',
      'bravo',
      'charlie-draft',
    ])
  })

  test('skips directories without a page.mdx', () => {
    const essays = scanEssays(FIXTURES)
    expect(essays.find((e) => e.slug === 'not-an-essay')).toBeUndefined()
  })

  test('reads draft from frontmatter', () => {
    const charlie = scanEssays(FIXTURES).find((e) => e.slug === 'charlie-draft')
    expect(charlie?.draft).toBe(true)
  })

  test('published + sorted composition excludes drafts, newest first', () => {
    const published = sortEssays(scanEssays(FIXTURES).filter((e) => !e.draft))
    expect(published.map((e) => e.slug)).toEqual(['alpha', 'bravo'])
  })
})
