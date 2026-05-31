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
