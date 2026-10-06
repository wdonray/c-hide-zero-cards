'use client'

import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { DotsThree } from '@phosphor-icons/react'
import { ChevronRight, XIcon } from 'lucide-react'
import { Dialog, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MobileRandomRange } from './MobileRandomRange'
import { InstructionalGuideDialog } from './InstructionalGuideDialog'
import { ThemeToggle } from './ThemeToggle'
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton'
import { VERSION } from '@/lib/version'

const CURRENT_YEAR = new Date().getFullYear()

function MenuRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

/**
 * Overflow menu for secondary actions on mobile, rendered as a bottom
 * sheet. Reuses the existing trigger components (teacher's guide, theme
 * toggle) so their behavior is identical to desktop; the random range uses
 * a mobile-specific inline expanding list (MobileRandomRange) instead of
 * the desktop popover, which is cramped on a phone. The version link lives
 * here because nobody scrolls to footers on phones.
 *
 * Rendered only inside MobileActionBar (mobile-only); the Radix Dialog
 * provides focus trapping and Escape-to-close.
 *
 * The sheet content is composed from DialogPrimitive directly (instead of
 * the shared DialogContent) so its animation is a pure bottom-sheet slide:
 * the shared wrapper's fade/zoom classes merge in via cn() and cannot be
 * unset, which made the close animation fade+shrink+slide all at once
 * (the visible jitter). Open and close are now symmetric slides.
 *
 * Also hosts the footer links on mobile, where the footer bar itself is
 * hidden (see components/Footer.tsx).
 */
export function MobileMoreMenu({
  triggerClassName,
  iconClassName,
}: {
  triggerClassName: string
  iconClassName: string
}) {
  return (
    <Dialog>
      <DialogTrigger className={triggerClassName} aria-label="More actions" title="More actions">
        <DotsThree className={iconClassName} weight="bold" aria-hidden="true" />
        <span className="text-[10px] font-medium leading-none">More</span>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          aria-describedby={undefined}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            // Land initial focus on the sheet itself instead of the close
            // button, so no focus ring flashes on open. Focus still moves
            // inside the sheet for keyboard and screen-reader users
            // (WCAG 2.4.3); only the X's visible outline goes away.
            event.preventDefault()
            ;(event.currentTarget as HTMLElement).focus({ preventScroll: true })
          }}
          className="bg-background fixed top-auto right-0 bottom-0 left-0 z-50 max-h-[85dvh] max-w-full overflow-y-auto rounded-t-3xl rounded-b-none border border-b-0 p-6 pt-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
        >
          <DialogHeader className="mb-3 flex flex-row items-center justify-between gap-4 text-left">
            <DialogTitle>More actions</DialogTitle>
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none pointer-coarse:size-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogHeader>
          <div className="flex flex-col">
            <MobileRandomRange />
            <MenuRow label="Teacher's guide">
              <InstructionalGuideDialog />
            </MenuRow>
            <MenuRow label="Theme">
              <ThemeToggle />
            </MenuRow>
            <DialogPrimitive.Close asChild>
              <Link
                href="/analytics"
                title="Public traffic statistics"
                aria-label="Analytics, view public traffic statistics"
                className="group flex min-h-14 items-center justify-between gap-4 py-2"
              >
                <span className="text-sm font-medium">Analytics</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
                  Traffic stats
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close asChild>
              <Link
                href="/version"
                title="App version and release history"
                aria-label={`App version v${VERSION}, view release history`}
                className="group flex min-h-14 items-center justify-between gap-4 py-2"
              >
                <span className="text-sm font-medium">App version</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
                  v{VERSION}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-2 border-t pt-4">
            <nav
              aria-label="About Donray Williams"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            >
              <a
                href="https://www.donray.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                title="Donray Williams - Personal Website"
              >
                donray.dev
              </a>
              <a
                href="https://www.linkedin.com/in/donrayxwilliams/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                title="Donray Williams - LinkedIn"
              >
                LinkedIn
              </a>
              <BuyMeACoffeeButton variant="ghost" size="sm" />
            </nav>
            <p className="mt-3 text-center text-xs text-muted-foreground">© {CURRENT_YEAR} Donray Williams</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
