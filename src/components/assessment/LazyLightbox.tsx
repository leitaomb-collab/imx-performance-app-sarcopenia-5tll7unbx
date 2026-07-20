import { lazy, Suspense } from 'react'

const PhotoLightbox = lazy(() =>
  import('@/components/assessment/PhotoLightbox').then((m) => ({ default: m.PhotoLightbox })),
)

interface LazyLightboxProps {
  photos: { url: string; name: string }[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function LazyLightbox(props: LazyLightboxProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      }
    >
      <PhotoLightbox {...props} />
    </Suspense>
  )
}
