# Deep Essay Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each essay's frontmatter the single source of truth for its facts, with a filesystem scan producing the writing index that the homepage, sitemap, `llm.txt`, page metadata, and JSON-LD all derive from.

**Architecture:** Each `app/writing/<slug>/page.mdx` carries YAML frontmatter (`title`, `description`, `date`, optional `draft`). A pure parse core validates frontmatter into an `Essay`. A server-side `scanEssays(dir)` reads the folder and produces `Essay[]`; `getEssays()` returns published essays sorted newest-first. Per-page `metadata` and JSON-LD are generated from the page's own frontmatter via `remark-mdx-frontmatter`. The homepage (a client component) splits into a thin server wrapper that scans and a client child that keeps the interaction logic. `BLOG_POSTS` in `app/data.ts` is deleted. See `docs/adr/0001-essay-facts-in-frontmatter.md` and `CONTEXT.md`.

**Tech Stack:** Next.js 15 (App Router), `@next/mdx`, `remark-frontmatter` + `remark-mdx-frontmatter` (frontmatter → export), `gray-matter` (server-side frontmatter parse), `bun` + `bun test` (per the repo's hard toolchain rule — use `bun`, never npm/yarn/pnpm).

---

## Toolchain note (read once)

Per the user's global rule, **use `bun` for everything**: `bun add` to install, `bun test` to run tests, `bun run <script>` for next. The repo currently has a `package-lock.json` (npm); running `bun add` will create a `bun.lock` alongside it. Do **not** delete `package-lock.json` in this plan — just let `bun.lock` coexist. If `bun install` hasn't been run yet in this clone, run it first so `node_modules` exists.

## File Structure

**Create:**
- `lib/essays/types.ts` — the `Essay` type (one responsibility: the shape of essay facts).
- `lib/essays/parse.ts` — pure core: `normalizeEssayFrontmatter`, `parseEssayFile`, `formatEssayDate`, `sortEssays`. No fs, no React. The primary test surface.
- `lib/essays/parse.test.ts` — bun tests for the pure core.
- `lib/essays/scan.ts` — `WRITING_DIR`, `scanEssays(dir)`, `getEssays()`. The only fs-touching module.
- `lib/essays/scan.test.ts` — bun tests over committed fixtures.
- `lib/essays/meta.tsx` — `essayJsonLd` (pure), `buildEssayMetadata` (pure), `EssayJsonLd` (thin component). Page-side derivation.
- `lib/essays/meta.test.ts` — bun tests for the pure metadata functions.
- `lib/essays/__fixtures__/writing/<slug>/page.mdx` — fixture essays for the scan tests.
- `app/home-client.tsx` — the existing homepage client component, now receiving `essays` as a prop.

**Modify:**
- `next.config.mjs:37-52` — add `remark-frontmatter` + `remark-mdx-frontmatter` to `remarkPlugins`.
- `lib/constants.ts:1` — add `AUTHOR_NAME`.
- `package.json:5-11` — add a `test` script.
- `app/writing/<slug>/page.mdx` × 7 — replace the head block (metadata export + hand-written JSON-LD) with frontmatter + generated metadata + `<EssayJsonLd/>`.
- `app/sitemap.ts` — derive from `getEssays()`.
- `app/llm.txt/route.ts` — derive the Thoughts list from `getEssays()` + `formatEssayDate`.
- `app/page.tsx` — becomes a server wrapper that scans and renders `<PersonalHome essays=… />`.
- `app/data.ts:9-15,40-90` — delete the `BlogPost` type and `BLOG_POSTS` array.

---

## Task 0: Dependencies, test script, MDX plugin config

**Files:**
- Modify: `package.json:5-11`
- Modify: `next.config.mjs:1-4,37-52`

- [ ] **Step 1: Install the new dependencies with bun**

Run:
```bash
bun add gray-matter
bun add -d remark-frontmatter remark-mdx-frontmatter
```
Expected: `package.json` gains `gray-matter` under `dependencies` and `remark-frontmatter`, `remark-mdx-frontmatter` under `devDependencies`; a `bun.lock` is created/updated.

- [ ] **Step 2: Add a `test` script to package.json**

In `package.json`, add to the `scripts` block:

```json
"test": "bun test"
```

So the scripts block reads:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build",
    "test": "bun test"
  },
