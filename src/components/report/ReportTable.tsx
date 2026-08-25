import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// IEMEX Performance — Report primitives + shared design system
//
// Token rationale:
// - `report-ink` replaces the generic slate-800 as the primary text/structure
//   color: a deep teal-charcoal that reads as clinical without being flat black.
// - `report-teal` / `report-amber` / `report-crimson` replace the default
//   Tailwind green/yellow/red badge trio with a calmer, deliberate palette.
// - `report-mono` (IBM Plex Mono) is used for all clinical numbers — it gives
//   tabular alignment and a "lab instrument" reading feel that a humanist
//   sans can't.
// - `report-display` (Space Grotesk) is used for headings only — it's the
//   one place we spend visual character.
//
// Everything the 7 report sections need visually lives in this one file
// (table primitives + reusable cards/badges) so there's a single file to
// replace instead of juggling several.
// ---------------------------------------------------------------------------

export type Tone = 'normal' | 'watch' | 'low' | 'na'

const toneText: Record<Tone, string> = {
  normal: 'text-report-teal',
  watch: 'text-report-amber',
  low: 'text-report-crimson',
  na: 'text-report-ink-soft',
}

const toneBg: Record<Tone, string> = {
  normal: 'bg-report-teal-bg',
  watch: 'bg-report-amber-bg',
  low: 'bg-report-crimson-bg',
  na: 'bg-report-paper-soft',
}

const toneDot: Record<Tone, string> = {
  normal: 'bg-report-teal',
  watch: 'bg-report-amber',
  low: 'bg-report-crimson',
  na: 'bg-report-ink-soft',
}

const toneLabel: Record<Tone, string> = {
  normal: 'Normal',
  watch: 'Atenção',
  low: 'Reduzida',
  na: 'Não coletado',
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-report-mono text-[0.65rem] tracking-[0.08em] uppercase text-report-ink-soft">
      {children}
    </p>
  )
}

export function SectionHeading({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-report-line">
      <span className="font-report-mono text-xs text-report-ink-soft">
        {String(n).padStart(2, '0')}
      </span>
      <h2 className="font-report-display text-[0.95rem] font-semibold text-report-ink">
        {children}
      </h2>
    </div>
  )
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[0.8rem] font-semibold text-report-ink mb-2">{children}</h3>
}

export function PlaceholderText() {
  return <p className="text-report-ink-soft italic text-sm">Dados não coletados nesta avaliação</p>
}

export function StatusPill({ tone, text }: { tone: Tone; text?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.68rem] font-semibold ${toneBg[tone]} ${toneText[tone]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${toneDot[tone]}`} />
      {text ?? toneLabel[tone]}
    </span>
  )
}

/** Reading card for a single headline metric — big mono number + reference dot. */
export function ReadingCard({
  label,
  value,
  unit,
  refText,
  tone,
}: {
  label: string
  value: string
  unit?: string
  refText: string
  tone: Tone
}) {
  return (
    <div className="flex-1 min-w-[170px] bg-report-paper border border-report-line rounded-[10px] px-4 py-3.5">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="font-report-mono font-semibold text-[1.7rem] leading-none text-report-ink">
          {value}
        </span>
        {unit && (
          <span className="font-report-mono text-[0.75rem] text-report-ink-soft">{unit}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <span className={`w-[7px] h-[7px] rounded-full inline-block ${toneDot[tone]}`} />
        <span className="text-[0.7rem] text-report-ink-soft">{refText}</span>
      </div>
    </div>
  )
}

/** Clinical data table for ad-hoc head/rows content (used by ReportPrint). */
export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full text-[0.78rem] border-collapse">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              className="font-report-mono text-[0.62rem] tracking-[0.04em] uppercase text-report-ink-soft text-left pb-2 border-b border-report-line"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, ri) => (
          <tr key={ri}>
            {cells.map((c, ci) => (
              <td
                key={ci}
                className={`py-2 border-b border-report-line/70 align-top ${
                  ci === 0
                    ? 'text-report-ink'
                    : ci === 1
                      ? 'font-report-mono font-semibold text-report-ink'
                      : ''
                }`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export interface PathwayStep {
  label: string
  sub: string
  status: 'pass' | 'fail' | 'pending'
}

/** Signature element — the EWGSOP2 diagnostic pathway ribbon. */
export function DiagnosticPathway({ steps }: { steps: PathwayStep[] }) {
  const dot: Record<PathwayStep['status'], string> = {
    pass: 'bg-report-teal text-white',
    fail: 'bg-report-amber text-white',
    pending: 'bg-report-paper-soft text-report-ink-soft border border-report-line',
  }
  const glyph: Record<PathwayStep['status'], string> = { pass: '✓', fail: '!', pending: '–' }
  const lineColor: Record<PathwayStep['status'], string> = {
    pass: '#0F8B7E',
    fail: '#AD6A0C',
    pending: '#DEE4E2',
  }
  return (
    <div className="flex items-start">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex flex-col min-w-[84px] ${i === steps.length - 1 ? 'flex-none' : 'flex-1'}`}
        >
          <div className="flex items-center w-full">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-report-display font-semibold text-[0.75rem] shrink-0 ${dot[step.status]}`}
            >
              {glyph[step.status]}
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${lineColor[step.status]}, #DEE4E2)` }}
              />
            )}
          </div>
          <div className="text-center mt-2 pr-1">
            <p className="text-[0.72rem] font-semibold text-report-ink leading-tight">
              {step.label}
            </p>
            <p className="text-[0.66rem] text-report-ink-soft leading-tight">{step.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function VerdictBanner({
  eyebrow,
  title,
  detail,
  tone,
}: {
  eyebrow: string
  title: string
  detail: string
  tone: Tone
}) {
  const bg = toneBg[tone]
  const textStrong = tone === 'watch' ? 'text-report-amber-text' : toneText[tone]
  return (
    <div
      className={`rounded-[10px] px-5 py-4 flex items-center justify-between gap-4 flex-wrap ${bg}`}
    >
      <div>
        <p className={`text-[0.65rem] font-semibold tracking-[0.06em] uppercase ${toneText[tone]}`}>
          {eyebrow}
        </p>
        <p className={`font-report-display text-[1.15rem] font-semibold mt-0.5 ${textStrong}`}>
          {title}
        </p>
      </div>
      <p className={`text-[0.75rem] max-w-[320px] text-right ${textStrong} opacity-90`}>{detail}</p>
    </div>
  )
}

/** Small inline callout for one-line conclusions ("Força preservada" etc). */
export function InlineNote({ tone, children }: { tone: Tone; children: ReactNode }) {
  const border: Record<Tone, string> = {
    normal: 'border-report-teal',
    watch: 'border-report-amber',
    low: 'border-report-crimson',
    na: 'border-report-ink-soft',
  }
  return (
    <div
      className={`mt-4 border-l-[3px] rounded-r-[8px] bg-report-paper-soft px-4 py-3 text-[0.85rem] font-medium text-report-ink ${border[tone]}`}
    >
      {children}
    </div>
  )
}

export function RecommendationCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex-1 min-w-[200px] bg-report-paper-soft rounded-[10px] border-l-[3px] border-report-ink px-4 py-3.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.04em] text-report-ink-soft">
        {title}
      </p>
      <div className="text-[0.8rem] text-report-ink mt-1.5 leading-relaxed">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section primitives (used by every Section1..7 component)
