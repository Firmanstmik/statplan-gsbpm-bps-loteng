import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import type { PhaseDatePlan } from '@/content/planningTimeline'
import { formatDateID } from '@/content/planningTimeline'
import { PhaseSourceAside } from '@/features/planner/guided/PhaseSourceAside'

/**
 * Chapter header for one GSBPM phase in Mode Terpandu:
 * number · official phase · title · explanation · subprocess count · understood progress · dates.
 */
export function PhaseChapter({
  index,
  intro,
  cards,
  understood,
  dates,
}: {
  index: number
  intro: GuidedPhaseIntro
  cards: GuidedLearningCard[]
  understood: Record<string, boolean>
  dates?: PhaseDatePlan
}) {
  const done = cards.filter((c) => understood[c.id]).length
  const pct = cards.length ? Math.round((done / cards.length) * 100) : 0
  const official = intro.officialTitle.split(' (')[0]

  return (
    <header className="space-y-5">
      <div className="flex items-start gap-4 sm:gap-5">
        <span
          className="font-display text-4xl font-semibold leading-none tabular-nums text-ink-300 sm:text-5xl"
          aria-hidden
        >
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="t-eyebrow">
            Fase {index} dari 8 · {official}
          </p>
          <h1 id="guided-phase-heading" tabIndex={-1} className="t-page-title mt-1.5 outline-none">
            {intro.title}
          </h1>
        </div>
      </div>
      <p className="t-body reading-width">{intro.explanation}</p>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        <div className="bg-surface px-4 py-3">
          <p className="t-label">Subproses resmi</p>
          <p className="mt-1 text-[15px] font-semibold text-ink-950">{cards.length} subproses</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="t-label">Dipahami</p>
          <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink-950" aria-live="polite">
            {done} / {cards.length}
          </p>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100"
            role="progressbar"
            aria-label={`Subproses ${intro.title} yang sudah dipahami`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div
              className="h-full rounded-full bg-ink-900 motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="col-span-2 bg-surface px-4 py-3 sm:col-span-1">
          <p className="t-label">Rencana waktu Anda</p>
          <p className="mt-1 text-[15px] font-semibold text-ink-950">
            {dates ? `${formatDateID(dates.startISO)} – ${formatDateID(dates.endISO)}` : '—'}
          </p>
          <p className="text-[11px] text-ink-500">Bukan durasi wajib BPS</p>
        </div>
      </div>

      <PhaseSourceAside intro={intro} />
    </header>
  )
}
