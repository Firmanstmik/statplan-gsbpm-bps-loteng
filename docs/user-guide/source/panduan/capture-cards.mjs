// Captures every Mode Terpandu phase page (8) and every subprocess card (44 × 2 views) from the real app,
// with callout boxes relative to each clip. node docs/user-guide/source/panduan/capture-cards.mjs <outDir>
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4180'
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const VW = 1280, VH = 800, DPR = 1.5
const b = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, reducedMotion: 'reduce' })
await ctx.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
const p = await ctx.newPage()
const meta = {}
const settle = async (ms = 400) => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(ms) }
await p.addStyleTag({ content: '' }).catch(() => {})
const hideToasts = () => p.addStyleTag({ content: 'div[aria-live="polite"].fixed { display: none !important; }' })

/** Screenshot a clip and record callout boxes (CSS px, relative to the clip). */
async function clipShot(name, clip, marks) {
  await hideToasts()
  const out = []
  for (const [n, loc] of marks) {
    const bb = await loc.first().boundingBox().catch(() => null)
    if (!bb) continue
    const x = bb.x - clip.x - 4, y = bb.y - clip.y - 4, w = bb.width + 8, h = bb.height + 8
    if (y < 0 || y + h > clip.height || x < 0 || x + w > clip.width + 2) continue
    out.push({ n, x, y, w: Math.min(w, clip.width - x), h })
  }
  await p.screenshot({ path: join(OUT, `${name}.png`), clip })
  meta[name] = { vw: clip.width, vh: clip.height, dpr: DPR, marks: out }
}

// New plan through the real intake
await p.goto(BASE + '/app/new', { waitUntil: 'load', timeout: 90000 })
await settle(800)
await p.getByRole('button', { name: 'Kepuasan pelayanan' }).click()
await p.getByRole('button', { name: 'Lanjutkan' }).click(); await settle(500)
await p.getByRole('button', { name: /Gunakan contoh & lanjutkan/ }).click(); await settle(500)
await p.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/ }).click(); await settle(700)
await p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/ }).click()
await p.waitForURL(/\/guided/)
await p.getByText(/subproses sudah dipahami/i).first().waitFor()
await settle(900)

const NEXT = ['Lanjut ke Perancangan', 'Lanjut ke Pembangunan', 'Lanjut ke Pengumpulan Data', 'Lanjut ke Pengolahan Data', 'Lanjut ke Analisis Data', 'Lanjut ke Penyajian & Penyebarluasan', 'Lanjut ke Evaluasi']
for (let phase = 0; phase < 8; phase++) {
  await p.evaluate(() => window.scrollTo(0, 0)); await settle(400)
  await clipShot(`phase-${phase + 1}`, { x: 0, y: 64, width: VW, height: VH - 64 }, [
    [1, p.getByRole('navigation', { name: 'Urutan belajar Mode Terpandu' })],
    [2, p.locator('#guided-phase-heading').first()],
    [3, p.getByText('Subproses resmi', { exact: false }).first()],
  ])
  const cards = p.locator('article:has([data-guided-card-toggle])')
  const n = await cards.count()
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i)
    const toggle = card.locator('[data-guided-card-toggle]')
    if ((await card.locator('[data-section="apa"]').count()) === 0) { await toggle.click(); await settle(450) }
    const code = ((await toggle.innerText()).match(/\d\.\d/) || ['x'])[0]
    // view A: header, Apa?, Contoh
    await card.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 76)); await settle(300)
    let bb = await card.boundingBox()
    const clipA = { x: Math.max(0, bb.x - 14), y: 66, width: Math.min(VW - Math.max(0, bb.x - 14), bb.width + 28), height: VH - 66 }
    await clipShot(`card-${code}-a`, clipA, [[1, toggle], [2, card.locator('[data-section="apa"]')], [3, card.locator('[data-section="contoh"]')]])
    // view B: Format kerja, Bukti dukung, Tandai sudah dipahami
    const fmt = card.locator('[data-section="format"]')
    await fmt.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120)); await settle(300)
    bb = await card.boundingBox()
    const clipB = { x: Math.max(0, bb.x - 14), y: 66, width: Math.min(VW - Math.max(0, bb.x - 14), bb.width + 28), height: VH - 66 }
    await clipShot(`card-${code}-b`, clipB, [[1, fmt], [2, card.locator('[data-section="bukti"]')], [3, card.getByRole('button', { name: 'Tandai sudah dipahami' })]])
    await card.getByRole('button', { name: 'Tandai sudah dipahami' }).click(); await settle(350)
    if ((await card.locator('[data-section="apa"]').count()) > 0) { await toggle.click(); await settle(300) }
    console.log('card', code)
  }
  await p.getByRole('button', { name: 'Selesai memahami tahap ini' }).first().click(); await settle(600)
  if (phase < 7) { await p.getByRole('button', { name: NEXT[phase] }).first().click(); await settle(700) }
}
writeFileSync(join(OUT, 'cards.json'), JSON.stringify(meta, null, 1))
await b.close()
console.log('done', Object.keys(meta).length)
