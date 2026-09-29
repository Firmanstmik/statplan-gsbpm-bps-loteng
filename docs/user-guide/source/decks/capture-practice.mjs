// Captures the 36-step practical walkthrough (real app) with callout boxes. node docs/user-guide/source/decks/capture-practice.mjs <outDir>
// node practice-shots.mjs <outDir>   (STATPLAN_URL defaults to local preview)
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4180'
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const VW = 1440, VH = 900
const b = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1.25, reducedMotion: 'reduce', acceptDownloads: true })
await ctx.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
const p = await ctx.newPage()
const steps = []
const log = (...a) => console.log(...a)

const settle = async (ms = 500) => {
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(ms)
}
const go = async (path) => {
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 90000 })
  await settle(800)
}
const hideToasts = () => p.addStyleTag({ content: 'div[aria-live="polite"].fixed { display: none !important; }' })
/** Scroll so the locator sits ~offset px below the top of the viewport. */
const bring = async (loc, offset = 130) => {
  await loc.first().waitFor({ timeout: 20000 })
  await loc.first().evaluate((el, off) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off), offset)
  await settle(350)
}
const boxOf = async (loc) => {
  try {
    const bb = await loc.first().boundingBox({ timeout: 4000 })
    // Must be fully inside the viewport and below the sticky header (64px), or the callout would mislead.
    const inHeader = bb ? await loc.first().evaluate((el) => !!el.closest('header')) : false
    if (!bb || (!inHeader && bb.y < 60) || bb.y + bb.height > VH - 4 || bb.width < 4) return null
    const x = Math.max(0, bb.x - 6), y = Math.max(0, bb.y - 6)
    return { x, y, w: Math.min(VW - x, bb.width + 12), h: Math.min(VH - y, bb.height + 12) }
  } catch {
    return null
  }
}
const shot = async (id, marks = []) => {
  await hideToasts()
  const resolved = []
  for (const [n, loc] of marks) {
    const bx = await boxOf(loc)
    if (bx) resolved.push({ n, ...bx })
    else log(`  ! step ${id}: mark ${n} not visible`)
  }
  const file = `step-${String(id).padStart(2, '0')}.png`
  await p.screenshot({ path: join(OUT, file) })
  steps.push({ id, img: file, vw: VW, vh: VH, marks: resolved })
  log('shot', id, resolved.length, 'marks')
}

// ——— A. Memulai ———
await go('/')
await shot(1, [[1, p.locator('h1')], [2, p.getByRole('button', { name: 'Mulai perencanaan' }).first()], [3, p.getByRole('button', { name: 'Pelajari contoh' }).first()]])
await bring(p.locator('#cara-kerja'), 60)
await shot(2, [[1, p.locator('#cara-kerja ol')]])
await bring(p.locator('#contoh'), 40)
await shot(3, [[1, p.locator('#contoh-heading')], [2, p.locator('#contoh ul')]])
await shot(4, [[1, p.getByRole('link', { name: /Pelajari contoh: Survei/ })]])
await p.getByRole('link', { name: /Pelajari contoh: Survei/ }).click()
await p.waitForURL(/\/contoh\/skm/)
await settle(900)
await bring(p.locator('[data-section="sekilas"]'), 110)
await shot(5, [[1, p.locator('[data-section="sekilas"]')]])
await p.evaluate(() => window.scrollTo(0, 0))
await settle(300)
await shot(6, [[1, p.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/ })]])

