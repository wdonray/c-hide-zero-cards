import type { Metadata } from 'next'
import Link from 'next/link'
import EnablePageScroll from '@/components/EnablePageScroll'

export const metadata: Metadata = {
  title: 'About | Hide Zero Cards',
  description:
    'Hide Zero Cards is a free place-value tool for elementary classrooms. Roll a number, hide the zeros, and let students explore how numbers are built.',
  alternates: {
    canonical: '/about',
  },
}

const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

const STEPS = [
  {
    title: 'Roll or type a number',
    body: 'Roll a random number, pick a range, or type your own. The number fans out as place-value cards across the screen.',
  },
  {
    title: 'Hide the zeros',
    body: 'One tap hides every zero card in place. Students see 3,743 as 3, 7, 4, 3 and focus on what each digit is worth.',
  },
  {
    title: 'Drag to explore',
    body: 'Pull any card out to reveal its full value. 3,000 slides out from behind the 3. Mix scatters the cards for a rebuilding activity.',
  },
]

const FEATURES = [
  {
    title: 'Hide and show zeros',
    body: 'Zero cards hide in place without shifting the fan, so the layout never jumps.',
  },
  {
    title: 'Random number ranges',
    body: 'Roll numbers up to 100 or up to a billion, tuned to the level you are teaching.',
  },
  {
    title: 'Ways to write it',
    body: 'Word form, expanded form, and unit form open in a panel for reading and writing practice.',
  },
  {
    title: 'Mix and rebuild',
    body: 'Scatter the cards, then have students drag them back into place value order.',
  },
  {
    title: 'Dark mode',
    body: 'A warm dark theme for projectors and smartboards in dim classrooms.',
  },
  {
    title: 'No login, no ads',
    body: 'Free for classrooms. Nothing to install, no accounts, nothing tracking students.',
  },
]

function FanVisual() {
  const cards = [
    { text: '3,000', from: '#A16207', to: '#8E5606' },
    { text: '700', from: '#991B1B', to: '#871818' },
    { text: '40', from: '#B91C1C', to: '#A31919' },
    { text: '3', from: '#DC2626', to: '#C22121' },
  ]
  return (
    <div className="flex items-center justify-center py-6" aria-hidden="true">
      <div className="flex items-stretch">
        {cards.map((card, i) => (
          <div
            key={card.text}
            className="flex h-28 w-36 items-center justify-center rounded-2xl border-2 border-black/10 px-3 text-2xl font-bold text-white shadow-[0_4px_0_rgba(43,33,24,0.2)] md:h-32 md:w-40 md:text-3xl"
            style={{
              background: `linear-gradient(180deg, ${card.from} 0%, ${card.to} 100%)`,
              marginLeft: i === 0 ? 0 : '-2.5rem',
              zIndex: i + 1,
              ...baloo,
            }}
          >
            {card.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-16 pt-6 md:px-8 md:pt-8">
      <EnablePageScroll />

      {/* Hero */}
      <div className="space-y-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#C14E33]" style={baloo}>
          A place-value tool for elementary classrooms
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC] md:text-5xl" style={baloo}>
          Hide Zero Cards
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#6B5D4F] dark:text-[#C9BBA8]">
          The digital version of place-value arrow cards. Build any number as a fan of cards, hide the zeros with one
          tap, and let students pull cards apart to see what each digit is really worth.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex h-[64px] cursor-pointer items-center gap-2 rounded-full border-2 border-[#8F3520] bg-[#C14E33] px-[28px] text-[18px] font-semibold text-white shadow-[0_4px_0_rgba(43,33,24,0.25)] transition-all hover:-translate-y-px hover:bg-[#a83f28] active:translate-y-[2px]"
            style={baloo}
            title="Open the Hide Zero Cards tool"
          >
            Open the tool
          </Link>
        </div>
        <FanVisual />
      </div>

      {/* How it works */}
      <section aria-labelledby="how-it-works" className="space-y-6">
        <h2
          id="how-it-works"
          className="text-center text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]"
          style={baloo}
        >
          How it works
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-3xl border-2 border-[#2B2118]/10 bg-white p-6 shadow-[0_4px_0_rgba(43,33,24,0.08)] dark:border-[#5a4a3a]/30 dark:bg-[#1a1512]"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C14E33] text-lg font-bold text-white"
                style={baloo}
              >
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
                {step.title}
              </h3>
              <p className="leading-relaxed text-[#6B5D4F] dark:text-[#C9BBA8]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why hide zeros */}
      <section
        aria-labelledby="why-hide-zeros"
        className="space-y-4 rounded-3xl border-2 border-[#2B2118]/10 bg-[#FFF6EC] p-6 shadow-[0_4px_0_rgba(43,33,24,0.08)] dark:border-[#5a4a3a]/30 dark:bg-[#2a2118] md:p-8"
      >
        <h2
          id="why-hide-zeros"
          className="text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]"
          style={baloo}
        >
          Why hide the zeros?
        </h2>
        <div className="space-y-3 leading-relaxed text-[#6B5D4F] dark:text-[#C9BBA8]">
          <p>
            Young students often read 3,743 as separate digits rather than as a sum of place values. Hiding the zeros
            strips the number down to 3, 7, 4, 3 so the class can talk about what each digit stands for. Then pulling
            the 3 card out reveals 3,000, and the connection clicks: the 3 was three thousand all along.
          </p>
          <p>It mirrors physical arrow cards teachers already use, without the printing, cutting, and lost pieces.</p>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="space-y-6">
        <h2
          id="features"
          className="text-center text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]"
          style={baloo}
        >
          Built for the classroom
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border-2 border-[#2B2118]/10 bg-white p-6 shadow-[0_4px_0_rgba(43,33,24,0.08)] dark:border-[#5a4a3a]/30 dark:bg-[#1a1512]"
            >
              <h3 className="mb-2 text-lg font-bold text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
                {feature.title}
              </h3>
              <p className="leading-relaxed text-[#6B5D4F] dark:text-[#C9BBA8]">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it is for */}
      <section aria-labelledby="who" className="space-y-4">
        <h2 id="who" className="text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
          Who it is for
        </h2>
        <p className="leading-relaxed text-[#6B5D4F] dark:text-[#C9BBA8]">
          Hide Zero Cards is for elementary teachers and homeschool educators teaching place value, whether you follow a
          published curriculum or your own sequence. It works on projectors, smartboards, tablets, and Chromebooks.
          There is also a built-in teacher&apos;s guide in the app with activity ideas.
        </p>
      </section>

      {/* CTA */}
      <div className="space-y-4 pt-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
          Ready for your next place-value lesson?
        </h2>
        <p className="mx-auto max-w-xl text-[#6B5D4F] dark:text-[#C9BBA8]">
          Open the tool and roll your first number. Free for classrooms, no login, no ads.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex h-[64px] cursor-pointer items-center gap-2 rounded-full border-2 border-[#8F3520] bg-[#C14E33] px-[28px] text-[18px] font-semibold text-white shadow-[0_4px_0_rgba(43,33,24,0.25)] transition-all hover:-translate-y-px hover:bg-[#a83f28] active:translate-y-[2px]"
            style={baloo}
            title="Open the Hide Zero Cards tool"
          >
            Open the tool
          </Link>
        </div>
      </div>
    </div>
  )
}
