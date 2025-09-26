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
        className={`max-w-md ${revealCards ? '-left-5 top-1 translate-x-0 translate-y-0' : ''}`}
        showCloseButton={true}
        hideOverlay={revealCards}
      >
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Number Forms & Representations
          </DialogTitle>
          <Separator />
          <DialogDescription>
            <span className="flex flex-row gap-6">
              Explore different ways to write and understand your number!
              <Button size="sm" onClick={() => setRevealCards(!revealCards)}>
                {revealCards ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {revealCards ? 'Hide cards' : 'Reveal cards'}
              </Button>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as NumberFormsDialogTab)}>
          <div className="flex flex-col gap-4 items-center">
            <TabsList>
              <TabsTrigger value={NumberFormsDialogTab.WORD}>Word Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.UNIT}>Unit Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.EXPANDED}>Expanded Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.STANDARD}>Standard Form</TabsTrigger>
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
