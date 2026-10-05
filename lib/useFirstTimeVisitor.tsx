'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'

interface FirstTimeVisitorContextType {
  showWelcomeDialog: boolean
  setShowWelcomeDialog: (value: boolean) => void
  hasSeenWelcome: boolean
}

const FirstTimeVisitorContext = createContext<FirstTimeVisitorContextType | undefined>(undefined)

export function FirstTimeVisitorProvider({ children }: { children: ReactNode }) {
  // Read on first client render instead of in an effect: the lazy initializer
  // runs client-side (guarded for SSR), so the dialog state is correct from
  // the first paint with no cascading render. Same end state as the old
  // mount effect.
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SEEN_WELCOME_DIALOG) === null
  })
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SEEN_WELCOME_DIALOG) !== null
  })

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
