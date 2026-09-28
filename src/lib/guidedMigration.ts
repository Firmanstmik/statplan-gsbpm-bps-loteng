/**
 * Guided session schema migration: v1 (48 positional cards, e.g. `process-5.4`)
 * → v2 (44 official GSBPM 5.2 subprocesses, e.g. `gsbpm-5.5`).
 *
 * Why an explicit map: v1 ids were positions, not official codes. `process-5.4`
 * was official 5.6 (now 5.5, see docs/claude-source-inventory.md), so reusing
 * ids would silently attach saved progress to the wrong subprocess.
 *
 * Rules
 * - Nothing is deleted: the complete v1 maps are archived under `legacy`.
 * - Drafts and evidence move to the new card that now teaches the same topic.
 * - "Sudah dipahami" carries over only when every *primary* source card was
 *   understood. New or substantially rewritten material starts un-ticked.
 * - Phase completion / unlock flags are untouched, so navigation never regresses.
 * - Keys that are not v1 card ids are kept as they are.
 */
import type {
  GuidedDraftValue,
  GuidedDraftValues,
  GuidedEvidenceStatus,
} from '@/content/guidedNeedPreparation'
import { SAMPLING_METHOD_OPTIONS } from '@/content/guidedDesignPreparation'

export const GUIDED_SCHEMA_VERSION = 2

type EvidenceState = { status: GuidedEvidenceStatus; note: string }
type Draft = { values: GuidedDraftValues; updatedAt: string }

export type GuidedLegacyArchive = {
  schemaVersion: 1
  archivedAt: string
  understood: Record<string, boolean>
  templateDrafts: Record<string, Draft>
  evidenceStates: Record<string, Record<string, EvidenceState>>
}

type CardMove = {
  from: string
  /** New card id, or null when the v1 card has no official counterpart (archived only). */
  to: string | null
  /** Understood carries over only if all primary sources of `to` were understood. */
  primary?: boolean
  /** Rename draft fields when moving (old id → new id). */
  fieldMap?: Record<string, string>
  /** Only move these draft fields (after renaming). */
  onlyFields?: string[]
  transform?: (values: GuidedDraftValues) => GuidedDraftValues
}

const SAMPLING_VALUES = new Set(SAMPLING_METHOD_OPTIONS.map((o) => o.value))

/** v1 design-2.4 stored the sampling method as free text; v2 uses the Hal. 21 list. */
function migrateSamplingMethod(values: GuidedDraftValues): GuidedDraftValues {
  const raw = values.metode_sampling
  if (typeof raw !== 'string' || !raw.trim() || SAMPLING_VALUES.has(raw)) return values
  const match = SAMPLING_METHOD_OPTIONS.find(
    (o) => o.value !== 'lainnya' && raw.toLowerCase().includes(o.label.split(' (')[0].toLowerCase()),
  )
  if (match) return { ...values, metode_sampling: match.value }
  return { ...values, metode_sampling: 'lainnya', metode_sampling_lain: raw }
}

