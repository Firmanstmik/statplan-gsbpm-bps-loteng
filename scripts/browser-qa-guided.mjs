/**
 * Guided Mode browser QA — every official GSBPM 5.2 subprocess (44) at five widths.
 * Uses system Chrome (channel: 'chrome').
 *
 * Usage (app must be running, e.g. `npm run build && npx vite preview --port 4173`):
 *   STATPLAN_URL=http://127.0.0.1:4173 node scripts/browser-qa-guided.mjs
 *
 * Per subprocess: open → title → source label → expand PDF points and example → lesson points →
 * Format kerja (opens panel, checks dialog, closes with Escape) → evidence → mark understood →
 * verify persisted state. Also checks overflow, broken images, console errors, network failures,
 * and the v1 → v2 saved-session migration.
 * Artifacts: qa/browser-guided/*.png + docs/browser-qa-guided-report.md
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'qa', 'browser-guided')
mkdirSync(outDir, { recursive: true })
const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4173'
const WIDTHS = (process.env.QA_WIDTHS || '375,390,430,768,1000,1280,1440').split(',').map(Number)
const STORAGE_KEY = 'statplan-guided-sessions-v1'

const PHASES = [
  { id: 'specify_need', n: 6, next: /^Lanjut ke Perancangan$/ },
  { id: 'design', n: 6, next: /^Lanjut ke Pembangunan$/ },
  { id: 'build', n: 7, next: /^Lanjut ke Pengumpulan Data$/ },
  { id: 'collect', n: 4, next: /^Lanjut ke Pengolahan Data$/ },
  { id: 'process', n: 8, next: /^Lanjut ke Analisis Data$/ },
  { id: 'analyse', n: 5, next: /^Lanjut ke Penyajian & Penyebarluasan$/ },
  { id: 'disseminate', n: 5, next: /^Lanjut ke Evaluasi$/ },
  { id: 'evaluate', n: 3, next: null },
]

const issues = []
const consoleErrors = []
const networkFails = []
const perWidth = {}
function issue(level, width, msg) {
  issues.push({ level, width, msg })
  console.log(`[${level}] (${width}) ${msg}`)
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
}

async function createProject(page) {
  await page.goto(`${BASE}/app/new?from=skm`, { waitUntil: 'load', timeout: 60000 })
  const skip = page.getByRole('button', { name: 'Lewati' })
  if (await skip.count()) await skip.first().click()
  const story = page.locator('#guided-story')
  await story.waitFor({ timeout: 30000 })
  if ((await story.inputValue()).trim().length < 12) {
    await story.fill('Saya ingin mengetahui tingkat kepuasan masyarakat terhadap pelayanan perizinan.')
  }
  await page.getByRole('button', { name: 'Lanjutkan' }).click()
  await page.getByRole('button', { name: /Gunakan.*lanjutkan/i }).click()
  await page.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/i }).click()
  await page.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/i }).click()
  await page.waitForURL(/\/guided/, { timeout: 20000 })
  await page.getByText(/subproses sudah dipahami/).first().waitFor({ timeout: 15000 })
  return page.url()
}

async function checkCard(page, width, code) {
  const id = `gsbpm-${code}`
  const card = page.locator(`[data-guided-card="${id}"]`)
  if ((await card.count()) !== 1) {
    issue('critical', width, `${code}: card not rendered`)
    return false
  }
  const toggle = card.locator('[data-guided-card-toggle]')
  try {
    await toggle.scrollIntoViewIfNeeded()
  } catch {
    // Transient re-render (e.g. route transition still settling) — note it and retry once.
    issue('minor', width, `${code}: card re-rendered during scroll (retried)`)
    await page.waitForTimeout(400)
    await toggle.scrollIntoViewIfNeeded()
  }
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
  const region = card.locator(':scope > div[role="region"]')
  await region.waitFor({ timeout: 5000 })

  // Title + official code
  const title = (await toggle.innerText()).trim()
  if (!title.startsWith(code)) issue('major', width, `${code}: header does not start with official code (“${title.slice(0, 40)}”)`)

  // Sections present, each exactly once
  for (const label of ['Apa?', 'Contoh', 'Yang bisa dipelajari', 'Format kerja StatPlan', 'Bukti dukung']) {
    const count = await region.getByRole('heading', { name: label, exact: true }).count()
    if (count !== 1) issue('major', width, `${code}: section “${label}” appears ${count}×`)
  }
  // Source label on Apa? and Contoh
  const text = await region.innerText()
  if (!/Penjelasan sederhana · Hal\. \d+/.test(text)) issue('major', width, `${code}: missing Apa? source label`)
  if (!/Dari materi · Hal\.|Contoh ilustratif StatPlan/.test(text)) issue('major', width, `${code}: missing Contoh source label`)
  if (/Preview dari Materi|Gambar halaman tidak disematkan/.test(text)) issue('major', width, `${code}: stale “preview” boilerplate`)

  // Expand PDF points
  const pointsBtn = region.getByRole('button', { name: /poin dari materi/i })
  if (await pointsBtn.count()) {
    await pointsBtn.click()
    if ((await pointsBtn.getAttribute('aria-expanded')) !== 'true') issue('minor', width, `${code}: points toggle not expanded`)
    if (!/Dari materi · Hal\./.test(await region.innerText())) issue('major', width, `${code}: PDF points lack page label`)
  }
  // Expand worked example
  const exBtn = region.getByRole('button', { name: /Contoh (isian lengkap|penerapan)/ })
  if (await exBtn.count()) {
    await exBtn.click()
    const dl = region.locator('dl')
    if ((await dl.count()) === 0 || (await dl.locator('dt').count()) < 3) issue('major', width, `${code}: worked example rows missing`)
    if (!/Contoh ilustratif StatPlan — bukan data atau dokumen resmi/.test(await region.innerText())) issue('major', width, `${code}: Type C example not labelled`)
  }
  // Source visuals load and have alt text
  const imgs = region.locator('img')
  for (let i = 0; i < (await imgs.count()); i++) {
    const img = imgs.nth(i)
    await img.scrollIntoViewIfNeeded()
    await page.waitForFunction((el) => el.complete, await img.elementHandle(), { timeout: 8000 }).catch(() => {})
    const ok = await img.evaluate((el) => el.complete && el.naturalWidth > 0)
    const alt = (await img.getAttribute('alt')) || ''
    if (!ok) issue('critical', width, `${code}: source image failed to load (${await img.getAttribute('src')})`)
    if (alt.length < 30) issue('major', width, `${code}: image alt text too thin`)
    const zoom = region.getByRole('button', { name: 'Perbesar' }).nth(i)
    if (await zoom.count()) {
      await zoom.click()
      if (await overflow(page)) issue('major', width, `${code}: zoomed image overflows the page`)
      await region.getByRole('button', { name: 'Perkecil' }).first().click()
    }
  }
  // Lesson points
  const lessons = region.locator('[data-section="pelajari"] li')
  if ((await lessons.count()) < 3) issue('major', width, `${code}: fewer than 3 lesson points`)
  // Evidence
  const ev = region.locator('[data-section="bukti"] li')
  if ((await ev.count()) < 2) issue('major', width, `${code}: fewer than 2 evidence items`)
  // Format kerja — open panel, verify dialog, close
  await region.getByRole('button', { name: /format kerja/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ timeout: 5000 })
  if ((await dialog.getAttribute('aria-modal')) !== 'true') issue('minor', width, `${code}: dialog missing aria-modal`)
  if (!/Isian Anda/i.test(await dialog.innerText())) issue('major', width, `${code}: format kerja panel missing Isian Anda`)
  const fields = await dialog.locator('input, textarea, select').count()
  if (fields < 2) issue('major', width, `${code}: format kerja has too few inputs (${fields})`)
  if (await overflow(page)) issue('major', width, `${code}: page overflow with format kerja open`)
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'detached', timeout: 5000 }).catch(() => issue('major', width, `${code}: Escape did not close panel`))

  if (await overflow(page)) issue('major', width, `${code}: horizontal page overflow`)

  // Mark understood and verify state
  const mark = region.getByRole('button', { name: 'Tandai sudah dipahami' })
  if (await mark.count()) {
    await mark.click()
    await region.locator('[data-understood]').waitFor({ timeout: 5000 }).catch(() => issue('critical', width, `${code}: understood state not shown`))
  }
  const stored = await page.evaluate(
    ([key, cid]) => {
      const all = JSON.parse(localStorage.getItem(key) || '{}')
      return Object.values(all).some((s) => s.understood && s.understood[cid] === true && s.schemaVersion === 2)
    },
    [STORAGE_KEY, id],
  )
  if (!stored) issue('critical', width, `${code}: understood not persisted`)
  // Collapse to keep only one subprocess expanded
  await toggle.click()
  const expanded = await page.locator('[data-guided-card-toggle][aria-expanded="true"]').count()
  if (expanded > 1) issue('major', width, `${code}: more than one subprocess expanded`)
  return true
}

async function runWidth(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: width < 800 ? 860 : 900 } })
  // Onboarding is covered by the full journey test; skip it here so it cannot intercept clicks.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('bps-statplan-onboarding-done', '1')
    } catch {
      /* ignore */
    }
  })
  const page = await context.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push({ width, text: m.text(), url: m.location()?.url || '' })
  })
  page.on('requestfailed', (r) => networkFails.push({ width, url: r.url(), err: r.failure()?.errorText }))
  page.on('response', (r) => {
    if (r.status() >= 400) networkFails.push({ width, url: r.url(), err: `HTTP ${r.status()}` })
  })

  const guidedUrl = await createProject(page)
  let checked = 0
  for (let pi = 0; pi < PHASES.length; pi++) {
    const phase = PHASES[pi]
    const heading = page.locator('#guided-phase-heading')
    await heading.waitFor({ timeout: 10000 })
    const cards = page.locator('[data-guided-card]')
    if ((await cards.count()) !== phase.n) issue('critical', width, `${phase.id}: ${await cards.count()} cards rendered, expected ${phase.n}`)
    if (pi === 0 || pi === 3) await page.screenshot({ path: join(outDir, `${width}-${phase.id}.png`), fullPage: false })
    for (let k = 1; k <= phase.n; k++) {
      if (await checkCard(page, width, `${pi + 1}.${k}`)) checked++
    }
    const progress = await page.getByText(/subproses sudah dipahami/).first().innerText()
    if (!progress.startsWith(`${phase.n} dari ${phase.n}`)) issue('critical', width, `${phase.id}: progress “${progress}”`)
    const finish = page.getByRole('button', { name: 'Selesai memahami tahap ini' })
    await finish.scrollIntoViewIfNeeded()
    if (await finish.isDisabled()) {
      issue('critical', width, `${phase.id}: finish disabled after all understood`)
      break
    }
    await finish.click()
    if (phase.next) {
      await page.getByRole('button', { name: phase.next }).click()
    } else {
      await page.getByRole('heading', { name: 'Mode Terpandu selesai' }).waitFor({ timeout: 10000 })
      await page.screenshot({ path: join(outDir, `${width}-complete.png`), fullPage: false })
    }
  }

  // Navigation back to an earlier phase keeps state
  await page.getByRole('button', { name: /^Identifikasi Kebutuhan/ }).first().click()
  const tick = await page.locator('[data-guided-card="gsbpm-1.4"]').innerText()
  if (!/Sudah dipahami/.test(tick)) issue('major', width, 'back-navigation lost understood state')

  // Reload persists everything
  await page.goto(guidedUrl, { waitUntil: 'load', timeout: 60000 })
  await page.getByRole('heading', { name: 'Mode Terpandu selesai' }).waitFor({ timeout: 10000 }).catch(() => issue('critical', width, 'completion state lost after reload'))

  perWidth[width] = { checked }
  await context.close()
  return guidedUrl
}

