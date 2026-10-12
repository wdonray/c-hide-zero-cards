const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

export function ActivitiesSection() {
  return (
    <div className="space-y-6">
      {/* Interactive Learning Activities */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
          Interactive Learning Activities
        </h3>
        <div className="space-y-6">
          <div className="pl-4">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Activity 1: Number Exploration
            </h4>
            <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
              Enter a number, then drag individual cards to see how the number changes. Observe what happens when you
              move digits between different place values.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Activity 2: Card Sorting Challenge
            </h4>
            <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
              Click <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Mix</strong> to scatter cards, then arrange
              them back in order. Time yourself for added challenge.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Activity 3: Number Forms Exploration
            </h4>
            <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
              Use the <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Number Forms</strong> button to explore
              four different ways to represent the same number. Switch between Standard, Word, Unit, and Expanded forms.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Activity 4: Random Number Practice
            </h4>
            <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
              Use the <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Roll</strong> button with different range
              settings. Start with 1,000, then increase to 100,000 for more complex numbers.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Activity 5: Zero Card Investigation
            </h4>
            <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
              Toggle zero cards on/off to understand the difference between &ldquo;no digit&rdquo; and &ldquo;zero
              digit&rdquo; in place value.
            </p>
          </div>
        </div>
      </section>

      {/* Classroom Implementation Tips */}
      <section>
        <h3 className="font-bold text-lg text-[#2B2118] dark:text-[#FFF6EC] mb-3" style={baloo}>
          Classroom Implementation Tips
        </h3>
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1512] p-4 rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Whole Class Activities
            </h4>
            <ul className="text-[#6B5D4F] dark:text-[#C9BBA8] space-y-2 text-sm">
              <li>
                • Use on <strong className="text-[#2B2118] dark:text-[#FFF6EC]">interactive whiteboards</strong> for
                demonstrations
              </li>
              <li>• Project the tool and let students call out moves</li>
              <li>
                • Start with <strong className="text-[#2B2118] dark:text-[#FFF6EC]">smaller numbers</strong> (1-1,000)
              </li>
              <li>• Gradually increase to larger numbers</li>
              <li>
                • Use <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Mix</strong> feature for class challenges
              </li>
              <li>
                • Show <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Number Forms</strong> dialog to explain
                place values
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-[#1a1512] p-4 rounded-2xl border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10">
            <h4 className="font-semibold text-[#2B2118] dark:text-[#FFF6EC] mb-2" style={baloo}>
              Individual Practice
            </h4>
            <ul className="text-[#6B5D4F] dark:text-[#C9BBA8] space-y-2 text-sm">
              <li>
                • Students work on <strong className="text-[#2B2118] dark:text-[#FFF6EC]">tablets or computers</strong>
              </li>
              <li>
                • Ask students to <strong className="text-[#2B2118] dark:text-[#FFF6EC]">explain their thinking</strong>
              </li>
              <li>
                • Use <strong className="text-[#2B2118] dark:text-[#FFF6EC]">random features</strong> for new challenges
              </li>
              <li>
                • Adjust <strong className="text-[#2B2118] dark:text-[#FFF6EC]">theme (light/dark)</strong> for
                classroom lighting
              </li>
              <li>
                • Have students use <strong className="text-[#2B2118] dark:text-[#FFF6EC]">Clear</strong> between
                exercises
              </li>
              <li>
                • Practice with <strong className="text-[#2B2118] dark:text-[#FFF6EC]">zero cards hidden</strong> first
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
