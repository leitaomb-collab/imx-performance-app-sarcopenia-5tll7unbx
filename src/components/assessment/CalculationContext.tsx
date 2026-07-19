import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface CalculationContextValue {
  isManual: (key: string) => boolean
  markManual: (key: string) => void
  resetOverride: (key: string) => void
  isFlashing: (key: string) => boolean
  triggerFlash: (key: string) => void
  showCalcLabel: (key: string) => boolean
}

const NOOP: CalculationContextValue = {
  isManual: () => false,
  markManual: () => {},
  resetOverride: () => {},
  isFlashing: () => false,
  triggerFlash: () => {},
  showCalcLabel: () => false,
}

const CalculationContext = createContext<CalculationContextValue | null>(null)

export function useCalculation(): CalculationContextValue {
  return useContext(CalculationContext) ?? NOOP
}

export function CalculationProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Set<string>>(new Set())
  const [flashes, setFlashes] = useState<Set<string>>(new Set())
  const [labels, setLabels] = useState<Set<string>>(new Set())
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const labelTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const isManual = useCallback((key: string) => overrides.has(key), [overrides])
  const markManual = useCallback((key: string) => {
    setOverrides((prev) => new Set(prev).add(key))
  }, [])
  const resetOverride = useCallback((key: string) => {
    setOverrides((prev) => {
      const n = new Set(prev)
      n.delete(key)
      return n
    })
  }, [])

  const triggerFlash = useCallback((key: string) => {
    setFlashes((prev) => new Set(prev).add(key))
    setLabels((prev) => new Set(prev).add(key))
    const of = flashTimers.current.get(key)
    if (of) clearTimeout(of)
    flashTimers.current.set(
      key,
      setTimeout(() => {
        setFlashes((prev) => {
          const n = new Set(prev)
          n.delete(key)
          return n
        })
      }, 500),
    )
    const ol = labelTimers.current.get(key)
    if (ol) clearTimeout(ol)
    labelTimers.current.set(
      key,
      setTimeout(() => {
        setLabels((prev) => {
          const n = new Set(prev)
          n.delete(key)
          return n
        })
      }, 2000),
    )
  }, [])

  const isFlashing = useCallback((key: string) => flashes.has(key), [flashes])
  const showCalcLabel = useCallback((key: string) => labels.has(key), [labels])

  return (
    <CalculationContext.Provider
      value={{ isManual, markManual, resetOverride, isFlashing, triggerFlash, showCalcLabel }}
    >
      {children}
    </CalculationContext.Provider>
  )
}
