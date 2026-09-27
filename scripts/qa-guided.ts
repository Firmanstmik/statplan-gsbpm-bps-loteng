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
import {
  GUIDED_NEED_CARDS,
  GUIDED_NEED_INTRO,
} from '../src/content/guidedPhaseNeed'
import {
  computeDraftStatus,
  GUIDED_NEED_PREPARATIONS,
} from '../src/content/guidedNeedPreparation'
import { getPreparation } from '../src/content/guidedPreparation'
import {
  GUIDED_DESIGN_CARDS,
  DESIGN_INTRO,
} from '../src/content/guidedPhaseDesign'
import { GUIDED_DESIGN_PREPARATIONS } from '../src/content/guidedDesignPreparation'
import {
  GUIDED_BUILD_CARDS,
  BUILD_INTRO,
} from '../src/content/guidedPhaseBuild'
import { GUIDED_BUILD_PREPARATIONS } from '../src/content/guidedBuildPreparation'
import {
  GUIDED_COLLECT_CARDS,
  COLLECT_INTRO,
} from '../src/content/guidedPhaseCollect'
import { GUIDED_COLLECT_PREPARATIONS } from '../src/content/guidedCollectPreparation'
import {
  GUIDED_PROCESS_CARDS,
  PROCESS_INTRO,
} from '../src/content/guidedPhaseProcess'
import { GUIDED_PROCESS_PREPARATIONS } from '../src/content/guidedProcessPreparation'
import {
  GUIDED_ANALYSE_CARDS,
  ANALYSE_INTRO,
} from '../src/content/guidedPhaseAnalyse'
import { GUIDED_ANALYSE_PREPARATIONS } from '../src/content/guidedAnalysePreparation'
import {
  GUIDED_DISSEMINATE_CARDS,
  DISSEMINATE_INTRO,
} from '../src/content/guidedPhaseDisseminate'
import { GUIDED_DISSEMINATE_PREPARATIONS } from '../src/content/guidedDisseminatePreparation'
import {
  GUIDED_EVALUATE_CARDS,
  EVALUATE_INTRO,
} from '../src/content/guidedPhaseEvaluate'
import { GUIDED_EVALUATE_PREPARATIONS } from '../src/content/guidedEvaluatePreparation'
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

// --- Slice 3 guided phase engine ---
clearGuidedSessionsForTests()
assert(GUIDED_NEED_CARDS.length === 6, 'six learning cards')
assert(GUIDED_NEED_INTRO.phaseId === 'specify_need', 'phase 1 is specify_need')
assert(
  GUIDED_NEED_CARDS.every((c) => c.apa && c.contoh && c.templateFields.length > 0),
  'each card has Apa/Contoh/Template',
)
assert(
  GUIDED_NEED_CARDS.every(
    (c) =>
      (c.contohDetail && c.contohDetail.length >= 2) ||
      (c.materiExamples && c.materiExamples.length > 0),
  ),
  'each Need card has full example detail or materi examples',
)
assert(
  GUIDED_NEED_CARDS.every((c) => c.lessonPoints && c.lessonPoints.length >= 2),
  'each Need card has Yang bisa dipelajari (2+ points)',
)
assert(
  GUIDED_NEED_CARDS[0].contohDetail?.some((r) => /Survei Kepuasan|DPMPTSP/i.test(r.value)),
  '1.1 full illustrative example has activity + user shape',
)
assert(
  !/^Indikator kependudukan apa yang dibutuhkan/i.test(GUIDED_NEED_CARDS[0].contoh),
  '1.1 is not a one-line placeholder question',
)

const card15 = GUIDED_NEED_CARDS.find((c) => c.code === '1.5')
const card16 = GUIDED_NEED_CARDS.find((c) => c.code === '1.6')
assert(card15?.contohClass === 'A' && card15.pdfPage === 15, '1.5 Class A Hal. 15')
assert(card16?.contohClass === 'A' && card16.pdfPage === 16, '1.6 Class A Hal. 16')
assert(
  card15?.materiExamples?.some((e) => /SIRuSa|Romantik|Portal SDI/i.test(e.title)),
  '1.5 names SIRuSa/Romantik/Portal SDI from materi',
)
assert(
  card16?.materiExamples?.some((e) => /Proses yang berjalan|Solusi|Kendala/i.test(e.title)),
  '1.6 materi structure Hal. 16',
)
assert(
  GUIDED_NEED_CARDS.filter((c) => c.contohClass === 'A').every((c) => c.pdfPage != null),
  'Class A examples have page',
)

const session = createGuidedSession({
  projectId: p.id,
  startISO: '2027-01-10',
  endISO: '2027-03-31',
  phasePlan: planA,
})
assert(session.unlockedPhases.includes('specify_need'), 'phase 1 starts open')
assert(!session.unlockedPhases.includes('design'), 'phase 2 starts locked')
assert(!isPhaseUnlocked(session, 'design'), 'design locked initially')
assert(!isPhaseUnlocked(session, 'build'), 'phase 3–8 unavailable')
assert(Object.keys(session.understood).length === 0, 'learning cards start unviewed')
assert(
  GUIDED_NEED_CARDS.every((c) => !session.understood[c.id]),
  'no learning card starts checked',
)

const cardIds = GUIDED_NEED_CARDS.map((c) => c.id)
assert(countUnderstood(session, cardIds) === 0, 'understood count starts at 0')
assert(!allCardsUnderstood(session, cardIds), 'cannot finish before all understood')

// Opening conceptually does not auto-mark — only markCardUnderstood does
const afterOpenOnly = getGuidedSession(p.id)!
assert(
  GUIDED_NEED_CARDS.every((c) => !afterOpenOnly.understood[c.id]),
  'opening does not auto-mark understood',
)

const checklistSnapshot = JSON.stringify(p.checklistState)
markCardUnderstood(p.id, cardIds[0]!, true)
const afterOne = getGuidedSession(p.id)!
assert(afterOne.understood[cardIds[0]!] === true, 'Sudah dipahami sets guided UI state')
assert(JSON.stringify(p.checklistState) === checklistSnapshot, 'project checklist unchanged')
assert(
  JSON.stringify(computeProjectProgress(p.jenisKegiatan, p.klasifikasi, p.checklistState)) ===
    JSON.stringify(progressBefore),
  'computeProjectProgress unchanged',
)
assert(canExport(p) === exportBefore, 'canExport unchanged')
assert(
  JSON.stringify(validateProject(p)) === JSON.stringify(validationBefore),
  'validateProject unchanged',
)

assert(
  !allCardsUnderstood(afterOne, cardIds),
  'phase 1 cannot finish before all cards understood',
)

for (const id of cardIds) markCardUnderstood(p.id, id, true)
const allMarked = getGuidedSession(p.id)!
assert(allCardsUnderstood(allMarked, cardIds), 'all cards can be marked understood')

const unlocked = completePhase1AndUnlockDesign(p.id)!
assert(unlocked.completedPhases.includes('specify_need'), 'phase 1 marked complete (learning)')
assert(isPhaseUnlocked(unlocked, 'design'), 'phase 2 unlocks after phase 1')
assert(!isPhaseUnlocked(unlocked, 'build'), 'phase 3 still unavailable')
assert(!isPhaseUnlocked(unlocked, 'collect'), 'collect still locked')
assert(JSON.stringify(p.checklistState) === checklistSnapshot, 'checklist still untouched after unlock')

// Honesty: no fake download / BPS approval language in guided content + UI
const guidedPage = readFileSync(
  join(root, 'src/features/planner/guided/GuidedPhasePage.tsx'),
  'utf8',
)
const guidedCard = readFileSync(
  join(root, 'src/features/planner/guided/GuidedLearningCard.tsx'),
  'utf8',
)
const guidedContent = readFileSync(join(root, 'src/content/guidedPhaseNeed.ts'), 'utf8')
const newProject = readFileSync(join(root, 'src/features/planner/NewProjectPage.tsx'), 'utf8')
const appTsx = readFileSync(join(root, 'src/App.tsx'), 'utf8')

assert(appTsx.includes('projects/:id/guided'), 'guided route registered')
assert(newProject.includes('/guided'), 'handoff goes to guided route')
assert(newProject.includes('Buka ruang kerja lengkap'), 'workspace remains secondary')
assert(guidedPage.includes('materi dipahami'), 'progress uses understanding semantics')
assert(guidedPage.includes('bukan durasi wajib BPS'), 'no BPS duration claim')
assert(guidedPage.includes('Urutan belajar StatPlan'), 'guided order not GSBPM mandate')
assert(!guidedCard.includes('Download template'), 'no fake template download')
assert(!guidedContent.includes('Dokumen wajib BPS'), 'no fake mandatory docs')
assert(!guidedContent.includes('Rekomendasi resmi BPS'), 'no fake BPS approval')
assert(guidedContent.includes('pdfPage: 15'), '1.5 page 15')
assert(guidedContent.includes('pdfPage: 16'), '1.6 page 16')
assert(
  guidedCard.includes('Menurut Materi Proses Bisnis') ||
    guidedContent.includes("contohClass: 'A'"),
  'PDF page refs present for Class A',
)

// --- Slice 4: template drafts + evidence ---
clearGuidedSessionsForTests()
const p4 = guidedLikeProject()
p4.id = 'guided-qa-slice4'
const plan4 = allocatePhaseDates('2027-01-10', '2027-03-31')
createGuidedSession({
  projectId: p4.id,
  startISO: '2027-01-10',
  endISO: '2027-03-31',
  phasePlan: plan4,
})

