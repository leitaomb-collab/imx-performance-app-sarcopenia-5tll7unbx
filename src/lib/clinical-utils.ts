export type ClinicalStatus = 'normal' | 'reduced' | null

export function getALMIStatus(almi: number | undefined, gender: 'M' | 'F'): ClinicalStatus {
  if (almi == null) return null
  if (gender === 'M') return almi < 7.0 ? 'reduced' : 'normal'
  return almi < 6.0 ? 'reduced' : 'normal'
}

export function getPhaseAngleStatus(pa: number | undefined, gender: 'M' | 'F'): ClinicalStatus {
  if (pa == null) return null
  if (gender === 'M') return pa < 5.0 ? 'reduced' : 'normal'
  return pa < 4.6 ? 'reduced' : 'normal'
}

export function getCalfCircumferenceStatus(
  cc: number | undefined,
  gender: 'M' | 'F',
): ClinicalStatus {
  if (cc == null) return null
  if (gender === 'M') return cc < 34 ? 'reduced' : 'normal'
  return cc < 33 ? 'reduced' : 'normal'
}

export function getHandgripStatus(max: number | undefined, gender: 'M' | 'F'): ClinicalStatus {
  if (max == null) return null
  if (gender === 'M') return max < 27 ? 'reduced' : 'normal'
  return max < 16 ? 'reduced' : 'normal'
}

export function getChairStandStatus(time: number | undefined): ClinicalStatus {
  if (time == null) return null
  return time > 15 ? 'reduced' : 'normal'
}

export function getTUGStatus(time: number | undefined): ClinicalStatus {
  if (time == null) return null
  return time > 12 ? 'reduced' : 'normal'
}

export function getSPPBStatus(total: number | undefined): ClinicalStatus {
  if (total == null) return null
  return total < 10 ? 'reduced' : 'normal'
}

export function getSPPBTotal(
  b: number | undefined,
  g: number | undefined,
  c: number | undefined,
): number | undefined {
  if (b == null && g == null && c == null) return undefined
  return (b ?? 0) + (g ?? 0) + (c ?? 0)
}

export function calcPercent(
  actual: number | undefined,
  predicted: number | undefined,
): number | undefined {
  if (actual == null || predicted == null || predicted === 0) return undefined
  return Math.round((actual / predicted) * 100)
}

export function getSarcFTotal(vals: (number | undefined)[]): number | undefined {
  if (vals.every((v) => v == null)) return undefined
  return vals.reduce((sum, v) => sum + (v ?? 0), 0)
}

export function getSarcCalFTotal(
  sarcFTotal: number | undefined,
  calf: number | undefined,
  gender: 'M' | 'F',
): number | undefined {
  if (sarcFTotal == null) return undefined
  let adj = 0
  if (calf != null) {
    const cutoff = gender === 'M' ? 34 : 33
    if (calf < cutoff) adj = 1
  }
  return sarcFTotal + adj
}

export function getSarcopeniaRisk(score: number | undefined): 'baixo' | 'moderado' | 'alto' | null {
  if (score == null) return null
  if (score <= 3) return 'baixo'
  if (score <= 7) return 'moderado'
  return 'alto'
}

export function suggestEWGSOP2Diagnosis(
  handgripLow: boolean,
  almiLow: boolean,
  sppbLow: boolean,
): 'sem_sarcopenia' | 'sarcopenia' | 'sarcopenia_grave' {
  if (!handgripLow) return 'sem_sarcopenia'
  if (!almiLow) return 'sarcopenia'
  if (sppbLow) return 'sarcopenia_grave'
  return 'sarcopenia'
}
