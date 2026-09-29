// Captures real StatPlan screens for the Panduan Penggunaan, plus a UI inventory (headings, buttons,
// links, tabs, field labels) per screen so every name in the manual can be checked against the app.
// node docs/user-guide/source/panduan/capture-panduan.mjs <outDir>   (STATPLAN_URL defaults to local preview)
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4180'
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const VW = 1280, VH = 800, DPR = 1.5
const b = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, reducedMotion: 'reduce', acceptDownloads: true })
await ctx.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(String(e)))
const shots = []
const inventory = {}
const log = (...a) => console.log(...a)

const settle = async (ms = 500) => {
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(ms)
}
const go = async (path) => {
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 90000 })
  await settle(900)
}
const hideToasts = () => p.addStyleTag({ content: 'div[aria-live="polite"].fixed { display: none !important; }' })
const top = async () => { await p.evaluate(() => window.scrollTo(0, 0)); await settle(250) }
const bring = async (loc, offset = 120) => {
  await loc.first().waitFor({ timeout: 20000 })
  await loc.first().evaluate((el, off) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off), offset)
  await settle(350)
}
const boxOf = async (loc) => {
  try {
    const bb = await loc.first().boundingBox({ timeout: 4000 })
    const inHeader = bb ? await loc.first().evaluate((el) => !!el.closest('header')) : false
    if (!bb || (!inHeader && bb.y < 58) || bb.y + bb.height > VH - 2 || bb.width < 4) return null
    const x = Math.max(0, bb.x - 5), y = Math.max(0, bb.y - 5)
    return { x, y, w: Math.min(VW - x, bb.width + 10), h: Math.min(VH - y, bb.height + 10) }
  } catch {
    return null
  }
}
/** Visible UI text of the current screen (whole page, not only the viewport). */
const inventoryOf = () =>
  p.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
    }
    const txt = (el) => (el.getAttribute('aria-label') || el.innerText || el.value || '').replace(/\s+/g, ' ').trim()
    const pick = (sel) => [...new Set([...document.querySelectorAll(sel)].filter(vis).map(txt).filter(Boolean))]
    const labels = [...document.querySelectorAll('label')].filter(vis).map(txt).filter(Boolean)
    return {
      url: location.pathname + location.search,
      headings: pick('h1, h2, h3'),
      buttons: pick('button, [role="button"]'),
      links: pick('a[href]'),
      tabs: pick('[role="tab"]'),
      labels: [...new Set(labels)],
      summaries: pick('summary'),
    }
  })
const shot = async (name, marks = [], fullNote = '') => {
  await hideToasts()
  const resolved = []
  for (const [n, loc] of marks) {
    const bx = await boxOf(loc)
    if (bx) resolved.push({ n, ...bx })
    else log(`  ! ${name}: mark ${n} not visible`)
  }
  await p.screenshot({ path: join(OUT, `${name}.png`) })
  inventory[name] = await inventoryOf()
  shots.push({ name, vw: VW, vh: VH, dpr: DPR, marks: resolved, note: fullNote })
  log('shot', name, resolved.length, 'marks')
}
const safe = async (label, fn) => {
  try {
    await fn()
  } catch (e) {
    log(`  !! ${label} failed: ${String(e).split('\n')[0]}`)
    errors.push(`${label}: ${String(e).split('\n')[0]}`)
  }
}

// ——— Landing ———
await go('/')
await shot('01-landing', [
  [1, p.locator('header nav').first()],
  [2, p.getByRole('button', { name: 'Mulai perencanaan' }).first()],
  [3, p.getByRole('button', { name: 'Pelajari contoh' }).first()],
])
await safe('landing-cara-kerja', async () => {
  await bring(p.locator('#cara-kerja'), 60)
  await shot('02-landing-cara-kerja', [[1, p.locator('#cara-kerja ol')]])
})
await safe('landing-contoh', async () => {
  await bring(p.locator('#contoh'), 40)
  await shot('03-landing-contoh', [[1, p.locator('#contoh ul')]])
})
inventory['landing-full'] = await inventoryOf()

// ——— Contoh ———
await go('/contoh/skm')
await shot('04-contoh', [[1, p.getByRole('button', { name: /Gunakan contoh ini untuk membuat rencana/ })]])
await safe('contoh-sekilas', async () => {
  await bring(p.locator('[data-section="sekilas"]'), 100)
  await shot('05-contoh-sekilas', [[1, p.locator('[data-section="sekilas"]')]])
})
inventory['contoh-full'] = await inventoryOf()

