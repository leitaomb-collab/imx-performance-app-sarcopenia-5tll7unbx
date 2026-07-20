import type { Patient } from '@/types'
import {
  type SummaryRow,
  type SummaryCard,
  type TrendDirection,
  getTrendDirection,
  formatDelta,
  getNested,
  fmtNum,
} from '@/lib/summary-utils'
import {
  getEWGSOP2HandgripCutoff,
  getEWGSOP2ALMICutoff,
  getPhaseAngleCutoff,
  sortAssessmentsByDate,
  extractChartData,
} from '@/lib/chart-utils'
import { calculateIMC } from '@/lib/patient-utils'

const normal = { label: 'Normal', dotClass: 'bg-green-500' }
const altered = { label: 'Alterado', dotClass: 'bg-red-500' }

function checkRange(v: number, min: number, max: number) {
  return v >= min && v <= max ? normal : altered
}
function checkMin(v: number, min: number) {
  return v >= min ? normal : altered
}
function checkMax(v: number, max: number) {
  return v <= max ? normal : altered
}

function numVal(a: Record<string, any> | null, path: string[]): number | null {
  if (!a) return null
  const v = getNested(a, ...path)
  const n = typeof v === 'string' ? parseFloat(v) : v
  return typeof n === 'number' && !isNaN(n) ? n : null
}

function sparkVals(all: Record<string, any>[], path: string[]): number[] {
  return extractChartData(
    all as Array<{ assessmentDate: string }>,
    (a) => numVal(a as Record<string, any>, path) ?? undefined,
  ).map((d) => d.value)
}

type StatusResult = { label: string; dotClass: string } | null
type StatusFn = ((v: number) => { label: string; dotClass: string }) | null

function makeRow(
  label: string,
  currentVal: number | string | null,
  prevVal: number | string | null,
  sparkV: number[],
  ref: string,
  mode: 'higher-better' | 'lower-better' | null,
  unit: string | undefined,
  statusResult: StatusResult,
  nonNumeric = false,
): SummaryRow {
  if (nonNumeric) {
    return {
      label,
      current: currentVal != null ? String(currentVal) : '-',
      previous: prevVal != null ? String(prevVal) : '-',
      delta: null,
      ref,
      status: null,
      sparkline: { values: [], direction: null },
    }
  }
  const cNum = typeof currentVal === 'string' ? parseFloat(currentVal) : currentVal
  const pNum = typeof prevVal === 'string' ? parseFloat(prevVal) : prevVal
  const direction = mode ? getTrendDirection(cNum ?? undefined, pNum ?? undefined, mode) : null
  const delta = mode ? formatDelta(cNum ?? undefined, pNum ?? undefined, mode) : null
  return {
    label,
    current: fmtNum(cNum, unit),
    previous: fmtNum(pNum, unit),
    delta,
    ref,
    status: statusResult,
    sparkline: { values: sparkV, direction },
  }
}

