# 1. Essay facts live in frontmatter; the filesystem is the index

Date: 2026-05-30

## Status

Accepted

## Context

An Essay's canonical facts (title, description, date, slug) were duplicated across
three places: the `BLOG_POSTS` array in `app/data.ts`, each `page.mdx`'s
`export const metadata` block, and a hand-written Schema.org JSON-LD string literal
in each `page.mdx`. The `date` had three representations (a display string like
`'Aug 4, 2025'`, an ISO string `'2026-05-21'`, and an implicit locale-dependent
`new Date(...)` parse in the sitemap).

Nothing enforced that these stayed in sync. Two bug classes followed directly:

- **Silent orphans** — an essay folder with no `BLOG_POSTS` entry has a live route but
  is invisible to the homepage, sitemap, and `llm.txt`. This had already happened:
  `app/writing/the-fridge-to-fork-problem/` existed but was absent from the registry.
- **Fact drift** — title/description/date in `data.ts` could disagree with the `.mdx`
  metadata and the JSON-LD, with no build-time error.

Five consumers each reached into raw data and re-derived their view: the homepage list,
the sitemap, `llm.txt`, the per-page `metadata`, and the JSON-LD.

## Decision

An Essay's canonical facts live in **exactly one place — the Essay's own frontmatter**
in `app/writing/<slug>/page.mdx`. The **filesystem is the index**: a server-side scan
of `app/writing/` reading each Essay's frontmatter produces the writing index. Every
consumer derives from that scan.

Specifically:

- **No central registry of Essay facts.** `BLOG_POSTS` is removed.
- **Slug = folder name.** The slug is never written down separately; it is the
  directory name. Filesystem presence is publication.
- **One date representation:** an ISO date (`YYYY-MM-DD`) in frontmatter; display
  formatting is derived.
- **`draft: true`** holds an Essay back from the index/sitemap/`llm.txt` (replacing
  the old "leave it out of the list" convention).
- **Per-page `metadata` and JSON-LD are generated** from the Essay's own frontmatter,
  not hand-written.

## Consequences

- Adding an essay becomes "write the file." Every consumer updates from the scan; the
  silent-orphan and fact-drift bug classes are eliminated by construction.
- The scan and metadata derivation become pure, server-side, unit-testable functions —
  a test surface that did not previously exist.
- The homepage (`app/page.tsx`, a client component) cannot scan the filesystem itself.
  It splits into a server wrapper that scans and a client child that keeps the
  PostHog/interaction logic, receiving the index as props.
- A frontmatter reader and `remark-mdx-frontmatter` are added so the same frontmatter
  serves both the server scan and the in-page metadata/JSON-LD generation. One source
  of facts, two readers.

## Not chosen (so future reviews don't re-litigate)

- **A central content registry** (the old `data.ts` model, hardened with a
  slug-matches-folder assertion). Rejected: it keeps two places facts can drift and
  preserves the orphan failure mode unless a build check is also maintained. The
  filesystem-as-index removes the failure mode by construction.
- **A dynamic `[slug]` route owning all rendering** (bodies become `content.mdx`).
  Architecturally deeper, but a larger refactor re-validating 7 live, published essays
  for depth in machinery that isn't the source of the friction. May be revisited if
  eliminating per-file metadata machinery becomes a goal in its own right.
