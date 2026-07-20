import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Lock, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCalculation } from './CalculationContext'

interface CalcFieldProps {
  label: string
  calcKey: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  onReset: () => void
  step?: string
}

export function CalcField({ label, calcKey, value, onChange, onReset, step }: CalcFieldProps) {
  const { isManual, markManual, resetOverride, isFlashing, triggerFlash, showCalcLabel } =
    useCalculation()
  const manual = isManual(calcKey)
  const prevRef = useRef(value)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      prevRef.current = value
      return
    }
    if (!manual && value !== prevRef.current && value != null) triggerFlash(calcKey)
    prevRef.current = value
  }, [value, manual, calcKey, triggerFlash])

  const handleReset = () => {
    resetOverride(calcKey)
    onReset()
  }

  return (
    <div className="mb-5 space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {showCalcLabel(calcKey) && !manual && (
          <span className="animate-calc-label text-[0.625rem] font-medium italic text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            Calculado
          </span>
        )}
      </div>
      <div className={cn('relative', isFlashing(calcKey) && 'animate-calc-flash rounded-lg')}>
        {manual ? (
          <>
            <Input
              type="number"
              value={value ?? ''}
              step={step}
              onChange={(e) =>
                onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))
              }
              className="h-11 rounded-md text-sm pr-9"
            />
            <button
              type="button"
              onClick={handleReset}
              title="Restaurar cálculo automático"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="number"
              value={value ?? ''}
              readOnly
              tabIndex={-1}
              onDoubleClick={() => markManual(calcKey)}
              className="h-11 rounded-md bg-muted/30 font-semibold pl-9 pr-9 cursor-pointer border-input focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => markManual(calcKey)}
              title="Editar manualmente"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
