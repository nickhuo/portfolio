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
