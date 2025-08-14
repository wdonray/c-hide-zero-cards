import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { HeaderProvider } from '@/lib/useHeaderContext'
import { HydrationCheck } from '@/components/HydrationCheck'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://hidezerocards.org'),
  title: 'Place Value Cards — Interactive Teaching Tool | Hide Zero Cards',
  description:
    'Hands-on place value cards with a modern UI for teachers. Build true understanding fast. Try the interactive demo.',
  robots: 'index, follow, max-image-preview:large',
  alternates: { canonical: 'https://hidezerocards.org/' },
  openGraph: {
    title: 'Place Value Cards — Interactive Teaching Tool | Hide Zero Cards',
    description: 'Hands-on place value cards with a modern UI for teachers. Build true understanding fast.',
    url: 'https://hidezerocards.org/',
    siteName: 'Hide Zero Cards',
    type: 'website',
    images: [
      {
        url: 'https://hidezerocards.org/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Hide Zero Cards — interactive place value tool',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Place Value Cards — Interactive Teaching Tool',
    description: 'Interactive, hands-on place value cards that make place value click.',
    images: ['https://hidezerocards.org/twitter-image'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '32x32' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <HydrationCheck>
            <HeaderProvider>
              <Header />
              <Toolbar />
              <main className="min-h-screen container m-auto p-8 transition-all duration-300">{children}</main>
              <Footer />
            </HeaderProvider>
          </HydrationCheck>
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
