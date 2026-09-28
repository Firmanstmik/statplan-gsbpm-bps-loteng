/**
 * Visual QA — captures every primary screen at mobile and desktop widths for side-by-side review.
 * Uses system Chrome. App must be running (e.g. `npx vite preview --port 4173`).
 *
 *   STATPLAN_URL=http://127.0.0.1:4173 node scripts/visual-qa.mjs [widths=390,1440]
 *
 * Output: qa/visual/<width>-<nn>-<screen>.png (viewport-height "above the fold" + full page).
 * Also reports horizontal overflow per screen.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'qa', 'visual')
mkdirSync(outDir, { recursive: true })
const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4173'
const WIDTHS = (process.argv[2] || '390,1440').split(',').map(Number)
const HEIGHT = { 375: 812, 390: 844, 430: 932, 768: 1024, 1280: 900, 1440: 1000, 1600: 1000 }

async function skipOnboarding(page) {
  const skip = page.getByRole('button', { name: 'Lewati' })
  if (await skip.count()) await skip.first().click().catch(() => {})
}

async function capture(page, width, n, name) {
  await page.waitForTimeout(450)
  const base = join(outDir, `${width}-${String(n).padStart(2, '0')}-${name}`)
  await page.screenshot({ path: `${base}.png` })
  await page.screenshot({ path: `${base}-full.png`, fullPage: true })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )
  console.log(`${width} ${name}${overflow ? '  ⚠ horizontal overflow' : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] ?? 900 } })
  const page = await ctx.newPage()
  let n = 0
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'landing')
  await page.goto(`${BASE}/contoh/skm`, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'example')
  await page.goto(`${BASE}/app/new?from=skm`, { waitUntil: 'networkidle' })
  await skipOnboarding(page)
  await capture(page, width, ++n, 'intake')
  await page.getByRole('button', { name: 'Lanjutkan' }).click()
  await page.waitForTimeout(300)
  await capture(page, width, ++n, 'intake-result')
  await page.getByRole('button', { name: /Gunakan.*lanjutkan/i }).click()
  await capture(page, width, ++n, 'timeline')
  await page.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/i }).click()
  await page.waitForTimeout(300)
  await capture(page, width, ++n, 'handoff')
  await page.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/i }).click()
  await page.waitForURL(/\/guided/)
  const guidedUrl = page.url()
  const projectUrl = guidedUrl.replace(/\/guided.*$/, '')
  await capture(page, width, ++n, 'guided')
  const card = page.locator('[data-guided-card]').first()
  await card.locator('[data-guided-card-toggle]').click()
  await capture(page, width, ++n, 'guided-card')
  await page.goto(projectUrl, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'workspace')
  await page.goto(`${projectUrl}?tab=checklist`, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'workspace-checklist')
  await page.goto(`${projectUrl}?tab=export`, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'export')
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'dashboard')
  await page.goto(`${BASE}/app/presentation`, { waitUntil: 'networkidle' })
  await capture(page, width, ++n, 'presentation')
  await ctx.close()
}
await browser.close()
