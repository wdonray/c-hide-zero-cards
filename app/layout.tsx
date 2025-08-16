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
  title: 'Hide Zero Cards - Interactive Place Value Teaching Tool',
  description:
    'Transform how your students understand place values with this interactive, hands-on learning tool. Perfect for teachers and fourth-grade students learning math concepts.',
  keywords: [
    'place value teaching',
    'math education tool',
    'fourth grade math',
    'interactive learning',
    'number cards',
    'elementary math',
    'teaching tool',
    'math manipulatives',
    'place value cards',
    'educational technology',
  ],
  authors: [{ name: 'Donray Williams' }],
  creator: 'Donray Williams',
  publisher: 'Hide Zero Cards',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hide Zero Cards - Interactive Place Value Teaching Tool',
    description:
      'Transform how your students understand place values with this interactive, hands-on learning tool. Perfect for teachers and fourth-grade students.',
    type: 'website',
    locale: 'en_US',
    url: 'https://hidezerocards.org',
    siteName: 'Hide Zero Cards',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hide Zero Cards - Place Value Teaching Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hide Zero Cards - Interactive Place Value Teaching Tool',
    description: 'Transform how your students understand place values with this interactive, hands-on learning tool.',
    images: ['/logo.png'],
    creator: '@hidezerocards',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Hide Zero Cards',
    description: 'Transform how your students understand place values with this interactive, hands-on learning tool',
    url: 'https://hidezerocards.org',
    logo: 'https://hidezerocards.org/logo.png',
    founder: {
      '@type': 'Person',
      name: 'Donray Williams',
    },
    educationalCredentialAwarded: 'Mathematical Understanding',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: ['teacher', 'student'],
      audienceType: 'Elementary School',
    },
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hide Zero Cards',
    description: 'Interactive place value teaching tool for elementary education',
    url: 'https://hidezerocards.org',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://hidezerocards.org/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    about: {
      '@type': 'Thing',
      name: 'Place Value Education',
      description: 'Mathematical concept teaching place values in elementary education',
    },
  }

  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Hide Zero Cards',
    applicationCategory: 'EducationalApplication',
    description: 'Interactive educational tool for teaching place values to fourth-grade students',
    url: 'https://hidezerocards.org',
    operatingSystem: 'Web Browser',
    permissions: 'Free to use',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    educationalUse: 'instruction',
    educationalLevel: 'Elementary School',
    learningResourceType: 'Interactive Tool',
    typicalAgeRange: '8-12',
  }

  return (
    <html lang="en" suppressHydrationWarning className="overflow-hidden">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
      </head>
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
