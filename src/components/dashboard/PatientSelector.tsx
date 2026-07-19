import { useState, useEffect, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface PatientSelectorProps {
  patients: Patient[]
  value: string | null
  onChange: (id: string | null) => void
}

export function PatientSelector({ patients, value, onChange }: PatientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const selected = patients.find((p) => p.id === value)

  const filtered = useMemo(() => {
    if (!debouncedSearch) return patients
    return patients.filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  }, [patients, debouncedSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full sm:w-[280px] justify-between min-h-[44px]">
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            {selected ? selected.name : 'Todos os pacientes'}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar paciente..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="cursor-pointer min-h-[44px]"
              >
                <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                Todos os pacientes
              </CommandItem>
              {filtered.map((p) => (
                <CommandItem
                  key={p.id}
                  onSelect={() => {
                    onChange(p.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer min-h-[44px]"
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === p.id ? 'opacity-100' : 'opacity-0')}
                  />
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
