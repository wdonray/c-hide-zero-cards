'use client'

import Link from 'next/link'
import { DotsThree } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RandomNumberPopover } from './RandomNumberPopover'
import { InstructionalGuideDialog } from './InstructionalGuideDialog'
import { ThemeToggle } from './ThemeToggle'
import { VERSION } from '@/lib/version'

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
      <DialogContent
        className="top-auto right-0 bottom-0 left-0 max-w-full translate-x-0 translate-y-0 rounded-t-3xl rounded-b-none border-b-0 p-6 pt-4 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
        aria-describedby={undefined}
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
      </DialogContent>
    </Dialog>
  )
}
