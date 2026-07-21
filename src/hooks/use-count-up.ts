import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration: number = 800, delay: number = 0) {
  const [value, setValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    startTimeRef.current = null
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * easeOutCubic(progress)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    const startAnimation = () => {
      rafRef.current = requestAnimationFrame(animate)
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [target, duration, delay])

  return value
}
