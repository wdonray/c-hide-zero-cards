import Link from 'next/link'
import { BuyMeACoffeeButton } from '@/components/BuyMeACoffeeButton'
import { APP_FOOTER_ID } from '@/lib/scatterArea'
import { VERSION } from '@/lib/version'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer
      id={APP_FOOTER_ID}
      className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-md:hidden"
    >
      <div className="container m-auto px-4 md:px-8 flex h-14 max-md:h-auto items-center justify-between max-md:flex-col max-md:justify-center max-md:gap-1 max-md:py-2">
        <div className="flex items-center gap-2 md:gap-4">
          <a
            href="https://www.donray.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Donray Williams - Personal Website"
          >
            donray.dev
          </a>
          <a
            href="https://www.linkedin.com/in/donrayxwilliams/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Donray Williams - LinkedIn"
          >
            LinkedIn
          </a>
          <BuyMeACoffeeButton variant="ghost" size="sm" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>© {CURRENT_YEAR} Donray Williams</span>
          <span>•</span>
          <Link
            href="/version"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="App version and release history"
          >
            v{VERSION}
          </Link>
        </div>
      </div>
    </footer>
  )
}
