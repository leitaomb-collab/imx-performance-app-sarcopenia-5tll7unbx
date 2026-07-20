export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="report-skeleton-block h-24 w-full" />
      <div className="report-skeleton-block h-32 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="report-skeleton-block h-40 w-full" key={i} />
      ))}
    </div>
  )
}
