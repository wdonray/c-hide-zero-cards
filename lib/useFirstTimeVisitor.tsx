'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'

interface FirstTimeVisitorContextType {
  showWelcomeDialog: boolean
  setShowWelcomeDialog: (value: boolean) => void
  hasSeenWelcome: boolean
}

const FirstTimeVisitorContext = createContext<FirstTimeVisitorContextType | undefined>(undefined)

export function FirstTimeVisitorProvider({ children }: { children: ReactNode }) {
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome dialog before
    const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SEEN_WELCOME_DIALOG)
    if (!hasSeen) {
      // First time visitor - show welcome dialog
      setShowWelcomeDialog(true)
    } else {
      setHasSeenWelcome(true)
    }
  }, [])

  const handleCloseWelcomeDialog = () => {
    setShowWelcomeDialog(false)
    setHasSeenWelcome(true)
    localStorage.setItem(LOCAL_STORAGE_KEYS.HAS_SEEN_WELCOME_DIALOG, 'true')
  }

  return (
    <FirstTimeVisitorContext.Provider
      value={{
        showWelcomeDialog,
        setShowWelcomeDialog: handleCloseWelcomeDialog,
        hasSeenWelcome,
      }}
    >
      {children}
    </FirstTimeVisitorContext.Provider>
  )
}

export function useFirstTimeVisitor() {
  const context = useContext(FirstTimeVisitorContext)
  if (context === undefined) {
    throw new Error('useFirstTimeVisitor must be used within a FirstTimeVisitorProvider')
  }
  return context
}
