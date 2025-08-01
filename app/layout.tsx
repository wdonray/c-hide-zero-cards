import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Hide Zero Cards - Place Value Teaching Tool',
  description:
    'Interactive educational tool for teaching place values to fourth-grade students. Drag and manipulate number cards to understand place value concepts.',
  keywords: 'education, place value, math, fourth grade, interactive learning, number cards, teaching tool',
  authors: [{ name: 'Donray Williams' }],
  creator: 'Donray Williams',
  publisher: 'Educational Tool',
  robots: 'index, follow',
  openGraph: {
    title: 'Hide Zero Cards - Place Value Teaching Tool',
    description: 'Interactive educational tool for teaching place values to fourth-grade students.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hide Zero Cards - Place Value Teaching Tool',
    description: 'Interactive educational tool for teaching place values to fourth-grade students.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
