import { useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoLightboxProps {
  photos: { url: string; name: string }[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function PhotoLightbox({ photos, index, onClose, onNavigate }: PhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && index < photos.length - 1) onNavigate(index + 1)
      if (e.key === 'Tab') {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>('button, [tabindex]')
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [index, photos.length, onClose, onNavigate],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de fotografia postural"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-white/70 transition-colors"
          aria-label="Fechar visualização"
        >
          <X className="h-8 w-8" />
        </button>
        {index > 0 && (
          <button
            onClick={() => onNavigate(index - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-16 text-white hover:text-white/70 transition-colors"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
        )}
        <img
          src={photo.url}
          alt={photo.name}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded"
        />
        {index < photos.length - 1 && (
          <button
            onClick={() => onNavigate(index + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16 text-white hover:text-white/70 transition-colors"
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        )}
        <p className="text-center text-white/70 text-sm mt-3">
          {index + 1} / {photos.length}
        </p>
      </div>
    </div>
  )
}