```

- [ ] **Step 3: Wire the frontmatter remark plugins into next.config.mjs**

Edit the imports at the top of `next.config.mjs` (lines 1-4) to add the two plugins:

```js
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
```

Edit the `withMDX` options (lines 37-52) so `remarkPlugins` lists the frontmatter plugins **first** (they must run before other transforms):

```js
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          displayMode: true,
          strict: false,
          trust: true,
        },
      ],
    ],
  },
})
```

`remark-mdx-frontmatter` exposes the YAML frontmatter as `export const frontmatter = {…}` inside each compiled MDX module. That export is what the migrated pages reference (Task 5).

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock next.config.mjs
git commit -m "build: add frontmatter tooling and bun test script"
```

---

## Task 1: The `Essay` type and the pure parse core

**Files:**
- Create: `lib/essays/types.ts`
- Create: `lib/essays/parse.ts`
- Test: `lib/essays/parse.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/essays/parse.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test lib/essays/parse.test.ts`
Expected: FAIL — `Cannot find module './parse'` (and `./types`).

- [ ] **Step 3: Write the type**

Create `lib/essays/types.ts`:

```ts
export type Essay = {
  /** URL segment — equals the folder name under app/writing/. Never stored elsewhere. */
  slug: string
  title: string
  description: string
  /** ISO date, YYYY-MM-DD. The single date representation. */
  date: string
  /** When true, excluded from the writing index, sitemap, and llm.txt. */
  draft: boolean
}
```

- [ ] **Step 4: Write the parse core**

Create `lib/essays/parse.ts`:

```ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test lib/essays/parse.test.ts`
Expected: PASS — all cases green.

- [ ] **Step 6: Commit**

```bash
git add lib/essays/types.ts lib/essays/parse.ts lib/essays/parse.test.ts
git commit -m "feat: add Essay type and pure frontmatter parse core"
```

---

## Task 2: The filesystem scan

**Files:**
- Create: `lib/essays/scan.ts`
- Create: `lib/essays/scan.test.ts`
- Create: `lib/essays/__fixtures__/writing/alpha/page.mdx`
- Create: `lib/essays/__fixtures__/writing/bravo/page.mdx`
- Create: `lib/essays/__fixtures__/writing/charlie-draft/page.mdx`
- Create: `lib/essays/__fixtures__/writing/not-an-essay/.gitkeep`

- [ ] **Step 1: Create the fixtures**

Create `lib/essays/__fixtures__/writing/alpha/page.mdx`:

```mdx
---
title: "Alpha"
description: "The first fixture essay."
date: "2026-05-24"
---

# Alpha

Body text.
```

Create `lib/essays/__fixtures__/writing/bravo/page.mdx`:

```mdx
---
title: "Bravo"
description: "The second fixture essay."
date: "2025-08-04"
---

# Bravo

Body text.
```

Create `lib/essays/__fixtures__/writing/charlie-draft/page.mdx`:

```mdx
---
title: "Charlie"
description: "A draft fixture, must be excluded from getEssays."
date: "2026-06-01"
draft: true
---

# Charlie

Body text.
```

Create an empty `lib/essays/__fixtures__/writing/not-an-essay/.gitkeep` (empty file) — a directory with **no** `page.mdx`, to prove the scan skips it.

- [ ] **Step 2: Write the failing tests**

Create `lib/essays/scan.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bun test lib/essays/scan.test.ts`
Expected: FAIL — `Cannot find module './scan'`.

- [ ] **Step 4: Write the scan**

