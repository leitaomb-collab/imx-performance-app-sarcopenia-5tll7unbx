// Normative data based on international handgrip strength norms from a systematic review
// of 2.4 million adults aged 20-100+ from 69 countries (ScienceDirect, 2024).
// Cutoff values (27 kg men, 16 kg women) from EWGSOP2 consensus.

type Sex = 'M' | 'F'

const PERCENTILES = [5, 10, 25, 50, 75, 90, 95] as const

const MEN_NORMS: Record<string, number[]> = {
  '20-29': [35, 38, 43, 49, 55, 60, 63],
  '30-39': [35, 38, 43, 49, 55, 60, 63],
  '40-49': [33, 36, 41, 47, 53, 58, 61],
  '50-59': [30, 33, 38, 43, 49, 54, 57],
  '60-69': [27, 30, 34, 39, 44, 50, 53],
  '70-79': [24, 27, 31, 35, 40, 45, 48],
  '80+': [19, 22, 26, 30, 35, 40, 43],
}

const WOMEN_NORMS: Record<string, number[]> = {
  '20-29': [21, 23, 26, 30, 34, 38, 41],
  '30-39': [21, 23, 26, 30, 34, 38, 41],
  '40-49': [20, 22, 25, 29, 33, 37, 40],
  '50-59': [18, 20, 23, 27, 31, 35, 38],
  '60-69': [16, 18, 21, 25, 29, 33, 36],
  '70-79': [14, 16, 19, 22, 26, 30, 33],
  '80+': [11, 13, 16, 19, 23, 27, 30],
}

function getAgeGroup(age: number): string | null {
  if (age < 20) return null
  if (age <= 29) return '20-29'
  if (age <= 39) return '30-39'
  if (age <= 49) return '40-49'
  if (age <= 59) return '50-59'
  if (age <= 69) return '60-69'
  if (age <= 79) return '70-79'
  return '80+'
}

export interface HandgripResult {
  percentile: number | null
  interpretation: 'normal' | 'baixa' | null
}

export function getHandgripPercentile(sex: Sex, age: number, value: number): HandgripResult {
  if (value == null || isNaN(value) || value < 0 || age < 20) {
    return { percentile: null, interpretation: null }
  }

  const ageGroup = getAgeGroup(age)
  if (!ageGroup) {
    return { percentile: null, interpretation: null }
  }

  const norms = sex === 'M' ? MEN_NORMS : WOMEN_NORMS
  const thresholds = norms[ageGroup]
  if (!thresholds) {
    return { percentile: null, interpretation: null }
  }

  let percentile = 5
  for (let i = 0; i < PERCENTILES.length; i++) {
    if (value >= thresholds[i]) {
      percentile = PERCENTILES[i]
    } else {
      break
    }
  }

  const cutoff = sex === 'M' ? 27 : 16
  const interpretation: 'normal' | 'baixa' = value > cutoff ? 'normal' : 'baixa'

  return { percentile, interpretation }
}
