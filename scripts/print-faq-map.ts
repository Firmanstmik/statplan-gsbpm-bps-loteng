/**
 * Regenerates docs/faq-content-map.md from src/content/faq.ts.
 *   npm run docs:faq
 */
import { writeFileSync } from 'fs'
import { join } from 'path'
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategoryId } from '../src/content/faq'
import { GUIDED_PHASES } from '../src/content/guidedCards'

const PURPOSE: Record<FaqCategoryId, string> = {
  statplan: 'Posisi produk dan batasannya (simulator, bukan sistem resmi)',
  gsbpm: 'Memperkenalkan GSBPM dengan istilah materi',
  memulai: 'Langkah pertama bagi pemula',
  perancangan: 'Istilah perancangan dijelaskan sederhana',
  olah: 'Istilah pengumpulan, pengolahan, analisis',
  hasil: 'Produk, metadata, dan rilis',
  output: 'Cara kerja keluaran StatPlan',
  bantuan: 'Saat pengguna bingung atau tersendat',
}

/** Where the answer is surfaced besides /app/faq (keep in sync with FaqLink/FaqInline usages; qa-faq checks ids). */
const CONTEXT: Record<string, string> = {
  'mulai-dari-mana': 'Intake langkah 1 — “Bingung mulai dari mana?” (jawaban tampil di tempat)',
  'apa-itu-variabel': 'Mode Terpandu fase Perancangan (catatan sumber fase); Ruang kerja tab Variabel',
  'apa-itu-validasi': 'Mode Terpandu fase Pengolahan Data (catatan sumber fase)',
  'metadata-perlu': 'Ruang kerja tab Metadata',
  'word-resmi': 'Ruang kerja tab Ekspor — “Apakah hasil ini dokumen resmi BPS?”',
}

const phaseName = (code: string) => {
  const n = Number(code.split('.')[0])
  const phase = GUIDED_PHASES[n - 1]
  if (!phase) return code
  if (!code.includes('.')) return `${code} ${phase.intro.title}`
  const card = phase.cards.find((c) => c.id === `gsbpm-${code}`)
  return card ? `${code} ${card.officialTitle}` : code
}

const source = (kind: string, page?: string) =>
  kind === 'A' ? `A · Hal. ${page}` : kind === 'B' ? `B · Hal. ${page}` : 'StatPlan'

const lines: string[] = [
  '# FAQ content map',
  '',
  'Generated from `src/content/faq.ts` by `npm run docs:faq`. Do not edit by hand.',
  '',
  'Source types:',
  '- **A**: stated in *Materi Proses Bisnis*. The label is “Menurut Materi Proses Bisnis · Hal. N”, and `qa-faq` checks a key phrase against the PDF extract.',
  '- **B**: simplified wording of PDF content. The label is “Penjelasan sederhana · Hal. N”.',
  '- **StatPlan**: how StatPlan works, labelled “Penjelasan StatPlan”. No page, and not a BPS statement.',
  '',
  'No type C (illustrative example) is used in the FAQ.',
  '',
  `Total: ${FAQ_ITEMS.length} questions in ${FAQ_CATEGORIES.length} categories. All are shown at \`/app/faq\` (\`#id\` deep links).`,
  '',
]
for (const c of FAQ_CATEGORIES) {
  const items = FAQ_ITEMS.filter((f) => f.category === c.id)
  lines.push(`## ${c.label} (${items.length})`, '', `Purpose: ${PURPOSE[c.id]}.`, '')
  lines.push('| id | Question | Source | GSBPM | Contextual location |', '|---|---|---|---|---|')
  for (const f of items) {
    lines.push(
      `| \`${f.id}\` | ${f.q.replace(/\|/g, '\\|')} | ${source(f.source.kind, f.source.page)} | ${f.gsbpm ? phaseName(f.gsbpm) : '—'} | ${CONTEXT[f.id] ?? '—'} |`,
    )
  }
  lines.push('')
}
writeFileSync(join(__dirname, '..', 'docs', 'faq-content-map.md'), lines.join('\n'))
console.log(`docs/faq-content-map.md written (${FAQ_ITEMS.length} questions)`)