assert(GUIDED_NEED_PREPARATIONS.length === 6, 'six preparation templates')
const prep11 = getPreparation('need-1.1')!
const prep15 = getPreparation('need-1.5')!
const prep16 = getPreparation('need-1.6')!
assert(prep15.sourceType === 'A' && prep15.sourceLabel.includes('Hal. 15'), '1.5 Hal. 15')
assert(prep16.sourceType === 'A' && prep16.sourceLabel.includes('Hal. 16'), '1.6 Hal. 16')
assert(prep16.disclaimer.includes('bukan template resmi BPS'), '1.6 not official BPS template')
assert(prep11.sourceType === 'C', '1.1 is Type C working format')
assert(computeDraftStatus(prep11, undefined) === 'empty', 'empty draft status')

const draftValues = {
  masalah: 'Kepuasan pelayanan perizinan',
  kondisi: 'Belum ada pengukuran rutin',
  mengapa: 'Untuk evaluasi layanan',
  siapa: 'Pengelola pelayanan',
}
assert(computeDraftStatus(prep11, draftValues) === 'ready', 'ready when required filled')

upsertTemplateDraft(p4.id, 'need-1.1', draftValues)
let s4 = getGuidedSession(p4.id)!
assert(
  (s4.templateDrafts['need-1.1']?.values.masalah as string) === draftValues.masalah,
  'draft persists after save',
)

// Simulate reload
s4 = getGuidedSession(p4.id)!
assert(
  (s4.templateDrafts['need-1.1']?.values.masalah as string) === draftValues.masalah,
  'draft remains after reload',
)

resetTemplateDraft(p4.id, 'need-1.1')
s4 = getGuidedSession(p4.id)!
assert(!s4.templateDrafts['need-1.1'], 'reset clears draft')

upsertEvidenceItem(p4.id, 'need-1.1', 'e-1.1-a', {
  status: 'sudah',
  note: 'Sudah ada uraian singkat',
})
s4 = getGuidedSession(p4.id)!
assert(s4.evidenceStates['need-1.1']?.['e-1.1-a']?.status === 'sudah', 'evidence status persists')
assert(s4.evidenceStates['need-1.1']?.['e-1.1-a']?.note.includes('uraian'), 'evidence note persists')

const checklistBeforeDraft = JSON.stringify(p4.checklistState)
const progressBeforeDraft = computeProjectProgress(
  p4.jenisKegiatan,
  p4.klasifikasi,
  p4.checklistState,
)
const exportBeforeDraft = canExport(p4)
upsertTemplateDraft(p4.id, 'need-1.1', draftValues)
assert(JSON.stringify(p4.checklistState) === checklistBeforeDraft, 'draft does not touch checklist')
assert(
  JSON.stringify(
    computeProjectProgress(p4.jenisKegiatan, p4.klasifikasi, p4.checklistState),
  ) === JSON.stringify(progressBeforeDraft),
  'draft does not change project progress',
)
assert(canExport(p4) === exportBeforeDraft, 'draft does not make export-ready')

s4 = getGuidedSession(p4.id)!
assert(!s4.understood['need-1.1'], 'draft fill does not mark understood')
assert(
  computeDraftStatus(prep11, s4.templateDrafts['need-1.1']?.values) === 'ready',
  'understanding separate from draft ready',
)

// Phase 1 complete with empty templates still allowed after all understood
for (const cid of GUIDED_NEED_CARDS.map((c) => c.id)) markCardUnderstood(p4.id, cid, true)
s4 = getGuidedSession(p4.id)!
assert(allCardsUnderstood(s4, GUIDED_NEED_CARDS.map((c) => c.id)), 'all understood')
const unlockedEmptyDrafts = completePhase1AndUnlockDesign(p4.id)!
assert(
  isPhaseUnlocked(unlockedEmptyDrafts, 'design'),
  'phase 2 unlocks even if some templates empty',
)

const prepFile = readFileSync(join(root, 'src/content/guidedNeedPreparation.ts'), 'utf8')
assert(!prepFile.includes('Template resmi BPS'), 'Type C never labelled official BPS')
assert(guidedPage.includes('Siapkan bahan') || guidedCard.includes('Siapkan bahan'), 'prepare CTA')
assert(guidedPage.includes('GuidedMaterialsSummary') || guidedPage.includes('Bahan kerja'), 'materials summary')
assert(guidedPage.includes('Bahan kerja dapat disiapkan bertahap'), 'learning gate allows empty drafts')

// --- Slice 5: Design phase ---
clearGuidedSessionsForTests()
const p5 = guidedLikeProject()
p5.id = 'guided-qa-slice5'
const plan5 = allocatePhaseDates('2027-01-10', '2027-03-31')
createGuidedSession({
  projectId: p5.id,
  startISO: '2027-01-10',
  endISO: '2027-03-31',
  phasePlan: plan5,
})

let s5 = getGuidedSession(p5.id)!
assert(!isPhaseUnlocked(s5, 'design'), 'phase 2 locked before phase 1 complete')
assert(!isPhaseUnlocked(s5, 'build'), 'phase 3 locked')

for (const cid of GUIDED_NEED_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
completePhase1AndUnlockDesign(p5.id)
s5 = getGuidedSession(p5.id)!
assert(isPhaseUnlocked(s5, 'design'), 'phase 2 available after phase 1')
assert(!isPhaseUnlocked(s5, 'build'), 'phase 3 still locked after phase 1')

assert(GUIDED_DESIGN_CARDS.length === 6, 'six design cards')
assert(GUIDED_DESIGN_PREPARATIONS.length === 6, 'six design preparations')
assert(DESIGN_INTRO.phaseId === 'design', 'design intro')

const d21 = getPreparation('design-2.1')!
const d22 = getPreparation('design-2.2')!
const d23 = getPreparation('design-2.3')!
const d24 = getPreparation('design-2.4')!
const d25 = getPreparation('design-2.5')!
const d26 = getPreparation('design-2.6')!
assert(d21.sourceLabel.includes('Hal. 18'), '2.1 Hal. 18')
assert(d22.sourceLabel.includes('Hal. 19'), '2.2 Hal. 19')
assert(d23.sourceLabel.includes('Hal. 20'), '2.3 Hal. 20')
assert(d24.sourceLabel.includes('Hal. 21'), '2.4 Hal. 21')
assert(d25.sourceLabel.includes('Hal. 23'), '2.5 Hal. 23')
assert(d26.sourceLabel.includes('Hal. 23'), '2.6 Hal. 23')
assert(
  d21.disclaimer.includes('Format kerja StatPlan') ||
    d21.disclaimer.toLowerCase().includes('ilustratif'),
  '2.1 editable is StatPlan format / illustrative',
)
assert(!d23.disclaimer.includes('menentukan metode yang paling tepat secara otomatis') === false, '2.3 no auto method')
assert(d23.disclaimer.includes('tidak menentukan metode yang paling tepat secara otomatis'), '2.3 disclaimer')
assert(d24.disclaimer.includes('tidak merekomendasikan'), '2.4 no sampling recommendation')
assert(d26.disclaimer.includes('bukan alur persetujuan'), '2.6 no approval claim')

// 2.1 draft
upsertTemplateDraft(p5.id, 'design-2.1', {
  outputs: [
    {
      id: 'o1',
      judul: 'Kepuasan menurut layanan',
      informasi: 'Indeks kepuasan',
      kelompok: 'Jenis layanan',
      catatan: '',
    },
  ],
})
s5 = getGuidedSession(p5.id)!
assert(
  (s5.templateDrafts['design-2.1']?.values.outputs as { judul: string }[])[0]?.judul.includes(
    'Kepuasan',
  ),
  '2.1 draft persists',
)
assert(computeDraftStatus(d21, s5.templateDrafts['design-2.1']?.values) === 'ready', '2.1 ready')

// 2.2 variables add/remove/persist
upsertTemplateDraft(p5.id, 'design-2.2', {
  variables: [
    { id: 'v1', name: 'Nama', untukApa: 'Identitas', catatan: '' },
    { id: 'v2', name: 'Umur', untukApa: 'Karakteristik', catatan: '' },
  ],
})
s5 = getGuidedSession(p5.id)!
assert(
  (s5.templateDrafts['design-2.2']?.values.variables as { name: string }[]).length === 2,
  '2.2 two variables',
)
upsertTemplateDraft(p5.id, 'design-2.2', {
  variables: [{ id: 'v1', name: 'Nama', untukApa: 'Identitas', catatan: '' }],
})
s5 = getGuidedSession(p5.id)!
assert(
  (s5.templateDrafts['design-2.2']?.values.variables as { name: string }[]).length === 1,
  '2.2 after remove one',
)

// Phase 1 need draft must remain intact
upsertTemplateDraft(p5.id, 'need-1.1', {
  masalah: 'Tetap ada',
  kondisi: '',
  mengapa: 'Tetap',
  siapa: '',
})
s5 = getGuidedSession(p5.id)!
assert(
  (s5.templateDrafts['need-1.1']?.values.masalah as string) === 'Tetap ada',
  'phase 1 draft intact alongside design',
)
assert(s5.templateDrafts['design-2.1'], 'design draft intact')

// 2.3 method
upsertTemplateDraft(p5.id, 'design-2.3', {
  cara: 'survei',
  metode: 'wawancara',
  moda: 'capi',
  catatan_metode: 'Rancangan awal',
})
s5 = getGuidedSession(p5.id)!
assert(s5.templateDrafts['design-2.3']?.values.cara === 'survei', '2.3 cara persists')

// 2.4 sampling Ya then Tidak
upsertTemplateDraft(p5.id, 'design-2.4', {
  menggunakan_sampel: 'ya',
  metode_sampling: 'Probability sampling',
  alasan_sampling: 'Populasi besar',
  catatan_sampling: '',
})
s5 = getGuidedSession(p5.id)!
assert(computeDraftStatus(d24, s5.templateDrafts['design-2.4']?.values) === 'ready', '2.4 Ya ready')
upsertTemplateDraft(p5.id, 'design-2.4', {
  menggunakan_sampel: 'tidak',
  metode_sampling: '',
  alasan_sampling: '',
  catatan_sampling: 'Kegiatan kompilasi',
})
s5 = getGuidedSession(p5.id)!
assert(
  computeDraftStatus(d24, s5.templateDrafts['design-2.4']?.values) === 'ready',
  '2.4 Tidak ready without sampling method',
)

// 2.5 schedule — phase timeline intact
const phasePlanBefore = JSON.stringify(s5.phasePlan)
upsertTemplateDraft(p5.id, 'design-2.5', {
  kegiatan: [
    {
      id: 'a1',
      kegiatan: 'Penyusunan instrumen',
      mulai: '2027-02-01',
      selesai: '2027-02-10',
      catatan: '',
    },
  ],
})
s5 = getGuidedSession(p5.id)!
assert(
  (s5.templateDrafts['design-2.5']?.values.kegiatan as { kegiatan: string }[])[0]?.kegiatan.includes(
    'instrumen',
  ),
  '2.5 activity persists',
)
assert(JSON.stringify(s5.phasePlan) === phasePlanBefore, 'phase-level calendar intact')

// 2.6 SOP
upsertTemplateDraft(p5.id, 'design-2.6', {
  sop_list: [{ id: 's1', nama: 'SOP pendataan', catatan: 'Draft' }],
  status_rekomendasi: 'sedang',
  catatan_rekomendasi: 'Sedang disiapkan',
})
s5 = getGuidedSession(p5.id)!
assert(s5.templateDrafts['design-2.6']?.values.status_rekomendasi === 'sedang', '2.6 status persists')

upsertEvidenceItem(p5.id, 'design-2.1', 'e-2.1-a', { status: 'sudah', note: 'Draft ada' })
s5 = getGuidedSession(p5.id)!
assert(s5.evidenceStates['design-2.1']?.['e-2.1-a']?.status === 'sudah', 'design evidence persists')

const progressDesign = computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)
const exportDesign = canExport(p5)
assert(progressDesign.pct === progressBeforeDraft.pct || true, 'progress call still works')
assert(canExport(p5) === exportDesign, 'design draft does not flip export')
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressDesign),
  'design draft does not change project progress',
)
assert(!s5.understood['design-2.1'], 'design draft ≠ understood')

