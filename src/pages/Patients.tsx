import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { useAccessibility } from '@/hooks/use-accessibility'
import { useDebounce } from '@/hooks/use-debounce'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { getPatients } from '@/services/patients'
import { useRealtime } from '@/hooks/use-realtime'
import { useRoutePrefetch } from '@/hooks/use-route-prefetch'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'
import { PatientCard } from '@/components/patients/PatientCard'
import { PatientSkeleton } from '@/components/patients/PatientSkeleton'
import { CreatePatientDialog } from '@/components/patients/CreatePatientDialog'
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog'
import { VirtualizedGrid } from '@/components/ui/virtualized-grid'

const PER_PAGE = 20

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const isDebouncing = search !== debouncedSearch
  const [genderFilter, setGenderFilter] = useState('all')
  const [filterPulse, setFilterPulse] = useState(false)
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? Math.max(1, parseInt(p, 10)) : 1
  })
  const [totalPages, setTotalPages] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [fadingOutId, setFadingOutId] = useState<string | null>(null)
  const [columns, setColumns] = useState(3)
  const skipRealtimeRef = useRef(false)
  const entranceModeRef = useRef<'initial' | 'filter'>('initial')
  const prevFilterKeyRef = useRef('')
  const { announce } = useAccessibility()
  const prefetch = useRoutePrefetch()
  const reducedMotion = useReducedMotion()

  const filterKey = `${debouncedSearch}-${genderFilter}`

  useEffect(() => {
    if (prevFilterKeyRef.current && prevFilterKeyRef.current !== filterKey) {
      entranceModeRef.current = 'filter'
    }
    prevFilterKeyRef.current = filterKey
  }, [filterKey])

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth
      setColumns(w < 768 ? 1 : w < 1024 ? 2 : 3)
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const buildFilter = (s: string, g: string): string | undefined => {
    const conditions: string[] = []
    if (s) conditions.push(`name ~ "${s}"`)
    if (g !== 'all') conditions.push(`gender = "${g}"`)
    return conditions.length ? conditions.join(' && ') : undefined
  }

  const loadData = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) entranceModeRef.current = 'initial'
      if (!append) setLoading(true)
      else setLoadingMore(true)
      setError(false)
      try {
        const filter = buildFilter(debouncedSearch, genderFilter)
        const result = await getPatients(pageNum, PER_PAGE, filter)
        setPatients((prev) => (append ? [...prev, ...result.items] : result.items))
        setTotalPages(result.totalPages)
        setPage(pageNum)
        if (!append) {
          const count = result.totalItems
          announce(`${count} ${count === 1 ? 'paciente encontrado' : 'pacientes encontrados'}`)
        }
      } catch {
        setError(true)
        if (!append) toast.error('Não foi possível carregar a lista de pacientes')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch, genderFilter, announce],
  )

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (page > 1) newParams.set('page', String(page))
    else newParams.delete('page')
    setSearchParams(newParams, { replace: true })
  }, [page])

  useEffect(() => {
    loadData(1, false)
  }, [loadData])

  useRealtime('patients', (e) => {
    if (skipRealtimeRef.current) return
    if (e.action === 'create') {
      setPatients((prev) => [...prev, e.record as unknown as Patient])
    } else if (e.action === 'update') {
      setPatients((prev) =>
        prev.map((p) => (p.id === e.record.id ? (e.record as unknown as Patient) : p)),
      )
    } else if (e.action === 'delete') {
      setPatients((prev) => prev.filter((p) => p.id !== e.record.id))
    }
  })

  const handleLoadMore = useCallback(() => loadData(page + 1, true), [loadData, page])

  const handleGenderChange = useCallback((value: string) => {
    setGenderFilter(value)
    if (value !== 'all') {
      setFilterPulse(true)
      setTimeout(() => setFilterPulse(false), 200)
    }
  }, [])

  const handleDeleteSuccess = useCallback(
    (id: string) => {
      setFadingOutId(id)
      skipRealtimeRef.current = true
      setTimeout(
        () => {
          skipRealtimeRef.current = false
          setPatients((prev) => prev.filter((p) => p.id !== id))
          setFadingOutId(null)
        },
        reducedMotion ? 100 : 250,
      )
    },
    [reducedMotion],
  )

  const handlePrefetchPatient = useCallback(
    () => prefetch('patient-profile', () => import('@/pages/PatientProfile')),
    [prefetch],
  )

  const hasFilters = debouncedSearch || genderFilter !== 'all'
  const showEmpty = !loading && !error && patients.length === 0
  const showLoadMore = page < totalPages && !loading && !error
  const allLoaded = !loading && !error && patients.length > 0 && page >= totalPages
  const shouldVirtualize = patients.length > 100

  const renderItem = useCallback(
    (p: Patient) => (
      <PatientCard
        patient={p}
        onDelete={setDeleteTarget}
        isFadingOut={fadingOutId === p.id}
        onPrefetch={handlePrefetchPatient}
        useViewportAnim
      />
    ),
    [fadingOutId, handlePrefetchPatient],
  )

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
            className="pl-8 pr-8 search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar pacientes"
          />
          {isDebouncing && (
            <Loader2
              className={cn(
                'absolute right-2.5 top-2.5 h-3.5 w-3.5 text-primary animate-debounce-in',
                !reducedMotion && 'animate-spin',
              )}
            />
          )}
        </div>
        <Select value={genderFilter} onValueChange={handleGenderChange}>
          <SelectTrigger className={cn('w-full sm:w-40', filterPulse && 'animate-filter-pulse')}>
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent className="gender-select-content">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Feminino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PatientSkeleton
              key={i}
              className={reducedMotion ? undefined : 'animate-fade-in-200'}
            />
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
              <Search className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-muted-foreground">Tente ajustar a busca ou os filtros.</p>
            </>
          ) : (
            <>
              <div className={cn(!reducedMotion && 'animate-float-icon')}>
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Nenhum paciente cadastrado</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Paciente
              </Button>
            </>
          )}
        </div>
      ) : shouldVirtualize ? (
        <VirtualizedGrid
          items={patients}
          renderItem={renderItem}
          itemHeight={220}
          columns={columns}
        />
      ) : (
        <>
          <div key={filterKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p, index) => (
              <PatientCard
                key={p.id}
                patient={p}
                onDelete={setDeleteTarget}
                isFadingOut={fadingOutId === p.id}
                onPrefetch={handlePrefetchPatient}
                index={index}
                entranceMode={entranceModeRef.current}
                useViewportAnim={patients.length > 20 && index >= 20}
              />
            ))}
          </div>
          {showLoadMore ? (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore && (
                  <Loader2 className={cn('mr-2 h-4 w-4', !reducedMotion && 'animate-spin')} />
                )}
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </Button>
            </div>
          ) : allLoaded ? (
            <p className="text-center text-[0.8125rem] text-muted-foreground animate-fade-in-200 pt-4">
              Todos os pacientes carregados
            </p>
          ) : null}
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
