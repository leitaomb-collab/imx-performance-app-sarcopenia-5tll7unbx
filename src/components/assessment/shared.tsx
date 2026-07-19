import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ClinicalStatus } from '@/lib/clinical-utils'

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
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function NumberInput({
  value,
  onChange,
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
      {...props}
    />
  )
}

export function ClinicalBadge({
  status,
  labels = { normal: 'Normal', reduced: 'Reduzida' },
}: {
  status: ClinicalStatus
  labels?: { normal: string; reduced: string }
}) {
  if (!status) return null
  return (
    <Badge
      className={cn(
        status === 'normal' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
      )}
    >
      {status === 'normal' ? labels.normal : labels.reduced}
    </Badge>
  )
}

export function StepSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900 text-sm text-blue-700 dark:text-blue-300">
      {children}
    </div>
  )
}

export function WizardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="flex gap-6">
        <Skeleton className="hidden md:block h-96 w-56 rounded-lg" />
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
