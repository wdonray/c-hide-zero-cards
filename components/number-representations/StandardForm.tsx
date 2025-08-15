import { Card, CardContent } from '@/components/ui/card'

interface StandardFormProps {
  number: number
}

export function StandardForm({ number }: StandardFormProps) {
  return (
    <Card className="h-[280px] flex flex-col">
      <CardContent className="flex-1 flex items-center justify-center">
        <p className="text-3xl font-mono tabular-nums font-bold text-primary leading-relaxed text-center">
          {number.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
