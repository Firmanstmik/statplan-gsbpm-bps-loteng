import type { Project } from '@/domain/types'
import {
  GSBPM_PHASES,
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
import { jenisLabel } from '@/lib/utils'
import type { FileChild } from 'docx'

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
  } = await import('docx')
  const { saveAs } = await import('file-saver')

  const generatedAt = new Date()
  const issues = validateProject(project)
  const progress = computeProjectProgress(
    project.jenisKegiatan,
    project.klasifikasi,
    project.checklistState,
  )
  const opd =
    project.rekomendasiBps.penyelenggara ||
    project.metadata.kegiatan.penyelenggara ||
    'OPD penyelenggara'

  function p(text: string, opts?: { bold?: boolean; size?: number; before?: number; center?: boolean }) {
    return new Paragraph({
      alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 120, before: opts?.before ?? 0 },
      children: [
        new TextRun({
          text,
          bold: opts?.bold,
          size: opts?.size ?? 22,
          font: 'Calibri',
        }),
      ],
    })
  }

  function h(
    text: string,
    level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1,
  ) {
    return new Paragraph({
      heading: level,
      spacing: { before: 360, after: 160 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: 'Calibri',
          size: level === HeadingLevel.HEADING_1 ? 32 : 26,
        }),
      ],
    })
  }

  function cell(text: string, width = 3120, opts?: { bold?: boolean; shade?: string }) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: opts?.shade ? { fill: opts.shade } : undefined,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text, size: 20, font: 'Calibri', bold: opts?.bold })],
        }),
      ],
    })
  }

  function metadataTable(title: string, fields: typeof MS_KEG_FIELDS, data: Record<string, string>): FileChild[] {
    const rows = [
      new TableRow({
        children: [
          cell('Atribut', 4680, { bold: true, shade: 'E8EEF4' }),
          cell('Nilai', 4680, { bold: true, shade: 'E8EEF4' }),
        ],
      }),
      ...fields.map(
        (f) =>
          new TableRow({
            children: [
              cell(f.label, 4680),
              cell(data[f.key]?.trim() || '—', 4680),
            ],
          }),
      ),
    ]
    return [h(title, HeadingLevel.HEADING_3), new Table({ width: { size: 9360, type: WidthType.DXA }, rows })]
  }

  const cover: FileChild[] = [
    p('PEMERINTAH KABUPATEN LOMBOK TENGAH', { bold: true, size: 24, center: true, before: 200 }),
    p('Badan Pusat Statistik · StatPlan', { size: 20, center: true }),
    p('────────────────────────────────────────', { size: 18, center: true, before: 200 }),
    p('DRAF DOKUMEN PERENCANAAN', { bold: true, size: 36, center: true, before: 600 }),
    p('KEGIATAN STATISTIK', { bold: true, size: 36, center: true }),
    p(project.name, { bold: true, size: 28, center: true, before: 400 }),
    p(`Penyelenggara: ${opd}`, { size: 22, center: true, before: 200 }),
    p(`Jenis: ${jenisLabel(project.jenisKegiatan)} · Klasifikasi: ${project.klasifikasi}`, {
      size: 20,
      center: true,
    }),
    p(`Tanggal generate: ${generatedAt.toLocaleString('id-ID')}`, { size: 18, center: true, before: 400 }),
    p('Status: DRAF — memerlukan validasi BPS', { bold: true, size: 20, center: true, before: 200 }),
    p(
      'Dokumen ini dihasilkan oleh StatPlan berdasarkan GSBPM 5.2 (Materi Proses Bisnis Statistik BPS). Bukan dokumen resmi hingga disahkan melalui prosedur yang berlaku.',
      { size: 18, center: true, before: 300 },
    ),
  ]

  const tocItems = [
    '1. Informasi Proyek',
    '2. Ringkasan Validasi',
    '3. Pemeriksaan Portal Rujukan Statistik',
    '4. Rekomendasi Jenis Kegiatan',
    '5. Tujuan Kegiatan',
    '6. Perancangan Pengumpulan',
    '7. Variabel',
    '8. Indikator',
    '9. Instrumen / Pemetaan',
    '10. Rekomendasi ke BPS (sektoral)',
    '11. Timeline',
    '12. Ringkasan Checklist GSBPM',
    '13. Metadata Statistik',
  ]

  const children: FileChild[] = [
    ...cover,
    h('Daftar Isi', HeadingLevel.HEADING_2),
    ...tocItems.map((item) => p(item, { size: 20 })),
    p(`Dokumen digenerate: ${generatedAt.toLocaleString('id-ID')}`, { size: 18, before: 200 }),

    h('1. Informasi Proyek', HeadingLevel.HEADING_2),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            cell('Atribut', 3120, { bold: true, shade: 'E8EEF4' }),
            cell('Nilai', 6240, { bold: true, shade: 'E8EEF4' }),
          ],
        }),
        ...[
          ['Nama kegiatan', project.name],
          ['Topik', project.topik],
          ['Klasifikasi', project.klasifikasi],
          ['Jenis kegiatan', jenisLabel(project.jenisKegiatan)],
          ['Estimasi anggaran', project.estimasiAnggaran?.trim() || '—'],
          ['Penyelenggara', opd],
          ['Deskripsi', project.description],
          ['Progres checklist wajib', `${progress.done}/${progress.total} (${progress.pct}%)`],
        ].map(
          ([k, v]) =>
            new TableRow({
              children: [cell(k, 3120), cell(v, 6240)],
            }),
        ),
      ],
    }),

    h('2. Ringkasan Validasi', HeadingLevel.HEADING_2),
    p(
      issues.length === 0
        ? 'Tidak ada temuan validasi. Proyek memenuhi syarat minimum ekspor draf.'
        : `Terdapat ${issues.length} temuan validasi pada saat generate:`,
    ),
    ...issues.map((i) =>
      p(`• [${i.severity.toUpperCase()}] ${i.code}: ${i.message}`, { size: 18 }),
    ),
    p(`Checklist wajib: ${progress.pct}% (minimal ekspor 80%).`, { before: 120 }),

    h('3. Pemeriksaan Portal Rujukan Statistik', HeadingLevel.HEADING_2),
    p(`sirusa.web.bps.go.id: ${project.portalSdi.sirusaChecked ? 'Sudah dicek' : 'Belum dicek'}`),
    p(`romantik.bps.go.id: ${project.portalSdi.romantikChecked ? 'Sudah dicek' : 'Belum dicek'}`),
    p(
      `Status lengkap: ${
        project.portalSdi.sirusaChecked && project.portalSdi.romantikChecked
          ? 'Sudah dikonfirmasi'
          : 'Belum lengkap'
      }`,
    ),
    ...(project.portalSdi.notes ? [p(`Catatan: ${project.portalSdi.notes}`)] : []),

    h('4. Rekomendasi Jenis Kegiatan', HeadingLevel.HEADING_2),
  ]

  if (project.aiRecommendation) {
    children.push(
      p(
        `Rekomendasi: ${jenisLabel(project.aiRecommendation.jenis)} (keyakinan ${Math.round(project.aiRecommendation.confidence * 100)}%)`,
      ),
    )
    for (const r of project.aiRecommendation.rationale) {
      children.push(p(`• ${r}`))
    }
    children.push(p('Rujukan modul:', { bold: true, size: 18 }))
    for (const ref of project.aiRecommendation.groundedRefs) {
      children.push(p(`— ${ref}`, { size: 18 }))
    }
  } else {
    children.push(p('Tidak ada catatan rekomendasi otomatis tersimpan.'))
  }

  children.push(h('5. Tujuan Kegiatan', HeadingLevel.HEADING_2))
  for (const o of project.objectives) children.push(p(`• ${o}`))

  children.push(h('6. Perancangan Pengumpulan (Design 2.3)', HeadingLevel.HEADING_2))
  children.push(p(`Cara pengumpulan: ${project.design.caraPengumpulan || '—'}`))
  if (project.design.metodePengumpulan) {
    children.push(p(`Metode: ${project.design.metodePengumpulan.replace('_', ' ')}`))
  }
  if (project.design.modaPengumpulan) {
    children.push(p(`Moda: ${project.design.modaPengumpulan.toUpperCase()}`))
  }
  if (project.jenisKegiatan === 'survei') {
    children.push(p(`Metode sampling: ${project.design.metodeSampling || '—'}`))
    children.push(p(`Ukuran sampel: ${project.design.ukuranSampel || '—'}`))
  }

  children.push(h('7. Variabel', HeadingLevel.HEADING_2))
  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            cell('Nama', 2000, { bold: true, shade: 'E8EEF4' }),
            cell('Definisi', 3200, { bold: true, shade: 'E8EEF4' }),
            cell('Tipe / skala', 1600, { bold: true, shade: 'E8EEF4' }),
            cell('Contoh / missing', 2560, { bold: true, shade: 'E8EEF4' }),
          ],
        }),
        ...project.variables.map(
          (v) =>
            new TableRow({
              children: [
                cell(v.name, 2000),
                cell(`${v.definition}${v.unit ? ` (${v.unit})` : ''}`, 3200),
                cell(`${v.type}${v.scale ? ` / ${v.scale}` : ''}`, 1600),
                cell(
                  [v.exampleValue ? `Contoh: ${v.exampleValue}` : null, v.missingValueRule]
                    .filter(Boolean)
                    .join(' | ') || '—',
                  2560,
                ),
              ],
            }),
        ),
      ],
    }),
  )

  children.push(h('8. Indikator', HeadingLevel.HEADING_2))
  for (const i of project.indicators) {
    children.push(p(`• ${i.name}: ${i.formula}`))
  }

  if (project.jenisKegiatan !== 'kompromin' && project.questionnaire.length) {
    children.push(h('9. Draf Instrumen Pengumpulan', HeadingLevel.HEADING_2))
    for (const q of project.questionnaire) {
      children.push(p(`${q.number}. ${q.text} [${q.type}]`))
      if (q.options?.length) {
        children.push(p(`   Opsi: ${q.options.join(' / ')}`, { size: 18 }))
      }
    }
  }

  if (project.klasifikasi === 'sektoral') {
    children.push(h('10. Draf Rekomendasi Kegiatan Statistik ke BPS', HeadingLevel.HEADING_2))
    children.push(p(`Nama kegiatan: ${project.rekomendasiBps.namaKegiatan}`))
    children.push(p(`Penyelenggara: ${project.rekomendasiBps.penyelenggara || '—'}`))
    children.push(p(`Tujuan: ${project.rekomendasiBps.tujuan || '—'}`))
    children.push(p(`Periode: ${project.rekomendasiBps.periode || '—'}`))
    if (project.rekomendasiBps.catatan) {
      children.push(p(`Catatan: ${project.rekomendasiBps.catatan}`))
    }
  }

  children.push(h('11. Timeline Perencanaan (minggu)', HeadingLevel.HEADING_2))
  for (const t of project.timeline) {
    children.push(p(`• Minggu ${t.startWeek}–${t.endWeek}: ${t.title}`))
  }

  children.push(h('12. Ringkasan Checklist GSBPM 5.2', HeadingLevel.HEADING_2))
  children.push(
    p(
      `Item wajib selesai: ${progress.done} dari ${progress.total} (${progress.pct}%). Detail per fase:`,
      { before: 0 },
    ),
  )
  for (const phase of GSBPM_PHASES) {
    children.push(p(`${phase.code}. ${phase.titleId} (${phase.title})`, { bold: true }))
    for (const sp of phase.subProcesses) {
      if (!isSubProcessVisible(sp.skipWhen, project.jenisKegiatan)) continue
      children.push(p(`${sp.code} ${sp.title}`, { size: 20 }))
      for (const item of sp.checklist) {
        if (!isChecklistVisible(item, project.jenisKegiatan, project.klasifikasi)) continue
        const mark = project.checklistState[item.id] ? '[x]' : '[ ]'
        children.push(
          p(`   ${mark} ${item.label}${item.required ? ' *' : ''}`, { size: 18 }),
        )
      }
    }
  }

  children.push(h('13. Metadata Statistik', HeadingLevel.HEADING_2))
  children.push(
    p('Metadata mengacu pada Peraturan BPS Nomor 5 Tahun 2020 (MS-Keg, MS-Var, MS-Ind).', {
      size: 18,
    }),
  )

  for (const block of [
    metadataTable('MS-Keg — Statistik Kegiatan', MS_KEG_FIELDS, project.metadata.kegiatan),
    metadataTable('MS-Var — Statistik Variabel', MS_VAR_FIELDS, project.metadata.variabel),
    metadataTable('MS-Ind — Statistik Indikator', MS_IND_FIELDS, project.metadata.indikator),
  ]) {
    children.push(...block)
  }

  children.push(
    h('Catatan Penutup', HeadingLevel.HEADING_2),
    p(
      'Penyelenggara statistik sektoral wajib mengajukan rekomendasi kegiatan statistik ke BPS sesuai ketentuan yang berlaku (Design 2.6, Materi Proses Bisnis).',
    ),
    p(
      'Metadata resmi mengikuti Peraturan BPS Nomor 5 Tahun 2020. Field pada dokumen ini mengacu pada definisi MS-Keg, MS-Var, dan MS-Ind pada Materi Proses Bisnis.',
    ),
    p(`Dokumen digenerate oleh StatPlan 1.0.0 pada ${generatedAt.toLocaleString('id-ID')}.`),
  )

  const doc = new Document({
    creator: 'StatPlan',
    title: `Draf Perencanaan — ${project.name}`,
    description: 'Draf dokumen perencanaan kegiatan statistik (GSBPM 5.2)',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'StatPlan · BPS Kabupaten Lombok Tengah · DRAF',
                    size: 16,
                    font: 'Calibri',
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Halaman ', size: 16, font: 'Calibri', color: '64748B' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Calibri', color: '64748B' }),
                  new TextRun({ text: ' dari ', size: 16, font: 'Calibri', color: '64748B' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Calibri', color: '64748B' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safe = project.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')
  saveAs(blob, `StatPlan-${safe || 'proyek'}.docx`)
}
