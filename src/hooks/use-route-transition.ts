import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from './use-reduced-motion'

export type RouteTransitionState = 'idle' | 'navigating' | 'completing'

export function useRouteTransition() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [state, setState] = useState<RouteTransitionState>('idle')
  const prevPathname = useRef(location.pathname)

  useEffect(() => {
    if (prevPathname.current === location.pathname) return
    prevPathname.current = location.pathname

    window.scrollTo(0, 0)

    if (prefersReducedMotion) {
      setState('idle')
      return
    }

    setState('navigating')
    const t1 = setTimeout(() => setState('completing'), 400)
    const t2 = setTimeout(() => setState('idle'), 750)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [location.pathname, prefersReducedMotion])

  return { state, pathname: location.pathname, prefersReducedMotion }
}
