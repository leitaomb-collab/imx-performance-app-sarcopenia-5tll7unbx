import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function PatientSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <Skeleton className="skeleton-shimmer h-5 w-2/3" />
          <Skeleton className="skeleton-shimmer h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="skeleton-shimmer h-4 w-24" />
        <Skeleton className="skeleton-shimmer h-4 w-full" />
        <Skeleton className="skeleton-shimmer h-4 w-3/4" />
        <div className="flex justify-between mt-2">
          <Skeleton className="skeleton-shimmer h-9 w-24" />
          <Skeleton className="skeleton-shimmer h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  )
}
