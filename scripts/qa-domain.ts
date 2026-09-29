/**
 * Domain QA scenarios — run: npx tsx scripts/qa-domain.ts
 */
import {
  computeDashboardStatistics,
  isProjectReadyForReview,
  isRecommendationPreparationPending,
  isReviewStatusStale,
} from '../src/demo/statistics'
import { canExport, requiresRekomendasiBps, validateProject } from '../src/domain/validation'
import {
  computeProjectProgress,
  GSBPM_PHASES,
  isChecklistVisible,
  isSubProcessVisible,
} from '../src/domain/gsbpm'
import { defaultMetadataValues } from '../src/domain/metadataSchema'
import { exportStatusLabel } from '../src/lib/projectMeta'
import {
  ATTENTION_LIMIT,
  buildAttentionItems,
  nextActionForProject,
  sortProjectsForDashboard,
} from '../src/lib/projectAttention'
import {
  buildDashboardBundle,
  buildPlanningWeeks,
  buildRecentlyUpdatedProjects,
  planningWeekLabel,
} from '../src/demo/dashboard'
import type { Project } from '../src/domain/types'

function baseProject(overrides: Partial<Project> = {}): Project {
  const jenis = overrides.jenisKegiatan ?? 'survei'
  const name = overrides.name ?? 'Survei Kepuasan Pelayanan'
  return {
    id: 'test-1',
    name,
    description: 'Mengukur kepuasan masyarakat terhadap pelayanan publik.',
    topik: 'kepuasan',
    klasifikasi: 'sektoral',
    jenisKegiatan: jenis,
    objectives: [],
    variables: [{ id: 'v1', name: 'Skor', definition: 'Skor kepuasan', type: 'numerik' }],
    indicators: [],
    timeline: [],
    questionnaire: [{ id: 'q1', number: '1', text: 'Pertanyaan', type: 'tertutup' }],
    design: {
      caraPengumpulan: jenis,
      metodePengumpulan: 'wawancara',
      modaPengumpulan: 'capi',
      metodeSampling: 'Stratified',
      ukuranSampel: '100',
    },
    portalSdi: {
      checked: false,
      sirusaChecked: false,
      romantikChecked: false,
      notes: '',
    },
    rekomendasiBps: {
      namaKegiatan: name,
      penyelenggara: 'Dinas X',
      tujuan: 'Mengukur kepuasan',
      periode: '2026',
      catatan: '',
    },
    metadata: defaultMetadataValues(name, jenis),
    checklistState: {},
    currentPhaseId: 'specify_need',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function fillMetadata(p: Project): Project {
  return {
    ...p,
    metadata: {
      ...p.metadata,
      kegiatan: {
        ...p.metadata.kegiatan,
        penyelenggara: 'Dinas X',
        cakupan_wilayah: 'Lombok Tengah',
        tujuan_kegiatan: 'Mengukur kepuasan',
        penanggung_jawab: 'Kepala Dinas',
      },
    },
  }
}

function fillAllMetadata(p: Project): Project {
  const filled = fillMetadata(p)
  return {
    ...filled,
    metadata: {
      ...filled.metadata,
      variabel: {
        ...filled.metadata.variabel,
        nama_variabel: 'Skor',
        definisi_variabel: 'Skor kepuasan',
        sumber_informasi: 'Wawancara',
        metode_pengumpulan: 'Wawancara langsung',
      },
      indikator: {
        ...filled.metadata.indikator,
        nama_indikator: 'IKM',
        definisi_indikator: 'Indeks kepuasan',
        rumus_perhitungan: 'Rata-rata skor × 25',
        variabel_terkait: 'Skor',
      },
    },
  }
}

function fillChecklist(p: Project, pct = 85): Project {
  const progress = computeProjectProgress(p.jenisKegiatan, p.klasifikasi, p.checklistState)
  const target = Math.ceil((progress.total * pct) / 100)
  const state = { ...p.checklistState }
  // Mark items by scanning gsbpm would need import - use brute force known ids
  const ids = [
    'sn-1','sn-2','sn-3','sn-4','sn-5','sn-6','sn-7','sn-8','sn-9','sn-10','sn-11',
    'de-1','de-2','de-3','de-4','de-5','de-6','de-8','de-9','de-10','de-11','de-12','de-13','de-14',
    'bu-1','bu-2','bu-3','bu-4','bu-6','bu-7','bu-8','bu-9','bu-10','bu-11','bu-12','bu-13','bu-14',
    'co-1','co-2','co-3','co-5','co-6','co-7','co-8','co-9',
    'pr-1','pr-3','pr-4','pr-5','pr-6','pr-7','pr-8','pr-9',
    'an-1','an-2','an-4','an-5','an-6',
    'di-1','di-2','di-3',
    'ev-1','ev-2','ev-3',
  ]
  let n = 0
  for (const id of ids) {
    if (n >= target) break
    state[id] = true
    n++
  }
  return { ...p, checklistState: state }
}

function fillAllRequired(p: Project): Project {
  const state = { ...p.checklistState }
  for (const phase of GSBPM_PHASES) {
    for (const sp of phase.subProcesses) {
      if (!isSubProcessVisible(sp.skipWhen, p.jenisKegiatan)) continue
      for (const item of sp.checklist) {
        if (!isChecklistVisible(item, p.jenisKegiatan, p.klasifikasi)) continue
        if (!item.required) continue
        state[item.id] = true
      }
    }
  }
  return { ...p, checklistState: state }
}

const failures: string[] = []
function test(name: string, cond: boolean) {
  if (!cond) failures.push(name)
}

// Scenario 1: Survei — portal blocks export
const s1 = baseProject()
test('S1: export blocked without portal', !canExport(s1))

// Scenario 2: Portal only — still blocked
const s2 = fillMetadata(baseProject({
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: '' },
}))
test('S2: export blocked without checklist', !canExport(s2))

// Scenario 3: Kompromin — no de-8/de-9 required
const s3 = baseProject({ jenisKegiatan: 'kompromin', klasifikasi: 'dasar', questionnaire: [] })
const s3issues = validateProject(s3)
test('S3: kompromin no sampling warning', !s3issues.some((i) => i.code === 'sampling_design'))

// Scenario 4: Sektoral requires rekomendasi
const s4 = fillMetadata(fillChecklist(baseProject({
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
}), 90))
s4.checklistState['de-12'] = false
test('S4: sektoral blocked without de-12', !canExport(s4))

// Scenario 5: Full sektoral survei export path
const s5 = fillMetadata(fillChecklist(baseProject({
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
  checklistState: { 'de-12': true },
}), 90))
test('S5: sektoral survei can export when complete', canExport(s5))

// Scenario 6: Portal bypass — sirusa only must fail
const s6 = fillMetadata(fillChecklist(baseProject({
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: false, notes: '' },
  checklistState: { 'de-12': true },
}), 90))
test('S6: partial portal blocks export', !canExport(s6))

