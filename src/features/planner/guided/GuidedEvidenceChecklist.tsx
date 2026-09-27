import type { GuidedEvidenceDef, GuidedEvidenceStatus } from '@/content/guidedNeedPreparation'
import type { GuidedEvidenceItemState } from '@/lib/guidedSession'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: GuidedEvidenceStatus; label: string }[] = [
  { value: 'belum', label: 'Belum disiapkan' },
  { value: 'sedang', label: 'Sedang disiapkan' },
  { value: 'sudah', label: 'Sudah disiapkan' },
]

type Props = {
  items: GuidedEvidenceDef[]
  states: Record<string, GuidedEvidenceItemState> | undefined
  onChange: (evidenceId: string, patch: Partial<GuidedEvidenceItemState>) => void
}

export function GuidedEvidenceChecklist({ items, states, onChange }: Props) {
  const ready = items.filter((i) => states?.[i.id]?.status === 'sudah').length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
          Bukti yang perlu disiapkan
        </p>
        <p className="text-xs text-ink-500">
          {ready}/{items.length} disiapkan
        </p>
      </div>
      <p className="text-[11px] leading-relaxed text-ink-500">
        Status persiapan lokal di Mode Terpandu — panduan saja, bukan verifikasi resmi BPS.
        Tidak semua item wajib. Tidak ada unggahan ke server.
      </p>
      <ul className="space-y-3">
        {items.map((item) => {
          const state = states?.[item.id] ?? { status: 'belum' as const, note: '' }
          return (
            <li
              key={item.id}
              className="rounded-xl border border-border/70 bg-white px-3 py-2.5"
            >
              <p className="text-sm font-medium text-ink-900">{item.label}</p>
              <label className="mt-2 block text-[11px] font-medium text-ink-600" htmlFor={`ev-status-${item.id}`}>
                Status persiapan
              </label>
              <select
                id={`ev-status-${item.id}`}
                value={state.status}
                onChange={(e) =>
                  onChange(item.id, { status: e.target.value as GuidedEvidenceStatus })
                }
                className="focus-ring mt-1 h-10 w-full rounded-lg border border-border bg-white px-2 text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label
                className="mt-2 block text-[11px] font-medium text-ink-600"
                htmlFor={`ev-note-${item.id}`}
              >
                Catatan (opsional)
              </label>
              <textarea
                id={`ev-note-${item.id}`}
                rows={2}
                value={state.note}
                onChange={(e) => onChange(item.id, { note: e.target.value })}
                placeholder="Catatan singkat…"
                className={cn(
                  'focus-ring mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm',
                )}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
