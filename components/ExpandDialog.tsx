'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { PLACE_VALUE_NAMES, PLACE_VALUES } from '@/lib/constants'

interface ExpandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  number: number | null
}

export function ExpandDialog({ open, onOpenChange, number }: ExpandDialogProps) {
  if (!number) return null

  function getPlaceValues(num: number) {
    const numStr = num.toString()
    const length = numStr.length
    const placeValues = []

    for (let i = 0; i < length; i++) {
      const digit = parseInt(numStr[i])
      const positionFromRight = length - 1 - i
      const placeValue = PLACE_VALUES[positionFromRight]
      const actualValue = digit * placeValue

      if (digit !== 0) {
        placeValues.push({
          digit,
          placeValue,
          placeValueName: PLACE_VALUE_NAMES[placeValue],
          actualValue,
        })
      }
    }

    return placeValues
  }

  const placeValues = getPlaceValues(number)
  const expandedForm = placeValues.map((pv) => pv.actualValue.toLocaleString()).join(' + ')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Number Parts</AlertDialogTitle>
          <AlertDialogDescription>Let's see what makes up the number {number.toLocaleString()}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Expanded Form:</h4>
            <p className="text-lg font-mono tabular-nums">{expandedForm}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Each part:</h4>
            <div className="space-y-1">
              {placeValues.map((pv, index) => (
                <div key={index} className="flex items-center justify-between border rounded p-2 tabular-nums">
                  <span className="font-medium">{pv.digit}</span>
                  <span className="text-sm">({pv.placeValueName})</span>
                  <span className="font-mono text-sm">= {pv.actualValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