// ——— B. Rencana & timeline ———
await p.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/ }).click()
await p.waitForURL(/\/app\/new/)
await settle(800)
await shot(7, [[1, p.locator('#guided-step-heading')], [2, p.locator('textarea').first()], [3, p.getByText('Belum tahu cara menuliskannya?')], [4, p.getByText(/cara memperoleh data yang disarankan/i).first()]])
// step 10 image (FAQ while confused) is taken here, on the same intake screen
await p.locator('summary', { hasText: 'Bingung mulai dari mana?' }).click()
await settle(400)
await bring(p.locator('summary', { hasText: 'Bingung mulai dari mana?' }), 260)
const faqShot = { marks: [[1, p.locator('summary', { hasText: 'Bingung mulai dari mana?' })], [2, p.getByRole('link', { name: 'FAQ', exact: true })]] }
await shot(10, faqShot.marks)
await p.locator('summary', { hasText: 'Bingung mulai dari mana?' }).click()
await p.evaluate(() => window.scrollTo(0, 0))
await p.getByRole('button', { name: 'Lanjutkan' }).click()
await settle(700)
await p.evaluate(() => window.scrollTo(0, 0))
await settle(300)
await shot(8, [[1, p.locator('#guided-step-heading')], [2, p.getByText('Kebutuhan awal', { exact: false }).first()]])
await bring(p.getByText('Contoh hasil untuk kegiatan', { exact: false }), 200)
await shot(9, [[1, p.getByText('Contoh hasil untuk kegiatan', { exact: false }).locator('xpath=..')], [2, p.getByRole('button', { name: /Gunakan contoh & lanjutkan/ })]])
await p.getByRole('button', { name: /Gunakan contoh & lanjutkan/ }).click()
await settle(700)
await p.evaluate(() => window.scrollTo(0, 0))
await settle(300)
await shot(11, [[1, p.locator('#guided-step-heading')], [2, p.getByRole('button', { name: '3 bulan' })]])
await bring(p.getByLabel('Tanggal mulai'), 220)
await shot(12, [[1, p.getByLabel('Tanggal mulai')], [2, p.getByLabel('Tanggal selesai')]])
await bring(p.getByText('Rencana waktu awal', { exact: false }), 120)
await shot(13, [[1, p.getByText('bukan durasi wajib BPS', { exact: false }).first()], [2, p.getByText('Identifikasi Kebutuhan', { exact: true }).first()]])

// ——— C. Mode Terpandu ———
await p.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/ }).click()
await settle(900)
await p.evaluate(() => window.scrollTo(0, 0))
await settle(300)
await shot(14, [[1, p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/ })]])
await p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/ }).click()
await p.waitForURL(/\/guided/)
await p.getByText(/subproses sudah dipahami/i).first().waitFor()
await settle(900)
await shot(15, [[1, p.getByText('Identifikasi Kebutuhan', { exact: true }).nth(1)], [2, p.getByText('URUTAN BELAJAR STATPLAN', { exact: false }).locator('xpath=..')]])
await p.locator('[data-guided-card-toggle]').first().click()
await settle(700)
await bring(p.locator('[data-section="apa"]').first(), 150)
await shot(16, [[1, p.locator('[data-section="apa"]').first()]])
const fullEx = p.getByText('Contoh isian lengkap').first()
await fullEx.click()
await settle(500)
await bring(fullEx, 190)
await shot(17, [[1, fullEx.locator('xpath=ancestor::*[self::details or self::div][1]')]])
await p.getByRole('button', { name: /Isi format kerja/ }).first().click()
await settle(800)
await shot(18, [[1, p.getByRole('dialog').getByText(/^contoh ilustratif statplan$/i).locator('xpath=..')], [2, p.getByRole('dialog').getByText('Masalah/kebutuhan yang ingin dijawab', { exact: false })]])
const dlg = p.getByRole('dialog')
const areas = dlg.locator('textarea')
await areas.nth(0).fill('Belum ada informasi yang cukup tentang kepuasan masyarakat terhadap pelayanan perizinan.')
await areas.nth(2).fill('Sebagai bahan evaluasi dan perbaikan standar pelayanan.')
await areas.nth(3).fill('DPMPTSP dan pimpinan daerah.')
await settle(300)
await shot(19, [[1, areas.nth(0)], [2, areas.nth(2)], [3, dlg.getByRole('button', { name: 'Selesai mengisi' })]])
await dlg.getByRole('button', { name: 'Selesai mengisi' }).click()
await settle(700)
const understood = p.getByRole('button', { name: 'Tandai sudah dipahami' }).first()
await bring(understood, 420)
await understood.click()
await settle(600)
await shot(20, [[1, p.locator('[data-understood]').first()], [2, p.getByRole('button', { name: /Subproses berikutnya|Lanjut ke 1\.2/ }).first()]])
await bring(p.getByText('Bahan Anda', { exact: true }), 120)
await shot(21, [[1, p.getByText('Bahan Anda', { exact: true }).locator('xpath=..')], [2, p.getByText(/1 dari 6 subproses sudah dipahami/).first()]])

