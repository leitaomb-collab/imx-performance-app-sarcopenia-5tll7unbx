import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getPacientes = async (): Promise<RecordModel[]> => {
  return pb.collection('pacientes').getFullList({ sort: '-created' })
}

export const getPaciente = async (id: string): Promise<RecordModel> => {
  return pb.collection('pacientes').getOne(id)
}

export const createPaciente = async (data: Partial<RecordModel>): Promise<RecordModel> => {
  return pb.collection('pacientes').create({ ...data, owner: pb.authStore.model?.id })
}

export const updatePaciente = async (
  id: string,
  data: Partial<RecordModel>,
): Promise<RecordModel> => {
  return pb.collection('pacientes').update(id, data)
}

export const deletePaciente = async (id: string): Promise<boolean> => {
  return pb.collection('pacientes').delete(id)
}
