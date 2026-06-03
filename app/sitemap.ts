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
