import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Loader2, Users, UserX, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getPatients } from '@/services/patients'
import { useRealtime } from '@/hooks/use-realtime'
import type { Patient } from '@/types'
import { PatientCard } from '@/components/patients/PatientCard'
import { PatientSkeleton } from '@/components/patients/PatientSkeleton'
import { CreatePatientDialog } from '@/components/patients/CreatePatientDialog'
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog'

const PER_PAGE = 20

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [fadingOutId, setFadingOutId] = useState<string | null>(null)
  const skipRealtimeRef = useRef(false)

  const buildFilter = (s: string, g: string): string | undefined => {
    const conditions: string[] = []
    if (s) conditions.push(`name ~ "${s}"`)
    if (g !== 'all') conditions.push(`gender = "${g}"`)
    return conditions.length ? conditions.join(' && ') : undefined
  }

  const loadData = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      setError(false)
      try {
        const filter = buildFilter(debouncedSearch, genderFilter)
        const result = await getPatients(pageNum, PER_PAGE, filter)
        setPatients((prev) => (append ? [...prev, ...result.items] : result.items))
        setTotalPages(result.totalPages)
        setPage(pageNum)
      } catch {
        setError(true)
        if (!append) toast.error('Não foi possível carregar a lista de pacientes')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch, genderFilter],
  )

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    loadData(1, false)
  }, [loadData])

  useRealtime('patients', () => {
    if (skipRealtimeRef.current) return
    loadData(1, false)
  })

  const handleLoadMore = () => loadData(page + 1, true)

  const handleDeleteSuccess = (id: string) => {
    setFadingOutId(id)
    skipRealtimeRef.current = true
    setTimeout(() => {
      skipRealtimeRef.current = false
      setPatients((prev) => prev.filter((p) => p.id !== id))
      setFadingOutId(null)
    }, 500)
  }

  const hasFilters = debouncedSearch || genderFilter !== 'all'
  const showEmpty = !loading && !error && patients.length === 0
  const showLoadMore = page < totalPages && !loading && !error

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Feminino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PatientSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <Button onClick={() => loadData(1, false)}>Tentar novamente</Button>
        </div>
      ) : showEmpty ? (
        <div className="flex flex-col items-center py-12 gap-4">
          {hasFilters ? (
            <>
              <UserX className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente buscar com outro nome ou ajuste os filtros.
              </p>
            </>
          ) : (
            <>
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum paciente cadastrado</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Paciente
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onDelete={setDeleteTarget}
                isFadingOut={fadingOutId === p.id}
              />
            ))}
          </div>
          {showLoadMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      <CreatePatientDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeletePatientDialog
        patient={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
