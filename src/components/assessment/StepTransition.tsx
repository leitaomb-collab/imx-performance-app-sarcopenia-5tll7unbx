import { useState, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

interface StepTransitionProps {
  step: number
  direction: 'forward' | 'backward'
  children: ReactNode
}

export function StepTransition({ step, direction, children }: StepTransitionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [oldContent, setOldContent] = useState<ReactNode | null>(null)
  const prevStepRef = useRef(step)
  const prevChildrenRef = useRef<ReactNode>(children)

  useLayoutEffect(() => {
    if (step !== prevStepRef.current) {
      setOldContent(prevChildrenRef.current)
      prevChildrenRef.current = children
      prevStepRef.current = step
      const ms = prefersReducedMotion ? 100 : 200
      const timer = setTimeout(() => setOldContent(null), ms)
      return () => clearTimeout(timer)
    }
    prevChildrenRef.current = children
  }, [step, children, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div key={step} className="animate-reduced-fade">
        {children}
      </div>
    )
  }

  return (
    <div className="grid">
      {oldContent && (
        <div className="col-start-1 row-start-1 pointer-events-none animate-step-exit">
          {oldContent}
        </div>
      )}
      <div
        key={step}
        className={cn(
          'col-start-1 row-start-1',
          oldContent
            ? direction === 'forward'
              ? 'animate-step-enter-forward'
              : 'animate-step-enter-backward'
            : '',
        )}
      >
        {children}
      </div>
    </div>
  )
}
