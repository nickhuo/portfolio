import type { Metadata } from 'next'
import { AUTHOR_NAME, WEBSITE_URL } from '@/lib/constants'
import { normalizeEssayFrontmatter } from './parse'

type RawFrontmatter = Record<string, unknown>

/** Build Next.js page metadata from an essay's own frontmatter. */
export function buildEssayMetadata(slug: string, fm: RawFrontmatter): Metadata {
  const essay = normalizeEssayFrontmatter(slug, fm)
  return {
    title: essay.title,
    description: essay.description,
    alternates: { canonical: `/writing/${essay.slug}` },
    openGraph: {
      type: 'article',
      publishedTime: essay.date,
      authors: [AUTHOR_NAME],
    },
  }
}

/** Build the Schema.org BlogPosting object for an essay. */
export function essayJsonLd(slug: string, fm: RawFrontmatter) {
  const essay = normalizeEssayFrontmatter(slug, fm)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: essay.title,
    description: essay.description,
    datePublished: essay.date,
    url: `${WEBSITE_URL}/writing/${essay.slug}`,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: WEBSITE_URL,
    },
  }
}

/** Render the JSON-LD <script> for an essay, derived from its frontmatter. */
export function EssayJsonLd({
  slug,
  frontmatter,
}: {
  slug: string
  frontmatter: RawFrontmatter
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(essayJsonLd(slug, frontmatter)),
      }}
    />
  )
}
