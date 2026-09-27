/**
 * Guided Mode session state — separate from Zustand project persistence.
 * Slice 3: understanding / unlock
 * Slice 4: template drafts + evidence preparation
 * Never drives checklist / computeProjectProgress / canExport.
 */
import type { GsbpmPhaseId } from '@/domain/types'
import type { PhaseDatePlan } from '@/content/planningTimeline'
import type {
  GuidedDraftValues,
  GuidedEvidenceStatus,
} from '@/content/guidedNeedPreparation'

const STORAGE_KEY = 'statplan-guided-sessions-v1'

export type GuidedEvidenceItemState = {
  status: GuidedEvidenceStatus
  note: string
}

export type GuidedCardDraft = {
  values: GuidedDraftValues
  updatedAt: string
}

export type GuidedSession = {
  projectId: string
  startISO: string
  endISO: string
  phasePlan: PhaseDatePlan[]
  /** Card ids marked "Sudah dipahami" */
  understood: Record<string, boolean>
  /** Phases completed in guided learning (educational) */
  completedPhases: GsbpmPhaseId[]
  /** Phases unlocked for guided navigation */
  unlockedPhases: GsbpmPhaseId[]
  /** Slice 4 — template drafts keyed by cardId */
  templateDrafts: Record<string, GuidedCardDraft>
  /** Slice 4 — evidence keyed by cardId → evidenceItemId */
  evidenceStates: Record<string, Record<string, GuidedEvidenceItemState>>
  updatedAt: string
}

type Store = Record<string, GuidedSession>

const memoryStore: { value: Store } = { value: {} }

function canUseLocalStorage(): boolean {
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage !== null &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function' &&
      typeof localStorage.removeItem === 'function'
    )
  } catch {
    return false
  }
}

function normalizeSession(raw: Partial<GuidedSession> & { projectId: string }): GuidedSession {
  return {
    projectId: raw.projectId,
    startISO: raw.startISO ?? '',
    endISO: raw.endISO ?? '',
    phasePlan: raw.phasePlan ?? [],
    understood: raw.understood ?? {},
    completedPhases: raw.completedPhases ?? [],
    unlockedPhases: raw.unlockedPhases?.length ? raw.unlockedPhases : ['specify_need'],
    templateDrafts: raw.templateDrafts ?? {},
    evidenceStates: raw.evidenceStates ?? {},
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

function readStore(): Store {
  if (!canUseLocalStorage()) {
    const out: Store = {}
    for (const [k, v] of Object.entries(memoryStore.value)) {
      out[k] = normalizeSession(v)
    }
    return out
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Store
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Store = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'projectId' in v) {
        out[k] = normalizeSession(v as GuidedSession)
      }
    }
    return out
  } catch {
    return {}
  }
}

