import { getPatients, getPatient, createPatient } from './patients'
import { getAssessments, getAssessment, createAssessment } from './assessments'
import { askAnalyst } from './ai'

export const getPacientes = getPatients
export const getPaciente = getPatient
export const createPaciente = createPatient
export const getAvaliacoes = getAssessments
export const getAvaliacao = getAssessment
export const createAvaliacao = createAssessment
export const askAgent = askAnalyst
