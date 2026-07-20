import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BlurInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'onBlur'
> {
  value: string
  onCommit: (value: string) => void
}

export function BlurInput({ value, onCommit, ...props }: BlurInputProps) {
  const [local, setLocal] = useState(value)
  const ref = useRef(local)
  ref.current = local

  useEffect(() => {
    if (value !== ref.current) setLocal(value)
  }, [value])

  const handleBlur = useCallback(() => onCommit(ref.current), [onCommit])

  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  )
}

interface BlurTextareaProps extends Omit<
  React.ComponentProps<typeof Textarea>,
  'value' | 'onChange' | 'onBlur'
> {
  value: string
  onCommit: (value: string) => void
}

export function BlurTextarea({ value, onCommit, ...props }: BlurTextareaProps) {
  const [local, setLocal] = useState(value)
  const ref = useRef(local)
  ref.current = local

  useEffect(() => {
    if (value !== ref.current) setLocal(value)
  }, [value])

  const handleBlur = useCallback(() => onCommit(ref.current), [onCommit])

  return (
    <Textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  )
}

interface BlurNumberInputProps {
  value: number | undefined
  onCommit: (value: number | undefined) => void
  step?: string
  min?: number
  max?: number
  className?: string
}

export function BlurNumberInput({ value, onCommit, ...props }: BlurNumberInputProps) {
  const [local, setLocal] = useState(value?.toString() ?? '')
  const ref = useRef(local)
  ref.current = local

  useEffect(() => {
    const externalStr = value?.toString() ?? ''
    if (externalStr !== ref.current) setLocal(externalStr)
  }, [value])

  const handleBlur = useCallback(() => {
    const num = local === '' ? undefined : Number(local)
    onCommit(Number.isNaN(num) ? undefined : num)
  }, [local, onCommit])

  return (
    <Input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  )
}
