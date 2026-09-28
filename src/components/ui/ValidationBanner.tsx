import { useId, useState } from 'react'
import { ArrowDown2, ArrowRight2, ArrowUp2, TickCircle } from 'iconsax-react'
import type { ValidationIssue } from '@/domain/validation'
import { guidanceFor } from '@/content/validationGuidance'
import { cn } from '@/lib/utils'

/**
 * Review list for validation issues — “Perlu dilengkapi” (blocks the draft export)
 * and “Perlu ditinjau” (suggestions). Each item explains the problem, why it matters,
 * and how to fix it, with a CTA to the relevant tab. Not an official BPS validation.
 */
export function ValidationBanner({
  issues,
  className,
  onNavigate,
  compact,
}: {
  issues: ValidationIssue[]
  className?: string
  /** Jump to the workspace tab named in issue.tab */
  onNavigate?: (tab: string) => void
  /** Collapse explanations by default */
  compact?: boolean
}) {
  if (issues.length === 0) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border border-success/20 bg-success-soft px-4 py-3.5',
          className,
        )}
      >
        <TickCircle size={20} variant="Bold" color="currentColor" className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ink-950">Sudah siap ditinjau</p>
          <p className="t-support">Tidak ada yang perlu dilengkapi untuk draf ini.</p>
        </div>
      </div>
    )
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  return (
    <div className={cn('space-y-5', className)}>
      {errors.length > 0 ? (
        <IssueGroup
          title="Perlu dilengkapi"
          hint="Diperlukan sebelum draf dapat diunduh."
          tone="error"
          issues={errors}
          onNavigate={onNavigate}
          compact={compact}
        />
      ) : null}
      {warnings.length > 0 ? (
        <IssueGroup
          title="Perlu ditinjau"
          hint="Disarankan — tidak menghalangi unduhan draf."
          tone="warning"
          issues={warnings}
          onNavigate={onNavigate}
          compact={compact}
        />
      ) : null}
    </div>
  )
}

function IssueGroup({
  title,
  hint,
  tone,
  issues,
  onNavigate,
  compact,
}: {
  title: string
  hint: string
  tone: 'error' | 'warning'
  issues: ValidationIssue[]
  onNavigate?: (tab: string) => void
  compact?: boolean
}) {
  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-950">
          <span
            aria-hidden
            className={cn('h-2 w-2 rounded-full', tone === 'error' ? 'bg-danger' : 'bg-warning')}
          />
          {title} <span className="font-normal tabular-nums text-ink-500">({issues.length})</span>
        </h3>
        <p className="text-xs text-ink-500">{hint}</p>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {issues.map((i, idx) => (
          <IssueRow
            key={i.code}
            issue={i}
            onNavigate={onNavigate}
            initiallyOpen={!compact && tone === 'error' && idx === 0}
          />
        ))}
      </ul>
    </section>
  )
}

function IssueRow({
  issue,
  onNavigate,
  initiallyOpen,
}: {
  issue: ValidationIssue
  onNavigate?: (tab: string) => void
  initiallyOpen?: boolean
}) {
  const g = guidanceFor(issue.code, issue.message)
  const [open, setOpen] = useState(Boolean(initiallyOpen))
  const detailId = useId()
  const hasDetail = Boolean(g.why || g.fix)

  return (
    <li className="px-4 py-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-950">{g.title}</p>
          <p className="t-support mt-0.5">{issue.message}</p>
          {hasDetail ? (
            <button
              type="button"
              className="focus-ring mt-1 inline-flex items-center gap-1 rounded text-xs font-semibold text-ink-700 hover:text-ink-950"
              aria-expanded={open}
              aria-controls={detailId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Sembunyikan penjelasan' : 'Mengapa & cara memperbaiki'}
              {open ? (
                <ArrowUp2 size={11} variant="Bold" color="currentColor" aria-hidden />
              ) : (
                <ArrowDown2 size={11} variant="Bold" color="currentColor" aria-hidden />
              )}
            </button>
          ) : null}
          {hasDetail && open ? (
            <dl id={detailId} className="mt-2 grid gap-1.5 text-[13px] leading-relaxed sm:grid-cols-[8.5rem_minmax(0,1fr)]">
              {g.why ? (
                <>
                  <dt className="font-medium text-ink-500">Mengapa penting</dt>
                  <dd className="text-ink-800">{g.why}</dd>
                </>
              ) : null}
              {g.fix ? (
                <>
                  <dt className="font-medium text-ink-500">Cara memperbaiki</dt>
                  <dd className="text-ink-800">{g.fix}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </div>
        {onNavigate && issue.tab ? (
          <button
            type="button"
            className="focus-ring inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-900 hover:border-ink-400"
            onClick={() => onNavigate(issue.tab!)}
          >
            {g.cta}
            <ArrowRight2 size={12} variant="Bold" color="currentColor" aria-hidden />
          </button>
        ) : null}
      </div>
    </li>
  )
}
