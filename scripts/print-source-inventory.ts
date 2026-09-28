/**
 * Prints the 44-row subprocess table used in docs/claude-source-inventory.md,
 * generated from the Guided content so the doc cannot drift from the code.
 * run: npx vite-node scripts/print-source-inventory.ts
 */
import { GUIDED_PHASES } from '../src/content/guidedCards'
import { getPreparation } from '../src/content/guidedPreparation'

const CLASS_LABEL = { A: 'A', B: 'B', C: 'C' } as const

function exampleCell(card: (typeof GUIDED_PHASES)[number]['cards'][number]): string {
  const parts: string[] = []
  for (const ex of card.materiExamples ?? []) {
    const kind = ex.imageSrc ? 'visual' : ex.table ? 'tabel' : ex.items ? 'daftar' : 'rujukan'
    const page = ex.pdfPage ?? card.pdfPage
    parts.push(`A: ${ex.title} (${kind}, Hal. ${page})`)
  }
  if (card.contohDetail?.length) parts.push('C: contoh penerapan SKM')
  if (!parts.length) parts.push(`${CLASS_LABEL[card.contohClass]}: ${card.contoh}`)
  return parts.join('; ')
}

const rows: string[] = []
for (const { intro, cards } of GUIDED_PHASES) {
  for (const card of cards) {
    const prep = getPreparation(card.id)
    const evidence = (prep?.evidence ?? [])
      .map((e) => (e.pdfPage != null ? `${e.label} (A, Hal. ${e.pdfPage})` : e.label))
      .join('; ')
    const source = [
      card.materiPoints?.length ? 'A (poin materi)' : null,
      'B (Apa?)',
      card.materiExamples?.length ? 'A (contoh materi)' : null,
      card.contohDetail?.length ? 'C (contoh ilustratif)' : null,
      'D (isian pengguna)',
    ]
      .filter(Boolean)
      .join(', ')
    rows.push(
      `| ${card.code} | ${intro.officialTitle.split(' (')[0]} | ${card.officialTitle} | ${card.pdfPage} | ${source} | ${exampleCell(card)} | ${prep?.title ?? '—'} | ${evidence || '—'} |`,
    )
  }
}
console.log(
  '| Kode | Phase | Official subprocess | PDF page | Source type | Example | Template (Format kerja) | Evidence |',
)
console.log('|---|---|---|---|---|---|---|---|')
console.log(rows.join('\n'))