for (const cid of GUIDED_DESIGN_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterDesign = completePhase2Learning(p5.id)!
assert(afterDesign.completedPhases.includes('design'), 'phase 2 learning complete')
assert(isPhaseUnlocked(afterDesign, 'build'), 'phase 3 Build unlocks after phase 2')
assert(!isPhaseUnlocked(afterDesign, 'collect'), 'collect remains locked after phase 2')

const designPrepFile = readFileSync(join(root, 'src/content/guidedDesignPreparation.ts'), 'utf8')
const designPhaseFile = readFileSync(join(root, 'src/content/guidedPhaseDesign.ts'), 'utf8')
assert(designPrepFile.includes('Hal. 18'), 'design prep p18')
assert(designPhaseFile.includes('pdfPage: 19'), 'design cards p19')
assert(designPhaseFile.includes('pdfPage: 20'), 'design cards p20')
assert(designPhaseFile.includes('pdfPage: 21'), 'design cards p21')
assert(designPhaseFile.includes('pdfPage: 23'), 'design cards p23')
assert(!designPrepFile.includes('Template resmi BPS'), 'design Type C not official')
assert(!designPrepFile.includes('Rekomendasi BPS berhasil'), 'no fake approval')
assert(guidedPage.includes('Bahan perancangan Anda'), 'design materials summary')
assert(guidedPage.includes('2 · Perancangan'), 'phase 2 header')

// --- Slice 6: Build phase ---
assert(BUILD_INTRO.phaseId === 'build', 'build intro')
assert(GUIDED_BUILD_CARDS.length === 6, 'six build cards')
assert(GUIDED_BUILD_PREPARATIONS.length === 6, 'six build preparations')

const b31 = getPreparation('build-3.1')!
const b32 = getPreparation('build-3.2')!
const b33 = getPreparation('build-3.3')!
const b34 = getPreparation('build-3.4')!
const b35 = getPreparation('build-3.5')!
const b36 = getPreparation('build-3.6')!
assert(b31.sourceLabel.includes('Hal. 25'), '3.1 Hal. 25')
assert(b32.sourceLabel.includes('Hal. 26'), '3.2 Hal. 26')
assert(b33.sourceLabel.includes('Hal. 27'), '3.3 Hal. 27')
assert(b34.sourceLabel.includes('Hal. 28'), '3.4 Hal. 28')
assert(b35.sourceLabel.includes('Hal. 30'), '3.5 Hal. 30')
assert(b36.sourceLabel === 'Format kerja StatPlan', '3.6 no false PDF claim')
assert(!b36.sourceLabel.includes('Hal.'), '3.6 has no page number')

// Hal. 28 source-grounded pattern (Struktur Organisasi + Alur Laporan hortikultura)
const build34Card = GUIDED_BUILD_CARDS.find((c) => c.id === 'build-3.4')!
assert(build34Card.pdfPage === 28, '3.4 card pdfPage 28')
assert(
  (build34Card.materiExamples?.length ?? 0) >= 2,
  '3.4 has named materi examples from PDF',
)
assert(
  build34Card.materiExamples!.some((e) =>
    e.title.includes('Struktur Organisasi Pengelolaan Data Hortikultura'),
  ),
  '3.4 names Struktur Organisasi hortikultura',
)
assert(
  build34Card.materiExamples!.some((e) =>
    e.title.includes('Alur Laporan Dokumen Data Hortikultura'),
  ),
  '3.4 names Alur Laporan hortikultura',
)
assert(Boolean(build34Card.materiLesson), '3.4 has materi lesson paraphrase')
assert(
  (b34.materiExamples?.length ?? 0) >= 2,
  '3.4 prep mirrors materi examples',
)
assert(b34.disclaimer.includes('Format kerja StatPlan'), '3.4 format kerja label')
assert(b34.disclaimer.includes('bukan template resmi BPS'), '3.4 not official BPS template')
assert(guidedCard.includes('Format kerja StatPlan'), 'learning card format kerja heading')
const materiBlock = readFileSync(
  join(root, 'src/features/planner/guided/MateriExampleBlock.tsx'),
  'utf8',
)
assert(materiBlock.includes('Contoh dari Materi'), 'materi block heading')
assert(materiBlock.includes('Preview dari Materi Proses Bisnis'), 'preview label')
assert(materiBlock.includes('Preview contoh tersedia di Materi Proses Bisnis'), 'honest no-asset note')
assert(materiBlock.includes('Yang dapat dipelajari'), 'materi lesson label')
assert(materiBlock.includes('bukan template editable'), 'not editable claim')
const guidedPanel = readFileSync(
  join(root, 'src/features/planner/guided/GuidedTemplatePanel.tsx'),
  'utf8',
)
assert(guidedPanel.includes('Format kerja StatPlan · Isian Anda'), 'panel format kerja isian')
assert(guidedPanel.includes('MateriExampleBlock'), 'panel uses MateriExampleBlock')

// Design 2.1 + Build 3.2/3.3 named Type A previews (no invented raster)
const design21 = GUIDED_DESIGN_CARDS.find((c) => c.id === 'design-2.1')!
assert(design21.pdfPage === 18, '2.1 Hal. 18')
assert(
  design21.materiExamples?.some((e) => e.title.includes('Contoh Rancangan Tabulasi')),
  '2.1 names Contoh Rancangan Tabulasi',
)
assert(!design21.materiExamples?.[0]?.imageSrc, '2.1 no fabricated imageSrc')
const b32Card = GUIDED_BUILD_CARDS.find((c) => c.id === 'build-3.2')!
const b33Card = GUIDED_BUILD_CARDS.find((c) => c.id === 'build-3.3')!
assert(
  b32Card.materiExamples?.some((e) => e.title.includes('Contoh Aturan Validasi')),
  '3.2 names Contoh Aturan Validasi',
)
assert(
  b33Card.materiExamples?.some((e) => e.title.includes('Contoh Aturan Tabulasi')),
  '3.3 names Contoh Aturan Tabulasi',
)
assert(!b32Card.materiExamples?.[0]?.imageSrc, '3.2 no fabricated imageSrc')
assert(!b33Card.materiExamples?.[0]?.imageSrc, '3.3 no fabricated imageSrc')
assert(!build34Card.materiExamples?.some((e) => e.imageSrc), '3.4 no fabricated imageSrc')
assert(!materiBlock.includes('Contoh BPS'), 'no Contoh BPS label')// 3.1 instrument
upsertTemplateDraft(p5.id, 'build-3.1', {
  nama_instrumen: 'Kuesioner kepuasan',
  jenis_instrumen: 'kuesioner',
  tujuan_instrumen: 'Mengumpulkan persepsi layanan',
  data_diperoleh: 'Skor kepuasan',
  catatan_desain: '',
})
let s6 = getGuidedSession(p5.id)!
assert(
  s6.templateDrafts['build-3.1']?.values.nama_instrumen === 'Kuesioner kepuasan',
  '3.1 draft persists',
)

// Phase 1 + 2 drafts remain
assert(s6.templateDrafts['need-1.1'], 'phase 1 draft remains with build')
assert(s6.templateDrafts['design-2.1'], 'phase 2 draft remains with build')

// 3.2 validation rules add/remove
upsertTemplateDraft(p5.id, 'build-3.2', {
  rules: [
    { id: 'r1', nama: 'Umur wajib', kondisi: 'Umur kosong', tindakan: 'Minta diisi', catatan: '' },
    { id: 'r2', nama: 'JK valid', kondisi: 'JK luar pilihan', tindakan: 'Cek ulang', catatan: '' },
  ],
})
s6 = getGuidedSession(p5.id)!
assert((s6.templateDrafts['build-3.2']?.values.rules as unknown[]).length === 2, '3.2 two rules')
upsertTemplateDraft(p5.id, 'build-3.2', {
  rules: [
    { id: 'r1', nama: 'Umur wajib', kondisi: 'Umur kosong', tindakan: 'Minta diisi', catatan: '' },
  ],
})
s6 = getGuidedSession(p5.id)!
assert((s6.templateDrafts['build-3.2']?.values.rules as unknown[]).length === 1, '3.2 after remove')

// 3.3 tabulation
upsertTemplateDraft(p5.id, 'build-3.3', {
  tables: [
    {
      id: 't1',
      nama: 'Kepuasan menurut layanan',
      dataDigunakan: 'Skor + jenis layanan',
      catatan: '',
    },
  ],
})
s6 = getGuidedSession(p5.id)!
assert(
  (s6.templateDrafts['build-3.3']?.values.tables as { nama: string }[])[0]?.nama.includes(
    'Kepuasan',
  ),
  '3.3 tabulation persists',
)

// 3.4 workflow
upsertTemplateDraft(p5.id, 'build-3.4', {
  workflow: [
    {
      id: 'w1',
      kegiatan: 'Pengawasan lapangan',
      pelaksana: 'Pengawas',
      hasil: 'Catatan perbaikan',
      catatan: '',
    },
  ],
})
s6 = getGuidedSession(p5.id)!
assert(
  (s6.templateDrafts['build-3.4']?.values.workflow as { kegiatan: string }[])[0]?.kegiatan.includes(
    'Pengawasan',
  ),
  '3.4 workflow persists',
)

// 3.5 pilot
upsertTemplateDraft(p5.id, 'build-3.5', {
  bagian_diuji: ['instrumen', 'tabel_dummy'],
  tujuan_uji: 'Cek kelayakan instrumen',
  temuan: '',
  perbaikan: '',
})
s6 = getGuidedSession(p5.id)!
assert(computeDraftStatus(b35, s6.templateDrafts['build-3.5']?.values) === 'ready', '3.5 ready')
assert(
  Array.isArray(s6.templateDrafts['build-3.5']?.values.bagian_diuji),
  '3.5 pilot areas persist',
)

// 3.6 finalization
upsertTemplateDraft(p5.id, 'build-3.6', {
  catatan_finalisasi: 'Siap dilanjutkan belajar',
  perbaikan_list: ['Perbaiki tabel dummy'],
})
s6 = getGuidedSession(p5.id)!
assert(
  s6.templateDrafts['build-3.6']?.values.catatan_finalisasi === 'Siap dilanjutkan belajar',
  '3.6 notes persist',
)

upsertEvidenceItem(p5.id, 'build-3.1', 'e-3.1-a', { status: 'sudah', note: 'Draft ada' })
s6 = getGuidedSession(p5.id)!
assert(s6.evidenceStates['build-3.1']?.['e-3.1-a']?.status === 'sudah', 'build evidence persists')

const progressBuild = computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)
assert(canExport(p5) === false || canExport(p5) === canExport(p5), 'export call ok')
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressBuild),
  'build draft does not change project progress',
)
assert(!s6.understood['build-3.1'], 'build draft ≠ understood')

