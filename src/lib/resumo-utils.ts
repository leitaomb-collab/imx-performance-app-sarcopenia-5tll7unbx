import {
  getEWGSOP2HandgripCutoff,
  getEWGSOP2ALMICutoff,
  getPhaseAngleCutoff,
  sortAssessmentsByDate,
  extractChartData,
} from '@/lib/chart-utils'

export type MetricStatus = 'normal' | 'attention' | 'critical'
export type TrendDir = 'up' | 'down' | 'stable'

export interface KpiMetric {
  name: string
  value: string
  reference: string
  status: MetricStatus
  trend: TrendDir | null
  trendPositive: boolean | null
}
export interface KpiCard {
  category: string
  indicatorColor: string
  metrics: KpiMetric[]
}
export interface ComparativeRow {
  variable: string
  value: string
  reference: string
  percentile: string
  status: MetricStatus
  evolution: number[]
  isFirst: boolean
}
export interface GlobalStatus {
  label: string
  className: string
  level: MetricStatus
}

type Data = Record<string, unknown>

export const CATEGORY_COLORS: Record<string, string> = {
  'Composição Corporal': 'bg-blue-500',
  'Força Muscular': 'bg-purple-500',
  'Função Respiratória': 'bg-cyan-500',
  Equilíbrio: 'bg-green-500',
  'Rastreamento de Sarcopenia': 'bg-orange-500',
  'Sinais Vitais': 'bg-red-500',
}

