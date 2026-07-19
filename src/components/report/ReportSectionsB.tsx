import { ReportTable, SectionBlock, SubSection, EmptySection } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import { RichText } from '@/components/patients/RichText'
import { InfoBox } from '@/components/assessment/shared'
import { getSarcFTotal, getSarcCalFTotal, getSarcopeniaRisk } from '@/lib/clinical-utils'
import type { Patient } from '@/types'

interface Props {
  assessment: Record<string, any>
  patient: Patient | null
}

function getPct(actual?: number, predicted?: number): number | undefined {
  if (actual == null || predicted == null || predicted === 0) return undefined
  return Math.round((actual / predicted) * 100)
}

function pctInterp(p: number | undefined): { text: string; cls: 'normal' | 'altered' } | null {
  if (p == null) return null
  return p >= 80 ? { text: 'Normal', cls: 'normal' } : { text: 'Alterada', cls: 'altered' }
}

const DIAGNOSIS_OPTIONS = [
  { value: 'sem_sarcopenia', label: 'Sem sarcopenia' },
  { value: 'sarcopenia', label: 'Sarcopenia provável' },
  { value: 'sarcopenia_grave', label: 'Sarcopenia grave' },
  { value: 'nao_avaliado', label: 'Não avaliado' },
]

const SPIRO_PATTERN: Record<string, string> = {
  normal: 'Normal',
  obstrutivo: 'Obstrutivo',
  restritivo: 'Restritivo',
  misto: 'Misto',
}

