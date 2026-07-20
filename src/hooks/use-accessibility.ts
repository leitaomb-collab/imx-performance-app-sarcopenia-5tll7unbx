import { useCallback } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

let trappedContainer: HTMLElement | null = null
let previouslyFocused: HTMLElement | null = null
let activeKeydownHandler: ((e: KeyboardEvent) => void) | null = null

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)
}

function doReleaseFocus() {
  if (activeKeydownHandler && trappedContainer) {
    trappedContainer.removeEventListener('keydown', activeKeydownHandler)
  }
  activeKeydownHandler = null
  trappedContainer = null
  if (previouslyFocused) {
    previouslyFocused.focus()
    previouslyFocused = null
  }
}

export function useAccessibility() {
  const prefersReducedMotion = useReducedMotion()

  const announce = useCallback((message: string) => {
    const el = document.getElementById('sr-announcer')
    if (!el) return
    el.textContent = ''
    window.setTimeout(() => {
      el.textContent = message
    }, 50)
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    doReleaseFocus()
    trappedContainer = container
    previouslyFocused = document.activeElement as HTMLElement
    const focusables = getFocusable(container)
    if (focusables.length > 0) focusables[0].focus()

    activeKeydownHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const els = getFocusable(container)
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    container.addEventListener('keydown', activeKeydownHandler)
  }, [])

  const releaseFocus = useCallback(() => doReleaseFocus(), [])

  return { announce, trapFocus, releaseFocus, prefersReducedMotion }
}

export function releaseFocus() {
  doReleaseFocus()
}
