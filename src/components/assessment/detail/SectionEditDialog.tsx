import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { NumberInput } from '@/components/assessment/shared'
import { cn } from '@/lib/utils'

export interface EditFieldConfig {
  key: string
  label: string
  type: 'number' | 'text' | 'textarea' | 'select' | 'switch'
  step?: string
  min?: number
  max?: number
  options?: { value: string; label: string }[]
  hint?: string
  fullWidth?: boolean
}

interface SectionEditDialogProps {
  title: string
  fields: EditFieldConfig[]
  data: Record<string, any>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Record<string, any>) => void
}

export function SectionEditDialog({
  title,
  fields,
  data,
  open,
  onOpenChange,
  onSave,
}: SectionEditDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (open) setFormData({ ...data })
  }, [open, data])

  const set = (key: string, val: any) => setFormData((prev) => ({ ...prev, [key]: val }))

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar — {title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {fields.map((f) => (
            <div key={f.key} className={cn(f.fullWidth && 'sm:col-span-2')}>
              <Label className="text-sm font-medium mb-1.5 block">{f.label}</Label>
              {f.type === 'number' && (
                <NumberInput
                  value={formData[f.key]}
                  onChange={(v) => set(f.key, v)}
                  step={f.step}
                  min={f.min}
                  max={f.max}
                />
              )}
              {f.type === 'text' && (
                <Input
                  value={formData[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="h-11"
                />
              )}
              {f.type === 'textarea' && (
                <Textarea
                  value={formData[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={4}
                />
              )}
              {f.type === 'switch' && (
                <Switch checked={formData[f.key] ?? false} onCheckedChange={(v) => set(f.key, v)} />
              )}
              {f.type === 'select' && (
                <Select value={String(formData[f.key] ?? '')} onValueChange={(v) => set(f.key, v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {f.hint && <p className="text-xs italic text-muted-foreground mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
