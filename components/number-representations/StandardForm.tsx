import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StandardFormProps {
  number: number
  className?: string
}

export function StandardForm({ number, className }: StandardFormProps) {
  return (
    <Card
      className={cn(
        'flex flex-col !bg-white dark:!bg-[#1a1512] !rounded-3xl !border-2 !border-[#2B2118] dark:!border-[#5a4a3a] !shadow-[0_4px_0_rgba(43,33,24,0.1)]',
        className
      )}
    >
      <CardContent className="flex flex-1 items-center justify-center py-8">
        <p className="w-full text-3xl font-mono tabular-nums font-bold text-[#2B2118] dark:text-[#FFF6EC] leading-relaxed text-center">
          {number.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