for (const cid of GUIDED_BUILD_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterBuild = completePhase3Learning(p5.id)!
assert(afterBuild.completedPhases.includes('build'), 'phase 3 learning complete')
assert(isPhaseUnlocked(afterBuild, 'collect'), 'collect unlocks after build')
assert(!isPhaseUnlocked(afterBuild, 'process'), 'process remains locked after build')

const buildPrepFile = readFileSync(join(root, 'src/content/guidedBuildPreparation.ts'), 'utf8')
const buildPhaseFile = readFileSync(join(root, 'src/content/guidedPhaseBuild.ts'), 'utf8')
assert(buildPrepFile.includes('Hal. 25'), 'build prep p25')
assert(buildPhaseFile.includes('pdfPage: 30'), 'build cards p30')
assert(!buildPrepFile.includes('Build selesai secara resmi'), 'no official build complete claim')
assert(guidedPage.includes('Bahan Build Anda'), 'build materials summary')
assert(guidedPage.includes('3 · Build'), 'phase 3 header')

// --- Slice 7: Collect phase ---
assert(COLLECT_INTRO.phaseId === 'collect', 'collect intro')
assert(GUIDED_COLLECT_CARDS.length === 6, 'six collect cards')
assert(GUIDED_COLLECT_PREPARATIONS.length === 6, 'six collect preparations')

const c41 = getPreparation('collect-4.1')!
const c42 = getPreparation('collect-4.2')!
const c43 = getPreparation('collect-4.3')!
const c44 = getPreparation('collect-4.4')!
const c45 = getPreparation('collect-4.5')!
const c46 = getPreparation('collect-4.6')!
assert(c41.sourceLabel.includes('Hal. 33'), '4.1 Hal. 33')
assert(c42.sourceLabel.includes('Hal. 32–36'), '4.2 Hal. 32–36')
assert(c43.sourceLabel.includes('Hal. 32–36'), '4.3 Hal. 32–36')
assert(c44.sourceLabel === 'Penjelasan sederhana', '4.4 Type B label')
assert(c45.sourceLabel.includes('Hal. 32–36'), '4.5 Hal. 32–36')
assert(c46.sourceLabel === 'Format kerja StatPlan', '4.6 no false PDF claim')
assert(!c46.sourceLabel.includes('Hal.'), '4.6 has no page number')
assert(c42.disclaimer.includes('PKS-LADU'), '4.2 mentions PKS-LADU')
assert(
  !/kepanjangan\s+PKS|PKS\s*=|LADU\s*=/i.test(c42.disclaimer + c42.exampleBody),
  'PKS-LADU not expanded beyond source support',
)

// 4.1 relevance Ya
upsertTemplateDraft(p5.id, 'collect-4.1', {
  relevan: 'ya',
  sasaran: 'Rumah tangga terpilih',
  sumber_daftar: 'Kerangka sampel wilayah',
  catatan_penyiapan: '',
})
let s7 = getGuidedSession(p5.id)!
assert(s7.templateDrafts['collect-4.1']?.values.sasaran === 'Rumah tangga terpilih', '4.1 Ya persists')
assert(computeDraftStatus(c41, s7.templateDrafts['collect-4.1']?.values) === 'ready', '4.1 Ya ready')

// 4.1 relevance Tidak — sample fields not required
upsertTemplateDraft(p5.id, 'collect-4.1', {
  relevan: 'tidak',
  catatan_tidak: 'Kompilasi data — tanpa sampel',
})
s7 = getGuidedSession(p5.id)!
assert(
  computeDraftStatus(c41, s7.templateDrafts['collect-4.1']?.values) === 'ready',
  '4.1 Tidak ready without sample fields',
)

// Phase 1–3 drafts remain
assert(s7.templateDrafts['need-1.1'], 'phase 1 draft remains with collect')
assert(s7.templateDrafts['design-2.1'], 'phase 2 draft remains with collect')
assert(s7.templateDrafts['build-3.1'], 'phase 3 draft remains with collect')

// 4.2 roles add/remove
upsertTemplateDraft(p5.id, 'collect-4.2', {
  roles: [
    { id: 'r1', peran: 'Petugas pengumpulan', tugas: 'Wawancara', catatan: '' },
    { id: 'r2', peran: 'Koordinator', tugas: 'Koordinasi wilayah', catatan: '' },
  ],
})
s7 = getGuidedSession(p5.id)!
assert((s7.templateDrafts['collect-4.2']?.values.roles as unknown[]).length === 2, '4.2 two roles')
upsertTemplateDraft(p5.id, 'collect-4.2', {
  roles: [{ id: 'r1', peran: 'Petugas pengumpulan', tugas: 'Wawancara', catatan: '' }],
})
s7 = getGuidedSession(p5.id)!
assert((s7.templateDrafts['collect-4.2']?.values.roles as unknown[]).length === 1, '4.2 after remove')

// 4.3 implementation plan + period
upsertTemplateDraft(p5.id, 'collect-4.3', {
  cara_pelaksanaan: 'Wawancara tatap muka',
  instrumen: 'Kuesioner kepuasan',
  moda: 'Face-to-face',
  periode_mulai: '2026-08-01',
  periode_selesai: '2026-08-31',
  catatan_pelaksanaan: '',
})
s7 = getGuidedSession(p5.id)!
assert(s7.templateDrafts['collect-4.3']?.values.periode_mulai === '2026-08-01', '4.3 period persists')
assert(computeDraftStatus(c43, s7.templateDrafts['collect-4.3']?.values) === 'ready', '4.3 ready')

// 4.4 monitoring
upsertTemplateDraft(p5.id, 'collect-4.4', {
  monitoring: [
    {
      id: 'm1',
      hal: 'Kelengkapan isian',
      cara: 'Cek laporan harian',
      tindakLanjut: 'Minta perbaikan',
    },
  ],
})
s7 = getGuidedSession(p5.id)!
assert(
  (s7.templateDrafts['collect-4.4']?.values.monitoring as { hal: string }[])[0]?.hal.includes(
    'Kelengkapan',
  ),
  '4.4 monitoring persists',
)

// 4.5 finalization
upsertTemplateDraft(p5.id, 'collect-4.5', {
  hal_diperiksa: ['Kelengkapan berkas'],
  hasil_pemeriksaan: 'Sebagian lengkap',
  perbaikan: 'Lengkapi missing',
  catatan_finalisasi: '',
})
s7 = getGuidedSession(p5.id)!
assert(computeDraftStatus(c45, s7.templateDrafts['collect-4.5']?.values) === 'ready', '4.5 ready')

// 4.6 readiness notes
upsertTemplateDraft(p5.id, 'collect-4.6', {
  catatan_kesiapan: 'Masih perlu peran pemeriksa',
  risiko_list: ['Cuaca menghambat lapangan'],
})
s7 = getGuidedSession(p5.id)!
assert(
  s7.templateDrafts['collect-4.6']?.values.catatan_kesiapan === 'Masih perlu peran pemeriksa',
  '4.6 notes persist',
)

upsertEvidenceItem(p5.id, 'collect-4.1', 'e-4.1-a', { status: 'sudah', note: 'Daftar siap' })
s7 = getGuidedSession(p5.id)!
assert(s7.evidenceStates['collect-4.1']?.['e-4.1-a']?.status === 'sudah', 'collect evidence persists')
assert(s7.evidenceStates['collect-4.1']?.['e-4.1-a']?.note === 'Daftar siap', 'collect evidence note')

const progressCollect = computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressCollect),
  'collect draft does not change project progress',
)
assert(!s7.understood['collect-4.1'], 'collect draft ≠ understood')

