'use client'

import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { DotsThree } from '@phosphor-icons/react'
import { XIcon } from 'lucide-react'
import { Dialog, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RandomNumberPopover } from './RandomNumberPopover'
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
 * sheet. Reuses the existing trigger components (range popover, teacher's
 * guide, theme toggle) so their behavior is identical to desktop; the
 * version link lives here because nobody scrolls to footers on phones.
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
          className="bg-background fixed top-auto right-0 bottom-0 left-0 z-50 max-w-full rounded-t-3xl rounded-b-none border border-b-0 p-6 pt-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
        >
          <DialogHeader className="text-left">
            <DialogTitle>More actions</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <MenuRow label="Random number range">
              <RandomNumberPopover />
            </MenuRow>
            <MenuRow label="Teacher's guide">
              <InstructionalGuideDialog />
            </MenuRow>
            <MenuRow label="Theme">
              <ThemeToggle />
            </MenuRow>
            <div className="flex min-h-14 items-center justify-between gap-4 py-2">
              <span className="text-sm font-medium">App version</span>
              <Link
                href="/version"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                title="App version and release history"
              >
                v{VERSION}
              </Link>
            </div>
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
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none pointer-coarse:top-2 pointer-coarse:right-2 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
