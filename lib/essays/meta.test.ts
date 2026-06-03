import { describe, expect, test } from 'bun:test'
import { buildEssayMetadata, essayJsonLd } from './meta'

const FM = {
  title: 'Nowhere to Go',
  description: 'On the sanctuary effect.',
  date: '2026-03-18',
}

describe('buildEssayMetadata', () => {
  test('maps frontmatter to Next metadata with a slug-derived canonical', () => {
    const meta = buildEssayMetadata('nowhere-to-go', FM)
    expect(meta.title).toBe('Nowhere to Go')
    expect(meta.description).toBe('On the sanctuary effect.')
    expect(meta.alternates?.canonical).toBe('/writing/nowhere-to-go')
    expect(meta.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-03-18',
      authors: ['Jiajun (Nick) Huo'],
    })
  })

  test('omits robots for a published (non-draft) essay', () => {
    const meta = buildEssayMetadata('nowhere-to-go', FM)
    expect(meta.robots).toBeUndefined()
  })

  test('marks a draft essay noindex', () => {
    const meta = buildEssayMetadata('wip', {
      title: 'WIP',
      description: 'Not ready.',
      date: '2025-08-22',
      draft: true,
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })
})

describe('essayJsonLd', () => {
  test('produces a BlogPosting with an absolute url and author', () => {
    const ld = essayJsonLd('nowhere-to-go', FM)
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Nowhere to Go',
      description: 'On the sanctuary effect.',
      datePublished: '2026-03-18',
      url: 'https://nickhuo.com/writing/nowhere-to-go',
      author: {
        '@type': 'Person',
        name: 'Jiajun (Nick) Huo',
        url: 'https://nickhuo.com',
      },
    })
  })
})