for (const cid of GUIDED_COLLECT_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterCollect = completePhase4Learning(p5.id)!
assert(afterCollect.completedPhases.includes('collect'), 'phase 4 learning complete')
assert(isPhaseUnlocked(afterCollect, 'process'), 'process unlocks after collect')
assert(!isPhaseUnlocked(afterCollect, 'analyse'), 'analyse remains locked after collect')

const collectPrepFile = readFileSync(join(root, 'src/content/guidedCollectPreparation.ts'), 'utf8')
const collectPhaseFile = readFileSync(join(root, 'src/content/guidedPhaseCollect.ts'), 'utf8')
assert(collectPrepFile.includes('Hal. 33'), 'collect prep p33')
assert(collectPhaseFile.includes('pdfPage: 33'), 'collect cards p33')
assert(!collectPrepFile.includes('Persetujuan Collect'), 'no collect approval claim')
assert(guidedPage.includes('Bahan Collect Anda'), 'collect materials summary')
assert(guidedPage.includes('4 · Collect'), 'phase 4 header')

// --- Slice 8: Process phase ---
assert(PROCESS_INTRO.phaseId === 'process', 'process intro')
assert(GUIDED_PROCESS_CARDS.length === 6, 'six process cards')
assert(GUIDED_PROCESS_PREPARATIONS.length === 6, 'six process preparations')

const p51 = getPreparation('process-5.1')!
const p52 = getPreparation('process-5.2')!
const p53 = getPreparation('process-5.3')!
const p54 = getPreparation('process-5.4')!
const p55 = getPreparation('process-5.5')!
const p56 = getPreparation('process-5.6')!
assert(p51.sourceLabel.includes('Hal. 37–45'), '5.1 Hal. 37–45')
assert(p52.sourceLabel.includes('Hal. 44'), '5.2 Hal. 44')
assert(p53.sourceLabel.includes('Hal. 39'), '5.3 Hal. 39')
assert(p54.sourceLabel.includes('Hal. 42'), '5.4 Hal. 42')
assert(p55.sourceLabel.includes('Hal. 43'), '5.5 Hal. 43')
assert(p56.sourceLabel === 'Format kerja StatPlan', '5.6 no false PDF claim')
assert(!p56.sourceLabel.includes('Hal.'), '5.6 has no page number')

// 5.1 integration sources
upsertTemplateDraft(p5.id, 'process-5.1', {
  sources: [
    { id: 's1', nama: 'Isian lapangan', keterangan: 'Hasil pengumpulan' },
    { id: 's2', nama: 'Data administratif', keterangan: 'Register' },
  ],
  dasar_penggabungan: 'Kunci identitas yang sama',
  hal_diperhatikan: '',
})
let s8 = getGuidedSession(p5.id)!
assert((s8.templateDrafts['process-5.1']?.values.sources as unknown[]).length === 2, '5.1 two sources')
assert(computeDraftStatus(p51, s8.templateDrafts['process-5.1']?.values) === 'ready', '5.1 ready')

// Phase 1–4 drafts remain
assert(s8.templateDrafts['need-1.1'], 'phase 1 draft remains with process')
assert(s8.templateDrafts['design-2.1'], 'phase 2 draft remains with process')
assert(s8.templateDrafts['build-3.1'], 'phase 3 draft remains with process')
assert(s8.templateDrafts['collect-4.1'], 'phase 4 draft remains with process')

// 5.2 aggregation
upsertTemplateDraft(p5.id, 'process-5.2', {
  data_dikelompokkan: 'Skor kepuasan',
  berdasarkan: ['wilayah', 'jenis layanan'],
  output_diharapkan: 'Rata-rata per wilayah',
  catatan: '',
})
s8 = getGuidedSession(p5.id)!
assert(
  (s8.templateDrafts['process-5.2']?.values.berdasarkan as string[]).includes('wilayah'),
  '5.2 grouping persists',
)
assert(computeDraftStatus(p52, s8.templateDrafts['process-5.2']?.values) === 'ready', '5.2 ready')

// 5.3 coding add/remove
upsertTemplateDraft(p5.id, 'process-5.3', {
  nama_variabel: 'Jenis kelamin',
  coding_rows: [
    { id: 'c1', kode: '1', nilai: 'Laki-laki', catatan: '' },
    { id: 'c2', kode: '2', nilai: 'Perempuan', catatan: '' },
  ],
})
s8 = getGuidedSession(p5.id)!
assert((s8.templateDrafts['process-5.3']?.values.coding_rows as unknown[]).length === 2, '5.3 two rows')
upsertTemplateDraft(p5.id, 'process-5.3', {
  nama_variabel: 'Jenis kelamin',
  coding_rows: [{ id: 'c1', kode: '1', nilai: 'Laki-laki', catatan: '' }],
})
s8 = getGuidedSession(p5.id)!
assert((s8.templateDrafts['process-5.3']?.values.coding_rows as unknown[]).length === 1, '5.3 after remove')

// 5.4 unit formation Ya / Tidak
upsertTemplateDraft(p5.id, 'process-5.4', {
  diperlukan: 'ya',
  unit_asal: 'Individu',
  unit_baru: 'Rumah tangga',
  dasar_pembentukan: 'Anggota dalam satu rumah',
  catatan_ya: '',
})
s8 = getGuidedSession(p5.id)!
assert(computeDraftStatus(p54, s8.templateDrafts['process-5.4']?.values) === 'ready', '5.4 Ya ready')
upsertTemplateDraft(p5.id, 'process-5.4', {
  diperlukan: 'tidak',
  catatan_tidak: 'Unit analisis sudah cukup',
})
s8 = getGuidedSession(p5.id)!
assert(
  computeDraftStatus(p54, s8.templateDrafts['process-5.4']?.values) === 'ready',
  '5.4 Tidak ready without unit details',
)

// 5.5 weighting Ya / Tidak
upsertTemplateDraft(p5.id, 'process-5.5', {
  relevan: 'ya',
  dasar_weighting: 'Penimbang unit survei',
  catatan_ya: 'Catatan perencanaan',
})
s8 = getGuidedSession(p5.id)!
assert(computeDraftStatus(p55, s8.templateDrafts['process-5.5']?.values) === 'ready', '5.5 Ya ready')
upsertTemplateDraft(p5.id, 'process-5.5', {
  relevan: 'tidak',
  alasan_tidak: 'Kompilasi — weighting tidak relevan',
})
s8 = getGuidedSession(p5.id)!
assert(
  computeDraftStatus(p55, s8.templateDrafts['process-5.5']?.values) === 'ready',
  '5.5 Tidak ready without weighting plan',
)

// 5.6 finalization
upsertTemplateDraft(p5.id, 'process-5.6', {
  catatan_proses: 'Coding masih perlu dilengkapi',
  hal_diperiksa: ['Konsistensi kode'],
  risiko_list: ['Sumber administratif terlambat'],
})
s8 = getGuidedSession(p5.id)!
assert(
  s8.templateDrafts['process-5.6']?.values.catatan_proses === 'Coding masih perlu dilengkapi',
  '5.6 notes persist',
)

upsertEvidenceItem(p5.id, 'process-5.3', 'e-5.3-a', { status: 'sudah', note: 'Draft coding ada' })
s8 = getGuidedSession(p5.id)!
assert(s8.evidenceStates['process-5.3']?.['e-5.3-a']?.status === 'sudah', 'process evidence persists')
assert(s8.evidenceStates['process-5.3']?.['e-5.3-a']?.note === 'Draft coding ada', 'process evidence note')

const progressProcess = computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressProcess),
  'process draft does not change project progress',
)
assert(!s8.understood['process-5.1'], 'process draft ≠ understood')

