import type { Patient } from '@/types'

export interface VitalsData {
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  temperature?: number
}

export interface BodyCompositionData {
  leanMass?: number
  skeletalMuscleMass?: number
  fatMass?: number
  fatPercentage?: number
  appendicularMuscleMass?: number
  almi?: number
  phaseAngle?: number
  totalBodyWater?: number
  basalMetabolicRate?: number
}

export interface AnthropometryData {
  calfCircumference?: number
  waistCircumference?: number
  somatotype?: string
}

export interface PosturalAssessmentData {
  head?: string
  shoulders?: string
  spine?: string
  pelvis?: string
  knees?: string
  feet?: string
  photosAttached?: boolean
  observations?: string
}

export interface MuscleStrengthData {
  handgripLeft?: number
  handgripRight?: number
  handgripMax?: number
  handgripPercentile?: number
  chairStandTime?: number
}

export interface BalanceAssessmentData {
  tugSimple?: number
  tugDualTask?: number
  sppbBalance?: number
  sppbGait?: number
  sppbChair?: number
  sppbTotal?: number
  stabilometryEyesOpen?: string
  stabilometryEyesClosed?: string
}

export interface RespiratoryStrengthData {
  pimaxActual?: number
  pimaxPredicted?: number
  pimaxPercent?: number
  pemaxActual?: number
  pemaxPredicted?: number
  pemaxPercent?: number
}

export interface SpirometryData {
  fvc?: number
  fvcPredicted?: number
  fvcPercent?: number
  fev1?: number
  fev1Predicted?: number
  fev1Percent?: number
  fev1FvcRatio?: number
  fef2575?: number
  fef2575Predicted?: number
  fef2575Percent?: number
  peakExpiratoryFlow?: number
  peakExpiratoryFlowPredicted?: number
  peakExpiratoryFlowPercent?: number
  pattern?: 'normal' | 'obstrutivo' | 'restritivo' | 'misto'
}

export interface SarcopeniaScreeningData {
  strength?: number
  assistanceWalking?: number
  riseChair?: number
  climbStairs?: number
  falls?: number
  sarcFTotal?: number
  calfCircumference?: number
  sarcCalFTotal?: number
  risk?: 'baixo' | 'moderado' | 'alto'
}

export interface EWGSOP2AnalysisData {
  muscleMassLow?: boolean
  muscleStrengthLow?: boolean
  physicalPerformanceLow?: boolean
  diagnosis?: 'sem_sarcopenia' | 'sarcopenia' | 'sarcopenia_grave' | 'nao_avaliado'
  notes?: string
}

export interface AssessmentFormData {
  id?: string
  posturalPhotos?: string[]
  patientId: string
  assessmentDate: string
  status: 'rascunho' | 'concluida'
  finalDiagnosis: 'sem_sarcopenia' | 'sarcopenia' | 'sarcopenia_grave' | 'nao_avaliado'
  reassessmentMonths: number
  clinicalSummary: string
  vitals: VitalsData
  bodyComposition: BodyCompositionData
  anthropometry: AnthropometryData
  posturalAssessment: PosturalAssessmentData
  muscleStrength: MuscleStrengthData
  balanceAssessment: BalanceAssessmentData
  respiratoryStrength: RespiratoryStrengthData
  spirometry: SpirometryData
  sarcopeniaScreening: SarcopeniaScreeningData
  ewgsop2Analysis: EWGSOP2AnalysisData
}

export interface StepProps {
  form: AssessmentFormData
  patient: Patient | null
  updateField: <K extends keyof AssessmentFormData>(key: K, value: AssessmentFormData[K]) => void
  patients?: Patient[]
  selectPatient?: (id: string) => void
}

export const DIAGNOSIS_OPTIONS = [
  { value: 'sem_sarcopenia', label: 'Sem sarcopenia' },
  { value: 'sarcopenia', label: 'Sarcopenia provável' },
  { value: 'sarcopenia_grave', label: 'Sarcopenia grave' },
  { value: 'nao_avaliado', label: 'Não avaliado' },
] as const
