/**
 * Slice 2 — Timeline-first planning helpers (presentation + persistence bridge).
 * Does NOT modify GSBPM definitions or claim official BPS durations.
 *
 * Persistence: maps calendar dates → existing TimelineItem { startWeek, endWeek }
 * relative to project start (week 1 = first 7 days). Domain types unchanged.
 */
import { GSBPM_PHASES } from '@/domain/gsbpm'
import type { GsbpmPhaseId, TimelineItem } from '@/domain/types'

export type PhaseDatePlan = {
  phaseId: GsbpmPhaseId
  title: string
  purpose: string
  startISO: string
  endISO: string
}

/** Deterministic weights for initial allocation across 8 phases. */
export const PHASE_PLAN_WEIGHTS: { phaseId: GsbpmPhaseId; weight: number }[] = [
  { phaseId: 'specify_need', weight: 2 },
  { phaseId: 'design', weight: 2 },
  { phaseId: 'build', weight: 2 },
  { phaseId: 'collect', weight: 3 },
  { phaseId: 'process', weight: 2 },
  { phaseId: 'analyse', weight: 2 },
  { phaseId: 'disseminate', weight: 1 },
  { phaseId: 'evaluate', weight: 1 },
]

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

export function parseISODate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0))
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m! - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null
  }
  return dt
}

