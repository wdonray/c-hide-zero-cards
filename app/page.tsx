import { Metadata } from 'next'
import { HomePageClient } from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'Hide Zero Cards - Interactive Place Value Learning Tool for Teachers',
  description:
    'Help your students master place values with our interactive drag-and-drop number cards. Perfect for 4th grade math education and elementary teaching.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <>
      {/* SEO-optimized content that's server-rendered */}
      <div className="sr-only">
        <h1>Hide Zero Cards - Interactive Place Value Teaching Tool</h1>
        <p>
          Transform how your students understand place values with this interactive, hands-on learning tool. Perfect for
          teachers and fourth-grade students learning fundamental math concepts.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Interactive drag-and-drop number cards</li>
          <li>Color-coded place value visualization</li>
          <li>Support for numbers up to 1 billion</li>
          <li>Hide zero cards functionality for focused learning</li>
          <li>Random number generation for practice</li>
          <li>Responsive design for classroom use</li>
        </ul>
        <h2>Educational Benefits</h2>
        <ul>
          <li>Hands-on place value manipulation</li>
          <li>Visual learning for different learning styles</li>
          <li>Immediate feedback and interaction</li>
          <li>Suitable for individual or group activities</li>
        </ul>
        <h2>Perfect for</h2>
        <ul>
          <li>Elementary school teachers</li>
          <li>4th grade mathematics curriculum</li>
          <li>Homeschool education</li>
          <li>Math tutoring sessions</li>
          <li>Remote learning environments</li>
        </ul>
      </div>

      {/* Interactive component */}
      <HomePageClient />
    </>
  )
}
