export function ActivitiesSection() {
  return (
    <div className="space-y-6">
      {/* Interactive Learning Activities */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700 dark:text-blue-300">
          Interactive Learning Activities
        </h3>
        <div className="space-y-6">
          <div className="pl-4">
            <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
              Activity 1: Number Exploration
            </h4>
            <p className="text-muted-foreground">
              Enter a number, then drag individual cards to see how the number changes. Observe what happens when you
              move digits between different place values.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
              Activity 2: Card Sorting Challenge
            </h4>
            <p className="text-muted-foreground">
              Click <strong>Mix</strong> to scatter cards, then arrange them back in order. Time yourself for added
              challenge.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
              Activity 3: Number Forms Exploration
            </h4>
            <p className="text-muted-foreground">
              Use the <strong>Number Forms</strong> button to explore four different ways to represent the same number.
              Switch between Standard, Word, Unit, and Expanded forms.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
              Activity 4: Random Number Practice
            </h4>
            <p className="text-muted-foreground">
              Use the <strong>Roll</strong> button with different range settings. Start with 1,000, then increase to
              100,000 for more complex numbers.
            </p>
          </div>

          <div className="pl-4">
            <h4 className="font-medium text-foreground mb-2 text-slate-700 dark:text-slate-300">
              Activity 5: Zero Card Investigation
            </h4>
            <p className="text-muted-foreground">
              Toggle zero cards on/off to understand the difference between &ldquo;no digit&rdquo; and &ldquo;zero
              digit&rdquo; in place value.
            </p>
          </div>
        </div>
      </section>

      {/* Classroom Implementation Tips */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700 dark:text-blue-300">
          Classroom Implementation Tips
        </h3>
        <div className="space-y-6">
          <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <h4 className="font-medium text-foreground mb-2 text-emerald-900 dark:text-emerald-100">
              Whole Class Activities
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                • Use on <strong>interactive whiteboards</strong> for demonstrations
              </li>
              <li>• Project the tool and let students call out moves</li>
              <li>
                • Start with <strong>smaller numbers</strong> (1-1,000)
              </li>
              <li>• Gradually increase to larger numbers</li>
              <li>
                • Use <strong>Mix</strong> feature for class challenges
              </li>
              <li>
                • Show <strong>Number Forms</strong> dialog to explain place values
              </li>
            </ul>
          </div>
          <div className="bg-amber-50/30 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
            <h4 className="font-medium text-foreground mb-2 text-amber-900 dark:text-amber-100">Individual Practice</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                • Students work on <strong>tablets or computers</strong>
              </li>
              <li>
                • Ask students to <strong>explain their thinking</strong>
              </li>
              <li>
                • Use <strong>random features</strong> for new challenges
              </li>
              <li>
                • Adjust <strong>theme (light/dark)</strong> for classroom lighting
              </li>
              <li>
                • Have students use <strong>Clear</strong> between exercises
              </li>
              <li>
                • Practice with <strong>zero cards hidden</strong> first
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
