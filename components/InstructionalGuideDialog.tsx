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
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs'
import { Question } from '@phosphor-icons/react'
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
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[16px] font-semibold text-[#2B2118] dark:text-[#FFF6EC] transition-colors hover:bg-[#FFF6EC] dark:hover:bg-[#3a2f26] focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
          title="Instructional Teachers Guide for Hide Zero Cards"
        >
          <Question className="h-5 w-5 text-[#C14E33] dark:text-[#FF8A6B]" />
          <span className="hidden md:inline">Guide</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[#FFF6EC] dark:bg-[#2a2118] rounded-3xl border-2 border-[#2B2118] dark:border-[#5a4a3a] shadow-[0_8px_0_rgba(43,33,24,0.15)]"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl md:text-2xl pr-8 text-[#2B2118] dark:text-[#FFF6EC]"
            style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
          >
            Hide Zero Cards - Teacher&apos;s Guide
          </DialogTitle>
          <div className="h-0.5 rounded-full bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />
          <DialogDescription className="text-[#6B5D4F] dark:text-[#C9BBA8]">
            Transform how your students understand{' '}
            <strong className="text-[#2B2118] dark:text-[#FFF6EC]">place values</strong> with this interactive, hands-on
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
              <TabsList className="max-w-full max-md:overflow-x-auto max-md:justify-start pointer-coarse:h-12 bg-white dark:bg-[#1a1512] border-2 border-[#2B2118]/10 dark:border-[#FFF6EC]/10 rounded-full p-1 h-11">
                <TabsTrigger
                  value={InstructionalGuideDialogTab.QUICK_START}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none rounded-full text-[#6B5D4F] dark:text-[#C9BBA8] font-semibold data-[state=active]:bg-[#2B2118] dark:data-[state=active]:bg-[#FFF6EC] data-[state=active]:text-white dark:data-[state=active]:text-[#2B2118] data-[state=active]:shadow-none`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Quick Start
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.TOOLBAR_FEATURES}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none rounded-full text-[#6B5D4F] dark:text-[#C9BBA8] font-semibold data-[state=active]:bg-[#2B2118] dark:data-[state=active]:bg-[#FFF6EC] data-[state=active]:text-white dark:data-[state=active]:text-[#2B2118] data-[state=active]:shadow-none`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Toolbar Features
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.ACTIVITIES}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none rounded-full text-[#6B5D4F] dark:text-[#C9BBA8] font-semibold data-[state=active]:bg-[#2B2118] dark:data-[state=active]:bg-[#FFF6EC] data-[state=active]:text-white dark:data-[state=active]:text-[#2B2118] data-[state=active]:shadow-none`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Activities
                </TabsTrigger>
                <TabsTrigger
                  value={InstructionalGuideDialogTab.ASSESSMENT}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none rounded-full text-[#6B5D4F] dark:text-[#C9BBA8] font-semibold data-[state=active]:bg-[#2B2118] dark:data-[state=active]:bg-[#FFF6EC] data-[state=active]:text-white dark:data-[state=active]:text-[#2B2118] data-[state=active]:shadow-none`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Assessment
                </TabsTrigger>
              </TabsList>
              <div className="h-0.5 w-full rounded-full bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />
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
            <button
              className="inline-flex h-[56px] items-center justify-center gap-2 rounded-full border-2 border-[#8F3520] bg-[#C14E33] px-[28px] text-[18px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-[2px]"
              style={{
                fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                boxShadow: '0 4px 0 #8F3520',
              }}
            >
              Let&apos;s Start Teaching!
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
