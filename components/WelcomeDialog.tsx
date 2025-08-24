'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useFirstTimeVisitor } from '@/lib/useFirstTimeVisitor'
import { Sparkle, HandPointing, Cards } from '@phosphor-icons/react'

export function WelcomeDialog() {
  const { showWelcomeDialog, setShowWelcomeDialog } = useFirstTimeVisitor()

  return (
    <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
            <Sparkle className="h-5 w-5 animate-pulse" />
            Welcome to Hide Zero Cards!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Transform how your students understand <strong>place values</strong> with this interactive learning tool!
          </p>

          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg space-y-3 text-sm border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <span>Enter any number (1 to 1 billion)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <span>Watch colorful cards appear for each digit</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <span>Drag and explore place values together</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Cards className="h-4 w-4" />
            <span>Perfect for teachers and students</span>
          </div>

          <Button onClick={() => setShowWelcomeDialog(false)} className="w-full" size="lg">
            <HandPointing className="h-4 w-4 mr-2" />
            Let's Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
