import type { Metadata } from 'next'
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
  title: 'Hide Zero Cards - Place Value Teaching Tool',
  description:
    'Interactive educational tool for teaching place values to fourth-grade students. Drag and manipulate number cards to understand place value concepts.',
  keywords: 'education, place value, math, fourth grade, interactive learning, number cards, teaching tool',
  authors: [{ name: 'Donray Williams' }],
  creator: 'Donray Williams',
  publisher: 'Educational Tool',
  robots: 'index, follow, max-image-preview:large',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hide Zero Cards - Place Value Teaching Tool',
    description: 'Interactive educational tool for teaching place values to fourth-grade students.',
    type: 'website',
    locale: 'en_US',
    url: 'https://hidezerocards.org/',
    siteName: 'Hide Zero Cards',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Hide Zero Cards' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hide Zero Cards - Place Value Teaching Tool',
    description: 'Interactive educational tool for teaching place values to fourth-grade students.',
    images: ['/logo.png'],
  },
  icons: { icon: '/favicon.ico' },
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
