import { Skeleton } from '@/components/ui/skeleton'

export function SummarySkeleton() {
  return (
    <div className="max-w-4xl mx-auto" style={{ maxWidth: '52rem' }}>
      <div className="h-14 mb-4" />
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 md:p-8 space-y-4 animate-pulse">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-center gap-2 flex-wrap">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-2">
              <Skeleton className="h-3 w-32" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
