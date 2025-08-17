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
import { QuickStartSection } from './instructional-guide/QuickStartSection'
import { ToolbarFeaturesSection } from './instructional-guide/ToolbarFeaturesSection'
import { ActivitiesSection } from './instructional-guide/ActivitiesSection'
import { AssessmentSection } from './instructional-guide/AssessmentSection'

export function InstructionalGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" title="Instructional Teachers Guide for Hide Zero Cards">
          <Question className="h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">Hide Zero Cards - Teacher&apos;s Guide</DialogTitle>
          <Separator />
          <DialogDescription className="text-muted-foreground">
            Transform how your students understand <strong>place values</strong> with this interactive, hands-on
            learning tool
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={InstructionalGuideDialogTab.QUICK_START} className="w-full">
          <div className="flex flex-col gap-4 items-center">
            <TabsList>
              <TabsTrigger value={InstructionalGuideDialogTab.QUICK_START}>Quick Start</TabsTrigger>
              <TabsTrigger value={InstructionalGuideDialogTab.TOOLBAR_FEATURES}>Toolbar Features</TabsTrigger>
              <TabsTrigger value={InstructionalGuideDialogTab.ACTIVITIES}>Activities</TabsTrigger>
              <TabsTrigger value={InstructionalGuideDialogTab.ASSESSMENT}>Assessment</TabsTrigger>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button>Let&apos;s Start Teaching!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
