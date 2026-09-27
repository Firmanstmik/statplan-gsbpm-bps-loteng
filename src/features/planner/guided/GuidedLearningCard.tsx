import { useEffect, useId, useRef } from 'react'
import { ArrowDown2, ArrowUp2, TickCircle } from 'iconsax-react'
import type { GuidedLearningCard as CardData } from '@/content/guidedPhaseNeed'
import { sourceBadgeLabel } from '@/content/guidedPhaseNeed'
import {
  computeDraftStatus,
  countEvidenceReady,
  type GuidedDraftStatus as DraftStatus,
} from '@/content/guidedNeedPreparation'
import { getPreparation } from '@/content/guidedPreparation'
import type { GuidedEvidenceItemState } from '@/lib/guidedSession'
import type { GuidedDraftValues } from '@/content/guidedNeedPreparation'
import { Button } from '@/components/ui/Button'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { GuidedDraftStatus } from '@/features/planner/guided/GuidedDraftStatus'
import { MateriExampleBlock } from '@/features/planner/guided/MateriExampleBlock'
import { GuidedExampleBlock } from '@/features/planner/guided/GuidedExampleBlock'
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
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
      {children}
    </h4>
  )
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
}: Props) {
  const panelId = useId()
  const headingId = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const prep = getPreparation(card.id)
  const draftStatus: DraftStatus = prep
    ? computeDraftStatus(prep, draftValues)
    : 'empty'
  const evidenceCount = prep
    ? countEvidenceReady(prep.evidence, evidenceStates)
    : { ready: 0, total: 0 }

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus({ preventScroll: false })
    }
  }, [open])

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white transition-shadow',
        open ? 'border-ink-900/15 shadow-(--shadow-soft)' : 'border-border/80',
      )}
    >
      <h3 className="sr-only" id={headingId}>
        {card.mappingKind === 'statplan'
          ? `Panduan StatPlan ${card.title}`
          : `${card.code} ${card.officialTitle ?? card.title}`}
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
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm',
            understood
              ? 'bg-ink-900 text-white'
              : 'bg-ink-100 text-ink-600 ring-1 ring-ink-900/10',
          )}
          aria-hidden
        >
          {understood ? <TickCircle size={14} variant="Bold" color="currentColor" /> : '○'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink-950">
            {card.mappingKind === 'statplan' ? (
              <>
                <span className="mr-1.5 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-600">
                  Panduan StatPlan
                </span>
                {card.title}
              </>
            ) : (
              <>
                <span className="text-ink-500">{card.code}</span>{' '}
                {card.officialTitle ?? card.title}
              </>
            )}
          </span>
          {card.mappingKind === 'gsbpm' &&
          card.officialTitle &&
          card.officialTitle !== card.title ? (
            <span className="mt-0.5 block text-xs text-ink-600">Penjelasan: {card.title}</span>
          ) : null}
          {card.mappingKind === 'statplan' ? (
            <span className="mt-0.5 block text-[11px] text-ink-500">
              Bukan kode sub-proses GSBPM resmi — bantuan belajar StatPlan.
            </span>
          ) : null}
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-600">
            {understood ? <span>Sudah dipahami</span> : null}
            <GuidedDraftStatus status={draftStatus} compact />
          </span>
        </span>
        <span className="mt-1 shrink-0 text-ink-500" aria-hidden>
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
          className="space-y-4 border-t border-border/70 px-3.5 pb-4 pt-3 outline-none sm:px-4"
        >
          <section className="space-y-1.5">
            <SectionLabel>Apa?</SectionLabel>
            <p className="text-sm leading-relaxed text-ink-800">{card.apa}</p>
          </section>

          <section className="space-y-1.5">
            {card.materiExamples && card.materiExamples.length > 0 ? (
              <MateriExampleBlock
                examples={card.materiExamples}
                pdfPage={card.pdfPage}
                lesson={
                  card.lessonPoints && card.lessonPoints.length > 0
                    ? undefined
                    : card.materiLesson
                }
                context={card.contoh}
              />
            ) : (
              <GuidedExampleBlock
                summary={card.contoh}
                sourceClass={card.contohClass}
                pdfPage={card.pdfPage}
                detail={card.contohDetail}
                lessonPoints={card.lessonPoints}
              />
            )}
            {card.materiExamples &&
            card.materiExamples.length > 0 &&
            card.lessonPoints &&
            card.lessonPoints.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                  Yang bisa dipelajari
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink-800">
                  {card.lessonPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {card.contohDetail &&
            card.contohDetail.length > 0 &&
            card.materiExamples &&
            card.materiExamples.length > 0 ? (
              <GuidedExampleBlock
                summary="Contoh isian untuk kegiatan Anda (ilustratif StatPlan — bukan salinan materi)."
                sourceClass="C"
                detail={card.contohDetail}
              />
            ) : null}
          </section>

          <section className="space-y-2">
            <SectionLabel>Format kerja StatPlan</SectionLabel>
            <p className="text-xs leading-relaxed text-ink-600">
              Buat versi kegiatan Anda. Bukan template resmi BPS. Contoh materi dan isian Anda
              dibedakan dengan jelas.
            </p>
            <Button type="button" className="w-full" onClick={onPrepare}>
              Siapkan bahan
            </Button>
            <GuidedDraftStatus status={draftStatus} />
          </section>

          <section className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <SectionLabel>Bukti dukung</SectionLabel>
              {card.buktiClass === 'A' && card.buktiPdfPage != null ? (
                <PdfRefBadge
                  ref={`Menurut Materi Proses Bisnis · Hal. ${card.buktiPdfPage}`}
                />
              ) : card.buktiPdfPage != null ? (
                <span className="text-[11px] font-medium text-ink-500">
                  {sourceBadgeLabel(card.buktiClass, card.buktiPdfPage)}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-ink-700">
              {evidenceCount.ready}/{evidenceCount.total} disiapkan
            </p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-ink-800">
              {(prep?.evidence.map((e) => e.label) ?? card.buktiItems).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-[11px] text-ink-500">
              Status bukti diatur di dalam “Siapkan bahan”. Tidak semua item wajib.
            </p>
            {card.id.startsWith('design-2.2') ? (
              <p className="text-[11px] leading-relaxed text-ink-500">
                Variabel yang Anda siapkan di sini masih berupa draft pembelajaran.
              </p>
            ) : null}
          </section>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <p className="text-[11px] leading-relaxed text-ink-500">
              Centang ini menandai bahwa Anda sudah meninjau dan memahami materi ini — bukan
              bahwa draft sudah lengkap, dokumen disetujui, atau kegiatan statistik selesai.
            </p>
            {understood ? (
              <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                <span>Sudah dipahami</span>
              </p>
            ) : (
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onMarkUnderstood}>
                Tandai sudah memahami
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </article>
  )
}
