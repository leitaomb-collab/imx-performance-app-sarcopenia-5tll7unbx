import { Check } from 'lucide-react'

export function FieldGroupIndicator({
  values,
}: {
  values: (number | string | undefined | null | boolean)[]
}) {
  const filled = values.filter((v) => v != null && v !== '' && v !== false).length
  const total = values.length
  const isFull = filled === total && total > 0
  const isEmpty = filled === 0

  if (isEmpty) {
    return (
      <span className="inline-block h-2 w-2 rounded-full border border-muted-foreground/40 shrink-0" />
    )
  }
  if (isFull) {
    return (
      <span className="inline-flex h-2 w-2 items-center justify-center rounded-full bg-primary shrink-0">
        <Check className="h-1.5 w-1.5 text-primary-foreground" strokeWidth={4} />
      </span>
    )
  }
  return <span className="inline-block h-2 w-2 rounded-full bg-primary/50 shrink-0" />
}