// Scenario 7: Dasar — no rekomendasi error
const s7 = fillMetadata(fillChecklist(baseProject({
  klasifikasi: 'dasar',
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: '' },
}), 90))
test('S7: dasar no rekomendasi error', !validateProject(s7).some((i) => i.code === 'rekomendasi_required'))
test('S7b: dasar can export when complete', canExport(s7))

const emptyStats = computeDashboardStatistics([])
test('KPI empty total is 0', emptyStats.total === 0)
test('KPI empty average is 0 not NaN', emptyStats.averageCompletion === 0)
test('KPI empty export ready is 0', emptyStats.exportReady === 0)

const zeroProgress = computeProjectProgress(s1.jenisKegiatan, s1.klasifikasi, s1.checklistState)
test('KPI 0% checklist is valid', zeroProgress.pct === 0 && zeroProgress.total > 0)
test('KPI 0% is not exportable', !canExport(s1))
test('KPI 0% export label is not siap', exportStatusLabel(s1) !== 'Siap diekspor')

const s4progress = computeProjectProgress(s4.jenisKegiatan, s4.klasifikasi, s4.checklistState)
test('KPI partial/80%+ still blocked without de-12', s4progress.pct >= 80 && !canExport(s4))
test('KPI recommendation pending uses de-12', isRecommendationPreparationPending(s4))
test('KPI recommendation required is sektoral', requiresRekomendasiBps(s4))

const s5progress = computeProjectProgress(s5.jenisKegiatan, s5.klasifikasi, s5.checklistState)
test('KPI passing validation can export', canExport(s5) && s5progress.pct >= 80)
test('KPI passing export label', exportStatusLabel(s5) === 'Siap diekspor')
test('KPI recommendation completed not pending', !isRecommendationPreparationPending(s5))

