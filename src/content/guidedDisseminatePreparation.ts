/**
 * Guided preparation for Disseminate (7.1–7.5, Materi Hal. 52–59).
 * Working formats only. Does not publish, release, promote, or run user support.
 */
import type { GuidedPreparationDef } from '@/content/guidedNeedPreparation'

export const GUIDED_DISSEMINATE_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'gsbpm-7.1',
    title: 'Siapkan pemutakhiran sistem output',
    explanation:
      'Catat data apa yang dimuat ke sistem output, di sistem mana, dan metadata mana yang harus tertaut sebelum rilis.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 53',
    disclaimer:
      'StatPlan tidak terhubung ke sistem output mana pun — ini daftar persiapan Anda.',
    exampleBody:
      'Data: tabel indeks per aspek · Sistem: database output unit · Metadata: MS-Keg, MS-Var, MS-Ind.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'data_dimuat',
        label: 'Data yang dimuat ke sistem output',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'sistem_output',
        label: 'Sistem output / database tujuan',
        kind: 'text',
      },
      {
        id: 'metadata_siap',
        label: 'Metadata yang sudah lengkap dan tertaut',
        kind: 'multiSelect',
        options: [
          { value: 'ms_keg', label: 'MS-Keg (kegiatan)' },
          { value: 'ms_var', label: 'MS-Var (variabel)' },
          { value: 'ms_ind', label: 'MS-Ind (indikator)' },
        ],
      },
      {
        id: 'catatan_tautan',
        label: 'Catatan format / tautan data–metadata',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'ev-7.1-a', label: 'Daftar data yang dimuat ke sistem output' },
      { id: 'ev-7.1-out', label: 'Data dan Metadata Statistik sesuai format baku', pdfPage: 52 },
    ],
  },
  {
    cardId: 'gsbpm-7.2',
    title: 'Siapkan rencana produk diseminasi',
    explanation:
      'Tentukan produk, komponennya, dan pemeriksaan sebelum produk dianggap memenuhi standar publikasi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 54',
    disclaimer: 'Rencana produk — bukan produk yang sudah diterbitkan.',
    exampleBody:
      'Produk: Laporan Ringkas SKM 2026 · Bentuk: publikasi elektronik · Komponen: tabel, grafik, catatan teknis, pernyataan kualitas.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'nama_produk',
        label: 'Nama produk',
        kind: 'text',
        required: true,
      },
      {
        id: 'bentuk_produk',
        label: 'Bentuk produk',
        kind: 'text',
        required: true,
        placeholder: 'Publikasi cetak/elektronik, tabulasi, grafik, peta…',
      },
      {
        id: 'komponen',
        label: 'Komponen produk (Hal. 54)',
        kind: 'multiSelect',
        options: [
          { value: 'catatan_teknis', label: 'Catatan / penjelasan teknis' },
          { value: 'tabel', label: 'Tabel' },
          { value: 'grafik', label: 'Grafik' },
          { value: 'peta', label: 'Peta' },
          { value: 'pernyataan_kualitas', label: 'Pernyataan kualitas' },
        ],
      },
      {
        id: 'informasi_disajikan',
        label: 'Informasi yang disajikan',
        kind: 'textarea',
        required: true,
        placeholder: 'Tanpa angka hasil fiktif…',
      },
      {
        id: 'pengguna_sasaran',
        label: 'Pengguna sasaran',
        kind: 'text',
        required: true,
      },
      {
        id: 'catatan',
        label: 'Pemeriksaan & penyuntingan yang direncanakan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-7.1-a', label: 'Catatan bentuk produk' },
      { id: 'e-7.1-b', label: 'Daftar pengguna sasaran' },
      {
        id: 'ev-7.2-out',
        label: 'Produk statis & dinamis yang disajikan melalui berbagai kanal',
        pdfPage: 52,
      },
    ],
  },
  {
    cardId: 'gsbpm-7.3',
    title: 'Siapkan rencana rilis',
    explanation:
      'Tulis kondisi kesiapan, jadwal dan mekanisme rilis, briefing pra-rilis, dan mekanisme ralat jika ada kesalahan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 55',
    disclaimer: 'Target waktu adalah rencana Anda — bukan jadwal rilis resmi BPS.',
    exampleBody:
      'Produk: Laporan Ringkas SKM · Mekanisme: unggah ke laman unit + rapat · Ralat: terbitkan catatan perubahan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'nama_produk',
        label: 'Produk yang dirilis',
        kind: 'text',
        required: true,
      },
      {
        id: 'target_waktu',
        label: 'Target waktu rilis',
        kind: 'date',
        required: true,
      },
      {
        id: 'kondisi_kesiapan',
        label: 'Kondisi kesiapan sebelum rilis',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'mekanisme_rilis',
        label: 'Mekanisme rilis dan briefing pra-rilis',
        kind: 'textarea',
      },
      {
        id: 'mekanisme_ralat',
        label: 'Mekanisme jika ditemukan kesalahan setelah terbit',
        kind: 'textarea',
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-7.2-a', label: 'Catatan target waktu rilis (rencana)' },
      { id: 'e-7.2-b', label: 'Daftar kondisi kesiapan' },
      { id: 'ev-7.3-out', label: 'Dokumentasi rilis hasil kegiatan', pdfPage: 52 },
    ],
  },
  {
    cardId: 'gsbpm-7.4',
    title: 'Siapkan rencana promosi',
    explanation:
      'Tentukan produk yang dipromosikan, sasaran, kanal (situs web, media sosial, platform digital), dan materi pendukung.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 56',
    disclaimer: 'Rencana promosi — bukan pernyataan bahwa promosi sudah dilakukan.',
    exampleBody:
      'Produk: Laporan Ringkas SKM · Kanal: media sosial instansi, situs web · Materi: infografis satu halaman.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'produk_dikenalkan',
        label: 'Produk yang dipromosikan',
        kind: 'text',
        required: true,
      },
      {
        id: 'sasaran',
        label: 'Sasaran',
        kind: 'text',
        required: true,
      },
      {
        id: 'kanal',
        label: 'Kanal promosi',
        kind: 'repeatableText',
        hint: 'Materi menyebut situs web, media sosial, dan platform digital.',
      },
      {
        id: 'cara_pengenalan',
        label: 'Cara promosi',
        kind: 'textarea',
      },
      {
        id: 'materi_pendukung',
        label: 'Materi pendukung',
        kind: 'textarea',
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-7.4-a', label: 'Catatan rencana promosi' },
      { id: 'e-7.4-b', label: 'Daftar materi pendukung (rencana)' },
      { id: 'e-7.3-a', label: 'Catatan kanal yang direncanakan' },
      { id: 'ev-7.4-out', label: 'Dokumentasi promosi hasil kegiatan', pdfPage: 52 },
    ],
  },
  {
    cardId: 'gsbpm-7.5',
    title: 'Siapkan rencana layanan pengguna',
    explanation:
      'Rencanakan cara mencatat permintaan, batas waktu pemenuhan, kanal layanan, dan FAQ.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 57',
    disclaimer: 'Rencana layanan — StatPlan bukan sistem tiket atau helpdesk.',
    exampleBody:
      'Pencatatan: buku layanan · Batas waktu: 5 hari kerja · FAQ: cara membaca indeks.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'kebutuhan_dukungan',
        label: 'Jenis permintaan yang dilayani',
        kind: 'textarea',
        required: true,
        placeholder: 'mis. pertanyaan hasil, permintaan data mikro anonim…',
      },
      {
        id: 'batas_waktu',
        label: 'Batas waktu pemenuhan',
        kind: 'text',
      },
      {
        id: 'kanal_dukungan',
        label: 'Kanal layanan',
        kind: 'text',
        required: true,
      },
      {
        id: 'informasi_dijelaskan',
        label: 'Pertanyaan FAQ yang disiapkan',
        kind: 'textarea',
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-7.5-a', label: 'Catatan kebutuhan layanan' },
      { id: 'e-7.5-b', label: 'Rencana kanal layanan' },
      { id: 'ev-7.5-c', label: 'Draf FAQ' },
    ],
  },
]

export function getDisseminatePreparation(
  cardId: string,
): GuidedPreparationDef | undefined {
  return GUIDED_DISSEMINATE_PREPARATIONS.find((p) => p.cardId === cardId)
}
