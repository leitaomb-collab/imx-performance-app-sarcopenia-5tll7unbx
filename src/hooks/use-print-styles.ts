import { useCallback, useEffect } from 'react'

const PRINT_STYLE_ID = 'imx-dynamic-print-styles'
const PRINT_CSS = `
@media print {
  .no-print, .report-action-bar, .report-draft-warning, .summary-action-bar, .resumo-action-bar { display: none !important; }

  .resumo-print-header { display: block !important; position: fixed; top: 0; left: 0; right: 0; padding: 0.5cm 0; z-index: 100; background: white !important; }
  .resumo-content { padding-top: 3cm; }
  .resumo-card { break-inside: avoid; page-break-inside: avoid; }
  .resumo-table-wrapper { break-inside: avoid; page-break-inside: avoid; }
  .resumo-table tr { break-inside: avoid; page-break-inside: avoid; }
  .resumo-document { box-shadow: none !important; border: none !important; margin: 0 !important; border-radius: 0 !important; }
  .resumo-footer { break-inside: avoid; page-break-inside: avoid; }
  .resumo-status-badge { break-inside: avoid; page-break-inside: avoid; }
  .resumo-general-card { break-inside: avoid; page-break-inside: avoid; }

  .summary-document {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
  }
  .summary-document > div { padding: 0.5rem !important; }

  .summary-card {
    break-inside: avoid;
    page-break-inside: avoid;
    padding: 0.5rem !important;
  }

  .summary-table { font-size: 0.5rem !important; }
  .summary-table th,
  .summary-table td {
    font-size: 0.5rem !important;
    padding: 0.1rem 0.2rem !important;
  }

  .text-muted-foreground { color: hsl(var(--foreground) / 0.7) !important; }

  .summary-document * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .summary-sparkline { opacity: 1 !important; }
  .summary-sparkline path,
  .summary-sparkline circle { opacity: 1 !important; }

  .summary-header-title { font-size: 1.125rem !important; }
  .summary-header-subtitle { font-size: 0.8rem !important; }
  .summary-header-protocol { font-size: 0.675rem !important; }

  .summary-diagnosis-banner {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .summary-clinical-summary { max-height: 4rem !important; }
  .summary-footer-line { width: 8rem !important; }

  body { background: white !important; }
  html, body { overflow: hidden !important; max-width: 100% !important; }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
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
