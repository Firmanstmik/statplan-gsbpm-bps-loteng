import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GsbpmPhase, JenisKegiatan, Klasifikasi, SubProcess } from '@/domain/types'
import {
  SPECIFY_NEED_INTRO,
  getSpecifyNeedLearning,
} from '@/content/gsbpmLearning'
import { SubprocessLearningCard } from '@/features/workspace/learning/SubprocessLearningCard'
import { Card } from '@/components/ui/Badge'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { cn } from '@/lib/utils'
import { isSubProcessVisible } from '@/domain/gsbpm'

type Props = {
  phase: GsbpmPhase
  jenisKegiatan: JenisKegiatan
  klasifikasi: Klasifikasi
  checklistState: Record<string, boolean>
  onChecklistToggle: (itemId: string) => void
  /** Portal / rekomendasi blocks rendered by parent when relevant */
  contextualSlotForCode?: (code: string) => ReactNode
}

export function SpecifyNeedLearningPanel({
  phase,
  jenisKegiatan,
  klasifikasi,
  checklistState,
  onChecklistToggle,
  contextualSlotForCode,
}: Props) {
  const visibleSubs = useMemo(
    () => phase.subProcesses.filter((sp) => isSubProcessVisible(sp.skipWhen, jenisKegiatan)),
    [phase.subProcesses, jenisKegiatan],
  )

  const defaultCode = visibleSubs[0]?.code ?? '1.1'
  const [focusedCode, setFocusedCode] = useState(defaultCode)

  useEffect(() => {
    if (!visibleSubs.some((sp) => sp.code === focusedCode)) {
      setFocusedCode(defaultCode)
    }
  }, [visibleSubs, focusedCode, defaultCode])

  const focused: SubProcess | undefined =
    visibleSubs.find((sp) => sp.code === focusedCode) ?? visibleSubs[0]
  const learning = focused ? getSpecifyNeedLearning(focused.code) : undefined
  const focusIndex = focused ? visibleSubs.findIndex((sp) => sp.code === focused.code) : 0

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="text-xs font-medium text-ink-600">
            Fase GSBPM {phase.code} · Specify Need
          </div>
          {phase.pdfRef ? <PdfRefBadge ref={phase.pdfRef} /> : null}
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          {phase.titleId}{' '}
          <span className="font-normal text-ink-600">({phase.title})</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          {SPECIFY_NEED_INTRO.plainPurpose}
        </p>
        <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2.5 text-xs leading-relaxed text-ink-600">
          {SPECIFY_NEED_INTRO.flexibilityNote}
        </p>
      </Card>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Subproses
          </h3>
          {focused ? (
            <p className="text-xs text-ink-500">
              Langkah {focusIndex + 1} dari {visibleSubs.length} · fokus {focused.code}
            </p>
          ) : null}
        </div>
        <div
          role="tablist"
          aria-label="Subproses Specify Need"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        >
          {visibleSubs.map((sp) => {
            const active = sp.code === focused?.code
            return (
              <button
                key={sp.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFocusedCode(sp.code)}
                className={cn(
                  'focus-ring min-h-11 shrink-0 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                  active
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-ink-800 ring-1 ring-border hover:bg-ink-50',
                )}
              >
                <span className="block leading-none">{sp.code}</span>
                <span
                  className={cn(
                    'mt-1 block max-w-[9.5rem] truncate text-[11px] font-normal',
                    active ? 'text-white/70' : 'text-ink-600',
                  )}
                >
                  {sp.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {focused && learning ? (
        <SubprocessLearningCard
          subprocess={focused}
          learning={learning}
          jenisKegiatan={jenisKegiatan}
          klasifikasi={klasifikasi}
          checklistState={checklistState}
          onChecklistToggle={onChecklistToggle}
          onSuggestNext={(code) => setFocusedCode(code)}
          contextualSlot={contextualSlotForCode?.(focused.code)}
        />
      ) : focused ? (
        <Card>
          <p className="text-sm text-ink-700">
            Konten belajar untuk {focused.code} belum tersedia pada slice ini.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
