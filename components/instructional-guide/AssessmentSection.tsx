const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

const checks = [
  { title: 'Place Value Understanding:', text: 'Move digits between place values and observe the changes' },
  { title: 'Card Sorting:', text: 'Arrange mixed cards back into correct numerical order' },
  { title: 'Speed Recognition:', text: 'How quickly place values can be identified' },
  { title: 'Number Forms:', text: 'Convert between Standard, Word, Unit, and Expanded forms' },
  { title: 'Random Practice:', text: 'Work with randomly generated numbers in different ranges' },
  { title: 'Form Conversion:', text: 'Use Number Forms dialog to convert between different representations' },
]

export function AssessmentSection() {
  return (
    <div className="space-y-6">
      {/* Assessment & Learning Checks */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
          Assessment & Learning Checks
        </h3>
        <div className="bg-white dark:bg-[#1a1512] p-4 rounded-2xl space-y-3 border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
          {checks.map((check) => (
            <div key={check.title} className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-4">
              <div
                className="bg-[#C14E33] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0"
                style={baloo}
              >
                ✓
              </div>
              <div className="text-[#2B2118] dark:text-[#FFF6EC]">
                <strong>{check.title}</strong> {check.text}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
