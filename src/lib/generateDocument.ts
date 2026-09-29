import type { Project } from '@/domain/types'
import {
  GSBPM_PHASES,
  computePhaseProgress,
  computeProjectProgress,
  isChecklistVisible,
  isSubProcessVisible,
} from '@/domain/gsbpm'
import {
  MS_IND_FIELDS,
  MS_KEG_FIELDS,
  MS_VAR_FIELDS,
} from '@/domain/metadataSchema'
import { validateProject } from '@/domain/validation'
import { guidanceFor } from '@/content/validationGuidance'
import { formatDateID, formatDateRangeID } from '@/content/planningTimeline'
import { getGuidedSession } from '@/lib/guidedSession'
import { formatDate, formatDateTime, jenisLabel, statusLabel } from '@/lib/utils'
import type { FileChild } from 'docx'

const APP_VERSION = 'StatPlan 1.0.0'
const NBSP = String.fromCharCode(160)

// Restrained palette: navy, light blue, neutral gray.
const NAVY = '1F3A5F'
const INK = '1E293B'
const GRAY = '5F6B7A'
const LINE = 'C9D3DF'
const HEAD_FILL = 'E3ECF6'
const SOFT_FILL = 'F3F7FB'
const BAR_FILL = '6F8FB5'

const PAGE_W = 11906 // A4
const MARGIN = 1134 // 2 cm
const PAGE_H = 16838
const W = PAGE_W - MARGIN * 2 // text width (dxa)

const KLASIFIKASI_LABEL: Record<string, string> = {
  dasar: 'Statistik dasar',
  sektoral: 'Statistik sektoral',
  khusus: 'Statistik khusus',
}
const METODE_LABEL: Record<string, string> = {
  wawancara: 'Wawancara',
  self_enumeration: 'Pencacahan mandiri (self-enumeration)',
  observasi: 'Observasi',
}
const TYPE_LABEL: Record<string, string> = {
  kategorik: 'Kategorik',
  numerik: 'Numerik',
  teks: 'Teks',
  tanggal: 'Tanggal',
}
const Q_TYPE_LABEL: Record<string, string> = {
  tertutup: 'Tertutup',
  terbuka: 'Terbuka',
  skala: 'Skala',
}

