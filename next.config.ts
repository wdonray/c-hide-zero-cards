import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for performance
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'lucide-react'],
  },

  // Image configuration for SEO and performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hidezerocards.org',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression for better performance
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
