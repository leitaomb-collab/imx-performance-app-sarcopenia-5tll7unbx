import { useEffect, useRef } from 'react'

interface KeyboardOptions {
  step: number
  totalSteps: number
  canProceed: boolean
  goToStep: (step: number) => void
  saveDraft: () => void
  finalize: () => void
  onValidationFail: () => void
}

function inModalOrEditor(): boolean {
  if (
    document.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
    )
  )
    return true
  const a = document.activeElement
  return !!a?.closest('[contenteditable="true"]')
}

function inInput(): boolean {
  const a = document.activeElement
  if (!a) return false
  const t = a.tagName
  return (
    t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || a.getAttribute('role') === 'combobox'
  )
}

export function useWizardKeyboard(opts: KeyboardOptions) {
  const ref = useRef(opts)
  ref.current = opts

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const o = ref.current
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (inModalOrEditor()) return

      if (mod && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        o.saveDraft()
        return
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault()
        if (o.step < o.totalSteps - 1) o.goToStep(o.totalSteps - 1)
        else o.finalize()
        return
      }
      if ((e.key === 'ArrowRight' && !inInput()) || (e.altKey && e.key === 'ArrowDown')) {
        if (o.step < o.totalSteps - 1) {
          e.preventDefault()
          if (o.canProceed) o.goToStep(o.step + 1)
          else o.onValidationFail()
        }
        return
      }
      if ((e.key === 'ArrowLeft' && !inInput()) || (e.altKey && e.key === 'ArrowUp')) {
        if (o.step > 0) {
          e.preventDefault()
          o.goToStep(o.step - 1)
        }
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
