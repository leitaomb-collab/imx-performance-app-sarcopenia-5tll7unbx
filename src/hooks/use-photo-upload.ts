import { useState, useCallback, useRef, useEffect } from 'react'
import type { DragEvent } from 'react'
import pb from '@/lib/pocketbase/client'
import { getPhotoUrl, MAX_PHOTOS, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/photo-utils'

export interface PhotoItem {
  id: string
  url: string
  name: string
  isExisting: boolean
  file?: File
}

interface UsePhotoUploadOptions {
  assessmentId?: string
  initialPhotos?: string[]
  maxPhotos?: number
  onPhotosChange?: (hasPhotos: boolean) => void
}

export function usePhotoUpload({
  assessmentId,
  initialPhotos = [],
  maxPhotos = MAX_PHOTOS,
  onPhotosChange,
}: UsePhotoUploadOptions) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    if (assessmentId && initialPhotos.length > 0) {
      setPhotos(
        initialPhotos.map((name) => ({
          id: name,
          url: getPhotoUrl(assessmentId, name),
          name,
          isExisting: true,
        })),
      )
    } else {
      setPhotos([])
    }
  }, [assessmentId, initialPhotos])

  useEffect(() => {
    onPhotosChange?.(photos.length > 0)
  }, [photos.length, onPhotosChange])

  const validateFiles = (files: File[]): { valid: File[]; errs: string[] } => {
    const valid: File[] = []
    const errs: string[] = []
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errs.push(`Formato não suportado: ${file.name}`)
      } else if (file.size > MAX_FILE_SIZE) {
        errs.push(`Arquivo muito grande: ${file.name}`)
      } else {
        valid.push(file)
      }
    }
    if (photos.length + valid.length > maxPhotos) {
      errs.push('Máximo de 6 fotografias atingido.')
      valid.splice(maxPhotos - photos.length)
    }
    return { valid, errs }
  }

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
      const { valid, errs } = validateFiles(files)
      setErrors(errs)
      if (valid.length === 0) return
      setIsUploading(true)
      try {
        if (assessmentId) {
          const existingNames = photos.filter((p) => p.isExisting).map((p) => p.name)
          const formData = new FormData()
          existingNames.forEach((name) => formData.append('posturalPhotos', name))
          valid.forEach((file) => formData.append('posturalPhotos', file))
          const updated = await pb.collection('assessments').update(assessmentId, formData)
          const newNames: string[] =
            ((updated as Record<string, unknown>).posturalPhotos as string[]) || []
          setPhotos(
            newNames.map((name) => ({
              id: name,
              url: getPhotoUrl(assessmentId, name),
              name,
              isExisting: true,
            })),
          )
        } else {
          const newItems: PhotoItem[] = valid.map((file) => ({
            id: `${Date.now()}-${Math.random()}-${file.name}`,
            url: URL.createObjectURL(file),
            name: file.name,
            isExisting: false,
            file,
          }))
          setPhotos((prev) => [...prev, ...newItems])
        }
      } catch {
        setErrors((prev) => [...prev, 'Erro ao enviar fotografias.'])
      }
      setIsUploading(false)
    },
    [assessmentId, photos, maxPhotos],
  )

  const removePhoto = useCallback(
    async (photoId: string) => {
      const photo = photos.find((p) => p.id === photoId)
      if (!photo) return
      if (assessmentId && photo.isExisting) {
        try {
          const remaining = photos
            .filter((p) => p.isExisting && p.id !== photoId)
            .map((p) => p.name)
          const formData = new FormData()
          remaining.forEach((name) => formData.append('posturalPhotos', name))
          await pb.collection('assessments').update(assessmentId, formData)
        } catch {
          setErrors((prev) => [...prev, 'Erro ao excluir fotografia.'])
          return
        }
      }
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    },
    [assessmentId, photos],
  )

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragging(false)
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearErrors = useCallback(() => setErrors([]), [])

  return {
    photos,
    isDragging,
    isUploading,
    errors,
    fileInputRef,
    handleFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInputClick,
    removePhoto,
    clearErrors,
  }
}