Create `lib/essays/scan.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'
import { parseEssayFile, sortEssays } from './parse'
import type { Essay } from './types'

/** The real essays directory, resolved at build/runtime on the server. */
export const WRITING_DIR = path.join(process.cwd(), 'app', 'writing')

/** Read every essay (including drafts), unsorted, from a writing directory. */
export function scanEssays(dir: string): Essay[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const essays: Essay[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const file = path.join(dir, entry.name, 'page.mdx')
    if (!fs.existsSync(file)) continue
    const raw = fs.readFileSync(file, 'utf8')
    essays.push(parseEssayFile(entry.name, raw))
  }
  return essays
}

/** The writing index: published essays only, newest first. */
export function getEssays(): Essay[] {
  return sortEssays(scanEssays(WRITING_DIR).filter((e) => !e.draft))
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test lib/essays/scan.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/essays/scan.ts lib/essays/scan.test.ts lib/essays/__fixtures__
git commit -m "feat: add filesystem essay scan with fixtures"
```

---

## Task 3: Page-side metadata + JSON-LD generation

**Files:**
- Modify: `lib/constants.ts:1`
- Create: `lib/essays/meta.tsx`
- Test: `lib/essays/meta.test.ts`

- [ ] **Step 1: Add the author constant**

Edit `lib/constants.ts` so it reads:

```ts
export const WEBSITE_URL = 'https://nickhuo.com'
export const AUTHOR_NAME = 'Jiajun (Nick) Huo'
```

- [ ] **Step 2: Write the failing tests**

Create `lib/essays/meta.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bun test lib/essays/meta.test.ts`
Expected: FAIL — `Cannot find module './meta'`.

- [ ] **Step 4: Write the metadata module**

Create `lib/essays/meta.tsx`:

```tsx
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test lib/essays/meta.test.ts`
Expected: PASS.

If the `@/lib/constants` import fails to resolve under bun test, that means bun isn't reading tsconfig `paths`; as a fallback change the import in `meta.tsx` to the relative form `import { AUTHOR_NAME, WEBSITE_URL } from '../constants'` and re-run.

- [ ] **Step 6: Run the whole suite and commit**

Run: `bun test`
Expected: PASS (all three test files).

```bash
git add lib/constants.ts lib/essays/meta.tsx lib/essays/meta.test.ts
git commit -m "feat: generate essay metadata and JSON-LD from frontmatter"
```

---

## Task 4: Migrate the 7 essay pages to frontmatter

Each `page.mdx` currently begins with an `export const metadata = {…}` block (lines 1-10) and a hand-written `<script type="application/ld+json">…</script>` line (line 12), then a blank line, then `# Title`. Replace **everything from line 1 up to and including the blank line before the `# ` heading** with a new head block. Leave the `# Title` heading and the entire body untouched.

The new head block has this exact shape (only the frontmatter values and the `slug` literal differ per file):

```mdx
---
title: "<TITLE>"
description: "<DESCRIPTION>"
date: "<ISO-DATE>"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = '<SLUG>'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

`frontmatter` is the export injected by `remark-mdx-frontmatter`; `slug` is the only per-file literal and must equal the folder name. For the draft essay, add a `draft: true` line to the frontmatter.

> **Note — canonical descriptions:** the values below are the existing MDX `metadata`/JSON-LD descriptions (richer than the old `data.ts` homepage text). Because the homepage now derives from these, a few cards will show slightly fuller copy. This is intended.

- [ ] **Step 1: Migrate `app/writing/nowhere-to-go/page.mdx`** — replace the head block with:

```mdx
---
title: "Nowhere to Go"
description: "On the sanctuary effect, going offline, and what forced stillness gives back in an attention economy."
date: "2026-03-18"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'nowhere-to-go'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 2: Migrate `app/writing/proof-you-were-there/page.mdx`** — replace the head block with:

