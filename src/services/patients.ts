import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/types'

export const getPatients = async (): Promise<Patient[]> => {
  return pb.collection('patients').getFullList({ sort: '-created' }) as Promise<Patient[]>
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
