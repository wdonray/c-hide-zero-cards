import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StandardFormProps {
  number: number
  className?: string
}

export function StandardForm({ number, className }: StandardFormProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex-1 flex items-center justify-center">
        <p className="text-3xl font-mono tabular-nums font-bold text-primary leading-relaxed text-center">
          {number.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
