import { useCallback, useEffect } from 'react'

const PRINT_STYLE_ID = 'imx-dynamic-print-styles'
const PRINT_CSS = `
@media print {
  .no-print, .report-action-bar { display: none !important; }
  .report-document { box-shadow: none !important; border: none !important; margin: 0 !important; }
  body { background: white !important; }
}
`

export function usePrintStyles() {
  const loadPrintStyles = useCallback(() => {
    if (document.getElementById(PRINT_STYLE_ID)) return
    const style = document.createElement('style')
    style.id = PRINT_STYLE_ID
    style.textContent = PRINT_CSS
    document.head.appendChild(style)
  }, [])

  const handlePrint = useCallback(() => {
    loadPrintStyles()
    requestAnimationFrame(() => window.print())
  }, [loadPrintStyles])

  useEffect(() => {
    return () => {
      const el = document.getElementById(PRINT_STYLE_ID)
      if (el) el.remove()
    }
  }, [])

  return { handlePrint }
}