export function buildSummaryCards(
  current: Record<string, any>,
  prev: Record<string, any> | null,
  all: Record<string, any>[],
  patient: Patient,
): SummaryCard[] {
  const sortedAll = sortAssessmentsByDate(all as Array<{ assessmentDate: string }>) as Record<
    string,
    any
  >[]
  const g = patient.gender
  const hgCutoff = getEWGSOP2HandgripCutoff(g)
  const almiCutoff = getEWGSOP2ALMICutoff(g)
  const paCutoff = getPhaseAngleCutoff(g)
  const waistMax = g === 'M' ? 94 : 80

  const r = (
    label: string,
    path: string[],
    ref: string,
    mode: 'higher-better' | 'lower-better' | null,
    unit: string | undefined,
    statusFn: StatusFn,
  ): SummaryRow => {
    const cVal = numVal(current, path)
    return makeRow(
      label,
      cVal,
      numVal(prev, path),
      sparkVals(sortedAll, path),
      ref,
      mode,
      unit,
      statusFn && cVal != null ? statusFn(cVal) : null,
    )
  }

  const bpSys = numVal(current, ['vitals', 'bloodPressureSystolic'])
  const bpDia = numVal(current, ['vitals', 'bloodPressureDiastolic'])
  const bpCur = bpSys != null && bpDia != null ? `${bpSys}/${bpDia}` : null
  const bpPSys = numVal(prev, ['vitals', 'bloodPressureSystolic'])
  const bpPDia = numVal(prev, ['vitals', 'bloodPressureDiastolic'])
  const bpPrev = bpPSys != null && bpPDia != null ? `${bpPSys}/${bpPDia}` : null
  const bpStatus =
    bpSys != null && bpDia != null ? (bpSys >= 140 || bpDia >= 90 ? altered : normal) : null

  const tugS = numVal(current, ['balanceAssessment', 'tugSimple'])
  const tugD = numVal(current, ['balanceAssessment', 'tugDualTask'])
  const tugDC = tugS != null && tugD != null ? Math.round((tugD - tugS) * 10) / 10 : null
  const tugSP = numVal(prev, ['balanceAssessment', 'tugSimple'])
  const tugDP = numVal(prev, ['balanceAssessment', 'tugDualTask'])
  const tugDPrev = tugSP != null && tugDP != null ? Math.round((tugDP - tugSP) * 10) / 10 : null

  const heightM = (patient.height ?? 0) > 3 ? (patient.height ?? 0) / 100 : (patient.height ?? 0)
  const imc = calculateIMC(patient.weight ?? 0, heightM) || null
  const imcStatus = imc != null && imc > 0 ? (imc >= 18.5 && imc <= 24.9 ? normal : altered) : null

  return [
    {
      title: 'Sinais Vitais',
      rows: [
        makeRow(
          'PA (mmHg)',
          bpCur,
          bpPrev,
          sparkVals(sortedAll, ['vitals', 'bloodPressureSystolic']),
          '<140/90',
          null,
          null,
          bpStatus,
        ),
        r('FC (bpm)', ['vitals', 'heartRate'], '60-100', null, '', (v) => checkRange(v, 60, 100)),
        r('FR (irpm)', ['vitals', 'respiratoryRate'], '12-20', null, '', (v) =>
          checkRange(v, 12, 20),
        ),
        r('SpO₂ (%)', ['vitals', 'oxygenSaturation'], '≥95', null, '%', (v) => checkMin(v, 95)),
        r('Temp (°C)', ['vitals', 'temperature'], '36-37.5', null, '°C', (v) =>
          checkRange(v, 36, 37.5),
        ),
      ],
    },
    {
      title: 'Composição Corporal',
      rows: [
        r(
          '% Gordura',
          ['bodyComposition', 'fatPercentage'],
          g === 'M' ? '10-20' : '18-28',
          'lower-better',
          '%',
          null,
        ),
        r('ALMI (kg/m²)', ['bodyComposition', 'almi'], `≥${almiCutoff}`, 'higher-better', '', (v) =>
          checkMin(v, almiCutoff),
        ),
        r(
          'Âng. Fase (°)',
          ['bodyComposition', 'phaseAngle'],
          `≥${paCutoff}`,
          'higher-better',
          '°',
          (v) => checkMin(v, paCutoff),
        ),
        r(
          'Massa Musc. Ap. (kg)',
          ['bodyComposition', 'appendicularMuscleMass'],
          '-',
          'higher-better',
          'kg',
          null,
        ),
      ],
    },
    {
      title: 'Antropometria',
      rows: [
        r(
          'Circ. Panturrilha (cm)',
          ['anthropometry', 'calfCircumference'],
          '≥34',
          'higher-better',
          'cm',
          (v) => checkMin(v, 34),
        ),
        r(
          'Circ. Cintura (cm)',
          ['anthropometry', 'waistCircumference'],
          `<${waistMax}`,
          'lower-better',
          'cm',
          (v) => checkMax(v, waistMax),
        ),
        makeRow('IMC (kg/m²)', imc, null, [], '18.5-24.9', null, '', imcStatus),
      ],
    },
    {
      title: 'Força Muscular',
      rows: [
        r(
          'Handgrip Max (kg)',
          ['muscleStrength', 'handgripMax'],
          `≥${hgCutoff}`,
          'higher-better',
          'kg',
          (v) => checkMin(v, hgCutoff),
        ),
        r(
          'Sentar-Levantar (s)',
          ['muscleStrength', 'chairStandTime'],
          '≤15',
          'lower-better',
          's',
          (v) => checkMax(v, 15),
        ),
        r(
          'Percentil Handgrip',
          ['muscleStrength', 'handgripPercentile'],
          '≥50',
          'higher-better',
          '',
          (v) => checkMin(v, 50),
        ),
      ],
    },
    {
      title: 'Equilíbrio e Risco de Quedas',
      rows: [
        r('TUG Simples (s)', ['balanceAssessment', 'tugSimple'], '≤12', 'lower-better', 's', (v) =>
          checkMax(v, 12),
        ),
        r('SPPB Total', ['balanceAssessment', 'sppbTotal'], '≥10', 'higher-better', '', (v) =>
          checkMin(v, 10),
        ),
        makeRow('TUG Tarefa Dupla (s)', tugDC, tugDPrev, [], '-', 'lower-better', 's', null),
      ],
    },
    {
      title: 'Função Respiratória',
      rows: [
        r('PImax %', ['respiratoryStrength', 'pimaxPercent'], '≥80', 'higher-better', '%', (v) =>
          checkMin(v, 80),
        ),
        r('PEmax %', ['respiratoryStrength', 'pemaxPercent'], '≥80', 'higher-better', '%', (v) =>
          checkMin(v, 80),
        ),
        r('VEF1 %', ['spirometry', 'fev1Percent'], '≥80', 'higher-better', '%', (v) =>
          checkMin(v, 80),
        ),
        r('CVF %', ['spirometry', 'fvcPercent'], '≥80', 'higher-better', '%', (v) =>
          checkMin(v, 80),
        ),
      ],
    },
    {
      title: 'Triagem e Diagnóstico',
      rows: [
        r('SARC-F', ['sarcopeniaScreening', 'sarcFTotal'], '<4', 'lower-better', '', (v) =>
          checkMax(v, 3),
        ),
        r('SARC-CalF', ['sarcopeniaScreening', 'sarcCalFTotal'], '<11', 'lower-better', '', (v) =>
          checkMax(v, 10),
        ),
        makeRow(
          'Padrão Espirométrico',
          getNested(current, 'spirometry', 'pattern') || null,
          getNested(prev, 'spirometry', 'pattern') || null,
          [],
          '-',
          null,
          null,
          null,
          true,
        ),
      ],
    },
  ]
}
