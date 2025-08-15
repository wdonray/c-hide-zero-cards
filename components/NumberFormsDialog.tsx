'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Layers } from 'lucide-react'
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs'
import { ExpandedForm } from './number-representations/ExpandedForm'
import { StandardForm } from './number-representations/StandardForm'
import { WordForm } from './number-representations/WordForm'
import { UnitForm } from './number-representations/UnitForm'
import { NumberFormsDialogTab } from '@/lib/constants'
import { Separator } from '@/components/ui/separator'

interface NumberFormsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  number: number | null
  selectedTab: NumberFormsDialogTab
  setSelectedTab: (tab: NumberFormsDialogTab) => void
}

export function NumberFormsDialog({ open, onOpenChange, number, selectedTab, setSelectedTab }: NumberFormsDialogProps) {
  if (!number) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={true}>
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Number Forms & Representations
          </DialogTitle>
          <Separator />
          <DialogDescription>
            Explore different ways to write and understand the number <strong>{number.toLocaleString()}</strong>!
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as NumberFormsDialogTab)}>
          <div className="flex flex-col gap-4 items-center">
            <TabsList>
              <TabsTrigger value={NumberFormsDialogTab.STANDARD}>Standard Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.WORD}>Word Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.UNIT}>Unit Form</TabsTrigger>
              <TabsTrigger value={NumberFormsDialogTab.EXPANDED}>Expanded Form</TabsTrigger>
            </TabsList>
            <div className="w-full relative">
              <TabsContent value={NumberFormsDialogTab.EXPANDED} className="mt-0">
                <ExpandedForm number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.STANDARD} className="mt-0">
                <StandardForm number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.WORD} className="mt-0">
                <WordForm number={number} />
              </TabsContent>
              <TabsContent value={NumberFormsDialogTab.UNIT} className="mt-0">
                <UnitForm number={number} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
