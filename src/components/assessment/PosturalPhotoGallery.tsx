import { useState, useCallback } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { LazyLightbox } from '@/components/assessment/LazyLightbox'
import { LazyImage } from '@/components/ui/lazy-image'
import { getPhotoUrl } from '@/lib/photo-utils'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

interface PosturalPhotoGalleryProps {
  assessmentId: string
  photos: string[]
  isReadOnly: boolean
  onPhotoDeleted?: (remaining: string[]) => void
}

export function PosturalPhotoGallery({
  assessmentId,
  photos,
  isReadOnly,
  onPhotoDeleted,
}: PosturalPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const remaining = photos.filter((p) => p !== deleteTarget)
      const formData = new FormData()
      remaining.forEach((name) => formData.append('posturalPhotos', name))
      await pb.collection('assessments').update(assessmentId, formData)
      onPhotoDeleted?.(remaining)
      toast.success('Fotografia excluída.')
    } catch {
      toast.error('Erro ao excluir fotografia.')
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget, photos, assessmentId, onPhotoDeleted])

  if (!photos || photos.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Sem fotografias registradas.</p>
  }

  const photoUrls = photos.map((name) => ({ url: getPhotoUrl(assessmentId, name), name }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {photoUrls.map((photo, index) => (
          <div key={photo.name} className="relative group rounded-lg overflow-hidden border">
            <LazyImage
              src={photo.url}
              alt={photo.name}
              height={128}
              className="w-full h-32"
              imgClassName="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={() => setLightboxIndex(index)}
              >
                <Eye className="h-5 w-5" />
              </Button>
              {!isReadOnly && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  onClick={() => setDeleteTarget(photo.name)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <LazyLightbox
          photos={photoUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Foto</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir esta fotografia?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
