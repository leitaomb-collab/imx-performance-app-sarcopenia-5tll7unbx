import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import { getSPPBStatus, getSPPBTotal, getTUGStatus } from '@/lib/clinical-utils'
import { cn } from '@/lib/utils'

interface Props {
  assessment: Record<string, unknown>
}

export function Section4PhysicalPerformance({ assessment }: Props) {
  const ba = obj(assessment.balanceAssessment)

  const hasPerf = hasData(ba)

  const sppbTotal = getSPPBTotal(ba.sppbBalance, ba.sppbGait, ba.sppbChair)
  const sppbStatus = getSPPBStatus(sppbTotal)
  const tugStatus = getTUGStatus(ba.tugSimple as number | undefined)

  const isReduced = (sppbTotal != null && sppbTotal <= 7) || tugStatus === 'reduced'

  const perfRows: ReportRow[] = [
    { label: 'Equilíbrio (SPPB)', value: fmt(ba.sppbBalance, 'pts') },
    { label: 'Marcha (SPPB)', value: fmt(ba.sppbGait, 'pts') },
    { label: 'Levantar da Cadeira (SPPB)', value: fmt(ba.sppbChair, 'pts') },
    {
      label: 'SPPB Total',
      value: fmt(sppbTotal, 'pts'),
      ref: '≥ 10 pts',
      interp:
        sppbStatus === 'normal' ? 'Normal' : sppbStatus === 'reduced' ? 'Reduzido' : undefined,
      interpClass:
        sppbStatus === 'normal' ? 'normal' : sppbStatus === 'reduced' ? 'reduced' : undefined,
    },
    {
      label: 'TUG Simples',
      value: fmt(ba.tugSimple, 's'),
      ref: '≤ 12 s',
      interp: tugStatus === 'normal' ? 'Normal' : tugStatus === 'reduced' ? 'Alterada' : undefined,
      interpClass:
        tugStatus === 'normal' ? 'normal' : tugStatus === 'reduced' ? 'altered' : undefined,
    },
    { label: 'TUG Dupla Tarefa', value: fmt(ba.tugDualTask, 's') },
  ]

  return (
    <div aria-label="4. Desempenho Físico" className="animate-fade-in">
      <SectionBlock number={4} title="Desempenho Físico">
        {hasPerf ? (
          <>
            <ReportTable rows={perfRows} />

            {(ba.stabilometryEyesOpen || ba.stabilometryEyesClosed) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Estabilometria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Olhos Abertos
                    </p>
                    <p className="text-sm">{ba.stabilometryEyesOpen || '-'}</p>
                  </div>
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Olhos Fechados
                    </p>
                    <p className="text-sm">{ba.stabilometryEyesClosed || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={cn(
                'mt-4 border-l-4 rounded-r-lg p-4 text-sm font-medium break-inside-avoid',
                isReduced
                  ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-400'
                  : 'bg-green-50 border-green-400 text-green-800 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400',
              )}
            >
              <p className="font-medium">
                {isReduced
                  ? 'Performance física reduzida segundo critérios EWGSOP2'
                  : 'Performance física preservada'}
              </p>
            </div>
          </>
        ) : (
          <PlaceholderText />
        )}
      </SectionBlock>
    </div>
  )
}

function PlaceholderText() {
  return (
    <div className="bg-muted/30 rounded">
      <p className="text-muted-foreground text-sm italic py-4 text-center">
        Dados não coletados nesta avaliação
      </p>
    </div>
  )
}
