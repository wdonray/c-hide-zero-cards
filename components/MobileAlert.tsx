import { MOBILE_WIDTH } from '@/lib/constants'
import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function MobileAlert() {
  const [showMobileAlert, setShowMobileAlert] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      const wasMobile = isMobile
      const isNowMobile = window.innerWidth < MOBILE_WIDTH
      setIsMobile(isNowMobile)

      if (!wasMobile && isNowMobile) {
        setShowMobileAlert(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    if (window.innerWidth < MOBILE_WIDTH) {
      setShowMobileAlert(true)
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

  function handleClose() {
    setShowMobileAlert(false)
  }

  return (
    <AlertDialog open={showMobileAlert && isMobile} onOpenChange={setShowMobileAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>App Not Optimized for Mobile</AlertDialogTitle>
          <AlertDialogDescription>
            This app is not optimized for mobile devices. Please use a larger screen for the best experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction onClick={handleClose}>Got it</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  )
}
