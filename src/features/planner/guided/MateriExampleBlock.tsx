import { useState } from 'react'
import type { GuidedMateriExample } from '@/content/guidedPhaseNeed'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { cn } from '@/lib/utils'

type Props = {
  examples: GuidedMateriExample[]
  pdfPage?: number | string
  /** Type B — what to notice in the source example */
  lesson?: string
}

function sourceLine(page?: number | string) {
  return page != null && page !== '' ? `Materi Proses Bisnis · Hal. ${page}` : 'Materi Proses Bisnis'
}

function MateriVisual({ ex, page }: { ex: GuidedMateriExample; page?: number | string }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <figure className="m-0">
      <div
        className={cn(
          'rounded-lg bg-white ring-1 ring-ink-900/8',
          zoomed ? 'overflow-x-auto' : 'overflow-hidden',
        )}
      >
        <img
          src={ex.imageSrc}
          alt={ex.imageAlt ?? `${ex.title} — ${sourceLine(page)}`}
          width={ex.imageWidth}
          height={ex.imageHeight}
          loading="lazy"
          decoding="async"
          className={cn('block h-auto max-w-none', zoomed ? 'w-[min(1100px,250%)]' : 'w-full')}
        />
      </div>
      <figcaption className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-ink-500">
        <span>Gambar asli dari {sourceLine(page)} — tidak digambar ulang.</span>
        <button
          type="button"
          className="focus-ring rounded font-semibold text-ink-700 underline-offset-2 hover:underline"
          aria-pressed={zoomed}
          onClick={() => setZoomed((z) => !z)}
        >
          {zoomed ? 'Perkecil' : 'Perbesar'}
        </button>
      </figcaption>
    </figure>
  )
}

/**
 * Type A examples from Materi Proses Bisnis: an extracted source image, an exact
 * list, or an exact table. Only real source content is labelled as coming from the PDF.
 */
export function MateriExampleBlock({ examples, pdfPage, lesson }: Props) {
  if (!examples.length) return null

  return (
    <div className="space-y-3">
      {examples.map((ex) => {
        const page = ex.pdfPage ?? pdfPage
        return (
          <section
            key={ex.title}
            className="rounded-xl border border-ink-900/8 bg-ink-50/60 px-3.5 py-3"
            aria-label={`${ex.title} — ${sourceLine(page)}`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink-950">{ex.title}</p>
              {page != null && page !== '' ? <PdfRefBadge ref={`Hal. ${page}`} /> : null}
            </div>

            {ex.imageSrc ? <MateriVisual ex={ex} page={page} /> : null}

            {ex.items && ex.items.length > 0 ? (
              <ul className="space-y-1 text-sm leading-relaxed text-ink-800">
                {ex.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {ex.table ? (
              <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-ink-900/8">
                <table className="w-full min-w-[18rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    {ex.title} — {sourceLine(page)}
                  </caption>
                  <thead>
                    <tr className="bg-ink-100/70 text-[11px] uppercase tracking-wide text-ink-700">
                      {ex.table.columns.map((col) => (
                        <th key={col} scope="col" className="px-3 py-2 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ex.table.rows.map((row) => (
                      <tr key={row.join('|')} className="border-t border-ink-900/6">
                        {row.map((cell, i) => (
                          <td
                            key={`${i}-${cell}`}
                            className={cn(
                              'px-3 py-1.5 text-ink-800',
                              i === 0 ? 'w-10 tabular-nums text-ink-500' : '',
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {!ex.imageSrc && !ex.items?.length && !ex.table ? (
              <p className="text-[11px] leading-relaxed text-ink-500">
                Lihat {sourceLine(page)} untuk bentuk lengkapnya.
              </p>
            ) : null}

            {ex.note ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-600">{ex.note}</p>
            ) : null}
          </section>
        )
      })}

      {lesson ? (
        <p className="border-l-2 border-bps-orange/60 pl-3 text-sm leading-relaxed text-ink-800">
          <span className="font-semibold text-ink-950">Perhatikan: </span>
          {lesson}
        </p>
      ) : null}
    </div>
  )
}