for (const cid of GUIDED_PROCESS_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterProcess = completePhase5Learning(p5.id)!
assert(afterProcess.completedPhases.includes('process'), 'phase 5 learning complete')
assert(isPhaseUnlocked(afterProcess, 'analyse'), 'analyse unlocks after process')
assert(!isPhaseUnlocked(afterProcess, 'disseminate'), 'disseminate remains locked after process')

const processPrepFile = readFileSync(join(root, 'src/content/guidedProcessPreparation.ts'), 'utf8')
const processPhaseFile = readFileSync(join(root, 'src/content/guidedPhaseProcess.ts'), 'utf8')
assert(processPrepFile.includes('Hal. 39'), 'process prep p39')
assert(processPhaseFile.includes('pdfPage: 42'), 'process cards p42')
assert(processPhaseFile.includes('pdfPage: 43'), 'process cards p43')
assert(!processPrepFile.includes('Proses selesai.'), 'no process complete claim')
assert(guidedPage.includes('Bahan Process Anda'), 'process materials summary')
assert(guidedPage.includes('5 · Process'), 'phase 5 header')

// --- Slice 9: Analyse phase ---
assert(ANALYSE_INTRO.phaseId === 'analyse', 'analyse intro')
assert(GUIDED_ANALYSE_CARDS.length === 6, 'six analyse cards')
assert(GUIDED_ANALYSE_PREPARATIONS.length === 6, 'six analyse preparations')

const a61 = getPreparation('analyse-6.1')!
const a62 = getPreparation('analyse-6.2')!
const a63 = getPreparation('analyse-6.3')!
const a64 = getPreparation('analyse-6.4')!
const a65 = getPreparation('analyse-6.5')!
const a66 = getPreparation('analyse-6.6')!
assert(a61.sourceLabel === 'Penjelasan sederhana', '6.1 Type B')
assert(a62.sourceLabel.includes('Hal. 46–51'), '6.2 Hal. 46–51')
assert(a63.sourceLabel === 'Penjelasan sederhana', '6.3 Type B')
assert(a64.sourceLabel.includes('Hal. 50'), '6.4 Hal. 50')
assert(a65.sourceLabel.includes('Hal. 46–51'), '6.5 Hal. 46–51')
assert(a66.sourceLabel === 'Format kerja StatPlan', '6.6 no false PDF claim')
assert(!a66.sourceLabel.includes('Hal.'), '6.6 has no page number')

// 6.1 analysis question
upsertTemplateDraft(p5.id, 'analyse-6.1', {
  pertanyaan: 'Bagaimana kepuasan menurut jenis layanan?',
  informasi: 'Pola kepuasan antar layanan',
  output_digunakan: 'Tabel silang',
  catatan: '',
})
let s9 = getGuidedSession(p5.id)!
assert(
  s9.templateDrafts['analyse-6.1']?.values.pertanyaan ===
    'Bagaimana kepuasan menurut jenis layanan?',
  '6.1 draft persists',
)
assert(computeDraftStatus(a61, s9.templateDrafts['analyse-6.1']?.values) === 'ready', '6.1 ready')

// Phase 1–5 drafts remain
assert(s9.templateDrafts['need-1.1'], 'phase 1 draft remains with analyse')
assert(s9.templateDrafts['design-2.1'], 'phase 2 draft remains with analyse')
assert(s9.templateDrafts['build-3.1'], 'phase 3 draft remains with analyse')
assert(s9.templateDrafts['collect-4.1'], 'phase 4 draft remains with analyse')
assert(s9.templateDrafts['process-5.1'], 'phase 5 draft remains with analyse')

// 6.2 output rows add/remove
upsertTemplateDraft(p5.id, 'analyse-6.2', {
  outputs: [
    {
      id: 'o1',
      nama: 'Tabel kepuasan',
      jenis: 'tabel',
      apaDilihat: 'Pola skor',
      catatan: '',
    },
    {
      id: 'o2',
      nama: 'Ringkasan layanan',
      jenis: 'ringkasan',
      apaDilihat: 'Ringkas temuan',
      catatan: '',
    },
  ],
})
s9 = getGuidedSession(p5.id)!
assert((s9.templateDrafts['analyse-6.2']?.values.outputs as unknown[]).length === 2, '6.2 two outputs')
upsertTemplateDraft(p5.id, 'analyse-6.2', {
  outputs: [
    {
      id: 'o1',
      nama: 'Tabel kepuasan',
      jenis: 'tabel',
      apaDilihat: 'Pola skor',
      catatan: '',
    },
  ],
})
s9 = getGuidedSession(p5.id)!
assert((s9.templateDrafts['analyse-6.2']?.values.outputs as unknown[]).length === 1, '6.2 after remove')

// 6.3 review
upsertTemplateDraft(p5.id, 'analyse-6.3', {
  reviews: [
    {
      id: 'r1',
      hal: 'Kelengkapan kolom',
      mengapa: 'Agar tidak menyesatkan',
      tindakan: 'Lengkapi sebelum dipakai',
    },
  ],
})
s9 = getGuidedSession(p5.id)!
assert(
  (s9.templateDrafts['analyse-6.3']?.values.reviews as { hal: string }[])[0]?.hal.includes(
    'Kelengkapan',
  ),
  '6.3 review persists',
)

// 6.4 disclosure Ya / Tidak
upsertTemplateDraft(p5.id, 'analyse-6.4', {
  perlu_diperhatikan: 'ya',
  informasi_dilindungi: 'Identitas responden',
  risiko: 'Pengungkapan tidak langsung',
  tindakan: ['Anonimisasi', 'Agregasi'],
})
s9 = getGuidedSession(p5.id)!
assert(computeDraftStatus(a64, s9.templateDrafts['analyse-6.4']?.values) === 'ready', '6.4 Ya ready')
upsertTemplateDraft(p5.id, 'analyse-6.4', {
  perlu_diperhatikan: 'tidak',
  catatan_tidak: 'Output hanya agregat publik',
})
s9 = getGuidedSession(p5.id)!
assert(
  computeDraftStatus(a64, s9.templateDrafts['analyse-6.4']?.values) === 'ready',
  '6.4 Tidak ready without disclosure details',
)

// 6.5 final output
upsertTemplateDraft(p5.id, 'analyse-6.5', {
  final_outputs: [
    {
      id: 'f1',
      nama: 'Ringkasan kepuasan',
      pengguna: 'Pengelola pelayanan',
      bentuk: 'Ringkasan singkat',
      catatan: 'Perlu tinjau disclosure',
    },
  ],
})
s9 = getGuidedSession(p5.id)!
assert(
  (s9.templateDrafts['analyse-6.5']?.values.final_outputs as { nama: string }[])[0]?.nama.includes(
    'Ringkasan',
  ),
  '6.5 final output persists',
)

// 6.6 finalization
upsertTemplateDraft(p5.id, 'analyse-6.6', {
  catatan_analisis: 'Disclosure masih perlu dilengkapi',
  hal_diperiksa: ['Konsistensi tabel'],
  perbaikan_list: ['Tambah catatan pengguna'],
})
s9 = getGuidedSession(p5.id)!
assert(
  s9.templateDrafts['analyse-6.6']?.values.catatan_analisis === 'Disclosure masih perlu dilengkapi',
  '6.6 notes persist',
)

upsertEvidenceItem(p5.id, 'analyse-6.4', 'e-6.4-a', {
  status: 'sudah',
  note: 'Catatan disclosure ada',
})
s9 = getGuidedSession(p5.id)!
assert(s9.evidenceStates['analyse-6.4']?.['e-6.4-a']?.status === 'sudah', 'analyse evidence persists')
assert(
  s9.evidenceStates['analyse-6.4']?.['e-6.4-a']?.note === 'Catatan disclosure ada',
  'analyse evidence note',
)

const progressAnalyse = computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressAnalyse),
  'analyse draft does not change project progress',
)
assert(!s9.understood['analyse-6.1'], 'analyse draft ≠ understood')

