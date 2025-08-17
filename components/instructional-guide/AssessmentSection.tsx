export function AssessmentSection() {
  return (
    <div className="space-y-6">
      {/* Assessment & Learning Checks */}
      <section>
        <h3 className="font-semibold text-lg text-foreground mb-3 text-blue-700 dark:text-blue-300">
          Assessment & Learning Checks
        </h3>
        <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3 border border-blue-100 dark:border-blue-800">
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Place Value Understanding:</strong> Move digits between place values and observe the changes
            </div>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Card Sorting:</strong> Arrange mixed cards back into correct numerical order
            </div>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Speed Recognition:</strong> How quickly place values can be identified
            </div>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Number Forms:</strong> Convert between Standard, Word, Unit, and Expanded forms
            </div>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Random Practice:</strong> Work with randomly generated numbers in different ranges
            </div>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <strong>Form Conversion:</strong> Use Number Forms dialog to convert between different representations
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
