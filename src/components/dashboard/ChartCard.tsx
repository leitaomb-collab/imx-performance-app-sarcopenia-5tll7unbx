import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

interface ChartCardProps {
  title: string
  isEmpty?: boolean
  emptyMessage?: string
  note?: string
  children: React.ReactNode
  index?: number
}

function ChartCardBase({
  title,
  isEmpty,
  emptyMessage,
  note,
  children,
  index = 0,
}: ChartCardProps) {
  const animationDelay = 400 + index * 100

  return (
    <Card
      className="chart-card chart-card-enter shadow-subtle rounded-[0.75rem]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="sr-only">Gráfico de {title}.</span>
        {isEmpty ? (
          <div className="chart-empty-state animate-fade-in-empty">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-semibold">Sem dados disponíveis</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {emptyMessage || 'Nenhuma avaliação registrada ainda'}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/avaliacao/nova">Nova Avaliação</Link>
            </Button>
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