async function runMigration(browser) {
  const width = 1280
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  // Onboarding is covered by the full journey test; skip it here so it cannot intercept clicks.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('bps-statplan-onboarding-done', '1')
    } catch {
      /* ignore */
    }
  })
  const page = await context.newPage()
  const url = await createProject(page)
  const projectId = url.match(/projects\/([^/]+)\/guided/)[1]
  const now = new Date().toISOString()
  await page.evaluate(
    ([key, pid, ts]) => {
      const v1 = {
        [pid]: {
          projectId: pid,
          startISO: '2027-01-10',
          endISO: '2027-06-30',
          phasePlan: [],
          understood: Object.fromEntries(
            ['need-1.1', 'need-1.2', 'need-1.3', 'need-1.4', 'need-1.5', 'need-1.6', 'design-2.1', 'design-2.5', 'design-2.6', 'process-5.4'].map((k) => [k, true]),
          ),
          completedPhases: ['specify_need', 'design', 'build', 'collect'],
          unlockedPhases: ['specify_need', 'design', 'build', 'collect', 'process'],
          templateDrafts: {
            'design-2.5': { values: { kegiatan: [{ id: 'k1', kegiatan: 'Kegiatan lama', mulai: '2027-01-10', selesai: '2027-01-20', catatan: '' }] }, updatedAt: ts },
          },
          evidenceStates: {},
          updatedAt: ts,
        },
      }
      localStorage.setItem(key, JSON.stringify(v1))
    },
    [STORAGE_KEY, projectId, now],
  )
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  // The app migrates v1 sessions when it first reads storage — wait until the Guided page has rendered.
  await page.locator('#guided-phase-heading').waitFor({ timeout: 30000 })
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)
  const s = stored[projectId]
  if (s.schemaVersion !== 2 || !s.legacy) issue('critical', 'migration', 'v1 session not migrated/archived')
  if (!s.understood['gsbpm-5.5'] || s.understood['gsbpm-5.4']) issue('critical', 'migration', 'process-5.4 progress landed on wrong subprocess')
  if (!s.understood['gsbpm-2.6'] || s.understood['gsbpm-2.5']) issue('critical', 'migration', 'design jadwal/SOP not mapped to 2.6')
  if (s.understood['gsbpm-1.4']) issue('major', 'migration', 'rewritten 1.4 should start un-ticked')
  if (!s.templateDrafts['gsbpm-2.6']?.values?.kegiatan?.length) issue('critical', 'migration', 'jadwal draft lost')
  // UI reflects it: open Perancangan and check 2.6 header
  await page.getByRole('button', { name: /^Perancangan/ }).first().click()
  const hdr = await page.locator('[data-guided-card="gsbpm-2.6"]').innerText()
  if (!/Sudah dipahami/.test(hdr)) issue('critical', 'migration', '2.6 not shown as understood after migration')
  if (!/Draft disiapkan|Bahan siap/.test(hdr)) issue('critical', 'migration', '2.6 draft status not shown after migration')
  await page.screenshot({ path: join(outDir, 'migration-design.png'), fullPage: false })
  await context.close()
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const w of WIDTHS) {
    console.log(`\n=== width ${w} ===`)
    await runWidth(browser, w)
  }
  await runMigration(browser)
} catch (e) {
  const where = (e.stack.match(/browser-qa-guided\.mjs:\d+/g) || []).join(',')
  issue('critical', 'run', `Aborted: ${e.message.split('\n')[0]} @ ${where}`)
} finally {
  await browser.close()
}