export const GUIDED_V1_MOVES: CardMove[] = [
  { from: 'need-1.1', to: 'gsbpm-1.1', primary: true },
  { from: 'need-1.2', to: 'gsbpm-1.2', primary: true },
  { from: 'need-1.3', to: 'gsbpm-1.3', primary: true },
  // v1 1.4 taught outputs, not konsep-definisi. Its output list belongs to 1.3 (Hal. 13).
  { from: 'need-1.4', to: 'gsbpm-1.3', onlyFields: ['outputs'] },
  { from: 'need-1.5', to: 'gsbpm-1.5', primary: true },
  { from: 'need-1.6', to: 'gsbpm-1.6', primary: true },

  { from: 'design-2.1', to: 'gsbpm-2.1', primary: true },
  { from: 'design-2.2', to: 'gsbpm-2.2', primary: true },
  { from: 'design-2.3', to: 'gsbpm-2.3', primary: true },
  { from: 'design-2.4', to: 'gsbpm-2.4', primary: true, transform: migrateSamplingMethod },
  // Jadwal (v1 SP-R5) and SOP/rekomendasi (v1 SP-R6) are both official 2.6 (Hal. 23).
  { from: 'design-2.5', to: 'gsbpm-2.6', primary: true },
  { from: 'design-2.6', to: 'gsbpm-2.6', primary: true },

  { from: 'build-3.1', to: 'gsbpm-3.1', primary: true },
  { from: 'build-3.2', to: 'gsbpm-3.2', primary: true },
  { from: 'build-3.3', to: 'gsbpm-3.3', primary: true },
  { from: 'build-3.4', to: 'gsbpm-3.4', primary: true },
  { from: 'build-3.5', to: 'gsbpm-3.6', primary: true },
  { from: 'build-3.6', to: 'gsbpm-3.7' },

  { from: 'collect-4.1', to: 'gsbpm-4.1', primary: true },
  { from: 'collect-4.2', to: 'gsbpm-4.2', primary: true },
  { from: 'collect-4.3', to: 'gsbpm-4.3', primary: true },
  // Monitoring is part of official 4.3 (Hal. 35).
  { from: 'collect-4.4', to: 'gsbpm-4.3' },
  { from: 'collect-4.5', to: 'gsbpm-4.4', primary: true },
  { from: 'collect-4.6', to: null },

  { from: 'process-5.1', to: 'gsbpm-5.1', primary: true },
  { from: 'process-5.2', to: 'gsbpm-5.7', primary: true },
  { from: 'process-5.3', to: 'gsbpm-5.2', primary: true },
  { from: 'process-5.4', to: 'gsbpm-5.5', primary: true },
  { from: 'process-5.5', to: 'gsbpm-5.6', primary: true },
  { from: 'process-5.6', to: 'gsbpm-5.8' },

  { from: 'analyse-6.1', to: 'gsbpm-6.3', onlyFields: ['pertanyaan', 'informasi', 'catatan'] },
  { from: 'analyse-6.2', to: 'gsbpm-6.1', primary: true },
  { from: 'analyse-6.3', to: 'gsbpm-6.2', primary: true },
  { from: 'analyse-6.4', to: 'gsbpm-6.4', primary: true },
  { from: 'analyse-6.5', to: 'gsbpm-6.5', primary: true },
  { from: 'analyse-6.6', to: null },

  // v1 Disseminate labels pointed at the wrong official subprocesses.
  { from: 'disseminate-7.1', to: 'gsbpm-7.2', primary: true },
  { from: 'disseminate-7.2', to: 'gsbpm-7.3', primary: true },
  {
    from: 'disseminate-7.3',
    to: 'gsbpm-7.4',
    fieldMap: { pengguna_sasaran: 'sasaran', bentuk_penyajian: 'materi_pendukung' },
  },
  { from: 'disseminate-7.4', to: 'gsbpm-7.4', primary: true },
  { from: 'disseminate-7.5', to: 'gsbpm-7.5', primary: true },
  { from: 'disseminate-7.6', to: null },

  { from: 'evaluate-8.1', to: 'gsbpm-8.1', primary: true },
  { from: 'evaluate-8.2', to: 'gsbpm-8.1' },
  { from: 'evaluate-8.3', to: 'gsbpm-8.2', primary: true },
  { from: 'evaluate-8.4', to: 'gsbpm-8.2' },
  { from: 'evaluate-8.5', to: 'gsbpm-8.3', primary: true },
  { from: 'evaluate-8.6', to: null },
]

const MOVE_BY_FROM = new Map(GUIDED_V1_MOVES.map((m) => [m.from, m]))

export function isLegacyCardId(id: string): boolean {
  return MOVE_BY_FROM.has(id)
}

function isEmpty(v: GuidedDraftValue | undefined): boolean {
  if (v == null) return true
  if (typeof v === 'string') return v.trim() === ''
  return Array.isArray(v) && v.length === 0
}

/** Merge without losing text: existing non-empty values win; differing text is appended. */
function mergeValues(into: GuidedDraftValues, add: GuidedDraftValues): GuidedDraftValues {
  const out: GuidedDraftValues = { ...into }
  for (const [key, value] of Object.entries(add)) {
    const cur = out[key]
    if (isEmpty(cur)) {
      out[key] = value
    } else if (isEmpty(value)) {
      continue
    } else if (typeof cur === 'string' && typeof value === 'string') {
      if (cur.trim() !== value.trim()) out[key] = `${cur}\n\n${value}`
    } else if (Array.isArray(cur) && Array.isArray(value)) {
      out[key] = [...cur, ...value] as GuidedDraftValue
    }
  }
  return out
}

