import { CaretDown, DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'

const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

function DemoPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-[#2B2118] dark:border-[#5a4a3a] bg-white dark:bg-[#1a1512] px-4 text-[14px] font-semibold text-[#2B2118] dark:text-[#FFF6EC]"
      style={baloo}
    >
      {children}
    </span>
  )
}

export function ToolbarFeaturesSection() {
  return (
    <section className="space-y-6">
      <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
        Toolbar Features Guide
      </h3>

      <div className="space-y-6">
        <div className="pl-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                  Roll Button & Random Range
                </h4>
                <p className="text-[#6B5D4F] dark:text-[#C9BBA8] mb-2">
                  Click the <strong className="text-[#2B2118] dark:text-[#FFF6EC]">dice icon</strong> to generate random
                  numbers instantly. Watch the dice roll with animation!
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex" role="group">
                  <DemoPill>
                    <DiceSix className="h-4 w-4" />
                    <span className="hidden md:block">Roll</span>
                  </DemoPill>
                  <span
                    className="inline-flex h-10 items-center rounded-l-none rounded-r-full border-2 border-l-0 border-[#2B2118] dark:border-[#5a4a3a] bg-white dark:bg-[#1a1512] px-2 text-[14px]"
                    style={baloo}
                  >
                    <CaretDown className="h-4 w-4 text-[#2B2118] dark:text-[#FFF6EC] dark:text-[#FFF6EC]" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1512] p-3 rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
              <p className="text-sm font-semibold mb-1 text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
                Advanced: Random Range Settings
              </p>
              <p className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">
                Click the dropdown next to Roll to set maximum values:
              </p>
              <ul className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8] mt-1 space-y-1">
                <li>
                  • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">1,000</span> - Perfect for
                  beginners
                </li>
                <li>
                  • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">10,000</span> - Intermediate
                  practice
                </li>
                <li>
                  • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">100,000</span> - Advanced
                  challenges
                </li>
                <li>
                  • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">1,000,000</span> - Expert level
                </li>
              </ul>
              <p className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8] mt-2">
                <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Reset to default:</span> Click the
                reset button to return to the original range setting.
              </p>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                Clear Input
              </h4>
              <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
                Click the <strong className="text-[#2B2118] dark:text-[#FFF6EC]">X button</strong> to clear the current
                number and start fresh.
              </p>
            </div>
            <div className="flex-shrink-0">
              <DemoPill>
                <X className="h-4 w-4 text-[#C14E33]" />
                <span className="hidden md:block">Clear</span>
              </DemoPill>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                Zero Cards Toggle
              </h4>
              <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
                Toggle between <strong className="text-[#2B2118] dark:text-[#FFF6EC]">showing/hiding zero cards</strong>
                . When hidden, only non-zero digits are visible. When shown, the complete number structure including
                placeholder zeros is displayed.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <DemoPill>
                <Eye className="h-4 w-4 text-[#6B5D4F] dark:text-[#C9BBA8]" />
                <span className="hidden md:block">Zero</span>
              </DemoPill>
              <DemoPill>
                <EyeSlash className="h-4 w-4 text-[#6B5D4F] dark:text-[#C9BBA8]" />
                <span className="hidden md:block">Zero</span>
              </DemoPill>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                Mix Cards
              </h4>
              <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
                Click <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Mix</strong> to randomly scatter all cards
                across the screen.
              </p>
            </div>
            <div className="flex-shrink-0">
              <DemoPill>
                <Shuffle className="h-4 w-4 text-[#2B2118] dark:text-[#FFF6EC]" />
                <span className="hidden md:block">Mix</span>
              </DemoPill>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                Reset Position
              </h4>
              <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
                Click <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Reset</strong> to instantly return all
                cards to their original positions.
              </p>
            </div>
            <div className="flex-shrink-0">
              <DemoPill>
                <ArrowClockwise className="h-4 w-4 text-[#2B2118] dark:text-[#FFF6EC]" />
                <span className="hidden md:block">Reset</span>
              </DemoPill>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
                    Number Forms & Representations
                  </h4>
                  <p className="text-[#6B5D4F] dark:text-[#C9BBA8] mb-2">
                    Click <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Number Forms</strong> to explore
                    different ways to write and understand the number:
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <DemoPill>
                    <Layers className="h-4 w-4 text-[#2B2118] dark:text-[#FFF6EC]" />
                    <span className="hidden md:block">Number Forms</span>
                  </DemoPill>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1512] p-3 rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
                <p className="text-sm font-semibold mb-1 text-[#2B2118] dark:text-[#FFF6EC]" style={baloo}>
                  Four Different Representations:
                </p>
                <ul className="text-sm text-[#6B5D4F] dark:text-[#C9BBA8] space-y-1">
                  <li>
                    • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Standard Form:</span> The
                    number as we normally write it (2,345)
                  </li>
                  <li>
                    • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Word Form:</span> The number
                    written in words (two thousand, three hundred forty-five)
                  </li>
                  <li>
                    • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Unit Form:</span> Each digit
                    with its place value (2 thousands, 3 hundreds, 4 tens, 5 ones)
                  </li>
                  <li>
                    • <span className="font-semibold text-[#2B2118] dark:text-[#FFF6EC]">Expanded Form:</span> Each
                    digit multiplied by its place value (2,000 + 300 + 40 + 5)
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
