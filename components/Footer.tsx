import Link from 'next/link'
import { BuyMeACoffeeButton } from '@/components/BuyMeACoffeeButton'
import { APP_FOOTER_ID } from '@/lib/scatterArea'
import { VERSION } from '@/lib/version'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer
      id={APP_FOOTER_ID}
      className="w-full border-t border-[#E8DCC8] bg-white/80 dark:border-[#3a2f26] dark:bg-[#171310]/95 max-md:hidden"
      style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-4 py-5 max-md:gap-1 max-md:py-3">
        <p className="text-[14px] font-medium text-[#6B5D4F] dark:text-[#C9BBA8] max-md:hidden">
          Free for classrooms. No login, no ads.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a
            href="https://www.donray.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title="Donray Williams - Personal Website"
          >
            donray.dev
          </a>
          <a
            href="https://www.linkedin.com/in/donrayxwilliams/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title="Donray Williams - LinkedIn"
          >
            LinkedIn
          </a>
          <BuyMeACoffeeButton variant="ghost" size="sm" />
          <span className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8]">© {CURRENT_YEAR} Donray Williams</span>
          <Link
            href="/analytics"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title="Public traffic statistics"
          >
            Analytics
          </Link>
          <Link
            href="/privacy"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title="Privacy policy"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title="Terms of use"
          >
            Terms
          </Link>
          <Link
            href="/version"
            className="text-[13px] text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            title={`App version v${VERSION} and release history`}
          >
            Versions
          </Link>
        </div>
      </div>
    </footer>
  )
}
