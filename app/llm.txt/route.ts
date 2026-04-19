import { WEBSITE_URL } from '@/lib/constants'
import { PROJECTS, BLOG_POSTS, SOCIAL_LINKS } from '@/app/data'

export const dynamic = 'force-static'

export function GET() {
  const content = `# Jiajun (Nick) Huo

> Software engineer and builder. Former PM and data scientist. Currently at UIUC building AI agents driven by product thinking.

Nick went to college in Shenzhen, shaped by its tech-driven momentum. From sandbox math models tackling supply chain and finance challenges, to driving 0-to-1 growth at Sonic SVM and scaling monetization at Tencent and Baidu.

## Projects

${PROJECTS.map((p) => `- [${p.name}](${p.link}): ${p.description}`).join('\n')}

## Thoughts

${BLOG_POSTS.map((p) => `- [${p.title}](${WEBSITE_URL}/${p.link}): ${p.description} (${p.date})`).join('\n')}

## Links

- Resume: ${WEBSITE_URL}/resume
${SOCIAL_LINKS.filter((l) => !l.link.startsWith('mailto:')).map((l) => `- ${l.label}: ${l.link}`).join('\n')}
- Email: jiajunhuo726@gmail.com
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
