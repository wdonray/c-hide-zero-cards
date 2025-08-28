'use client'

import { Layers } from 'lucide-react'
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs'
import { ExpandedForm } from './number-representations/ExpandedForm'
import { StandardForm } from './number-representations/StandardForm'
import { WordForm } from './number-representations/WordForm'
import { UnitForm } from './number-representations/UnitForm'
import { NumberFormsDialogTab } from '@/lib/constants'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface NumberFormsSectionProps {
  number: number | null
  selectedTab: NumberFormsDialogTab
  setSelectedTab: (tab: NumberFormsDialogTab) => void
  isVisible: boolean
}

export function NumberFormsSection({ number, selectedTab, setSelectedTab, isVisible }: NumberFormsSectionProps) {
  if (!number || !isVisible) return null

  return (
    <section className="w-full animate-in slide-in-from-bottom-4 duration-300 py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Layers className="h-6 w-6" />
            Number Forms & Representations
          </CardTitle>
          <Separator className="my-2" />
          <CardDescription className="text-lg">
            Explore different ways to write and understand the number <strong>{number.toLocaleString()}</strong>!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as NumberFormsDialogTab)}>
            <div className="flex flex-col gap-6 items-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-2 md:grid-cols-4">
                <TabsTrigger value={NumberFormsDialogTab.STANDARD} className="text-xs md:text-sm">Standard Form</TabsTrigger>
                <TabsTrigger value={NumberFormsDialogTab.WORD} className="text-xs md:text-sm">Word Form</TabsTrigger>
                <TabsTrigger value={NumberFormsDialogTab.UNIT} className="text-xs md:text-sm">Unit Form</TabsTrigger>
                <TabsTrigger value={NumberFormsDialogTab.EXPANDED} className="text-xs md:text-sm">Expanded Form</TabsTrigger>
              </TabsList>
              
              <div className="w-full max-w-md relative">
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
        </CardContent>
      </Card>
    </section>
  )
}