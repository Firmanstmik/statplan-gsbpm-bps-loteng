/**
 * FAQ browser QA — accordion semantics, keyboard, search, filter, deep links, contextual links, responsive.
 *
 *   STATPLAN_URL=http://127.0.0.1:4173 node scripts/faq-qa.mjs [widths=375,390,430,768,1000,1280,1440]
 *
 * Exit 1 on any failed check.
 */
import { chromium } from 'playwright'

const BASE = process.env.STATPLAN_URL || 'http://127.0.0.1:4173'
const WIDTHS = (process.argv[2] || '375,390,430,768,1000,1280,1440').split(',').map(Number)
const HEIGHT = { 375: 812, 390: 844, 430: 932, 768: 1024, 1000: 800, 1280: 800, 1440: 900 }
const TOTAL = 52

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
  console.log(`${ok ? '  ✓' : '  ✗'} ${msg}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })

for (const width of WIDTHS) {
  console.log(`\n=== ${width} ===`)
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] ?? 900 } })
  await ctx.addInitScript(() => localStorage.setItem('bps-statplan-onboarding-done', '1'))
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto(`${BASE}/app/faq`, { waitUntil: 'load', timeout: 90000 })
  const questions = page.locator('button[aria-controls^="faq-a-"]')
  await questions.first().waitFor()

  // Structure & semantics
  const s = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[aria-controls^="faq-a-"]')]
    return {
      h1: document.querySelectorAll('h1').length,
      h1Text: document.querySelector('h1')?.textContent?.trim(),
      buttons: btns.length,
      allCollapsed: btns.every((b) => b.getAttribute('aria-expanded') === 'false'),
      regionsOk: btns.every((b) => {
        const r = document.getElementById(b.getAttribute('aria-controls'))
        return r && r.getAttribute('role') === 'region' && r.hidden && r.getAttribute('aria-labelledby') === b.id
      }),
      insideHeading: btns.every((b) => b.parentElement?.tagName === 'H3'),
      searchLabelled: !!document.querySelector('label[for="faq-search"]'),
      chips: [...document.querySelectorAll('[aria-label="Kategori pertanyaan"] button')].map((b) => b.getAttribute('aria-pressed')),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  check(s.h1 === 1 && s.h1Text === 'Pertanyaan umum', `one h1 “Pertanyaan umum” (${s.h1})`)
  check(s.buttons === TOTAL, `${TOTAL} question buttons (${s.buttons})`)
  check(s.allCollapsed && s.regionsOk && s.insideHeading, 'accordion: h3 > button[aria-expanded=false][aria-controls] → hidden role=region labelled by the button')
  check(s.searchLabelled, 'search input has a label')
  check(s.chips.length === 9 && s.chips[0] === 'true' && s.chips.slice(1).every((v) => v === 'false'), 'category buttons use aria-pressed (Semua + 8)')
  const phone = width < 640
  const selectVisible = await page.locator('#faq-category').isVisible()
  const chipsVisible = await page.locator('[aria-label="Kategori pertanyaan"]').isVisible()
  check(phone ? selectVisible && !chipsVisible : chipsVisible && !selectVisible, phone ? 'phone: labelled category select (chips hidden)' : 'category chips shown (select hidden)')
  check(s.overflow <= 1, `no horizontal overflow (${s.overflow}px)`)

  // Mouse toggle
  const first = questions.first()
  await first.click()
  check((await first.getAttribute('aria-expanded')) === 'true', 'click opens an answer')
  const firstRegion = page.locator(`#${await first.getAttribute('aria-controls')}`)
  check(await firstRegion.isVisible(), 'opened answer is visible')
  check(/Penjelasan StatPlan|Menurut Materi Proses Bisnis|Penjelasan sederhana/.test(await firstRegion.innerText()), 'answer shows its source label')
  await first.click()
  check((await first.getAttribute('aria-expanded')) === 'false', 'second click closes it')

  // Keyboard: Enter and Space toggle, focus ring visible
  const second = questions.nth(1)
  await second.focus()
  await page.keyboard.press('Enter')
  check((await second.getAttribute('aria-expanded')) === 'true', 'Enter opens')
  await page.keyboard.press(' ')
  check((await second.getAttribute('aria-expanded')) === 'false', 'Space closes')
  await page.keyboard.press('Tab')
  const ring = await page.evaluate(() => {
    const el = document.activeElement
    const cs = getComputedStyle(el)
    return el.matches(':focus-visible') && ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none')
  })
  check(ring, 'keyboard focus is visible')

  // Search
  await page.fill('#faq-search', 'sampel')
  await page.waitForTimeout(150)
  const nSampel = await questions.count()
  const titles = await questions.allInnerTexts()
  check(nSampel > 0 && nSampel < TOTAL && titles.some((t) => /Apa itu sampling\?/.test(t)), `search “sampel” narrows to ${nSampel} incl. “Apa itu sampling?”`)
  check((await page.locator('#faq-count').innerText()).includes(`${nSampel} dari ${TOTAL}`), 'result count announced (aria-live)')
  await page.fill('#faq-search', 'zzzqqq')
  await page.waitForTimeout(150)
  check((await questions.count()) === 0 && (await page.getByText('Belum ada jawaban yang cocok').isVisible()), 'no-match shows a friendly empty state')
  await page.getByRole('button', { name: 'Tampilkan semua pertanyaan' }).click()
  check((await questions.count()) === TOTAL, 'reset restores all questions')

  // Category filter
  if (phone) await page.selectOption('#faq-category', 'perancangan')
  else await page.getByRole('button', { name: 'Perancangan', exact: true }).click()
  check((await questions.count()) === 9, `category “Perancangan” shows 9 (${await questions.count()})`)
  if (phone) await page.selectOption('#faq-category', 'all')
  else await page.getByRole('button', { name: 'Semua', exact: true }).click()
  check((await questions.count()) === TOTAL, 'back to all categories')

  // Tap targets on the FAQ page
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('main a[href], main button, main input')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const inline = getComputedStyle(el).display === 'inline' && el.closest('p')
        return r.width > 0 && !inline && (r.height < 24 || r.width < 24)
      })
      .map((el) => el.textContent.trim().slice(0, 30)),
  )
  check(small.length === 0, `FAQ tap targets ≥ 24px${small.length ? ': ' + small.join(', ') : ''}`)

  // Deep link opens and reveals the item
  await page.goto(`${BASE}/app/faq#apa-itu-variabel`, { waitUntil: 'load', timeout: 90000 })
  const deep = page.locator('#faq-q-apa-itu-variabel')
  await deep.waitFor()
  await page.waitForTimeout(300)
  const deepState = await deep.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { expanded: el.getAttribute('aria-expanded'), inView: r.top >= 0 && r.top < window.innerHeight }
  })
  check(deepState.expanded === 'true' && deepState.inView, 'deep link #apa-itu-variabel opens the answer in view')

  // Old help URL redirects
  await page.goto(`${BASE}/app/help`, { waitUntil: 'load', timeout: 90000 })
  await page.waitForURL(/\/app\/faq$/)
  check(true, '/app/help redirects to /app/faq')

  if (width === 390 || width === 1280) {
    // Intake: inline answer, no navigation (typed story is kept)
    await page.goto(`${BASE}/app/new`, { waitUntil: 'load', timeout: 90000 })
    const story = page.locator('textarea').first()
    await story.fill('Saya ingin mengetahui jumlah UMKM di kecamatan saya.')
    const inline = page.locator('summary', { hasText: 'Bingung mulai dari mana?' })
    await inline.click()
    const inlineOpen = await inline.evaluate((el) => el.parentElement.open)
    check(inlineOpen && /\/app\/new/.test(page.url()) && (await story.inputValue()).includes('UMKM'), 'intake “Bingung mulai dari mana?” opens in place and keeps the typed story')

    // Workspace tabs: contextual links reach the right answer
    await page.goto(`${BASE}/app`, { waitUntil: 'load', timeout: 90000 })
    await page.getByRole('button', { name: /^(Muat demo|Perbarui demo)$/ }).first().waitFor()
    for (const [tab, name, id] of [
      ['variables', 'Apa itu variabel?', 'apa-itu-variabel'],
      ['metadata', 'Mengapa metadata diperlukan?', 'metadata-perlu'],
      ['export', 'Apakah hasil ini dokumen resmi BPS?', 'word-resmi'],
    ]) {
      await page.goto(`${BASE}/app/projects/demo-skm-dpmptsp-2026?tab=${tab}`, { waitUntil: 'load', timeout: 90000 })
      const link = page.getByRole('link', { name })
      await link.waitFor({ timeout: 15000 })
      await link.click()
      await page.waitForURL(new RegExp(`/app/faq#${id}$`))
      await page.locator(`#faq-q-${id}`).waitFor()
      await page.waitForTimeout(200)
      check((await page.locator(`#faq-q-${id}`).getAttribute('aria-expanded')) === 'true', `workspace ${tab} → FAQ “${name}” opened`)
    }

    // Landing: “Masih bingung?” → FAQ
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 90000 })
    await page.getByRole('button', { name: 'Lihat FAQ' }).click()
    await page.waitForURL(/\/app\/faq$/)
    check(true, 'landing “Lihat FAQ” opens the FAQ')
  }

  check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

await browser.close()
console.log(failures.length ? `\nFAQ QA: FAIL (${failures.length})` : '\nFAQ QA: PASS')
process.exit(failures.length ? 1 : 0)
