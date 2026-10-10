import type { Metadata } from 'next'
import Link from 'next/link'
import EnablePageScroll from '@/components/EnablePageScroll'

export const metadata: Metadata = {
  title: 'Privacy Policy | Hide Zero Cards',
  description: 'How Hide Zero Cards collects, uses, and protects visitor information.',
  alternates: {
    canonical: '/privacy',
  },
}

const EFFECTIVE_DATE = 'October 10, 2026'
const CONTACT_EMAIL = 'donrayxwilliams@gmail.com'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-16 space-y-8">
      <EnablePageScroll />
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>
          Hide Zero Cards (&ldquo;this site&rdquo;) is a free place-value card game run by Donray Williams. This policy
          explains what information is collected when you visit, why it is collected, and what choices you have. If you
          have questions about this policy, contact{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <Section id="what-we-collect" title="What we collect">
        <p>This site collects a deliberately small amount of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-foreground">Anonymous visit statistics.</strong> Each page load records a page view.
            To count unique visitors, the server creates a one-way salted SHA-256 hash of your IP address combined with
            your browser&apos;s user agent string. The raw IP address is never stored, and the hash cannot be reversed
            to reveal it. A visitor who returns later produces the same hash, so repeat visits are counted once.
            Aggregate totals (page views and unique visitor counts) are shown publicly on the{' '}
            <Link href="/analytics" className="underline hover:text-foreground">
              analytics page
            </Link>
            .
          </li>
          <li>
            <strong className="text-foreground">Error reports.</strong> When something breaks, the site sends an error
            report to Sentry, including the error message, a stack trace, and basic browser information. These reports
            help fix bugs. They are not used for tracking or advertising.
          </li>
          <li>
            <strong className="text-foreground">On-device preferences.</strong> Your browser&apos;s localStorage
            remembers interface preferences, such as whether you have seen the welcome dialog and whether the header is
            collapsed. This data stays on your device and is never sent to the server.
          </li>
        </ul>
      </Section>

      <Section id="what-we-dont-collect" title="What we do not collect">
        <p>
          This site has no accounts, no sign-in, and no sign-up. It does not ask for your name, email address, or any
          other personal details. It sets no cookies of its own, runs no advertising, takes no payments, and has no
          comments, contact forms, or user-generated content.
        </p>
      </Section>

      <Section id="why" title="Why we collect it">
        <ul className="list-disc pl-6 space-y-2">
          <li>Visit statistics show which pages people use, which guides future improvements.</li>
          <li>Error reports identify and fix bugs.</li>
          <li>On-device preferences remember your interface choices between visits.</li>
        </ul>
        <p>Information collected by this site is never sold, rented, or shared with advertisers or data brokers.</p>
      </Section>

      <Section id="retention" title="How long we keep it">
        <p>
          Page-view counts and visitor hashes are kept indefinitely so that long-term statistics remain accurate. Error
          reports are kept according to Sentry&apos;s retention settings. On-device preferences persist in your browser
          until you clear them.
        </p>
      </Section>

      <Section id="third-parties" title="Third parties">
        <p>The site relies on a small number of service providers to operate:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-foreground">Amazon Web Services (US).</strong> Hosting and the database that stores
            visit statistics. Data is processed in the United States.
          </li>
          <li>
            <strong className="text-foreground">Sentry.</strong> Error reporting, as described above.
          </li>
        </ul>
      </Section>

      <Section id="your-rights" title="Your rights">
        <p>
          Depending on where you live, you may have the right to know what information is held about you, to correct it,
          or to request its deletion. Because visit statistics are stored only as anonymous hashes with no link to your
          identity, there is generally nothing to look up or delete. If you believe the site holds information about you
          and want to exercise a privacy right, contact{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>{' '}
          and your request will be handled promptly.
        </p>
      </Section>

      <Section id="children" title="Children's privacy">
        <p>
          This site is a general-audience card game and is not directed at children under 13. It does not knowingly
          collect personal information from children. Because the site has no accounts and asks for no personal details
          from anyone, there is no mechanism for a child to provide personal information here. If you are a parent or
          guardian and believe a child has provided personal information through this site, contact{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>{' '}
          and it will be removed.
        </p>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <p>
          This policy may be updated as the site changes. The effective date at the top will always reflect the current
          version. Continued use of the site after a change means you accept the updated policy.
        </p>
      </Section>
    </div>
  )
}
