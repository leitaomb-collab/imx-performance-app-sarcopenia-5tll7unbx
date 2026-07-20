import { useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ExportCsvButtonProps {
  patientId: string
  patientName: string
  concludedCount: number
}

export function ExportCsvButton({ patientId, patientName, concludedCount }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false)
  const reducedMotion = useReducedMotion()
  const isDisabled = concludedCount === 0

  const buildFilename = useCallback(() => {
    const safeName = patientName.replace(/\s/g, '_')
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `longitudinal_${safeName}_${y}${m}${d}.csv`
  }, [patientName])

  const handleExport = useCallback(async () => {
    setLoading(true)
    try {
      const { exportLongitudinalCsv } = await import('@/services/export')
      const blob = await exportLongitudinalCsv(patientId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = buildFilename()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Arquivo CSV exportado com sucesso.')
    } catch {
      toast.error('Não foi possível exportar o arquivo CSV.', {
        action: {
          label: 'Tentar novamente',
          onClick: () => handleExport(),
        },
      })
    } finally {
      setLoading(false)
    }
  }, [patientId, buildFilename])

  const button = (
    <Button
      variant="secondary"
      size="sm"
      disabled={isDisabled || loading}
      onClick={handleExport}
      className={cn('h-11 min-h-[44px] gap-1.5 text-xs font-medium')}
    >
      {loading ? (
        <Loader2 className={cn('h-4 w-4', !reducedMotion && 'animate-spin')} />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar CSV
    </Button>
  )

  if (isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent>Nenhuma avaliação concluída para exportar</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
