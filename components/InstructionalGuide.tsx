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

export function InstructionalGuide() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">❓</span>
          How to Use
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-center">🎓 Hide Zero Cards - Learning Guide</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Transform how your students understand place values with this interactive, hands-on learning tool
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 text-sm">
          {/* What is this site */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">🎯 What is Hide Zero Cards?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Imagine making place values so clear that students can literally see and touch them. That&apos;s what Hide
              Zero Cards does. It&apos;s an interactive tool that breaks down complex numbers into visual, draggable
              pieces, making abstract concepts concrete and memorable for fourth-grade learners.
            </p>
          </section>

          {/* Benefits for Kids */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">🧠 How This Helps Kids Learn</h3>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                <strong>Visual Learning:</strong> Watch as 1,234 becomes 1,000 + 200 + 30 + 4 right before their eyes
              </li>
              <li>
                <strong>Hands-on Practice:</strong> Physically drag and rearrange number parts to build understanding
              </li>
              <li>
                <strong>Zero Understanding:</strong> Discover why 100 feels different from 1,000 and 10,000
              </li>
              <li>
                <strong>Color Coding:</strong> Each place value gets its own color for instant recognition
              </li>
              <li>
                <strong>Real-world Connection:</strong> Connect classroom learning to everyday number use
              </li>
            </ul>
          </section>

          {/* How to Use */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">🎮 How to Use the Tool</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground">📝 Step 1: Enter a Number</h4>
                <p className="text-muted-foreground">
                  Type any number from 1 to 1,000,000,000 in the input field. Watch as each digit becomes a separate,
                  color-coded card!
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">🎲 Step 2: Try Random Numbers</h4>
                <p className="text-muted-foreground">
                  Click &ldquo;🎲 Randomize number&rdquo; to generate random numbers for practice. Watch the dice roll
                  with animation and get a new number to work with!
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">🖱️ Step 3: Drag and Explore</h4>
                <p className="text-muted-foreground">
                  Click and drag the number cards around the workspace. Try moving them to different positions and see
                  how the number changes!
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">🔀 Step 4: Challenge Yourself</h4>
                <p className="text-muted-foreground">
                  Click &ldquo;🔀 Randomize positions&rdquo; to scatter the cards randomly, then try to put them back in
                  the right order!
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">🔄 Step 5: Reset and Practice</h4>
                <p className="text-muted-foreground">
                  Click &ldquo;🔄 Reset cards&rdquo; to return all cards to their original positions and start over with
                  a new challenge.
                </p>
              </div>
            </div>
          </section>

          {/* Color Guide */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">🎨 Understanding the Colors</h3>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>🔴 Ones/Tens: Red shades</div>
              <div>🟠 Hundreds/Thousands: Orange shades</div>
              <div>🟡 Ten Thousands/Hundred Thousands: Yellow shades</div>
              <div>🟢 Millions: Green shades</div>
              <div>🔵 Billions: Blue shades</div>
            </div>
          </section>

          {/* Tips for Teachers */}
          <section>
            <h3 className="font-semibold text-lg text-foreground mb-2">👩‍🏫 Tips for Teachers</h3>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>Use on interactive whiteboards for whole-class demonstrations</li>
              <li>Let students work independently on tablets or computers</li>
              <li>Start with smaller numbers and gradually increase complexity</li>
              <li>Ask students to explain their thinking as they drag cards</li>
              <li>Use the random features to create new challenges</li>
              <li>Adjust the theme (light/dark) based on classroom lighting</li>
              <li>Use the built-in help system to guide students through features</li>
            </ul>
          </section>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Let&apos;s Start Learning!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
