'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { DEFAULT_MAX_RANDOM_NUMBER, LOCAL_STORAGE_KEYS, RANDOM_NUMBER_TYPE } from '@/lib/constants'
import { NumberInputRef } from '@/components/NumberInput'

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
  showNumberFormsDialog: boolean
  setShowNumberFormsDialog: (value: boolean) => void
  showNumberFormsSection: boolean
  setShowNumberFormsSection: (value: boolean) => void
  cardsMoved: boolean
  setCardsMoved: (value: boolean) => void
  numberInputRef: React.RefObject<NumberInputRef | null>
  focusNumberInput: () => void
  randomNumberType: RANDOM_NUMBER_TYPE
  setRandomNumberType: (value: RANDOM_NUMBER_TYPE) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_HEADER_COLLAPSED)
    return saved !== null ? JSON.parse(saved) : false
  })

  const [inputNumber, setInputNumber] = useState<number | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [randomizeTrigger, setRandomizeTrigger] = useState(0)
  const [randomNumberRange, setRandomNumberRange] = useState<[number, number]>([1, DEFAULT_MAX_RANDOM_NUMBER])
  const [randomNumberType, setRandomNumberType] = useState<RANDOM_NUMBER_TYPE>(RANDOM_NUMBER_TYPE.BASIC)
  const [showRandomRange, setShowRandomRange] = useState(false)
  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [showZeroCards, setShowZeroCards] = useState(true)
  const [showNumberFormsDialog, setShowNumberFormsDialog] = useState(false)
  const [showNumberFormsSection, setShowNumberFormsSection] = useState(false)
  const [cardsMoved, setCardsMoved] = useState(false)

  const numberInputRef = useRef<NumberInputRef>(null)

  function focusNumberInput() {
    numberInputRef.current?.focus()
  }

  function toggleHeader() {
    setIsHeaderCollapsed(!isHeaderCollapsed)
  }

  function handleRandomNumber() {
    const min = randomNumberRange[0]
    const max = randomNumberRange[1]
    let randomNumber: number
    setIsDiceRolling(true)

    switch (randomNumberType) {
      case RANDOM_NUMBER_TYPE.BASIC:
        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
        break
      case RANDOM_NUMBER_TYPE.ZERO_FOCUS:
        do {
          randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
        } while (!randomNumber.toString().includes('0'))
        break
    }

    function delayedSetInputNumber() {
      setInputNumber(randomNumber)
      handleResetCardPosition()
      setIsDiceRolling(false)
    }

    setTimeout(delayedSetInputNumber, 200)
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
    setCardsMoved(false)
  }

  function handleRandomizeCardPosition() {
    setRandomizeTrigger((prev) => prev + 1)
    setCardsMoved(true)
  }

  function toggleZeroCards() {
    setShowZeroCards(!showZeroCards)
  }

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_HEADER_COLLAPSED, JSON.stringify(isHeaderCollapsed))
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
        showNumberFormsDialog,
        setShowNumberFormsDialog,
        showNumberFormsSection,
        setShowNumberFormsSection,
        cardsMoved,
        setCardsMoved,
        numberInputRef,
        focusNumberInput,
        randomNumberType,
        setRandomNumberType,
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
