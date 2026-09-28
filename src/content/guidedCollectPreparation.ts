/**
 * Slice 7 — Guided preparation for Collect.
 * Working formats only. Does not create respondents / run collection / mutate Project.
 */
import type {
  GuidedDraftValues,
  GuidedPreparationDef,
} from '@/content/guidedNeedPreparation'

function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function hasNamedRows(
  values: GuidedDraftValues,
  key: string,
  nameKey: string,
): boolean {
  const raw = values[key]
  if (!Array.isArray(raw)) return false
  return raw.some(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      nameKey in row &&
      hasText((row as Record<string, string>)[nameKey]),
  )
}

export const GUIDED_COLLECT_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'gsbpm-4.1',
    title: 'Siapkan kerangka & penarikan sampel',
    explanation:
      'Jika kegiatan memakai sampel, catat kerangka sampel dan cara penarikannya. Tandai tidak relevan untuk sensus lengkap atau kompromin.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 33',
    disclaimer:
      'Format kerja StatPlan. Tidak menghitung ukuran sampel dan tidak menarik sampel otomatis.',
    exampleBody:
      'Relevan: Ya.\nSasaran: pengguna layanan perizinan bulan berjalan.\nSumber daftar: sistem antrean loket.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    educationalNote:
      'Subproses ini tidak dilakukan jika pengumpulan data dilakukan secara sensus/pendataan lengkap dan kompilasi produk administrasi (kompromin).',
    educationalNoteClass: 'A',
    educationalNotePage: 33,
    fields: [
      {
        id: 'relevan',
        label: 'Apakah subproses ini dilakukan?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya (survei)' },
          { value: 'tidak', label: 'Tidak (sensus / kompromin)' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'sasaran',
        label: 'Sasaran yang akan dicakup',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'sumber_daftar',
        label: 'Sumber kerangka sampel',
        kind: 'text',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_penyiapan',
        label: 'Cara penarikan sampel',
        kind: 'textarea',
        placeholder: 'Sesuai metode yang dirancang di 2.4…',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_tidak',
        label: 'Catatan mengapa subproses ini tidak dilakukan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['tidak'] },
      },
      {
        id: 'catatan_belum',
        label: 'Hal yang masih perlu ditentukan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-4.1-a', label: 'Daftar sasaran/sampel yang akan digunakan, jika relevan' },
      { id: 'e-4.1-b', label: 'Catatan sumber daftar sasaran' },
      { id: 'ev-4.1-out', label: 'Daftar sampel (unit observasi)', pdfPage: 32 },
    ],
    isReady: (v) => {
      const choice = typeof v.relevan === 'string' ? v.relevan : ''
      if (!choice) return false
      if (choice === 'ya') return hasText(v.sasaran) && hasText(v.sumber_daftar)
      if (choice === 'tidak') return hasText(v.catatan_tidak)
      return hasText(v.catatan_belum)
    },
  },
  {
    cardId: 'gsbpm-4.2',
    title: 'Siapkan petugas & sumber daya',
    explanation:
      'Tuliskan peran petugas dan tugasnya, rencana pelatihan, serta — untuk kegiatan non-survei — perjanjian dengan penyedia data.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 34',
    disclaimer: 'Contoh peran bersifat ilustratif StatPlan — bukan struktur organisasi resmi BPS.',
    exampleBody:
      'Peran: petugas wawancara · Tugas: mewawancarai pengguna layanan sesuai daftar sampel.\nPelatihan: 1 hari sebelum lapangan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'roles',
        label: 'Daftar peran',
        kind: 'repeatableRole',
        required: true,
      },
      {
        id: 'rencana_pelatihan',
        label: 'Rencana pelatihan petugas',
        kind: 'textarea',
        placeholder: 'Kapan, berapa lama, materi apa…',
      },
      {
        id: 'protokol_data',
        label: 'Protokol manajemen data & penjaminan kualitas',
        kind: 'textarea',
        placeholder: 'Siapa mengakses data, cara backup, cara pemeriksaan mutu…',
      },
      {
        id: 'catatan_pks',
        label: 'Perjanjian dengan penyedia data — PKS/LADU (non-survei)',
        kind: 'textarea',
        hint: 'Isi jika kegiatan memakai data dari pihak lain.',
      },
    ],
    evidence: [
      { id: 'e-4.2-a', label: 'Daftar peran petugas' },
      { id: 'e-4.2-b', label: 'Catatan tugas' },
      { id: 'ev-4.2-out1', label: 'Dokumentasi Pelaksanaan Pelatihan Petugas', pdfPage: 32 },
      {
        id: 'ev-4.2-out2',
        label: 'Surat Perjanjian Penggunaan Data (PKS/LADU), jika non-survei',
        pdfPage: 32,
      },
    ],
    isReady: (v) => hasNamedRows(v, 'roles', 'peran'),
  },
  {
    cardId: 'gsbpm-4.3',
    title: 'Siapkan rencana pelaksanaan & monitoring',
    explanation:
      'Jelaskan bagaimana pengumpulan dijalankan dan bagaimana kemajuannya dipantau — termasuk tindak lanjut non-respon.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 35',
    disclaimer:
      'Ini rencana pelaksanaan — StatPlan tidak menjalankan kuesioner dan tidak menyimpan data responden.',
    exampleBody:
      'Pelaksanaan: wawancara CAPI di loket, 1–30 September.\nMonitoring: laporan progres mingguan; non-respon dikunjungi ulang.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'cara_pelaksanaan',
        label: 'Cara pelaksanaan (termasuk sosialisasi)',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'instrumen',
        label: 'Instrumen yang digunakan',
        kind: 'text',
        required: true,
      },
      {
        id: 'moda',
        label: 'Moda pengumpulan',
        kind: 'text',
        required: true,
      },
      {
        id: 'periode_mulai',
        label: 'Periode pelaksanaan — mulai',
        kind: 'date',
        required: true,
      },
      {
        id: 'periode_selesai',
        label: 'Periode pelaksanaan — selesai',
        kind: 'date',
        required: true,
      },
      {
        id: 'monitoring',
        label: 'Rencana monitoring dan tindak lanjut',
        kind: 'repeatableMonitoring',
        hint: 'Termasuk laporan progres dan tindak lanjut kasus non-respon.',
      },
      {
        id: 'catatan_pelaksanaan',
        label: 'Catatan pelaksanaan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-4.3-a', label: 'Rencana pelaksanaan' },
      { id: 'e-4.3-b', label: 'Catatan periode pengumpulan' },
      { id: 'e-4.4-a', label: 'Laporan progres pengumpulan (rencana format)' },
      {
        id: 'ev-4.3-out',
        label:
          'Dokumentasi Rapat Monitoring Pelaksanaan dan Pemantauan Kualitas Pengumpulan Data',
        pdfPage: 32,
      },
    ],
  },
  {
    cardId: 'gsbpm-4.4',
    title: 'Siapkan finalisasi pengumpulan',
    explanation:
      'Catat cara data capture, apa yang diperiksa dari metadata/paradata, dan perbaikan sebelum data diserahkan ke Pengolahan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 36',
    disclaimer:
      'Persiapan finalisasi pengumpulan — bukan mesin validasi dan bukan status “data siap olah” otomatis.',
    exampleBody:
      'Data capture: otomatis dari CAPI.\nParadata: durasi wawancara < 2 menit diperiksa.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'data_capture',
        label: 'Cara input & penyimpanan data (data capture)',
        kind: 'select',
        options: [
          { value: 'otomatis', label: 'Otomatis' },
          { value: 'manual', label: 'Manual' },
          { value: 'campuran', label: 'Campuran' },
        ],
      },
      {
        id: 'hal_diperiksa',
        label: 'Metadata/paradata yang diperiksa',
        kind: 'repeatableText',
        required: true,
      },
      {
        id: 'hasil_pemeriksaan',
        label: 'Hasil pemeriksaan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'perbaikan',
        label: 'Perbaikan yang masih diperlukan',
        kind: 'textarea',
      },
      {
        id: 'catatan_finalisasi',
        label: 'Catatan finalisasi',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-4.5-a', label: 'Catatan pemeriksaan hasil pengumpulan' },
      { id: 'e-4.5-b', label: 'Catatan finalisasi' },
      { id: 'ev-4.4-out', label: 'Metadata Statistik Kegiatan', pdfPage: 32 },
    ],
    isReady: (v) => {
      const checks = v.hal_diperiksa
      const hasChecks =
        Array.isArray(checks) && checks.some((x) => typeof x === 'string' && x.trim())
      return hasChecks && hasText(v.hasil_pemeriksaan)
    },
  },
]

export function getCollectPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_COLLECT_PREPARATIONS.find((p) => p.cardId === cardId)
}
