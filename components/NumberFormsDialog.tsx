'use client'

import { useEffect, useState } from 'react'
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
import { Button } from './ui/button'
import { Separator } from './ui/separator'
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

  useEffect(() => {
    if (open) {
      setRevealCards(false)
    }
  }, [open])

  if (!number) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!revealCards && <DialogOverlay />}
      <DialogContent
        className={`${revealCards ? 'md:-left-5 md:top-1 md:translate-x-0 md:translate-y-0' : ''}`}
        showCloseButton={true}
        hideOverlay={revealCards}
      >
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg max-md:pr-8">
            <Layers className="h-5 w-5 shrink-0" />
            <span className="min-w-0">Number Forms & Representations</span>
          </DialogTitle>
          <Separator />
          <DialogDescription>
            <span className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3">
              <span className="min-w-0">Explore different ways to write and understand your number!</span>
              <Button size="sm" onClick={() => setRevealCards(!revealCards)} className={COARSE_POINTER_TOUCH_TARGET}>
                {revealCards ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {revealCards ? 'Hide cards' : 'Reveal cards'}
              </Button>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as NumberFormsDialogTab)}
          className="w-full min-w-0"
        >
          <div className="flex flex-col gap-4 items-center">
            <TabsList className="max-w-full max-md:overflow-x-auto max-md:justify-start pointer-coarse:h-12">
              <TabsTrigger
                value={NumberFormsDialogTab.WORD}
                className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
              >
                Word Form
              </TabsTrigger>
              <TabsTrigger
                value={NumberFormsDialogTab.UNIT}
                className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
              >
                Unit Form
              </TabsTrigger>
              <TabsTrigger
                value={NumberFormsDialogTab.EXPANDED}
                className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
              >
                Expanded Form
              </TabsTrigger>
              <TabsTrigger
                value={NumberFormsDialogTab.STANDARD}
                className={`${COARSE_POINTER_TOUCH_TARGET} max-md:flex-none`}
              >
                Standard Form
              </TabsTrigger>
            </TabsList>
            <div className="w-full relative">
              <TabsContent value={NumberFormsDialogTab.EXPANDED} className="mt-0">
                <ExpandedForm className="h-[65vh]" number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.STANDARD} className="mt-0">
                <StandardForm className="h-[65vh]" number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.WORD} className="mt-0">
                <WordForm className="h-[65vh]" number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.UNIT} className="mt-0">
                <UnitForm className="h-[65vh]" number={number} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
