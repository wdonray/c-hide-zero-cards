'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog'
import { Layers } from 'lucide-react'
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs'
import { ExpandedForm } from './number-representations/ExpandedForm'
import { StandardForm } from './number-representations/StandardForm'
import { WordForm } from './number-representations/WordForm'
import { UnitForm } from './number-representations/UnitForm'
import { NumberFormsDialogTab } from '@/lib/constants'
import { COARSE_POINTER_TOUCH_TARGET } from '@/lib/constants'
import { useIsMobile } from '@/lib/useIsMobile'
import { EyeSlash, Eye } from '@phosphor-icons/react'

interface NumberFormsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  number: number | null
  selectedTab: NumberFormsDialogTab
  setSelectedTab: (tab: NumberFormsDialogTab) => void
}

export function NumberFormsDialog({ open, onOpenChange, number, selectedTab, setSelectedTab }: NumberFormsDialogProps) {
  const [revealCards, setRevealCards] = useState(false)
  const isMobile = useIsMobile()

  // Reset the reveal toggle whenever the dialog opens. Adjusted during render
  // (React's endorsed pattern for prop-derived state) instead of an effect:
  // no cascading render, identical behavior.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setRevealCards(false)
    }
  }

  if (!number) return null

  // Mobile (<768px) shows every form as a stacked, vertically-scrolling
  // section with a real heading — no tab row, no horizontal scrolling.
  // Desktop keeps the tabbed layout exactly as before.
  const mobileSections = [
    { title: 'Word Form', content: <WordForm number={number} className="min-h-28" /> },
    { title: 'Unit Form', content: <UnitForm number={number} className="min-h-28" /> },
    { title: 'Expanded Form', content: <ExpandedForm number={number} className="min-h-28" /> },
    { title: 'Standard Form', content: <StandardForm number={number} className="min-h-28" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!revealCards && <DialogOverlay />}
      <DialogContent
        className={`max-md:max-h-[calc(100dvh-2rem)] max-md:overflow-y-auto !bg-[#FFF6EC] dark:!bg-[#2a2118] !rounded-3xl !border-2 !border-[#2B2118] dark:!border-[#5a4a3a] !shadow-[0_8px_0_rgba(43,33,24,0.15)] ${revealCards ? 'md:-left-5 md:top-1 md:translate-x-0 md:translate-y-0' : ''}`}
        showCloseButton={true}
        hideOverlay={revealCards}
      >
        <DialogHeader className="flex flex-col gap-4 max-md:gap-2">
          <DialogTitle
            className="flex items-center gap-2 text-base md:text-lg max-md:pr-12 max-md:text-lg max-md:leading-normal !text-[#2B2118] dark:!text-[#FFF6EC]"
            style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
          >
            <Layers className="h-5 w-5 shrink-0 max-md:hidden text-[#C14E33]" aria-hidden="true" />
            {/* Mobile uses the short title so the header stays on one line;
                desktop keeps the full title. */}
            <span className="min-w-0 max-md:whitespace-nowrap">
              {isMobile ? 'Number Forms' : 'Number Forms & Representations'}
            </span>
          </DialogTitle>
          <div className="h-0.5 rounded-full bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />
          {/* Mobile keeps the header lean: subheader text and the reveal
              toggle are hidden, desktop keeps both. */}
          <DialogDescription className="max-md:hidden !text-[#6B5D4F] dark:!text-[#C9BBA8]">
            <span className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 max-md:gap-x-3 max-md:gap-y-2">
              <span className="min-w-0">Explore different ways to write and understand your number!</span>
              <button
                onClick={() => setRevealCards(!revealCards)}
                className={`inline-flex items-center gap-2 rounded-full border-2 border-[#2B2118] px-4 py-2 text-[15px] font-semibold transition-colors ${COARSE_POINTER_TOUCH_TARGET} ${
                  revealCards
                    ? 'bg-[#2B2118] dark:bg-[#FFF6EC] text-white dark:text-[#2B2118]'
                    : 'bg-white dark:bg-[#1a1512] text-[#2B2118] dark:text-[#FFF6EC] hover:bg-[#FFEED5] dark:hover:bg-[#3a2f26]'
                }`}
                style={{
                  fontFamily: 'var(--font-baloo), system-ui, sans-serif',
                  boxShadow: '0 3px 0 rgba(43,33,24,0.15)',
                }}
              >
                {revealCards ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {revealCards ? 'Hide cards' : 'Reveal cards'}
              </button>
            </span>
          </DialogDescription>
        </DialogHeader>

        {isMobile ? (
          <div className="flex w-full min-w-0 flex-col gap-5">
            {mobileSections.map((section) => {
              const headingId = `number-form-${section.title.toLowerCase().replace(/\s+/g, '-')}`
              return (
                <section key={section.title} aria-labelledby={headingId} className="w-full min-w-0">
                  <h3 id={headingId} className="mb-2 text-base font-semibold">
                    {section.title}
                  </h3>
                  {section.content}
                </section>
              )
            })}
          </div>
        ) : (
          <Tabs
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value as NumberFormsDialogTab)}
            className="w-full min-w-0"
          >
            <div className="flex flex-col gap-4 max-md:gap-3 items-center w-full min-w-0">
              <TabsList className="max-md:w-full max-md:overflow-x-auto max-md:justify-start pointer-coarse:h-12 !bg-[#2B2118]/5 dark:!bg-[#FFF6EC]/5 !rounded-full !p-1 !border-2 !border-[#2B2118]/10 dark:!border-[#FFF6EC]/10">
                <TabsTrigger
                  value={NumberFormsDialogTab.WORD}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none !rounded-full !text-[#2B2118] dark:!text-[#FFF6EC] data-[state=active]:!bg-[#2B2118] dark:data-[state=active]:!bg-[#FFF6EC] data-[state=active]:!text-white dark:data-[state=active]:!text-[#2B2118] data-[state=active]:!shadow-[0_2px_0_rgba(43,33,24,0.2)]`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Word Form
                </TabsTrigger>
                <TabsTrigger
                  value={NumberFormsDialogTab.UNIT}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none !rounded-full !text-[#2B2118] dark:!text-[#FFF6EC] data-[state=active]:!bg-[#2B2118] dark:data-[state=active]:!bg-[#FFF6EC] data-[state=active]:!text-white dark:data-[state=active]:!text-[#2B2118] data-[state=active]:!shadow-[0_2px_0_rgba(43,33,24,0.2)]`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Unit Form
                </TabsTrigger>
                <TabsTrigger
                  value={NumberFormsDialogTab.EXPANDED}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none !rounded-full !text-[#2B2118] dark:!text-[#FFF6EC] data-[state=active]:!bg-[#2B2118] dark:data-[state=active]:!bg-[#FFF6EC] data-[state=active]:!text-white dark:data-[state=active]:!text-[#2B2118] data-[state=active]:!shadow-[0_2px_0_rgba(43,33,24,0.2)]`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Expanded Form
                </TabsTrigger>
                <TabsTrigger
                  value={NumberFormsDialogTab.STANDARD}
                  className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none !rounded-full !text-[#2B2118] dark:!text-[#FFF6EC] data-[state=active]:!bg-[#2B2118] dark:data-[state=active]:!bg-[#FFF6EC] data-[state=active]:!text-white dark:data-[state=active]:!text-[#2B2118] data-[state=active]:!shadow-[0_2px_0_rgba(43,33,24,0.2)]`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Standard Form
                </TabsTrigger>
              </TabsList>
              <div className="w-full relative">
                <TabsContent value={NumberFormsDialogTab.EXPANDED} className="mt-0">
                  <ExpandedForm className="h-[65vh] max-md:h-[42dvh]" number={number} />
                </TabsContent>
                <TabsContent value={NumberFormsDialogTab.STANDARD} className="mt-0">
                  <StandardForm className="h-[65vh] max-md:h-[42dvh]" number={number} />
                </TabsContent>
                <TabsContent value={NumberFormsDialogTab.WORD} className="mt-0">
                  <WordForm className="h-[65vh] max-md:h-[42dvh]" number={number} />
                </TabsContent>
                <TabsContent value={NumberFormsDialogTab.UNIT} className="mt-0">
                  <UnitForm className="h-[65vh] max-md:h-[42dvh]" number={number} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
