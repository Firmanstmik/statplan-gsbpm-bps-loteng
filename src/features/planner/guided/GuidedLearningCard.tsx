import { useEffect, useId, useRef, useState } from 'react'
import { ArrowDown2, ArrowRight2, ArrowUp2, TickCircle } from 'iconsax-react'
import type { GuidedLearningCard as CardData } from '@/content/guidedPhaseNeed'
import {
  computeDraftStatus,
  countEvidenceReady,
  type GuidedDraftStatus as DraftStatus,
  type GuidedEvidenceDef,
} from '@/content/guidedNeedPreparation'
import { getPreparation } from '@/content/guidedPreparation'
import type { GuidedEvidenceItemState } from '@/lib/guidedSession'
import type { GuidedDraftValues } from '@/content/guidedNeedPreparation'
import { Button } from '@/components/ui/Button'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { GuidedDraftStatus } from '@/features/planner/guided/GuidedDraftStatus'
import { MateriExampleBlock } from '@/features/planner/guided/MateriExampleBlock'
import { cn } from '@/lib/utils'

type Props = {
  card: CardData
  open: boolean
  understood: boolean
  draftValues: GuidedDraftValues | undefined
  evidenceStates: Record<string, GuidedEvidenceItemState> | undefined
  onToggle: () => void
  onMarkUnderstood: () => void
  onPrepare: () => void
  /** Opens the next subprocess of the same phase (shown once understood) */
  onNext?: () => void
  nextLabel?: string
}