export async function exportProjectDocument(project: Project) {
  const {
    Document,
    Packer,
    Paragraph,
    HeadingLevel,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    Header,
    Footer,
    PageNumber,
    ShadingType,
    TableLayoutType,
    TabStopType,
    VerticalAlign,
  } = await import('docx')
  const { saveAs } = await import('file-saver')

  const generatedAt = new Date()
  const issues = validateProject(project)
  const progress = computeProjectProgress(
    project.jenisKegiatan,
    project.klasifikasi,
    project.checklistState,
  )
  // Demo projects carry illustrative statuses (portal dates, recommendation notes) — label them as such.
  const isDemo = project.id.startsWith('demo-')
  const session = getGuidedSession(project.id)
  const meta = project.metadata
  const opd =
    project.rekomendasiBps.penyelenggara ||
    meta.kegiatan.penyelenggara ||
    'Belum diisi'
  const periode =
    session?.startISO && session.endISO
      ? formatDateRangeID(session.startISO, session.endISO)
      : project.rekomendasiBps.periode ||
        meta.kegiatan.periode_pelaksanaan ||
        'Belum ditentukan'

  /** Text answer from a guided template card (only what the user actually wrote). */
  function guided(cardId: string, field: string): string {
    const v = session?.templateDrafts[cardId]?.values[field]
    return typeof v === 'string' ? v.trim() : ''
  }
  function guidedOutputs(): string[] {
    const v = session?.templateDrafts['gsbpm-1.3']?.values.outputs
    if (!Array.isArray(v)) return []
    return v
      .map((row) => {
        const r = row as unknown as Record<string, string>
        const name = (r.name ?? '').trim()
        if (!name) return ''
        return r.bentuk ? `${name} (${r.bentuk})` : name
      })
      .filter(Boolean)
  }

  // ——— building blocks ———

  type RunOpts = { bold?: boolean; italic?: boolean; size?: number; color?: string }
  function run(text: string, o: RunOpts = {}) {
    return new TextRun({ text, bold: o.bold, italics: o.italic, size: o.size, color: o.color })
  }

  function p(
    text: string | InstanceType<typeof TextRun>[],
    o: RunOpts & {
      before?: number
      after?: number
      center?: boolean
      keepNext?: boolean
      indent?: number
    } = {},
  ) {
    return new Paragraph({
      alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: o.before ?? 0, after: o.after ?? 120, line: 276 },
      keepNext: o.keepNext,
      indent: o.indent ? { left: o.indent } : undefined,
      children: typeof text === 'string' ? [run(text, o)] : text,
    })
  }

  function bullet(text: string, o: RunOpts = {}) {
    return new Paragraph({
      spacing: { after: 80, line: 276 },
      indent: { left: 340, hanging: 220 },
      children: [run(`•${NBSP}${NBSP}`, { color: NAVY }), run(text, o)],
    })
  }

  let chapterIndex = 0
  /** Numbered chapter heading (Heading 1). */
  function chapter(title: string, newPage = false) {
    chapterIndex += 1
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: newPage,
      keepNext: true,
      keepLines: true,
      spacing: { before: newPage ? 0 : 360, after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
      children: [run(`${chapterIndex}.${NBSP}${NBSP}${title}`)],
    })
  }
  /** Unnumbered Heading 1 (document info, contents, appendices). */
  function plainH1(title: string, newPage = false) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: newPage,
      keepNext: true,
      spacing: { before: newPage ? 0 : 360, after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
      children: [run(title)],
    })
  }
  function h2(title: string) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      keepLines: true,
      spacing: { before: 240, after: 100 },
      children: [run(title)],
    })
  }

  const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE }
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }

  type CellContent = string | (InstanceType<typeof Paragraph>)[]
  function cell(
    content: CellContent,
    width: number,
    o: { head?: boolean; fill?: string; bold?: boolean; color?: string; size?: number; center?: boolean; rowSpan?: number; keepNext?: boolean } = {},
  ) {
    const children =
      typeof content === 'string'
        ? content.split('\n').map(
            (line) =>
              new Paragraph({
                alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
                keepNext: o.keepNext,
                spacing: { after: 0, line: 260 },
                children: [
                  run(line, {
                    bold: o.head || o.bold,
                    size: o.size ?? 19,
                    color: o.head ? NAVY : o.color ?? INK,
                  }),
                ],
              }),
          )
        : content
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      rowSpan: o.rowSpan,
      verticalAlign: VerticalAlign.TOP,
      shading: o.head
        ? { type: ShadingType.CLEAR, color: 'auto', fill: HEAD_FILL }
        : o.fill
          ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill }
          : undefined,
      borders: { top: thin, bottom: thin, left: thin, right: thin },
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children,
    })
  }

  /** Table with a repeating header row; rows never split across pages. */
  function table(
    headers: string[] | null,
    widths: number[],
    rows: CellContent[][],
    opts: { firstColFill?: boolean; size?: number } = {},
  ) {
    const out: InstanceType<typeof TableRow>[] = []
    if (headers) {
      out.push(
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: headers.map((hd, i) => cell(hd, widths[i]!, { head: true, size: opts.size })),
        }),
      )
    }
    for (const r of rows) {
      out.push(
        new TableRow({
          cantSplit: true,
          children: r.map((c, i) =>
            cell(c, widths[i]!, {
              size: opts.size,
              ...(i === 0 && opts.firstColFill ? { fill: SOFT_FILL, bold: true } : {}),
            }),
          ),
        }),
      )
    }
    return new Table({
      width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      rows: out,
    })
  }
  /** Two-column label/value table. */
  function kv(rows: [string, string][], labelW = 2900) {
    return table(null, [labelW, W - labelW], rows, { firstColFill: true })
  }
  /** Quiet callout: light-blue box with a navy rule on the left. */
  function callout(paragraphs: InstanceType<typeof Paragraph>[]) {
    return new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: W, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, color: 'auto', fill: SOFT_FILL },
              borders: {
                top: none,
                bottom: none,
                right: none,
                left: { style: BorderStyle.SINGLE, size: 24, color: NAVY },
              },
              margins: { top: 120, bottom: 120, left: 200, right: 200 },
              children: paragraphs,
            }),
          ],
        }),
      ],
    })
  }
  const spacer = (after = 120) => new Paragraph({ spacing: { after }, children: [] })
  const small = (text: string, o: RunOpts & { before?: number } = {}) =>
    p(text, { size: 18, color: GRAY, before: o.before ?? 80, italic: o.italic, bold: o.bold })

  const children: FileChild[] = []

  // ——— COVER (StatPlan identity only — no government/BPS letterhead) ———
  const demoCoverNote = isDemo
    ? [p('Contoh ilustratif — proyek demo StatPlan', { size: 18, color: GRAY, before: 40, after: 0 })]
    : []
  children.push(
    new Paragraph({
      spacing: { before: 900, after: 80 },
      children: [new TextRun({ text: 'STATPLAN', bold: true, size: 24, color: NAVY, characterSpacing: 60 })],
    }),
    new Paragraph({
      spacing: { after: 2600 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 6 } },
      children: [run('Alat bantu perencanaan kegiatan statistik berbasis GSBPM 5.2', { size: 18, color: GRAY })],
    }),
    p('DRAFT PERENCANAAN', { bold: true, size: 52, color: NAVY, after: 0 }),
    p('KEGIATAN STATISTIK', { bold: true, size: 52, color: NAVY, after: 360 }),
    new Paragraph({
      spacing: { after: 360 },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: BAR_FILL, space: 10 } },
      indent: { left: 200 },
      children: [run(project.name, { bold: true, size: 32, color: INK })],
    }),
    p(`Penyelenggara: ${opd}`, { size: 21, color: INK, after: 60 }),
    p(`${jenisLabel(project.jenisKegiatan)} · ${KLASIFIKASI_LABEL[project.klasifikasi] ?? project.klasifikasi}`, {
      size: 21,
      color: INK,
      after: 60,
    }),
    p(`Periode: ${periode}`, { size: 21, color: INK, after: 2400 }),
    callout([
      p('DRAFT — BUKAN DOKUMEN RESMI BPS', { bold: true, size: 22, color: NAVY, after: 80 }),
      p(
        'Dokumen hasil perencanaan menggunakan StatPlan. Dokumen ini bukan dokumen resmi BPS dan tetap perlu ditinjau sesuai kebutuhan serta prosedur yang berlaku.',
        { size: 20, color: INK, after: 0 },
      ),
    ]),
    p(`Dibuat ${formatDateTime(generatedAt.toISOString())} · ${APP_VERSION}`, {
      size: 18,
      color: GRAY,
      before: 480,
      after: 40,
    }),
    p('Kerangka: GSBPM 5.2 · Rujukan: Materi Proses Bisnis Statistik BPS', { size: 18, color: GRAY, after: 0 }),
    ...demoCoverNote,
  )

  // ——— DOCUMENT CONTROL + CONTENTS ———
  const statusDokumen = 'Draft — belum ditinjau; bukan dokumen resmi BPS'
  children.push(
    plainH1('Informasi Dokumen', true),
    kv([
      ['Nama kegiatan', project.name],
      ['Jenis kegiatan', jenisLabel(project.jenisKegiatan)],
      ['Klasifikasi', KLASIFIKASI_LABEL[project.klasifikasi] ?? project.klasifikasi],
      ['Penyelenggara', opd],
      ['Periode', periode],
      ['Versi draft', `Ekspor ${formatDateTime(generatedAt.toISOString())} (data proyek terakhir diperbarui ${formatDate(project.updatedAt)})`],
      ['Tanggal dibuat', formatDate(generatedAt.toISOString())],
      ['Status', statusDokumen],
      ['Versi StatPlan', APP_VERSION],
      ...(isDemo ? ([['Sumber data', 'Proyek demo StatPlan — contoh ilustratif']] as [string, string][]) : []),
    ]),
  )

  const toc: string[] = [
    '1.  Ringkasan Perencanaan',
    '2.  Informasi Kegiatan',
    '3.  Kebutuhan dan Tujuan',
    '4.  Saran Awal StatPlan',
    '5.  Perancangan Pengumpulan',
    '6.  Variabel',
    '7.  Indikator',
    '8.  Instrumen',
    '9.  Timeline',
    '10. Pemeriksaan Sumber / Portal Rujukan',
    '11. Ringkasan GSBPM',
    '12. Ringkasan Validasi',
    '13. Draft Metadata',
    '14. Catatan dan Batasan',
    'Lampiran A — Checklist GSBPM 5.2',
    ...(project.questionnaire.length && project.jenisKegiatan !== 'kompromin'
      ? ['Lampiran B — Draf Instrumen']
      : []),
  ]
  children.push(
    plainH1('Daftar Isi'),
    ...toc.map((t) =>
      new Paragraph({
        spacing: { after: 70 },
        border: { bottom: { style: BorderStyle.DOTTED, size: 2, color: LINE, space: 2 } },
        children: [run(t, { size: 21, color: t.startsWith('Lampiran') ? GRAY : INK })],
      }),
    ),
  )

  // ——— 1. RINGKASAN PERENCANAAN ———
  const kebutuhanUtama = guided('gsbpm-1.1', 'masalah') || project.description || 'Belum diisi'
  const outputs = guidedOutputs()
  const outputSummary = outputs.length
    ? outputs.join('; ')
    : project.indicators.length
      ? `Indikator yang direncanakan: ${project.indicators.map((i) => i.name).join('; ')}`
      : 'Belum diisi'
  const caraRingkas = [
    jenisLabel(project.design.caraPengumpulan || project.jenisKegiatan),
    project.design.metodePengumpulan ? METODE_LABEL[project.design.metodePengumpulan] : '',
    project.design.modaPengumpulan ? project.design.modaPengumpulan.toUpperCase() : '',
  ]
    .filter(Boolean)
    .join(' · ')
  const tujuanRingkas = project.objectives.length
    ? project.objectives[0]! +
      (project.objectives.length > 1 ? ` (dan ${project.objectives.length - 1} tujuan lain — Bagian 3)` : '')
    : 'Belum diisi'

  children.push(
    chapter('Ringkasan Perencanaan', true),
    kv([
      ['Kebutuhan utama', kebutuhanUtama],
      ['Tujuan', tujuanRingkas],
      ['Output', outputSummary],
      ['Metode / cara pengumpulan', caraRingkas || 'Belum diisi'],
      ['Periode', periode],
      ['Status', `${statusDokumen}. Status proyek di StatPlan: ${statusLabel(project.status)}.`],
    ]),
    h2('Status Perencanaan'),
    callout([
      p('STATUS PERENCANAAN', { bold: true, size: 18, color: NAVY, after: 60 }),
      p(
        [
          run('Kelengkapan checklist StatPlan: ', { size: 21 }),
          run(`${progress.pct}%`, { bold: true, size: 28, color: NAVY }),
          run(`  (${progress.done} dari ${progress.total} butir wajib ditandai)`, { size: 19, color: GRAY }),
        ],
        { after: 100 },
      ),
      p(
        'Kelengkapan ini menunjukkan status checklist internal StatPlan untuk menghasilkan draft, bukan bukti bahwa kegiatan statistik telah selesai atau memperoleh persetujuan resmi.',
        { size: 19, color: INK, after: 0 },
      ),
    ]),
  )

  // ——— 2. INFORMASI KEGIATAN + DASAR PERENCANAAN ———
  children.push(
    chapter('Informasi Kegiatan'),
    kv([
      ['Nama kegiatan', project.name],
      ['Topik', project.topik || 'Belum diisi'],
      ['Jenis kegiatan', jenisLabel(project.jenisKegiatan)],
      ['Klasifikasi', KLASIFIKASI_LABEL[project.klasifikasi] ?? project.klasifikasi],
      ['Penyelenggara', opd],
      ['Penanggung jawab', meta.kegiatan.penanggung_jawab?.trim() || 'Belum diisi'],
      ['Cakupan wilayah', meta.kegiatan.cakupan_wilayah?.trim() || 'Belum diisi'],
      ['Periode', periode],
      ['Estimasi anggaran', project.estimasiAnggaran?.trim() || 'Belum diisi'],
    ]),
    h2('Dasar Perencanaan'),
    bullet('StatPlan memakai Generic Statistical Business Process Model (GSBPM) 5.2 sebagai kerangka perencanaan: 8 fase dan 44 subproses.'),
    bullet('Sumber materi: Materi Proses Bisnis Statistik BPS. Rujukan halaman pada dokumen ini mengikuti nomor halaman PDF materi tersebut (mis. Specify Need Hal. 11–16, Design Hal. 17–23).'),
    bullet('StatPlan adalah alat bantu perencanaan dan pembelajaran; StatPlan tidak menggantikan prosedur, pedoman, atau keputusan BPS.'),
    bullet('Seluruh isi dokumen ini adalah draft yang disusun dari data proyek di StatPlan.'),
  )

  // ——— 3. KEBUTUHAN DAN TUJUAN ———
  const belum = (sp: string) => `Belum diuraikan di StatPlan (subproses ${sp}).`
  const kebutuhan =
    [guided('gsbpm-1.1', 'mengapa'), guided('gsbpm-1.1', 'kondisi')].filter(Boolean).join('\n') ||
    project.description ||
    belum('1.1')
  const pengguna =
    [guided('gsbpm-1.2', 'pengguna'), guided('gsbpm-1.1', 'siapa')].filter(Boolean).join('\n') ||
    belum('1.2')
  children.push(
    chapter('Kebutuhan dan Tujuan'),
    kv(
      [
        ['A. Kebutuhan', kebutuhan],
        ['B. Permasalahan', guided('gsbpm-1.1', 'masalah') || belum('1.1')],
        [
          'C. Tujuan',
          project.objectives.length
            ? project.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')
            : belum('1.3'),
        ],
        [
          'D. Output yang diharapkan',
          outputs.length
            ? outputs.join('\n')
            : project.indicators.length
              ? `Indikator yang direncanakan (Bagian 7):\n${project.indicators.map((i) => `• ${i.name}`).join('\n')}`
              : belum('1.3'),
        ],
        ['E. Pengguna hasil', pengguna],
      ],
      2600,
    ),
  )
  const keperluan = guided('gsbpm-1.2', 'keperluan')
  if (keperluan) {
    children.push(spacer(80), callout([p(`Keperluan pengguna: ${keperluan}`, { size: 19, after: 0 })]))
  }

  // ——— 4. SARAN AWAL STATPLAN ———
  // Rule-based suggestion only — never a confidence score or an official recommendation.
  children.push(chapter('Saran Awal StatPlan'))
  const chosen = jenisLabel(project.jenisKegiatan)
  const saran: InstanceType<typeof Paragraph>[] = []
  if (project.aiRecommendation) {
    saran.push(
      p([run('Saran awal metode: ', { size: 21 }), run(jenisLabel(project.aiRecommendation.jenis), { bold: true, size: 26, color: NAVY })], {
        after: 60,
      }),
    )
    if (project.aiRecommendation.jenis !== project.jenisKegiatan) {
      saran.push(p(`Jenis kegiatan yang dipilih pada proyek: ${chosen}`, { size: 20, after: 60 }))
    }
  } else {
    saran.push(p(`Jenis kegiatan yang dipilih pada proyek: ${chosen}`, { bold: true, size: 21, after: 60 }))
    saran.push(p('StatPlan belum menyimpan saran awal untuk proyek ini.', { size: 19, color: GRAY, after: 60 }))
  }
  saran.push(
    p(
      'Saran ini dihasilkan berdasarkan aturan sederhana dalam StatPlan untuk membantu tahap perencanaan dan bukan merupakan keputusan atau rekomendasi resmi BPS.',
      { size: 19, italic: true, color: INK, after: 0 },
    ),
  )
  children.push(callout(saran))
  if (project.aiRecommendation?.rationale.length) {
    children.push(h2('Alasan saran'), ...project.aiRecommendation.rationale.map((r) => bullet(r)))
  }
  if (project.aiRecommendation?.groundedRefs.length) {
    children.push(h2('Rujukan materi'), ...project.aiRecommendation.groundedRefs.map((r) => bullet(r, { size: 19, color: GRAY })))
  }

  // ——— 5. PERANCANGAN PENGUMPULAN (+ bahan rekomendasi untuk sektoral) ———
  const survei = project.jenisKegiatan === 'survei'
  const tidakBerlaku = `Tidak berlaku untuk ${chosen.toLowerCase()}`
  const frame = guided('gsbpm-2.4', 'kerangka_sampel')
  children.push(
    chapter('Perancangan Pengumpulan'),
    small('Design 2.3–2.4 · Materi Proses Bisnis Hal. 20–21', { before: 0 }),
    table(
      ['Aspek', 'Rancangan'],
      [2900, W - 2900],
      [
        ['Cara pengumpulan', jenisLabel(project.design.caraPengumpulan || project.jenisKegiatan)],
        ['Metode pengumpulan', project.design.metodePengumpulan ? METODE_LABEL[project.design.metodePengumpulan]! : 'Belum diisi'],
        ['Moda pengumpulan', project.design.modaPengumpulan ? project.design.modaPengumpulan.toUpperCase() : 'Belum diisi'],
        ['Metode sampling', survei ? project.design.metodeSampling || 'Belum diisi' : tidakBerlaku],
        ['Kerangka sampel (frame)', survei ? frame || 'Belum dicatat di StatPlan (subproses 2.4)' : tidakBerlaku],
        ['Ukuran sampel', survei ? project.design.ukuranSampel || 'Belum diisi' : tidakBerlaku],
      ],
      { firstColFill: true },
    ),
  )
  if (project.klasifikasi === 'sektoral') {
    const r = project.rekomendasiBps
    const catatanLabel = isDemo ? 'Catatan (contoh ilustratif — status demo)' : 'Catatan pengguna'
    children.push(
      h2('Draf informasi untuk proses pengajuan rekomendasi'),
      small('Design 2.6 · Materi Proses Bisnis Hal. 17 & 23', { before: 0 }),
      kv([
        ['Nama kegiatan', r.namaKegiatan || 'Belum diisi'],
        ['Penyelenggara', r.penyelenggara || 'Belum diisi'],
        ['Tujuan', r.tujuan || 'Belum diisi'],
        ['Periode', r.periode || 'Belum diisi'],
        ['Status', 'Belum diverifikasi — StatPlan tidak mencatat bukti pengajuan atau keputusan BPS.'],
        ...(r.catatan ? ([[catatanLabel, r.catatan]] as [string, string][]) : []),
      ]),
      small(
        'Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS pada fase Perancangan. Bagian ini hanya bahan kerja; pengajuan dilakukan melalui prosedur yang berlaku.',
      ),
    )
  }

  // ——— 6. VARIABEL ———
  children.push(chapter('Variabel'))
  if (project.variables.length) {
    // Widest room for definition and missing-value rule so rows stay short.
    const vw = [520, 1450, 2250, 1050, 820, 1300]
    vw.push(W - vw.reduce((a, b) => a + b, 0))
    children.push(
      table(
        ['No.', 'Variabel', 'Definisi', 'Tipe / skala', 'Satuan', 'Contoh', 'Nilai hilang'],
        vw,
        project.variables.map((v, i) => [
          String(i + 1),
          v.name,
          v.definition || '—',
          `${TYPE_LABEL[v.type] ?? v.type}${v.scale ? `\n${v.scale}` : ''}`,
          v.unit?.trim() || '—',
          v.exampleValue?.trim() || '—',
          v.missingValueRule?.trim() || '—',
        ]),
        { size: 18 },
      ),
      small(`${project.variables.length} variabel. Tanda “—” berarti belum diisi di StatPlan.`),
    )
  } else {
    children.push(p('Belum ada variabel pada proyek ini.', { color: GRAY }))
  }

  // ——— 7. INDIKATOR ———
  children.push(chapter('Indikator'))
  if (project.indicators.length) {
    const indName = meta.indikator.nama_indikator?.trim().toLowerCase()
    const iw = [2000, 2300, 2400, 1100]
    iw.push(W - iw.reduce((a, b) => a + b, 0))
    children.push(
      table(
        ['Indikator', 'Definisi', 'Rumus', 'Satuan', 'Variabel terkait'],
        iw,
        project.indicators.map((ind) => {
          // Definition/unit live in the MS-Ind draft, which describes one indicator.
          const match = indName && ind.name.trim().toLowerCase() === indName
          return [
            ind.name,
            (match && meta.indikator.definisi_indikator?.trim()) || '—',
            ind.formula || '—',
            (match && meta.indikator.satuan_indikator?.trim()) || '—',
            ind.relatedVariables.length ? ind.relatedVariables.join('\n') : '—',
          ]
        }),
      ),
      small('Definisi dan satuan diambil dari draft metadata MS-Ind bila tersedia; “—” berarti belum diisi.'),
    )
  } else {
    children.push(p('Belum ada indikator pada proyek ini.', { color: GRAY }))
  }

  // ——— 8. INSTRUMEN ———
  const hasQuestionnaire = project.jenisKegiatan !== 'kompromin' && project.questionnaire.length > 0
  children.push(chapter('Instrumen'))
  if (project.jenisKegiatan === 'kompromin') {
    children.push(
      p('Kompilasi produk administrasi tidak memakai kuesioner lapangan. Instrumen berupa pemetaan variabel ke sumber data administratif:'),
      table(
        ['Variabel', 'Sumber data'],
        [3400, W - 3400],
        project.variables.map((v) => [v.name, v.source?.trim() || 'Belum diisi']),
      ),
    )
  } else if (hasQuestionnaire) {
    const count = (t: string) => project.questionnaire.filter((q) => q.type === t).length
    children.push(
      p(
        `Draf instrumen berisi ${project.questionnaire.length} pertanyaan. Rincian lengkap pertanyaan dan pilihan jawaban tercantum pada Lampiran B.`,
        { keepNext: true },
      ),
      table(
        ['Tipe pertanyaan', 'Jumlah'],
        [W - 2000, 2000],
        (['tertutup', 'skala', 'terbuka'] as const)
          .filter((t) => count(t) > 0)
          .map((t) => [Q_TYPE_LABEL[t]!, String(count(t))]),
      ),
    )
  } else {
    children.push(p('Draf instrumen belum disusun pada proyek ini.', { color: GRAY }))
  }

  // ——— 9. TIMELINE ———
  children.push(chapter('Timeline'))
  if (project.timeline.length) {
    const dates =
      session && session.phasePlan.length === project.timeline.length ? session.phasePlan : null
    const phaseName = (id: string) => {
      const ph = GSBPM_PHASES.find((x) => x.id === id)
      return ph ? `${ph.code}. ${ph.titleId}` : id
    }
    children.push(
      table(
        ['Fase', 'Periode', 'Kegiatan utama'],
        [2700, 2900, W - 5600],
        project.timeline.map((t, i) => [
          phaseName(t.phaseId),
          dates?.[i]
            ? `${formatDateID(dates[i]!.startISO)} – ${formatDateID(dates[i]!.endISO)}\n(minggu ${t.startWeek}–${t.endWeek})`
            : `Minggu ${t.startWeek}–${t.endWeek}`,
          t.title,
        ]),
      ),
    )
    // Simplified Gantt: one column per bucket of weeks, shaded where the phase runs.
    const maxWeek = Math.max(...project.timeline.map((t) => t.endWeek))
    const per = Math.max(1, Math.ceil(maxWeek / 13))
    const buckets = Math.ceil(maxWeek / per)
    const labelW = 2300
    const bw = Math.floor((W - labelW) / buckets)
    const gw = [labelW, ...Array.from({ length: buckets }, (_, i) => (i === buckets - 1 ? W - labelW - bw * (buckets - 1) : bw))]
    const bucketLabel = (b: number) => {
      const s = b * per + 1
      const e = Math.min(maxWeek, (b + 1) * per)
      return per === 1 || s === e ? String(s) : `${s}–${e}`
    }
    const gRows = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: gw.map((w, i) => cell(i === 0 ? 'Minggu ke-' : bucketLabel(i - 1), w, { head: true, size: 16, center: i > 0, keepNext: true })),
      }),
      // keepNext on every row keeps the chart and its note on one page.
      ...project.timeline.map((t) => {
        return new TableRow({
            cantSplit: true,
            children: gw.map((w, i) => {
              if (i === 0) return cell(phaseName(t.phaseId), w, { size: 17, keepNext: true })
              const s = (i - 1) * per + 1
              const e = i * per
              const active = t.startWeek <= e && t.endWeek >= s
              return cell('', w, { fill: active ? BAR_FILL : undefined, keepNext: true })
            }),
          })
      }),
    ]
    children.push(
      h2('Gambaran jadwal'),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: gw, layout: TableLayoutType.FIXED, rows: gRows }),
      small('Contoh jadwal perencanaan — bukan durasi wajib BPS.', { italic: true }),
    )
  } else {
    children.push(p('Belum ada timeline pada proyek ini.', { color: GRAY }))
  }

  // ——— 10. PEMERIKSAAN SUMBER / PORTAL RUJUKAN ———
  const portal = project.portalSdi
  const checkedDate = portal.checkedAt ? formatDate(portal.checkedAt) : '—'
  const portalStatus = (ok: boolean) => (ok ? 'Dicatat sudah dicek' : 'Belum dicatat')
  children.push(
    chapter('Pemeriksaan Sumber / Portal Rujukan'),
    small('Specify Need 1.5 · Materi Proses Bisnis Hal. 15', { before: 0 }),
    (() => {
      // One note covers both portals, so it spans both rows.
      const pw = [2400, 1800, 1600, W - 5800]
      return new Table({
        width: { size: W, type: WidthType.DXA },
        columnWidths: pw,
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: ['Portal', 'Status', 'Tanggal pemeriksaan', 'Catatan'].map((hd, i) => cell(hd, pw[i]!, { head: true })),
          }),
          new TableRow({
            cantSplit: true,
            children: [
              cell('SIRuSa\nsirusa.web.bps.go.id', pw[0]!, { fill: SOFT_FILL, bold: true }),
              cell(portalStatus(portal.sirusaChecked), pw[1]!),
              cell(portal.sirusaChecked ? checkedDate : '—', pw[2]!),
              cell(portal.notes?.trim() || '—', pw[3]!, { rowSpan: 2 }),
            ],
          }),
          new TableRow({
            cantSplit: true,
            children: [
              cell('Romantik\nromantik.bps.go.id', pw[0]!, { fill: SOFT_FILL, bold: true }),
              cell(portalStatus(portal.romantikChecked), pw[1]!),
              cell(portal.romantikChecked ? checkedDate : '—', pw[2]!),
            ],
          }),
        ],
      })
    })(),
    small(
      isDemo
        ? 'Contoh ilustratif (data demo): tanggal dan catatan pemeriksaan tidak berasal dari pemeriksaan portal yang sesungguhnya.'
        : 'Status di atas adalah catatan pengguna di StatPlan. StatPlan tidak memeriksa atau memverifikasi portal secara otomatis.',
      { italic: true },
    ),
  )

  // ——— 11. RINGKASAN GSBPM ———
  const phaseRef = (phase: (typeof GSBPM_PHASES)[number]) => {
    if (phase.pdfRef) return phase.pdfRef
    const nums = phase.subProcesses
      .flatMap((sp) => (sp.pdfRef?.match(/\d+/g) ?? []).map(Number))
      .filter((n) => n > 0)
    return nums.length ? `Hal. ${Math.min(...nums)}–${Math.max(...nums)}` : ''
  }
  children.push(
    chapter('Ringkasan GSBPM'),
    table(
      ['Fase', 'Subproses', 'Status checklist', 'Output kunci (GSBPM)'],
      [3000, 1100, 1900, W - 6000],
      GSBPM_PHASES.map((phase) => {
        const visible = phase.subProcesses.filter((sp) => isSubProcessVisible(sp.skipWhen, project.jenisKegiatan))
        const pr = computePhaseProgress(phase.id, project.jenisKegiatan, project.klasifikasi, project.checklistState)
        const status =
          pr.total === 0
            ? 'Tidak ada butir wajib'
            : pr.done === pr.total
              ? `Lengkap (${pr.done}/${pr.total})`
              : pr.done === 0
                ? `Belum ditandai (0/${pr.total})`
                : `Sebagian (${pr.done}/${pr.total})`
        const keyOutputs = [...new Set(visible.flatMap((sp) => sp.outputs))].slice(0, 2)
        return [
          `${phase.code}. ${phase.title}\n${phase.titleId} · ${phaseRef(phase)}`,
          visible.length === phase.subProcesses.length
            ? String(phase.subProcesses.length)
            : `${visible.length} dari ${phase.subProcesses.length}`,
          status,
          keyOutputs.join('\n') || '—',
        ]
      }),
    ),
    small(
      'Status menunjukkan butir checklist wajib yang ditandai di StatPlan, bukan pelaksanaan kegiatan. Rincian per subproses tercantum pada Lampiran A.',
    ),
  )

  // ——— 12. RINGKASAN VALIDASI ———
  children.push(chapter('Ringkasan Validasi'))
  children.push(
    table(
      ['Status', 'Temuan', 'Dampak', 'Tindakan'],
      [1500, 2500, 2900, W - 6900],
      issues.length
        ? issues.map((i) => {
            const g = guidanceFor(i.code, i.message)
            return [i.severity === 'error' ? 'Perlu dilengkapi' : 'Perlu diperhatikan', g.title, g.why, g.fix]
          })
        : [['Tidak ada temuan', 'Pemeriksaan kelengkapan StatPlan tidak menemukan kekurangan.', 'Draft memenuhi syarat minimum ekspor StatPlan.', 'Tinjau isi draft bersama pihak berwenang/ahli metodologi.']],
    ),
    small(
      'Ringkasan ini berasal dari pemeriksaan kelengkapan internal StatPlan (syarat ekspor: checklist wajib minimal 80%). Ini bukan validasi atau persetujuan resmi BPS.',
    ),
  )

  // ——— 13. DRAFT METADATA ———
  function metadataTable(title: string, fields: typeof MS_KEG_FIELDS, data: Record<string, string>): FileChild[] {
    return [
      h2(title),
      table(
        ['Atribut', 'Isian draft'],
        [3200, W - 3200],
        fields.map((f) => [f.label, data[f.key]?.trim() || '—']),
      ),
    ]
  }
  children.push(
    chapter('Draft Metadata', true),
    callout([
      p('DRAFT METADATA', { bold: true, size: 18, color: NAVY, after: 60 }),
      p(
        'Struktur metadata pada dokumen ini merupakan rancangan metadata yang perlu disesuaikan dan diverifikasi sesuai ketentuan yang berlaku.',
        { size: 19, after: 60 },
      ),
      p('Rujukan: struktur MS-Keg, MS-Var, dan MS-Ind menurut Peraturan BPS Nomor 5 Tahun 2020 (Materi Proses Bisnis, Hal. 58).', {
        size: 18,
        color: GRAY,
        after: 0,
      }),
    ]),
    ...metadataTable('MS-Keg — Metadata Kegiatan', MS_KEG_FIELDS, meta.kegiatan),
    ...metadataTable('MS-Var — Metadata Variabel', MS_VAR_FIELDS, meta.variabel),
    ...metadataTable('MS-Ind — Metadata Indikator', MS_IND_FIELDS, meta.indikator),
  )

  // ——— 14. CATATAN DAN BATASAN ———
  children.push(
    chapter('Catatan dan Batasan'),
    bullet('Dokumen ini adalah draft perencanaan yang disusun dengan bantuan StatPlan.'),
    bullet('Dokumen ini bukan dokumen resmi BPS dan tidak menyatakan persetujuan, rekomendasi, atau validasi dari BPS.'),
    bullet('Saran awal jenis kegiatan (Bagian 4) dihasilkan dari aturan sederhana dalam StatPlan, tanpa skor atau persentase, dan bukan keputusan resmi.'),
    bullet('Timeline (Bagian 9) adalah alat bantu perencanaan; durasinya bukan ketentuan BPS.'),
    bullet('Kelengkapan checklist dan ringkasan validasi adalah pemeriksaan internal StatPlan, bukan bukti pelaksanaan kegiatan.'),
    bullet('Status pemeriksaan portal dan bahan pengajuan rekomendasi adalah catatan pengguna yang belum diverifikasi.'),
    bullet('Seluruh isi perlu ditinjau dan disesuaikan oleh pihak yang berwenang/ahli metodologi sesuai kebutuhan dan prosedur yang berlaku.'),
    bullet('Rujukan halaman mengacu pada Materi Proses Bisnis Statistik BPS (PDF): portal rujukan Hal. 15; rekomendasi kegiatan statistik Hal. 17 & 23; metadata Hal. 58.'),
    ...(isDemo
      ? [bullet('Proyek ini adalah proyek demo StatPlan. Nama instansi, tanggal, status, dan catatan di dalamnya adalah contoh ilustratif.', { bold: true })]
      : []),
    small(`Disusun oleh ${APP_VERSION} pada ${formatDateTime(generatedAt.toISOString())}.`, { before: 240 }),
  )

  // ——— LAMPIRAN A — CHECKLIST GSBPM 5.2 ———
  children.push(
    plainH1('Lampiran A — Checklist GSBPM 5.2', true),
    p('✓ = butir ditandai di StatPlan   ☐ = belum ditandai   (wajib) = butir wajib untuk ekspor', { size: 18, color: GRAY }),
  )
  for (const phase of GSBPM_PHASES) {
    children.push(h2(`Fase ${phase.code} — ${phase.title} (${phase.titleId}) · ${phaseRef(phase)}`))
    const rows: CellContent[][] = []
    for (const sp of phase.subProcesses) {
      if (!isSubProcessVisible(sp.skipWhen, project.jenisKegiatan)) {
        rows.push([`${sp.code} ${sp.title}`, 'Tidak berlaku', `Tidak berlaku untuk ${chosen.toLowerCase()}.`])
        continue
      }
      const items = sp.checklist.filter((it) => isChecklistVisible(it, project.jenisKegiatan, project.klasifikasi))
      const done = items.filter((it) => project.checklistState[it.id]).length
      const lines = items.map(
        (it) => `${project.checklistState[it.id] ? '✓' : '☐'} ${it.label}${it.required ? ' (wajib)' : ''}`,
      )
      const ev = session?.evidenceStates[`gsbpm-${sp.code}`]
      const evNotes = ev
        ? Object.values(ev)
            .filter((e) => e.status === 'sudah' && e.note?.trim())
            .map((e) => `Catatan bukti: ${e.note.trim()}`)
        : []
      rows.push([
        `${sp.code} ${sp.title}${sp.pdfRef ? `\n${sp.pdfRef}` : ''}`,
        items.length === 0 ? '—' : done === items.length ? `Lengkap (${done}/${items.length})` : `${done}/${items.length} ditandai`,
        [...lines, ...evNotes].join('\n') || '—',
      ])
    }
    children.push(table(['Subproses', 'Status', 'Butir checklist dan catatan'], [2500, 1400, W - 3900], rows, { size: 18 }))
  }

  // ——— LAMPIRAN B — DRAF INSTRUMEN ———
  if (hasQuestionnaire) {
    children.push(plainH1('Lampiran B — Draf Instrumen', true))
    // Group by a letter prefix in the question number (e.g. "A1") when the project uses one.
    const groups = new Map<string, typeof project.questionnaire>()
    for (const q of project.questionnaire) {
      const key = /^[A-Za-z]/.test(q.number) ? q.number.match(/^[A-Za-z]+/)![0].toUpperCase() : ''
      groups.set(key, [...(groups.get(key) ?? []), q])
    }
    const qw = [700, 4600, 1200]
    qw.push(W - qw.reduce((a, b) => a + b, 0))
    for (const [key, qs] of groups) {
      if (key) children.push(h2(`Bagian ${key}`))
      children.push(
        table(
          ['No.', 'Pertanyaan', 'Tipe', 'Pilihan jawaban'],
          qw,
          qs.map((q) => [q.number, q.text, Q_TYPE_LABEL[q.type] ?? q.type, q.options?.length ? q.options.join('\n') : '—']),
        ),
      )
    }
    children.push(small('Draf instrumen perlu diuji coba dan disempurnakan sebelum digunakan (Build 3.1 & 3.3).'))
  }

  // ——— header / footer ———
  const headerRun = (text: string) => new TextRun({ text, size: 16, color: GRAY })
  const header = (width: number) =>
    new Header({
      children: [
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: width }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
          children: [
            new TextRun({ text: 'STATPLAN', size: 16, bold: true, color: NAVY, characterSpacing: 30 }),
            headerRun(`\t${project.name.length > 70 ? `${project.name.slice(0, 67)}…` : project.name}`),
          ],
        }),
      ],
    })
  const footer = (width: number) =>
    new Footer({
      children: [
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: width }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
          spacing: { after: 0 },
          children: [
            headerRun('StatPlan · Draft Perencanaan Kegiatan Statistik'),
            headerRun('\tHalaman '),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY }),
            headerRun(' dari '),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY }),
          ],
        }),
        new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: 'Bukan dokumen resmi BPS', size: 16, bold: true, color: GRAY })],
        }),
      ],
    })
  const doc = new Document({
    creator: 'StatPlan',
    title: `Draft Perencanaan — ${project.name}`,
    description: 'Draft perencanaan kegiatan statistik (GSBPM 5.2) — bukan dokumen resmi BPS',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 21, color: INK } },
        heading1: {
          run: { font: 'Calibri', size: 30, bold: true, color: NAVY },
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        heading2: {
          run: { font: 'Calibri', size: 23, bold: true, color: NAVY },
          paragraph: { spacing: { before: 240, after: 100 } },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true, // cover page carries no header/footer
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: 1300, right: MARGIN, bottom: 1200, left: MARGIN, header: 560, footer: 520 },
          },
        },
        headers: { default: header(W), first: new Header({ children: [new Paragraph({ children: [] })] }) },
        footers: { default: footer(W), first: new Footer({ children: [new Paragraph({ children: [] })] }) },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safe = project.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')
  saveAs(blob, `StatPlan-${safe || 'proyek'}.docx`)
}
