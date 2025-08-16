import { Clock, Target, Brain } from '@phosphor-icons/react'

export function QuickStartSection() {
  return (
    <div className="space-y-6">
      {/* Quick Start for Teachers */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-500" />
          Quick Start (2 minutes)
        </h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <strong>Enter a number</strong> (1 to 1 billion) in the input field
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <strong>Watch cards appear</strong> showing each digit
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
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
        <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-red-500" />
          What is Hide Zero Cards?
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          An interactive tool that makes <strong>place values</strong> tangible. Students can literally see and touch
          how large numbers are built from smaller parts. Perfect for <strong>fourth-grade learners</strong> who need to
          understand the difference between 100, 1,000, and 10,000.
        </p>
      </section>

      {/* Color Guide */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-pink-500" />
          Understanding the Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <span className="text-black font-semibold">Ones Period</span>
              <div className="text-sm text-muted-foreground">Red shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <span className="text-black font-semibold">Thousands Period</span>
              <div className="text-sm text-muted-foreground">Yellow shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <span className="text-black font-semibold">Millions Period</span>
              <div className="text-sm text-muted-foreground">Green shades</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div>
              <span className="text-black font-semibold">Billions Period</span>
              <div className="text-sm text-muted-foreground">Blue shades</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
