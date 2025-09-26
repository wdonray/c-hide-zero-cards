import { PLACE_VALUE_NAMES, PLACE_VALUES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ExpandedFormProps {
  number: number
  className?: string
}

export function ExpandedForm({ number, className }: ExpandedFormProps) {
  function getPlaceValues(num: number) {
    const numStr = num.toString()
    const length = numStr.length
    const placeValues = []

    for (let i = 0; i < length; i++) {
      const digit = parseInt(numStr[i])
      const positionFromRight = length - 1 - i
      const placeValue = PLACE_VALUES[positionFromRight]
      const actualValue = digit * placeValue

      placeValues.push({
        digit,
        placeValue,
        placeValueName: PLACE_VALUE_NAMES[placeValue],
        actualValue,
        isZero: digit === 0,
      })
    }

    return placeValues
  }

  const placeValues = getPlaceValues(number)
  const nonZeroValues = placeValues.filter((pv) => !pv.isZero)
  const expandedForm = nonZeroValues.map((pv) => pv.actualValue.toLocaleString()).join(' + ')

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex-1 flex items-center justify-center">
        <p className="text-lg font-mono tabular-nums font-medium text-primary leading-relaxed text-center">
          {expandedForm}
        </p>
      </CardContent>
    </Card>
  )
}
