import { useId, useState } from 'react'
import type { GuidedExampleRow, GuidedSourceClass } from '@/content/guidedPhaseNeed'
import { sourceBadgeLabel } from '@/content/guidedPhaseNeed'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { Button } from '@/components/ui/Button'

type Props = {
  summary: string
  sourceClass: GuidedSourceClass
  pdfPage?: number | string
  detail?: GuidedExampleRow[]
  lessonPoints?: string[]
  /** Optional override for the source eyebrow (e.g. Format berdasarkan materi) */
  sourceNote?: string
}

/**
 * Progressive-disclosure example block for Type B/C (and Class A text summaries).
 * Keeps cards light: summary first → optional full rows → lesson points.
 */
export function GuidedExampleBlock({
  summary,
  sourceClass,
  pdfPage,
  detail,
  lessonPoints,
  sourceNote,
}: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const hasDetail = Boolean(detail && detail.length > 0)
  const hasLessons = Boolean(lessonPoints && lessonPoints.length > 0)

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Contoh</h4>
        {sourceClass === 'A' && pdfPage != null ? (
          <PdfRefBadge ref={`Menurut Materi Proses Bisnis · Hal. ${pdfPage}`} />
        ) : (
          <span className="text-[11px] font-medium text-ink-500">
            {sourceNote ?? sourceBadgeLabel(sourceClass, pdfPage)}
          </span>
        )}
      </div>

      <div className="rounded-xl bg-ink-50 px-3 py-2.5">
        <p className="text-sm leading-relaxed text-ink-800">{summary}</p>
        {hasDetail ? (
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 px-2 text-xs font-semibold text-ink-800"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Sembunyikan contoh lengkap' : 'Lihat contoh lengkap'}
            </Button>
            {open ? (
              <dl
                id={panelId}
                className="mt-2 space-y-2.5 border-t border-ink-900/10 pt-2.5"
              >
                {detail!.map((row) => (
                  <div key={row.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-ink-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasLessons ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Yang bisa dipelajari
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink-800">
            {lessonPoints!.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
