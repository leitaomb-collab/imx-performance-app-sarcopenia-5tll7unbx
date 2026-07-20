import { useEffect, useRef } from 'react'

interface KeyboardOptions {
  step: number
  totalSteps: number
  canProceed: boolean
  goToStep: (step: number) => void
  saveDraft: () => void
  finalize: () => void
  onValidationFail: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
  enabled: boolean
}

function inModalOrDialog(): boolean {
  return !!document.querySelector(
    '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
  )
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [role="combobox"]:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

export function useAssessmentKeyboard(opts: KeyboardOptions) {
  const ref = useRef(opts)
  ref.current = opts

  useEffect(() => {
    if (!opts.enabled) return

    const handler = (e: KeyboardEvent) => {
      const o = ref.current
      if (!o.enabled || inModalOrDialog()) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        o.saveDraft()
        return
      }

      if (e.shiftKey && e.key === 'Enter') {
        if (o.step > 0) {
          e.preventDefault()
          o.goToStep(o.step - 1)
        }
        return
      }

      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        const a = document.activeElement
        if (a && (a.tagName === 'TEXTAREA' || a.getAttribute('contenteditable') === 'true')) return
        e.preventDefault()
        if (o.step < o.totalSteps - 1) {
          if (o.canProceed) o.goToStep(o.step + 1)
          else o.onValidationFail()
        } else {
          o.finalize()
        }
        return
      }

      if (e.key === 'Escape') {
        const openPopper = document.querySelector('[data-radix-popper-content-wrapper]')
        if (!openPopper) {
          const a = document.activeElement
          if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) {
            ;(a as HTMLElement).blur()
          }
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [opts.enabled])

  useEffect(() => {
    if (!opts.enabled) return
    const container = opts.containerRef.current
    if (!container) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || inModalOrDialog()) return
      const focusables = getFocusable(container)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }, [opts.enabled, opts.containerRef])
}