// ——— Rencana baru (from the landing button) ———
await go('/')
await p.getByRole('button', { name: 'Mulai perencanaan' }).first().click()
await p.waitForURL(/\/app\/new/)
await settle(800)
inventory['intake-empty'] = await inventoryOf()
await p.getByRole('button', { name: 'Kepuasan pelayanan' }).click()
await settle(500)
await top()
await shot('06-rencana-ceritakan', [
  [1, p.locator('textarea').first()],
  [2, p.getByRole('button', { name: 'Kepuasan pelayanan' })],
])
await bring(p.getByText('Nama kegiatan (draf)', { exact: false }), 160)
await shot('06b-rencana-saran', [
  [1, p.getByText('Nama kegiatan (draf)', { exact: false }).first()],
  [2, p.getByText('Cara memperoleh data yang disarankan', { exact: false }).first()],
  [3, p.getByRole('group', { name: 'Pilih jenis kegiatan' })],
  [4, p.getByRole('button', { name: 'Lanjutkan' })],
])
await p.getByRole('button', { name: 'Lanjutkan' }).click()
await settle(700)
await top()
await shot('07-rencana-hasil', [
  [1, p.getByText('Kebutuhan awal', { exact: false }).first()],
  [2, p.getByRole('button', { name: 'Gunakan contoh ini' })],
  [3, p.getByRole('button', { name: 'Tulis sendiri' })],
  [4, p.getByRole('button', { name: /Gunakan contoh & lanjutkan/ })],
])
await p.getByRole('button', { name: /Gunakan contoh & lanjutkan/ }).click()
await settle(700)
await top()
await shot('08-rencana-waktu', [
  [1, p.getByRole('button', { name: '3 bulan' })],
  [2, p.getByLabel('Tanggal mulai')],
  [3, p.getByLabel('Tanggal selesai')],
])
await safe('rencana-jadwal', async () => {
  await bring(p.getByText('Rencana waktu awal', { exact: false }), 90)
  await shot('09-rencana-jadwal', [
    [1, p.getByRole('button', { name: 'Sesuaikan jadwal' })],
    [2, p.getByText('bukan durasi wajib BPS', { exact: false }).first()],
  ])
  await p.getByRole('button', { name: 'Sesuaikan jadwal' }).click()
  await settle(400)
  inventory['rencana-jadwal-edit'] = await inventoryOf()
  await p.getByRole('button', { name: 'Selesai sesuaikan' }).click()
  await settle(300)
})
await p.getByRole('button', { name: /Gunakan rencana waktu & lanjutkan/ }).click()
await settle(900)
await top()
await shot('10-serah-terima', [[1, p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/ })]])

// ——— Mode Terpandu ———
await p.getByRole('button', { name: /Lanjut ke Identifikasi Kebutuhan/ }).click()
await p.waitForURL(/\/guided/)
await p.getByText(/subproses sudah dipahami/i).first().waitFor()
await settle(900)
await shot('11-terpandu-fase', [
  [1, p.getByRole('navigation', { name: 'Urutan belajar Mode Terpandu' })],
  [2, p.locator('#guided-phase-heading').first()],
])
inventory['terpandu-fase-full'] = await inventoryOf()
await p.locator('[data-guided-card-toggle]').first().click()
await settle(700)
await bring(p.locator('[data-section="apa"]').first(), 110)
await shot('12-subproses-apa', [[1, p.locator('[data-section="apa"]').first()]])
inventory['subproses-open'] = await inventoryOf()
await safe('subproses-bawah', async () => {
  await bring(p.getByText('Format kerja StatPlan', { exact: true }).first(), 260)
  await shot('13-subproses-format-bukti', [
    [1, p.getByText('Format kerja StatPlan', { exact: true }).first()],
    [2, p.getByRole('button', { name: /Isi format kerja/ }).first()],
    [3, p.getByText('Bukti dukung', { exact: true }).first()],
  ])
})
await p.getByRole('button', { name: /Isi format kerja/ }).first().click()
await settle(800)
const dlg = p.getByRole('dialog')
await safe('format-kerja', async () => {
  const areas = dlg.locator('textarea')
  await areas.nth(0).fill('Belum ada informasi yang cukup tentang kepuasan masyarakat terhadap pelayanan perizinan.')
  await areas.nth(2).fill('Sebagai bahan evaluasi dan perbaikan standar pelayanan.')
  await settle(700)
  await shot('14-format-kerja', [
    [1, areas.nth(0)],
    [2, dlg.getByText('Disimpan secara lokal', { exact: false }).first()],
    [3, dlg.getByRole('button', { name: 'Selesai mengisi' })],
  ])
  inventory['format-kerja-dialog'] = await inventoryOf()
  const sel = dlg.locator('select[id^="ev-status-"]').first()
  await sel.selectOption({ label: 'Sedang disiapkan' })
  await sel.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await settle(500)
  await shot('15-bukti-dukung', [[1, dlg.getByText('Bukti yang perlu disiapkan', { exact: false }).first()], [2, sel]])
})
await dlg.getByRole('button', { name: 'Selesai mengisi' }).click()
await settle(700)
const understood = p.getByRole('button', { name: 'Tandai sudah dipahami' }).first()
await bring(understood, 380)
await understood.click()
await settle(600)
await shot('16-sudah-dipahami', [
  [1, p.locator('[data-understood]').first()],
  [2, p.getByRole('button', { name: /Lanjut ke 1\.2/ }).first()],
])

