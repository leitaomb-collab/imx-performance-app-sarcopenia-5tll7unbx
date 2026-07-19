export interface User {
  id: string
  name: string
  email: string
  role: 'medico' | 'avaliador'
  created: string
  updated: string
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  gender: 'M' | 'F'
  weight?: number
  height?: number
  chronicMedications?: string
  notes?: string
  createdBy: string
  created: string
  updated: string
}

export interface Vitals {
  heartRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  temperature?: number
}

export interface BodyComposition {
  fatPercentage?: number
  muscleMass?: number
  boneMass?: number
  totalBodyWater?: number
  basalMetabolicRate?: number
}

export interface Anthropometry {
  weight?: number
  height?: number
  armCircumference?: number
  calfCircumference?: number
  waistCircumference?: number
  hipCircumference?: number
  tricepsSkinfold?: number
}

export interface PosturalAssessment {
  anteriorView?: string
  posteriorView?: string
  lateralView?: string
  observations?: string
}

export interface MuscleStrength {
  handgripRight?: number
  handgripLeft?: number
  peakForce?: number
  averageForce?: number
  fatigueIndex?: number
}

export interface BalanceAssessment {
  eyesOpenStability?: number
  eyesClosedStability?: number
  tandemStanceTime?: number
  singleLegStanceTime?: number
  fallRiskScore?: number
}

export interface RespiratoryStrength {
  peakInspiratoryFlow?: number
  peakExpiratoryFlow?: number
  maximalInspiratoryPressure?: number
  maximalExpiratoryPressure?: number
}

export interface Spirometry {
  fvc?: number
  fev1?: number
  fev1FvcRatio?: number
  peakExpiratoryFlow?: number
}

export interface SarcopeniaScreening {
  strength?: number
  assistanceWalking?: number
  riseChair?: number
  climbStairs?: number
  falls?: number
  totalScore?: number
  risk?: 'baixo' | 'moderado' | 'alto'
}

export interface EWGSOP2Analysis {
  muscleMassLow?: boolean
  muscleStrengthLow?: boolean
  physicalPerformanceLow?: boolean
  diagnosis?: 'sem_sarcopenia' | 'sarcopenia' | 'sarcopenia_grave'
  notes?: string
}

export interface Assessment {
  id: string
  patientId: string
  evaluatorId: string
  assessmentDate: string
  status: 'rascunho' | 'concluida'
  finalDiagnosis: 'sem_sarcopenia' | 'sarcopenia' | 'sarcopenia_grave' | 'nao_avaliado'
  reassessmentMonths: number
  clinicalSummary: string
  vitals: Vitals
  bodyComposition: BodyComposition
  anthropometry: Anthropometry
  posturalAssessment: PosturalAssessment
  muscleStrength: MuscleStrength
  balanceAssessment: BalanceAssessment
  respiratoryStrength: RespiratoryStrength
  spirometry: Spirometry
  sarcopeniaScreening: SarcopeniaScreening
  ewgsop2Analysis: EWGSOP2Analysis
  created: string
  updated: string
  expand?: { patientId?: Patient }
}

export const DIAGNOSIS_LABELS: Record<string, string> = {
  sem_sarcopenia: 'Sem Sarcopenia',
  sarcopenia: 'Sarcopenia',
  sarcopenia_grave: 'Sarcopenia Grave',
  nao_avaliado: 'Não Avaliado',
}

export const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  concluida: 'Concluída',
}
