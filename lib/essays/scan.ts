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