const fullChecklist = fillAllRequired(fillMetadata(baseProject({
  portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
})))
const fullProgress = computeProjectProgress(
  fullChecklist.jenisKegiatan,
  fullChecklist.klasifikasi,
  fullChecklist.checklistState,
)
test('KPI 100% checklist is valid', fullProgress.pct === 100)
test('KPI 100% can export', canExport(fullChecklist))

const staleReview = { ...s4, status: 'ready_for_review' as const }
test('KPI stale review is not siap ditinjau', !isProjectReadyForReview(staleReview))
test('KPI stale review needs completion', isReviewStatusStale(staleReview))
test('KPI stale review export blocked', !canExport(staleReview))

const currentReview = { ...s5, status: 'ready_for_review' as const }
test('KPI current review is siap ditinjau', isProjectReadyForReview(currentReview))
test('KPI current review is not stale', !isReviewStatusStale(currentReview))
test('KPI current review can export', canExport(currentReview))

const mixedStats = computeDashboardStatistics([s1, currentReview, staleReview, s7])
test('KPI mixed counts every project', mixedStats.total === 4)
test('KPI mixed ready-for-review uses canExport', mixedStats.readyForReview === 1)
test('KPI mixed stale counted as needs completion', mixedStats.needsCompletion === 1)
test('KPI mixed export ready uses canExport', mixedStats.exportReady === 2)
test(
  'KPI mixed average is mean of authoritative progress',
  mixedStats.averageCompletion === Math.round(
    (zeroProgress.pct + s5progress.pct + s4progress.pct +
      computeProjectProgress(s7.jenisKegiatan, s7.klasifikasi, s7.checklistState).pct) / 4,
  ),
)
test('KPI dasar not counted as recommendation pending', !isRecommendationPreparationPending(s7))
test('KPI draft status counted', mixedStats.draft === 2)

const cleanProject = fillAllRequired(
  fillAllMetadata(
    baseProject({
      id: 'clean-1',
      name: 'Proyek bersih',
      portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
      status: 'ready_for_review',
    }),
  ),
)
test('Attention empty workspace is empty', buildAttentionItems([]).length === 0)
test('Attention clean project has no items', buildAttentionItems([cleanProject]).length === 0)
test('Attention clean next action is siap diekspor', nextActionForProject(cleanProject).label === 'Siap diekspor')
test('Attention clean can export', canExport(cleanProject) && validateProject(cleanProject).length === 0)

const portalBlocked = baseProject({
  id: 'user-portal',
  name: 'Portal belum dicek',
  updatedAt: '2026-09-07T10:00:00.000Z',
})
const portalAttention = buildAttentionItems([portalBlocked])
test('Attention validation error is listed', portalAttention.length === 1)
test('Attention uses portal_sdi from validateProject', portalAttention[0]?.code === 'portal_sdi')
test(
  'Attention does not duplicate the same project issue',
  portalAttention.filter((item) => item.projectId === portalBlocked.id).length === 1,
)
test(
  'Attention extraCount covers remaining issues',
  (portalAttention[0]?.extraCount ?? 0) === validateProject(portalBlocked).length - 1,
)
// Portal issues are fixed in Alur kerja; the bare URL now opens Timeline, so the link must name the tab.
test(
  'Attention portal link opens Alur kerja at the portal check (Specify Need 1.5)',
  portalAttention[0]?.href === `/app/projects/${portalBlocked.id}?tab=workflow&focus=portal`,
)
test(
  'Attention next action matches primary issue',
  nextActionForProject(portalBlocked).label === 'Lengkapi pemeriksaan portal',
)

const metadataBlocked = fillAllRequired(
  baseProject({
    id: 'user-metadata',
    name: 'Metadata kegiatan kurang',
    portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
  }),
)
const metadataIssues = validateProject(metadataBlocked)
const metadataAttention = buildAttentionItems([metadataBlocked])
test('Attention metadata error uses domain code', metadataAttention[0]?.code === 'metadata_keg')
test(
  'Attention metadata link uses existing tab query',
  metadataAttention[0]?.href === `/app/projects/${metadataBlocked.id}?tab=metadata`,
)
test('Attention metadata still blocks export', !canExport(metadataBlocked) && metadataIssues.some((i) => i.code === 'metadata_keg'))

