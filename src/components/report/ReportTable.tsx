import { useState, useRef, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ReportRow {
  label: string
  value?: string | null
  ref?: string
  interp?: string
  interpClass?: 'normal' | 'altered' | 'reduced' | 'blue' | 'moderate'
}

function Dash() {
  return <span className="text-muted-foreground">-</span>
}

export function ReportTable({
  headers = ['Parâmetro', 'Atual', 'Referência', 'Interpretação'],
  rows,
  footnote,
}: {
  headers?: string[]
  rows: ReportRow[]
  footnote?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showFade, setShowFade] = useState(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowFade(el.scrollWidth - el.scrollLeft - el.clientWidth > 4)
  }

  const showRef = headers.length >= 3
  const showInterp = headers.length >= 4

  return (
    <div className="break-inside-avoid" tabIndex={0}>
      <div ref={scrollRef} onScroll={handleScroll} className="table-scroll-wrapper">
        <table className="report-table w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {headers.map((h, i) => (
                <th key={i} scope="col" className="text-left py-2 px-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                <td
                  scope="row"
                  data-label={headers[0]}
                  className="report-table-cell py-2 px-3 font-medium text-[0.75rem] md:text-[0.8125rem]"
                >
                  {row.label}
                </td>
                <td
                  data-label={headers[1]}
                  className="report-table-cell report-table-value py-2 px-3 text-[0.75rem] md:text-[0.8125rem] whitespace-nowrap"
                >
                  {row.value ?? <Dash />}
                </td>
                {showRef && (
                  <td
                    data-label={headers[2]}
                    className="report-table-cell report-table-ref py-2 px-3 whitespace-nowrap"
                  >
                    {row.ref ?? <Dash />}
                  </td>
                )}
                {showInterp && (
                  <td data-label={headers[3]} className="report-table-cell py-2 px-3">
                    {row.interp ? (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-bold',
                          row.interpClass === 'normal' && 'clinical-badge-normal',
                          row.interpClass === 'altered' && 'clinical-badge-reduced',
                          row.interpClass === 'reduced' && 'clinical-badge-reduced',
                          row.interpClass === 'blue' && 'clinical-badge-blue',
                          row.interpClass === 'moderate' && 'clinical-badge-moderate',
                        )}
                      >
                        {row.interp}
                      </span>
                    ) : (
                      <Dash />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {showFade && (
          <div className="table-scroll-fade">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      {footnote && <p className="text-xs text-muted-foreground mt-2 italic">{footnote}</p>}
    </div>
  )
}

export function SectionBlock({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="report-section break-inside-avoid mb-6">
      <h3 className="report-section-title flex items-center gap-2">
        <span className="report-section-marker shrink-0" />
        <span>
          {number}. {title}
        </span>
      </h3>
      {children}
    </section>
  )
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
        <span className="report-subsection-marker shrink-0" />
        {title}
      </h4>
      {children}
    </div>
  )
}

export function EmptySection() {
  return (
    <p className="text-sm text-muted-foreground py-4 text-center">
      Sem dados registrados nesta seção
    </p>
  )
}