export function ReportSectionsB({ assessment, patient }: Props) {
  const gender = patient?.gender ?? 'M'
  const rs = obj(assessment.respiratoryStrength)
  const sp = obj(assessment.spirometry)
  const ss = obj(assessment.sarcopeniaScreening)
  const ew = obj(assessment.ewgsop2Analysis)

  const pimaxPct = rs.pimaxPercent ?? getPct(rs.pimaxActual, rs.pimaxPredicted)
  const pemaxPct = rs.pemaxPercent ?? getPct(rs.pemaxActual, rs.pemaxPredicted)
  const pimaxI = pctInterp(pimaxPct)
  const pemaxI = pctInterp(pemaxPct)

  const fvcPct = sp.fvcPercent ?? getPct(sp.fvc, sp.fvcPredicted)
  const fev1Pct = sp.fev1Percent ?? getPct(sp.fev1, sp.fev1Predicted)
  const fev1RatioI =
    sp.fev1FvcRatio != null
      ? sp.fev1FvcRatio >= 70
        ? { text: 'Normal', cls: 'normal' as const }
        : { text: 'Alterada', cls: 'altered' as const }
      : null
  const fefPct = sp.fef2575Percent ?? getPct(sp.fef2575, sp.fef2575Predicted)
  const pfePct =
    sp.peakExpiratoryFlowPercent ?? getPct(sp.peakExpiratoryFlow, sp.peakExpiratoryFlowPredicted)

  const sarcFTotal = getSarcFTotal([
    ss.strength,
    ss.assistanceWalking,
    ss.riseChair,
    ss.climbStairs,
    ss.falls,
  ])
  const sarcCalFTotal = getSarcCalFTotal(sarcFTotal, ss.calfCircumference, gender)
  const fRisk = getSarcopeniaRisk(sarcFTotal)
  const cfRisk = getSarcopeniaRisk(sarcCalFTotal)
  const fRiskI = fRisk
    ? fRisk === 'baixo'
      ? { text: 'Sem risco', cls: 'normal' as const }
      : { text: 'Em risco', cls: 'moderate' as const }
    : null
  const cfRiskI = cfRisk
    ? cfRisk === 'baixo'
      ? { text: 'Sem risco', cls: 'normal' as const }
      : { text: 'Em risco', cls: 'moderate' as const }
    : null

  return (
    <>
      <SectionBlock number={7} title="Força Respiratória">
        {hasData(rs) ? (
          <ReportTable
            rows={[
              { label: 'PImax Atual', value: fmt(rs.pimaxActual, 'cmH₂O') },
              { label: 'PImax Previsto', value: fmt(rs.pimaxPredicted, 'cmH₂O') },
              {
                label: 'PImax % do Previsto',
                value: pimaxPct != null ? `${pimaxPct}%` : '-',
                ref: '≥ 80%',
                interp: pimaxI?.text,
                interpClass: pimaxI?.cls,
              },
              { label: 'PEmax Atual', value: fmt(rs.pemaxActual, 'cmH₂O') },
              { label: 'PEmax Previsto', value: fmt(rs.pemaxPredicted, 'cmH₂O') },
              {
                label: 'PEmax % do Previsto',
                value: pemaxPct != null ? `${pemaxPct}%` : '-',
                ref: '≥ 80%',
                interp: pemaxI?.text,
                interpClass: pemaxI?.cls,
              },
            ]}
          />
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={8} title="Espirometria">
        {hasData(sp) ? (
          <ReportTable
            rows={[
              {
                label: 'CVF',
                value: sp.fvc != null ? `${sp.fvc} L${fvcPct != null ? ` (${fvcPct}%)` : ''}` : '-',
                ref: sp.fvcPredicted != null ? `${sp.fvcPredicted} L` : '-',
                interp: pctInterp(fvcPct)?.text,
                interpClass: pctInterp(fvcPct)?.cls,
              },
              {
                label: 'VEF1',
                value:
                  sp.fev1 != null ? `${sp.fev1} L${fev1Pct != null ? ` (${fev1Pct}%)` : ''}` : '-',
                ref: sp.fev1Predicted != null ? `${sp.fev1Predicted} L` : '-',
                interp: pctInterp(fev1Pct)?.text,
                interpClass: pctInterp(fev1Pct)?.cls,
              },
              {
                label: 'VEF1/CVF',
                value: fmt(sp.fev1FvcRatio, '%'),
                ref: '≥ 70%',
                interp: fev1RatioI?.text,
                interpClass: fev1RatioI?.cls,
              },
              {
                label: 'FEF25-75%',
                value:
                  sp.fef2575 != null
                    ? `${sp.fef2575} L/s${fefPct != null ? ` (${fefPct}%)` : ''}`
                    : '-',
                ref: sp.fef2575Predicted != null ? `${sp.fef2575Predicted} L/s` : '-',
              },
              {
                label: 'PFE',
                value:
                  sp.peakExpiratoryFlow != null
                    ? `${sp.peakExpiratoryFlow} L/min${pfePct != null ? ` (${pfePct}%)` : ''}`
                    : '-',
                ref:
                  sp.peakExpiratoryFlowPredicted != null
                    ? `${sp.peakExpiratoryFlowPredicted} L/min`
                    : '-',
              },
              {
                label: 'Padrão',
                value: sp.pattern ? (SPIRO_PATTERN[sp.pattern] ?? sp.pattern) : '-',
              },
            ]}
          />
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={9} title="Triagem de Sarcopenia">
        {hasData(ss) ? (
          <>
            <SubSection title="SARC-F">
              <ReportTable
                rows={[
                  { label: 'Força', value: fmt(ss.strength) },
                  { label: 'Auxílio para Caminhar', value: fmt(ss.assistanceWalking) },
                  { label: 'Levantar da Cadeira', value: fmt(ss.riseChair) },
                  { label: 'Subir Escadas', value: fmt(ss.climbStairs) },
                  { label: 'Quedas', value: fmt(ss.falls) },
                  {
                    label: 'Total',
                    value: fmt(sarcFTotal),
                    interp: fRiskI?.text,
                    interpClass: fRiskI?.cls,
                  },
                ]}
              />
            </SubSection>
            <SubSection title="SARC-CalF">
              <ReportTable
                rows={[
                  { label: 'SARC-F Total', value: fmt(sarcFTotal) },
                  {
                    label: 'Circunferência da Panturrilha',
                    value: fmt(ss.calfCircumference, 'cm'),
                  },
                  {
                    label: 'SARC-CalF Total',
                    value: fmt(sarcCalFTotal),
                    interp: cfRiskI?.text,
                    interpClass: cfRiskI?.cls,
                  },
                ]}
              />
            </SubSection>
          </>
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={10} title="Análise EWGSOP2">
        {hasData(ew) ? (
          <>
            <ReportTable
              headers={['Critério', 'Resultado']}
              rows={[
                {
                  label: 'Triagem (SARC-F)',
                  value: fRisk ? (fRisk === 'baixo' ? 'Sem risco' : 'Em risco') : '-',
                },
                {
                  label: 'Força (Handgrip)',
                  value:
                    ew.muscleStrengthLow != null
                      ? ew.muscleStrengthLow
                        ? 'Reduzida'
                        : 'Normal'
                      : '-',
                },
                {
                  label: 'Massa Muscular (ALMI)',
                  value:
                    ew.muscleMassLow != null ? (ew.muscleMassLow ? 'Reduzida' : 'Normal') : '-',
                },
                {
                  label: 'Desempenho Físico (SPPB)',
                  value:
                    ew.physicalPerformanceLow != null
                      ? ew.physicalPerformanceLow
                        ? 'Reduzido'
                        : 'Normal'
                      : '-',
                },
              ]}
            />
            <div className="ewgsop2-container mt-4">
              <p className="text-sm font-semibold mb-2">Diagnóstico:</p>
              <div className="grid grid-cols-2 gap-2">
                {DIAGNOSIS_OPTIONS.map((opt) => {
                  const active = assessment.finalDiagnosis === opt.value
                  return (
                    <div
                      key={opt.value}
                      className={`flex items-center gap-2 text-sm p-2 rounded border ${
                        active
                          ? 'border-primary bg-primary/5 opacity-100'
                          : 'border-border/60 opacity-50'
                      }`}
                    >
                      {active ? (
                        <span className="text-primary font-bold">✓</span>
                      ) : (
                        <span className="text-muted-foreground">○</span>
                      )}
                      {opt.label}
                    </div>
                  )
                })}
              </div>
            </div>
            {ew.notes && <p className="text-sm mt-3 text-muted-foreground">{ew.notes}</p>}
          </>
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={11} title="Conclusão">
        <SubSection title="Resumo Clínico">
          <div className="report-clinical-summary p-4">
            <RichText
              content={assessment.clinicalSummary}
              emptyMsg="Sem resumo clínico registrado."
            />
          </div>
        </SubSection>
        <SubSection title="Reavaliação">
          <p className="text-sm">
            {assessment.reassessmentMonths
              ? `Reavaliação recomendada em ${assessment.reassessmentMonths} meses.`
              : 'Sem prazo de reavaliação definido.'}
          </p>
        </SubSection>
        <InfoBox>
          Exames complementares (densitometria, ultrassonografia muscular, exames laboratoriais)
          podem ser solicitados para confirmação diagnóstica. Este relatório deve ser interpretado
          em conjunto com a avaliação clínica global do paciente.
        </InfoBox>
      </SectionBlock>
    </>
  )
}
