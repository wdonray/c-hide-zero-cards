'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { DEFAULT_MAX_RANDOM_NUMBER } from '@/lib/constants'

interface HeaderContextType {
  isHeaderCollapsed: boolean
  toggleHeader: () => void
  inputNumber: number | null
  setInputNumber: (value: number | null) => void
  setResetTrigger: (value: number) => void
  setRandomizeTrigger: (value: number) => void
  setShowRandomRange: (value: boolean) => void
  resetTrigger: number
  randomizeTrigger: number
  randomNumberRange: [number, number]
  showRandomRange: boolean
  isDiceRolling: boolean
  handleRandomNumber: () => void
  handleRandomNumberRange: (value: number[]) => void
  handleResetRandomNumberRange: () => void
  handleResetCardPosition: () => void
  handleRandomizeCardPosition: () => void
  showZeroCards: boolean
  toggleZeroCards: () => void
  showExpandDialog: boolean
  setShowExpandDialog: (value: boolean) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    const saved = localStorage.getItem('isHeaderCollapsed')
    return saved !== null ? JSON.parse(saved) : false
  })

  const [inputNumber, setInputNumber] = useState<number | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [randomizeTrigger, setRandomizeTrigger] = useState(0)
  const [randomNumberRange, setRandomNumberRange] = useState<[number, number]>([1, DEFAULT_MAX_RANDOM_NUMBER])
  const [showRandomRange, setShowRandomRange] = useState(false)
  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [showZeroCards, setShowZeroCards] = useState(true)
  const [showExpandDialog, setShowExpandDialog] = useState(false)

  function toggleHeader() {
    setIsHeaderCollapsed(!isHeaderCollapsed)
  }

  function handleRandomNumber() {
    const randomNumber =
      Math.floor(Math.random() * (randomNumberRange[1] - randomNumberRange[0] + 1)) + randomNumberRange[0]
    setIsDiceRolling(true)
    setTimeout(() => {
      setInputNumber(randomNumber)
      handleResetCardPosition()
      setIsDiceRolling(false)
    }, 200)
  }

  function handleRandomNumberRange(value: number[]) {
    setRandomNumberRange([value[0], value[1]])
  }

  function handleResetRandomNumberRange() {
    setRandomNumberRange([1, DEFAULT_MAX_RANDOM_NUMBER])
  }

  function handleResetCardPosition() {
    setResetTrigger((prev) => prev + 1)
    setRandomizeTrigger(0)
  }

  function handleRandomizeCardPosition() {
    setRandomizeTrigger((prev) => prev + 1)
  }

  function toggleZeroCards() {
    setShowZeroCards(!showZeroCards)
  }

  useEffect(() => {
    localStorage.setItem('isHeaderCollapsed', JSON.stringify(isHeaderCollapsed))
  }, [isHeaderCollapsed])

  return (
    <HeaderContext.Provider
      value={{
        isHeaderCollapsed,
        toggleHeader,
        inputNumber,
        setInputNumber,
        setResetTrigger,
        setRandomizeTrigger,
        setShowRandomRange,
        resetTrigger,
        randomizeTrigger,
        randomNumberRange,
        showRandomRange,
        isDiceRolling,
        handleRandomNumber,
        handleRandomNumberRange,
        handleResetRandomNumberRange,
        handleResetCardPosition,
        handleRandomizeCardPosition,
        showZeroCards,
        toggleZeroCards,
        showExpandDialog,
        setShowExpandDialog,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeaderContext() {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error('useHeaderContext must be used within a HeaderProvider')
  }
  return context
}
