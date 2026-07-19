import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartCardProps {
  title: string
  isEmpty?: boolean
  emptyMessage?: string
  note?: string
  children: React.ReactNode
}

export function ChartCard({ title, isEmpty, emptyMessage, note, children }: ChartCardProps) {
  return (
    <Card className="shadow-subtle border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="sr-only">Gráfico de {title}.</span>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
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
