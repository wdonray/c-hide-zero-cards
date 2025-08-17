export function QuickStartSection() {
  return (
    <div className="space-y-6">
      {/* Quick Start for Teachers */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700 dark:text-blue-300">
          Quick Start (2 minutes)
        </h3>
        <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3 border border-blue-100 dark:border-blue-800">
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
        <h3 className="font-semibold text-lg text-foreground mb-2 text-slate-700 dark:text-slate-300">
          What is Hide Zero Cards?
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          An interactive tool that makes <strong>place values</strong> tangible. Cards represent each digit in a number,
          allowing you to see and manipulate how large numbers are built from smaller parts. Designed for understanding
          the difference between 100, 1,000, and 10,000.
        </p>
      </section>

      {/* Color Guide */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-slate-700 dark:text-slate-300">
          Understanding the Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-800">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-foreground">Ones Period</span>
              <div className="text-sm text-muted-foreground">Red shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-800">
            <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-foreground">Thousands Period</span>
              <div className="text-sm text-muted-foreground">Yellow shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-foreground">Millions Period</span>
              <div className="text-sm text-muted-foreground">Green shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-foreground">Billions Period</span>
              <div className="text-sm text-muted-foreground">Blue shades</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
