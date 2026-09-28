// Captures real StatPlan screens for the user guide. node docs/user-guide/source/capture-screens.mjs <outDir>
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4180'
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce' })
await ctx.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
const p = await ctx.newPage()
const go = async (path) => {
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 90000 })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(700)
}
const shot = async (name, opts = {}) => {
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(OUT, `${name}.png`), ...opts })
  console.log('shot', name)
}
const hideToasts = () => p.addStyleTag({ content: 'div[aria-live="polite"].fixed { display: none !important; }' })

// 01 Landing hero
await go('/')
await shot('01-landing')

// 02 Contoh kegiatan (case study)
await go('/contoh/skm')
await shot('02-contoh')

// 03 Intake step 1 (from the example → new project)
await p.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/i }).click()
await p.waitForURL(/\/app\/new/)
await p.waitForTimeout(600)
await shot('03-intake')

// 04 Intake result → 05 Timeline (date step)
await p.getByRole('button', { name: 'Lanjutkan' }).click()
await p.waitForTimeout(500)
await p.evaluate(() => window.scrollTo(0, 0))
await shot('04-intake-hasil')
await p.getByRole('button', { name: /Gunakan.*lanjutkan/i }).click()
await p.waitForTimeout(600)
await p.evaluate(() => window.scrollTo(0, 0))
await shot('05-timeline')

// 06 Handoff (one next action)
await p.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/i }).click()
await p.waitForTimeout(800)
await hideToasts()
await p.evaluate(() => window.scrollTo(0, 0))
await shot('06-handoff')

// 07 Guided phase overview
await p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/i }).click()
await p.waitForURL(/\/guided/)
await p.getByText(/subproses sudah dipahami/i).first().waitFor()
await hideToasts()
await p.waitForTimeout(600)
await shot('07-guided-fase')

// 08 Subprocess card expanded
const toggle = p.locator('[data-guided-card-toggle]').first()
await toggle.click()
await p.waitForTimeout(600)
const card = p.locator('article').filter({ has: p.locator('[data-section="apa"]') }).first()
await card.scrollIntoViewIfNeeded()
await p.evaluate(() => window.scrollBy(0, -90))
await shot('08-subproses')

// 09 Format kerja (dialog)
const fk = p.getByRole('button', { name: /Isi format kerja|Lanjutkan format kerja/ }).first()
await fk.click()
await p.waitForTimeout(800)
await shot('09-format-kerja')
await p.keyboard.press('Escape')
await p.waitForTimeout(300)

// 10 FAQ with an open answer
await go('/app/faq#harus-urut')
await p.evaluate(() => window.scrollTo(0, 0))
await shot('10-faq')
await go('/app/faq#harus-urut')
await p.waitForTimeout(400)
await shot('11-faq-jawaban')

// 12 Workspace default (Timeline) on the demo project, 13 Checklist/Alur kerja, 14 Ekspor + validasi
await go('/app')
await p.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first().waitFor()
await go('/app/projects/demo-skm-dpmptsp-2026')
await shot('12-workspace')
await p.getByRole('tablist', { name: 'Bagian workspace' }).scrollIntoViewIfNeeded()
await p.evaluate(() => window.scrollBy(0, -70))
await shot('13-workspace-timeline')
await go('/app/projects/demo-skm-dpmptsp-2026?tab=export')
await p.getByRole('heading', { name: 'Draf rencana kegiatan' }).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 110))
await shot('14-ekspor-demo')

// 15 Validation on a new, incomplete project (review with why/how)
const newId = await p.evaluate(() => JSON.parse(localStorage.getItem('bps-statplan-v2')).state.projects.find((x) => !x.id.startsWith('demo-')).id)
await go(`/app/projects/${newId}?tab=export`)
const firstWhy = p.getByRole('button', { name: /Mengapa penting|Mengapa & cara memperbaiki/ }).first()
if (await firstWhy.count()) await firstWhy.click().catch(() => {})
await p.getByRole('tablist', { name: 'Bagian workspace' }).scrollIntoViewIfNeeded()
await p.evaluate(() => window.scrollBy(0, -70))
await shot('15-validasi')

// 16 Workspace next-step card on the new project
await go(`/app/projects/${newId}`)
await shot('16-langkah-berikutnya')

await b.close()
