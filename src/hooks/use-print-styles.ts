import { useCallback, useEffect } from 'react'

const PRINT_STYLE_ID = 'imx-dynamic-print-styles'
const PRINT_CSS = `
@media print {
  .no-print, .report-action-bar, .summary-action-bar { display: none !important; }
  .report-document, .summary-document { box-shadow: none !important; border: none !important; margin: 0 !important; }
  .summary-document { max-width: none !important; }
  .summary-card { break-inside: avoid; }
  .summary-table th, .summary-table td { font-size: 0.65rem !important; padding: 0.15rem 0.3rem !important; }
  body { background: white !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
