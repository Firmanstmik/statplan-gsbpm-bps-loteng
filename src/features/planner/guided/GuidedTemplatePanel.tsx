import { useEffect, useId, useRef, useState } from 'react'
import { CloseCircle } from 'iconsax-react'
import { Button } from '@/components/ui/Button'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { GuidedEvidenceChecklist } from '@/features/planner/guided/GuidedEvidenceChecklist'
import { GuidedDraftStatus } from '@/features/planner/guided/GuidedDraftStatus'
import { MateriExampleBlock } from '@/features/planner/guided/MateriExampleBlock'
import { getGuidedCard } from '@/content/guidedCards'
import {
  computeDraftStatus,
  emptyDraftFor,
  isFieldVisible,
  type GuidedAnalyseOutputRow,
  type GuidedAspectRow,
  type GuidedActionPlanRow,
  type GuidedBuildTabulationRow,
  type GuidedCodingRow,
  type GuidedDraftStatus as DraftStatusValue,
  type GuidedDraftValues,
  type GuidedFinalOutputRow,
  type GuidedGenericRow,
  type GuidedImprovementRow,
  type GuidedMonitoringRow,
  type GuidedOutputRow,
  type GuidedPreparationDef,
  type GuidedReviewRow,
  type GuidedRoleRow,
  type GuidedScheduleRow,
  type GuidedSopRow,
  type GuidedSourceRow,
  type GuidedTabulationRow,
  type GuidedTemplateFieldDef,
  type GuidedValidationRow,
  type GuidedVariableRow,
  type GuidedWorkflowRow,
} from '@/content/guidedNeedPreparation'
import type { GuidedEvidenceItemState } from '@/lib/guidedSession'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  prep: GuidedPreparationDef
  initialValues: GuidedDraftValues | undefined
  evidenceStates: Record<string, GuidedEvidenceItemState> | undefined
  relatedDraftStatuses?: { label: string; status: DraftStatusValue }[]
  onClose: () => void
  onSaveDraft: (values: GuidedDraftValues) => void
  onResetDraft: () => void
  onEvidenceChange: (evidenceId: string, patch: Partial<GuidedEvidenceItemState>) => void
}

