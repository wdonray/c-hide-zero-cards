import { CaretDown, DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'

export function ToolbarFeaturesSection() {
  return (
    <section className="space-y-6">
      <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700 dark:text-blue-300">
        Toolbar Features Guide
      </h3>

      <div className="space-y-6">
        <div className="pl-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
                  Roll Button & Random Range
                </h4>
                <p className="text-muted-foreground mb-2">
                  Click the <strong>dice icon</strong> to generate random numbers instantly. Watch the dice roll with
                  animation!
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="inline-flex items-center" role="group" aria-label="Roll random number demo">
                  <span
                    className="inline-flex h-[48px] items-center gap-2 rounded-l-full rounded-r-none border-2 border-r-0 border-[#2B2118] bg-white px-4 text-[16px] font-semibold text-[#2B2118]"
                    style={{
                      fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                      boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                    }}
                  >
                    <DiceSix className="h-5 w-5" />
                    <span className="hidden md:block">Roll</span>
                  </span>
                  <span
                    className="inline-flex h-[48px] items-center justify-center rounded-l-none rounded-r-full border-2 border-l-0 border-[#2B2118] bg-white px-3 text-[#2B2118]"
                    style={{
                      fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                      boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                    }}
                  >
                    <CaretDown className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm font-medium mb-1 text-blue-900 dark:text-blue-100">
                Advanced: Random Range Settings
              </p>
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

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">Clear Input</h4>
              <p className="text-muted-foreground">
                Click the <strong>X button</strong> to clear the current number and start fresh.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-transparent px-4 text-[16px] font-semibold text-[#6B5D4F]"
                style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
              >
                <X className="h-5 w-5 text-[#C14E33]" />
                <span className="hidden md:block">Clear</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">Zero Cards Toggle</h4>
              <p className="text-muted-foreground">
                Toggle between <strong>showing/hiding zero cards</strong>. When hidden, only non-zero digits are
                visible. When shown, the complete number structure including placeholder zeros is displayed.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <span
                className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-[#C14E33] px-4 text-[16px] font-semibold text-white"
                style={{
                  fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                  boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                }}
              >
                <Eye className="h-5 w-5" />
                <span className="hidden md:block">Show zeros</span>
              </span>
              <span
                className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-[#C14E33] px-4 text-[16px] font-semibold text-white"
                style={{
                  fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                  boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                }}
              >
                <EyeSlash className="h-5 w-5" />
                <span className="hidden md:block">Hide zeros</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">Mix Cards</h4>
              <p className="text-muted-foreground">
                Click <strong>Mix</strong> to randomly scatter all cards across the screen.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-4 text-[16px] font-semibold text-[#2B2118]"
                style={{
                  fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                  boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                }}
              >
                <Shuffle className="h-5 w-5" />
                <span className="hidden md:block">Mix</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">Reset Position</h4>
              <p className="text-muted-foreground">
                Click <strong>Reset</strong> to instantly return all cards to their original positions.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-4 text-[16px] font-semibold text-[#2B2118]"
                style={{
                  fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                  boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                }}
              >
                <ArrowClockwise className="h-5 w-5" />
                <span className="hidden md:block">Reset</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
                    Number Forms & Representations
                  </h4>
                  <p className="text-muted-foreground mb-2">
                    Click <strong>Number Forms</strong> to explore different ways to write and understand the number:
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex h-[48px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-4 text-[16px] font-semibold text-[#2B2118]"
                    style={{
                      fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                      boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
                    }}
                  >
                    <Layers className="h-5 w-5" />
                    <span className="hidden md:block">Ways to write it</span>
                  </span>
                </div>
              </div>

              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                <p className="text-sm font-medium mb-1 text-purple-900 dark:text-purple-100">
                  Four Different Representations:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <span className="font-semibold">Standard Form:</span> The number as we normally write it (2,345)
                  </li>
                  <li>
                    • <span className="font-semibold">Word Form:</span> The number written in words (two thousand, three
                    hundred forty-five)
                  </li>
                  <li>
                    • <span className="font-semibold">Unit Form:</span> Each digit with its place value (2 thousands, 3
                    hundreds, 4 tens, 5 ones)
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
  )
}
