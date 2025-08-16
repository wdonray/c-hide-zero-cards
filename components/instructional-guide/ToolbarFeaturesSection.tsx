import {
  GameController,
  DiceSix,
  CaretDown,
  X,
  Eye,
  Shuffle,
  ArrowClockwise,
  SquaresFour,
  CaretUp,
  Target,
  Mouse,
} from '@phosphor-icons/react'

export function ToolbarFeaturesSection() {
  return (
    <div className="space-y-6">
      {/* Toolbar Features */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <GameController className="h-5 w-5 text-green-500" />
          Toolbar Features Guide
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <DiceSix className="h-4 w-4 text-blue-500" />
              Roll Button & Random Range
            </h4>
            <p className="text-muted-foreground mb-2">
              Click the <strong>dice icon</strong> to generate random numbers instantly. Watch the dice roll with ion!
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Advanced: Random Range Settings</p>
              <p className="text-sm text-blue-700">
                Click the <CaretDown className="h-3 w-3 inline" /> dropdown next to Roll to set maximum values:
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>
                  • <span className="text-black font-semibold">1,000</span> - Perfect for beginners
                </li>
                <li>
                  • <span className="text-black font-semibold">10,000</span> - Intermediate practice
                </li>
                <li>
                  • <span className="text-black font-semibold">100,000</span> - Advanced challenges
                </li>
                <li>
                  • <span className="text-black font-semibold">1,000,000</span> - Expert level
                </li>
              </ul>
              <p className="text-sm text-blue-700 mt-2">
                <span className="text-black font-semibold">Reset to default:</span> Click the reset button to return to
                the original range setting.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <X className="h-4 w-4 text-red-500" />
              Clear Input
            </h4>
            <p className="text-muted-foreground">
              Click the <strong>X button</strong> to clear the current number and start fresh. Great for resetting
              between different exercises.
            </p>
          </div>

          <div className="border-l-4 border-slate-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-slate-500" />
              Zero Cards Toggle
            </h4>
            <p className="text-muted-foreground">
              Toggle between <strong>showing/hiding zero cards</strong>. When hidden, students focus on non-zero digits.
              When shown, they see the complete number structure including placeholder zeros.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Shuffle className="h-4 w-4 text-purple-500" />
              Mix Cards
            </h4>
            <p className="text-muted-foreground">
              Click <strong>Mix</strong> to randomly scatter all cards across the screen. Challenge students to drag
              them back into the correct order!
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <ArrowClockwise className="h-4 w-4 text-green-500" />
              Reset Position
            </h4>
            <p className="text-muted-foreground">
              Click <strong>Reset</strong> to instantly return all cards to their original positions. Perfect for
              starting over or checking answers.
            </p>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <SquaresFour className="h-4 w-4 text-indigo-500" />
              Number Forms & Representations
            </h4>
            <p className="text-muted-foreground mb-2">
              Click <strong>Number Forms</strong> to explore different ways to write and understand the number:
            </p>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-indigo-800 mb-1">Four Different Representations:</p>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>
                  • <strong>Standard Form:</strong> The number as we normally write it (2,345)
                </li>
                <li>
                  • <strong>Word Form:</strong> The number written in words (two thousand, three hundred forty-five)
                </li>
                <li>
                  • <strong>Unit Form:</strong> Each digit with its place value (2 thousands, 3 hundreds, 4 tens, 5
                  ones)
                </li>
                <li>
                  • <strong>Expanded Form:</strong> Each digit multiplied by its place value (2,000 + 300 + 40 + 5)
                </li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-gray-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <CaretUp className="h-4 w-4 text-gray-500" />
              Header Collapse/Expand
            </h4>
            <p className="text-muted-foreground">
              Click the <strong>up/down arrow</strong> in the top-right to collapse or expand the header. This gives
              more screen space for the cards when needed.
            </p>
          </div>
        </div>
      </section>

      {/* Button States & Responsive Design */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <GameController className="h-5 w-5 text-orange-500" />
          Button States & Responsive Design
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-500" />
              When Buttons Are Disabled
            </h4>
            <p className="text-muted-foreground mb-2">
              Most toolbar buttons are disabled until you enter a number. This prevents confusion and ensures students
              have a number to work with:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>Clear, Zero, Mix, Reset, Number Forms:</strong> Only active when a number is entered
              </li>
              <li>
                • <strong>Reset Position:</strong> Only active after cards have been moved or mixed
              </li>
              <li>
                • <strong>Roll:</strong> Always active, but shows animation when rolling
              </li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Mouse className="h-4 w-4 text-blue-500" />
              Mobile vs Desktop Experience
            </h4>
            <p className="text-muted-foreground mb-2">
              The toolbar adapts to different screen sizes for optimal learning:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>Mobile:</strong> Compact buttons with icons only, random range dropdown hidden
              </li>
              <li>
                • <strong>Desktop:</strong> Full buttons with text labels, all features visible
              </li>
              <li>
                • <strong>Touch-friendly:</strong> Larger touch targets on mobile devices
              </li>
              <li>
                • <strong>Responsive:</strong> Smooth transitions between screen sizes
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
