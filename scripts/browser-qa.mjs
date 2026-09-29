/**
 * Local Playwright browser QA for StatPlan.
 * Uses system Chrome (channel: 'chrome') — no Playwright Chromium download required.
 *
 * Usage (dev server must be running):
 *   node scripts/browser-qa.mjs
 *
 * Artifacts: qa/browser/*.png + docs/browser-qa-report.md (written by this script summary)
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'qa', 'browser')
mkdirSync(outDir, { recursive: true })

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:5173'
const stamp = new Date().toISOString()

const findings = []
const consoleErrors = []
const consoleWarnings = []
const networkFails = []
const journey = []
const phaseCoverage = {}

function note(level, msg, extra = {}) {
  findings.push({ level, msg, ...extra, at: new Date().toISOString() })
  const tag = level.toUpperCase()
  console.log(`[${tag}] ${msg}`)
}

async function shot(page, name) {
  const path = join(outDir, name)
  await page.screenshot({ path, fullPage: true })
  return path
}

async function hasOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowX: doc.scrollWidth > doc.clientWidth + 2,
    }
  })
}

async function finishPhaseAndContinue(page, finishLabel, nextLabel) {
  await page.getByRole('button', { name: /^Tutup$/i }).first().click({ timeout: 1000 }).catch(() => {})
  const finish = page.getByRole('button', { name: finishLabel })
  await finish.waitFor({ state: 'visible', timeout: 15000 })
  // Wait until enabled (understanding gate)
  for (let i = 0; i < 20; i++) {
    if (!(await finish.isDisabled())) break
    await page.waitForTimeout(200)
  }
  if (await finish.isDisabled()) {
    note('critical', `Finish button disabled: ${finishLabel}`)
    return false
  }
  await finish.scrollIntoViewIfNeeded()
  await finish.click()
  await page.waitForTimeout(500)
  if (nextLabel) {
    const next = page.getByRole('button', { name: nextLabel })
    if ((await next.count()) > 0) {
      await next.first().scrollIntoViewIfNeeded()
      await next.first().click()
      await page.waitForTimeout(600)
    }
  }
  return true
}

async function run() {
  note('info', `Starting browser QA against ${BASE}`)

  // Health check
  try {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (e) {
    note('critical', `App not reachable at ${BASE}: ${e.message}`)
    writeReport({ status: 'BLOCKED', reason: `App unreachable: ${e.message}` })
    process.exit(2)
  }

  let browser
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
    })
  } catch (e) {
    note('critical', `Failed to launch Chrome via Playwright: ${e.message}`)
    writeReport({
      status: 'BLOCKED',
      reason: `Playwright Chrome channel unavailable: ${e.message}`,
    })
    process.exit(2)
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'id-ID',
    acceptDownloads: true,
  })
  // Skip first-run onboarding overlay so journey clicks are not intercepted
  await context.addInitScript(() => {
    try {
      localStorage.setItem('bps-statplan-onboarding-done', '1')
    } catch {
      /* ignore */
    }
  })
  const page = await context.newPage()

  async function dismissOverlays() {
    const lewati = page.getByRole('button', { name: /^Lewati$/i })
    if ((await lewati.count()) > 0 && (await lewati.first().isVisible())) {
      await lewati.first().click()
      await page.waitForTimeout(300)
      note('info', 'Dismissed onboarding overlay (Lewati)')
    }
    // Dismiss toasts that intercept bottom CTAs
    const tutupToast = page.getByRole('button', { name: /^Tutup$/i })
    const toastCount = await tutupToast.count()
    for (let i = 0; i < toastCount; i++) {
      try {
        if (await tutupToast.nth(i).isVisible()) await tutupToast.nth(i).click({ timeout: 1000 })
      } catch {
        /* ignore */
      }
    }
    await page.keyboard.press('Escape').catch(() => {})
  }

  async function markAllUnderstood(pageObj, expectedCount) {
    await dismissOverlays()
    const headers = pageObj.locator('[data-guided-card-toggle]')
    const n = await headers.count()
    note('info', `Guided cards found: ${n} (expect ~${expectedCount})`)
    for (let i = 0; i < Math.max(n, expectedCount); i++) {
      await dismissOverlays()
      const header = headers.nth(i)
      if ((await header.count()) === 0) break
      await header.scrollIntoViewIfNeeded()
      const expanded = await header.getAttribute('aria-expanded')
      if (expanded !== 'true') {
        await header.click()
        await pageObj.waitForTimeout(350)
      }

      // Progressive disclosure: open full example on first card of each phase
      if (i === 0) {
        const fullEx = pageObj.getByRole('button', { name: /Contoh (isian lengkap|penerapan)/i })
        if ((await fullEx.count()) > 0) {
          await fullEx.first().scrollIntoViewIfNeeded()
          await fullEx.first().click()
          await pageObj.waitForTimeout(250)
          const body = await pageObj.locator('body').innerText()
          if (!/Yang bisa dipelajari|Format kerja StatPlan|Menurut Materi Proses Bisnis|Contoh ilustratif/i.test(body)) {
            note('warning', `Example hierarchy weak after expanding full example (card ${i})`)
          } else {
            journey.push(`Phase card0: full example + learning hierarchy visible`)
          }
          const ov = await hasOverflow(pageObj)
          if (ov.overflowX) note('warning', `Horizontal overflow after full example (card ${i})`, ov)
        } else {
          // Class A materi preview cards may not use progressive disclosure button
          const body = await pageObj.locator('body').innerText()
          if (/Menurut Materi Proses Bisnis|Contoh dari Materi|Format kerja StatPlan/i.test(body)) {
            journey.push(`Phase card0: materi/example block visible`)
          } else {
            note('warning', `No “Lihat contoh lengkap” and weak example labels on card ${i}`)
          }
        }
      }

      const mark = pageObj.getByRole('button', { name: /Tandai sudah dipahami/i })
      if ((await mark.count()) > 0) {
        await mark.last().scrollIntoViewIfNeeded()
        await mark.last().click()
        await pageObj.waitForTimeout(350)
      } else {
        note('warning', `No “Tandai sudah memahami” after opening card index ${i}`)
      }
    }
    // Progress text check
    const progress = pageObj.getByText(/dari \d+ subproses sudah dipahami/i)
    const progressText = (await progress.count()) > 0 ? await progress.first().innerText() : ''
    note('info', `Understanding progress: ${progressText || '(not found)'}`)
    const remaining = await pageObj.getByRole('button', { name: /Tandai sudah dipahami/i }).count()
    return remaining === 0
  }

  page.on('console', (msg) => {
    const t = msg.type()
    const text = msg.text()
    if (t === 'error') consoleErrors.push(text)
    if (t === 'warning') consoleWarnings.push(text)
  })
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))
  page.on('requestfailed', (req) => {
    networkFails.push(`${req.failure()?.errorText || 'fail'} ${req.url()}`)
  })

  try {
    // ——— LANDING ———
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
    await page.getByRole('heading', { level: 1, name: /Susun kegiatan statistik/ }).waitFor()
    if ((await page.locator('h1').count()) !== 1) note('critical', 'Landing must have exactly one h1')
    await shot(page, '01-landing-desktop.png')
    const landCta = page.getByRole('button', { name: 'Mulai perencanaan' }).first()
    const landEx = page.getByRole('button', { name: 'Pelajari contoh' }).first()
    if (!(await landCta.isVisible()) || !(await landEx.isVisible())) {
      note('critical', 'Landing primary/secondary CTA not visible')
    } else {
      journey.push('Landing CTAs visible')
    }
    const landOverflow = await hasOverflow(page)
    if (landOverflow.overflowX) note('warning', 'Landing desktop horizontal overflow', landOverflow)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    await shot(page, '02-landing-mobile.png')
    const landMobOverflow = await hasOverflow(page)
    if (landMobOverflow.overflowX) note('warning', 'Landing mobile horizontal overflow', landMobOverflow)
    await page.setViewportSize({ width: 1440, height: 1000 })

    // ——— EXAMPLE ———
    await landEx.click()
    await page.waitForTimeout(600)
    // Click first example card link/button in #contoh
    const contohSection = page.locator('#contoh')
    await contohSection.scrollIntoViewIfNeeded()
    const contohLink = contohSection.getByRole('link', { name: /^Pelajari contoh:/ }).first()
    if ((await contohLink.count()) > 0) {
      await contohLink.click()
    } else {
      note('critical', 'Landing example section has no “Pelajari contoh” entry')
      // fallback known slug
      await page.goto(`${BASE}/contoh/skm`, { waitUntil: 'networkidle' })
    }
    await page.waitForURL(/\/contoh\//, { timeout: 15000 })
    await page.getByText('Contoh ilustratif').first().waitFor({ timeout: 10000 })
    await shot(page, '03-example.png')
    // Ensure not workspace tabs
    if ((await page.getByRole('tab').count()) > 3) {
      note('critical', 'Example page unexpectedly shows many workspace-like tabs')
    } else {
      journey.push('Example walkthrough opened (illustrative, not workspace)')
    }

    // Case-study structure
    for (const section of ['hero', 'sekilas', 'mengapa', 'roadmap', 'pelajari', 'materi', 'tiru', 'mulai']) {
      if ((await page.locator(`[data-section="${section}"]`).count()) !== 1) {
        note('critical', `Example section missing: ${section}`)
      }
    }
    const lessons = page.locator('[data-phase-lesson]')
    if ((await lessons.count()) !== 8) note('critical', `Example phase lessons: ${await lessons.count()} (expect 8)`)
    else journey.push('Example: 8 phase lessons present')
    // Expand phase 2 (Perancangan) and verify disclosure + schedule
    const p2 = lessons.nth(1).locator('button[aria-expanded]').first()
    await p2.scrollIntoViewIfNeeded()
    await p2.click()
    await page.waitForTimeout(400)
    if ((await p2.getAttribute('aria-expanded')) !== 'true') note('critical', 'Example phase lesson did not expand')
    else journey.push('Example: phase lesson expands')
    if (!/Analisis hasil SKM/.test(await lessons.nth(1).innerText())) {
      note('warning', 'Example: Hal. 23 schedule not shown in Perancangan lesson')
    }
    // Source visuals: show all, scroll each into view, check loaded + alt
    await page.locator('#materi').scrollIntoViewIfNeeded()
    const moreVisuals = page.getByRole('button', { name: /Tampilkan \d+ contoh lainnya/ })
    if (await moreVisuals.count()) await moreVisuals.click()
    const imgs = page.locator('#materi img')
    const imgCount = await imgs.count()
    let loaded = 0
    for (let i = 0; i < imgCount; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
      const ok = await imgs.nth(i).evaluate((el) => el.complete && el.naturalWidth > 0 && (el.alt || '').length > 20)
      if (ok) loaded++
    }
    if (imgCount < 6 || loaded !== imgCount) note('critical', `Example PDF visuals loaded ${loaded}/${imgCount} (expect 6/6)`)
    else journey.push(`Example: ${loaded}/${imgCount} PDF visuals loaded with alt text`)
    const pageLabels = await page.locator('#materi').innerText()
    for (const hal of ['Hal. 18', 'Hal. 23', 'Hal. 26', 'Hal. 27', 'Hal. 28']) {
      if (!pageLabels.includes(hal)) note('critical', `Example source label missing: ${hal}`)
    }
    const exOverflow = await hasOverflow(page)
    if (exOverflow.overflowX) note('warning', 'Example page horizontal overflow', exOverflow)

    const tryCta = page.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/i })
    if ((await tryCta.count()) === 0) {
      note('critical', 'Example primary CTA missing — falling back to /app/new?from=skm')
      await page.goto(`${BASE}/app/new?from=skm`, { waitUntil: 'networkidle' })
    } else {
      await tryCta.first().scrollIntoViewIfNeeded()
      await tryCta.click()
      await page.waitForURL(/\/app\/new\?from=skm/, { timeout: 15000 })
    }
    journey.push('Example → New project (from=slug)')

    // ——— INTAKE ———
    await dismissOverlays()
    await shot(page, '04-intake.png')
    if (await page.getByText(/Dari contoh/i).count()) {
      journey.push('From-example banner shown')
    }
    const story = page.locator('#guided-story')
    if ((await story.inputValue()).trim().length < 12) {
      await story.fill(
        'Saya ingin mengetahui tingkat kepuasan masyarakat terhadap pelayanan perizinan di Kabupaten Lombok Tengah.',
      )
    }
    await dismissOverlays()
    await page.getByRole('button', { name: 'Lanjutkan' }).click({ timeout: 15000 })
    await page.waitForTimeout(400)
    await dismissOverlays()
    await page.getByRole('button', { name: /Gunakan.*lanjutkan/i }).click()
    await page.waitForTimeout(500)
    journey.push('Intake steps 1–2 completed')

    // ——— TIMELINE ———
    await page.getByRole('heading', { name: /Kapan kegiatan/i }).waitFor({ timeout: 10000 })
    await shot(page, '05-timeline.png')
    if (await page.getByText(/bukan durasi wajib BPS/i).count()) {
      journey.push('Timeline honesty copy present')
    } else {
      note('warning', 'Timeline missing “bukan durasi wajib BPS” copy')
    }
    await page.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/i }).click()
    await page.waitForTimeout(600)
    await dismissOverlays()
    if ((await page.getByRole('button', { name: /Buka ruang kerja lengkap/i }).count()) > 0) {
      note('critical', 'Timeline handoff still offers the competing “Buka ruang kerja lengkap” branch')
    } else journey.push('Timeline handoff: one next action (no Workspace branch)')
    await page.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/i }).click()
    await page.waitForURL(/\/guided/, { timeout: 20000 })
    await page.getByText('Mode Terpandu').first().waitFor({ timeout: 15000 })
    await page.getByText(/subproses sudah dipahami/i).first().waitFor({ timeout: 10000 })
    journey.push('Timeline → Guided Mode')
    note('info', `Guided URL: ${page.url()}`)

    // ——— GUIDED PHASES ———
    if (await page.getByText(/tidak perlu/i).count()) {
      journey.push('Guided beginner reassurance visible')
    }

    const phases = [
      {
        key: 'specify_need',
        cards: 6,
        shot: '06-guided-phase-1.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Perancangan/i,
      },
      {
        key: 'design',
        cards: 6,
        shot: '07-guided-phase-2.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Pembangunan$/i,
      },
      {
        key: 'build',
        cards: 7,
        shot: '08-guided-phase-3.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Pengumpulan Data$/i,
      },
      {
        key: 'collect',
        cards: 4,
        shot: '09-guided-phase-4.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Pengolahan Data$/i,
      },
      {
        key: 'process',
        cards: 8,
        shot: '10-guided-phase-5.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Analisis Data$/i,
      },
      {
        key: 'analyse',
        cards: 5,
        shot: '11-guided-phase-6.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Penyajian & Penyebarluasan$/i,
      },
      {
        key: 'disseminate',
        cards: 5,
        shot: '12-guided-phase-7.png',
        finish: /Selesai memahami tahap ini/i,
        next: /Lanjut ke Evaluasi$/i,
      },
      {
        key: 'evaluate',
        cards: 3,
        shot: '13-guided-phase-8.png',
        finish: /Selesai memahami tahap ini/i,
        next: null,
      },
    ]

    for (const phase of phases) {
      await dismissOverlays()
      await shot(page, phase.shot)
      const ok = await markAllUnderstood(page, phase.cards)
      phaseCoverage[phase.key] = ok ? 'understood' : 'partial'
      if (!ok) note('warning', `Could not mark all cards understood in ${phase.key}`)

      const finished = await finishPhaseAndContinue(page, phase.finish, phase.next)
      if (!finished) {
        phaseCoverage[phase.key] = 'blocked'
        note('critical', `Could not finish phase ${phase.key}`)
        break
      }
      journey.push(`Guided phase ${phase.key} completed (learning)`)
    }

    // Build 3.4 source hierarchy spot-check: reopen Build if we can navigate back
    // Completion screen
    await page.waitForTimeout(500)
    const completeHeading = page.getByRole('heading', { name: /Mode Terpandu selesai/i })
    if ((await completeHeading.count()) > 0) {
      await shot(page, '14-guided-complete.png')
      journey.push('Guided completion screen visible')
      const bodyText = await page.locator('body').innerText()
      const hasHonesty =
        /bukan[^\n]{0,120}disetujui BPS/i.test(bodyText) ||
        /bukan[^\n]{0,160}kegiatan statistik selesai/i.test(bodyText) ||
        /bukan[^\n]{0,100}template resmi BPS/i.test(bodyText)
      if (/Siap dilaksanakan/i.test(bodyText)) {
        note('critical', 'Forbidden claim on completion: Siap dilaksanakan')
      }
      if (/Sudah memenuhi standar BPS/i.test(bodyText)) {
        note('critical', 'Forbidden claim on completion: Sudah memenuhi standar BPS')
      }
      if (!hasHonesty) {
        if (/disetujui BPS/i.test(bodyText)) {
          note('critical', 'Forbidden claim on completion: Disetujui BPS without honesty framing')
        }
        if (/kegiatan statistik selesai/i.test(bodyText)) {
          note('critical', 'Forbidden claim on completion: Kegiatan statistik selesai without honesty framing')
        }
      } else {
        journey.push('Completion honesty copy present (not official approval)')
      }
      const primary = page.getByRole('button', { name: /Periksa di Workspace/i })
      if ((await primary.count()) === 0) note('warning', 'Missing primary completion CTA')
    } else {
      note('critical', 'Guided completion heading not found')
      await shot(page, '14-guided-complete.png')
    }

    // ——— WORKSPACE ———
    const wsBtn = page.getByRole('button', { name: /Periksa di Workspace/i })
    if ((await wsBtn.count()) > 0) {
      await wsBtn.click()
    } else {
      // fallback
      await page.getByRole('button', { name: /Buka ruang kerja/i }).first().click()
    }
    await page.waitForURL(/\/app\/projects\//, { timeout: 20000 })
    await page.waitForTimeout(800)
    await shot(page, '15-workspace.png')
    journey.push('Workspace opened')

    // ——— WORKSPACE INFORMATION ARCHITECTURE ———
    {
      const wsBase = page.url().split('?')[0]
      const wsTabs = () => page.getByRole('tablist', { name: 'Bagian workspace' })
      const expected = ['Timeline', 'Alur kerja', 'Checklist', 'Perancangan', 'Variabel', 'Instrumen', 'Metadata', 'Riwayat', 'Ekspor']
      const selectedTab = async () => (await wsTabs().getByRole('tab', { selected: true }).innerText()).trim()
      const labels = (await wsTabs().getByRole('tab').allInnerTexts()).map((t) => t.trim())
      if (labels.join('|') !== expected.join('|')) note('critical', `Workspace tab order wrong: ${labels.join(' · ')}`)
      else journey.push('Workspace tab order: Timeline → Alur kerja → Checklist → … → Ekspor')
      if (!/[?&]tab=checklist/.test(page.url()) || (await selectedTab()) !== 'Checklist') {
        note('critical', `Guided → Workspace deep link did not open Checklist (${page.url()} / ${await selectedTab()})`)
      } else journey.push('Deep link ?tab=checklist opens Checklist')
      await page.goto(wsBase, { waitUntil: 'load' })
      await wsTabs().getByRole('tab', { selected: true }).waitFor()
      if ((await selectedTab()) !== 'Timeline') note('critical', `Bare Workspace URL opened ${await selectedTab()}, expected Timeline`)
      else journey.push('Bare Workspace URL opens Timeline first')
      if (!/Timeline perencanaan/.test(await page.locator('#workspace-tab-content').innerText())) {
        note('critical', 'Default Workspace view does not show the timeline')
      }
      for (const [q, name] of [['workflow', 'Alur kerja'], ['variables', 'Variabel'], ['instruments', 'Instrumen'], ['metadata', 'Metadata'], ['export', 'Ekspor']]) {
        await page.goto(`${wsBase}?tab=${q}`, { waitUntil: 'load' })
        await wsTabs().getByRole('tab', { selected: true }).waitFor()
        if ((await selectedTab()) !== name) note('critical', `Deep link ?tab=${q} opened ${await selectedTab()}`)
      }
      journey.push('Deep links ?tab=workflow/variables/instruments/metadata/export open their tab')
      // Keyboard: roving focus follows the new order
      await page.goto(wsBase, { waitUntil: 'load' })
      await wsTabs().getByRole('tab', { name: 'Timeline' }).focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(200)
      const focusedTab = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'tab' && document.activeElement.textContent.trim())
      if (focusedTab !== 'Alur kerja' || (await selectedTab()) !== 'Alur kerja') note('critical', `ArrowRight from Timeline went to ${focusedTab}`)
      else journey.push('Keyboard: ArrowRight from Timeline selects Alur kerja')
      // “Buka Alur kerja” (next-step card) still lands on Alur kerja
      await page.goto(wsBase, { waitUntil: 'load' })
      const bukaAlur = page.getByRole('button', { name: /^Buka Alur kerja/ }).first()
      if (await bukaAlur.count()) {
        await bukaAlur.click()
        await page.waitForTimeout(300)
        if ((await selectedTab()) !== 'Alur kerja') note('critical', '“Buka Alur kerja” did not open Alur kerja')
        else journey.push('“Buka Alur kerja” opens Alur kerja')
      }
      // Workspace ↔ Guided round trip keeps state
      await page.goto(wsBase, { waitUntil: 'load' })
      await page.getByRole('link', { name: /Kembali ke Mode Terpandu/i }).first().click()
      await page.waitForURL(/\/guided/, { timeout: 15000 })
      await page.getByText(/subproses sudah dipahami/i).first().waitFor({ timeout: 10000 })
      journey.push('Workspace → Mode Terpandu works')
      await page.goto(`${wsBase}?tab=checklist`, { waitUntil: 'load' })
      await wsTabs().getByRole('tab', { selected: true }).waitFor()
    }

    // Validation / checklist tab likely already open
    await dismissOverlays()
    await shot(page, '16-validation.png')
    // Try several export entry points used in Workspace
    const exportCandidates = [
      page.getByRole('button', { name: /^Ekspor$/i }),
      page.getByRole('tab', { name: /Ekspor/i }),
      page.getByRole('link', { name: /Ekspor/i }),
      page.getByText(/^Ekspor$/),
    ]
    let openedExport = false
    for (const cand of exportCandidates) {
      if ((await cand.count()) > 0) {
        await cand.first().click()
        await page.waitForTimeout(400)
        openedExport = true
        break
      }
    }
    if (!openedExport) {
      const url = page.url().split('?')[0]
      await page.goto(`${url}?tab=export`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)
    }
    await shot(page, '17-export.png')
    const unduh = page.getByRole('button', { name: 'Unduh draf perencanaan' })
    if ((await unduh.count()) === 1) {
      journey.push('Export UI visible')
      if (await unduh.isDisabled()) {
        journey.push('Export gate: new incomplete project is blocked (expected)')
        const reviewText = await page.locator('#tinjauan-ekspor').locator('..').innerText()
        if (!/Mengapa penting/.test(reviewText) || !/Cara memperbaiki/.test(reviewText)) {
          note('critical', 'Validation review lacks why/how guidance')
        } else journey.push('Validation review explains why + how to fix')

        // Fix link must land on the exact fix location: Alur kerja → Specify Need 1.5 → portal check
        const exportUrl = page.url()
        const portalFix = page.getByRole('button', { name: /Buka pemeriksaan portal/ }).first()
        if ((await portalFix.count()) === 0) {
          note('critical', 'Export review has no “Buka pemeriksaan portal” link')
        } else {
          await portalFix.click()
          await page.waitForTimeout(700)
          const sub15 = page.getByRole('tablist', { name: 'Subproses Specify Need' }).getByRole('tab', { name: /^1\.5/ })
          const sirusa = page.getByText('Sudah mengecek sirusa.web.bps.go.id').first()
          const selected = (await sub15.getAttribute('aria-selected')) === 'true'
          const inView = (await sirusa.count())
            ? await sirusa.evaluate((el) => {
                const r = el.getBoundingClientRect()
                return r.top >= 0 && r.bottom <= window.innerHeight
              })
            : false
          if (!/tab=workflow/.test(page.url()) || !selected || !inView) {
            note('critical', 'Portal fix link did not open Specify Need 1.5 with the portal check in view', { url: page.url(), selected, inView })
          } else journey.push('Portal fix link opens Alur kerja → 1.5 with the portal check in view (no extra click)')
          await page.reload({ waitUntil: 'load' })
          await page.waitForTimeout(900)
          if ((await sub15.getAttribute('aria-selected')) !== 'true' || !(await page.getByText('Sudah mengecek sirusa.web.bps.go.id').count())) {
            note('critical', 'Refresh lost the portal fix location')
          } else journey.push('Refresh keeps Alur kerja → 1.5 (portal check)')
          await page.goBack({ waitUntil: 'load' })
          await page.waitForTimeout(700)
          journey.push(`Browser Back after portal fix link → ${new URL(page.url()).pathname}`)
          await page.goto(exportUrl, { waitUntil: 'load' })
          await page.waitForTimeout(600)
        }
      } else {
        note('critical', 'Export gate: brand-new project should not be exportable')
      }
    } else {
      note('critical', 'Export button not found')
    }
    const exportBody = await page.locator('body').innerText()
    if (!/bukan dokumen resmi BPS/i.test(exportBody)) note('critical', 'Export lacks draft / not-official statement')

    // ——— RESPONSIVE PASS ———
    const viewports = [
      { w: 390, h: 844, file: '18-mobile-390.png' },
      { w: 430, h: 932, file: '19-mobile-430.png' },
      { w: 768, h: 1024, file: '20-tablet-768.png' },
      { w: 1280, h: 900, file: '21-desktop-1280.png' },
      { w: 1440, h: 1000, file: '22-desktop-1440.png' },
    ]
    await page.goto(BASE, { waitUntil: 'networkidle' })
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.w, height: vp.h })
      await page.waitForTimeout(250)
      await shot(page, vp.file)
      const ov = await hasOverflow(page)
      if (ov.overflowX) note('warning', `Horizontal overflow at ${vp.w}x${vp.h}`, ov)
    }
    journey.push('Responsive screenshots captured')

    // ——— PRESENTATION MODE ———
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${BASE}/app/presentation`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const presHeading = page.getByRole('heading', { name: 'Presentasi StatPlan' })
    if ((await presHeading.count()) === 0) {
      note('critical', 'Presentation Mode heading not found')
    } else {
      await shot(page, '23-presentation.png')
      journey.push('Presentation Mode opened (no project required)')
      const next = page.getByRole('button', { name: 'Berikutnya' })
      let seen = 1
      while (!(await next.isDisabled())) {
        await next.click()
        seen++
        if (seen > 12) break
      }
      if (seen !== 8) note('critical', `Presentation slides: ${seen} (expect 8)`)
      else journey.push('Presentation: 8 slides navigable')
      if (!/44 subproses resmi/.test(await page.locator('body').innerText())) {
        // last slide is limitations; go back to slide 6
        for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Sebelumnya' }).click()
      }
      if (!/44 subproses resmi/.test(await page.locator('body').innerText())) note('critical', 'Presentation GSBPM slide lacks 44 subprocesses')
      await page.getByRole('tab', { name: 'FAQ' }).click()
      const faqText = await page.locator('body').innerText()
      if (!/Apakah ini sistem resmi BPS\?/.test(faqText)) note('warning', 'Presentation FAQ missing')
      else journey.push('Presentation FAQ tab works')
      if (/Disetujui BPS|Validasi resmi BPS/i.test(faqText) && !/bukan|tidak/i.test(faqText)) {
        note('critical', 'Presentation Mode overclaims official BPS status')
      }
    }

    // ——— DEMO SEED PERSISTENCE (first visit → reload → demo deep link still resolves) ———
    {
      const fresh = await browser.newContext({ viewport: { width: 1280, height: 900 } })
      await fresh.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
      const fp = await fresh.newPage()
      await fp.goto(`${BASE}/app`, { waitUntil: 'load' })
      await fp.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first().waitFor({ timeout: 15000 })
      await fp.goto(`${BASE}/app/projects/demo-skm-dpmptsp-2026`, { waitUntil: 'load' })
      await fp.waitForTimeout(800)
      if (/Proyek tidak ditemukan/.test(await fp.locator('body').innerText())) {
        note('critical', 'Auto-seeded demo projects are not persisted: demo deep link fails after reload')
      } else journey.push('Auto-seeded demo projects persist across reload')
      await fresh.close()
    }

    // ——— DEMO SAFETY ———
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
    const muat = page.getByRole('button', { name: 'Muat demo' })
    if (await muat.count()) {
      await muat.click()
      await page.waitForTimeout(500)
    }
    const readProjects = () =>
      page.evaluate(() => {
        for (let i = 0; i < localStorage.length; i++) {
          const v = localStorage.getItem(localStorage.key(i)) || ''
          if (v.includes('"projects"')) {
            try {
              const parsed = JSON.parse(v)
              return (parsed.state?.projects ?? parsed.projects ?? []).map((p) => ({ id: p.id, json: JSON.stringify(p) }))
            } catch {
              /* ignore */
            }
          }
        }
        return []
      })
    const before = await readProjects()
    const demoBefore = before.find((p) => p.id === 'demo-skm-dpmptsp-2026')
    if (!demoBefore) note('critical', 'Demo safety: demo SKM project not loaded')
    await page.goto(`${BASE}/contoh/skm`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/i }).click()
    await page.waitForURL(/\/app\/new/)
    await page.getByRole('button', { name: 'Lanjutkan' }).click()
    await page.getByRole('button', { name: /Gunakan.*lanjutkan/i }).click()
    await page.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/i }).click()
    await page.waitForTimeout(400)
    const after = await readProjects()
    const demoAfter = after.find((p) => p.id === 'demo-skm-dpmptsp-2026')
    if (demoBefore && demoAfter && demoBefore.json === demoAfter.json) {
      journey.push('Demo safety: demo SKM project byte-identical after starting from example')
    } else if (demoBefore) {
      note('critical', 'Demo safety: demo SKM project changed after starting from example')
    }
    if (after.length === before.length + 1) journey.push('Example → new project created as a separate copy')
    else note('critical', `Example → new project: project count ${before.length} → ${after.length}`)

    // Export gate on an export-ready demo project (download must work when allowed)
    await page.goto(`${BASE}/app/projects/demo-skm-dpmptsp-2026?tab=export`, { waitUntil: 'networkidle' })
    const demoUnduh = page.getByRole('button', { name: 'Unduh draf perencanaan' })
    if ((await demoUnduh.count()) === 1 && !(await demoUnduh.isDisabled())) {
      try {
        const [download] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), demoUnduh.click()])
        journey.push(`Export download produced: ${download.suggestedFilename()}`)
      } catch {
        note('critical', 'Export enabled but no download produced')
      }
    } else {
      note('info', 'Demo SKM not export-ready in this build — download path not exercised')
    }

    // ——— REFRESH / BACK / FORWARD ———
    const refreshTargets = [
      { path: '/', label: 'Landing', expect: /StatPlan/i },
      { path: '/contoh/skm', label: 'Example', expect: /kepuasan|contoh|ilustratif/i },
      { path: '/app/new', label: 'Intake', expect: /kegiatan|rencana|StatPlan|ceritakan|kebutuhan/i },
      { path: '/app/presentation', label: 'Presentation', expect: /Presentasi|Materi|demo|slide|StatPlan/i },
    ]
    for (const t of refreshTargets) {
      await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
      await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(500)
      // Dismiss onboarding if it reappears
      const lewati = page.getByRole('button', { name: /Lewati/i })
      if ((await lewati.count()) > 0) await lewati.first().click().catch(() => {})
      const body = await page.locator('body').innerText()
      if (body.trim().length < 40 || !t.expect.test(body)) {
        note('warning', `Weak content after refresh: ${t.label}`, {
          len: body.trim().length,
          snippet: body.slice(0, 120).replace(/\s+/g, ' '),
        })
      } else {
        journey.push(`Refresh OK: ${t.label}`)
      }
    }
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Pelajari contoh' }).first().click().catch(() => {})
    await page.waitForTimeout(400)
    await page.goBack()
    await page.waitForTimeout(300)
    await page.goForward()
    await page.waitForTimeout(300)
    journey.push('Browser Back/Forward smoke OK')

    // Light a11y checks on landing
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(BASE, { waitUntil: 'networkidle' })
    const unnamed = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')]
      return buttons
        .filter((b) => {
          const name =
            b.getAttribute('aria-label') ||
            b.textContent?.trim() ||
            b.getAttribute('title') ||
            ''
          return !name
        })
        .slice(0, 10)
        .map((b) => b.outerHTML.slice(0, 120))
    })
    if (unnamed.length) {
      note('warning', `Found ${unnamed.length} buttons without accessible name`, {
        samples: unnamed,
      })
    } else {
      journey.push('No unnamed buttons on landing (sample)')
    }

    // Tab focus sanity
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    if (focused) journey.push(`Keyboard focus works (active=${focused})`)

    // ——— KEYBOARD + REDUCED MOTION ———
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${BASE}/contoh/skm`, { waitUntil: 'networkidle' })
    const lessonBtn = page.locator('[data-phase-lesson="build"] button[aria-expanded]').first()
    await lessonBtn.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(150)
    const afterEnter = await lessonBtn.getAttribute('aria-expanded')
    await page.keyboard.press('Space')
    await page.waitForTimeout(150)
    const afterSpace = await lessonBtn.getAttribute('aria-expanded')
    if (afterEnter === 'true' && afterSpace === 'false') {
      journey.push('Keyboard: example phase lesson toggles with Enter/Space (reduced motion)')
    } else {
      note('critical', `Keyboard: phase lesson toggle failed (enter=${afterEnter}, space=${afterSpace})`)
    }
    const focusRing = await lessonBtn.evaluate((el) => getComputedStyle(el).boxShadow)
    if (!focusRing || focusRing === 'none') note('warning', 'Keyboard: no visible focus ring on phase lesson toggle')
    else journey.push('Keyboard: visible focus ring present')

    await page.goto(`${BASE}/app/presentation`, { waitUntil: 'networkidle' })
    const stage = page.locator('[aria-roledescription="slide"]')
    await stage.focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const label2 = await stage.getAttribute('aria-label')
    await page.keyboard.press('ArrowLeft')
    const label1 = await stage.getAttribute('aria-label')
    if (/^Slide 3 /.test(label2 || '') && /^Slide 2 /.test(label1 || '')) {
      journey.push('Keyboard: presentation slides move with arrow keys')
    } else note('critical', `Keyboard: presentation arrows failed (${label2} / ${label1})`)
    await page.getByRole('tab', { name: 'Slide' }).focus()
    await page.keyboard.press('ArrowRight')
    const activeTab = await page.evaluate(() => document.activeElement?.textContent)
    if (activeTab === 'Naskah demo') journey.push('Keyboard: presentation tabs move with arrow keys')
    else note('warning', `Keyboard: tab arrow navigation landed on ${activeTab}`)

    // Heading hierarchy: exactly one h1 per primary page
    for (const path of ['/', '/contoh/skm', '/app', '/app/new', '/app/presentation']) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
      const h1 = await page.locator('h1').count()
      if (h1 !== 1) note('warning', `Heading hierarchy: ${path} has ${h1} h1 elements`)
    }
    journey.push('Heading hierarchy checked on primary pages')
    await page.emulateMedia({ reducedMotion: 'no-preference' })

  } catch (e) {
    note('critical', `Journey aborted: ${e.message}`)
    try {
      await shot(page, 'zz-failure.png')
    } catch {
      /* ignore */
    }
  } finally {
    await browser.close()
  }

  const critical = findings.filter((f) => f.level === 'critical')
  const status =
    critical.length > 0
      ? 'FAIL'
      : findings.some((f) => f.level === 'warning')
        ? 'PASS WITH NOTES'
        : 'PASS'

  // If journey never reached guided, treat as blocked-ish
  const reachedGuided = journey.some((j) => /Guided/i.test(j))
  const finalStatus = !reachedGuided && critical.length ? 'BLOCKED' : status

  writeReport({
    status: finalStatus,
    reason: critical[0]?.msg,
  })

  console.log('\n=== BROWSER QA DONE ===')
  console.log('Status:', finalStatus)
  console.log('Screenshots:', outDir)
  console.log('Journey steps:', journey.length)
  console.log('Console errors:', consoleErrors.length)
  console.log('Network fails:', networkFails.length)
  process.exit(critical.length ? 1 : 0)
}

