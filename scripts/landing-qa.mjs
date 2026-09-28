/**
 * Landing page QA — scrolls the homepage one viewport at a time (so scroll-reveal content renders),
 * captures each screen, and checks first-impression basics per width.
 *
 *   STATPLAN_URL=http://127.0.0.1:4173 node scripts/landing-qa.mjs [widths=375,390,430,768,1000,1280,1440]
 *
 * Output: qa/landing/<width>-<nn>.png and a summary on stdout. Exit 1 on any failed check.
 */
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'qa', 'landing')
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4173'
const WIDTHS = (process.argv[2] || '375,390,430,768,1000,1280,1440').split(',').map(Number)
const HEIGHT = { 375: 812, 390: 844, 430: 932, 768: 1024, 1000: 800, 1280: 800, 1440: 900 }

const failures = []
const fail = (w, msg) => {
  failures.push(`(${w}) ${msg}`)
  console.log(`  ✗ (${w}) ${msg}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const width of WIDTHS) {
  const height = HEIGHT[width] ?? 900
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE, { waitUntil: 'load' })
  await page.locator('h1').first().waitFor()
  await page.waitForTimeout(700)

  // First viewport: what a visitor sees without scrolling
  const first = await page.evaluate((vh) => {
    const inView = (el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= vh
    }
    const h1 = document.querySelector('h1')
    const ctas = [...document.querySelectorAll('main a, main button, header a, header button')]
      .filter(inView)
      .map((el) => (el.getAttribute('aria-label') || el.textContent || '').trim())
      .filter(Boolean)
    return {
      h1Count: document.querySelectorAll('h1').length,
      h1Text: h1?.textContent?.trim() ?? '',
      h1InView: h1 ? inView(h1) : false,
      h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
      primaryInView: ctas.some((t) => /^Mulai perencanaan/.test(t)),
      secondaryInView: ctas.some((t) => /^Pelajari contoh/.test(t)),
      ctas,
    }
  }, height)
  if (first.h1Count !== 1) fail(width, `expected 1 h1, found ${first.h1Count}`)
  if (!first.h1InView) fail(width, 'h1 not fully visible in first viewport')
  if (!first.primaryInView) fail(width, '“Mulai perencanaan” not visible in first viewport')
  if (!first.secondaryInView) fail(width, '“Pelajari contoh” not visible in first viewport')

  // Scroll through, capturing each screen
  let y = 0
  let n = 0
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  while (y < total && n < 20) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(450)
    await page.screenshot({ path: join(outDir, `${width}-${String(++n).padStart(2, '0')}.png`) })
    y += height - 80
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (overflow) fail(width, 'horizontal overflow')
  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('a, button')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)
      })
      .map((el) => (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)),
  )
  if (smallTargets.length) fail(width, `tap targets < 24px: ${smallTargets.join(' | ')}`)
  if (errors.length) fail(width, `console errors: ${errors.join(' | ')}`)
  console.log(
    `${width}: h1 ${first.h1Size}px “${first.h1Text.slice(0, 60)}” · first-view CTAs [${first.ctas.join(' · ')}] · ${n} screens · page ${total}px`,
  )
  await page.close()
}
await browser.close()
console.log(failures.length ? `\nLanding QA: FAIL (${failures.length})` : '\nLanding QA: PASS')
process.exit(failures.length ? 1 : 0)