```mdx
---
title: "The Shutter Is Proof You Were There"
description: "On photography, presence, and the one thing a perfect AI image can't give back."
date: "2026-05-24"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'proof-you-were-there'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 3: Migrate `app/writing/runtime-vs-structural-reliability/page.mdx`** — replace the head block with:

```mdx
---
title: "Your Agent's Bug Is Structural, Not Runtime"
description: "Most teams add another judge when they should change the structure. Two layers of agent reliability, and why we invest in the wrong one."
date: "2026-05-22"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'runtime-vs-structural-reliability'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 4: Migrate `app/writing/workflows-beat-agents/page.mdx`** — replace the head block with:

```mdx
---
title: "Most Production Features Don't Need an Agent"
description: "Why workflows still beat agents for most production LLM features — and the cost test that tells you which to reach for."
date: "2026-05-21"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'workflows-beat-agents'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 5: Migrate `app/writing/the-59-try-rule/page.mdx`** — replace the head block with:

```mdx
---
title: "The 59-Try Rule"
description: "Why high-upside success is worth 59 shots — a mathematical case for low-cost, high-return experiments."
date: "2025-08-04"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'the-59-try-rule'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 6: Migrate `app/writing/behind-the-build-my-tools-workflow/page.mdx`** — replace the head block with:

```mdx
---
title: "Behind the Build: My Tools & Workflow"
description: "A craftsman must first sharpen his tools. How I refined my productivity system through dozens of iterations."
date: "2025-08-04"
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'behind-the-build-my-tools-workflow'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 7: Migrate `app/writing/the-fridge-to-fork-problem/page.mdx` (the orphan → keep it a draft)** — replace the head block with (note the `draft: true`):

```mdx
---
title: "The Fridge-to-Fork Problem"
description: "Why and how we built an ingredient-first recipe recommendation system."
date: "2025-08-22"
draft: true
---

import { EssayJsonLd, buildEssayMetadata } from '@/lib/essays/meta'

export const slug = 'the-fridge-to-fork-problem'
export const metadata = buildEssayMetadata(slug, frontmatter)

