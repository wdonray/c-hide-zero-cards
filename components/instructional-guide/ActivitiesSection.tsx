import {
  Mouse,
  Pencil,
  Shuffle,
  SquaresFour,
  DiceSix,
  Eye,
  ChalkboardTeacher,
  Users,
  Lightbulb,
} from '@phosphor-icons/react'

export function ActivitiesSection() {
  return (
    <div className="space-y-6">
      {/* Interactive Learning Activities */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <Mouse className="h-5 w-5 text-green-500" />
          Interactive Learning Activities
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Pencil className="h-4 w-4 text-orange-500" />
              Activity 1: Number Exploration
            </h4>
            <p className="text-muted-foreground">
              Enter a number, then drag individual cards to see how the number changes. Ask: &ldquo;What happens when
              you move the 5 from hundreds to ones place?&rdquo;
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Shuffle className="h-4 w-4 text-purple-500" />
              Activity 2: Card Sorting Challenge
            </h4>
            <p className="text-muted-foreground">
              Click <strong>Mix</strong> to scatter cards, then challenge students to arrange them back in order. Time
              them for extra engagement!
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <SquaresFour className="h-4 w-4 text-blue-500" />
              Activity 3: Number Forms Exploration
            </h4>
            <p className="text-muted-foreground">
              Use the <strong>Number Forms</strong> button to show students four different ways to represent the same
              number. Switch between Standard, Word, Unit, and Expanded forms to build comprehensive understanding.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <DiceSix className="h-4 w-4 text-green-500" />
              Activity 4: Random Number Practice
            </h4>
            <p className="text-muted-foreground">
              Use the <strong>Roll</strong> button with different range settings. Start with 1,000 for beginners, then
              increase to 100,000 for advanced students.
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-red-500" />
              Activity 5: Zero Card Investigation
            </h4>
            <p className="text-muted-foreground">
              Toggle zero cards on/off to help students understand the difference between &ldquo;no digit&rdquo; and
              &ldquo;zero digit&rdquo; in place value.
            </p>
          </div>
        </div>
      </section>

      {/* Classroom Implementation Tips */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <ChalkboardTeacher className="h-5 w-5 text-indigo-500" />
          Classroom Implementation Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
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
          <div>
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Individual Practice
            </h4>
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
