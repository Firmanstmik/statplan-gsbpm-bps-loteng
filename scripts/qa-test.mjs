/**
 * Domain QA harness — run: node scripts/qa-test.mjs
 */
import { readFileSync } from 'fs'
import { pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Build won't output domain as ESM; inline critical checks via dynamic import from ts not available.
// We duplicate minimal test data and import from dist if built, else run logic checks manually.

const failures = []
function assert(cond, msg) {
  if (!cond) failures.push(msg)
}

// --- Static file checks ---
const gsbpm = readFileSync(join(root, 'src/domain/gsbpm.ts'), 'utf8')
assert(gsbpm.includes("id: '3.6'") && gsbpm.includes("id: '3.7'"), 'Build 3.6/3.7 must be split')
assert(gsbpm.includes("id: '5.6'") && gsbpm.includes("id: '5.7'") && gsbpm.includes("id: '5.8'"), 'Process 5.6-5.8 must be split')
assert(gsbpm.includes("klasifikasi: ['sektoral']"), 'de-12 must filter by sektoral')
assert(!gsbpm.includes("id: 'de-7'"), 'de-7 dummy table at design must be removed')

const validation = readFileSync(join(root, 'src/domain/validation.ts'), 'utf8')
assert(validation.includes('MIN_CHECKLIST_PCT = 80'), '80% export gate expected')

const dashboard = readFileSync(join(root, 'src/features/dashboard/DashboardPage.tsx'), 'utf8')
assert(
  dashboard.includes('buildAttentionItems') && dashboard.includes('sortProjectsForDashboard'),
  'Dashboard must use validation-backed attention helpers',
)
assert(
  !dashboard.includes("Rekomendasi BPS belum dicentang (Design 2.5)"),
  'Dashboard must not keep heuristic rekomendasi attention copy',
)
assert(
  !dashboard.includes('Tidak ada isu kritis pada proyek aktif.'),
  'Dashboard empty attention copy must not overclaim completion',
)

const attentionHelper = readFileSync(join(root, 'src/lib/projectAttention.ts'), 'utf8')
assert(
  attentionHelper.includes('validateProject(project)') &&
    attentionHelper.includes("status === 'archived'"),
  'Attention helper must read validateProject and skip archived projects',
)

assert(
  !dashboard.includes('Aktivitas terbaru') &&
    !dashboard.includes('Tugas & tenggat') &&
    !dashboard.includes('relativeDayLabel') &&
    !dashboard.includes('Kemarin'),
  'Dashboard must not present synthetic activity or relative fake timestamps',
)
assert(
  !dashboard.includes('Ringkasan operasional') && !dashboard.includes('Aksi cepat'),
  'Dashboard must not use operational-system eyebrow or duplicate quick-action grid',
)
assert(
  dashboard.includes('Proyek yang baru diperbarui') &&
    dashboard.includes('Rencana minggu GSBPM') &&
    dashboard.includes('Belum ada rencana waktu pada proyek aktif.'),
  'Dashboard must use truthful updatedAt and relative-week sections',
)

const dashboardHelper = readFileSync(join(root, 'src/demo/dashboard.ts'), 'utf8')
assert(
  !dashboardHelper.includes('buildDemoActivityLog') &&
    !dashboardHelper.includes('?? 16') &&
    !dashboardHelper.includes('Tahap berjalan'),
  'Dashboard helper must not generate synthetic activity or week-16 deadline fallbacks',
)
assert(
  dashboardHelper.includes('buildRecentlyUpdatedProjects') &&
    dashboardHelper.includes('buildPlanningWeeks'),
  'Dashboard helper must derive recent projects and planning weeks from persisted state',
)

const workspace = readFileSync(join(root, 'src/features/workspace/ProjectWorkspacePage.tsx'), 'utf8')
assert(!workspace.includes('sampleSize'), 'Yamane sample must be removed')
assert(!workspace.includes("'risks'"), 'Risks tab must be removed')

const landing = readFileSync(join(root, 'src/features/landing/LandingPage.tsx'), 'utf8')
if (/<Link[^>]*>[\s\S]*?<Button/.test(landing)) {
  failures.push('LandingPage: nested interactive elements (Link wrapping Button) — invalid HTML/a11y')
}
assert(
  landing.includes('Mulai perencanaan') &&
    landing.includes('Bantu susun rencana kegiatan statistik') &&
    landing.includes('LANDING_EXAMPLES') &&
    landing.includes('HOW_IT_WORKS_STEPS') &&
    landing.includes('id="contoh"') &&
    landing.includes('/contoh/'),
  'Landing Slice A+B: product-first hero, how-it-works, example section → walkthrough',
)
assert(
  !landing.includes('openDemoProject'),
  'Landing must not dump Lihat contoh into Workspace via openDemoProject',
)
assert(
  !landing.includes('Variabel') || !landing.includes('project.variables.length'),
  'Landing example cards must not show technical variable counts',
)
assert(
  !landing.includes('SDI_STAGES'),
  'Landing hero must not lead with SDI_STAGES GSBPM navigation map',
)

const landingExamples = readFileSync(join(root, 'src/content/landingExamples.ts'), 'utf8')
assert(
  landingExamples.includes("classification: 'C'") &&
    landingExamples.includes('demo-skm-dpmptsp-2026') &&
    landingExamples.includes('demo-umkm-koperasi-2026') &&
    landingExamples.includes('demo-dukcapil-kompromin-2026') &&
    !landingExamples.includes('demo-padi-pertanian-2026') &&
    !landingExamples.includes('demo-sarana-pendidikan-2026'),
  'Landing examples must be exactly 3 Type C cards (SKM, UMKM, dukcapil)',
)
assert(
  !landingExamples.includes('Menurut Materi Proses Bisnis'),
  'Landing example cards must not claim PDF origin',
)

const exampleWalkthrough = readFileSync(
  join(root, 'src/features/examples/ExampleWalkthroughPage.tsx'),
  'utf8',
)
const exampleJourney = readFileSync(join(root, 'src/content/exampleJourney.ts'), 'utf8')
assert(
  exampleWalkthrough.includes('Coba buat rencana seperti ini') &&
    exampleWalkthrough.includes('/app/new?from=') &&
    !exampleWalkthrough.includes('Buka ruang kerja lengkap') &&
    !exampleWalkthrough.includes('openWorkspace') &&
    exampleWalkthrough.includes('PreparePhases') &&
    exampleWalkthrough.includes('TryYourDates') &&
    exampleWalkthrough.includes('Belum dibuka') &&
    exampleJourney.includes('preparePhases') &&
    exampleJourney.includes('whyConducted') &&
    !exampleJourney.includes('Template resmi BPS'),
  'Example demo: Guided handoff primary, Workspace not destination, progressive phases',
)

const sourceMap = readFileSync(join(root, 'docs/content-source-map.md'), 'utf8')
assert(
  sourceMap.includes('demo-skm-dpmptsp-2026') && sourceMap.includes('**C**'),
  'content-source-map.md must classify landing demos as Type C',
)

const css = readFileSync(join(root, 'src/index.css'), 'utf8')
if (workspace.includes('brand-soft') && !css.includes('brand-soft') && !css.includes('--color-brand-soft')) {
  failures.push('Workspace uses brand-soft/gold-soft but tokens not defined in index.css')
}

// --- GSBPM sub-process code uniqueness ---
const codes = [...gsbpm.matchAll(/code: '(\d+\.\d+)'/g)].map((m) => m[1])
const dupCodes = codes.filter((c, i) => codes.indexOf(c) !== i)
assert(dupCodes.length === 0, `Duplicate sub-process codes: ${dupCodes.join(', ')}`)

// --- Checklist id uniqueness ---
const checklistIds = [...gsbpm.matchAll(/id: '([a-z]+-\d+[a-z]*)'/g)].map((m) => m[1])
const dupIds = checklistIds.filter((id, i) => checklistIds.indexOf(id) !== i)
assert(dupIds.length === 0, `Duplicate checklist ids: ${dupIds.join(', ')}`)

const newProject = readFileSync(join(root, 'src/features/planner/NewProjectPage.tsx'), 'utf8')
assert(
  newProject.includes('Ceritakan kegiatan yang ingin Anda lakukan') &&
    newProject.includes('Apa yang ingin Anda dapatkan dari kegiatan ini?') &&
    newProject.includes('Kapan kegiatan ini akan dilaksanakan?') &&
    newProject.includes('Rencana waktu awal') &&
    newProject.includes('Sesuaikan jadwal') &&
    newProject.includes('Lanjut ke Identifikasi Kebutuhan') &&
    newProject.includes('recommendJenisKegiatan') &&
    newProject.includes('allocatePhaseDates') &&
    newProject.includes('phasePlanToTimelineItems') &&
    !newProject.includes('W1') &&
    !newProject.includes('buildIllustrativeSchedule'),
  'NewProjectPage must implement guided Slice 2 (Ceritakan → Hasil → Tentukan waktu → handoff)',
)
assert(
  !newProject.includes('AI menganalisis') && !newProject.includes('AI menentukan'),
  'Guided flow must not claim fake AI analysis',
)
assert(
  newProject.includes('bukan durasi wajib BPS'),
  'Must disclose timeline is not mandatory BPS duration',
)

const planningTimeline = readFileSync(join(root, 'src/content/planningTimeline.ts'), 'utf8')
assert(
  planningTimeline.includes('allocatePhaseDates') &&
    planningTimeline.includes('PHASE_PLAN_WEIGHTS') &&
    planningTimeline.includes('phasePlanToTimelineItems'),
  'planningTimeline helpers required for Slice 2',
)

const guidedJourney = readFileSync(join(root, 'src/content/guidedJourney.ts'), 'utf8')
assert(
  guidedJourney.includes('buildIllustrativeSchedule') && guidedJourney.includes('GUIDED_STEPS'),
  'guidedJourney helpers required for Slice 1 continuity',
)

// --- Slice 3 guided phase engine ---
const appTsx = readFileSync(join(root, 'src/App.tsx'), 'utf8')
assert(
  appTsx.includes('projects/:id/guided') && appTsx.includes('GuidedPhasePage'),
  'App must register guided phase route',
)
assert(
  newProject.includes('/guided') && newProject.includes('createGuidedSession'),
  'NewProject handoff must open Mode Terpandu (not force Workspace)',
)
assert(
  newProject.includes('Buka ruang kerja lengkap'),
  'Workspace must remain available as secondary action',
)

const guidedPhasePage = readFileSync(
  join(root, 'src/features/planner/guided/GuidedPhasePage.tsx'),
  'utf8',
)
const guidedLearningCard = readFileSync(
  join(root, 'src/features/planner/guided/GuidedLearningCard.tsx'),
  'utf8',
)
const guidedPhaseNeed = readFileSync(join(root, 'src/content/guidedPhaseNeed.ts'), 'utf8')
const guidedSession = readFileSync(join(root, 'src/lib/guidedSession.ts'), 'utf8')

assert(
  guidedPhasePage.includes('Mode Terpandu') &&
    guidedPhasePage.includes('Selesai memahami tahap ini') &&
    guidedPhasePage.includes('Lanjut ke Perancangan') &&
    guidedPhasePage.includes('materi dipahami'),
  'GuidedPhasePage must implement Phase 1 learning + unlock handoff',
)
assert(
  guidedLearningCard.includes('Sudah dipahami') &&
    guidedLearningCard.includes('aria-expanded') &&
    guidedLearningCard.includes('Siapkan bahan') &&
    !guidedLearningCard.includes('Download template'),
  'GuidedLearningCard must use Apa/Contoh/Siapkan bahan/Bukti + understood semantics',
)
assert(
  guidedPhaseNeed.includes("pdfPage: 15") &&
    guidedPhaseNeed.includes("pdfPage: 16") &&
    guidedPhaseNeed.includes("contohClass: 'A'"),
  'Guided need content must ground 1.5/1.6 to PDF pages',
)
assert(
  guidedSession.includes("unlockedPhases: ['specify_need']") &&
    guidedSession.includes('completePhase1AndUnlockDesign') &&
    guidedSession.includes('templateDrafts') &&
    guidedSession.includes('upsertTemplateDraft'),
  'Guided session must support Phase 1 unlock + Slice 4 drafts',
)
assert(
  !guidedPhasePage.includes('Dokumen wajib BPS') &&
    !guidedPhaseNeed.includes('Durasi wajib BPS') &&
    !guidedPhaseNeed.includes('Rekomendasi resmi BPS'),
  'Guided Mode must not claim fake BPS mandates',
)
assert(
  !guidedPhasePage.includes('computeProjectProgress') &&
    !guidedLearningCard.includes('checklistState'),
  'Guided Mode must not drive Workspace checklist/progress',
)

// --- Slice 4 template & evidence ---
const guidedPrep = readFileSync(join(root, 'src/content/guidedNeedPreparation.ts'), 'utf8')
const guidedTemplatePanel = readFileSync(
  join(root, 'src/features/planner/guided/GuidedTemplatePanel.tsx'),
  'utf8',
)
assert(
  guidedPrep.includes("sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 15'") &&
    guidedPrep.includes("sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 16'") &&
    guidedPrep.includes('bukan template resmi BPS'),
  'Slice 4 prep must ground 1.5/1.6 and disclaim official templates',
)
assert(
  guidedPrep.includes("sourceType: 'C'") &&
    !guidedPrep.includes('Template resmi BPS'),
  'Type C working templates must not claim official BPS forms',
)
assert(
  guidedTemplatePanel.includes('Isian Anda') &&
    guidedTemplatePanel.includes('Disimpan secara lokal') &&
    guidedTemplatePanel.includes('Reset draft') &&
    guidedTemplatePanel.includes('Bahan Anda') &&
    guidedPhasePage.includes('Bahan kerja dapat disiapkan bertahap') &&
    guidedPhasePage.includes('semua bahan harus lengkap'),
  'Slice 4 UI must support draft input, local save, materials summary, learning gate',
)
assert(
  !guidedTemplatePanel.includes('Tersimpan di server') &&
    !guidedTemplatePanel.includes('StatPlan menemukan'),
  'No fake server save or portal query claims',
)

// --- Slice 5 Design phase ---
const guidedDesignPrep = readFileSync(
  join(root, 'src/content/guidedDesignPreparation.ts'),
  'utf8',
)
const guidedPhaseDesign = readFileSync(join(root, 'src/content/guidedPhaseDesign.ts'), 'utf8')
assert(
  guidedPhasePage.includes('2 · Perancangan') &&
    guidedPhasePage.includes('Bahan perancangan Anda') &&
    guidedPhasePage.includes('completePhase2Learning') &&
    guidedPhasePage.includes('GUIDED_DESIGN_CARDS'),
  'GuidedPhasePage must implement Design phase learning + summary',
)
assert(
  guidedDesignPrep.includes('Hal. 18') &&
    guidedDesignPrep.includes('Hal. 19') &&
    guidedDesignPrep.includes('Hal. 20') &&
    guidedDesignPrep.includes('Hal. 21') &&
    guidedDesignPrep.includes('Hal. 23') &&
    guidedDesignPrep.includes('tidak menentukan metode yang paling tepat secara otomatis') &&
    guidedDesignPrep.includes('tidak merekomendasikan') &&
    !guidedDesignPrep.includes('Rekomendasi BPS berhasil') &&
    !guidedDesignPrep.includes('Template resmi BPS'),
  'Design prep must ground p18–23 and avoid official/auto claims',
)
assert(
  guidedPhaseDesign.includes("pdfPage: 18") &&
    guidedPhaseDesign.includes("pdfPage: 19") &&
    guidedPhaseDesign.includes("pdfPage: 21") &&
    guidedPhaseDesign.includes("pdfPage: 23"),
  'Design learning cards must cite PDF pages',
)
assert(
  guidedSession.includes('completePhase2Learning') &&
    guidedSession.includes("unlocked.add('build')"),
  'Phase 2 completion must unlock Build',
)
assert(
  guidedSession.includes('completePhase3Learning') &&
    guidedSession.includes("unlocked.add('collect')"),
  'Phase 3 completion must unlock Collect',
)
assert(
  guidedSession.includes('completePhase4Learning') &&
    guidedSession.includes("unlocked.add('process')"),
  'Phase 4 completion must unlock Process',
)
assert(
  guidedSession.includes('completePhase5Learning') &&
    guidedSession.includes("unlocked.add('analyse')"),
  'Phase 5 completion must unlock Analyse',
)
assert(
  guidedSession.includes('completePhase6Learning') &&
    guidedSession.includes("unlocked.add('disseminate')"),
  'Phase 6 completion must unlock Disseminate',
)
assert(
  guidedSession.includes('completePhase7Learning') &&
    guidedSession.includes("unlocked.add('evaluate')") &&
    guidedSession.includes('completePhase8Learning') &&
    guidedSession.includes('There is NO Phase 9'),
  'Phase 7 completion must unlock Evaluate; Phase 8 is final (no Phase 9)',
)

// --- Slice 6 Build phase ---
const guidedBuildPrep = readFileSync(join(root, 'src/content/guidedBuildPreparation.ts'), 'utf8')
const guidedPhaseBuild = readFileSync(join(root, 'src/content/guidedPhaseBuild.ts'), 'utf8')
assert(
  guidedPhasePage.includes('3 · Build') &&
    guidedPhasePage.includes('Bahan Build Anda') &&
    guidedPhasePage.includes('completePhase3Learning') &&
    guidedPhasePage.includes('GUIDED_BUILD_CARDS'),
  'GuidedPhasePage must implement Build phase learning + summary',
)
assert(
  guidedBuildPrep.includes('Hal. 25') &&
    guidedBuildPrep.includes('Hal. 26') &&
    guidedBuildPrep.includes('Hal. 27') &&
    guidedBuildPrep.includes('Hal. 28') &&
    guidedBuildPrep.includes('Hal. 30') &&
    guidedBuildPrep.includes('Format kerja StatPlan') &&
    !guidedBuildPrep.includes('Build selesai secara resmi') &&
    !guidedBuildPrep.includes('adalah Template resmi BPS'),
  'Build prep must ground p25–30 and avoid official completion claims',
)
assert(
  guidedPhaseBuild.includes('pdfPage: 25') &&
    guidedPhaseBuild.includes('pdfPage: 26') &&
    guidedPhaseBuild.includes('pdfPage: 27') &&
    guidedPhaseBuild.includes('pdfPage: 28') &&
    guidedPhaseBuild.includes('pdfPage: 30'),
  'Build learning cards must cite PDF pages',
)
assert(
  !guidedPhaseBuild.includes("pdfPage:") ||
    !/build-3\.6[\s\S]{0,200}pdfPage/.test(guidedPhaseBuild),
  '3.6 must not falsely claim a PDF page',
)

// --- Slice 7 Collect phase ---
const guidedCollectPrep = readFileSync(join(root, 'src/content/guidedCollectPreparation.ts'), 'utf8')
const guidedPhaseCollect = readFileSync(join(root, 'src/content/guidedPhaseCollect.ts'), 'utf8')
const collectSourceMap = readFileSync(join(root, 'docs/content-source-map.md'), 'utf8')
assert(
  guidedPhasePage.includes('4 · Collect') &&
    guidedPhasePage.includes('Bahan Collect Anda') &&
    guidedPhasePage.includes('completePhase4Learning') &&
    guidedPhasePage.includes('GUIDED_COLLECT_CARDS'),
  'GuidedPhasePage must implement Collect phase learning + summary',
)
assert(
  guidedCollectPrep.includes('Hal. 33') &&
    guidedCollectPrep.includes('Hal. 32–36') &&
    guidedCollectPrep.includes('Penjelasan sederhana') &&
    guidedCollectPrep.includes('Format kerja StatPlan') &&
    guidedCollectPrep.includes('PKS-LADU') &&
    !guidedCollectPrep.includes('Persetujuan Collect') &&
    !guidedCollectPrep.includes('Collect selesai.') &&
    !/kepanjangan\s+PKS|PKS\s*=|LADU\s*=/i.test(guidedCollectPrep),
  'Collect prep must ground verified pages and avoid approval/execution claims',
)
assert(
  guidedPhaseCollect.includes('pdfPage: 33') &&
    guidedPhaseCollect.includes("pdfPage: '32–36'") &&
    !/collect-4\.4[\s\S]{0,250}pdfPage/.test(guidedPhaseCollect) &&
    !/collect-4\.6[\s\S]{0,250}pdfPage/.test(guidedPhaseCollect),
  'Collect cards must cite verified pages; 4.4/4.6 must not claim PDF pages',
)
assert(
  collectSourceMap.includes('Guided Planning Slice 7') &&
    collectSourceMap.includes('| **33** |') &&
    collectSourceMap.includes('PKS-LADU'),
  'Source map must document Collect Slice 7',
)

// --- Slice 8 Process phase ---
const guidedProcessPrep = readFileSync(join(root, 'src/content/guidedProcessPreparation.ts'), 'utf8')
const guidedPhaseProcess = readFileSync(join(root, 'src/content/guidedPhaseProcess.ts'), 'utf8')
assert(
  guidedPhasePage.includes('5 · Process') &&
    guidedPhasePage.includes('Bahan Process Anda') &&
    guidedPhasePage.includes('completePhase5Learning') &&
    guidedPhasePage.includes('GUIDED_PROCESS_CARDS'),
  'GuidedPhasePage must implement Process phase learning + summary',
)
assert(
  guidedProcessPrep.includes('Hal. 37–45') &&
    guidedProcessPrep.includes('Hal. 44') &&
    guidedProcessPrep.includes('Hal. 39') &&
    guidedProcessPrep.includes('Hal. 42') &&
    guidedProcessPrep.includes('Hal. 43') &&
    guidedProcessPrep.includes('Format kerja StatPlan') &&
    guidedProcessPrep.includes('Catatan perencanaan') &&
    !guidedProcessPrep.includes('Proses selesai.') &&
    !guidedProcessPrep.includes('weighting sudah diterapkan') &&
    !guidedProcessPrep.includes('adalah Template resmi BPS'),
  'Process prep must ground verified pages and avoid processing/approval claims',
)
assert(
  guidedPhaseProcess.includes("pdfPage: '37–45'") &&
    guidedPhaseProcess.includes('pdfPage: 44') &&
    guidedPhaseProcess.includes('pdfPage: 39') &&
    guidedPhaseProcess.includes('pdfPage: 42') &&
    guidedPhaseProcess.includes('pdfPage: 43') &&
    !/process-5\.6[\s\S]{0,250}pdfPage/.test(guidedPhaseProcess),
  'Process cards must cite verified pages; 5.6 must not claim a PDF page',
)
assert(
  collectSourceMap.includes('Guided Planning Slice 8') &&
    collectSourceMap.includes('| **39** |') &&
    collectSourceMap.includes('| **42** |') &&
    collectSourceMap.includes('| **43** |') &&
    collectSourceMap.includes('| **44** |'),
  'Source map must document Process Slice 8',
)

// --- Slice 9 Analyse phase ---
const guidedAnalysePrep = readFileSync(join(root, 'src/content/guidedAnalysePreparation.ts'), 'utf8')
const guidedPhaseAnalyse = readFileSync(join(root, 'src/content/guidedPhaseAnalyse.ts'), 'utf8')
assert(
  guidedPhasePage.includes('6 · Analyse') &&
    guidedPhasePage.includes('Bahan Analyse Anda') &&
    guidedPhasePage.includes('completePhase6Learning') &&
    guidedPhasePage.includes('GUIDED_ANALYSE_CARDS'),
  'GuidedPhasePage must implement Analyse phase learning + summary',
)
assert(
  guidedAnalysePrep.includes('Hal. 46–51') &&
    guidedAnalysePrep.includes('Hal. 50') &&
    guidedAnalysePrep.includes('Penjelasan sederhana') &&
    guidedAnalysePrep.includes('Format kerja StatPlan') &&
    guidedAnalysePrep.toLowerCase().includes('pilihan kerja statplan') &&
    !guidedAnalysePrep.includes('Analisis selesai.') &&
    !guidedAnalysePrep.includes('adalah Template resmi BPS') &&
    !guidedAnalysePrep.includes('n < 3 is always illegal'),
  'Analyse prep must ground verified pages and avoid fake results/approval claims',
)
assert(
  guidedPhaseAnalyse.includes("pdfPage: '46–51'") &&
    guidedPhaseAnalyse.includes('pdfPage: 50') &&
    !/analyse-6\.1[\s\S]{0,250}pdfPage/.test(guidedPhaseAnalyse) &&
    !/analyse-6\.3[\s\S]{0,250}pdfPage/.test(guidedPhaseAnalyse) &&
    !/analyse-6\.6[\s\S]{0,250}pdfPage/.test(guidedPhaseAnalyse),
  'Analyse cards must cite verified pages; 6.1/6.3/6.6 must not claim PDF pages',
)
assert(
  collectSourceMap.includes('Guided Planning Slice 9') &&
    collectSourceMap.includes('| **50** |') &&
    collectSourceMap.includes('**46–51**'),
  'Source map must document Analyse Slice 9',
)

// --- Slice 10 Disseminate phase ---
const guidedDisseminatePrep = readFileSync(
  join(root, 'src/content/guidedDisseminatePreparation.ts'),
  'utf8',
)
const guidedPhaseDisseminate = readFileSync(
  join(root, 'src/content/guidedPhaseDisseminate.ts'),
  'utf8',
)
assert(
  guidedPhasePage.includes('7 · Disseminate') &&
    guidedPhasePage.includes('Bahan Disseminate Anda') &&
    guidedPhasePage.includes('completePhase7Learning') &&
    guidedPhasePage.includes('GUIDED_DISSEMINATE_CARDS') &&
    guidedPhasePage.includes('Persiapan Disseminate selesai dipelajari'),
  'GuidedPhasePage must implement Disseminate phase learning + summary',
)
assert(
  guidedDisseminatePrep.includes('Hal. 52–57') &&
    guidedDisseminatePrep.includes('Format kerja StatPlan') &&
    guidedDisseminatePrep.includes('Target waktu rilis (rencana)') &&
    guidedDisseminatePrep.includes('Bukan jadwal resmi') &&
    guidedDisseminatePrep.includes('bukan tanggal publikasi aktual') &&
    guidedDisseminatePrep.includes('bukan Disseminate selesai dilaksanakan') &&
    guidedDisseminatePrep.includes('Persiapan Disseminate selesai dipelajari') &&
    !guidedDisseminatePrep.includes('adalah Template resmi BPS') &&
    guidedPhaseDisseminate.includes('not a claim of official GSBPM'),
  'Disseminate prep must ground Hal. 52–57 and avoid publication/approval claims',
)
assert(
  guidedPhaseDisseminate.includes("pdfPage: '52–57'") &&
    !/disseminate-7\.6[\s\S]{0,250}pdfPage/.test(guidedPhaseDisseminate),
  'Disseminate cards must use Hal. 52–57; 7.6 must not claim a PDF page',
)
assert(
  collectSourceMap.includes('Guided Planning Slice 10') &&
    collectSourceMap.includes('**52–57**') &&
    collectSourceMap.includes('Persiapan Disseminate selesai dipelajari'),
  'Source map must document Disseminate Slice 10',
)

// --- Slice 11 Evaluate phase ---
const guidedEvaluatePrep = readFileSync(
  join(root, 'src/content/guidedEvaluatePreparation.ts'),
  'utf8',
)
const guidedPhaseEvaluate = readFileSync(
  join(root, 'src/content/guidedPhaseEvaluate.ts'),
  'utf8',
)
assert(
  guidedPhasePage.includes('8 · Evaluate') &&
    guidedPhasePage.includes('Bahan Evaluate Anda') &&
    guidedPhasePage.includes('completePhase8Learning') &&
    guidedPhasePage.includes('GUIDED_EVALUATE_CARDS') &&
    guidedPhasePage.includes('Persiapan Evaluate selesai dipelajari') &&
    guidedPhasePage.includes('Mode Terpandu selesai') &&
    guidedPhasePage.includes('Periksa di Workspace') &&
    guidedPhasePage.includes('penyelesaian Mode Terpandu StatPlan') &&
    !guidedPhasePage.includes('Phase 9') &&
    !guidedPhasePage.includes('phase9'),
  'GuidedPhasePage must implement Evaluate + Guided Mode completion (no Phase 9)',
)
assert(
  guidedEvaluatePrep.includes('Hal. 60–63') &&
    guidedEvaluatePrep.includes('Format kerja StatPlan') &&
    guidedEvaluatePrep.includes('Penjelasan sederhana') &&
    guidedEvaluatePrep.includes('Persiapan Evaluate selesai dipelajari') &&
    guidedEvaluatePrep.includes('bukan evaluasi kegiatan selesai') &&
    guidedEvaluatePrep.includes('bukan kegiatan dinyatakan berhasil') &&
    guidedEvaluatePrep.includes('Target waktu = tanggal rencana') &&
    guidedEvaluatePrep.includes('Status rencana ≠ tindakan sudah selesai') &&
    guidedEvaluatePrep.includes('Prioritas diisi pengguna') &&
    !guidedEvaluatePrep.includes('skor evaluasi otomatis') &&
    !guidedEvaluatePrep.includes('adalah Template resmi BPS') &&
    guidedPhaseEvaluate.includes('not a claim of official GSBPM'),
  'Evaluate prep must ground Hal. 60–63 and avoid scores/success/approval claims',
)
assert(
  guidedPhaseEvaluate.includes("pdfPage: '60–63'") &&
    !/evaluate-8\.3[\s\S]{0,250}pdfPage/.test(guidedPhaseEvaluate) &&
    !/evaluate-8\.6[\s\S]{0,250}pdfPage/.test(guidedPhaseEvaluate),
  'Evaluate cards must use Hal. 60–63 where applicable; 8.3/8.6 must not claim PDF pages',
)
assert(
  !guidedEvaluatePrep.includes('evaluation score') &&
    !guidedEvaluatePrep.includes('KPI') &&
    !guidedPhaseEvaluate.includes('lulus evaluasi') &&
    !guidedPhasePage.includes('sudah dilaksanakan secara resmi') &&
    guidedPhasePage.includes('bukan bahwa kegiatan statistik'),
  'No fake evaluation scores or action-completion claims; Guided completion wording is honest',
)
assert(
  collectSourceMap.includes('Guided Planning Slice 11') &&
    collectSourceMap.includes('**60–63**') &&
    collectSourceMap.includes('Persiapan Evaluate selesai dipelajari') &&
    collectSourceMap.includes('No Phase 9'),
  'Source map must document Evaluate Slice 11',
)

assert(
  guidedPhasePage.includes('Review StatPlan') &&
    guidedPhasePage.includes('bukan persetujuan resmi BPS'),
  'Guided completion includes Review StatPlan (not BPS approval)',
)

const guidedNeedCards = readFileSync(join(root, 'src/content/guidedPhaseNeed.ts'), 'utf8')
assert(
  guidedNeedCards.includes("mappingKind: 'gsbpm'") &&
    guidedNeedCards.includes('Identifikasi Kebutuhan') &&
    guidedNeedCards.includes('Konsultasi & Konfirmasi Kebutuhan'),
  'Need cards use official GSBPM titles + mappingKind',
)
assert(
  readFileSync(join(root, 'src/features/planner/guided/GuidedLearningCard.tsx'), 'utf8').includes(
    'Panduan StatPlan',
  ) &&
    readFileSync(join(root, 'src/content/guidedPhaseEvaluate.ts'), 'utf8').includes(
      "mappingKind: 'statplan'",
    ) &&
    readFileSync(join(root, 'src/content/guidedPhaseEvaluate.ts'), 'utf8').includes('SP-E'),
  'StatPlan-only cards labeled Panduan StatPlan / SP-* (not invented official codes)',
)

console.log('QA static checks:', failures.length === 0 ? 'PASS' : 'FAIL')
failures.forEach((f) => console.log('  ✗', f))
process.exit(failures.length === 0 ? 0 : 1)