// Walk every phase: open each card, mark it understood, finish the phase, continue.
const PHASE_NEXT = ['Lanjut ke Perancangan', 'Lanjut ke Pembangunan', 'Lanjut ke Pengumpulan Data', 'Lanjut ke Pengolahan Data', 'Lanjut ke Analisis Data', 'Lanjut ke Penyajian & Penyebarluasan', 'Lanjut ke Evaluasi']
for (let phase = 0; phase < 8; phase++) {
  for (let guard = 0; guard < 40; guard++) {
    const btn = p.getByRole('button', { name: 'Tandai sudah dipahami' })
    if ((await btn.count()) === 0) {
      const closed = p.locator('[data-guided-card-toggle]:not([aria-expanded="true"])')
      const n = await closed.count()
      let opened = false
      for (let i = 0; i < n; i++) {
        await closed.nth(i).click()
        await settle(250)
        if ((await p.getByRole('button', { name: 'Tandai sudah dipahami' }).count()) > 0) { opened = true; break }
      }
      if (!opened) break
      continue
    }
    await btn.first().scrollIntoViewIfNeeded()
    await btn.first().click()
    await settle(250)
  }
  if (phase === 0) {
    await bring(p.getByText(/Bahan Anda/).first(), 110)
    await shot('17-bahan-anda', [[1, p.getByText(/Bahan Anda/).first()], [2, p.getByText(/dari 6 subproses sudah dipahami/).first()]])
  }
  const finish = p.getByRole('button', { name: 'Selesai memahami tahap ini' })
  await finish.first().scrollIntoViewIfNeeded()
  await finish.first().click()
  await settle(700)
  if (phase === 0) {
    await bring(p.getByText('Fase ini sudah Anda pelajari', { exact: false }), 200)
    await shot('18-fase-selesai', [[1, p.getByText('Fase ini sudah Anda pelajari', { exact: false })], [2, p.getByRole('button', { name: 'Lanjut ke Perancangan' })]])
  }
  if (phase < 7) {
    await p.getByRole('button', { name: PHASE_NEXT[phase] }).first().click()
    await settle(700)
    if (phase === 0) {
      await top()
      await shot('19-fase-perancangan', [[1, p.getByRole('navigation', { name: 'Urutan belajar Mode Terpandu' })], [2, p.locator('#guided-phase-heading').first()]])
    }
  }
}
await safe('terpandu-selesai', async () => {
  await bring(p.getByRole('heading', { name: 'Mode Terpandu selesai' }), 100)
  await shot('20-terpandu-selesai', [
    [1, p.getByRole('heading', { name: 'Mode Terpandu selesai' })],
    [2, p.getByRole('button', { name: 'Periksa di Workspace' })],
    [3, p.getByRole('button', { name: 'Unduh draf' })],
  ])
  inventory['terpandu-selesai-full'] = await inventoryOf()
})

