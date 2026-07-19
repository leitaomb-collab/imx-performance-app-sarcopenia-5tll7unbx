import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/types'

export interface PatientListResult {
  items: Patient[]
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

export const getPatients = async (
  page: number = 1,
  perPage: number = 20,
  filter?: string,
): Promise<PatientListResult> => {
  const result = await pb.collection('patients').getList(page, perPage, {
    sort: '-created',
    ...(filter ? { filter } : {}),
  })
  return result as unknown as PatientListResult
}

export const getPatient = async (id: string): Promise<Patient> => {
  return pb.collection('patients').getOne(id) as Promise<Patient>
}

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
  const payload = { ...data, createdBy: pb.authStore.record?.id }
  return pb.collection('patients').create(payload) as Promise<Patient>
}

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
  return pb.collection('patients').update(id, data) as Promise<Patient>
}

export const deletePatient = async (id: string): Promise<boolean> => {
  return pb.collection('patients').delete(id)
}
