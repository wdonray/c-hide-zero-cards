'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Question,
  GraduationCap,
  Target,
  Brain,
  GameController,
  Pencil,
  DiceSix,
  Mouse,
  Shuffle,
  ArrowClockwise,
  Palette,
  ChalkboardTeacher,
  Lightbulb,
  Clock,
  Users,
  X,
  Eye,
  ArrowsOut,
  CaretDown,
} from '@phosphor-icons/react'
import { Separator } from './ui/separator'

export function InstructionalGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Question className="h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 pr-8">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Hide Zero Cards - Teacher&apos;s Guide
            </span>
          </DialogTitle>
          <Separator />
          <DialogDescription className="text-muted-foreground">
            Transform how your students understand <strong>place values</strong> with this interactive, hands-on
            learning tool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 text-sm">
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
              An interactive tool that makes <strong>place values</strong> tangible. Students can literally see and
              touch how large numbers are built from smaller parts. Perfect for <strong>fourth-grade learners</strong>{' '}
              who need to understand the difference between 100, 1,000, and 10,000.
            </p>
          </section>

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
                  Click the <strong>dice icon</strong> to generate random numbers instantly. Watch the dice roll with
                  animation!
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Advanced: Random Range Settings</p>
                  <p className="text-sm text-blue-700">
                    Click the <CaretDown className="h-3 w-3 inline" /> dropdown next to Roll to set maximum values:
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>
                      • <strong>1,000</strong> - Perfect for beginners
                    </li>
                    <li>
                      • <strong>10,000</strong> - Intermediate practice
                    </li>
                    <li>
                      • <strong>100,000</strong> - Advanced challenges
                    </li>
                    <li>
                      • <strong>1,000,000</strong> - Expert level
                    </li>
                  </ul>
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
                  Toggle between <strong>showing/hiding zero cards</strong>. When hidden, students focus on non-zero
                  digits. When shown, they see the complete number structure including placeholder zeros.
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
                  <ArrowsOut className="h-4 w-4 text-indigo-500" />
                  Expand Dialog
                </h4>
                <p className="text-muted-foreground">
                  Click <strong>Expand</strong> to see the number broken down into its expanded form. Shows each digit
                  multiplied by its place value (e.g., 2 × 100 = 200).
                </p>
              </div>
            </div>
          </section>

          {/* How to Use */}
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
                  Enter a number, then drag individual cards to see how the number changes. Ask: &ldquo;What happens
                  when you move the 5 from hundreds to ones place?&rdquo;
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <Shuffle className="h-4 w-4 text-purple-500" />
                  Activity 2: Card Sorting Challenge
                </h4>
                <p className="text-muted-foreground">
                  Click <strong>Mix</strong> to scatter cards, then challenge students to arrange them back in order.
                  Time them for extra engagement!
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <ArrowsOut className="h-4 w-4 text-blue-500" />
                  Activity 3: Expanded Form Discovery
                </h4>
                <p className="text-muted-foreground">
                  Use the <strong>Expand</strong> button to show students how 2,345 = 2,000 + 300 + 40 + 5. This
                  reinforces the concept of place value.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <DiceSix className="h-4 w-4 text-green-500" />
                  Activity 4: Random Number Practice
                </h4>
                <p className="text-muted-foreground">
                  Use the <strong>Roll</strong> button with different range settings. Start with 1,000 for beginners,
                  then increase to 100,000 for advanced students.
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

          {/* Color Guide */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-500" />
              Understanding the Colors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div>
                  <strong>Ones Period</strong>
                  <div className="text-sm text-muted-foreground">Red shades</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <strong>Thousands Period</strong>
                  <div className="text-sm text-muted-foreground">Yellow shades</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <strong>Millions Period</strong>
                  <div className="text-sm text-muted-foreground">Green shades</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div>
                  <strong>Billions Period</strong>
                  <div className="text-sm text-muted-foreground">Blue shades</div>
                </div>
              </div>
            </div>
          </section>

          {/* Classroom Tips */}
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
                    • Show <strong>Expand</strong> dialog to explain place values
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

          {/* Assessment Ideas */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Assessment & Learning Checks
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-[20px_1fr] items-center gap-4">
                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <strong>Ask students:</strong> &ldquo;What happens when you move the 2 from the hundreds place to the
                  ones place?&rdquo;
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-4">
                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <strong>Challenge them:</strong> &ldquo;Put the cards back in order after I mix them up&rdquo;
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-4">
                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <strong>Observe:</strong> How quickly they can identify place values
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-4">
                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <strong>Test understanding:</strong> &ldquo;Use Expand to show me what 3,456 equals&rdquo;
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-4">
                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <div>
                  <strong>Random practice:</strong> &ldquo;Roll a number between 1,000 and 10,000 and tell me the place
                  value of each digit&rdquo;
                </div>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Let&apos;s Start Teaching!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
