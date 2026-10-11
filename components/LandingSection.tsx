'use client'

const steps = [
  { n: 1, label: 'Type a number' },
  { n: 2, label: 'Drag the cards' },
  { n: 3, label: 'Hide the zeros' },
]

export function LandingSection() {
  return (
    <section
      aria-label="About Hide Zero Cards"
      className="mx-auto max-w-[900px] px-7 pb-20 pt-14 text-center"
      style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
    >
      <h2 className="mb-4 text-[40px] font-extrabold tracking-tight text-[#2B2118] max-md:text-[30px]">
        Place value that <span className="text-[#E76F51]">clicks</span>
      </h2>
      <p className="mx-auto mb-3 max-w-[700px] text-[19px] leading-relaxed text-[#2B2118]">
        Hide Zero Cards makes place value click. Built for grades 2 to 4: kids type a number, drag the cards, and hide
        the zeros to see what each digit is really worth.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="flex items-center rounded-[18px] border-2 border-[#E8DCC8] bg-white px-6 py-4 text-[17px] font-semibold text-[#2B2118]"
            style={{ boxShadow: '0 3px 0 rgba(43, 33, 24, 0.08)' }}
          >
            <span className="mr-2.5 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#E76F51] text-[16px] font-bold text-white">
              {s.n}
            </span>
            {s.label}
          </div>
        ))}
      </div>
    </section>
  )
}
