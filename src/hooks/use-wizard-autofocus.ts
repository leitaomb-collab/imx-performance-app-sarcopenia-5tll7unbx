import { useEffect, useRef } from 'react'

export function useWizardAutofocus(step: number, suppress: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (suppress) return
    const timer = setTimeout(() => {
      const container = containerRef.current
      if (!container) return

      const firstInput = container.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]):not([readonly]):not([type="radio"]), textarea:not([disabled]), select:not([disabled])',
      )

      if (firstInput) {
        firstInput.focus()
        if (firstInput.tagName === 'INPUT' && firstInput.getAttribute('type') === 'number') {
          ;(firstInput as HTMLInputElement).select()
        }
        return
      }

      const selectTrigger = container.querySelector<HTMLElement>(
        '[role="combobox"]:not([disabled])',
      )
      if (selectTrigger) {
        selectTrigger.focus()
        selectTrigger.click()
        return
      }

      const firstRadio = container.querySelector<HTMLElement>('input[type="radio"]:not([disabled])')
      if (firstRadio) {
        firstRadio.focus()
        return
      }

      const buttons = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([role="combobox"])',
      )
      if (buttons.length > 0) {
        buttons[buttons.length - 1].focus()
        return
      }

      const heading = container.querySelector<HTMLElement>('h3')
      if (heading) {
        heading.setAttribute('tabindex', '-1')
        heading.focus()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [step, suppress])

  return containerRef
}
