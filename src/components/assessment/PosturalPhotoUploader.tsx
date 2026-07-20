import { useState } from 'react'
import { Camera, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { usePhotoUpload } from '@/hooks/use-photo-upload'
import { PhotoLightbox } from '@/components/assessment/PhotoLightbox'
import { toast } from 'sonner'

interface PosturalPhotoUploaderProps {
  assessmentId?: string
  initialPhotos?: string[]
  onPhotosChange?: (hasPhotos: boolean) => void
}

export function PosturalPhotoUploader({
  assessmentId,
  initialPhotos = [],
  onPhotosChange,
}: PosturalPhotoUploaderProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const {
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
  } = usePhotoUpload({ assessmentId, initialPhotos, onPhotosChange })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removePhoto(deleteTarget)
      toast.success('Fotografia excluída.')
    } catch {
      toast.error('Erro ao excluir fotografia.')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload de fotografias posturais"
        onClick={handleFileInputClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleFileInputClick()
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200',
          isDragging ? 'border-primary bg-primary/5' : 'border-secondary/30 hover:border-primary',
        )}
      >
        <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-semibold text-sm">Fotografias Posturais</p>
        <p className="text-xs text-muted-foreground mt-1">
          Anexe até 6 fotografias (formatos JPG, PNG ou WebP. Máximo 10 MB por arquivo).
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Arraste as fotos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">JPG, PNG ou WebP até 10MB cada</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {errors.length > 0 && (
        <div
          aria-live="polite"
          className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3"
        >
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-destructive">
              {err}
            </p>
          ))}
          <Button variant="outline" size="sm" className="mt-2" onClick={clearErrors}>
            Tentar novamente
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!isUploading && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  onClick={() => setDeleteTarget(photo.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos.map((p) => ({ url: p.url, name: p.name }))}
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
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
