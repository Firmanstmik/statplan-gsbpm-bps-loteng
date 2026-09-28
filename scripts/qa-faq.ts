/**
 * FAQ content QA — structure, source grounding and contextual links.
 *   npx vite-node scripts/qa-faq.ts
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../src/content/faq'
import { ALL_GUIDED_CARDS } from '../src/content/guidedCards'

const root = join(__dirname, '..')
const failures: string[] = []
const assert = (cond: unknown, msg: string) => {
  if (!cond) failures.push(msg)
}
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ')

// --- Structure: the eight requested categories with the requested number of questions ---
const expectedCounts: Record<string, number> = {
  statplan: 6,
  gsbpm: 6,
  memulai: 5,
  perancangan: 9,
  olah: 8,
  hasil: 6,
  output: 7,
  bantuan: 5,
}
assert(FAQ_CATEGORIES.length === 8, `8 categories (got ${FAQ_CATEGORIES.length})`)
for (const c of FAQ_CATEGORIES) {
  const n = FAQ_ITEMS.filter((f) => f.category === c.id).length
  assert(n === expectedCounts[c.id], `category ${c.id}: ${expectedCounts[c.id]} questions (got ${n})`)
}
assert(FAQ_ITEMS.length === 52, `52 questions (got ${FAQ_ITEMS.length})`)
const ids = FAQ_ITEMS.map((f) => f.id)
assert(new Set(ids).size === ids.length, 'FAQ ids are unique')
assert(ids.every((id) => /^[a-z0-9-]+$/.test(id)), 'FAQ ids are URL-safe (used as #hash)')
assert(new Set(FAQ_ITEMS.map((f) => f.q)).size === FAQ_ITEMS.length, 'no duplicate questions')

// --- GSBPM references resolve to a real phase (1–8) or one of the 44 official subprocess cards ---
const cardCodes = new Set(ALL_GUIDED_CARDS.map((c) => c.id.replace('gsbpm-', '')))
assert(cardCodes.size === 44, `44 guided subprocess cards (got ${cardCodes.size})`)
for (const f of FAQ_ITEMS) {
  if (!f.gsbpm) continue
  const ok = /^[1-8]$/.test(f.gsbpm) || cardCodes.has(f.gsbpm)
  assert(ok, `${f.id}: gsbpm "${f.gsbpm}" is not an official phase/subprocess`)
}

// --- Source labels: A/B cite real PDF pages; StatPlan explanations cite none ---
const extractDir = join(root, 'docs', '_pdf-extract')
const pageText = (n: number) => {
  const p = join(extractDir, `page-${String(n).padStart(2, '0')}.txt`)
  return existsSync(p) ? norm(readFileSync(p, 'utf8')) : null
}
const pagesOf = (page: string) =>
  page
    .split(/[,;]/)
    .flatMap((part) => {
      const [a, b] = part.trim().split(/[–-]/).map((x) => Number(x.trim()))
      if (!b) return [a]
      return Array.from({ length: b - a + 1 }, (_, i) => a + i)
    })
    .filter((n) => Number.isFinite(n))

for (const f of FAQ_ITEMS) {
  if (f.source.kind === 'STATPLAN') {
    assert(!f.source.page, `${f.id}: "Penjelasan StatPlan" must not carry a PDF page`)
    continue
  }
  assert(!!f.source.page, `${f.id}: source ${f.source.kind} needs a page`)
  for (const n of pagesOf(f.source.page ?? '')) {
    assert(n >= 1 && n <= 63 && pageText(n) !== null, `${f.id}: Hal. ${n} does not exist in the PDF extract`)
  }
}

// Type A answers: a key phrase of the answer must appear on the cited page (grounding check).
const grounding: Record<string, [number, string]> = {
  'apa-itu-gsbpm': [5, 'kerangka kerja standar internasional'],
  'mengapa-gsbpm': [5, 'manfaat gsbpm'],
  'tahapan-gsbpm': [6, 'fase'],
  'harus-urut': [8, 'tidak harus berurutan'],
  'cek-data-tersedia': [15, 'duplikasi data'],
  'apa-itu-sampling': [21, 'snowball'],
  'kapan-sampling': [21, 'subproses ini tidak dilakukan'],
  'apa-itu-validasi': [40, 'outlier'],
  'apa-itu-editing': [39, 'kaidah-kaidah editing'],
  'apa-itu-imputasi': [41, 'imputasi'],
  'apa-itu-coding': [39, 'pertanyaan tertutup menjadi kode'],
  'kualitas-data': [4, 'tepat waktu'],
  'cara-penyajian': [52, 'siaran pers'],
  'apa-itu-metadata': [58, 'format yang baku'],
  'metadata-perlu': [59, 'manfaat metadata'],
  'fungsi-faq': [52, 'faq dan basis pengetahuan'],
}
for (const f of FAQ_ITEMS.filter((x) => x.source.kind === 'A')) {
  const g = grounding[f.id]
  assert(!!g, `${f.id}: Type A answer needs a grounding phrase in qa-faq.ts`)
  if (!g) continue
  const [page, phrase] = g
  assert(pagesOf(f.source.page ?? '').includes(page), `${f.id}: grounding page ${page} is not among its cited pages`)
  assert(pageText(page)?.includes(phrase), `${f.id}: "${phrase}" not found on Hal. ${page}`)
}

// --- Honesty: answers never claim AI, approval or official status for StatPlan output ---
for (const f of FAQ_ITEMS) {
  const text = [f.q, ...f.a.flat()].join(' ')
  assert(!/\bAI\b/.test(text), `${f.id}: must not mention AI`)
  assert(!/(disetujui|dijamin|pasti benar)/i.test(text) || /bukan|belum|tidak/i.test(text), `${f.id}: approval wording without negation`)
}
const flexible = FAQ_ITEMS.find((f) => f.id === 'harus-urut')
assert(
  flexible?.a.join(' ').includes('GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait'),
  'harus-urut carries the StatPlan-vs-GSBPM flexibility sentence',
)

// --- Contextual links in the UI point at existing FAQ items ---
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(n) ? [p] : []
  })
const used = new Set<string>()
for (const file of walk(join(root, 'src'))) {
  if (file.endsWith(join('content', 'faq.ts'))) continue
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(/<Faq(?:Link|Inline)[^>]*\bid="([a-z0-9-]+)"/g)) used.add(m[1])
  for (const m of src.matchAll(/(?:PHASE_FAQ|TAB_FAQ)[\s\S]*?=\s*\{([\s\S]*?)\n\}/g)) {
    for (const idm of m[1].matchAll(/'([a-z0-9-]+)'/g)) if (idm[1].includes('-')) used.add(idm[1])
  }
}
for (const id of used) assert(ids.includes(id), `contextual FAQ link "${id}" has no FAQ item`)
for (const id of ['mulai-dari-mana', 'apa-itu-variabel', 'apa-itu-validasi', 'metadata-perlu', 'word-resmi']) {
  assert(used.has(id), `contextual FAQ link for "${id}" is wired in the UI`)
}

// --- Content map doc stays in sync ---
const mapDoc = join(root, 'docs', 'faq-content-map.md')
assert(existsSync(mapDoc), 'docs/faq-content-map.md exists')
if (existsSync(mapDoc)) {
  const doc = readFileSync(mapDoc, 'utf8')
  for (const id of ids) assert(doc.includes(`\`${id}\``), `faq-content-map.md lists ${id}`)
}

if (failures.length) {
  console.error('qa-faq FAIL')
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log(`qa-faq PASS (${FAQ_ITEMS.length} questions, ${FAQ_CATEGORIES.length} categories, ${used.size} contextual links)`)