function writeReport({ status, reason }) {
  const shots = existsSync(outDir)
    ? [
        '01-landing-desktop.png',
        '02-landing-mobile.png',
        '03-example.png',
        '04-intake.png',
        '05-timeline.png',
        '06-guided-phase-1.png',
        '07-guided-phase-2.png',
        '08-guided-phase-3.png',
        '09-guided-phase-4.png',
        '10-guided-phase-5.png',
        '11-guided-phase-6.png',
        '12-guided-phase-7.png',
        '13-guided-phase-8.png',
        '14-guided-complete.png',
        '15-workspace.png',
        '16-validation.png',
        '17-export.png',
        '18-mobile-390.png',
        '19-mobile-430.png',
        '20-tablet-768.png',
        '21-desktop-1280.png',
        '22-desktop-1440.png',
      ]
        .filter((f) => existsSync(join(outDir, f)))
        .map((f) => `- \`qa/browser/${f}\``)
        .join('\n')
    : '_none_'

  const md = `# StatPlan Browser QA

## Environment
- browser: Google Chrome (Playwright \`channel: 'chrome'\`)
- Playwright: 1.55.0 (npm package; bundled Chromium download blocked by TLS — system Chrome used)
- app URL: ${BASE}
- date/time: ${stamp}
- viewport: primary 1440×1000; also 390, 430, 768, 1280, 1440

## Final Browser Status
**${status}**
${reason ? `\nReason/note: ${reason}\n` : ''}

## Journey
${journey.map((j) => `- ${j}`).join('\n') || '- (no steps recorded)'}

## Phase Coverage
${Object.entries(phaseCoverage)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n') || '- (not reached)'}

## Responsive
- 390×844 — screenshot \`18-mobile-390.png\`
- 430×932 — screenshot \`19-mobile-430.png\`
- 768×1024 — screenshot \`20-tablet-768.png\`
- 1280×900 — screenshot \`21-desktop-1280.png\`
- 1440×1000 — screenshot \`22-desktop-1440.png\`

## Accessibility
- Keyboard Tab exercised on landing
- Unnamed-button scan on landing (see findings)
- Modal Escape / full WCAG audit: not exhaustively automated in this pass

## Console
### Errors (${consoleErrors.length})
${consoleErrors.slice(0, 40).map((e) => `- ${e}`).join('\n') || '- none'}

### Warnings (${consoleWarnings.length})
${consoleWarnings.slice(0, 20).map((e) => `- ${e}`).join('\n') || '- none'}

## Network
Failed requests (${networkFails.length}):
${networkFails.slice(0, 40).map((e) => `- ${e}`).join('\n') || '- none'}

## Findings
${findings.map((f) => `- **${f.level}**: ${f.msg}`).join('\n') || '- none'}

## Bugs Found
${findings.filter((f) => f.level === 'critical').map((f) => `- ${f.msg}`).join('\n') || '- none recorded as CRITICAL from this run'}

## Fixes
- None applied during this browser run (observation-first). Follow-up fixes only if CRITICAL UX blockers confirmed from screenshots.

## Remaining Issues
${findings
  .filter((f) => f.level === 'warning' || f.level === 'critical')
  .map((f) => `- ${f.msg}`)
  .join('\n') || '- none significant from automated browser pass'}

## Screenshot Evidence
${shots}

## Notes
- Screenshots are **local QA artifacts** under \`qa/browser/\` (not required to commit).
- Playwright Chromium browser binary could not be downloaded (TLS leaf certificate). Runtime used **system Google Chrome** instead — this still constitutes real browser QA.
- Export may remain disabled for a freshly created beginner project until Workspace validation thresholds are met; that is expected product behavior, not an approval claim.
`

  writeFileSync(join(root, 'docs', 'browser-qa-report.md'), md, 'utf8')
  writeFileSync(
    join(outDir, 'summary.json'),
    JSON.stringify(
      { status, stamp, BASE, journey, phaseCoverage, findings, consoleErrors, networkFails },
      null,
      2,
    ),
    'utf8',
  )
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