export function toISODate(dt: Date): string {
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDaysUTC(dt: Date, days: number): Date {
  const next = new Date(dt.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

/** Inclusive day count between two ISO dates. */
export function inclusiveDayCount(startISO: string, endISO: string): number {
  const a = parseISODate(startISO)
  const b = parseISODate(endISO)
  if (!a || !b) return 0
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000)
  return diff + 1
}

export function formatDateID(iso: string): string {
  const dt = parseISODate(iso)
  if (!dt) return iso
  return `${dt.getUTCDate()} ${MONTHS_ID[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

export function formatDateRangeID(startISO: string, endISO: string): string {
  return `${formatDateID(startISO)} – ${formatDateRangeEnd(endISO)}`
}

function formatDateRangeEnd(iso: string): string {
  const dt = parseISODate(iso)
  if (!dt) return iso
  return `${dt.getUTCDate()} ${MONTHS_ID[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

export function addMonthsISO(startISO: string, months: number): string {
  const dt = parseISODate(startISO)
  if (!dt) return startISO
  const y = dt.getUTCFullYear()
  const m = dt.getUTCMonth() + months
  const day = dt.getUTCDate()
  const end = new Date(Date.UTC(y, m, 1, 12, 0, 0))
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate()
  end.setUTCDate(Math.min(day, lastDay))
  // Preset "N bulan" → end is day before N months later anniversary, or same calendar end
  // Use: start + N months - 1 day for inclusive range that spans ~N months
  return toISODate(addDaysUTC(end, -1))
}

export type DateRangeValidation =
  | { ok: true }
  | { ok: false; message: string }

export function validateProjectDateRange(
  startISO: string,
  endISO: string,
): DateRangeValidation {
  if (!startISO) return { ok: false, message: 'Tanggal mulai wajib diisi.' }
  if (!endISO) return { ok: false, message: 'Tanggal selesai wajib diisi.' }
  const a = parseISODate(startISO)
  const b = parseISODate(endISO)
  if (!a) return { ok: false, message: 'Tanggal mulai tidak valid.' }
  if (!b) return { ok: false, message: 'Tanggal selesai tidak valid.' }
  if (b.getTime() < a.getTime()) {
    return { ok: false, message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.' }
  }
  return { ok: true }
}

export function validatePhaseWithinProject(
  phase: PhaseDatePlan,
  projectStartISO: string,
  projectEndISO: string,
): DateRangeValidation {
  const base = validateProjectDateRange(phase.startISO, phase.endISO)
  if (!base.ok) return base
  if (phase.startISO < projectStartISO) {
    return { ok: false, message: 'Tanggal mulai tahap tidak boleh sebelum tanggal mulai kegiatan.' }
  }
  if (phase.endISO > projectEndISO) {
    return { ok: false, message: 'Tanggal selesai tahap tidak boleh setelah tanggal selesai kegiatan.' }
  }
  return { ok: true }
}

/**
 * Largest-remainder allocation of inclusive days by weight.
 * First phase starts at projectStart; last phase ends at projectEnd.
 */
export function allocatePhaseDates(
  startISO: string,
  endISO: string,
): PhaseDatePlan[] {
  const validation = validateProjectDateRange(startISO, endISO)
  if (!validation.ok) return []

  const totalDays = inclusiveDayCount(startISO, endISO)
  const weights = PHASE_PLAN_WEIGHTS
  const weightSum = weights.reduce((s, w) => s + w.weight, 0)

  // Raw proportional lengths (at least 1 when totalDays >= phases)
  const raw = weights.map((w) => (w.weight / weightSum) * totalDays)
  const floors = raw.map((r) => Math.max(0, Math.floor(r)))
  let assigned = floors.reduce((s, n) => s + n, 0)
  const remainders = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)

  const lengths = [...floors]
  let idx = 0
  while (assigned < totalDays && idx < remainders.length * 3) {
    const target = remainders[idx % remainders.length]!.i
    lengths[target]! += 1
    assigned += 1
    idx += 1
  }
  // If still short (tiny ranges), grow last phases
  while (assigned < totalDays) {
    lengths[lengths.length - 1]! += 1
    assigned += 1
  }
  // If over (shouldn't), shrink from largest > 1
  while (assigned > totalDays) {
    let maxI = lengths.findIndex((l) => l > 1)
    if (maxI < 0) break
    for (let i = 0; i < lengths.length; i++) {
      if (lengths[i]! > lengths[maxI]!) maxI = i
    }
    if (lengths[maxI]! <= 1) break
    lengths[maxI]! -= 1
    assigned -= 1
  }

  // Ensure every phase gets at least 1 day when possible
  if (totalDays >= weights.length) {
    for (let i = 0; i < lengths.length; i++) {
      if (lengths[i]! < 1) {
        let donor = lengths.findIndex((l) => l > 1)
        for (let j = 0; j < lengths.length; j++) {
          if (lengths[j]! > (lengths[donor] ?? 0)) donor = j
        }
        if (donor >= 0 && lengths[donor]! > 1) {
          lengths[donor]! -= 1
          lengths[i] = 1
        }
      }
    }
  }

  const start = parseISODate(startISO)!
  const plans: PhaseDatePlan[] = []
  let cursor = 0
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i]!
    const phase = GSBPM_PHASES.find((p) => p.id === w.phaseId)!
    let len = Math.max(1, lengths[i] || 1)
    if (i === weights.length - 1) {
      // Consume remaining days
      len = Math.max(1, totalDays - cursor)
    }
    if (cursor >= totalDays) {
      // Collapse onto last day
      const lastISO = endISO
      plans.push({
        phaseId: w.phaseId,
        title: phase.titleId,
        purpose: phase.purpose,
        startISO: lastISO,
        endISO: lastISO,
      })
      continue
    }
    const phaseStart = addDaysUTC(start, cursor)
    const phaseEnd = addDaysUTC(start, Math.min(totalDays - 1, cursor + len - 1))
    plans.push({
      phaseId: w.phaseId,
      title: phase.titleId,
      purpose: phase.purpose,
      startISO: toISODate(phaseStart),
      endISO: toISODate(phaseEnd),
    })
    cursor += len
  }

  // Force first/last anchors
  if (plans.length) {
    plans[0]!.startISO = startISO
    plans[plans.length - 1]!.endISO = endISO
  }
  return plans
}

/** Map calendar plan → legacy week timeline for persistence. */
export function phasePlanToTimelineItems(plans: PhaseDatePlan[]): TimelineItem[] {
  if (!plans.length) return []
  const projectStart = plans[0]!.startISO
  const startDt = parseISODate(projectStart)!

  return plans.map((p, i) => {
    const s = parseISODate(p.startISO)!
    const e = parseISODate(p.endISO)!
    const startWeek =
      Math.floor(Math.round((s.getTime() - startDt.getTime()) / 86_400_000) / 7) + 1
    const endWeek =
      Math.floor(Math.round((e.getTime() - startDt.getTime()) / 86_400_000) / 7) + 1
    return {
      id: `guided-plan-${i}-${p.phaseId}`,
      title: p.title,
      phaseId: p.phaseId,
      startWeek: Math.max(1, startWeek),
      endWeek: Math.max(startWeek, endWeek),
    }
  })
}

export function todayISO(): string {
  const n = new Date()
  return toISODate(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), 12)))
}

export const DURATION_PRESET_MONTHS = [
  { months: 1, label: '1 bulan' },
  { months: 2, label: '2 bulan' },
  { months: 3, label: '3 bulan' },
  { months: 6, label: '6 bulan' },
] as const
