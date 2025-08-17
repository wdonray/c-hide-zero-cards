export function QuickStartSection() {
  return (
    <div className="space-y-6">
      {/* Quick Start for Teachers */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700">Quick Start (2 minutes)</h3>
        <div className="bg-blue-50/50 p-4 rounded-lg space-y-3 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              1
            </div>
            <div>
              <strong>Enter a number</strong> (1 to 1 billion) in the input field
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              2
            </div>
            <div>
              <strong>Watch cards appear</strong> showing each digit
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              3
            </div>
            <div>
              <strong>Drag cards</strong> to explore place values
            </div>
          </div>
        </div>
      </section>

      {/* What is this tool */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-2 text-slate-700">What is Hide Zero Cards?</h3>
        <p className="text-muted-foreground leading-relaxed">
          An interactive tool that makes <strong>place values</strong> tangible. Cards represent each digit in a number,
          allowing you to see and manipulate how large numbers are built from smaller parts. Designed for understanding
          the difference between 100, 1,000, and 10,000.
        </p>
      </section>

      {/* Color Guide */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-slate-700">Understanding the Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-slate-800">Ones Period</span>
              <div className="text-sm text-slate-600">Red shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-slate-800">Thousands Period</span>
              <div className="text-sm text-slate-600">Yellow shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-slate-800">Millions Period</span>
              <div className="text-sm text-slate-600">Green shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-slate-800">Billions Period</span>
              <div className="text-sm text-slate-600">Blue shades</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
