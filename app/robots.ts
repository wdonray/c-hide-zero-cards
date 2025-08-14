import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidezerocards.org'
  if (!isProd) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
