/**
 * Extract text from Materi Proses Bisnis.pdf for source audit.
 * Usage: node scripts/extract-pdf-audit.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pdfPath = join(root, 'Materi Proses Bisnis.pdf')
const outDir = join(root, 'docs', '_pdf-extract')
mkdirSync(outDir, { recursive: true })

const data = new Uint8Array(readFileSync(pdfPath))
const parser = new PDFParse({ data })
const result = await parser.getText()

const pages = result.pages || []
console.log('totalPages', result.total || pages.length)

// Write full text and per-page snippets
let full = ''
const inventory = []

for (const page of pages) {
  const num = page.num
  const text = (page.text || '').replace(/\r/g, '')
  full += `\n\n===== PAGE ${num} =====\n${text}`
  writeFileSync(join(outDir, `page-${String(num).padStart(2, '0')}.txt`), text, 'utf8')

  const lower = text.toLowerCase()
  const flags = {
    contoh: /contoh/i.test(text),
    tabel: /tabel/i.test(text),
    diagram: /diagram|alur|struktur organisasi|flowchart/i.test(text),
    aturan: /aturan|rule|validasi/i.test(text),
    portal: /sirusa|romantik|portal sdi/i.test(text),
    hortikultura: /hortikultura/i.test(text),
    skm: /skm|kepuasan/i.test(text),
    sampling: /sampel|sampling/i.test(text),
    disclosure: /disclosure|anonim|kerahasiaan|n\s*<\s*3/i.test(text),
    kak: /\bKAK\b|proposal/i.test(text),
    metadata: /metadata|MS-Keg|MS-Var|MS-Ind/i.test(text),
  }
  inventory.push({ page: num, chars: text.length, ...flags, preview: text.slice(0, 280).replace(/\s+/g, ' ') })
}

writeFileSync(join(outDir, 'FULL.txt'), full, 'utf8')
writeFileSync(join(outDir, 'inventory.json'), JSON.stringify(inventory, null, 2), 'utf8')

// Highlight page 28
const p28 = pages.find((p) => p.num === 28)
if (p28) {
  console.log('--- PAGE 28 ---')
  console.log(p28.text)
}

// Search key phrases
const keys = [
  'Hortikultura',
  'Struktur Organisasi',
  'Alur Laporan',
  'Sirusa',
  'Romantik',
  'Portal SDI',
  'disclosure',
  'n < 3',
  'Juli',
  'Desember',
  'dummy',
  'pilot',
  'FAQ',
]
for (const k of keys) {
  const hits = pages.filter((p) => (p.text || '').includes(k)).map((p) => p.num)
  console.log(k, '→', hits.join(',') || 'none')
}

await parser.destroy()
console.log('Wrote', outDir)
