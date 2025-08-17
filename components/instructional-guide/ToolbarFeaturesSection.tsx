import { Button } from '@/components/ui/button'
import { CaretDown, DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'

export function ToolbarFeaturesSection() {
  return (
    <div className="space-y-6">
      {/* Toolbar Features */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700">Toolbar Features Guide</h3>
        <div className="space-y-4">
          <div className="border-l-3 border-blue-500 pl-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2 text-slate-700">Roll Button & Random Range</h4>
                  <p className="text-muted-foreground mb-2">
                    Click the <strong>dice icon</strong> to generate random numbers instantly. Watch the dice roll with
                    animation!
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex rounded-md shadow-sm" role="group">
                    <Button size="sm" className="rounded-r-none">
                      <DiceSix className="h-4 w-4" />
                      <span className="hidden md:block">Roll</span>
                    </Button>
                    <Button size="sm" className="rounded-l-none text-sm px-2">
                      <CaretDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm font-medium mb-1 text-blue-800">Advanced: Random Range Settings</p>
                <p className="text-sm text-muted-foreground">Click the dropdown next to Roll to set maximum values:</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>
                    • <span className="font-semibold">1,000</span> - Perfect for beginners
                  </li>
                  <li>
                    • <span className="font-semibold">10,000</span> - Intermediate practice
                  </li>
                  <li>
                    • <span className="font-semibold">100,000</span> - Advanced challenges
                  </li>
                  <li>
                    • <span className="font-semibold">1,000,000</span> - Expert level
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold">Reset to default:</span> Click the reset button to return to the
                  original range setting.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-3 border-slate-400 pl-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2 text-slate-700">Clear Input</h4>
                <p className="text-muted-foreground">
                  Click the <strong>X button</strong> to clear the current number and start fresh.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="hidden md:block">Clear</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-l-3 border-emerald-500 pl-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2 text-slate-700">Zero Cards Toggle</h4>
                <p className="text-muted-foreground">
                  Toggle between <strong>showing/hiding zero cards</strong>. When hidden, only non-zero digits are
                  visible. When shown, the complete number structure including placeholder zeros is displayed.
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 text-slate-600" />
                  <span className="hidden md:block">Zero</span>
                </Button>
                <Button variant="outline" size="sm">
                  <EyeSlash className="h-4 w-4 text-slate-600" />
                  <span className="hidden md:block">Zero</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-l-3 border-amber-500 pl-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2 text-slate-700">Mix Cards</h4>
                <p className="text-muted-foreground">
                  Click <strong>Mix</strong> to randomly scatter all cards across the screen.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button size="sm" variant="outline">
                  <Shuffle className="h-4 w-4 text-purple-600" />
                  <span className="hidden md:block">Mix</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-l-3 border-indigo-500 pl-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2 text-slate-700">Reset Position</h4>
                <p className="text-muted-foreground">
                  Click <strong>Reset</strong> to instantly return all cards to their original positions.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="outline" size="sm">
                  <ArrowClockwise className="h-4 w-4 text-green-600" />
                  <span className="hidden md:block">Reset</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-l-3 border-purple-500 pl-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2 text-slate-700">Number Forms & Representations</h4>
                    <p className="text-muted-foreground mb-2">
                      Click <strong>Number Forms</strong> to explore different ways to write and understand the number:
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <span className="hidden md:block">Number Forms</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium mb-1 text-purple-800">Four Different Representations:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <span className="font-semibold">Standard Form:</span> The number as we normally write it (2,345)
                    </li>
                    <li>
                      • <span className="font-semibold">Word Form:</span> The number written in words (two thousand,
                      three hundred forty-five)
                    </li>
                    <li>
                      • <span className="font-semibold">Unit Form:</span> Each digit with its place value (2 thousands,
                      3 hundreds, 4 tens, 5 ones)
                    </li>
                    <li>
                      • <span className="font-semibold">Expanded Form:</span> Each digit multiplied by its place value
                      (2,000 + 300 + 40 + 5)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
