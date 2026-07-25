export const INPUT_MODES = {
  numeric: 'numeric',
  decimal: 'decimal',
  text: 'text',
  email: 'email',
  tel: 'tel',
  none: 'none',
  search: 'search',
} as const

export type InputMode = (typeof INPUT_MODES)[keyof typeof INPUT_MODES]

export function numericInputMode(allowDecimal: boolean = false): InputMode {
  return allowDecimal ? INPUT_MODES.decimal : INPUT_MODES.numeric
}

export function getInputModeForField(field: string): InputMode {
  const decimalFields = [
    'weight',
    'height',
    'fatPercentage',
    'muscleMass',
    'boneMass',
    'totalBodyWater',
    'basalMetabolicRate',
    'armCircumference',
    'calfCircumference',
    'waistCircumference',
    'hipCircumference',
    'tricepsSkinfold',
    'temperature',
    'oxygenSaturation',
    'fatMass',
    'leanMass',
    'skeletalMuscleMass',
    'appendicularMuscleMass',
    'almi',
    'phaseAngle',
    'handgripPercentile',
    'fev1FvcRatio',
    'pimaxPercent',
    'pemaxPercent',
  ]
  if (decimalFields.includes(field)) return INPUT_MODES.decimal
  return INPUT_MODES.numeric
}
