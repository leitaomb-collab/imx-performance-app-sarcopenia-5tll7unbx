import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calculator, Lock } from 'lucide-react'
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

export function StepField({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="mb-5 space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs italic text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function NumberInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
      className={cn(
        'h-11 rounded-lg text-sm focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  )
}

export function ReadOnlyField({ label, value }: { label: string; value: number | undefined }) {
  return (
    <StepField label={label}>
      <div className="relative">
        <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="number"
          value={value ?? ''}
          readOnly
          tabIndex={-1}
          className="h-11 rounded-lg bg-muted font-semibold pl-9 pr-9 cursor-not-allowed border-input focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      </div>
    </StepField>
  )
}

export function ClinicalBadge({
  status,
  labels = { normal: 'Normal', reduced: 'Reduzida' },
  variant = 'default',
}: {
  status: ClinicalStatus
  labels?: { normal: string; reduced: string }
  variant?: 'default' | 'tug'
}) {
  if (!status) return null
  let colorClass: string
  if (variant === 'tug' && status === 'normal') {
    colorClass = 'clinical-badge-blue'
  } else if (status === 'normal') {
    colorClass = 'clinical-badge-normal'
  } else {
    colorClass = 'clinical-badge-reduced'
  }
  return (
    <Badge className={cn('text-xs font-semibold uppercase border-0 px-2 py-0.5', colorClass)}>
      {status === 'normal' ? labels.normal : labels.reduced}
    </Badge>
  )
}

export function StepSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <SectionTitle title={title} />
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-r-md border-l-[3px] border-primary bg-secondary p-3 text-[0.8125rem] text-foreground/80">
      {children}
    </div>
  )
}

export function WizardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="flex gap-6">
        <Skeleton className="hidden md:block h-96 w-64 rounded-lg" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
