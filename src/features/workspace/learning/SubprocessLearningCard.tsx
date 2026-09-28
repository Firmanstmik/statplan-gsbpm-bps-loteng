import type { ReactNode } from 'react'
import { ArrowRight2 } from 'iconsax-react'
import type { SubProcess } from '@/domain/types'
import type { SubprocessLearning } from '@/content/gsbpmLearning'
import { Badge, Card } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { cn } from '@/lib/utils'
import { isChecklistVisible } from '@/domain/gsbpm'
import type { JenisKegiatan, Klasifikasi } from '@/domain/types'

type Props = {
  subprocess: SubProcess
  learning: SubprocessLearning
  jenisKegiatan: JenisKegiatan
  klasifikasi: Klasifikasi
  checklistState: Record<string, boolean>
  onChecklistToggle: (itemId: string) => void
  onSuggestNext?: (code: string) => void
  /** Optional contextual block (e.g. portal form for 1.5) */
  contextualSlot?: ReactNode
}

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-2', className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-600">{title}</h4>
      <div className="text-sm leading-relaxed text-ink-800">{children}</div>
    </section>
  )
}

export function SubprocessLearningCard({
  subprocess,
  learning,
  jenisKegiatan,
  klasifikasi,
  checklistState,
  onChecklistToggle,
  onSuggestNext,
  contextualSlot,
}: Props) {
  const visibleChecklist = subprocess.checklist.filter((c) =>
    isChecklistVisible(c, jenisKegiatan, klasifikasi),
  )

  return (
    <Card className="space-y-5 border-ink-900/10 shadow-(--shadow-soft)">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-ink-900 px-2 py-0.5 text-xs font-semibold text-white">
            {subprocess.code}
          </span>
          {subprocess.pdfRef ? <PdfRefBadge ref={subprocess.pdfRef} /> : null}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-ink-950">{subprocess.title}</h3>
        <p className="text-sm text-ink-600">{subprocess.description}</p>
      </header>

      <Section title="Apa maksudnya?">
        <p>{learning.plainMeaning}</p>
      </Section>

      <Section title="Mengapa ini penting?">
        <p>{learning.whyItMatters}</p>
      </Section>

      <Section title="Contoh">
        {learning.examples.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-ink-50/80 px-3 py-3 text-ink-700">
            <p className="font-medium text-ink-900">Belum ada contoh eksplisit di materi sumber</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-600">
              Materi Proses Bisnis tidak menampilkan contoh tabel/variabel khusus untuk subproses
              ini. Gunakan rumusan masalah dan daftar kebutuhan Anda sendiri, lalu lanjut ke
              konsultasi di langkah berikutnya.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {learning.examples.map((ex) => (
              <div
                key={ex.id}
                className="rounded-xl border border-border/80 bg-ink-50/60 px-3 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink-950">{ex.title}</p>
                  {ex.simplified ? (
                    <Badge tone="neutral">Disederhanakan untuk pemahaman</Badge>
                  ) : null}
                </div>
                <p className="mt-2">{ex.body}</p>
                <p className="mt-2 text-xs text-ink-600">{ex.sourceNote}</p>
                <p className="mt-1 text-[11px] text-ink-500">
                  Contoh dari materi pembelajaran — bukan templat resmi BPS kecuali dinyatakan
                  demikian di sumber.
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Yang perlu Anda siapkan">
        <ul className="list-disc space-y-1.5 pl-4">
          {learning.prepareHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
        {subprocess.activities.length > 0 ? (
          <details className="mt-3 rounded-xl border border-border/70 bg-white px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-ink-700">
              Kegiatan resmi di materi ({subprocess.activities.length})
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-700">
              {subprocess.activities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </Section>

      {learning.conditionCopy ? (
        <div className="rounded-xl border border-bps-blue/20 bg-bps-blue/5 px-3 py-3 text-sm text-ink-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">Catatan kondisi</p>
          <p className="mt-1.5 leading-relaxed">{learning.conditionCopy}</p>
        </div>
      ) : null}

      {contextualSlot}

      <Section title="Checklist">
        <div className="space-y-2 rounded-xl bg-ink-50 p-3">
          {visibleChecklist.map((c) => (
            <Checkbox
              key={c.id}
              checked={!!checklistState[c.id]}
              onChange={() => onChecklistToggle(c.id)}
              label={
                <>
                  {c.label}
                  {c.required ? <span className="ml-1 text-xs text-danger">*</span> : null}
                </>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Setelah langkah ini…">
        <div className="flex flex-wrap gap-2">
          {learning.afterThisYouHave.map((item) => (
            <Badge key={item} tone="brand">
              {item}
            </Badge>
          ))}
          {subprocess.outputs.map((o) =>
            learning.afterThisYouHave.includes(o) ? null : <Badge key={o}>{o}</Badge>,
          )}
        </div>
      </Section>

      {learning.suggestedNextCode && onSuggestNext ? (
        <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ink-600">
            Saran belajar saja — bukan kewajiban urutan GSBPM. Anda boleh pilih subproses lain di
            navigator.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="min-h-11 shrink-0"
            rightIcon={
              <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
            }
            onClick={() => onSuggestNext(learning.suggestedNextCode!)}
          >
            Lanjut ke {learning.suggestedNextCode}
          </Button>
        </div>
      ) : (
        <p className="border-t border-border/70 pt-4 text-xs text-ink-600">
          Ini subproses terakhir di fase Specify Need. Anda dapat beralih ke fase Design melalui
          navigasi fase di kiri, atau meninjau ulang subproses sebelumnya.
        </p>
      )}
    </Card>
  )
}