// ——— D. Validasi & Ruang kerja (proyek baru) ———
const newId = await p.evaluate(() => JSON.parse(localStorage.getItem('bps-statplan-v2')).state.projects.find((x) => !x.id.startsWith('demo-')).id)
await go(`/app/projects/${newId}?tab=export`)
await bring(p.getByText('Tinjauan sebelum ekspor', { exact: false }), 120)
await shot(22, [[1, p.getByText('Tinjauan sebelum ekspor', { exact: false }).first()], [2, p.getByRole('button', { name: /Buka pemeriksaan portal/ })]])
await p.getByRole('button', { name: /Buka pemeriksaan portal/ }).click()
await settle(1000)
// The fix link opens Alur kerja on Specify Need 1.5 with the portal check in view — no extra click.
const portalCard = p.locator('#focus-portal')
const sirusa = p.getByText('Sudah mengecek sirusa.web.bps.go.id').first()
const romantik = p.getByText('Sudah mengecek romantik.bps.go.id').first()
await shot(23, [[1, portalCard.getByText('Pemeriksaan portal rujukan statistik').first()], [2, sirusa], [3, romantik]])
const notes = p.getByLabel('Catatan hasil pengecekan')
if (await notes.count()) await notes.first().fill('Belum ditemukan kegiatan SKM sejenis untuk DPMPTSP pada portal rujukan (contoh ilustratif).')
await sirusa.click()
await romantik.click()
await settle(600)
await go(`/app/projects/${newId}`)
await shot(24, [[1, p.getByText('FASE SAAT INI', { exact: false }).locator('xpath=../..')], [2, p.getByText('Langkah berikutnya', { exact: false }).first()]])
const tabs = p.getByRole('tablist', { name: 'Bagian workspace' })
await bring(tabs, 90)
await shot(25, [[1, tabs.getByRole('tab', { name: 'Timeline' })], [2, p.getByText('Timeline perencanaan', { exact: true })]])
const tabShot = async (id, name, mark) => {
  await tabs.getByRole('tab', { name }).click()
  await settle(600)
  await bring(tabs, 90)
  await shot(id, [[1, tabs.getByRole('tab', { name })], ...(mark ? [[2, mark]] : [])])
}
await tabShot(26, 'Alur kerja', p.getByRole('tablist', { name: 'Subproses Specify Need' }))
await tabShot(27, 'Checklist', null)
await tabShot(28, 'Perancangan', null)
await tabShot(29, 'Variabel', p.getByRole('link', { name: 'Apa itu variabel?' }))
await tabShot(30, 'Instrumen', null)
await tabShot(31, 'Metadata', p.getByRole('link', { name: 'Mengapa metadata diperlukan?' }))
await tabShot(32, 'Riwayat', null)
await tabShot(33, 'Ekspor', p.getByRole('link', { name: 'Apakah hasil ini dokumen resmi BPS?' }))
await bring(p.getByRole('heading', { name: 'Draf rencana kegiatan' }), 110)
await shot(34, [[1, p.getByText(/hal perlu dilengkapi sebelum draf dapat diunduh/).first()], [2, p.getByRole('button', { name: 'Unduh draf perencanaan' })]])

// ——— E. Unduh (proyek demo SKM yang sudah lengkap) ———
await go('/app')
await p.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first().waitFor()
await go('/app/projects/demo-skm-dpmptsp-2026?tab=export')
await bring(p.getByRole('heading', { name: 'Draf rencana kegiatan' }), 110)
const unduh = p.getByRole('button', { name: 'Unduh draf perencanaan' })
await shot(35, [[1, p.getByText('Sudah siap ditinjau', { exact: false })], [2, unduh]])
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), unduh.click()])
await dl.saveAs(join(OUT, 'draft-skm.docx'))
log('downloaded', dl.suggestedFilename())
steps.push({ id: 36, img: 'draft-page-1.png', docx: 'draft-skm.docx', filename: dl.suggestedFilename(), marks: [] })

writeFileSync(join(OUT, 'steps.json'), JSON.stringify(steps.sort((a, b2) => a.id - b2.id), null, 1))
await b.close()
log('done', steps.length)
