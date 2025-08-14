import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'lucide-react', 'sonner'],
  },
}

export default nextConfig