const critical = issues.filter((i) => i.level === 'critical')
const major = issues.filter((i) => i.level === 'major')
// Third-party font CDN failures (Google Fonts) are reported separately: the app renders with
// fallback fonts (display=swap) and they are not app defects. Everything else counts.
const isThirdParty = (url) => /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(url || '')
const externalConsole = consoleErrors.filter((c) => isThirdParty(c.url))
const realConsole = consoleErrors.filter((c) => !/favicon/i.test(c.text) && !isThirdParty(c.url))
const realNet = networkFails.filter((n) => !/favicon|google-analytics/i.test(n.url) && !isThirdParty(n.url))
const status = critical.length || realConsole.length || realNet.length ? 'FAIL' : major.length ? 'PASS WITH NOTES' : 'PASS'
const report = `# Browser QA — Mode Terpandu (44 subproses)

- Run: ${new Date().toISOString()}
- Target: ${BASE} (system Chrome, headless)
- Widths: ${WIDTHS.join(', ')}
- Status: **${status}**

## Coverage

| Width | Subprocesses checked |
|---|---|
${WIDTHS.map((w) => `| ${w} | ${perWidth[w]?.checked ?? 0} / 44 |`).join('\n')}

Per subprocess: open, official code in title, five section headings exactly once, source labels,
PDF points expanded, worked example expanded and labelled, source images loaded (alt text, zoom without
page overflow), 3+ lesson points, 2+ evidence items, Format kerja dialog opened (aria-modal, inputs,
no overflow) and closed with Escape, marked understood, persisted to localStorage (schema v2), only one
subprocess expanded at a time. Per phase: progress N/N, finish button, next-phase handoff. Per width:
completion screen, back-navigation, reload persistence. Plus v1 → v2 migration in the browser.

## Issues

${issues.length ? issues.map((i) => `- **${i.level}** (${i.width}) ${i.msg}`).join('\n') : '- None'}

## Console errors

${realConsole.length ? realConsole.map((c) => `- (${c.width}) ${c.url ? c.url + ' — ' : ''}${c.text}`).join('\n') : '- None'}

## Third-party (font CDN) failures — not counted

${externalConsole.length ? externalConsole.map((c) => `- (${c.width}) ${c.url} — ${c.text}`).join('\n') : '- None'}

## Network failures

${realNet.length ? realNet.map((n) => `- (${n.width}) ${n.url} — ${n.err}`).join('\n') : '- None'}
`
writeFileSync(join(root, 'docs', 'browser-qa-guided-report.md'), report)
console.log(`\nStatus: ${status} — critical ${critical.length}, major ${major.length}, console ${realConsole.length}, network ${realNet.length}`)
process.exit(status === 'FAIL' ? 1 : 0)
