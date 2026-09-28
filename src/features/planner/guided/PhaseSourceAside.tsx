import type { GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { FaqLink } from '@/components/ui/FaqLink'

/** One beginner question per phase where a term tends to block people (see docs/faq-content-map.md). */
const PHASE_FAQ: Partial<Record<GuidedPhaseIntro['phaseId'], string>> = {
  design: 'apa-itu-variabel',
  process: 'apa-itu-validasi',
}

/**
 * Phase-level source note: official phase title, page range, the phase outputs
 * listed on the PDF phase slide (Type A), and the GSBPM flexibility note — once per phase.
 */
export function PhaseSourceAside({ intro }: { intro: GuidedPhaseIntro }) {
  return (
    <aside className="rounded-xl border border-border/80 bg-ink-50/70 px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-900">GSBPM 5.2 · {intro.officialTitle}</p>
        <PdfRefBadge ref={`Materi ${intro.pdfRange}`} />
      </div>
      <details className="group mt-2">
        <summary className="focus-ring cursor-pointer list-none rounded text-xs font-semibold text-ink-700 hover:text-ink-950">
          Output tahap ini menurut materi ({intro.outputs.length})
          <span className="ml-1 inline-block transition-transform group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </summary>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-ink-700">
          {intro.outputs.map((o) => (
            <li key={o} className="flex gap-2">
              <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bps-orange" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-[11px] text-ink-500">Hal. {intro.outputsPage}</p>
      </details>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-500">{intro.gsbpmNote}</p>
      {PHASE_FAQ[intro.phaseId] ? <FaqLink id={PHASE_FAQ[intro.phaseId]!} className="mt-2" /> : null}
    </aside>
  )
}
