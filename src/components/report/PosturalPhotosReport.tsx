import { getPhotoUrl } from '@/lib/photo-utils'
import { cn } from '@/lib/utils'

interface PosturalPhotosReportProps {
  assessmentId: string
  photos: string[]
}

export function PosturalPhotosReport({ assessmentId, photos }: PosturalPhotosReportProps) {
  if (!photos || photos.length === 0) return null

  return (
    <div className="mt-4 print:break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
      <p className="text-sm font-semibold mb-2">Fotografias Posturais</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
        {photos.map((name, index) => {
          const isOddLast = photos.length % 2 === 1 && index === photos.length - 1
          return (
            <div
              key={name}
              className={cn(
                'border rounded p-1',
                isOddLast &&
                  'sm:col-span-2 sm:flex sm:justify-center print:col-span-2 print:flex print:justify-center',
              )}
            >
              <img
                src={getPhotoUrl(assessmentId, name)}
                alt={`Foto postural ${index + 1}`}
                className="rounded object-cover h-24 w-full print:h-[3cm] print:w-[4cm]"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
