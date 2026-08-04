import { useCallback, useEffect } from 'react'

const PRINT_STYLE_ID = 'imx-dynamic-print-styles'
const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 1.5cm; }
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
  .resumo-clinical-card { break-inside: avoid; page-break-inside: avoid; }
  .resumo-status-pill {
    background-color: transparent !important;
    color: #000 !important;
    border: none !important;
    padding: 0 !important;
    font-weight: 700 !important;
    font-size: 10pt !important;
    border-radius: 0 !important;
  }
  .resumo-status-pill::before { content: '['; }
  .resumo-status-pill::after { content: ']'; }
  .resumo-status-dot { display: none !important; }
  .resumo-card-accent { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .resumo-table-zebra tbody tr:nth-child(even) { background-color: hsl(215 20% 98%) !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  .summary-document {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    overflow: visible !important;
  }
  .summary-document > div { padding: 0.5rem !important; }

  .summary-card {
    break-inside: avoid;
    page-break-inside: avoid;
    padding: 0.5rem !important;
  }

  .summary-table {
    font-size: 0.7rem !important;
    table-layout: fixed !important;
    width: 100% !important;
  }
  .summary-table th,
  .summary-table td {
    font-size: 0.7rem !important;
    padding: 4px 6px !important;
    min-width: auto !important;
    max-width: none !important;
  }
  .summary-table th {
    background-color: hsl(215 20% 95%) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .summary-table th.hidden,
  .summary-table td.hidden {
    display: table-cell !important;
  }
  .summary-table .lg:hidden {
    display: none !important;
  }
  .summary-table .truncate {
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: normal !important;
  }
  .summary-table .max-w-32 {
    max-width: none !important;
  }
  .summary-table th:nth-child(6),
  .summary-table td:nth-child(6) {
    white-space: normal !important;
  }
  .summary-cards-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
  }

  .text-muted-foreground { color: hsl(var(--foreground) / 0.7) !important; }

  .summary-document * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .summary-sparkline { opacity: 1 !important; }
  .summary-sparkline path,
  .summary-sparkline circle { opacity: 1 !important; }
  .resumo-sparkline-path { stroke: #000 !important; stroke-width: 1 !important; fill: none !important; }
  .resumo-table svg circle { fill: #000 !important; }
  .resumo-trend-icon { display: none !important; }
  .resumo-trend-text { display: inline !important; font-weight: 700 !important; color: #000 !important; font-size: 10pt !important; }
  .resumo-clinical-card { box-shadow: none !important; border: 1px solid #ccc !important; }
  .resumo-scroll-fade { display: none !important; }
  .resumo-card-accent { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

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
