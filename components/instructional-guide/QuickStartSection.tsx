const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

export function QuickStartSection() {
  return (
    <div className="space-y-6">
      {/* Quick Start for Teachers */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
          Quick Start (2 minutes)
        </h3>
        <div className="bg-white dark:bg-[#1a1512] p-4 rounded-2xl space-y-3 border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
          <div className="flex items-start gap-3">
            <div
              className="bg-[#C14E33] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0"
              style={baloo}
            >
              1
            </div>
            <div className="min-w-0 text-[#2B2118] dark:text-[#FFF6EC]">
              <strong>Enter a number</strong> (1 to 1 billion) in the input field
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="bg-[#C14E33] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0"
              style={baloo}
            >
              2
            </div>
            <div className="min-w-0 text-[#2B2118] dark:text-[#FFF6EC]">
              <strong>Watch cards appear</strong> showing each place value
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="bg-[#C14E33] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0"
              style={baloo}
            >
              3
            </div>
            <div className="min-w-0 text-[#2B2118] dark:text-[#FFF6EC]">
              <strong>Drag cards</strong> to explore place values
            </div>
          </div>
        </div>
      </section>

      {/* What is this tool */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
          What is Hide Zero Cards?
        </h3>
        <p className="text-[#6B5D4F] dark:text-[#C9BBA8] leading-relaxed">
          An interactive tool that makes <strong className="text-[#2B2118] dark:text-[#FFF6EC]">place values</strong>{' '}
          tangible. Cards represent each digit in a number, allowing you to see and manipulate how large numbers are
          built from smaller parts.
        </p>
      </section>

      {/* Color Guide */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
          Understanding Card Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1512] rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Ones Period</span>
              <div className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">Red shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1512] rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Thousands Period</span>
              <div className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">Yellow shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1512] rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Millions Period</span>
              <div className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">Green shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1512] rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Billions Period</span>
              <div className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">Blue shades</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
