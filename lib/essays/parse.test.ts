import { describe, expect, test } from 'bun:test'
import {
  formatEssayDate,
  normalizeEssayFrontmatter,
  sortEssays,
} from './parse'
import type { Essay } from './types'

describe('normalizeEssayFrontmatter', () => {
  test('returns a fully-typed Essay with draft defaulting to false', () => {
    const essay = normalizeEssayFrontmatter('nowhere-to-go', {
      title: 'Nowhere to Go',
      description: 'On the sanctuary effect.',
      date: '2026-03-18',
    })
    expect(essay).toEqual({
      slug: 'nowhere-to-go',
      title: 'Nowhere to Go',
      description: 'On the sanctuary effect.',
      date: '2026-03-18',
      draft: false,
    })
  })

  test('preserves an explicit draft: true', () => {
    const essay = normalizeEssayFrontmatter('wip', {
      title: 'WIP',
      description: 'Not ready.',
      date: '2025-08-22',
      draft: true,
    })
    expect(essay.draft).toBe(true)
  })

  test('throws when a required field is missing, naming the slug', () => {
    expect(() =>
      normalizeEssayFrontmatter('broken', {
        title: 'No description or date',
      }),
    ).toThrow(/broken/)
  })

  test('throws a clear error when frontmatter is missing', () => {
    expect(() =>
      normalizeEssayFrontmatter('no-fm', undefined as unknown as Record<string, unknown>),
    ).toThrow(/missing or invalid frontmatter/)
  })

  test('throws when date is not YYYY-MM-DD', () => {
    expect(() =>
      normalizeEssayFrontmatter('bad-date', {
        title: 'Bad date',
        description: 'x',
        date: 'Aug 4, 2025',
      }),
    ).toThrow(/date/)
  })
})

describe('formatEssayDate', () => {
  test('formats an ISO date as a US long date in UTC', () => {
    expect(formatEssayDate('2026-03-18')).toBe('March 18, 2026')
    expect(formatEssayDate('2025-08-04')).toBe('August 4, 2025')
  })
})

describe('sortEssays', () => {
  test('orders by date descending, then slug ascending for ties', () => {
    const make = (slug: string, date: string): Essay => ({
      slug,
      title: slug,
      description: 'x',
      date,
      draft: false,
    })
    const sorted = sortEssays([
      make('behind-the-build', '2025-08-04'),
      make('proof', '2026-05-24'),
      make('the-59-try-rule', '2025-08-04'),
      make('nowhere-to-go', '2026-03-18'),
    ])
    expect(sorted.map((e) => e.slug)).toEqual([
      'proof',
      'nowhere-to-go',
      'behind-the-build',
      'the-59-try-rule',
    ])
  })

  test('does not mutate its input', () => {
    const input: Essay[] = [
      { slug: 'a', title: 'a', description: 'x', date: '2025-01-01', draft: false },
      { slug: 'b', title: 'b', description: 'x', date: '2026-01-01', draft: false },
    ]
    const copy = [...input]
    sortEssays(input)
    expect(input).toEqual(copy)
  })
})
