export const MAX_PHOTOS = 6
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES: string[] = ['image/jpeg', 'image/png', 'image/webp']

export function getPhotoUrl(assessmentId: string, filename: string): string {
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/assessments/${assessmentId}/${filename}`
}

export function getPhotoUrls(
  assessmentId: string,
  filenames: string[],
): { url: string; name: string }[] {
  return filenames.map((name) => ({ url: getPhotoUrl(assessmentId, name), name }))
}
