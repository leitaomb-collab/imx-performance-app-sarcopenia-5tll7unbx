import { useEffect, useRef } from 'react'

export function useWizardAutofocus(step: number, suppress: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (suppress) return
    const timer = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const selectors = [
        'input:not([type="hidden"]):not([disabled]):not([readonly])',
        'textarea:not([disabled])',
        '[role="combobox"]:not([disabled])',
        'select:not([disabled])',
      ].join(', ')
      const first = container.querySelector<HTMLElement>(selectors)
      if (first) {
        first.focus()
        if (first.tagName === 'INPUT' && first.getAttribute('type') === 'number') {
          ;(first as HTMLInputElement).select()
        }
        if (first.getAttribute('role') === 'combobox') {
          const hasVal = !!first.textContent?.trim() && first.textContent.trim() !== 'Selecione...'
          if (!hasVal) first.click()
        }
      } else {
        const heading = container.querySelector<HTMLElement>('h3')
        if (heading) {
          heading.setAttribute('tabindex', '-1')
          heading.focus()
        }
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [step, suppress])

  return containerRef
}