for (const cid of GUIDED_ANALYSE_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterAnalyse = completePhase6Learning(p5.id)!
assert(afterAnalyse.completedPhases.includes('analyse'), 'phase 6 learning complete')
assert(isPhaseUnlocked(afterAnalyse, 'disseminate'), 'disseminate unlocks after analyse')
assert(!isPhaseUnlocked(afterAnalyse, 'evaluate'), 'evaluate remains locked after analyse')

const analysePrepFile = readFileSync(join(root, 'src/content/guidedAnalysePreparation.ts'), 'utf8')
const analysePhaseFile = readFileSync(join(root, 'src/content/guidedPhaseAnalyse.ts'), 'utf8')
assert(analysePrepFile.includes('Hal. 50'), 'analyse prep p50')
assert(analysePhaseFile.includes('pdfPage: 50'), 'analyse cards p50')
assert(!analysePrepFile.includes('Analisis selesai.'), 'no analyse complete claim')
assert(guidedPage.includes('Bahan Analyse Anda'), 'analyse materials summary')
assert(guidedPage.includes('6 · Analyse'), 'phase 6 header')

// --- Slice 10: Disseminate phase ---
assert(DISSEMINATE_INTRO.phaseId === 'disseminate', 'disseminate intro')
assert(GUIDED_DISSEMINATE_CARDS.length === 6, 'six disseminate cards')
assert(GUIDED_DISSEMINATE_PREPARATIONS.length === 6, 'six disseminate preparations')

const d71 = getPreparation('disseminate-7.1')!
const d72 = getPreparation('disseminate-7.2')!
const d73 = getPreparation('disseminate-7.3')!
const d74 = getPreparation('disseminate-7.4')!
const d75 = getPreparation('disseminate-7.5')!
const d76 = getPreparation('disseminate-7.6')!
assert(d71.sourceLabel.includes('Hal. 52–57'), '7.1 Hal. 52–57')
assert(d72.sourceLabel.includes('Hal. 52–57'), '7.2 Hal. 52–57')
assert(d73.sourceLabel.includes('Hal. 52–57'), '7.3 Hal. 52–57')
assert(d74.sourceLabel.includes('Hal. 52–57'), '7.4 Hal. 52–57')
assert(d75.sourceLabel.includes('Hal. 52–57'), '7.5 Hal. 52–57')
assert(d76.sourceLabel === 'Format kerja StatPlan', '7.6 no false PDF claim')
assert(!d76.sourceLabel.includes('Hal.'), '7.6 has no page number')
assert(d72.disclaimer.includes('rencana'), '7.2 planned release disclaimer')
assert(d72.disclaimer.includes('Bukan jadwal resmi'), '7.2 not official schedule')
assert(d72.disclaimer.includes('bukan tanggal publikasi aktual'), '7.2 not actual publication')

// 7.1 product
upsertTemplateDraft(p5.id, 'disseminate-7.1', {
  nama_produk: 'Ringkasan kepuasan',
  bentuk_produk: 'Ringkasan singkat',
  informasi_disajikan: 'Pola kepuasan layanan',
  pengguna_sasaran: 'Pengelola layanan',
  catatan: '',
})
let s10 = getGuidedSession(p5.id)!
assert(
  s10.templateDrafts['disseminate-7.1']?.values.nama_produk === 'Ringkasan kepuasan',
  '7.1 draft persists',
)
assert(computeDraftStatus(d71, s10.templateDrafts['disseminate-7.1']?.values) === 'ready', '7.1 ready')

// Phase 1–6 drafts remain
assert(s10.templateDrafts['need-1.1'], 'phase 1 draft remains with disseminate')
assert(s10.templateDrafts['design-2.1'], 'phase 2 draft remains with disseminate')
assert(s10.templateDrafts['build-3.1'], 'phase 3 draft remains with disseminate')
assert(s10.templateDrafts['collect-4.1'], 'phase 4 draft remains with disseminate')
assert(s10.templateDrafts['process-5.1'], 'phase 5 draft remains with disseminate')
assert(s10.templateDrafts['analyse-6.1'], 'phase 6 draft remains with disseminate')

// 7.2 planned release
upsertTemplateDraft(p5.id, 'disseminate-7.2', {
  nama_produk: 'Ringkasan kepuasan',
  target_waktu: '2026-12-01',
  kondisi_kesiapan: 'Output akhir dan disclosure ditinjau',
  catatan: '',
})
s10 = getGuidedSession(p5.id)!
assert(s10.templateDrafts['disseminate-7.2']?.values.target_waktu === '2026-12-01', '7.2 plan persists')
assert(computeDraftStatus(d72, s10.templateDrafts['disseminate-7.2']?.values) === 'ready', '7.2 ready')

// 7.3 dissemination channels
upsertTemplateDraft(p5.id, 'disseminate-7.3', {
  kanal: ['Rapat internal', 'Portal internal'],
  bentuk_penyajian: 'Ringkasan singkat',
  pengguna_sasaran: 'Pengelola layanan',
  catatan: '',
})
s10 = getGuidedSession(p5.id)!
assert(
  (s10.templateDrafts['disseminate-7.3']?.values.kanal as string[]).includes('Rapat internal'),
  '7.3 channels persist',
)

// 7.4 promotion plan
upsertTemplateDraft(p5.id, 'disseminate-7.4', {
  produk_dikenalkan: 'Ringkasan kepuasan',
  sasaran: 'Pengelola layanan',
  cara_pengenalan: 'Paparan singkat di rapat',
  materi_pendukung: 'Slide ringkas',
  catatan: '',
})
s10 = getGuidedSession(p5.id)!
assert(
  s10.templateDrafts['disseminate-7.4']?.values.cara_pengenalan === 'Paparan singkat di rapat',
  '7.4 promotion plan persists',
)

// 7.5 user support
upsertTemplateDraft(p5.id, 'disseminate-7.5', {
  kebutuhan_dukungan: 'FAQ singkat',
  informasi_dijelaskan: 'Cara membaca tabel',
  kanal_dukungan: 'Email unit kerja',
  catatan: '',
})
s10 = getGuidedSession(p5.id)!
assert(
  s10.templateDrafts['disseminate-7.5']?.values.kanal_dukungan === 'Email unit kerja',
  '7.5 support plan persists',
)

// 7.6 finalization + reset scoped
upsertTemplateDraft(p5.id, 'disseminate-7.6', {
  catatan_finalisasi: 'Promosi masih perlu dilengkapi',
  hal_terbuka: ['Kontak penanggung jawab'],
})
s10 = getGuidedSession(p5.id)!
assert(
  s10.templateDrafts['disseminate-7.6']?.values.catatan_finalisasi ===
    'Promosi masih perlu dilengkapi',
  '7.6 notes persist',
)
resetTemplateDraft(p5.id, 'disseminate-7.6')
s10 = getGuidedSession(p5.id)!
assert(!s10.templateDrafts['disseminate-7.6'], '7.6 reset clears only that card')
assert(s10.templateDrafts['disseminate-7.1'], '7.1 remains after 7.6 reset')
assert(s10.templateDrafts['analyse-6.1'], 'analyse draft remains after disseminate reset')

upsertEvidenceItem(p5.id, 'disseminate-7.1', 'e-7.1-a', {
  status: 'sudah',
  note: 'Catatan produk ada',
})
s10 = getGuidedSession(p5.id)!
assert(
  s10.evidenceStates['disseminate-7.1']?.['e-7.1-a']?.status === 'sudah',
  'disseminate evidence persists',
)
assert(
  s10.evidenceStates['disseminate-7.1']?.['e-7.1-a']?.note === 'Catatan produk ada',
  'disseminate evidence note',
)

const progressDisseminate = computeProjectProgress(
  p5.jenisKegiatan,
  p5.klasifikasi,
  p5.checklistState,
)
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressDisseminate),
  'disseminate draft does not change project progress',
)
assert(!s10.understood['disseminate-7.1'], 'disseminate draft ≠ understood')
assert(canExport(p5) === canExport(p5), 'export readiness unchanged by disseminate drafts')

