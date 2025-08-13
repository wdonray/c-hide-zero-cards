'use client'

import { useEffect } from 'react'

export function BuyMeACoffeeWidget() {
  useEffect(() => {
    // Load Buy Me a Coffee widget script
    const script = document.createElement('script')
    script.setAttribute('data-name', 'BMC-Widget')
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
    script.setAttribute('data-id', 'donrayxwils')
    script.setAttribute('data-color', '#fde047')
    script.setAttribute('data-position', 'Right')
    script.setAttribute('data-x_margin', '18')
    script.setAttribute('data-y_margin', '18')
    script.async = true

    // Manually dispatch DOMContentLoaded event after script loads
    script.onload = () => {
      const evt = new Event('DOMContentLoaded', { bubbles: false, cancelable: false })
      window.dispatchEvent(evt)
    }

    // Append script to head
    document.head.appendChild(script)

    return () => {
      // Cleanup script and widget when component unmounts
      if (script.parentNode) {
        document.head.removeChild(script)
      }

      // Remove widget elements
      const widget = document.getElementById('bmc-wbtn')
      if (widget) {
        widget.remove()
      }

      // Remove any additional widget containers
      const widgetContainer = document.getElementById('bmc-widget-container')
      if (widgetContainer) {
        widgetContainer.remove()
      }
    }
  }, [])

  return null
}