<EssayJsonLd slug={slug} frontmatter={frontmatter} />
```

- [ ] **Step 8: Verify the build compiles and the pages render correctly**

Run: `bun run build`
Expected: build succeeds. Then run the production server and spot-check one page:

```bash
bun run start &
sleep 4
curl -s http://localhost:3000/writing/nowhere-to-go | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/writing/nowhere-to-go | grep -c 'application/ld+json'
kill %1
```
Expected: the `<title>` contains "Nowhere to Go", and the `ld+json` count is `1` (the generated JSON-LD is present). If the title is empty or JSON-LD is missing, the `frontmatter` export isn't being referenced — confirm Task 0 Step 3 ordering (frontmatter plugins first) and that the page references `frontmatter` exactly.

- [ ] **Step 9: Commit**

```bash
git add app/writing
git commit -m "refactor: drive essay metadata and JSON-LD from frontmatter"
```

---

## Task 5: Derive the sitemap from the scan

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Rewrite the sitemap to use `getEssays()`**

Replace the entire contents of `app/sitemap.ts` with:

```ts
import type { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/lib/constants'
import { getEssays } from '@/lib/essays/scan'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getEssays().map((essay) => ({
    url: `${WEBSITE_URL}/writing/${essay.slug}`,
    lastModified: new Date(`${essay.date}T00:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: WEBSITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...posts,
  ]
}
```

- [ ] **Step 2: Verify the sitemap excludes the draft and lists 6 essays**

Run:
```bash
bun run build && bun run start &
sleep 4
curl -s http://localhost:3000/sitemap.xml | grep -c '/writing/'
curl -s http://localhost:3000/sitemap.xml | grep -c 'the-fridge-to-fork-problem'
kill %1
```
Expected: `6` writing URLs, and `0` occurrences of the draft `the-fridge-to-fork-problem`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "refactor: derive sitemap from the essay scan"
```

---

## Task 6: Derive llm.txt from the scan

**Files:**
- Modify: `app/llm.txt/route.ts`

- [ ] **Step 1: Rewrite the route to use `getEssays()` and `formatEssayDate`**

Replace the entire contents of `app/llm.txt/route.ts` with:

```ts
import { WEBSITE_URL } from '@/lib/constants'
import { PROJECTS, SOCIAL_LINKS } from '@/app/data'
import { getEssays } from '@/lib/essays/scan'
import { formatEssayDate } from '@/lib/essays/parse'

export const dynamic = 'force-static'

export function GET() {
  const essays = getEssays()
  const content = `# Jiajun (Nick) Huo

> Software engineer and builder. Former PM and data scientist. Currently at UIUC building AI agents driven by product thinking.

Nick went to college in Shenzhen, shaped by its tech-driven momentum. From sandbox math models tackling supply chain and finance challenges, to driving 0-to-1 growth at Sonic SVM and scaling monetization at Tencent and Baidu.

## Projects

${PROJECTS.map((p) => `- [${p.name}](${p.link}): ${p.description}`).join('\n')}

## Thoughts

${essays
  .map(
    (e) =>
      `- [${e.title}](${WEBSITE_URL}/writing/${e.slug}): ${e.description} (${formatEssayDate(e.date)})`,
  )
  .join('\n')}

## Links

- Resume: ${WEBSITE_URL}/resume
${SOCIAL_LINKS.filter((l) => !l.link.startsWith('mailto:'))
  .map((l) => `- ${l.label}: ${l.link}`)
  .join('\n')}
- Email: jiajunhuo726@gmail.com
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

- [ ] **Step 2: Verify llm.txt lists the 6 published essays newest-first with formatted dates**

Run:
```bash
bun run build && bun run start &
sleep 4
curl -s http://localhost:3000/llm.txt | sed -n '/## Thoughts/,/## Links/p'
kill %1
```
Expected: 6 bullets, top one is "The Shutter Is Proof You Were There" (2026-05-24), dates render like "(May 24, 2026)", and `the-fridge-to-fork-problem` is absent.

- [ ] **Step 3: Commit**

```bash
git add app/llm.txt/route.ts
git commit -m "refactor: derive llm.txt thoughts list from the essay scan"
```

---

## Task 7: Split the homepage into a server wrapper + client child

The homepage is currently a single `'use client'` component in `app/page.tsx`. A client component cannot run the filesystem scan, so we move the client component to `app/home-client.tsx` (taking `essays` as a prop) and make `app/page.tsx` a thin server component that scans and passes the index down.

**Files:**
- Create: `app/home-client.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `app/home-client.tsx`**

This is the current `app/page.tsx` content, with three changes: (a) it now imports only `SOCIAL_LINKS` from `./data`; (b) the component is named `PersonalHome`, accepts `{ essays }: { essays: Essay[] }`, and is no longer the default export's data source; (c) the Thoughts list maps over `essays`, using `essay.slug` for the key/href/analytics. Create `app/home-client.tsx` with:

```tsx
'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import posthog from 'posthog-js'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Magnetic } from '@/components/ui/magnetic'
import { SOCIAL_LINKS } from './data'
import { WEBSITE_URL } from '@/lib/constants'
import type { Essay } from '@/lib/essays/types'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jiajun (Nick) Huo',
  url: WEBSITE_URL,
  jobTitle: 'Software Engineer',
  sameAs: [
    'https://github.com/nickhuo',
    'https://www.linkedin.com/in/nickhuo',
    'https://twitter.com/imnickhuo',
  ],
}

function MagneticSocialLink({
  children,
  link,
  label,
}: {
  children: React.ReactNode
  link: string
  label: string
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        rel="noopener noreferrer"
        onClick={() =>
          posthog.capture('social_link_clicked', { label, url: link })
        }
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <title>External link icon</title>
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    </Magnetic>
  )
}

export function PersonalHome({ essays }: { essays: Essay[] }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
      />
      <h1 className="sr-only">
        Jiajun (Nick) Huo — Software Engineer & Builder
      </h1>
      <motion.main
        className="space-y-24"
        variants={VARIANTS_CONTAINER}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
      >
        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-2 text-lg font-medium tracking-tight">
            Dots Connected
          </h2>
          <div className="flex-1">
            <p className="text-zinc-600 dark:text-zinc-400">
              I build software that learns from how people actually use it. The interesting part was never the model or the infra on its own — it&apos;s the loop between what people need and a system reliable enough to benefit them. Right now I&apos;m researching multi-agent for personalized learning at the Beckman Institute, and helping build an AI copilot for aircraft. Before this, I built data infrastructure at Sonic SVM on Solana, and worked on growth and ads at Tencent and Baidu. Looking back,{' '}
              <a
                href="https://www.linkedin.com/in/nickhuo/details/experience/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-zinc-100"
              >
                the dots connect
              </a>
              : each role taught me a different part of that loop — what people need, how to capture the signal, how to make the system hold in production.
            </p>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              I believe a great tool is a bicycle for the mind that amplifies human intelligence.
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-3 text-lg font-medium tracking-tight">Thoughts</h2>
          <div className="flex flex-col space-y-0">
            <AnimatedBackground
              enableHover
              className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-900/80"
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.2,
              }}
            >
              {essays.map((essay) => (
                <Link
                  key={essay.slug}
                  className="-mx-3 rounded-xl px-3 py-3"
                  href={`/writing/${essay.slug}`}
                  data-id={essay.slug}
                  onClick={() =>
                    posthog.capture('blog_post_clicked', {
                      title: essay.title,
                      slug: essay.slug,
                      url: `/writing/${essay.slug}`,
                    })
                  }
                >
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-normal dark:text-zinc-100">
                      {essay.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {essay.description}
                    </p>
                  </div>
                </Link>
              ))}
            </AnimatedBackground>
          </div>
        </motion.section>

        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-5 text-lg font-medium tracking-tight">Connect</h2>

          <div className="flex items-center justify-start space-x-3">
            {SOCIAL_LINKS.map((link) => (
              <MagneticSocialLink
                key={link.label}
                link={link.link}
                label={link.label}
              >
                {link.label}
              </MagneticSocialLink>
            ))}
          </div>
        </motion.section>
      </motion.main>
    </>
  )
}
```

Note: the analytics payload for `blog_post_clicked` changes from `{ title, uid, url }` to `{ title, slug, url }` (there is no `uid` anymore). This is an intended consequence of removing `data.ts`'s `BLOG_POSTS`.

- [ ] **Step 2: Replace `app/page.tsx` with a server wrapper**

Replace the entire contents of `app/page.tsx` with:

```tsx
import { getEssays } from '@/lib/essays/scan'
import { PersonalHome } from './home-client'

export default function Page() {
  return <PersonalHome essays={getEssays()} />
}
```

- [ ] **Step 3: Verify the homepage builds and lists essays newest-first**

Run:
```bash
bun run build && bun run start &
sleep 4
curl -s http://localhost:3000/ | grep -o 'href="/writing/[^"]*"'
kill %1
```
Expected: 6 `href="/writing/<slug>"` links, in this order: `proof-you-were-there`, `runtime-vs-structural-reliability`, `workflows-beat-agents`, `nowhere-to-go`, `behind-the-build-my-tools-workflow`, `the-59-try-rule` (the two 2025-08-04 essays are tie-broken by slug ascending, so `behind-the-build…` precedes `the-59-try-rule`). `the-fridge-to-fork-problem` is absent.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/home-client.tsx
git commit -m "refactor: scan essays server-side and pass them to the homepage"
```

---

## Task 8: Delete the dead BLOG_POSTS registry

**Files:**
- Modify: `app/data.ts:9-15,40-90`

- [ ] **Step 1: Confirm nothing still imports BLOG_POSTS**

Run: `grep -rn "BLOG_POSTS" app lib --include=*.ts --include=*.tsx`
Expected: no matches. (If any remain, they were missed in an earlier task — fix before deleting.)

- [ ] **Step 2: Remove the `BlogPost` type and `BLOG_POSTS` array**

In `app/data.ts`, delete the `BlogPost` type definition (lines 9-15) and the entire `export const BLOG_POSTS: BlogPost[] = [ … ]` block (lines 40-90, including the trailing comment placeholders). Leave `Project`, `SocialLink`, `PROJECTS`, and `SOCIAL_LINKS` intact. The file should now define only `Project`, `SocialLink`, `PROJECTS`, and `SOCIAL_LINKS`.

- [ ] **Step 3: Verify types and build still pass**

Run:
```bash
bunx tsc --noEmit
bun run build
```
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/data.ts
git commit -m "refactor: remove the hardcoded BLOG_POSTS registry"
```

---

## Task 9: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `bun test`
Expected: all tests in `lib/essays/*.test.ts` PASS.

- [ ] **Step 2: Typecheck, lint, build**

Run:
```bash
bunx tsc --noEmit
bun run lint
bun run build
```
Expected: all succeed.

- [ ] **Step 3: End-to-end content checks against the running build**

Run:
```bash
bun run start &
sleep 4
echo "— homepage essay order —"; curl -s http://localhost:3000/ | grep -o 'href="/writing/[^"]*"'
echo "— sitemap writing count (expect 6) —"; curl -s http://localhost:3000/sitemap.xml | grep -c '/writing/'
echo "— draft leaked into sitemap? (expect 0) —"; curl -s http://localhost:3000/sitemap.xml | grep -c 'the-fridge-to-fork-problem'
echo "— draft route still reachable directly (expect a title) —"; curl -s http://localhost:3000/writing/the-fridge-to-fork-problem | grep -o '<title>[^<]*</title>'
echo "— llm.txt thoughts —"; curl -s http://localhost:3000/llm.txt | sed -n '/## Thoughts/,/## Links/p'
kill %1
```
Expected: homepage shows 6 essays newest-first; sitemap has 6 writing URLs and 0 draft leaks; the draft essay's own route still renders (it's unpublished from the index, not deleted); llm.txt lists the same 6 with formatted dates.

- [ ] **Step 4: Final commit if any verification fixups were needed**

```bash
git add -A
git commit -m "test: verify deep essay module end-to-end"
```

---

## Self-Review notes (for the implementer)

- **Single source of facts:** after this plan, an essay's title/description/date live only in its frontmatter. `data.ts` no longer carries essay facts; JSON-LD and page metadata are generated. The only per-page literal is `slug`, which must equal the folder name.
- **Bug classes closed:** silent orphans (filesystem is the index), date drift (one ISO representation, formatted on demand), and slug-mismatch (slug derived from the folder for all URL outputs).
- **Draft mechanism:** `the-fridge-to-fork-problem` is retained as `draft: true` — reachable by direct URL but absent from index/sitemap/llm.txt. To publish it later, delete the `draft: true` line.
- **Type/name consistency:** `Essay` fields (`slug`, `title`, `description`, `date`, `draft`) are used identically across `parse.ts`, `scan.ts`, `meta.tsx`, and `home-client.tsx`. Functions: `normalizeEssayFrontmatter`, `parseEssayFile`, `formatEssayDate`, `sortEssays`, `scanEssays`, `getEssays`, `buildEssayMetadata`, `essayJsonLd`, `EssayJsonLd`.
- **Known risk:** the `frontmatter` export from `remark-mdx-frontmatter` must be in scope where `buildEssayMetadata(slug, frontmatter)` runs. Task 4 Step 8 verifies this via the rendered `<title>` and JSON-LD; if it fails, recheck the plugin order in `next.config.mjs` (frontmatter plugins first).
