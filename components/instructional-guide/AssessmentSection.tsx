import { Brain } from '@phosphor-icons/react'

export function AssessmentSection() {
  return (
    <div className="space-y-6">
      {/* Assessment & Learning Checks */}
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
              <strong>Ask students:</strong> &ldquo;What happens when you move the 2 from the hundreds place to the ones
              place?&rdquo;
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
              <strong>Test understanding:</strong> &ldquo;Use Number Forms to show me the word form of 3,456&rdquo;
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
          <div className="grid grid-cols-[20px_1fr] items-center gap-4">
            <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div>
              <strong>Number forms practice:</strong> &ldquo;Show me the expanded form of 7,892 using the Number Forms
              dialog&rdquo;
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
