import type { Metadata } from 'next'
import Link from 'next/link'
import EnablePageScroll from '@/components/EnablePageScroll'

export const metadata: Metadata = {
  title: 'Terms of Use | Hide Zero Cards',
  description: 'The terms governing your use of Hide Zero Cards.',
  alternates: {
    canonical: '/terms',
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

export default function TermsOfUsePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-16 space-y-8">
      <EnablePageScroll />
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
        <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>
          These terms govern your use of Hide Zero Cards (&ldquo;this site&rdquo;), a free place-value card game run by
          Donray Williams. By using the site, you agree to these terms. If you do not agree, please do not use the site.
        </p>
      </div>

      <Section id="service" title="The service">
        <p>
          Hide Zero Cards is a free, browser-based card game for exploring place value. There are no accounts, no
          subscriptions, and no fees. Features may change or be removed at any time without notice.
        </p>
      </Section>

      <Section id="acceptable-use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Disrupt or interfere with the site&apos;s operation, including its analytics endpoints.</li>
          <li>Attempt to inflate visit statistics or otherwise manipulate the site&apos;s measurements.</li>
          <li>Scrape the site aggressively or bypass its technical safeguards.</li>
          <li>Use the site for any unlawful purpose.</li>
        </ul>
      </Section>

      <Section id="intellectual-property" title="Intellectual property">
        <p>
          The game, its design, text, graphics, and code are the property of Donray Williams and are protected by
          applicable intellectual property laws. You may use the site for personal, non-commercial purposes. You may not
          copy, redistribute, or create derivative works from the site&apos;s content or code without permission, except
          as allowed by law.
        </p>
      </Section>

      <Section id="privacy" title="Privacy">
        <p>
          Your use of the site is also governed by the{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          , which explains what information is collected and how it is used.
        </p>
      </Section>

      <Section id="disclaimers" title="Disclaimers">
        <p>
          The site is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind,
          whether express or implied, including warranties of merchantability, fitness for a particular purpose, or
          non-infringement. The site is a casual game, not an educational curriculum, and no particular learning outcome
          is promised.
        </p>
      </Section>

      <Section id="liability" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Donray Williams will not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising from your use of, or inability to use, the site. Total
          liability for any claim related to the site will not exceed the amount you paid to use it, which is zero.
        </p>
      </Section>

      <Section id="governing-law" title="Governing law">
        <p>
          These terms are governed by the laws of the State of New Jersey, without regard to its conflict of laws
          principles.
        </p>
      </Section>

      <Section id="changes" title="Changes to these terms">
        <p>
          These terms may be updated from time to time. The effective date at the top will always reflect the current
          version. Continued use of the site after a change means you accept the updated terms.
        </p>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          Questions about these terms can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
