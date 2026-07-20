import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      className={cn('h-11 rounded-lg text-sm min-h-[44px]', className)}
    />
  )
}

export function ReadOnlyField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="h-11 flex items-center px-3 rounded-lg bg-secondary text-sm font-medium text-muted-foreground min-h-[44px]">
        {value ?? '-'}
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
  return <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">{children}</div>
}

export function WizardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-secondary rounded" />
      <div className="h-2 bg-secondary rounded" />
      <div className="h-64 bg-secondary rounded-lg" />
    </div>
  )
}
