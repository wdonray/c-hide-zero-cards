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
      // When closing scrollable content, scroll to top first, then lock
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        // Wait for scroll animation to complete before locking
        setTimeout(() => {
          htmlElement.classList.remove('overflow-auto')
          htmlElement.classList.add('overflow-hidden')
        }, 500) // 500ms to allow smooth scroll to complete
      } else {
        // If already at top, immediately lock
        htmlElement.classList.remove('overflow-auto')
        htmlElement.classList.add('overflow-hidden')
      }
    }

    // Cleanup function to ensure we don't leave the page in a bad state
    return () => {
      htmlElement.classList.remove('overflow-hidden', 'overflow-auto')
      htmlElement.classList.add('overflow-auto') // Default to scrollable
    }
  }, [hasScrollableContent])
}