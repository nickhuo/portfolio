# Domain Context — Portfolio

The shared vocabulary for this codebase. When code names a domain concept — an
issue title, a refactor proposal, a test name, a module name — use the term as
defined here. Don't drift to synonyms.

This file is grown lazily: terms are added when a real decision gives them weight,
not speculatively.

## Glossary

### Essay

A single piece of writing published under `/writing/<slug>`. The unit of content
on the site. Lives as one MDX file at `app/writing/<slug>/page.mdx`.

An Essay's **canonical facts** are: `title`, `description`, `date`, `slug`, and
whether it is a `draft`. These facts live in **exactly one place** — the Essay's
own frontmatter — and every consumer (the writing index, the sitemap, `llm.txt`,
the page's `<head>` metadata, the page's JSON-LD) derives from them. There is no
separate registry of Essay facts.

- **slug** — the Essay's URL segment. It **is** the folder name (`app/writing/<slug>/`);
  it is never written down separately. Filesystem presence is publication.
- **date** — a single representation: an ISO date (`YYYY-MM-DD`). Display formatting
  is derived from it, not stored alongside it.
- **draft** — a `draft: true` Essay is excluded from the writing index, sitemap, and
  `llm.txt`. The folder may still exist; draft is how an Essay is held back from
  publication. (Replaces the old "just leave it out of the list" convention.)

### Writing index

The ordered list of published (non-draft) Essays. Produced by **scanning** the
`app/writing/` folder and reading each Essay's frontmatter — the filesystem is the
source of truth, so an Essay cannot be silently orphaned by forgetting to register it.

**Order:** by `date`, newest first.

The Writing index is consumed by the homepage list, the sitemap, and `llm.txt`. The
scan is server-side (the homepage receives the index as data from a server boundary,
since it is a client component).

### Author identity

The site's fixed authorship facts — author name, author URL, canonical base URL,
Open Graph article type. These are **constants**, not per-Essay frontmatter; they
are applied when deriving an Essay's metadata and JSON-LD.
