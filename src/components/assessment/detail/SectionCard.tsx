import { useState, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyData } from '@/components/assessment/detail/primitives'

interface SectionCardProps {
  title: string
  empty: boolean
  readOnly: boolean
  onEdit: () => void
  children: ReactNode
}

export function SectionCard({ title, empty, readOnly, onEdit, children }: SectionCardProps) {
  const [open, setOpen] = useState(true)
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 min-h-[44px] w-full text-left"
          aria-expanded={open}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', !open && '-rotate-90')} />
          <span className="font-semibold">{title}</span>
        </button>
        {!readOnly && !empty && (
          <Button variant="outline" size="sm" onClick={onEdit} className="h-9 shrink-0">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
          </Button>
        )}
      </div>
      {open && <CardContent className="pt-4">{empty ? <EmptyData /> : children}</CardContent>}
    </Card>
  )
}
