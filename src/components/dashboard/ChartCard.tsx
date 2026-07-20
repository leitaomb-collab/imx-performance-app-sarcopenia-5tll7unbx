import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/chart'

interface ChartCardProps {
  title: string
  isEmpty?: boolean
  emptyMessage?: string
  note?: string
  children: React.ReactNode
}

function ChartCardBase({ title, isEmpty, emptyMessage, note, children }: ChartCardProps) {
  return (
    <Card className="shadow-subtle rounded-[0.75rem]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="sr-only">Gráfico de {title}.</span>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[14rem] md:h-[18rem] text-sm text-muted-foreground">
            {emptyMessage || 'Sem dados para este marcador'}
          </div>
        ) : (
          <>
            {children}
            {note && <p className="text-xs text-muted-foreground mt-2 text-center">{note}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export const ChartCard = memo(ChartCardBase)
