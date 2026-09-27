import type { GuidedMateriExample } from '@/content/guidedPhaseNeed'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'

type Props = {
  examples: GuidedMateriExample[]
  pdfPage?: number | string
  lesson?: string
  /** Additional Type A context under the preview cards */
  context?: string
}

/**
 * Type A named examples from Materi Proses Bisnis.
 * Shows image when `imageSrc` is set; otherwise honest “preview available in PDF” note.
 * Never presents StatPlan fields as the PDF visual.
 */
export function MateriExampleBlock({ examples, pdfPage, lesson, context }: Props) {
  if (!examples.length) return null

  const pageLabel =
    pdfPage != null && pdfPage !== ''
      ? `Preview dari Materi Proses Bisnis · Hal. ${pdfPage}`
      : 'Preview dari Materi Proses Bisnis'

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
          Contoh dari Materi
        </h4>
        {pdfPage != null && pdfPage !== '' ? (
          <PdfRefBadge ref={`Menurut Materi Proses Bisnis · Hal. ${pdfPage}`} />
        ) : null}
      </div>

      <div className="rounded-xl border border-ink-900/10 bg-ink-50/80 px-3.5 py-3">
        <p className="text-[11px] font-medium text-ink-500">
          {pageLabel} · bukan template editable
        </p>

        <ul className="mt-2.5 space-y-2.5">
          {examples.map((ex) => (
            <li
              key={ex.title}
              className="overflow-hidden rounded-lg border border-border/60 bg-white"
            >
              {ex.imageSrc ? (
                <figure className="m-0">
                  <img
                    src={ex.imageSrc}
                    alt={`Preview: ${ex.title} dari Materi Proses Bisnis${
                      pdfPage != null ? ` halaman ${pdfPage}` : ''
                    }`}
                    className="max-h-56 w-full object-contain object-top bg-ink-50"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="border-t border-border/50 px-3 py-2.5">
                    <p className="text-sm font-semibold text-ink-950">{ex.title}</p>
                    {ex.note ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{ex.note}</p>
                    ) : null}
                  </figcaption>
                </figure>
              ) : (
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink-950">{ex.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                    Preview contoh tersedia di Materi Proses Bisnis
                    {pdfPage != null && pdfPage !== '' ? ` · Hal. ${pdfPage}` : ''}.
                    Gambar halaman tidak disematkan di aplikasi — buka materi sumber untuk melihat
                    visual lengkap.
                  </p>
                  {ex.note ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{ex.note}</p>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {lesson ? (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Yang dapat dipelajari
          </p>
          <p className="text-sm leading-relaxed text-ink-800">{lesson}</p>
        </div>
      ) : null}

      {context ? (
        <p className="text-sm leading-relaxed text-ink-700">{context}</p>
      ) : null}
    </div>
  )
}
