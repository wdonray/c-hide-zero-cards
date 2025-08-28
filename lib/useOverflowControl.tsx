'use client'

import { useEffect } from 'react'

/**
 * Hook to control HTML overflow based on content visibility
 * @param hasScrollableContent - Whether there is content that needs scrolling
 */
export function useOverflowControl(hasScrollableContent: boolean) {
  useEffect(() => {
    const htmlElement = document.documentElement
    
    if (hasScrollableContent) {
      // Remove overflow-hidden to allow scrolling
      htmlElement.classList.remove('overflow-hidden')
      htmlElement.classList.add('overflow-auto')
    } else {
      // Add overflow-hidden to prevent scrolling when no scrollable content
      htmlElement.classList.remove('overflow-auto')
      htmlElement.classList.add('overflow-hidden')
    }

    // Cleanup function to ensure we don't leave the page in a bad state
    return () => {
      htmlElement.classList.remove('overflow-hidden', 'overflow-auto')
      htmlElement.classList.add('overflow-auto') // Default to scrollable
    }
  }, [hasScrollableContent])
}