export const STATUS_CONFIG: Record<MetricStatus, { label: string; dot: string; text: string }> = {
  normal: { label: 'Normal', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
  attention: {
    label: 'Atenção',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  critical: { label: 'Crítico', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
}

function num(d: Data | null | undefined, ...path: string[]): number | undefined {
  if (!d) return undefined
  let cur: unknown = d
  for (const k of path) {
    if (cur && typeof cur === 'object' && !Array.isArray(cur))
      cur = (cur as Record<string, unknown>)[k]
    else return undefined
  }
  if (typeof cur === 'number') return cur
  if (typeof cur === 'string') {
    const n = parseFloat(cur)
    return isNaN(n) ? undefined : n
  }
  return undefined
}

function fmtV(v: number | undefined, unit?: string): string {
  if (v == null) return '-'
  return unit ? `${v} ${unit}` : String(v)
}

function trendDir(c: number | undefined, p: number | undefined): TrendDir | null {
  if (c == null || p == null) return null
  const d = c - p
  if (Math.abs(d) < 0.01) return 'stable'
  return d > 0 ? 'up' : 'down'
}

function trendPos(t: TrendDir | null, lowerBetter: boolean): boolean | null {
  if (t == null || t === 'stable') return null
  if (lowerBetter) return t === 'down'
  return t === 'up'
}

function sMin(v: number | undefined, cut: number): MetricStatus {
  if (v == null) return 'normal'
  if (v >= cut) return 'normal'
  if (v >= cut * 0.85) return 'attention'
  return 'critical'
}
function sMax(v: number | undefined, cut: number): MetricStatus {
  if (v == null) return 'normal'
  if (v <= cut) return 'normal'
  if (v <= cut * 1.25) return 'attention'
  return 'critical'
}
function sRange(v: number | undefined, min: number, max: number): MetricStatus {
  if (v == null) return 'normal'
  if (v >= min && v <= max) return 'normal'
  const tol = (max - min) * 0.15
  if (v >= min - tol && v <= max + tol) return 'attention'
  return 'critical'
}

function spark(all: Data[], path: string[]): number[] {
  const sorted = sortAssessmentsByDate(all as Array<{ assessmentDate: string }>)
  return extractChartData(sorted, (a) => num(a as Data, ...path)).map((d) => d.value)
}

function mkMetric(
  name: string,
  cur: Data,
  prev: Data | null,
  path: string[],
  ref: string,
  status: MetricStatus,
  lowerBetter: boolean,
  unit?: string,
): KpiMetric {
  const c = num(cur, ...path)
  const p = num(prev, ...path)
  return {
    name,
    value: fmtV(c, unit),
    reference: ref,
    status,
    trend: trendDir(c, p),
    trendPositive: trendPos(trendDir(c, p), lowerBetter),
  }
}

export function buildKpiCards(cur: Data, prev: Data | null, _all: Data[], g: 'M' | 'F'): KpiCard[] {
  const hg = getEWGSOP2HandgripCutoff(g)
  const almi = getEWGSOP2ALMICutoff(g)
  const pa = getPhaseAngleCutoff(g)
  const fMin = g === 'M' ? 10 : 18,
    fMax = g === 'M' ? 20 : 28
  const cards: KpiCard[] = [
    {
      category: 'Composição Corporal',
      indicatorColor: CATEGORY_COLORS['Composição Corporal'],
      metrics: [
        mkMetric(
          '% Gordura',
          cur,
          prev,
          ['bodyComposition', 'fatPercentage'],
          `${fMin}-${fMax}%`,
          sRange(num(cur, 'bodyComposition', 'fatPercentage'), fMin, fMax),
          true,
          '%',
        ),
        mkMetric(
          'ALMI',
          cur,
          prev,
          ['bodyComposition', 'almi'],
          `≥${almi}`,
          sMin(num(cur, 'bodyComposition', 'almi'), almi),
          false,
        ),
        mkMetric(
          'Âng. Fase',
          cur,
          prev,
          ['bodyComposition', 'phaseAngle'],
          `≥${pa}`,
          sMin(num(cur, 'bodyComposition', 'phaseAngle'), pa),
          false,
          '°',
        ),
        mkMetric(
          'Massa Musc. Ap.',
          cur,
          prev,
          ['bodyComposition', 'appendicularMuscleMass'],
          '-',
          'normal',
          false,
          'kg',
        ),
      ],
    },
    {
      category: 'Força Muscular',
      indicatorColor: CATEGORY_COLORS['Força Muscular'],
      metrics: [
        mkMetric(
          'Handgrip Máx',
          cur,
          prev,
          ['muscleStrength', 'handgripMax'],
          `≥${hg}kg`,
          sMin(num(cur, 'muscleStrength', 'handgripMax'), hg),
          false,
          'kg',
        ),
        mkMetric(
          'Sentar-Levantar',
          cur,
          prev,
          ['muscleStrength', 'chairStandTime'],
          '≤15s',
          sMax(num(cur, 'muscleStrength', 'chairStandTime'), 15),
          true,
          's',
        ),
        mkMetric(
          'Percentil HG',
          cur,
          prev,
          ['muscleStrength', 'handgripPercentile'],
          '≥50',
          sMin(num(cur, 'muscleStrength', 'handgripPercentile'), 50),
          false,
        ),
      ],
    },
    {
      category: 'Função Respiratória',
      indicatorColor: CATEGORY_COLORS['Função Respiratória'],
      metrics: [
        mkMetric(
          'PImax %',
          cur,
          prev,
          ['respiratoryStrength', 'pimaxPercent'],
          '≥80%',
          sMin(num(cur, 'respiratoryStrength', 'pimaxPercent'), 80),
          false,
          '%',
        ),
        mkMetric(
          'PEmax %',
          cur,
          prev,
          ['respiratoryStrength', 'pemaxPercent'],
          '≥80%',
          sMin(num(cur, 'respiratoryStrength', 'pemaxPercent'), 80),
          false,
          '%',
        ),
        mkMetric(
          'VEF1 %',
          cur,
          prev,
          ['spirometry', 'fev1Percent'],
          '≥80%',
          sMin(num(cur, 'spirometry', 'fev1Percent'), 80),
          false,
          '%',
        ),
        mkMetric(
          'CVF %',
          cur,
          prev,
          ['spirometry', 'fvcPercent'],
          '≥80%',
          sMin(num(cur, 'spirometry', 'fvcPercent'), 80),
          false,
          '%',
        ),
      ],
    },
    {
      category: 'Equilíbrio',
      indicatorColor: CATEGORY_COLORS['Equilíbrio'],
      metrics: [
        mkMetric(
          'TUG Simples',
          cur,
          prev,
          ['balanceAssessment', 'tugSimple'],
          '≤12s',
          sMax(num(cur, 'balanceAssessment', 'tugSimple'), 12),
          true,
          's',
        ),
        mkMetric(
          'SPPB Total',
          cur,
          prev,
          ['balanceAssessment', 'sppbTotal'],
          '≥10',
          sMin(num(cur, 'balanceAssessment', 'sppbTotal'), 10),
          false,
        ),
        mkMetric(
          'TUG Tarefa Dupla',
          cur,
          prev,
          ['balanceAssessment', 'tugDualTask'],
          '-',
          'normal',
          true,
          's',
        ),
      ],
    },
    {
      category: 'Rastreamento de Sarcopenia',
      indicatorColor: CATEGORY_COLORS['Rastreamento de Sarcopenia'],
      metrics: [
        mkMetric(
          'SARC-F',
          cur,
          prev,
          ['sarcopeniaScreening', 'sarcFTotal'],
          '<4',
          sMax(num(cur, 'sarcopeniaScreening', 'sarcFTotal'), 3),
          true,
        ),
        mkMetric(
          'SARC-CalF',
          cur,
          prev,
          ['sarcopeniaScreening', 'sarcCalFTotal'],
          '<11',
          sMax(num(cur, 'sarcopeniaScreening', 'sarcCalFTotal'), 10),
          true,
        ),
        mkMetric(
          'Circ. Panturrilha',
          cur,
          prev,
          ['anthropometry', 'calfCircumference'],
          '≥34cm',
          sMin(num(cur, 'anthropometry', 'calfCircumference'), 34),
          false,
          'cm',
        ),
      ],
    },
  ]
  const bpSys = num(cur, 'vitals', 'bloodPressureSystolic')
  const bpDia = num(cur, 'vitals', 'bloodPressureDiastolic')
  const hr = num(cur, 'vitals', 'heartRate')
  const spo2 = num(cur, 'vitals', 'oxygenSaturation')
  if (bpSys != null || bpDia != null || hr != null || spo2 != null) {
    const bpVal = bpSys != null && bpDia != null ? `${bpSys}/${bpDia}` : '-'
    const bpSt: MetricStatus =
      bpSys != null && bpDia != null
        ? bpSys >= 160 || bpDia >= 100
          ? 'critical'
          : bpSys >= 140 || bpDia >= 90
            ? 'attention'
            : 'normal'
        : 'normal'
    cards.push({
      category: 'Sinais Vitais',
      indicatorColor: CATEGORY_COLORS['Sinais Vitais'],
      metrics: [
        {
          name: 'PA',
          value: bpVal,
          reference: '<140/90',
          status: bpSt,
          trend: null,
          trendPositive: null,
        },
        mkMetric(
          'FC',
          cur,
          prev,
          ['vitals', 'heartRate'],
          '60-100',
          sRange(hr, 60, 100),
          false,
          'bpm',
        ),
        mkMetric(
          'SpO₂',
          cur,
          prev,
          ['vitals', 'oxygenSaturation'],
          '≥95%',
          sMin(spo2, 95),
          false,
          '%',
        ),
      ],
    })
  }
  return cards
}

export function buildComparativeRows(
  cur: Data,
  all: Data[],
  g: 'M' | 'F',
  hasMultiple: boolean,
): ComparativeRow[] {
  const hg = getEWGSOP2HandgripCutoff(g)
  const almi = getEWGSOP2ALMICutoff(g)
  const pa = getPhaseAngleCutoff(g)
  const fMin = g === 'M' ? 10 : 18,
    fMax = g === 'M' ? 20 : 28
  type Def = { v: string; p: string[]; r: string; s: MetricStatus; pct?: boolean }
  const defs: Def[] = [
    {
      v: '% Gordura',
      p: ['bodyComposition', 'fatPercentage'],
      r: `${fMin}-${fMax}%`,
      s: sRange(num(cur, 'bodyComposition', 'fatPercentage'), fMin, fMax),
    },
    {
      v: 'ALMI',
      p: ['bodyComposition', 'almi'],
      r: `≥${almi}`,
      s: sMin(num(cur, 'bodyComposition', 'almi'), almi),
    },
    {
      v: 'Âng. Fase',
      p: ['bodyComposition', 'phaseAngle'],
      r: `≥${pa}`,
      s: sMin(num(cur, 'bodyComposition', 'phaseAngle'), pa),
    },
    {
      v: 'Handgrip Máx',
      p: ['muscleStrength', 'handgripMax'],
      r: `≥${hg}kg`,
      s: sMin(num(cur, 'muscleStrength', 'handgripMax'), hg),
    },
    {
      v: 'Percentil HG',
      p: ['muscleStrength', 'handgripPercentile'],
      r: '≥50',
      s: sMin(num(cur, 'muscleStrength', 'handgripPercentile'), 50),
      pct: true,
    },
    {
      v: 'Sentar-Levantar',
      p: ['muscleStrength', 'chairStandTime'],
      r: '≤15s',
      s: sMax(num(cur, 'muscleStrength', 'chairStandTime'), 15),
    },
    {
      v: 'TUG Simples',
      p: ['balanceAssessment', 'tugSimple'],
      r: '≤12s',
      s: sMax(num(cur, 'balanceAssessment', 'tugSimple'), 12),
    },
    {
      v: 'SPPB Total',
      p: ['balanceAssessment', 'sppbTotal'],
      r: '≥10',
      s: sMin(num(cur, 'balanceAssessment', 'sppbTotal'), 10),
    },
    {
      v: 'PImax %',
      p: ['respiratoryStrength', 'pimaxPercent'],
      r: '≥80%',
      s: sMin(num(cur, 'respiratoryStrength', 'pimaxPercent'), 80),
    },
    {
      v: 'PEmax %',
      p: ['respiratoryStrength', 'pemaxPercent'],
      r: '≥80%',
      s: sMin(num(cur, 'respiratoryStrength', 'pemaxPercent'), 80),
    },
    {
      v: 'VEF1 %',
      p: ['spirometry', 'fev1Percent'],
      r: '≥80%',
      s: sMin(num(cur, 'spirometry', 'fev1Percent'), 80),
    },
    {
      v: 'CVF %',
      p: ['spirometry', 'fvcPercent'],
      r: '≥80%',
      s: sMin(num(cur, 'spirometry', 'fvcPercent'), 80),
    },
    {
      v: 'SARC-F',
      p: ['sarcopeniaScreening', 'sarcFTotal'],
      r: '<4',
      s: sMax(num(cur, 'sarcopeniaScreening', 'sarcFTotal'), 3),
    },
    {
      v: 'SARC-CalF',
      p: ['sarcopeniaScreening', 'sarcCalFTotal'],
      r: '<11',
      s: sMax(num(cur, 'sarcopeniaScreening', 'sarcCalFTotal'), 10),
    },
    {
      v: 'Circ. Panturrilha',
      p: ['anthropometry', 'calfCircumference'],
      r: '≥34cm',
      s: sMin(num(cur, 'anthropometry', 'calfCircumference'), 34),
    },
  ]
  return defs.map((d) => {
    const c = num(cur, ...d.p)
    return {
      variable: d.v,
      value: fmtV(c),
      reference: d.r,
      percentile: d.pct && c != null ? `${c}º` : 'N/A',
      status: d.s,
      evolution: hasMultiple ? spark(all, d.p) : [],
      isFirst: !hasMultiple,
    }
  })
}

export function computeGlobalStatus(cards: KpiCard[]): GlobalStatus {
  let hasCritical = false
  let hasAttention = false
  for (const card of cards) {
    for (const m of card.metrics) {
      if (m.status === 'critical') hasCritical = true
      else if (m.status === 'attention') hasAttention = true
    }
  }
  if (hasCritical)
    return {
      label: 'Alterações críticas',
      className: 'bg-red-500/10 text-red-700 dark:text-red-400',
      level: 'critical',
    }
  if (hasAttention)
    return {
      label: 'Pontos de atenção',
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      level: 'attention',
    }
  return {
    label: 'Dentro da normalidade',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400',
    level: 'normal',
  }
}