const rekomendasiBlocked = fillAllMetadata(
  fillChecklist(
    baseProject({
      id: 'user-rekomendasi',
      name: 'Rekomendasi belum ditandai',
      portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
    }),
    90,
  ),
)
rekomendasiBlocked.checklistState['de-12'] = false
const rekomendasiAttention = buildAttentionItems([rekomendasiBlocked])
test(
  'Attention recommendation uses domain error',
  rekomendasiAttention[0]?.code === 'rekomendasi_required' && !canExport(rekomendasiBlocked),
)
test(
  'Attention recommendation next action is user language',
  nextActionForProject(rekomendasiBlocked).label === 'Tandai persiapan rekomendasi',
)

const checklistBlocked = fillAllMetadata(
  baseProject({
    id: 'user-checklist',
    name: 'Checklist belum 80%',
    portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
    checklistState: { 'de-12': true, 'sn-10': true },
  }),
)
const checklistAttention = buildAttentionItems([checklistBlocked])
test(
  'Attention incomplete checklist uses domain error',
  checklistAttention[0]?.code === 'checklist_incomplete' && !canExport(checklistBlocked),
)
test(
  'Attention checklist link uses existing tab',
  checklistAttention[0]?.href === `/app/projects/${checklistBlocked.id}?tab=checklist`,
)

const warningOnly = fillAllRequired(
  fillMetadata(
    baseProject({
      id: 'user-warning',
      name: 'Hanya peringatan metadata var',
      portalSdi: { checked: true, sirusaChecked: true, romantikChecked: true, notes: 'ok' },
      metadata: {
        ...fillMetadata(baseProject()).metadata,
        indikator: {
          nama_indikator: 'IKM',
          definisi_indikator: 'Indeks',
          rumus_perhitungan: 'Rata-rata',
          variabel_terkait: 'Skor',
        },
      },
    }),
  ),
)
const warningIssues = validateProject(warningOnly)
test('Attention warning-only can export', canExport(warningOnly))
test('Attention warning-only still listed', buildAttentionItems([warningOnly])[0]?.severity === 'warning')
test('Attention warning-only has no error codes', !warningIssues.some((i) => i.severity === 'error'))

const archivedBlocked = {
  ...portalBlocked,
  id: 'archived-portal',
  name: 'Arsip dengan isu',
  status: 'archived' as const,
}
test('Attention skips archived projects', buildAttentionItems([archivedBlocked, cleanProject]).length === 0)

const manyProjects = Array.from({ length: 8 }, (_, index) =>
  baseProject({
    id: `user-many-${index}`,
    name: `Proyek banyak ${index}`,
    updatedAt: `2026-09-0${index + 1}T10:00:00.000Z`,
  }),
)
const limited = buildAttentionItems(manyProjects)
test('Attention keeps compact limit', limited.length === ATTENTION_LIMIT)
test(
  'Attention ids are unique after limit',
  new Set(limited.map((item) => item.id)).size === limited.length,
)