function newId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function GuidedTemplatePanel({
  open,
  prep,
  initialValues,
  evidenceStates,
  relatedDraftStatuses,
  onClose,
  onSaveDraft,
  onResetDraft,
  onEvidenceChange,
}: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<GuidedDraftValues>(() => ({
    ...emptyDraftFor(prep),
    ...initialValues,
  }))
  const [saveLabel, setSaveLabel] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    setValues({ ...emptyDraftFor(prep), ...initialValues })
    setSaveLabel('idle')
    // Sync only when panel opens for a card — not on every autosave refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [open, prep.cardId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    window.setTimeout(() => panelRef.current?.focus(), 30)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  if (!open) return null

  const status = computeDraftStatus(prep, values)
  const card = getGuidedCard(prep.cardId)
  const materiExamples = prep.materiExamples ?? card?.materiExamples ?? []

  function scheduleSave(next: GuidedDraftValues) {
    setSaveLabel('saving')
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      onSaveDraft(next)
      setSaveLabel('saved')
    }, 400)
  }

  function patchValue(fieldId: string, value: GuidedDraftValues[string]) {
    setValues((prev) => {
      const next = { ...prev, [fieldId]: value }
      scheduleSave(next)
      return next
    })
  }

  function handleReset() {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const empty = emptyDraftFor(prep)
    setValues(empty)
    onResetDraft()
    setSaveLabel('saved')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl bg-white shadow-(--shadow-lift) outline-none sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink-950">
              {prep.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {prep.sourceType === 'A' ? (
                <PdfRefBadge ref={prep.sourceLabel} />
              ) : (
                <span className="text-[11px] font-medium text-ink-500">{prep.sourceLabel}</span>
              )}
              <GuidedDraftStatus status={status} />
            </div>
          </div>
          <button
            type="button"
            className="focus-ring rounded-lg p-1.5 text-ink-600 hover:bg-ink-50"
            aria-label="Tutup panel bahan"
            onClick={onClose}
          >
            <CloseCircle size={22} variant="Bold" color="currentColor" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-ink-700">{prep.explanation}</p>
              <p className="text-[11px] leading-relaxed text-ink-500">{prep.disclaimer}</p>

              <section className="rounded-xl bg-ink-50 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                  {prep.exampleClass === 'A'
                    ? 'Contoh · menurut materi'
                    : prep.exampleClass === 'B'
                      ? 'Contoh · penjelasan sederhana'
                      : 'Contoh ilustratif StatPlan'}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-800">
                  {prep.exampleBody}
                </p>
              </section>

              {materiExamples.length > 0 ? (
                <details className="group rounded-xl border border-border/70 px-3.5 py-3">
                  <summary className="focus-ring cursor-pointer list-none rounded text-sm font-semibold text-ink-900">
                    Lihat contoh dari materi ({materiExamples.length})
                    <span className="ml-1 text-ink-500 group-open:hidden" aria-hidden>
                      ▾
                    </span>
                  </summary>
                  <div className="mt-3">
                    <MateriExampleBlock examples={materiExamples} pdfPage={card?.pdfPage ?? prep.pdfPage} />
                  </div>
                </details>
              ) : null}

              {prep.educationalNote ? (
                <aside className="rounded-xl border border-border/80 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                    {prep.educationalNoteClass === 'A' ? 'Menurut materi' : 'Penjelasan sederhana'}
                    {prep.educationalNotePage != null
                      ? ` · Hal. ${prep.educationalNotePage}`
                      : ''}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700">
                    {prep.educationalNote}
                  </p>
                </aside>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Format kerja StatPlan · Isian Anda
                </p>
                <p className="text-[11px] text-ink-500" aria-live="polite">
                  {saveLabel === 'saving'
                    ? 'Menyimpan…'
                    : saveLabel === 'saved'
                      ? 'Disimpan secara lokal'
                      : 'Belum ada perubahan'}
                </p>
              </div>

              {relatedDraftStatuses && relatedDraftStatuses.length > 0 ? (
                <div className="rounded-xl border border-border/70 bg-ink-50/70 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                    Status bahan terkait
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {relatedDraftStatuses.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-2 text-sm text-ink-800"
                      >
                        <span>{row.label}</span>
                        <GuidedDraftStatus status={row.status} compact />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-ink-500">
                    Ringkasan persiapan — bukan status resmi atau persetujuan BPS.
                  </p>
                </div>
              ) : null}

              {prep.fields
                .filter((field) => isFieldVisible(field, values))
                .map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(v) => patchValue(field.id, v)}
                />
              ))}

              <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:flex-wrap">
                <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleReset}>
                  Reset draft
                </Button>
                <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
                  Selesai mengisi
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border/70 pt-4">
            <GuidedEvidenceChecklist
              items={prep.evidence}
              states={evidenceStates}
              onChange={onEvidenceChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: GuidedTemplateFieldDef
  value: GuidedDraftValues[string] | undefined
  onChange: (v: GuidedDraftValues[string]) => void
}) {
  const id = `gf-${field.id}`

  if (field.kind === 'text' || field.kind === 'textarea') {
    const str = typeof value === 'string' ? value : ''
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </label>
        {field.kind === 'textarea' ? (
          <textarea
            id={id}
            rows={3}
            value={str}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="focus-ring w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
        ) : (
          <input
            id={id}
            type="text"
            value={str}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
          />
        )}
        {field.hint ? <p className="mt-1 text-[11px] text-ink-500">{field.hint}</p> : null}
      </div>
    )
  }

  if (field.kind === 'select') {
    const str = typeof value === 'string' ? value : ''
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </label>
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
        >
          <option value="">Pilih…</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.kind === 'multiSelect') {
    const selected = Array.isArray(value)
      ? (value.filter((x) => typeof x === 'string') as string[])
      : []
    return (
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-900">{field.label}</legend>
        <div className="flex flex-col gap-2">
          {(field.options ?? []).map((o) => {
            const checked = selected.includes(o.value)
            return (
              <label
                key={o.value}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((x) => x !== o.value)
                      : [...selected, o.value]
                    onChange(next)
                  }}
                  className="h-4 w-4"
                />
                {o.label}
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  if (field.kind === 'repeatableText') {
    const items = Array.isArray(value)
      ? (value.filter((x) => typeof x === 'string') as string[])
      : ['']
    const list = items.length ? items : ['']
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">{field.label}</p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-2">
          {list.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <input
                type="text"
                aria-label={`${field.label} ${idx + 1}`}
                value={item}
                onChange={(e) => {
                  const next = [...list]
                  next[idx] = e.target.value
                  onChange(next)
                }}
                className="focus-ring h-11 min-w-0 flex-1 rounded-xl border border-border px-3 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={list.length <= 1}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() => onChange([...list, ''])}
        >
          + Tambah tujuan khusus
        </Button>
      </div>
    )
  }

  if (field.kind === 'date') {
    const str = typeof value === 'string' ? value : ''
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </label>
        <input
          id={id}
          type="date"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
        />
        {field.hint ? <p className="mt-1 text-[11px] text-ink-500">{field.hint}</p> : null}
      </div>
    )
  }

  if (field.kind === 'repeatableVariable') {
    const rows: GuidedVariableRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'name' in x && 'untukApa' in x,
        ) as GuidedVariableRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), name: '', untukApa: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama variabel
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.name}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-u-${row.id}`}>
                Untuk apa digunakan?
              </label>
              <textarea
                id={`${id}-u-${row.id}`}
                rows={2}
                value={row.untukApa}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, untukApa: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus variabel ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), name: '', untukApa: '', catatan: '' }])
          }
        >
          + Tambah variabel
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableTabulation') {
    const rows: GuidedTabulationRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'judul' in x,
        ) as GuidedTabulationRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), judul: '', informasi: '', kelompok: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-j-${row.id}`}>
                Judul output
              </label>
              <input
                id={`${id}-j-${row.id}`}
                type="text"
                value={row.judul}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, judul: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-i-${row.id}`}>
                Informasi yang ingin ditampilkan
              </label>
              <textarea
                id={`${id}-i-${row.id}`}
                rows={2}
                value={row.informasi}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, informasi: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-k-${row.id}`}>
                Kelompok/pembanding yang dibutuhkan
              </label>
              <input
                id={`${id}-k-${row.id}`}
                type="text"
                value={row.kelompok}
                placeholder="Pisahkan dengan koma bila lebih dari satu"
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, kelompok: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus rancangan output ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), judul: '', informasi: '', kelompok: '', catatan: '' },
            ])
          }
        >
          + Tambahkan rancangan output
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableSchedule') {
    const rows: GuidedScheduleRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'kegiatan' in x,
        ) as GuidedScheduleRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), kegiatan: '', mulai: '', selesai: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-keg-${row.id}`}>
                Kegiatan
              </label>
              <input
                id={`${id}-keg-${row.id}`}
                type="text"
                value={row.kegiatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, kegiatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-m-${row.id}`}>
                    Mulai
                  </label>
                  <input
                    id={`${id}-m-${row.id}`}
                    type="date"
                    value={row.mulai}
                    onChange={(e) =>
                      onChange(
                        list.map((r, i) => (i === idx ? { ...r, mulai: e.target.value } : r)),
                      )
                    }
                    className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-s-${row.id}`}>
                    Selesai
                  </label>
                  <input
                    id={`${id}-s-${row.id}`}
                    type="date"
                    value={row.selesai}
                    onChange={(e) =>
                      onChange(
                        list.map((r, i) => (i === idx ? { ...r, selesai: e.target.value } : r)),
                      )
                    }
                    className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                  />
                </div>
              </div>
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus kegiatan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), kegiatan: '', mulai: '', selesai: '', catatan: '' },
            ])
          }
        >
          + Tambah kegiatan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableRows') {
    const columns = field.columns ?? []
    const blankRow = (): GuidedGenericRow =>
      Object.fromEntries([['id', newId()], ...columns.map((c) => [c.key, ''])]) as GuidedGenericRow
    const rows: GuidedGenericRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'id' in x,
        ) as GuidedGenericRow[])
      : []
    const list = rows.length ? rows : [blankRow()]
    const rowNoun = field.addLabel?.replace(/^\+\s*Tambah\s*/i, '') || 'baris'
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="space-y-2 rounded-xl border border-border/70 p-3">
              {columns.map((col) => {
                const inputId = `${id}-${col.key}-${row.id}`
                const cell = typeof row[col.key] === 'string' ? row[col.key] : ''
                const update = (next: string) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, [col.key]: next } : r)))
                return (
                  <div key={col.key}>
                    <label className="mb-1 block text-[11px] text-ink-600" htmlFor={inputId}>
                      {col.label}
                    </label>
                    {col.multiline ? (
                      <textarea
                        id={inputId}
                        rows={2}
                        value={cell}
                        placeholder={col.placeholder}
                        onChange={(e) => update(e.target.value)}
                        className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                      />
                    ) : (
                      <input
                        id={inputId}
                        type="text"
                        value={cell}
                        placeholder={col.placeholder}
                        onChange={(e) => update(e.target.value)}
                        className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                      />
                    )}
                  </div>
                )
              })}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={list.length <= 1}
                aria-label={`Hapus ${rowNoun} ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() => onChange([...list, blankRow()])}
        >
          {field.addLabel ?? '+ Tambah baris'}
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableSop') {
    const rows: GuidedSopRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x,
        ) as GuidedSopRow[])
      : []
    const list = rows.length ? rows : [{ id: newId(), nama: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama SOP
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus SOP ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() => onChange([...list, { id: newId(), nama: '', catatan: '' }])}
        >
          + Tambah SOP
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableValidation') {
    const rows: GuidedValidationRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x && 'kondisi' in x,
        ) as GuidedValidationRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), nama: '', kondisi: '', tindakan: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama pemeriksaan
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-k-${row.id}`}>
                Kondisi yang diperiksa
              </label>
              <textarea
                id={`${id}-k-${row.id}`}
                rows={2}
                value={row.kondisi}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, kondisi: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-t-${row.id}`}>
                Tindakan jika tidak sesuai
              </label>
              <textarea
                id={`${id}-t-${row.id}`}
                rows={2}
                value={row.tindakan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, tindakan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus pemeriksaan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), nama: '', kondisi: '', tindakan: '', catatan: '' },
            ])
          }
        >
          + Tambah pemeriksaan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableWorkflow') {
    const rows: GuidedWorkflowRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'kegiatan' in x && 'pelaksana' in x,
        ) as GuidedWorkflowRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), kegiatan: '', pelaksana: '', hasil: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-k-${row.id}`}>
                Kegiatan
              </label>
              <input
                id={`${id}-k-${row.id}`}
                type="text"
                value={row.kegiatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, kegiatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-p-${row.id}`}>
                Pelaksana/peran
              </label>
              <input
                id={`${id}-p-${row.id}`}
                type="text"
                value={row.pelaksana}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, pelaksana: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-h-${row.id}`}>
                Hasil yang diharapkan
              </label>
              <input
                id={`${id}-h-${row.id}`}
                type="text"
                value={row.hasil}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, hasil: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus kegiatan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), kegiatan: '', pelaksana: '', hasil: '', catatan: '' },
            ])
          }
        >
          + Tambah kegiatan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableBuildTabulation') {
    const rows: GuidedBuildTabulationRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x && 'dataDigunakan' in x,
        ) as GuidedBuildTabulationRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), nama: '', dataDigunakan: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama tabel/output
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-d-${row.id}`}>
                Data yang digunakan
              </label>
              <textarea
                id={`${id}-d-${row.id}`}
                rows={2}
                value={row.dataDigunakan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) =>
                      i === idx ? { ...r, dataDigunakan: e.target.value } : r,
                    ),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan aturan tabulasi
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus tabel ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), nama: '', dataDigunakan: '', catatan: '' }])
          }
        >
          + Tambah tabel/output
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableRole') {
    const rows: GuidedRoleRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'peran' in x && 'tugas' in x,
        ) as GuidedRoleRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), peran: '', tugas: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-p-${row.id}`}>
                Peran
              </label>
              <input
                id={`${id}-p-${row.id}`}
                type="text"
                value={row.peran}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, peran: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-t-${row.id}`}>
                Tugas
              </label>
              <textarea
                id={`${id}-t-${row.id}`}
                rows={2}
                value={row.tugas}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, tugas: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus peran ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), peran: '', tugas: '', catatan: '' }])
          }
        >
          + Tambah peran
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableMonitoring') {
    const rows: GuidedMonitoringRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'hal' in x && 'cara' in x,
        ) as GuidedMonitoringRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), hal: '', cara: '', tindakLanjut: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-h-${row.id}`}>
                Hal yang perlu dipantau
              </label>
              <input
                id={`${id}-h-${row.id}`}
                type="text"
                value={row.hal}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, hal: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Cara memeriksa
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.cara}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, cara: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-t-${row.id}`}>
                Tindak lanjut jika ada masalah
              </label>
              <textarea
                id={`${id}-t-${row.id}`}
                rows={2}
                value={row.tindakLanjut}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) =>
                      i === idx ? { ...r, tindakLanjut: e.target.value } : r,
                    ),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus butir pemantauan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), hal: '', cara: '', tindakLanjut: '' }])
          }
        >
          + Tambah butir pemantauan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableSource') {
    const rows: GuidedSourceRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x && 'keterangan' in x,
        ) as GuidedSourceRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), nama: '', keterangan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama sumber
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-k-${row.id}`}>
                Keterangan
              </label>
              <textarea
                id={`${id}-k-${row.id}`}
                rows={2}
                value={row.keterangan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, keterangan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus sumber ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() => onChange([...list, { id: newId(), nama: '', keterangan: '' }])}
        >
          + Tambah sumber
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableCoding') {
    const rows: GuidedCodingRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'kode' in x && 'nilai' in x,
        ) as GuidedCodingRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), kode: '', nilai: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {/* Mobile-first stacked cards; desktop compact table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/80 text-left text-[11px] uppercase tracking-wide text-ink-600">
                <th scope="col" className="px-2 py-2 font-semibold">
                  Kode
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  Nilai/kategori
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  Catatan
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, idx) => (
                <tr key={row.id} className="border-b border-border/50 align-top">
                  <td className="px-2 py-2">
                    <label className="sr-only" htmlFor={`${id}-kode-d-${row.id}`}>
                      Kode baris {idx + 1}
                    </label>
                    <input
                      id={`${id}-kode-d-${row.id}`}
                      type="text"
                      value={row.kode}
                      onChange={(e) =>
                        onChange(
                          list.map((r, i) => (i === idx ? { ...r, kode: e.target.value } : r)),
                        )
                      }
                      className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <label className="sr-only" htmlFor={`${id}-nilai-d-${row.id}`}>
                      Nilai/kategori baris {idx + 1}
                    </label>
                    <input
                      id={`${id}-nilai-d-${row.id}`}
                      type="text"
                      value={row.nilai}
                      onChange={(e) =>
                        onChange(
                          list.map((r, i) => (i === idx ? { ...r, nilai: e.target.value } : r)),
                        )
                      }
                      className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <label className="sr-only" htmlFor={`${id}-cat-d-${row.id}`}>
                      Catatan baris {idx + 1}
                    </label>
                    <input
                      id={`${id}-cat-d-${row.id}`}
                      type="text"
                      value={row.catatan}
                      onChange={(e) =>
                        onChange(
                          list.map((r, i) =>
                            i === idx ? { ...r, catatan: e.target.value } : r,
                          ),
                        )
                      }
                      className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={list.length <= 1}
                      aria-label={`Hapus baris coding ${idx + 1}`}
                      onClick={() => onChange(list.filter((_, i) => i !== idx))}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-3 sm:hidden">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-kode-${row.id}`}>
                Kode
              </label>
              <input
                id={`${id}-kode-${row.id}`}
                type="text"
                value={row.kode}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, kode: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label
                className="mb-1 mt-2 block text-[11px] text-ink-600"
                htmlFor={`${id}-nilai-${row.id}`}
              >
                Nilai/kategori
              </label>
              <input
                id={`${id}-nilai-${row.id}`}
                type="text"
                value={row.nilai}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nilai: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label
                className="mb-1 mt-2 block text-[11px] text-ink-600"
                htmlFor={`${id}-cat-${row.id}`}
              >
                Catatan
              </label>
              <input
                id={`${id}-cat-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus baris coding ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), kode: '', nilai: '', catatan: '' }])
          }
        >
          + Tambah baris coding
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableAnalyseOutput') {
    const rows: GuidedAnalyseOutputRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x && 'jenis' in x,
        ) as GuidedAnalyseOutputRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), nama: '', jenis: '', apaDilihat: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama output
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-j-${row.id}`}>
                Jenis output
              </label>
              <select
                id={`${id}-j-${row.id}`}
                value={row.jenis}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, jenis: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              >
                <option value="">Pilih…</option>
                <option value="tabel">Tabel</option>
                <option value="indikator">Indikator</option>
                <option value="grafik">Grafik</option>
                <option value="ringkasan">Ringkasan</option>
                <option value="lainnya">Lainnya</option>
              </select>
              <p className="mt-1 text-[10px] text-ink-500">Pilihan kerja StatPlan</p>
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-a-${row.id}`}>
                Apa yang ingin dilihat?
              </label>
              <textarea
                id={`${id}-a-${row.id}`}
                rows={2}
                value={row.apaDilihat}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, apaDilihat: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                placeholder="Tanpa angka hasil fiktif…"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <input
                id={`${id}-c-${row.id}`}
                type="text"
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus output awal ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), nama: '', jenis: '', apaDilihat: '', catatan: '' },
            ])
          }
        >
          + Tambah output awal
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableReview') {
    const rows: GuidedReviewRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'hal' in x && 'mengapa' in x,
        ) as GuidedReviewRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), hal: '', mengapa: '', tindakan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-h-${row.id}`}>
                Apa yang perlu diperiksa?
              </label>
              <input
                id={`${id}-h-${row.id}`}
                type="text"
                value={row.hal}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, hal: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-m-${row.id}`}>
                Mengapa perlu diperiksa?
              </label>
              <textarea
                id={`${id}-m-${row.id}`}
                rows={2}
                value={row.mengapa}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, mengapa: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-t-${row.id}`}>
                Tindakan jika ada masalah
              </label>
              <textarea
                id={`${id}-t-${row.id}`}
                rows={2}
                value={row.tindakan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, tindakan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus pemeriksaan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([...list, { id: newId(), hal: '', mengapa: '', tindakan: '' }])
          }
        >
          + Tambah pemeriksaan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableFinalOutput') {
    const rows: GuidedFinalOutputRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'nama' in x && 'pengguna' in x,
        ) as GuidedFinalOutputRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), nama: '', pengguna: '', bentuk: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-n-${row.id}`}>
                Nama output
              </label>
              <input
                id={`${id}-n-${row.id}`}
                type="text"
                value={row.nama}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, nama: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-p-${row.id}`}>
                Siapa pengguna output?
              </label>
              <input
                id={`${id}-p-${row.id}`}
                type="text"
                value={row.pengguna}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, pengguna: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-b-${row.id}`}>
                Bentuk penyajian
              </label>
              <input
                id={`${id}-b-${row.id}`}
                type="text"
                value={row.bentuk}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, bentuk: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan finalisasi
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus output akhir ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), nama: '', pengguna: '', bentuk: '', catatan: '' },
            ])
          }
        >
          + Tambah output akhir
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableAspect') {
    const rows: GuidedAspectRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'aspek' in x,
        ) as GuidedAspectRow[])
      : []
    const list = rows.length
      ? rows
      : [{ id: newId(), aspek: '', alasan: '', informasi: '', catatan: '' }]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-a-${row.id}`}>
                Aspek yang dievaluasi
              </label>
              <input
                id={`${id}-a-${row.id}`}
                type="text"
                value={row.aspek}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, aspek: e.target.value } : r)))
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-al-${row.id}`}>
                Alasan
              </label>
              <textarea
                id={`${id}-al-${row.id}`}
                rows={2}
                value={row.alasan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, alasan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-i-${row.id}`}>
                Informasi yang diperlukan
              </label>
              <textarea
                id={`${id}-i-${row.id}`}
                rows={2}
                value={row.informasi}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, informasi: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus aspek ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              { id: newId(), aspek: '', alasan: '', informasi: '', catatan: '' },
            ])
          }
        >
          + Tambah aspek
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableImprovement') {
    const rows: GuidedImprovementRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'masalah' in x,
        ) as GuidedImprovementRow[])
      : []
    const list = rows.length
      ? rows
      : [
          {
            id: newId(),
            masalah: '',
            usulan: '',
            prioritas: '',
            penanggungJawab: '',
            catatan: '',
          },
        ]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-m-${row.id}`}>
                Masalah / temuan
              </label>
              <textarea
                id={`${id}-m-${row.id}`}
                rows={2}
                value={row.masalah}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, masalah: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-u-${row.id}`}>
                Usulan perbaikan
              </label>
              <textarea
                id={`${id}-u-${row.id}`}
                rows={2}
                value={row.usulan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, usulan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-pr-${row.id}`}>
                Prioritas (pilihan Anda)
              </label>
              <select
                id={`${id}-pr-${row.id}`}
                value={row.prioritas}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, prioritas: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              >
                <option value="">Pilih…</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-pj-${row.id}`}>
                Penanggung jawab
              </label>
              <input
                id={`${id}-pj-${row.id}`}
                type="text"
                value={row.penanggungJawab}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) =>
                      i === idx ? { ...r, penanggungJawab: e.target.value } : r,
                    ),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus usulan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              {
                id: newId(),
                masalah: '',
                usulan: '',
                prioritas: '',
                penanggungJawab: '',
                catatan: '',
              },
            ])
          }
        >
          + Tambah usulan perbaikan
        </Button>
      </div>
    )
  }

  if (field.kind === 'repeatableActionPlan') {
    const rows: GuidedActionPlanRow[] = Array.isArray(value)
      ? (value.filter(
          (x) => typeof x === 'object' && x !== null && 'tindakan' in x,
        ) as GuidedActionPlanRow[])
      : []
    const list = rows.length
      ? rows
      : [
          {
            id: newId(),
            tindakan: '',
            tujuan: '',
            penanggungJawab: '',
            targetWaktu: '',
            statusRencana: '',
            catatan: '',
          },
        ]
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-900">
          {field.label}
          {field.required ? <span className="text-danger"> *</span> : null}
        </p>
        {field.hint ? <p className="mb-2 text-[11px] text-ink-500">{field.hint}</p> : null}
        <ul className="space-y-3">
          {list.map((row, idx) => (
            <li key={row.id} className="rounded-xl border border-border/70 p-3">
              <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-t-${row.id}`}>
                Tindakan
              </label>
              <textarea
                id={`${id}-t-${row.id}`}
                rows={2}
                value={row.tindakan}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, tindakan: e.target.value } : r)),
                  )
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-tj-${row.id}`}>
                Tujuan
              </label>
              <textarea
                id={`${id}-tj-${row.id}`}
                rows={2}
                value={row.tujuan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, tujuan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-pj-${row.id}`}>
                Penanggung jawab
              </label>
              <input
                id={`${id}-pj-${row.id}`}
                type="text"
                value={row.penanggungJawab}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) =>
                      i === idx ? { ...r, penanggungJawab: e.target.value } : r,
                    ),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-tw-${row.id}`}>
                Target waktu (rencana — bukan tanggal selesai)
              </label>
              <input
                id={`${id}-tw-${row.id}`}
                type="date"
                value={row.targetWaktu}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) => (i === idx ? { ...r, targetWaktu: e.target.value } : r)),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              />
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-sr-${row.id}`}>
                Status rencana
              </label>
              <select
                id={`${id}-sr-${row.id}`}
                value={row.statusRencana}
                onChange={(e) =>
                  onChange(
                    list.map((r, i) =>
                      i === idx ? { ...r, statusRencana: e.target.value } : r,
                    ),
                  )
                }
                className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
              >
                <option value="">Pilih…</option>
                <option value="Belum direncanakan">Belum direncanakan</option>
                <option value="Direncanakan">Direncanakan</option>
                <option value="Sedang disiapkan">Sedang disiapkan</option>
              </select>
              <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-c-${row.id}`}>
                Catatan
              </label>
              <textarea
                id={`${id}-c-${row.id}`}
                rows={2}
                value={row.catatan}
                onChange={(e) =>
                  onChange(list.map((r, i) => (i === idx ? { ...r, catatan: e.target.value } : r)))
                }
                className="focus-ring w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2"
                disabled={list.length <= 1}
                aria-label={`Hapus tindakan ${idx + 1}`}
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
              >
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            onChange([
              ...list,
              {
                id: newId(),
                tindakan: '',
                tujuan: '',
                penanggungJawab: '',
                targetWaktu: '',
                statusRencana: '',
                catatan: '',
              },
            ])
          }
        >
          + Tambah tindakan rencana
        </Button>
      </div>
    )
  }

  // repeatableOutput (default structured list)
  const rows: GuidedOutputRow[] = Array.isArray(value)
    ? (value.filter((x) => typeof x === 'object' && x !== null && 'name' in x) as GuidedOutputRow[])
    : []
  const list = rows.length
    ? rows
    : [{ id: newId(), name: '', bentuk: '', keterangan: '' }]

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-900">
        {field.label}
        {field.required ? <span className="text-danger"> *</span> : null}
      </p>
      <ul className="space-y-3">
        {list.map((row, idx) => (
          <li key={row.id} className="rounded-xl border border-border/70 p-3">
            <label className="mb-1 block text-[11px] text-ink-600" htmlFor={`${id}-name-${row.id}`}>
              Nama data/output
            </label>
            <input
              id={`${id}-name-${row.id}`}
              type="text"
              value={row.name}
              onChange={(e) => {
                const next = list.map((r, i) =>
                  i === idx ? { ...r, name: e.target.value } : r,
                )
                onChange(next)
              }}
              className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
            />
            <label className="mb-1 mt-2 block text-[11px] text-ink-600" htmlFor={`${id}-bentuk-${row.id}`}>
              Bentuk
            </label>
            <select
              id={`${id}-bentuk-${row.id}`}
              value={row.bentuk}
              onChange={(e) => {
                const next = list.map((r, i) =>
                  i === idx ? { ...r, bentuk: e.target.value } : r,
                )
                onChange(next)
              }}
              className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
            >
              <option value="">Pilih…</option>
              <option value="tabel">Tabel</option>
              <option value="indikator">Indikator</option>
              <option value="dataset">Dataset</option>
              <option value="ringkasan">Ringkasan</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <label
              className="mb-1 mt-2 block text-[11px] text-ink-600"
              htmlFor={`${id}-ket-${row.id}`}
            >
              Keterangan
            </label>
            <input
              id={`${id}-ket-${row.id}`}
              type="text"
              value={row.keterangan}
              onChange={(e) => {
                const next = list.map((r, i) =>
                  i === idx ? { ...r, keterangan: e.target.value } : r,
                )
                onChange(next)
              }}
              className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2"
              disabled={list.length <= 1}
              onClick={() => onChange(list.filter((_, i) => i !== idx))}
            >
              Hapus baris
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="mt-2"
        onClick={() =>
          onChange([...list, { id: newId(), name: '', bentuk: '', keterangan: '' }])
        }
      >
        + Tambah data/output
      </Button>
    </div>
  )
}

export function GuidedMaterialsSummary({
  rows,
  onContinue,
  title = 'Bahan Anda',
}: {
  rows: { id: string; title: string; status: ReturnType<typeof computeDraftStatus> }[]
  onContinue: () => void
  title?: string
}) {
  return (
    <section
      className="rounded-2xl border border-border/80 bg-white px-4 py-4"
      aria-labelledby="bahan-summary-heading"
    >
      <h2 id="bahan-summary-heading" className="text-sm font-semibold text-ink-950">
        {title}
      </h2>
      <p className="mt-1 text-xs text-ink-500">
        Ringkasan persiapan draft — bukan kemajuan proyek resmi.
      </p>
      <ul className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 text-sm text-ink-800"
          >
            <span className="min-w-0 truncate">{row.title}</span>
            <GuidedDraftStatus status={row.status} compact className={cn('shrink-0')} />
          </li>
        ))}
      </ul>
      <Button type="button" variant="secondary" className="mt-4 w-full" onClick={onContinue}>
        Lanjutkan menyiapkan bahan
      </Button>
    </section>
  )
}
