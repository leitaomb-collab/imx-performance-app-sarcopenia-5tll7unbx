// Normative data based on international handgrip strength norms from a systematic review
// of 2.4 million adults aged 20-100+ from 69 countries (ScienceDirect, 2024).
// Cutoff values (27 kg men, 16 kg women) from EWGSOP2 consensus (Cruz-Jentoft et al., 2019).

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

const AGE_GROUP_LABELS: Record<string, string> = {
  '20-29': '20 a 29 anos',
  '30-39': '30 a 39 anos',
  '40-49': '40 a 49 anos',
  '50-59': '50 a 59 anos',
  '60-69': '60 a 69 anos',
  '70-79': '70 a 79 anos',
  '80+': '80 anos ou mais',
}

function getAgeGroupKey(age: number): string | null {
  if (age < 20) return null
  if (age <= 29) return '20-29'
  if (age <= 39) return '30-39'
  if (age <= 49) return '40-49'
  if (age <= 59) return '50-59'
  if (age <= 69) return '60-69'
  if (age <= 79) return '70-79'
  return '80+'
}

export interface HandgripNorms {
  p5Value: number | null
  ageGroup: string | null
}

export function getHandgripNorms(sex: Sex, age: number): HandgripNorms {
  const ageGroupKey = getAgeGroupKey(age)
  if (!ageGroupKey) return { p5Value: null, ageGroup: null }
  const norms = sex === 'M' ? MEN_NORMS : WOMEN_NORMS
  const thresholds = norms[ageGroupKey]
  if (!thresholds) return { p5Value: null, ageGroup: null }
  return { p5Value: thresholds[0], ageGroup: AGE_GROUP_LABELS[ageGroupKey] }
}

export interface HandgripResult {
  percentile: number | null
  p5Value: number | null
  interpretation: 'Normal' | 'Força Reduzida' | null
  ewgsop2Status: string | null
  ageGroup: string | null
}

export function getHandgripPercentile(
  sex: Sex,
  age: number,
  value: number | null | undefined,
): HandgripResult {
  if (value == null || isNaN(value) || value < 0) {
    return {
      percentile: null,
      p5Value: null,
      interpretation: null,
      ewgsop2Status: null,
      ageGroup: null,
    }
  }

  const cutoff = sex === 'M' ? 27 : 16
  const ewgsop2Status =
    value > cutoff ? 'Sem indicativo de sarcopenia' : 'Sugestivo de baixa força (EWGSOP2)'

  const ageGroupKey = getAgeGroupKey(age)
  if (!ageGroupKey) {
    return {
      percentile: null,
      p5Value: null,
      interpretation: null,
      ewgsop2Status,
      ageGroup: null,
    }
  }

  const norms = sex === 'M' ? MEN_NORMS : WOMEN_NORMS
  const thresholds = norms[ageGroupKey]
  if (!thresholds) {
    return {
      percentile: null,
      p5Value: null,
      interpretation: null,
      ewgsop2Status,
      ageGroup: null,
    }
  }

  const p5Value = thresholds[0]

  let percentile = 5
  for (let i = 0; i < PERCENTILES.length; i++) {
    if (value >= thresholds[i]) {
      percentile = PERCENTILES[i]
    } else {
      break
    }
  }

  const interpretation: 'Normal' | 'Força Reduzida' = value >= p5Value ? 'Normal' : 'Força Reduzida'

  return {
    percentile,
    p5Value,
    interpretation,
    ewgsop2Status,
    ageGroup: AGE_GROUP_LABELS[ageGroupKey],
  }
}
