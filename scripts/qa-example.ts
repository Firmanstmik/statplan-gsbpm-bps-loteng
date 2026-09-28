/**
 * Example Walkthrough QA — demo alignment with BPS voice-note direction
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
  EXAMPLE_JOURNEYS,
  EXAMPLE_SKM,
  EXAMPLE_WALKTHROUGH_STEPS,
  getExampleBySlug,
  sourceBadgeLabel,
} from '../src/content/exampleJourney'
import { allocatePhaseDates, validateProjectDateRange } from '../src/content/planningTimeline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const failures: string[] = []
function assert(cond: unknown, msg: string) {
  if (!cond) failures.push(msg)
}

assert(EXAMPLE_JOURNEYS.length === 3, '3 examples')
assert(EXAMPLE_WALKTHROUGH_STEPS.map((s) => s.label).join('|') === 'Alur|Jadwal|Persiapan|Ringkasan', '4 steps intact')
assert(EXAMPLE_SKM.schedule.pdfPage === 23, 'SKM schedule Hal. 23')
assert(
  (EXAMPLE_SKM.schedule.sourceRows ?? []).some(
    (r) => r.activity === 'Analisis hasil SKM' && r.period === 'November – Desember',
  ),
  'PDF activity wording',
)
assert(
  EXAMPLE_SKM.schedule.months.every((m) => !/W\d|Minggu/i.test(m.month)),
  'no week labels in SKM schedule',
)

for (const ex of EXAMPLE_JOURNEYS) {
  assert(ex.whyConducted.trim().length > 8, `${ex.slug} whyConducted`)
  assert(ex.prepareItems.length === 6, `${ex.slug} need prepare items`)
  assert(ex.preparePhases.length === 8, `${ex.slug} has 8 progressive phases`)
  assert(ex.preparePhases[0]!.phaseId === 'specify_need', `${ex.slug} starts with need`)
  assert(ex.preparePhases[0]!.items.length === 6, `${ex.slug} need depth`)
  assert(
    ex.preparePhases.slice(1).every((p) => p.items.length >= 1),
    `${ex.slug} later phases have overview items`,
  )
  for (const item of ex.prepareItems) {
    assert(item.apa && item.contoh && item.buktiDukung && item.template?.title, `${ex.slug} ${item.id} Apa/Contoh/Template/Bukti`)
    assert(
      item.contohDetail && item.contohDetail.length >= 2,
      `${ex.slug} ${item.id} full example detail`,
    )
    assert(
      item.template.fields && item.template.fields.length >= 2,
      `${ex.slug} ${item.id} format kerja fields (no empty template)`,
    )
    assert(item.template.status === 'preview', `${ex.slug} ${item.id} template preview (not coming_soon dead-end)`)
    if (item.sourceType === 'pdf') {
      assert(item.pdfPage, `${ex.slug} ${item.id} page`)
      assert(sourceBadgeLabel(item).includes(`Hal. ${item.pdfPage}`), 'badge')
    }
    assert(!item.template.title.toLowerCase().includes('resmi bps'), 'no fake official BPS template title')
  }
  for (const phase of ex.preparePhases) {
    for (const item of phase.items) {
      const blob = `${item.template.title} ${item.template.description} ${item.template.note ?? ''}`
      const claimsOfficial = /template resmi bps/i.test(blob)
      const deniesOfficial = /bukan template resmi/i.test(blob)
      assert(
        !claimsOfficial || deniesOfficial,
        `${ex.slug} ${item.id} no fabricated official template`,
      )
    }
  }
}

assert(EXAMPLE_SKM.prepareItems.find((i) => i.id === 'p-1.5')?.pdfPage === 15, '1.5 p.15')
assert(EXAMPLE_SKM.prepareItems.find((i) => i.id === 'p-1.6')?.pdfPage === 16, '1.6 p.16')
assert(
  !/Indikator kependudukan apa yang dibutuhkan/i.test(
    getExampleBySlug('kompromin')?.prepareItems.find((i) => i.id === 'p-1.1')?.contoh ?? '',
  ),
  'kompromin 1.1 is not one-line placeholder',
)
assert(
  /Survei Kepuasan Masyarakat/i.test(
    EXAMPLE_SKM.prepareItems.find((i) => i.id === 'p-1.1')?.contohDetail?.[0]?.value ?? '',
  ),
  'SKM 1.1 full example has activity name',
)
assert(getExampleBySlug('skm')?.projectId === 'demo-skm-dpmptsp-2026', 'canonical demo id unchanged')

const dateOk = validateProjectDateRange('2027-01-10', '2027-04-09')
assert(dateOk.ok, 'interactive date range valid')
const plan = allocatePhaseDates('2027-01-10', '2027-04-09')
assert(plan.length === 8, 'try-your-dates uses 8-phase allocation')

const landing = readFileSync(join(root, 'src/features/landing/LandingPage.tsx'), 'utf8')
assert(landing.includes('/contoh/') && landing.includes('Mulai perencanaan'), 'Landing CTAs')

const page = readFileSync(join(root, 'src/features/examples/ExampleWalkthroughPage.tsx'), 'utf8')
// Case-study structure (stable data-section markers, not marketing copy)
for (const section of ['hero', 'sekilas', 'mengapa', 'roadmap', 'pelajari', 'materi', 'tiru', 'mulai']) {
  assert(page.includes(`data-section="${section}"`), `case study section ${section}`)
}
assert(page.includes('data-phase-lesson'), 'phase lessons are individually addressable')
assert(page.includes('aria-expanded') && page.includes('aria-controls'), 'phase lessons use disclosure semantics')
assert(page.includes('/app/new?from='), 'CTA hands off to intake with a copy of the example')
assert(page.includes('Contoh asli tetap aman'), 'copy-safety reassurance near CTA')
assert(page.includes('GSBPM sendiri bersifat fleksibel'), 'non-linear GSBPM note')
assert(page.includes('SourceNote kind="A"') && page.includes('SourceNote kind="C"'), 'A vs C source labels')
assert(page.includes('loading="lazy"') && page.includes('alt={visual.alt}'), 'PDF visuals lazy with alt text')
assert(page.includes('MATERI_JADWAL_HAL_23'), 'SKM schedule uses the exact Hal. 23 table')
assert(
  !page.includes('toggleChecklist') &&
    !page.includes('Siap diekspor') &&
    !page.includes('openWorkspace') &&
    !page.includes('Buka ruang kerja lengkap') &&
    !page.includes('loadDemoData') &&
    !page.includes('updateProject') &&
    !page.includes('useAppStore'),
  'Example is read-only: never touches the store, checklist, export, or demo projects',
)
assert(!page.includes('Template resmi BPS'), 'no fabricated official BPS template claim in UI')

for (const ex of EXAMPLE_JOURNEYS) {
  assert(ex.takeaways.length >= 3, `${ex.slug} has 3+ takeaways`)
  assert(
    ex.prepareItems[0]!.contohDetail?.some((r) => /^Pengguna/.test(r.label)),
    `${ex.slug} case facts expose pengguna`,
  )
}

const steps = readFileSync(join(root, 'src/content/exampleJourney.ts'), 'utf8')
assert(steps.includes("label: 'Persiapan'"), 'step label Persiapan')
assert(steps.includes('preparePhases'), 'preparePhases content')
assert(steps.includes('whyConducted'), 'whyConducted content')
assert(!steps.includes('Template resmi BPS'), 'content has no official BPS template claim')

if (failures.length) {
  console.error('qa-example FAILED:')
  failures.forEach((f) => console.error(' -', f))
  process.exit(1)
}
console.log('qa-example PASS')