function SectionLabel({ children, id }: { children: string; id?: string }) {
  return (
    <h4 id={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
      {children}
    </h4>
  )
}

function SourceTag({ kind, page }: { kind: 'A' | 'B' | 'C'; page?: number | string }) {
  if (kind === 'A' && page != null) return <PdfRefBadge ref={`Dari materi · Hal. ${page}`} />
  if (kind === 'B')
    return (
      <span className="text-[11px] font-medium text-ink-500">
        Penjelasan sederhana{page != null ? ` · Hal. ${page}` : ''}
      </span>
    )
  return <span className="text-[11px] font-medium text-ink-500">Contoh ilustratif StatPlan</span>
}

export function GuidedLearningCard({
  card,
  open,
  understood,
  draftValues,
  evidenceStates,
  onToggle,
  onMarkUnderstood,
  onPrepare,
  onNext,
  nextLabel,
}: Props) {
  const panelId = useId()
  const headingId = useId()
  const pointsId = useId()
  const detailId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const [showPoints, setShowPoints] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const prep = getPreparation(card.id)
  const draftStatus: DraftStatus = prep ? computeDraftStatus(prep, draftValues) : 'empty'
  const evidence: GuidedEvidenceDef[] =
    prep?.evidence ?? (card.buktiItems ?? []).map((label) => ({ id: label, label }))
  const evidenceCount = prep
    ? countEvidenceReady(prep.evidence, evidenceStates)
    : { ready: 0, total: evidence.length }
  const officialTitle = card.officialTitle ?? card.title
  const hasMateri = Boolean(card.materiExamples?.length)

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus({ preventScroll: false })
    }
  }, [open])

  return (
    <article
      data-guided-card={card.id}
      className={cn(
        'rounded-2xl border bg-white transition-shadow',
        open ? 'border-ink-900/15 shadow-(--shadow-soft)' : 'border-border/80',
      )}
    >
      <h3 className="sr-only" id={headingId}>
        {`${card.code} ${officialTitle}`}
      </h3>
      <button
        type="button"
        data-guided-card-toggle
        className="focus-ring flex w-full items-start gap-3 rounded-2xl px-3.5 py-3.5 text-left sm:px-4"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
            understood ? 'bg-ink-900 text-white' : 'bg-white ring-[1.5px] ring-ink-900/20',
          )}
          aria-hidden
        >
          {understood ? <TickCircle size={14} variant="Bold" color="currentColor" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-ink-950">
            <span className="mr-1.5 tabular-nums text-ink-500">{card.code}</span>
            {officialTitle}
          </span>
          <span className="mt-0.5 block text-xs text-ink-600">{card.title}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600">
            {card.pdfPage != null ? (
              <span className="tabular-nums text-ink-500">Hal. {card.pdfPage}</span>
            ) : null}
            {understood ? <span className="font-medium text-ink-900">Sudah dipahami</span> : null}
            <GuidedDraftStatus status={draftStatus} compact />
          </span>
        </span>
        <span className="mt-0.5 flex shrink-0 items-center gap-1.5 text-ink-500" aria-hidden>
          {!open ? (
            <span className="hidden rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-ink-800 sm:inline">
              {understood ? 'Tinjau' : 'Pelajari'}
            </span>
          ) : null}
          {open ? (
            <ArrowUp2 size={16} variant="Bold" color="currentColor" />
          ) : (
            <ArrowDown2 size={16} variant="Bold" color="currentColor" />
          )}
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          ref={contentRef}
          tabIndex={-1}
          className="space-y-6 border-t border-border/70 px-3.5 pb-5 pt-4 outline-none sm:px-5"
        >
          {/* APA? */}
          <section className="space-y-2" data-section="apa">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Apa?</SectionLabel>
              <SourceTag kind="B" page={card.pdfPage} />
            </div>
            <p className="text-[15px] leading-relaxed text-ink-900">{card.apa}</p>
            {card.materiPoints && card.materiPoints.length > 0 ? (
              <div>
                <button
                  type="button"
                  className="focus-ring inline-flex items-center gap-1 rounded text-xs font-semibold text-ink-700 hover:text-ink-950"
                  aria-expanded={showPoints}
                  aria-controls={pointsId}
                  onClick={() => setShowPoints((v) => !v)}
                >
                  {showPoints ? 'Sembunyikan' : 'Lihat'} poin dari materi ({card.materiPoints.length})
                  {showPoints ? (
                    <ArrowUp2 size={12} variant="Bold" color="currentColor" aria-hidden />
                  ) : (
                    <ArrowDown2 size={12} variant="Bold" color="currentColor" aria-hidden />
                  )}
                </button>
                {showPoints ? (
                  <div id={pointsId} className="mt-2 rounded-xl bg-ink-50/70 px-3.5 py-3">
                    <div className="mb-2">
                      <SourceTag kind="A" page={card.pdfPage} />
                    </div>
                    <ul className="space-y-1.5 text-sm leading-relaxed text-ink-800">
                      {card.materiPoints.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* CONTOH */}
          <section className="space-y-2.5" data-section="contoh">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Contoh</SectionLabel>
              <SourceTag kind={card.contohClass} page={card.pdfPage} />
            </div>
            <p className="text-sm leading-relaxed text-ink-800">{card.contoh}</p>
            {hasMateri ? (
              <MateriExampleBlock
                examples={card.materiExamples!}
                pdfPage={card.pdfPage}
                lesson={card.materiLesson}
              />
            ) : null}
            {card.contohDetail && card.contohDetail.length > 0 ? (
              <div className="rounded-xl border border-dashed border-ink-900/15 px-3.5 py-3">
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between gap-2 rounded text-left"
                  aria-expanded={showDetail}
                  aria-controls={detailId}
                  onClick={() => setShowDetail((v) => !v)}
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink-950">
                      {hasMateri ? 'Contoh penerapan untuk kegiatan SKM' : 'Contoh isian lengkap'}
                    </span>
                    <span className="block text-[11px] text-ink-500">
                      Contoh ilustratif StatPlan — bukan data atau dokumen resmi
                    </span>
                  </span>
                  <span className="shrink-0 text-ink-500" aria-hidden>
                    {showDetail ? (
                      <ArrowUp2 size={14} variant="Bold" color="currentColor" />
                    ) : (
                      <ArrowDown2 size={14} variant="Bold" color="currentColor" />
                    )}
                  </span>
                </button>
                {showDetail ? (
                  <dl id={detailId} className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    {card.contohDetail.map((row) => (
                      <div key={row.label} className="contents">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-600 sm:pt-0.5">
                          {row.label}
                        </dt>
                        <dd className="-mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-900 sm:mt-0">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* YANG BISA DIPELAJARI */}
          {card.lessonPoints && card.lessonPoints.length > 0 ? (
            <section className="space-y-2" data-section="pelajari">
              <SectionLabel>Yang bisa dipelajari</SectionLabel>
              <ul className="space-y-1.5 text-sm leading-relaxed text-ink-800">
                {card.lessonPoints.map((point) => (
                  <li key={point} className="flex gap-2">
                    <TickCircle
                      size={14}
                      variant="Linear"
                      color="currentColor"
                      className="mt-1 shrink-0 text-ink-500"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* FORMAT KERJA */}
          <section
            className="space-y-2 rounded-xl bg-ink-50/70 px-3.5 py-3"
            data-section="format"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Format kerja StatPlan</SectionLabel>
              <GuidedDraftStatus status={draftStatus} />
            </div>
            {prep ? (
              <>
                <p className="text-sm font-medium text-ink-950">{prep.title}</p>
                <p className="text-xs leading-relaxed text-ink-600">{prep.explanation}</p>
              </>
            ) : null}
            <Button type="button" className="mt-1 w-full sm:w-auto" onClick={onPrepare}>
              {draftStatus === 'empty' ? 'Isi format kerja' : 'Lanjutkan format kerja'}
            </Button>
          </section>

          {/* BUKTI DUKUNG */}
          <section className="space-y-2" data-section="bukti">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Bukti dukung</SectionLabel>
              <span className="text-xs tabular-nums text-ink-600">
                {evidenceCount.ready}/{evidenceCount.total} disiapkan
              </span>
            </div>
            <ul className="space-y-1.5">
              {evidence.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-ink-800">
                  <span className="min-w-0">{item.label}</span>
                  {item.pdfPage != null ? (
                    <span className="text-[11px] font-medium text-accent-700">
                      Output tahap menurut materi · Hal. {item.pdfPage}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {/* SUDAH DIPAHAMI */}
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {understood ? (
              <p className="flex items-center gap-2 text-sm font-medium text-ink-900" data-understood>
                <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                Sudah dipahami
              </p>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={onMarkUnderstood}
              >
                Tandai sudah dipahami
              </Button>
            )}
            {understood && onNext ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onNext}
                rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
              >
                {nextLabel ?? 'Subproses berikutnya'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}
