import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WordFormProps {
  number: number
  className?: string
}

export function WordForm({ number, className }: WordFormProps) {
  function numberToWords(num: number): string {
    if (num === 0) return 'zero'

    const ones = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ]

    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

    const scales = ['', 'thousand', 'million', 'billion']

    function convertHundreds(n: number): string {
      let result = ''

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' hundred'
        n %= 100
        if (n > 0) result += ' '
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)]
        n %= 10
        if (n > 0) result += '-' + ones[n]
      } else if (n > 0) {
        result += ones[n]
      }

      return result
    }

    if (num < 0) {
      return 'negative ' + numberToWords(-num)
    }

    let result = ''
    let scaleIndex = 0

    while (num > 0) {
      const chunk = num % 1000
      if (chunk !== 0) {
        const chunkWords = convertHundreds(chunk)
        if (scaleIndex > 0) {
          result = chunkWords + ' ' + scales[scaleIndex] + (result ? ' ' + result : '')
        } else {
          result = chunkWords
        }
      }
      num = Math.floor(num / 1000)
      scaleIndex++
    }

    return result
  }

  const wordForm = numberToWords(number)

  return (
    <Card
      className={cn(
        'flex flex-col !bg-white dark:!bg-[#1a1512] !rounded-3xl !border-2 !border-[#2B2118] dark:!border-[#5a4a3a] !shadow-[0_4px_0_rgba(43,33,24,0.1)]',
        className
      )}
    >
      <CardContent className="flex items-center justify-center py-8">
        <p className="w-full text-xl font-semibold text-[#2B2118] dark:text-[#FFF6EC] leading-relaxed text-center">
          {wordForm}
        </p>
      </CardContent>
    </Card>
  )
}