// ——— Proyek saya + Ruang kerja (new, incomplete project) ———
const newId = await p.evaluate(() => JSON.parse(localStorage.getItem('bps-statplan-v2')).state.projects.find((x) => !x.id.startsWith('demo-')).id)
await go('/app')
await shot('21-proyek-saya', [[1, p.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first()]])
inventory['proyek-saya-full'] = await inventoryOf()
await go(`/app/projects/${newId}`)
await shot('22-workspace', [
  [1, p.getByText('FASE SAAT INI', { exact: false }).locator('xpath=../..')],
  [2, p.getByText('Langkah berikutnya', { exact: false }).first()],
])
inventory['workspace-top'] = await inventoryOf()
await go(`/app/projects/${newId}?tab=export`)
await safe('validasi', async () => {
  await bring(p.getByText('Tinjauan sebelum ekspor', { exact: false }), 100)
  const why = p.getByRole('button', { name: /Mengapa penting|Mengapa & cara memperbaiki/ }).first()
  if (await why.count()) { await why.click(); await settle(400) }
  await bring(p.getByText('Tinjauan sebelum ekspor', { exact: false }), 100)
  await shot('23-validasi', [
    [1, p.getByText('Tinjauan sebelum ekspor', { exact: false }).first()],
    [2, p.getByRole('button', { name: /Buka pemeriksaan portal/ }).first()],
  ])
  inventory['validasi-full'] = await inventoryOf()
})
await safe('portal', async () => {
  await p.getByRole('button', { name: /Buka pemeriksaan portal/ }).first().click()
  await settle(1000)
  await shot('24-portal', [
    [1, p.locator('#focus-portal').getByText('Pemeriksaan portal rujukan statistik').first()],
    [2, p.getByText('Sudah mengecek sirusa.web.bps.go.id').first()],
    [3, p.getByText('Sudah mengecek romantik.bps.go.id').first()],
  ])
  inventory['alur-kerja-portal'] = await inventoryOf()
})

// ——— Ruang kerja tabs on the complete demo project ———
await go('/app')
await p.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first().waitFor()
const tabs = () => p.getByRole('tablist', { name: 'Bagian workspace' })
const TAB_SHOTS = [
  ['25-tab-timeline', 'timeline', 'Timeline'],
  ['26-tab-alur-kerja', 'workflow', 'Alur kerja'],
  ['27-tab-checklist', 'checklist', 'Checklist'],
  ['28-tab-perancangan', 'design', 'Perancangan'],
  ['29-tab-variabel', 'variables', 'Variabel'],
  ['30-tab-instrumen', 'instruments', 'Instrumen'],
  ['31-tab-metadata', 'metadata', 'Metadata'],
  ['32-tab-riwayat', 'history', 'Riwayat'],
]
for (const [name, q, label] of TAB_SHOTS) {
  await safe(name, async () => {
    await go(`/app/projects/demo-skm-dpmptsp-2026`)
    await tabs().getByRole('tab', { name: label }).click()
    await settle(700)
    await bring(tabs(), 72)
    await shot(name, [[1, tabs().getByRole('tab', { name: label })]])
    inventory[`${name}-full`] = await inventoryOf()
  })
}
await go('/app/projects/demo-skm-dpmptsp-2026?tab=export')
await bring(p.getByRole('heading', { name: 'Draf rencana kegiatan' }), 100)
const unduh = p.getByRole('button', { name: 'Unduh draf perencanaan' })
await shot('33-ekspor', [[1, p.getByText('Sudah siap ditinjau', { exact: false }).first()], [2, unduh]])
inventory['ekspor-full'] = await inventoryOf()
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), unduh.click()])
await dl.saveAs(join(OUT, 'draft-skm.docx'))
log('downloaded', dl.suggestedFilename())
await settle(800)
inventory['ekspor-after'] = await inventoryOf()

// ——— FAQ ———
await go('/app/faq')
await shot('34-faq', [[1, p.getByRole('searchbox').or(p.locator('input[type="search"]')).first()]])
inventory['faq-full'] = await inventoryOf()

writeFileSync(join(OUT, 'shots.json'), JSON.stringify({ shots, download: dl.suggestedFilename(), errors }, null, 1))
writeFileSync(join(OUT, 'inventory.json'), JSON.stringify(inventory, null, 1))
await b.close()
log('done', shots.length, 'shots; errors:', errors.length)
