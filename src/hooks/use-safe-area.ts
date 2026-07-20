import { useState, useEffect } from 'react'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

function getInsets(): SafeAreaInsets {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  const style = getComputedStyle(document.documentElement)
  const parse = (varName: string) => {
    const val = style.getPropertyValue(varName).trim()
    return parseFloat(val) || 0
  }
  return {
    top: parse('--sat'),
    bottom: parse('--sab'),
    left: parse('--sal'),
    right: parse('--sar'),
  }
}

export function useSafeArea() {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const update = () => setInsets(getInsets())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return insets
}
