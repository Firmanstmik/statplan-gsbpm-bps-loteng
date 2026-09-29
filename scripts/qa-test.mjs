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
  dashboard.includes('Lanjutkan pekerjaan') &&
    dashboard.includes('Proyek Anda') &&
    dashboard.includes('Proyek demo') &&
    dashboard.includes('isDemoProject') &&
    dashboard.includes('nextActionForProject') &&
    dashboard.includes('canExport') &&
    dashboard.includes('/contoh/') &&
    !dashboard.includes('planningWeekLabel') &&
    !dashboard.includes('Rencana minggu GSBPM'),
  'Dashboard: continue-work card, user vs demo projects, real next actions, no internal week numbers',
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
if (/<Link[\s>](?:(?!<\/Link>)[\s\S])*?<(?:Button|button)[\s>]/.test(landing)) {
  failures.push('LandingPage: nested interactive elements (Link wrapping Button) — invalid HTML/a11y')
}
assert(
  landing.includes('Mulai perencanaan') &&
    landing.includes('Pelajari contoh') &&
    landing.includes('Simulator perencanaan kegiatan statistik') &&
    landing.includes('id="hero-heading"') &&
    landing.includes('LANDING_EXAMPLES') &&
    landing.includes('HOW_IT_WORKS_STEPS') &&
    landing.includes('LANDING_OUTPUTS') &&
    landing.includes('GUIDED_PHASES') &&
    landing.includes('id="contoh"') &&
    landing.includes('id="cara-kerja"') &&
    landing.includes('/contoh/'),
  'Landing: hero (eyebrow + h1 + 2 CTAs), cara kerja, contoh → walkthrough, GSBPM phases, real outputs',
)
assert(
  (landing.match(/<h1[\s>]/g) || []).length === 1 && (landing.match(/<main[\s>]/g) || []).length === 1,
  'Landing must have exactly one <h1> and one <main> landmark',
)
assert(
  !/\b\d{2,}\+?\s*(pengguna|proyek|instansi)\b/i.test(landing) && !/\bAI\b/.test(landing),
  'Landing must not claim user/project counts or AI',
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
for (const section of ['hero', 'sekilas', 'mengapa', 'roadmap', 'pelajari', 'materi', 'tiru', 'mulai']) {
  assert(
    exampleWalkthrough.includes(`data-section="${section}"`),
    `Example case study must include section: ${section}`,
  )
}
assert(
  exampleWalkthrough.includes('/app/new?from=') &&
    exampleWalkthrough.includes('Contoh asli tetap aman') &&
    exampleWalkthrough.includes('GUIDED_PHASES') &&
    exampleWalkthrough.includes('materiExamples') &&
    exampleWalkthrough.includes('loading="lazy"') &&
    exampleWalkthrough.includes('SourceNote kind="A"') &&
    exampleWalkthrough.includes('SourceNote kind="C"') &&
    !exampleWalkthrough.includes('Buka ruang kerja lengkap') &&
    !exampleWalkthrough.includes('openWorkspace') &&
    !exampleWalkthrough.includes('loadDemoData') &&
    !exampleWalkthrough.includes('updateProject') &&
    exampleJourney.includes('preparePhases') &&
    exampleJourney.includes('takeaways') &&
    !exampleJourney.includes('Template resmi BPS'),
  'Example: read-only case study, real PDF visuals from Guided content, honest A/C labels, copy-to-new-plan CTA',
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
  newProject.includes('id="guided-story"') &&
    newProject.includes('STORY_CHOICES') &&
    newProject.includes('deriveProjectName(story, effectiveJenis)') &&
    newProject.includes('bukan AI') &&
    newProject.includes('id="plan-start"') &&
    newProject.includes('id="plan-end"') &&
    newProject.includes('PhaseBar') &&
    newProject.includes('bukan durasi wajib BPS') &&
    newProject.includes('Lanjut ke Identifikasi Kebutuhan') &&
    newProject.includes('recommendJenisKegiatan') &&
    newProject.includes('allocatePhaseDates') &&
    newProject.includes('phasePlanToTimelineItems') &&
    newProject.includes('createGuidedSession') &&
    !newProject.includes('W1') &&
    !newProject.includes('buildIllustrativeSchedule'),
  'Intake: plain-language story + examples, draft name, rule-based (not AI) suggestion, visual timeline, handoff',
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

/// --- Guided Mode: official GSBPM 5.2 structure (44 subprocesses) ---
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
  !newProject.includes('Buka ruang kerja lengkap') &&
    (newProject.match(/Lanjut ke Identifikasi Kebutuhan/g) || []).length === 1,
  'Timeline handoff: exactly one next action (Mode Terpandu), no competing Workspace branch',
)
{
  const shell = readFileSync(join(root, 'src/components/layout/AppShell.tsx'), 'utf8')
  const guidedPage = readFileSync(join(root, 'src/features/planner/guided/GuidedPhasePage.tsx'), 'utf8')
  const ws = readFileSync(join(root, 'src/features/workspace/ProjectWorkspacePage.tsx'), 'utf8')
  assert(
    shell.includes('Proyek saya') &&
      guidedPage.includes('navigate(`/app/projects/${id}`)') &&
      ws.includes('Kembali ke Mode Terpandu'),
    'Workspace stays reachable (Proyek saya, Guided handoff) and links back to Mode Terpandu',
  )
  const tabsBlock = ws.slice(ws.indexOf('const tabs:'), ws.indexOf('\n]', ws.indexOf('const tabs:')))
  const order = [...tabsBlock.matchAll(/id: '(\w+)'/g)].map((m) => m[1]).join(',')
  assert(
    order === 'timeline,workflow,checklist,design,variables,instruments,metadata,activity,export',
    `Workspace tab order must be Timeline → Alur kerja → Checklist → … → Ekspor (got ${order})`,
  )
  assert(
    ws.includes("const DEFAULT_TAB: TabId = 'timeline'") &&
      ws.includes('return DEFAULT_TAB') &&
      ws.includes('if (next === DEFAULT_TAB) p.delete'),
    'Workspace without ?tab= must open Timeline; explicit ?tab= wins',
  )
  assert(
    /tab !== 'export' \? \(\s*<NextStepsCard/.test(ws),
    'Ekspor tab must not repeat the next-steps issue list above its full review',
  )
  const attention = readFileSync(join(root, 'src/lib/projectAttention.ts'), 'utf8')
  assert(
    !attention.includes("tab === 'workflow') return"),
    'projectHref must keep ?tab=workflow explicit now that the bare URL opens Timeline',
  )
}

const guidedPhasePage = readFileSync(
  join(root, 'src/features/planner/guided/GuidedPhasePage.tsx'),
  'utf8',
)
const guidedLearningCard = readFileSync(
  join(root, 'src/features/planner/guided/GuidedLearningCard.tsx'),
  'utf8',
)
const materiBlock = readFileSync(
  join(root, 'src/features/planner/guided/MateriExampleBlock.tsx'),
  'utf8',
)
const guidedTemplatePanel = readFileSync(
  join(root, 'src/features/planner/guided/GuidedTemplatePanel.tsx'),
  'utf8',
)
const guidedSession = readFileSync(join(root, 'src/lib/guidedSession.ts'), 'utf8')
const guidedMigration = readFileSync(join(root, 'src/lib/guidedMigration.ts'), 'utf8')

const PHASE_FILES = [
  ['guidedPhaseNeed.ts', 'guidedNeedPreparation.ts', '1', 6],
  ['guidedPhaseDesign.ts', 'guidedDesignPreparation.ts', '2', 6],
  ['guidedPhaseBuild.ts', 'guidedBuildPreparation.ts', '3', 7],
  ['guidedPhaseCollect.ts', 'guidedCollectPreparation.ts', '4', 4],
  ['guidedPhaseProcess.ts', 'guidedProcessPreparation.ts', '5', 8],
  ['guidedPhaseAnalyse.ts', 'guidedAnalysePreparation.ts', '6', 5],
  ['guidedPhaseDisseminate.ts', 'guidedDisseminatePreparation.ts', '7', 5],
  ['guidedPhaseEvaluate.ts', 'guidedEvaluatePreparation.ts', '8', 3],
]
let totalCards = 0
const allPhaseSrc = []
const allPrepSrc = []
for (const [cardFile, prepFile, phase, count] of PHASE_FILES) {
  const cardSrc = readFileSync(join(root, 'src/content', cardFile), 'utf8')
  const prepSrc = readFileSync(join(root, 'src/content', prepFile), 'utf8')
  allPhaseSrc.push(cardSrc)
  allPrepSrc.push(prepSrc)
  const ids = [...cardSrc.matchAll(/\n    id: 'gsbpm-(\d)\.(\d)'/g)]
  totalCards += ids.length
  assert(ids.length === count, `${cardFile}: expected ${count} official cards, found ${ids.length}`)
  assert(
    ids.every((m, i) => m[1] === phase && Number(m[2]) === i + 1),
    `${cardFile}: card ids must be gsbpm-${phase}.1…${phase}.${count} in order`,
  )
  const pages = [...cardSrc.matchAll(/\n    pdfPage: /g)].length
  assert(pages === count, `${cardFile}: every subprocess card must cite its PDF page`)
  const preps = [...prepSrc.matchAll(/cardId: 'gsbpm-(\d\.\d)'/g)].map((m) => m[1])
  for (let i = 1; i <= count; i++) {
    assert(preps.includes(`${phase}.${i}`), `${prepFile}: missing Format kerja for ${phase}.${i}`)
  }
  assert(!/code: 'SP-/.test(cardSrc), `${cardFile}: no invented SP-* codes`)
  assert(!cardSrc.includes("mappingKind: 'statplan'"), `${cardFile}: all cards map to official subprocesses`)
  assert(
    !/'(need|design|build|collect|process|analyse|disseminate|evaluate)-\d\.\d'/.test(cardSrc + prepSrc),
    `${cardFile}/${prepFile}: legacy positional ids must not be reused`,
  )
  assert(
    !prepSrc.includes('adalah Template resmi BPS') &&
      !prepSrc.includes('Rekomendasi BPS berhasil') &&
      !prepSrc.includes('weighting sudah diterapkan') &&
      !prepSrc.includes('skor evaluasi otomatis'),
    `${prepFile}: no fake official/approval/result claims`,
  )
}
assert(totalCards === 44, `Guided Mode must have exactly 44 official subprocess cards (found ${totalCards})`)

const phaseSrc = allPhaseSrc.join('\n')
assert(
  phaseSrc.includes("officialTitle: 'Memutakhirkan Sistem Output'") &&
    phaseSrc.includes("title: 'Memuat data dan metadata ke sistem output'"),
  'Disseminate 7.1 must teach Memutakhirkan Sistem Output (not generic produk)',
)
assert(
  phaseSrc.includes("officialTitle: 'Pengujian Sistem Produksi'") &&
    phaseSrc.includes("officialTitle: 'Finalisasi Sistem Produksi'"),
  'Build must include Pengujian and Finalisasi Sistem Produksi',
)
assert(
  phaseSrc.includes("officialTitle: 'Review & Validasi Data'") &&
    phaseSrc.includes("officialTitle: 'Editing & Imputasi'"),
  'Process must include Review & Validasi and Editing & Imputasi',
)
assert(
  phaseSrc.includes("officialTitle: 'Validasi output'") &&
    phaseSrc.includes("officialTitle: 'Interpretasi dan penjelasan'"),
  'Analyse must keep Validasi output and Interpretasi separate',
)
assert(
  phaseSrc.includes("officialTitle: 'Identifikasi Konsep Definisi'") &&
    phaseSrc.includes('Kondef sebaiknya sesuai standar statistik.'),
  'Specify Need 1.4 must teach konsep definisi (Hal. 14)',
)
assert(
  phaseSrc.includes("'Monitoring adalah bagian resmi subproses ini (Hal. 35) — bukan tambahan.'") &&
    !phaseSrc.includes('not in materi'),
  'Collect monitoring must be grounded in Hal. 35',
)
assert(
  phaseSrc.includes("'Simple Random Sampling'") && phaseSrc.includes("'Snowball Sampling'"),
  'Design 2.4 must list the actual Hal. 21 sampling methods',
)
assert(
  phaseSrc.includes("['6', 'Analisis hasil SKM', 'November – Desember']"),
  'Design 2.6 must carry the exact Hal. 23 schedule table',
)
assert(
  !phaseSrc.includes("'Metrics'") && !phaseSrc.includes("'Staff feedback'") &&
    phaseSrc.includes("'Umpan balik pengguna', 'Paradata', 'Metrik sistem', 'Masukan staf'"),
  'Evaluate must use Indonesian source terminology',
)
assert(
  phaseSrc.includes('tidak harus digunakan secara linear'),
  'Guided Mode must state GSBPM is flexible / non-linear',
)

for (const img of [
  'hal-18-contoh-rancangan-tabulasi',
  'hal-23-contoh-sop-skm',
  'hal-26-contoh-aturan-validasi',
  'hal-27-contoh-aturan-tabulasi',
  'hal-28-struktur-organisasi-hortikultura',
  'hal-28-alur-laporan-dokumen-hortikultura',
]) {
  let ok = true
  try {
    readFileSync(join(root, 'public/materi', `${img}.png`))
  } catch {
    ok = false
  }
  assert(ok && phaseSrc.includes(`/materi/${img}.png`), `PDF visual ${img} must exist and be used`)
}
assert(
  materiBlock.includes('loading="lazy"') &&
    materiBlock.includes('tidak digambar ulang') &&
    !materiBlock.includes('Gambar halaman tidak disematkan') &&
    !materiBlock.includes('Preview dari Materi'),
  'Materi block: real visuals lazy-loaded; no "preview" label without a preview',
)

assert(
  guidedLearningCard.includes('>Apa?<') &&
    guidedLearningCard.includes('>Contoh<') &&
    guidedLearningCard.includes('>Yang bisa dipelajari<') &&
    guidedLearningCard.includes('>Format kerja StatPlan<') &&
    guidedLearningCard.includes('>Bukti dukung<') &&
    guidedLearningCard.includes('Sudah dipahami') &&
    guidedLearningCard.includes('aria-expanded') &&
    guidedLearningCard.includes('Contoh ilustratif StatPlan') &&
    !guidedLearningCard.includes('Download template'),
  'GuidedLearningCard must present Apa/Contoh/Pelajari/Format kerja/Bukti/Sudah dipahami',
)
assert(
  guidedSession.includes('GUIDED_SCHEMA_VERSION') &&
    guidedSession.includes('migrateGuidedMapsV1toV2') &&
    guidedSession.includes("unlockedPhases: ['specify_need']") &&
    guidedSession.includes('upsertTemplateDraft'),
  'Guided session must migrate legacy card ids and keep drafts/unlock',
)
const legacyIds = [...guidedMigration.matchAll(/from: '([a-z]+-\d\.\d)'/g)].map((m) => m[1])
assert(legacyIds.length === 48, `Migration must map all 48 legacy card ids (found ${legacyIds.length})`)
assert(guidedMigration.includes('legacy'), 'Migration must archive v1 data')

assert(
  guidedPhasePage.includes('Mode Terpandu') &&
    guidedPhasePage.includes('Selesai memahami tahap ini') &&
    guidedPhasePage.includes('Lanjut ke Perancangan') &&
    guidedPhasePage.includes('subproses sudah dipahami') &&
    guidedPhasePage.includes('PhaseChapter'),
  'GuidedPhasePage must implement phase learning + unlock handoff',
)
for (const n of ['2', '3', '4', '5', '6', '7', '8']) {
  assert(
    guidedPhasePage.includes(`completePhase${n}Learning`),
    `GuidedPhasePage must complete phase ${n}`,
  )
}
assert(
  guidedPhasePage.includes('Mode Terpandu selesai') &&
    guidedPhasePage.includes('Periksa di Workspace') &&
    guidedPhasePage.includes('penyelesaian Mode Terpandu StatPlan') &&
    guidedPhasePage.includes('Review StatPlan') &&
    guidedPhasePage.includes('bukan persetujuan resmi BPS') &&
    !guidedPhasePage.includes('Phase 9') &&
    !guidedPhasePage.includes('phase9'),
  'Guided completion is honest (no Phase 9, not BPS approval)',
)
assert(
  !guidedPhasePage.includes('computeProjectProgress') &&
    !guidedLearningCard.includes('checklistState') &&
    !guidedPhasePage.includes('Dokumen wajib BPS'),
  'Guided Mode must not drive Workspace checklist/progress or claim BPS mandates',
)
assert(
  guidedTemplatePanel.includes('Isian Anda') &&
    guidedTemplatePanel.includes('Disimpan secara lokal') &&
    guidedTemplatePanel.includes('Reset draft') &&
    guidedTemplatePanel.includes("kind === 'repeatableRows'") &&
    !guidedTemplatePanel.includes('Tersimpan di server') &&
    !guidedTemplatePanel.includes('StatPlan menemukan'),
  'Format kerja panel: local drafts, generic rows, no fake server/portal claims',
)

const inventory = readFileSync(join(root, 'docs/claude-source-inventory.md'), 'utf8')
assert(
  (inventory.match(/^\| \d\.\d /gm) ?? []).length === 44,
  'Source inventory must list all 44 subprocesses',
)

// --- Exported DOCX is a StatPlan draft, never an official-looking BPS/government document ---
{
  const gen = readFileSync(join(root, 'src/lib/generateDocument.ts'), 'utf8')
  for (const banned of [
    'PEMERINTAH KABUPATEN',
    "p('Badan Pusat Statistik",
    'keyakinan',
    'memerlukan validasi BPS',
    'BPS Kabupaten Lombok Tengah · DRAF',
    'aiRecommendation.confidence',
    'Rekomendasi Jenis Kegiatan',
    'diajukan dan diterima',
  ]) {
    assert(!gen.includes(banned), `generateDocument.ts must not contain “${banned}”`)
  }
  assert(
    gen.includes('DRAFT — BUKAN DOKUMEN RESMI BPS') &&
      gen.includes('Saran awal metode: ') &&
      gen.includes('bukan merupakan keputusan atau rekomendasi resmi BPS') &&
      gen.includes('jenisLabel(project.jenisKegiatan)'),
    'Export cover states draft status; method is a rule-based “Saran awal” taken from the project',
  )
  // Professional draft structure: status box never equals approval; honest statuses; appendix checklist.
  for (const needed of [
    'Informasi Dokumen',
    'Ringkasan Perencanaan',
    'Dasar Perencanaan',
    'bukan bukti bahwa kegiatan statistik telah selesai atau memperoleh persetujuan resmi',
    'Saran Awal StatPlan',
    'Contoh jadwal perencanaan — bukan durasi wajib BPS.',
    'Pemeriksaan Sumber / Portal Rujukan',
    'Ringkasan GSBPM',
    'Ringkasan Validasi',
    'Belum diverifikasi',
    'Draf informasi untuk proses pengajuan rekomendasi',
    'DRAFT METADATA',
    'perlu disesuaikan dan diverifikasi sesuai ketentuan yang berlaku',
    'Catatan dan Batasan',
    'Lampiran A — Checklist GSBPM 5.2',
    'Bukan dokumen resmi BPS',
  ]) {
    assert(gen.includes(needed), `generateDocument.ts must contain “${needed}”`)
  }
  const asisten = readFileSync(join(root, 'src/features/settings/AssistantPage.tsx'), 'utf8')
  assert(
    !/keyakinan|\.confidence/.test(asisten) &&
      asisten.includes('Saran awal berdasarkan aturan sederhana StatPlan, bukan keputusan metodologis atau'),
    'Asisten shows a rule-based “Saran awal”, never a confidence percentage',
  )
  const demoSrc = readFileSync(join(root, 'src/demo/projects.ts'), 'utf8')
  assert(!/diajukan dan diterima|telah diterima BPS/.test(demoSrc), 'Demo data must not claim BPS accepted a recommendation')
  const att = readFileSync(join(root, 'src/lib/projectAttention.ts'), 'utf8')
  assert(
    /portal_sdi: 'portal'/.test(att) && /jenis_undocumented: 'portal'/.test(att) && /rekomendasi_required: 'rekomendasi'/.test(att),
    'Fix links carry their exact location (portal → Specify Need 1.5, rekomendasi → Design)',
  )
}

console.log('QA static checks:', failures.length === 0 ? 'PASS' : 'FAIL')
failures.forEach((f) => console.log('  ✗', f))
process.exit(failures.length === 0 ? 0 : 1)