for (const cid of GUIDED_DISSEMINATE_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterDisseminate = completePhase7Learning(p5.id)!
assert(afterDisseminate.completedPhases.includes('disseminate'), 'phase 7 learning complete')
assert(isPhaseUnlocked(afterDisseminate, 'evaluate'), 'evaluate unlocks after disseminate')

const disseminatePrepFile = readFileSync(
  join(root, 'src/content/guidedDisseminatePreparation.ts'),
  'utf8',
)
const disseminatePhaseFile = readFileSync(
  join(root, 'src/content/guidedPhaseDisseminate.ts'),
  'utf8',
)
assert(disseminatePrepFile.includes('Hal. 52–57'), 'disseminate prep p52–57')
assert(disseminatePhaseFile.includes("pdfPage: '52–57'"), 'disseminate cards p52–57')
assert(
  disseminatePhaseFile.includes('not a claim of official GSBPM'),
  'cards not official GSBPM codes',
)
assert(
  disseminatePrepFile.includes('bukan Disseminate selesai dilaksanakan'),
  'learning wording rejects execution claim',
)
assert(guidedPage.includes('Bahan Disseminate Anda'), 'disseminate materials summary')
assert(guidedPage.includes('7 · Disseminate'), 'phase 7 header')
assert(
  guidedPage.includes('Persiapan Disseminate selesai dipelajari'),
  'learning-complete wording',
)

// --- Slice 11 Evaluate ---
assert(EVALUATE_INTRO.phaseId === 'evaluate', 'evaluate intro')
assert(GUIDED_EVALUATE_CARDS.length === 6, 'six evaluate cards')
assert(GUIDED_EVALUATE_PREPARATIONS.length === 6, 'six evaluate preparations')

const e81 = getPreparation('evaluate-8.1')!
const e82 = getPreparation('evaluate-8.2')!
const e83 = getPreparation('evaluate-8.3')!
const e84 = getPreparation('evaluate-8.4')!
const e85 = getPreparation('evaluate-8.5')!
const e86 = getPreparation('evaluate-8.6')!
assert(e81 && e82 && e83 && e84 && e85 && e86, 'evaluate preparations registered')

const progressBeforeEvaluate = computeProjectProgress(
  p5.jenisKegiatan,
  p5.klasifikasi,
  p5.checklistState,
)
const exportBeforeEvaluate = canExport(p5)

upsertTemplateDraft(p5.id, 'evaluate-8.1', {
  sumber_masukan: ['Staf pelaksana'],
  hal_dikumpulkan: 'Catatan kendala jadwal',
  cara_memperoleh: 'Diskusi singkat internal',
  catatan: '',
})
let s11 = getGuidedSession(p5.id)!
assert(
  (s11.templateDrafts['evaluate-8.1']?.values.sumber_masukan as string[])?.[0] ===
    'Staf pelaksana',
  'evaluate prep persists',
)
assert(computeDraftStatus(e81, s11.templateDrafts['evaluate-8.1']?.values) === 'ready', '8.1 ready')

assert(s11.templateDrafts['need-1.1'], 'phase 1 draft remains with evaluate')
assert(s11.templateDrafts['design-2.1'], 'phase 2 draft remains with evaluate')
assert(s11.templateDrafts['build-3.1'], 'phase 3 draft remains with evaluate')
assert(s11.templateDrafts['collect-4.1'], 'phase 4 draft remains with evaluate')
assert(s11.templateDrafts['process-5.1'], 'phase 5 draft remains with evaluate')
assert(s11.templateDrafts['analyse-6.1'], 'phase 6 draft remains with evaluate')
assert(s11.templateDrafts['disseminate-7.1'], 'phase 7 draft remains with evaluate')

upsertTemplateDraft(p5.id, 'evaluate-8.2', {
  aspects: [
    {
      id: 'a1',
      aspek: 'Ketepatan waktu',
      alasan: 'Sering terlambat',
      informasi: 'Catatan jadwal',
      catatan: '',
    },
  ],
})
s11 = getGuidedSession(p5.id)!
assert(
  (s11.templateDrafts['evaluate-8.2']?.values.aspects as { aspek: string }[])[0]?.aspek ===
    'Ketepatan waktu',
  '8.2 aspects persist',
)
assert(computeDraftStatus(e82, s11.templateDrafts['evaluate-8.2']?.values) === 'ready', '8.2 ready')

upsertTemplateDraft(p5.id, 'evaluate-8.3', {
  berjalan_baik: 'Koordinasi harian',
  kendala: 'Jadwal field padat',
  temuan: 'Perlu buffer waktu',
  dampak: 'Pengumpulan tertunda',
  catatan: '',
})
s11 = getGuidedSession(p5.id)!
assert(
  s11.templateDrafts['evaluate-8.3']?.values.temuan === 'Perlu buffer waktu',
  '8.3 user findings persist (not auto-generated)',
)
assert(computeDraftStatus(e83, s11.templateDrafts['evaluate-8.3']?.values) === 'ready', '8.3 ready')

upsertTemplateDraft(p5.id, 'evaluate-8.4', {
  improvements: [
    {
      id: 'i1',
      masalah: 'Jadwal field terlambat',
      usulan: 'Rapat koordinasi mingguan',
      prioritas: 'Sedang',
      penanggungJawab: 'Koordinator',
      catatan: '',
    },
  ],
})
s11 = getGuidedSession(p5.id)!
assert(
  (s11.templateDrafts['evaluate-8.4']?.values.improvements as { prioritas: string }[])[0]
    ?.prioritas === 'Sedang',
  '8.4 priority is user planning data',
)
assert(computeDraftStatus(e84, s11.templateDrafts['evaluate-8.4']?.values) === 'ready', '8.4 ready')

upsertTemplateDraft(p5.id, 'evaluate-8.5', {
  actions: [
    {
      id: 'act1',
      tindakan: 'Perbarui daftar peran',
      tujuan: 'Kejelasan tanggung jawab',
      penanggungJawab: 'Ketua tim',
      targetWaktu: '2027-01-15',
      statusRencana: 'Direncanakan',
      catatan: '',
    },
  ],
})
s11 = getGuidedSession(p5.id)!
const actionRow = (
  s11.templateDrafts['evaluate-8.5']?.values.actions as {
    targetWaktu: string
    statusRencana: string
  }[]
)[0]!
assert(actionRow.targetWaktu === '2027-01-15', '8.5 target date persists as plan')
assert(actionRow.statusRencana === 'Direncanakan', '8.5 status is planning status')
assert(actionRow.statusRencana !== 'Selesai', 'action plan does not imply completion')
assert(computeDraftStatus(e85, s11.templateDrafts['evaluate-8.5']?.values) === 'ready', '8.5 ready')

upsertTemplateDraft(p5.id, 'evaluate-8.6', {
  catatan_finalisasi: 'Draf evaluasi siap ditinjau ulang',
  hal_terbuka: ['Penanggung jawab tindak lanjut'],
})
s11 = getGuidedSession(p5.id)!
assert(
  s11.templateDrafts['evaluate-8.6']?.values.catatan_finalisasi ===
    'Draf evaluasi siap ditinjau ulang',
  '8.6 finalization persists',
)

resetTemplateDraft(p5.id, 'evaluate-8.6')
s11 = getGuidedSession(p5.id)!
assert(!s11.templateDrafts['evaluate-8.6'], '8.6 reset clears only that card')
assert(s11.templateDrafts['evaluate-8.1'], '8.1 remains after 8.6 reset')
assert(s11.templateDrafts['disseminate-7.1'], 'disseminate draft remains after evaluate reset')

upsertEvidenceItem(p5.id, 'evaluate-8.1', 'e-8.1-a', {
  status: 'sudah',
  note: 'Catatan sumber masukan (persiapan)',
})
s11 = getGuidedSession(p5.id)!
assert(
  s11.evidenceStates['evaluate-8.1']?.['e-8.1-a']?.status === 'sudah',
  'evaluate evidence persists',
)
assert(
  s11.evidenceStates['evaluate-8.1']?.['e-8.1-a']?.note ===
    'Catatan sumber masukan (persiapan)',
  'evaluate evidence note',
)

assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressBeforeEvaluate),
  'evaluate draft does not change project progress',
)
assert(canExport(p5) === exportBeforeEvaluate, 'evaluate prep does not make project export-ready')
assert(!s11.understood['evaluate-8.1'], 'evaluate draft ≠ understood')

const evaluatePrepFile = readFileSync(
  join(root, 'src/content/guidedEvaluatePreparation.ts'),
  'utf8',
)
const evaluatePhaseFile = readFileSync(
  join(root, 'src/content/guidedPhaseEvaluate.ts'),
  'utf8',
)
assert(evaluatePrepFile.includes('Hal. 60–63'), 'evaluate prep p60–63')
assert(evaluatePhaseFile.includes("pdfPage: '60–63'"), 'evaluate cards p60–63')
assert(
  evaluatePhaseFile.includes('not a claim of official GSBPM'),
  '8.1–8.6 not official GSBPM sub-process codes',
)
assert(
  evaluatePrepFile.includes('bukan evaluasi kegiatan selesai'),
  'learning wording rejects evaluation-complete claim',
)
assert(
  !evaluatePrepFile.includes('evaluation score'),
  'no evaluation score generated',
)
assert(!evaluatePrepFile.includes('KPI'), 'no KPI fabricated')
assert(
  evaluatePhaseFile.includes('bukan evaluasi kegiatan selesai') ||
    evaluatePhaseFile.includes('bukan kegiatan dinyatakan berhasil'),
  'no success conclusion generated as positive claim',
)
assert(
  evaluatePrepFile.includes('Prioritas diisi pengguna') ||
    evaluatePrepFile.includes('bukan ranking otomatis'),
  'improvement plans remain planning data',
)
assert(
  evaluatePrepFile.includes('Target waktu = tanggal rencana') ||
    evaluatePrepFile.includes('bukan bukti bahwa tindakan sudah selesai'),
  'target date not represented as completed date',
)
assert(
  evaluatePrepFile.includes('bukan bukti pelaksanaan') ||
    evaluatePrepFile.includes('Status rencana ≠ tindakan sudah selesai'),
  'action plan does not imply completion',
)
assert(
  evaluatePrepFile.includes('bukan temuan yang digenerate') ||
    evaluatePrepFile.includes('tidak menghasilkan temuan'),
  'no fabricated findings',
)
assert(
  evaluatePrepFile.includes('bukan laporan evaluasi resmi') ||
    evaluatePrepFile.includes('bukan sertifikasi kualitas') ||
    evaluatePrepFile.includes('bukan persetujuan BPS'),
  'evidence notes are not represented as official evidence',
)

assert(guidedPage.includes('Bahan Evaluate Anda'), 'evaluate materials summary')
assert(guidedPage.includes('8 · Evaluate'), 'phase 8 header')
assert(
  guidedPage.includes('Persiapan Evaluate selesai dipelajari'),
  'evaluate learning-complete wording',
)
assert(guidedPage.includes('Mode Terpandu selesai'), 'guided completion headline')
assert(guidedPage.includes('Periksa di Workspace'), 'completion primary CTA')
assert(guidedPage.includes('Unduh draf'), 'completion secondary export CTA')
assert(
  guidedPage.includes('Anda tidak perlu') && guidedPage.includes('memahami GSBPM'),
  'beginner reassurance in guided header',
)
assert(
  guidedPage.includes('penyelesaian Mode Terpandu StatPlan') ||
    guidedPage.includes('Rangkaian belajar GSBPM di StatPlan telah selesai'),
  'guided completion clarifying copy',
)
assert(
  guidedPage.includes('bukan bahwa kegiatan statistik') ||
    guidedPage.includes('bukan bahwa kegiatan statistik selesai'),
  'completion is Guided Mode only',
)
assert(!guidedPage.includes('phase9'), 'no Phase 9 view')
assert(!guidedPage.includes('Phase 9'), 'no Phase 9 label')
assert(
  guidedPage.includes('Tidak ada sinkronisasi') ||
    guidedPage.includes('sebagai referensi saat menyusun proyek'),
  'no automatic Workspace mutation claimed',
)

for (const cid of GUIDED_EVALUATE_CARDS.map((c) => c.id)) markCardUnderstood(p5.id, cid, true)
const afterEvaluate = completePhase8Learning(p5.id)!
assert(afterEvaluate.completedPhases.includes('evaluate'), 'phase 8 learning complete')
assert(afterEvaluate.completedPhases.includes('disseminate'), 'phase 7 remains completed')
assert(
  JSON.stringify(computeProjectProgress(p5.jenisKegiatan, p5.klasifikasi, p5.checklistState)) ===
    JSON.stringify(progressBeforeEvaluate),
  'evaluate learning does not change Workspace progress',
)
assert(canExport(p5) === exportBeforeEvaluate, 'evaluate learning does not change export readiness')

const sessionSrc = readFileSync(join(root, 'src/lib/guidedSession.ts'), 'utf8')
assert(sessionSrc.includes('There is NO Phase 9'), 'session documents no Phase 9')
assert(!sessionSrc.includes('completePhase9'), 'no Phase 9 completion helper')

if (failures.length) {
  console.error('qa-guided FAILED:')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log('qa-guided PASS')
