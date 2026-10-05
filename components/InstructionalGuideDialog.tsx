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
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs'
import { Question } from '@phosphor-icons/react'
import { Separator } from './ui/separator'
import { InstructionalGuideDialogTab } from '@/lib/constants'
import { COARSE_POINTER_TOUCH_TARGET } from '@/lib/constants'
import { useIsMobile } from '@/lib/useIsMobile'
import { QuickStartSection } from './instructional-guide/QuickStartSection'
import { ToolbarFeaturesSection } from './instructional-guide/ToolbarFeaturesSection'
import { ActivitiesSection } from './instructional-guide/ActivitiesSection'
import { AssessmentSection } from './instructional-guide/AssessmentSection'

export function InstructionalGuideDialog() {
  const isMobile = useIsMobile()

  // Mobile (<768px) shows every section as a stacked, vertically-scrolling
  // block — no tab row, no horizontal scrolling. Each section component
  // already renders its own descriptive heading ("Quick Start (2 minutes)",
  // ...), so no outer heading is rendered; the region keeps an accessible
  // label via aria-label. Desktop keeps the tabbed layout exactly as before.
  const mobileSections = [
    { title: 'Quick Start', content: <QuickStartSection /> },
    { title: 'Toolbar Features', content: <ToolbarFeaturesSection /> },
    { title: 'Activities', content: <ActivitiesSection /> },
    { title: 'Assessment', content: <AssessmentSection /> },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${COARSE_POINTER_TOUCH_TARGET}`}
          title="Instructional Teachers Guide for Hide Zero Cards"
        >
          <Question className="h-4 w-4" />
          <span className="hidden md:inline">How to Use</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl pr-8">Hide Zero Cards - Teacher&apos;s Guide</DialogTitle>
          <Separator />
          <DialogDescription className="text-muted-foreground">
            Transform how your students understand <strong>place values</strong> with this interactive, hands-on
            learning tool
          </DialogDescription>
        </DialogHeader>

        {isMobile ? (
          <div className="flex w-full min-w-0 flex-col gap-6">
            {mobileSections.map((section) => (
              <section key={section.title} aria-label={section.title} className="w-full min-w-0">
                {section.content}
              </section>
            ))}
          </div>
        ) : (
          <Tabs defaultValue={InstructionalGuideDialogTab.QUICK_START} className="w-full min-w-0">
            <div className="flex flex-col gap-4 items-center">
              <TabsList className="max-w-full max-md:overflow-x-auto max-md:justify-start pointer-coarse:h-12">
                <TabsTrigger
                  value={InstructionalGuideDialogTab.QUICK_START}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
                >
                  Quick Start
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.TOOLBAR_FEATURES}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
                >
                  Toolbar Features
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.ACTIVITIES}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
                >
                  Activities
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.ASSESSMENT}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
                >
                  Assessment
                </TabsTrigger>
              </TabsList>
              <Separator />
              <div className="w-full relative">
                <TabsContent value={InstructionalGuideDialogTab.QUICK_START} className="mt-0">
                  <QuickStartSection />
                </TabsContent>
                <TabsContent value={InstructionalGuideDialogTab.TOOLBAR_FEATURES} className="mt-0">
                  <ToolbarFeaturesSection />
                </TabsContent>
                <TabsContent value={InstructionalGuideDialogTab.ACTIVITIES} className="mt-0">
                  <ActivitiesSection />
                </TabsContent>
                <TabsContent value={InstructionalGuideDialogTab.ASSESSMENT} className="mt-0">
                  <AssessmentSection />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button>Let&apos;s Start Teaching!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
