import pb from '@/lib/pocketbase/client'
import type { Assessment } from '@/types'

export const getAssessments = async (patientId?: string): Promise<Assessment[]> => {
  const options: Record<string, string> = { sort: '-assessmentDate', expand: 'patientId' }
  if (patientId) {
    options.filter = `patientId = "${patientId}"`
  }
  return pb.collection('assessments').getFullList(options) as Promise<Assessment[]>
}

export const getAssessment = async (id: string): Promise<Assessment> => {
  return pb.collection('assessments').getOne(id, { expand: 'patientId' }) as Promise<Assessment>
}

export const createAssessment = async (data: Record<string, unknown>): Promise<Assessment> => {
  const payload = { ...data, evaluatorId: pb.authStore.record?.id }
  return pb.collection('assessments').create(payload) as Promise<Assessment>
}

export const updateAssessment = async (
  id: string,
  data: Record<string, unknown>,
): Promise<Assessment> => {
  return pb.collection('assessments').update(id, data) as Promise<Assessment>
}

export const deleteAssessment = async (id: string): Promise<boolean> => {
  return pb.collection('assessments').delete(id)
}
