import matter from 'gray-matter'
import type { Essay } from './types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function requireString(
  slug: string,
  data: Record<string, unknown>,
  field: 'title' | 'description' | 'date',
): string {
  const value = data[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Essay "${slug}": frontmatter field "${field}" must be a non-empty string`,
    )
  }
  return value
}

/** Validate a raw frontmatter object into a typed Essay. Pure; throws on bad input. */
export function normalizeEssayFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): Essay {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Essay "${slug}": missing or invalid frontmatter`)
  }
  const title = requireString(slug, data, 'title')
  const description = requireString(slug, data, 'description')
  const date = requireString(slug, data, 'date')
  if (!ISO_DATE.test(date)) {
    throw new Error(
      `Essay "${slug}": frontmatter "date" must be ISO YYYY-MM-DD, got "${date}"`,
    )
  }
  const draftRaw = data.draft
  if (draftRaw !== undefined && typeof draftRaw !== 'boolean') {
    throw new Error(`Essay "${slug}": frontmatter "draft" must be a boolean`)
  }
  return { slug, title, description, date, draft: draftRaw === true }
}

/** Parse a page.mdx file's raw contents into an Essay using its leading YAML frontmatter. */
export function parseEssayFile(slug: string, raw: string): Essay {
  const { data } = matter(raw)
  return normalizeEssayFrontmatter(slug, data as Record<string, unknown>)
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "March 18, 2026", anchored to UTC. */
export function formatEssayDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Return a new array sorted newest-first, tie-broken by slug ascending. Does not mutate input. */
export function sortEssays(essays: Essay[]): Essay[] {
  return [...essays].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0
  })
}
