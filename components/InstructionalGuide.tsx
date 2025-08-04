'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
} from '@phosphor-icons/react'
import { Separator } from './ui/separator'

export function InstructionalGuide() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Question className="h-4 w-4" />
          How to Use
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Hide Zero Cards - Teacher&apos;s Guide
            </span>
          </AlertDialogTitle>
          <Separator />
          <AlertDialogDescription className="text-muted-foreground">
            Transform how your students understand <strong>place values</strong> with this interactive, hands-on
            learning tool
          </AlertDialogDescription>
        </AlertDialogHeader>

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

          {/* How to Use */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <GameController className="h-5 w-5 text-green-500" />
              How to Use the Tool
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <Pencil className="h-4 w-4 text-blue-500" />
                  Step 1: Enter a Number
                </h4>
                <p className="text-muted-foreground">
                  Type any number from <strong>1 to 1,000,000,000</strong> in the input field. Each digit becomes a
                  separate, <strong>color-coded card</strong>!
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <DiceSix className="h-4 w-4 text-orange-500" />
                  Step 2: Try Random Numbers
                </h4>
                <p className="text-muted-foreground">
                  Click &ldquo;<strong>Roll a new number</strong>&rdquo; to generate random numbers for practice. Watch
                  the dice roll with animation!
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <Mouse className="h-4 w-4 text-purple-500" />
                  Step 3: Drag and Explore
                </h4>
                <p className="text-muted-foreground">
                  Click and drag the number cards around. See how the number changes when you move cards!
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <Shuffle className="h-4 w-4 text-red-500" />
                  Step 4: Challenge Students
                </h4>
                <p className="text-muted-foreground">
                  Click &ldquo;<strong>Mix up cards</strong>&rdquo; to scatter cards randomly, then challenge students
                  to put them back in order!
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                  <ArrowClockwise className="h-4 w-4 text-green-500" />
                  Step 5: Reset and Practice
                </h4>
                <p className="text-muted-foreground">
                  Click &ldquo;<strong>Put cards back</strong>&rdquo; to return cards to original positions and start
                  over.
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
            </div>
          </section>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Let&apos;s Start Teaching!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
