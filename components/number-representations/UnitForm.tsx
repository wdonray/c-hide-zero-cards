import { PLACE_VALUE_NAMES, PLACE_VALUES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'

interface UnitFormProps {
  number: number
}

export function UnitForm({ number }: UnitFormProps) {
  function replaceFinalChar(str: string, replacement: string) {
    if (str.length === 0) return replacement
    return str.slice(0, -1) + replacement
  }

  function getUnits(num: number) {
    const numStr = num.toString()
    const length = numStr.length
    const units = []

    for (let i = 0; i < length; i++) {
      const digit = parseInt(numStr[i])
      const positionFromRight = length - 1 - i
      const placeValue = PLACE_VALUES[positionFromRight]
      let placeValueName = PLACE_VALUE_NAMES[placeValue]
      if (digit === 1) {
        placeValueName = replaceFinalChar(placeValueName, '')
      }

      if (digit !== 0) {
        units.push({
          digit,
          placeValueName,
          text: `${digit} ${placeValueName}`,
        })
      }
    }

    return units
  }

  const units = getUnits(number)
  const unitForm = units.map((unit) => unit.text).join(' , ')

  return (
    <Card className="h-[280px] flex flex-col">
      <CardContent className="flex-1 flex items-center justify-center">
        <p className="text-lg font-medium text-primary leading-relaxed text-center">{unitForm}</p>
      </CardContent>
    </Card>
  )
}