// ---------------------------------------------------------------------------

export type ReportRow = {
  label: string
  value: string
  ref?: string
  sparkline?: ReactNode
  interp?: string
  interpClass?: 'normal' | 'reduced' | 'moderate' | 'altered' | 'blue' | 'orange'
  trendIcon?: ReactNode
}

/** Maps the legacy interpClass vocabulary onto the report's 4-tone palette. */
function interpToTone(cls: ReportRow['interpClass']): Tone {
  if (cls === 'normal' || cls === 'blue') return 'normal'
  if (cls === 'reduced') return 'low'
  if (cls === 'moderate' || cls === 'altered' || cls === 'orange') return 'watch'
  return 'na'
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
    <section className="report-section break-inside-avoid">
      <div className="flex items-baseline gap-2 mb-4 pb-2 border-b border-report-line break-after-avoid">
        <span className="font-report-mono text-xs text-report-ink-soft">
          {String(number).padStart(2, '0')}
        </span>
        <h2 className="font-report-display text-lg font-semibold text-report-ink">{title}</h2>
      </div>
      <div className="px-1">{children}</div>
    </section>
  )
}

export function ReportTable({ rows }: { rows: ReportRow[] }) {
  const hasSparkline = rows.some((r) => r.sparkline !== undefined && r.sparkline !== null)

  return (
    <div className="table-scroll-wrapper">
      <table className="w-full text-[0.85rem] border-collapse">
        <thead>
          <tr>
            <th className="font-report-mono text-[0.65rem] tracking-[0.04em] uppercase text-report-ink-soft text-left p-2 border-b border-report-line">
              Parâmetro
            </th>
            <th className="font-report-mono text-[0.65rem] tracking-[0.04em] uppercase text-report-ink-soft text-left p-2 border-b border-report-line">
              Valor
            </th>
            <th className="font-report-mono text-[0.65rem] tracking-[0.04em] uppercase text-report-ink-soft text-left p-2 border-b border-report-line">
              Referência
            </th>
            {hasSparkline && (
              <th className="font-report-mono text-[0.65rem] tracking-[0.04em] uppercase text-report-ink-soft text-center p-2 border-b border-report-line">
                Evolução
              </th>
            )}
            <th className="font-report-mono text-[0.65rem] tracking-[0.04em] uppercase text-report-ink-soft text-left p-2 border-b border-report-line">
              Interpretação
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td
                className="p-2 border-b border-report-line/70 text-report-ink align-top"
                data-label="Parâmetro"
              >
                {row.label}
              </td>
              <td
                className="p-2 border-b border-report-line/70 align-top font-report-mono font-semibold text-report-ink"
                data-label="Valor"
              >
                {row.value}
              </td>
              <td
                className="p-2 border-b border-report-line/70 align-top font-report-mono text-[0.78rem] text-report-ink-soft"
                data-label="Referência"
              >
                {row.ref ?? '—'}
              </td>
              {hasSparkline && (
                <td
                  className="p-2 border-b border-report-line/70 text-center align-top"
                  data-label="Evolução"
                >
                  <div className="inline-flex items-center justify-center min-h-[20px]">
                    {row.sparkline ?? <span className="text-[10px] text-report-ink-soft">—</span>}
                  </div>
                </td>
              )}
              <td
                className="p-2 border-b border-report-line/70 align-top"
                data-label="Interpretação"
              >
                {row.interp && row.interpClass && (
                  <span className="inline-flex items-center gap-1.5">
                    {row.trendIcon}
                    <StatusPill tone={interpToTone(row.interpClass)} text={row.interp} />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function EmptySection({ message }: { message?: string }) {
  return (
    <div className="bg-report-paper-soft rounded-[10px] py-4 text-center">
      {message ? (
        <p className="text-report-ink-soft text-sm italic">{message}</p>
      ) : (
        <PlaceholderText />
      )}
    </div>
  )
}