const STATUS_RANK: Record<GuidedEvidenceStatus, number> = { belum: 0, sedang: 1, sudah: 2 }

function mergeEvidence(
  into: Record<string, EvidenceState>,
  add: Record<string, EvidenceState>,
): Record<string, EvidenceState> {
  const out = { ...into }
  for (const [id, next] of Object.entries(add)) {
    const cur = out[id]
    if (!cur) {
      out[id] = next
      continue
    }
    const status = STATUS_RANK[next.status] > STATUS_RANK[cur.status] ? next.status : cur.status
    const note =
      cur.note.trim() && next.note.trim() && cur.note.trim() !== next.note.trim()
        ? `${cur.note}\n\n${next.note}`
        : cur.note || next.note
    out[id] = { status, note }
  }
  return out
}

function moveDraftValues(move: CardMove, values: GuidedDraftValues): GuidedDraftValues {
  let out: GuidedDraftValues = {}
  for (const [key, value] of Object.entries(values)) {
    out[move.fieldMap?.[key] ?? key] = value
  }
  if (move.onlyFields) {
    out = Object.fromEntries(Object.entries(out).filter(([k]) => move.onlyFields!.includes(k)))
  }
  return move.transform ? move.transform(out) : out
}

type MigratableMaps = {
  understood: Record<string, boolean>
  templateDrafts: Record<string, Draft>
  evidenceStates: Record<string, Record<string, EvidenceState>>
}

export type GuidedMigrationResult = MigratableMaps & {
  legacy: GuidedLegacyArchive | undefined
}

/**
 * Pure v1 → v2 transform of the per-card maps. Returns `legacy: undefined`
 * when the input holds no v1 ids (e.g. a brand-new session).
 */
export function migrateGuidedMapsV1toV2(input: MigratableMaps, now: string): GuidedMigrationResult {
  const hasLegacy = [
    ...Object.keys(input.understood),
    ...Object.keys(input.templateDrafts),
    ...Object.keys(input.evidenceStates),
  ].some(isLegacyCardId)
  if (!hasLegacy) return { ...input, legacy: undefined }

  const understood: Record<string, boolean> = {}
  const templateDrafts: Record<string, Draft> = {}
  const evidenceStates: Record<string, Record<string, EvidenceState>> = {}

  // Keep anything that is not a v1 card id (already-v2 keys, unknown future keys).
  for (const [k, v] of Object.entries(input.understood)) if (!isLegacyCardId(k)) understood[k] = v
  for (const [k, v] of Object.entries(input.templateDrafts)) if (!isLegacyCardId(k)) templateDrafts[k] = v
  for (const [k, v] of Object.entries(input.evidenceStates)) if (!isLegacyCardId(k)) evidenceStates[k] = v

  for (const move of GUIDED_V1_MOVES) {
    if (!move.to) continue
    const draft = input.templateDrafts[move.from]
    if (draft) {
      const moved = moveDraftValues(move, draft.values ?? {})
      if (Object.keys(moved).length > 0) {
        const prev = templateDrafts[move.to]
        templateDrafts[move.to] = {
          values: mergeValues(prev?.values ?? {}, moved),
          updatedAt:
            prev && prev.updatedAt > draft.updatedAt ? prev.updatedAt : draft.updatedAt,
        }
      }
    }
    const ev = input.evidenceStates[move.from]
    if (ev) evidenceStates[move.to] = mergeEvidence(evidenceStates[move.to] ?? {}, ev)
  }

  const primariesByTarget = new Map<string, string[]>()
  for (const move of GUIDED_V1_MOVES) {
    if (!move.to || !move.primary) continue
    primariesByTarget.set(move.to, [...(primariesByTarget.get(move.to) ?? []), move.from])
  }
  for (const [target, sources] of primariesByTarget) {
    if (understood[target]) continue
    if (sources.every((s) => input.understood[s])) understood[target] = true
  }

  const pick = <T,>(rec: Record<string, T>) =>
    Object.fromEntries(Object.entries(rec).filter(([k]) => isLegacyCardId(k)))

  return {
    understood,
    templateDrafts,
    evidenceStates,
    legacy: {
      schemaVersion: 1,
      archivedAt: now,
      understood: pick(input.understood),
      templateDrafts: pick(input.templateDrafts),
      evidenceStates: pick(input.evidenceStates),
    },
  }
}
