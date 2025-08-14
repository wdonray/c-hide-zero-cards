import type { MetadataRoute } from 'next'

export const revalidate = 86400

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://hidezerocards.org'
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${siteUrl}/logo.png`],
    },
  ]
}
