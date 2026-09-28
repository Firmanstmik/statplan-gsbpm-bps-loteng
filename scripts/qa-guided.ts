/**
 * Guided Planning QA — Slice 1 + Slice 2 + Slice 3 (guided phase engine)
 * run: npx vite-node scripts/qa-guided.ts
 */
import { recommendJenisKegiatan } from '../src/domain/aiPlanner'
import { canExport, validateProject } from '../src/domain/validation'
import { defaultMetadataValues } from '../src/domain/metadataSchema'
import { GSBPM_PHASES, computeProjectProgress } from '../src/domain/gsbpm'
import type { Project } from '../src/domain/types'
import {
  STORY_EXAMPLE,
  buildIllustrativeSchedule,
  deriveProjectName,
  deriveTopik,
  pickOutcomeExample,
  understandNeedSummary,
} from '../src/content/guidedJourney'
import {
  addMonthsISO,
  allocatePhaseDates,
  inclusiveDayCount,
  phasePlanToTimelineItems,
  validateProjectDateRange,
  validatePhaseWithinProject,
} from '../src/content/planningTimeline'
import { computeDraftStatus } from '../src/content/guidedNeedPreparation'
import { getPreparation } from '../src/content/guidedPreparation'
import {
  ALL_GUIDED_CARDS,
  GUIDED_PHASES,
  getGuidedCard,
  nextCardInPhase,
} from '../src/content/guidedCards'
import { isLegacyCardId, migrateGuidedMapsV1toV2 } from '../src/lib/guidedMigration'
import {
  allCardsUnderstood,
  clearGuidedSessionsForTests,
  completePhase1AndUnlockDesign,
  completePhase2Learning,
  completePhase3Learning,
  completePhase4Learning,
  completePhase5Learning,
  completePhase6Learning,
  completePhase7Learning,
  completePhase8Learning,
  countUnderstood,
  createGuidedSession,
  getGuidedSession,
  isPhaseUnlocked,
  markCardUnderstood,
  resetTemplateDraft,
  upsertEvidenceItem,
  upsertTemplateDraft,
} from '../src/lib/guidedSession'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const failures: string[] = []
function assert(cond: unknown, msg: string) {
  if (!cond) failures.push(msg)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- Slice 1 regression ---
assert(STORY_EXAMPLE.trim().length >= 12, 'STORY_EXAMPLE length')
assert(understandNeedSummary(STORY_EXAMPLE).toLowerCase().includes('kepuasan'), 'need summary')
assert(
  recommendJenisKegiatan({
    description: STORY_EXAMPLE,
    dataAvailable: false,
    needCoverage: 'sample',
  }).jenis === 'survei',
  'recommendation survei',
)
assert(buildIllustrativeSchedule(3, 'survei').length >= 4, 'legacy week schedule still works')

// --- Slice 2 date validation ---
assert(validateProjectDateRange('', '2027-01-31').ok === false, 'start required')
assert(validateProjectDateRange('2027-01-10', '').ok === false, 'end required')
assert(validateProjectDateRange('2027-01-31', '2027-01-10').ok === false, 'end before start rejected')
assert(validateProjectDateRange('2027-01-10', '2027-01-10').ok === true, 'same-day allowed')
assert(validateProjectDateRange('2027-01-10', '2027-03-31').ok === true, 'multi-month ok')
assert(validateProjectDateRange('2027-02-30', '2027-03-01').ok === false, 'impossible date rejected')

assert(addMonthsISO('2027-01-10', 1) === '2027-02-09', '1-month preset = start+1mo−1day')
assert(addMonthsISO('2027-01-10', 3) === '2027-04-09', '3-month preset deterministic')
assert(inclusiveDayCount('2027-01-10', '2027-01-10') === 1, 'same-day = 1 day')
assert(inclusiveDayCount('2027-01-10', '2027-01-11') === 2, 'two calendar days')

const planA = allocatePhaseDates('2027-01-10', '2027-03-31')
const planB = allocatePhaseDates('2027-01-10', '2027-03-31')
assert(planA.length === 8, 'exactly 8 phases')
assert(planA.length === GSBPM_PHASES.length, 'matches GSBPM_PHASES count')
assert(
  planA.every(
    (p, i) =>
      p.phaseId === planB[i]?.phaseId &&
      p.startISO === planB[i]?.startISO &&
      p.endISO === planB[i]?.endISO,
  ),
  'deterministic allocation',
)
assert(planA[0]!.startISO === '2027-01-10', 'first phase starts at project start')
assert(planA[planA.length - 1]!.endISO === '2027-03-31', 'last phase ends at project end')
assert(
  planA.every((p) => p.startISO <= p.endISO),
  'each phase start <= end',
)
assert(
  GSBPM_PHASES.every((ph) => planA.some((p) => p.phaseId === ph.id)),
  'all GSBPM phases represented',
)

const oneMonth = allocatePhaseDates('2027-01-01', addMonthsISO('2027-01-01', 1))
assert(oneMonth.length === 8, '1-month range still yields 8 phases')
assert(oneMonth[0]!.startISO === '2027-01-01', '1-month first start')
assert(oneMonth[oneMonth.length - 1]!.endISO === addMonthsISO('2027-01-01', 1), '1-month last end')

const sameDay = allocatePhaseDates('2027-06-15', '2027-06-15')
assert(sameDay.length === 8, 'same-day yields 8 phases')
assert(
  sameDay.every((p) => p.startISO === '2027-06-15' && p.endISO === '2027-06-15'),
  'same-day all on that day',
)

const mid = planA[1]!
assert(
  validatePhaseWithinProject(mid, '2027-01-10', '2027-03-31').ok === true,
  'in-range phase ok',
)
assert(
  validatePhaseWithinProject(
    { ...mid, startISO: '2026-12-01' },
    '2027-01-10',
    '2027-03-31',
  ).ok === false,
  'phase before project start rejected',
)

const items = phasePlanToTimelineItems(planA)
assert(items.length === 8, 'timeline items = 8')
assert(items.every((t) => t.startWeek >= 1 && t.endWeek >= t.startWeek), 'week order')
assert(items[0]!.startWeek === 1, 'first phase week 1')
assert(items.every((t) => typeof t.startDate === 'undefined'), 'no unauthorized domain date fields')

function guidedLikeProject(): Project {
  const name = deriveProjectName(STORY_EXAMPLE)
  const timeline = phasePlanToTimelineItems(allocatePhaseDates('2027-01-10', '2027-03-31'))
  return {
    id: 'guided-qa-slice3',
    name,
    description: STORY_EXAMPLE,
    topik: deriveTopik(STORY_EXAMPLE),
    klasifikasi: 'sektoral',
    jenisKegiatan: 'survei',
    objectives: pickOutcomeExample(STORY_EXAMPLE).items,
    variables: [{ id: 'v1', name: 'Skor', definition: 'Skor', type: 'numerik' }],
    indicators: [],
    timeline,
    questionnaire: [{ id: 'q1', number: '1', text: 'Q', type: 'tertutup' }],
    design: {
      caraPengumpulan: 'survei',
      metodePengumpulan: 'wawancara',
      modaPengumpulan: 'capi',
      metodeSampling: 'Stratified',
      ukuranSampel: '100',
    },
    portalSdi: { checked: false, sirusaChecked: false, romantikChecked: false, notes: '' },
    rekomendasiBps: {
      namaKegiatan: name,
      penyelenggara: '',
      tujuan: '',
      periode: '10 Januari 2027 – 31 Maret 2027',
      catatan: '',
    },
    metadata: defaultMetadataValues(name, 'survei'),
    checklistState: {},
    currentPhaseId: 'specify_need',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const p = guidedLikeProject()
const progressBefore = computeProjectProgress(p.jenisKegiatan, p.klasifikasi, p.checklistState)
const exportBefore = canExport(p)
const validationBefore = validateProject(p)
assert(Array.isArray(validationBefore), 'validateProject runs')
assert(exportBefore === false, 'draft not export-ready')
assert(p.timeline.length === 8, 'persisted timeline has 8 phases')

// --- Guided Mode: 44 official GSBPM 5.2 subprocesses ---
clearGuidedSessionsForTests()

const EXPECTED_COUNTS: [string, number][] = [
  ['specify_need', 6],
  ['design', 6],
  ['build', 7],
  ['collect', 4],
  ['process', 8],
  ['analyse', 5],
  ['disseminate', 5],
  ['evaluate', 3],
]
assert(GUIDED_PHASES.length === 8, 'eight guided phases')
assert(ALL_GUIDED_CARDS.length === 44, `44 official subprocess cards (got ${ALL_GUIDED_CARDS.length})`)
GUIDED_PHASES.forEach((phase, i) => {
  const [phaseId, count] = EXPECTED_COUNTS[i]
  assert(phase.intro.phaseId === phaseId, `phase ${i + 1} is ${phaseId}`)
  assert(phase.cards.length === count, `${phaseId}: ${count} subprocesses (got ${phase.cards.length})`)
  assert(phase.intro.outputs.length >= 2 && phase.intro.outputsPage > 0, `${phaseId}: PDF outputs listed`)
  assert(/tidak harus digunakan secara linear/.test(phase.intro.gsbpmNote), `${phaseId}: non-linear note`)
  const domainPhase = GSBPM_PHASES.find((p) => p.id === phaseId)!
  assert(domainPhase.subProcesses.length === count, `${phaseId}: domain has ${count} subprocesses`)
  phase.cards.forEach((card, j) => {
    const sp = domainPhase.subProcesses[j]
    const tag = `${card.id}`
    assert(card.id === `gsbpm-${i + 1}.${j + 1}`, `${tag}: id follows official code`)
    assert(card.code === sp.code, `${tag}: code matches domain ${sp.code}`)
    assert(card.mappingKind === 'gsbpm', `${tag}: maps to official subprocess`)
    assert(
      sp.pdfRef?.includes(String(card.pdfPage)),
      `${tag}: page ${card.pdfPage} agrees with domain pdfRef ${sp.pdfRef}`,
    )
    assert(card.apa.length > 60, `${tag}: Apa? explains the subprocess`)
    assert(card.contoh.length > 20, `${tag}: Contoh summary`)
    assert(
      (card.contohDetail?.length ?? 0) >= 3 || (card.materiExamples?.length ?? 0) > 0,
      `${tag}: example teaches the form of the work`,
    )
    assert((card.lessonPoints?.length ?? 0) >= 3, `${tag}: 3+ Yang bisa dipelajari`)
    assert(
      (card.materiPoints?.length ?? 0) > 0 || (card.materiExamples?.length ?? 0) > 0,
      `${tag}: carries Type A source content`,
    )
    if (card.contohClass === 'A') {
      assert(card.pdfPage != null, `${tag}: Type A example has a page`)
    }
    const prep = getPreparation(card.id)
    assert(prep, `${tag}: has Format kerja StatPlan`)
    if (prep) {
      assert(prep.fields.length >= 1, `${tag}: format kerja has fields`)
      assert(prep.evidence.length >= 2, `${tag}: 2+ evidence items`)
      assert(computeDraftStatus(prep, undefined) === 'empty', `${tag}: empty draft is empty`)
      assert(
        !/template resmi BPS\b(?! —)/i.test(prep.title),
        `${tag}: format kerja not presented as official template`,
      )
      for (const f of prep.fields) {
        if (f.kind === 'repeatableRows') {
          assert((f.columns?.length ?? 0) >= 2, `${tag}.${f.id}: generic rows declare columns`)
        }
        if (f.kind === 'select' || f.kind === 'multiSelect') {
          assert((f.options?.length ?? 0) >= 2, `${tag}.${f.id}: select has options`)
        }
      }
    }
    for (const ex of card.materiExamples ?? []) {
      if (ex.imageSrc) {
        assert(
          ex.imageSrc.startsWith('/materi/hal-') && ex.imageAlt && ex.imageWidth && ex.imageHeight,
          `${tag}: source visual has path, alt text, and dimensions`,
        )
      }
    }
  })
})
assert(nextCardInPhase('gsbpm-3.6')?.id === 'gsbpm-3.7', 'next subprocess navigation')
assert(nextCardInPhase('gsbpm-3.7') === undefined, 'no next beyond end of phase')
assert(getGuidedCard('gsbpm-7.1')?.officialTitle === 'Memutakhirkan Sistem Output', '7.1 official title')
assert(
  getGuidedCard('gsbpm-2.4')?.materiExamples?.some((e) => e.items?.includes('Cluster Sampling')),
  '2.4 lists Hal. 21 sampling methods',
)
assert(
  getGuidedCard('gsbpm-2.6')?.materiExamples?.some((e) => e.table?.rows.length === 8),
  '2.6 shows the 8-row Hal. 23 schedule',
)

// --- Session: unlock flow across all phases, drafts and evidence on every card ---
const session = createGuidedSession({
  projectId: p.id,
  startISO: '2027-01-10',
  endISO: '2027-03-31',
  phasePlan: planA,
})
assert(session.schemaVersion === 2, 'new session uses schema v2')
assert(!session.legacy, 'new session has no legacy archive')
assert(isPhaseUnlocked(session, 'specify_need'), 'phase 1 open')
assert(!isPhaseUnlocked(session, 'design'), 'design locked initially')
assert(Object.keys(session.understood).length === 0, 'no card starts understood')

/** A row that satisfies every specialized repeatable kind's primary key. */
const ANY_ROW = Object.fromEntries(
  ['id', 'name', 'nama', 'judul', 'kegiatan', 'peran', 'hal', 'kode', 'aspek', 'masalah', 'tindakan', 'bentuk', 'mulai', 'selesai'].map(
    (k) => [k, k === 'id' ? 'r1' : 'isi uji'],
  ),
)

const completers = [
  completePhase1AndUnlockDesign,
  completePhase2Learning,
  completePhase3Learning,
  completePhase4Learning,
  completePhase5Learning,
  completePhase6Learning,
  completePhase7Learning,
  completePhase8Learning,
]
GUIDED_PHASES.forEach((phase, i) => {
  const ids = phase.cards.map((c) => c.id)
  let s = getGuidedSession(p.id)!
  assert(isPhaseUnlocked(s, phase.intro.phaseId), `${phase.intro.phaseId} unlocked before learning`)
  assert(!allCardsUnderstood(s, ids), `${phase.intro.phaseId}: cannot finish before all understood`)
  for (const card of phase.cards) {
    const prep = getPreparation(card.id)!
    const draft = Object.fromEntries(
      prep.fields.map((f) => [
        f.id,
        f.kind === 'repeatableRows'
          ? [{ id: 'r1', ...Object.fromEntries((f.columns ?? []).map((c) => [c.key, 'isi'])) }]
          : f.kind === 'text' || f.kind === 'textarea' || f.kind === 'date'
            ? 'isi uji'
            : f.kind === 'select'
              ? f.options![0].value
              : f.kind === 'multiSelect'
                ? [f.options![0].value]
                : f.kind === 'repeatableText'
                  ? ['isi uji']
                  : [ANY_ROW],
      ]),
    )
    upsertTemplateDraft(p.id, card.id, draft)
    upsertEvidenceItem(p.id, card.id, prep.evidence[0].id, { status: 'sudah', note: 'ok' })
    s = getGuidedSession(p.id)!
    assert(!s.understood[card.id], `${card.id}: filling a draft does not mark understood`)
    assert(
      computeDraftStatus(prep, s.templateDrafts[card.id]?.values) !== 'empty',
      `${card.id}: draft registers content`,
    )
    assert(
      s.evidenceStates[card.id]?.[prep.evidence[0].id]?.status === 'sudah',
      `${card.id}: evidence status persists`,
    )
    markCardUnderstood(p.id, card.id, true)
  }
  s = getGuidedSession(p.id)!
  assert(countUnderstood(s, ids) === ids.length, `${phase.intro.phaseId}: all understood`)
  completers[i](p.id)
  s = getGuidedSession(p.id)!
  assert(s.completedPhases.includes(phase.intro.phaseId), `${phase.intro.phaseId} completed`)
  const next = GUIDED_PHASES[i + 1]
  if (next) assert(isPhaseUnlocked(s, next.intro.phaseId), `${next.intro.phaseId} unlocked`)
})
resetTemplateDraft(p.id, 'gsbpm-1.1')
assert(!getGuidedSession(p.id)!.templateDrafts['gsbpm-1.1'], 'reset clears one draft')
assert(getGuidedSession(p.id)!.templateDrafts['gsbpm-1.2'], 'reset leaves other drafts')

// Workspace isolation: guided learning must not change project checklist/progress/export.
assert(
  JSON.stringify(computeProjectProgress(p.jenisKegiatan, p.klasifikasi, p.checklistState)) ===
    JSON.stringify(progressBefore),
  'guided session does not drive project progress',
)
assert(canExport(p) === exportBefore, 'export gate independent of guided mode')

// --- v1 → v2 migration ---
{
  const now = '2027-02-01T00:00:00.000Z'
  const v1 = {
    understood: {
      'need-1.1': true,
      'need-1.4': true,
      'design-2.5': true,
      'design-2.6': true,
      'process-5.4': true,
      'analyse-6.3': true,
      'disseminate-7.1': true,
      'evaluate-8.2': true,
    },
    templateDrafts: {
      'need-1.4': { values: { outputs: [{ id: 'o', name: 'Indeks', bentuk: 'tabel', keterangan: '' }] }, updatedAt: now },
      'design-2.4': { values: { menggunakan_sampel: 'ya', metode_sampling: 'systematic sampling tiap ke-5' }, updatedAt: now },
      'design-2.5': { values: { kegiatan: [{ id: 'k', kegiatan: 'Susun', mulai: '2027-01-10', selesai: '2027-01-20', catatan: '' }] }, updatedAt: now },
      'design-2.6': { values: { sop_list: [{ id: 's', nama: 'SOP A', catatan: '' }] }, updatedAt: now },
      'disseminate-7.3': { values: { pengguna_sasaran: 'OPD', catatan: 'dari 7.3' }, updatedAt: now },
      'disseminate-7.4': { values: { sasaran: '', catatan: 'dari 7.4' }, updatedAt: now },
      'collect-4.6': { values: { catatan_kesiapan: 'arsip' }, updatedAt: now },
    },
    evidenceStates: {
      'process-5.4': { 'e-5.4-a': { status: 'sudah' as const, note: 'unit' } },
    },
  }
  const m = migrateGuidedMapsV1toV2(v1, now)
  assert(m.legacy?.schemaVersion === 1, 'legacy archive created')
  assert(Object.keys(m.legacy!.templateDrafts).length === 7, 'every v1 draft archived')
  assert(m.legacy!.templateDrafts['collect-4.6'], 'archived-only card kept in legacy')
  assert(!Object.keys(m.understood).some(isLegacyCardId), 'no legacy ids remain in understood')
  assert(!Object.keys(m.templateDrafts).some(isLegacyCardId), 'no legacy ids remain in drafts')
  assert(m.understood['gsbpm-1.1'] === true, 'understood carries 1:1')
  assert(!m.understood['gsbpm-1.4'], 'rewritten 1.4 starts un-ticked')
  assert(m.understood['gsbpm-2.6'] === true, '2.6 understood when both primary sources were')
  assert(!m.understood['gsbpm-2.5'], 'new 2.5 starts un-ticked')
  assert(m.understood['gsbpm-5.5'] === true, 'process-5.4 → official 5.5')
  assert(!m.understood['gsbpm-5.4'], 'positional id does not leak to official 5.4')
  assert(m.understood['gsbpm-6.2'] === true, 'analyse-6.3 (pemeriksaan) → 6.2 Validasi output')
  assert(m.understood['gsbpm-7.2'] === true, 'disseminate-7.1 (produk) → 7.2')
  assert(!m.understood['gsbpm-7.1'], 'new 7.1 starts un-ticked')
  assert(!m.understood['gsbpm-8.1'], 'secondary source alone does not tick 8.1')
  assert(
    Array.isArray(m.templateDrafts['gsbpm-1.3']?.values.outputs),
    'old 1.4 output list moved to 1.3',
  )
  const d24 = m.templateDrafts['gsbpm-2.4']?.values
  assert(d24?.metode_sampling === 'systematic', 'free-text sampling method mapped to Hal. 21 option')
  const d26 = m.templateDrafts['gsbpm-2.6']?.values
  assert(Array.isArray(d26?.kegiatan) && Array.isArray(d26?.sop_list), 'jadwal + SOP merged into 2.6')
  const d74 = m.templateDrafts['gsbpm-7.4']?.values
  assert(d74?.sasaran === 'OPD', 'fieldMap renames pengguna_sasaran → sasaran')
  assert(
    typeof d74?.catatan === 'string' && d74.catatan.includes('dari 7.3') && d74.catatan.includes('dari 7.4'),
    'colliding text is merged, not overwritten',
  )
  assert(m.evidenceStates['gsbpm-5.5']?.['e-5.4-a']?.status === 'sudah', 'evidence follows its card')
  assert(
    getPreparation('gsbpm-5.5')!.evidence.some((e) => e.id === 'e-5.4-a'),
    'moved evidence id is still listed by the new format kerja',
  )
  const again = migrateGuidedMapsV1toV2(m, now)
  assert(!again.legacy, 'migration is idempotent on v2 data')

  // End-to-end through storage: a raw v1 session in localStorage.
  const mem = new Map<string, string>()
  const g = globalThis as unknown as { localStorage?: Storage }
  const prevLs = g.localStorage
  g.localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  } as Storage
  mem.set(
    'statplan-guided-sessions-v1',
    JSON.stringify({
      legacyProj: {
        projectId: 'legacyProj',
        startISO: '2027-01-10',
        endISO: '2027-03-31',
        phasePlan: [],
        understood: v1.understood,
        completedPhases: ['specify_need', 'design'],
        unlockedPhases: ['specify_need', 'design', 'build'],
        templateDrafts: v1.templateDrafts,
        evidenceStates: v1.evidenceStates,
        updatedAt: now,
      },
    }),
  )
  const migrated = getGuidedSession('legacyProj')!
  assert(migrated.schemaVersion === 2, 'stored v1 session is migrated on read')
  assert(migrated.completedPhases.includes('design'), 'phase completion preserved')
  assert(isPhaseUnlocked(migrated, 'build'), 'unlock state preserved')
  const persisted = JSON.parse(mem.get('statplan-guided-sessions-v1')!).legacyProj
  assert(persisted.schemaVersion === 2 && persisted.legacy, 'migration persisted with legacy archive')
  markCardUnderstood('legacyProj', 'gsbpm-7.1', true)
  const after = getGuidedSession('legacyProj')!
  assert(after.understood['gsbpm-7.1'] && after.legacy, 'saving keeps legacy archive')
  if (prevLs === undefined) delete g.localStorage
  else g.localStorage = prevLs
}

const sessionSrc = readFileSync(join(root, 'src/lib/guidedSession.ts'), 'utf8')
assert(!sessionSrc.includes('completePhase9'), 'no Phase 9 completion helper')

// --- GSBPM 5.2 alignment against the PDF text: counts, sequential codes, official names on the phase pages ---
{
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9&]+/g, ' ')
      .trim()
  const pdfPage = (n: number) => {
    try {
      return norm(readFileSync(join(root, 'docs/_pdf-extract', `page-${String(n).padStart(2, '0')}.txt`), 'utf8'))
    } catch {
      return ''
    }
  }
  const expected = [6, 6, 7, 4, 8, 5, 5, 3]
  GUIDED_PHASES.forEach((phase, i) => {
    const n = i + 1
    assert(phase.cards.length === expected[i], `phase ${n}: ${expected[i]} official subprocesses`)
    const [a, b] = phase.intro.pdfRange.replace(/[^\d–-]/g, '').split(/[–-]/).map(Number)
    const text = Array.from({ length: (b || a) - a + 1 }, (_, k) => pdfPage(a + k)).join(' ')
    phase.cards.forEach((card, j) => {
      assert(card.id === `gsbpm-${n}.${j + 1}`, `${card.id}: sequential official code ${n}.${j + 1}`)
      assert(text.includes(norm(card.officialTitle)), `${card.id}: official name "${card.officialTitle}" appears in the PDF (${phase.intro.pdfRange})`)
    })
  })
}

if (failures.length) {
  console.error('qa-guided FAILED:')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log('qa-guided PASS')
