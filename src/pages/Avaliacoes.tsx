import { useEffect, useState } from 'react'
import { getAvaliacoes } from '@/services/avaliacoes'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])

  const loadData = async () => {
    const data = await getAvaliacoes()
    setAvaliacoes(data)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('avaliacoes', loadData)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
        <Button asChild>
          <Link to="/avaliacao/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo de Teste</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avaliacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma avaliação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              avaliacoes.map((av) => (
                <TableRow key={av.id}>
                  <TableCell className="font-medium">
                    {format(new Date(av.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{av.expand?.paciente?.name}</TableCell>
                  <TableCell>{av.tipo}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/avaliacao/${av.id}`}>
                        Visualizar <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