function writeStore(store: Store) {
  memoryStore.value = store
  if (!canUseLocalStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

/** Test helper — clear guided sessions without touching Zustand. */
export function clearGuidedSessionsForTests() {
  memoryStore.value = {}
  if (canUseLocalStorage()) localStorage.removeItem(STORAGE_KEY)
}

export function getGuidedSession(projectId: string): GuidedSession | null {
  const s = readStore()[projectId]
  return s ? normalizeSession(s) : null
}

export function saveGuidedSession(session: GuidedSession): GuidedSession {
  const next = normalizeSession({
    ...session,
    updatedAt: new Date().toISOString(),
  })
  const store = readStore()
  store[session.projectId] = next
  writeStore(store)
  return next
}

export function createGuidedSession(input: {
  projectId: string
  startISO: string
  endISO: string
  phasePlan: PhaseDatePlan[]
}): GuidedSession {
  const session: GuidedSession = {
    projectId: input.projectId,
    startISO: input.startISO,
    endISO: input.endISO,
    phasePlan: input.phasePlan,
    understood: {},
    completedPhases: [],
    unlockedPhases: ['specify_need'],
    templateDrafts: {},
    evidenceStates: {},
    updatedAt: new Date().toISOString(),
  }
  return saveGuidedSession(session)
}

export function markCardUnderstood(
  projectId: string,
  cardId: string,
  value = true,
): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  return saveGuidedSession({
    ...current,
    understood: { ...current.understood, [cardId]: value },
  })
}

export function completePhase1AndUnlockDesign(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase2Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 6: Design complete unlocks Build for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase3Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 7: Build complete unlocks Collect for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase4Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 8: Collect complete unlocks Process for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  unlocked.add('process')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  completed.add('collect')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase5Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 9: Process complete unlocks Analyse for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  unlocked.add('process')
  unlocked.add('analyse')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  completed.add('collect')
  completed.add('process')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase6Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 10: Analyse complete unlocks Disseminate for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  unlocked.add('process')
  unlocked.add('analyse')
  unlocked.add('disseminate')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  completed.add('collect')
  completed.add('process')
  completed.add('analyse')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase7Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Slice 11: Disseminate complete unlocks Evaluate for guided learning.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  unlocked.add('process')
  unlocked.add('analyse')
  unlocked.add('disseminate')
  unlocked.add('evaluate')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  completed.add('collect')
  completed.add('process')
  completed.add('analyse')
  completed.add('disseminate')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function completePhase8Learning(projectId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  // Final Guided phase — mark Evaluate learning complete. There is NO Phase 9.
  const unlocked = new Set(current.unlockedPhases)
  unlocked.add('specify_need')
  unlocked.add('design')
  unlocked.add('build')
  unlocked.add('collect')
  unlocked.add('process')
  unlocked.add('analyse')
  unlocked.add('disseminate')
  unlocked.add('evaluate')
  const completed = new Set(current.completedPhases)
  completed.add('specify_need')
  completed.add('design')
  completed.add('build')
  completed.add('collect')
  completed.add('process')
  completed.add('analyse')
  completed.add('disseminate')
  completed.add('evaluate')
  return saveGuidedSession({
    ...current,
    unlockedPhases: Array.from(unlocked),
    completedPhases: Array.from(completed),
  })
}

export function upsertTemplateDraft(
  projectId: string,
  cardId: string,
  values: GuidedDraftValues,
): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  return saveGuidedSession({
    ...current,
    templateDrafts: {
      ...current.templateDrafts,
      [cardId]: { values, updatedAt: new Date().toISOString() },
    },
  })
}

export function resetTemplateDraft(projectId: string, cardId: string): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  const nextDrafts = { ...current.templateDrafts }
  delete nextDrafts[cardId]
  return saveGuidedSession({
    ...current,
    templateDrafts: nextDrafts,
  })
}

export function upsertEvidenceItem(
  projectId: string,
  cardId: string,
  evidenceId: string,
  patch: Partial<GuidedEvidenceItemState>,
): GuidedSession | null {
  const current = getGuidedSession(projectId)
  if (!current) return null
  const cardMap = { ...(current.evidenceStates[cardId] ?? {}) }
  const prev = cardMap[evidenceId] ?? { status: 'belum' as const, note: '' }
  cardMap[evidenceId] = { ...prev, ...patch }
  return saveGuidedSession({
    ...current,
    evidenceStates: {
      ...current.evidenceStates,
      [cardId]: cardMap,
    },
  })
}

export function countUnderstood(session: GuidedSession, cardIds: string[]): number {
  return cardIds.filter((id) => session.understood[id]).length
}

export function allCardsUnderstood(session: GuidedSession, cardIds: string[]): boolean {
  return cardIds.every((id) => session.understood[id])
}

export function isPhaseUnlocked(session: GuidedSession, phaseId: GsbpmPhaseId): boolean {
  if (phaseId === 'specify_need') return true
  if (phaseId === 'design') {
    return (
      session.unlockedPhases.includes('design') ||
      session.completedPhases.includes('specify_need')
    )
  }
  if (phaseId === 'build') {
    return (
      session.unlockedPhases.includes('build') || session.completedPhases.includes('design')
    )
  }
  if (phaseId === 'collect') {
    return (
      session.unlockedPhases.includes('collect') || session.completedPhases.includes('build')
    )
  }
  if (phaseId === 'process') {
    return (
      session.unlockedPhases.includes('process') || session.completedPhases.includes('collect')
    )
  }
  if (phaseId === 'analyse') {
    return (
      session.unlockedPhases.includes('analyse') || session.completedPhases.includes('process')
    )
  }
  if (phaseId === 'disseminate') {
    return (
      session.unlockedPhases.includes('disseminate') ||
      session.completedPhases.includes('analyse')
    )
  }
  if (phaseId === 'evaluate') {
    return (
      session.unlockedPhases.includes('evaluate') ||
      session.completedPhases.includes('disseminate')
    )
  }
  return false
}
