import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClinicalStatus } from '@/lib/clinical-utils'

export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b pb-3">
      <span className="h-3 w-3 bg-primary rounded-sm shrink-0" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  )
}

export function StepSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 border-b pb-3">
        <span className="h-3 w-3 bg-primary rounded-sm shrink-0" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function StepField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface NumberInputProps {
  value?: number | null
  onChange: (val: number | undefined) => void
  step?: string
  min?: number
  max?: number
  inputMode?: 'numeric' | 'decimal'
  className?: string
  placeholder?: string
}

export function NumberInput({
  value,
  onChange,
  step,
  min,
  max,
  inputMode = 'decimal',
  className,
  placeholder,
}: NumberInputProps) {
  return (
    <Input
      type="number"
      inputMode={inputMode}
      value={value ?? ''}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? undefined : parseFloat(v))
      }}
      className={cn('h-11 rounded-md text-sm min-h-[44px]', className)}
    />
  )
}

export function ReadOnlyField({
  label,
  value,
  calculated = true,
}: {
  label: string
  value?: string | number | null
  calculated?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="h-11 flex items-center justify-between px-3 rounded-md bg-muted/30 text-sm font-medium text-muted-foreground min-h-[44px]">
        <span>{value ?? '-'}</span>
        {calculated && <span className="text-xs italic text-muted-foreground/60">calculado</span>}
      </div>
    </div>
  )
}

export function ClinicalBadge({ status, variant }: { status: ClinicalStatus; variant?: string }) {
  if (!status) return null
  const isNormal = status === 'normal'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
        isNormal ? 'clinical-badge-normal' : 'clinical-badge-reduced',
      )}
    >
      {isNormal ? 'Normal' : 'Reduzido'}
    </span>
  )
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground flex items-start gap-2">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div>{children}</div>
    </div>
  )
}

export function WizardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-md" />
      <div className="h-12 bg-muted rounded-lg" />
      <div className="flex gap-6">
        <div className="hidden md:block w-60 shrink-0 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div className="h-4 bg-muted rounded" style={{ width: `${80 + (i % 3) * 20}px` }} />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-2 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-lg" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-11 bg-muted rounded-md" />
            <div className="h-11 bg-muted rounded-md" />
            <div className="h-11 bg-muted rounded-md" />
            <div className="h-11 bg-muted rounded-md" />
          </div>
          <div className="flex justify-between pt-4">
            <div className="h-11 w-24 bg-muted rounded-lg" />
            <div className="h-11 w-24 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