const userError = baseProject({
  id: 'user-error',
  name: 'Pengguna error',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
const demoError = baseProject({
  id: 'demo-error',
  name: 'Demo error',
  updatedAt: '2026-09-07T00:00:00.000Z',
})
const mixedAttention = buildAttentionItems([demoError, userError])
test('Attention mixed workspace keeps demo issues', mixedAttention.some((item) => item.projectId === demoError.id))
test('Attention mixed workspace keeps user issues', mixedAttention.some((item) => item.projectId === userError.id))
test(
  'Attention ranks same-severity user before demo',
  mixedAttention[0]?.projectId === userError.id && mixedAttention[1]?.projectId === demoError.id,
)
test('Attention marks demo provenance', mixedAttention[1]?.isDemo === true && mixedAttention[0]?.isDemo === false)

const exportReadyDraft = {
  ...cleanProject,
  id: 'clean-draft',
  status: 'draft' as const,
  updatedAt: '2026-09-01T00:00:00.000Z',
}
const inProgressClean = {
  ...cleanProject,
  id: 'clean-progress',
  status: 'in_progress' as const,
  updatedAt: '2026-08-01T00:00:00.000Z',
}
const ordered = sortProjectsForDashboard([
  archivedBlocked,
  exportReadyDraft,
  demoError,
  inProgressClean,
  userError,
])
test('Project order puts blocking errors first', ordered[0]?.id === userError.id)
test('Project order puts demo errors after user errors', ordered[1]?.id === demoError.id)
test('Project order puts in_progress before draft when clean', ordered[2]?.id === inProgressClean.id)
test('Project order puts archived last', ordered[ordered.length - 1]?.id === archivedBlocked.id)

const longName = baseProject({
  id: 'user-long-name',
  name: 'Survei Kepuasan Pelayanan Perizinan DPMPTSP Kabupaten Lombok Tengah Tahun 2026 Untuk Evaluasi Standar Pelayanan Publik',
})
test('Attention keeps long project names', buildAttentionItems([longName])[0]?.projectName === longName.name)
test(
  'Attention next-action href is never empty',
  nextActionForProject(longName).href.startsWith('/app/projects/'),
)

const emptyBundle = buildDashboardBundle([])
test('Recent empty workspace is empty', emptyBundle.recentlyUpdated.length === 0)
test('Planning empty workspace is empty', emptyBundle.planningWeeks.length === 0)
test('Ready-for-review empty workspace is empty', emptyBundle.readyForReviewProjects.length === 0)
test('Empty bundle has no synthetic activity field', !('activities' in emptyBundle))
test('Empty bundle has no deadline field', !('deadlines' in emptyBundle))

const noTimeline = baseProject({
  id: 'user-no-timeline',
  status: 'in_progress',
  timeline: [],
  currentPhaseId: 'design',
  updatedAt: '2026-09-07T08:00:00.000Z',
})
test('Planning omits project without timeline', buildPlanningWeeks([noTimeline]).length === 0)
test('Recent includes user project without timeline', buildRecentlyUpdatedProjects([noTimeline])[0]?.projectId === noTimeline.id)

const relativeTimeline: Project['timeline'] = [
  { id: 'tl-1', title: 'Identifikasi kebutuhan OPD', phaseId: 'specify_need', startWeek: 1, endWeek: 2 },
  { id: 'tl-2', title: 'Perancangan metode & instrumen', phaseId: 'design', startWeek: 3, endWeek: 8 },
  { id: 'tl-3', title: 'Pengumpulan data lapangan', phaseId: 'collect', startWeek: 8, endWeek: 10 },
]
const withTimeline = baseProject({
  id: 'user-relative-tl',
  name: 'Proyek dengan rencana minggu',
  status: 'in_progress',
  currentPhaseId: 'design',
  timeline: relativeTimeline,
  updatedAt: '2026-09-06T00:00:00.000Z',
})
const planning = buildPlanningWeeks([withTimeline])
test('Planning uses current phase timeline row', planning[0]?.endWeek === 8 && planning[0]?.startWeek === 3)
test('Planning uses GSBPM phase title', planning[0]?.phaseTitle === 'Perancangan')
test('Planning week label is relative', planningWeekLabel(3, 8) === 'Rencana minggu ke-3–8')
test('Planning week label is not a calendar date', !/September|Invalid Date|Terlambat|Overdue/i.test(planningWeekLabel(3, 8)))
test('Planning links to existing timeline tab', planning[0]?.href === `/app/projects/${withTimeline.id}?tab=timeline`)

const unmatchedPhase = baseProject({
  id: 'user-unmatched-phase',
  status: 'in_progress',
  currentPhaseId: 'analyse',
  timeline: relativeTimeline,
})
test('Planning skips unmatched currentPhaseId', buildPlanningWeeks([unmatchedPhase]).length === 0)

const zeroWeek = baseProject({
  id: 'user-zero-week',
  status: 'in_progress',
  currentPhaseId: 'design',
  timeline: [{ id: 'z', title: 'Draft', phaseId: 'design', startWeek: 1, endWeek: 0 }],
})
test('Planning skips non-positive endWeek', buildPlanningWeeks([zeroWeek]).length === 0)

const nanWeek = baseProject({
  id: 'user-nan-week',
  status: 'in_progress',
  currentPhaseId: 'design',
  timeline: [{ id: 'n', title: 'Draft', phaseId: 'design', startWeek: 1, endWeek: Number.NaN }],
})
test('Planning skips NaN endWeek', buildPlanningWeeks([nanWeek]).length === 0)

const weekValues = [16, 1, 10, 2].map((week, index) =>
  baseProject({
    id: `user-week-${week}`,
    name: `Minggu ${week}`,
    status: 'in_progress',
    currentPhaseId: 'design',
    updatedAt: `2026-08-0${index + 1}T00:00:00.000Z`,
    timeline: [{ id: `w-${week}`, title: 'Perancangan', phaseId: 'design', startWeek: week, endWeek: week }],
  }),
)
const orderedWeeks = buildPlanningWeeks(weekValues)
test(
  'Planning sorts endWeek numerically',
  orderedWeeks.map((item) => item.endWeek).join(',') === '1,2,10,16',
)
test('Planning may show week 16 only when persisted', orderedWeeks.some((item) => item.endWeek === 16))

const sameWeekA = baseProject({
  id: 'user-same-b',
  status: 'in_progress',
  currentPhaseId: 'design',
  updatedAt: '2026-09-01T00:00:00.000Z',
  timeline: [{ id: 's1', title: 'A', phaseId: 'design', startWeek: 4, endWeek: 4 }],
})
const sameWeekB = baseProject({
  id: 'user-same-a',
  status: 'in_progress',
  currentPhaseId: 'design',
  updatedAt: '2026-09-01T00:00:00.000Z',
  timeline: [{ id: 's2', title: 'B', phaseId: 'design', startWeek: 4, endWeek: 4 }],
})
const sameWeekOrder = buildPlanningWeeks([sameWeekA, sameWeekB])
test(
  'Planning same endWeek uses stable projectId',
  sameWeekOrder.map((item) => item.projectId).join(',') === 'user-same-a,user-same-b',
)

const readyClean = {
  ...cleanProject,
  id: 'ready-clean-tl',
  status: 'ready_for_review' as const,
  currentPhaseId: 'disseminate' as const,
  timeline: [
    { id: 'r1', title: 'Publikasi', phaseId: 'disseminate' as const, startWeek: 15, endWeek: 16 },
  ],
}
test('Planning omits siap ditinjau export-ready project', buildPlanningWeeks([readyClean]).length === 0)
test('Siap ditinjau list uses current status not export history', buildDashboardBundle([readyClean]).readyForReviewProjects[0]?.projectId === readyClean.id)
test('Siap diekspor is canExport not history', canExport(readyClean))
test('No exportedAt is invented', !('exportedAt' in readyClean))

const archivedTl = baseProject({
  id: 'archived-tl',
  status: 'archived',
  currentPhaseId: 'design',
  timeline: relativeTimeline,
  updatedAt: '2026-09-07T12:00:00.000Z',
})
test('Planning skips archived', buildPlanningWeeks([archivedTl, withTimeline]).every((item) => item.projectId !== archivedTl.id))
test('Recent skips archived', buildRecentlyUpdatedProjects([archivedTl, withTimeline]).every((item) => item.projectId !== archivedTl.id))

const newer = baseProject({
  id: 'user-newer',
  updatedAt: '2026-09-07T10:00:00.000Z',
})
const older = baseProject({
  id: 'user-older',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
test(
  'Recent order uses persisted updatedAt',
  buildRecentlyUpdatedProjects([older, newer]).map((item) => item.projectId).join(',') ===
    'user-newer,user-older',
)

const demoPlanned = baseProject({
  id: 'demo-planned',
  name: 'Demo rencana',
  status: 'in_progress',
  currentPhaseId: 'collect',
  timeline: relativeTimeline,
})
const mixedPlan = buildPlanningWeeks([demoPlanned, withTimeline])
test('Planning includes demo with real timeline', mixedPlan.some((item) => item.projectId === 'demo-planned'))
test('Planning includes user with real timeline', mixedPlan.some((item) => item.projectId === withTimeline.id))
test(
  'Recent mixed workspace is not synthetic events',
  buildRecentlyUpdatedProjects([demoPlanned, withTimeline]).every((item) => item.updatedAt.includes('T')),
)

console.log(failures.length === 0 ? 'Domain QA: PASS' : 'Domain QA: FAIL')
failures.forEach((f) => console.log('  ✗', f))
process.exit(failures.length === 0 ? 0 : 1)
