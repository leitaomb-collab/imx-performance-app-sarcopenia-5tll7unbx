import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { useReducedMotion } from './use-reduced-motion'

export function useTransitionNavigate() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  return useCallback(
    (to: string | number, opts?: { replace?: boolean }) => {
      const doNavigate = () => {
        if (typeof to === 'number') {
          navigate(to)
        } else if (opts?.replace) {
          navigate(to, { replace: true })
        } else {
          navigate(to)
        }
      }

      if (
        prefersReducedMotion ||
        typeof document === 'undefined' ||
        !('startViewTransition' in document)
      ) {
        doNavigate()
        return
      }

      const doc = document as Document & {
        startViewTransition: (cb: () => void) => void
      }
      doc.startViewTransition(() => {
        flushSync(doNavigate)
      })
    },
    [navigate, prefersReducedMotion],
  )
}
