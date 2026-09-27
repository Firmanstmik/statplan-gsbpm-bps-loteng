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
    cardId: 'collect-4.1',
    title: 'Siapkan penyiapan sasaran/sampel',
    explanation:
      'Jika kegiatan memakai sampel, catat sasaran yang akan dicakup dan sumber daftarnya. Bagian ini dapat ditandai tidak relevan untuk sensus lengkap atau kompilasi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 33',
    disclaimer:
      'Format kerja StatPlan. Tidak menghitung ukuran sampel dan tidak menarik sampel otomatis.',
    exampleBody:
      'Jika Ya: tuliskan sasaran dan sumber daftar. Jika Tidak: catat mengapa bagian ini tidak dipakai. Jika Belum ditentukan: tuliskan hal yang masih perlu diputuskan.',
    exampleClass: 'B',
    educationalNote:
      'Jika kegiatan menggunakan sampel, sebelum pengumpulan dilakukan perlu disiapkan sasaran yang akan dicakup. Tidak setiap kegiatan membutuhkan sampel.',
    educationalNoteClass: 'B',
    educationalNotePage: 33,
    fields: [
      {
        id: 'relevan',
        label: 'Apakah bagian ini relevan?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'sasaran',
        label: 'Sasaran yang akan dicakup',
        kind: 'textarea',
        placeholder: 'Misalnya: rumah tangga terpilih di wilayah kerja…',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'sumber_daftar',
        label: 'Sumber daftar sasaran',
        kind: 'text',
        placeholder: 'Misalnya: kerangka sampel yang sudah disiapkan…',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_penyiapan',
        label: 'Catatan penyiapan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_tidak',
        label: 'Catatan mengapa bagian ini tidak digunakan',
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
      {
        id: 'e-4.1-a',
        label: 'Daftar sasaran/sample yang akan digunakan, jika relevan',
      },
      { id: 'e-4.1-b', label: 'Catatan sumber daftar sasaran' },
    ],
    isReady: (v) => {
      const choice = typeof v.relevan === 'string' ? v.relevan : ''
      if (!choice) return false
      if (choice === 'ya') {
        return hasText(v.sasaran) && hasText(v.sumber_daftar)
      }
      if (choice === 'tidak') return hasText(v.catatan_tidak)
      return hasText(v.catatan_belum)
    },
  },
  {
    cardId: 'collect-4.2',
    title: 'Siapkan peran petugas pelaksana',
    explanation:
      'Tuliskan siapa yang berperan dalam pengumpulan dan apa tugasnya. Ini draft perencanaan — bukan akun pegawai atau penugasan sistem.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 32–36',
    disclaimer:
      'Contoh peran bersifat ilustratif StatPlan. PKS-LADU disebut sebagai referensi sumber untuk konteks non-survei — tanpa memperluas kepanjangan di luar materi.',
    exampleBody:
      'Materi Collect membahas penyiapan petugas; untuk non-survei juga menyebut PKS-LADU. Contoh ilustratif StatPlan: “Petugas pengumpulan — mewawancarai responden sesuai instrumen.”',
    exampleClass: 'A',
    educationalNote:
      'Pengumpulan data perlu disiapkan siapa yang akan melaksanakan kegiatan dan apa perannya.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'roles',
        label: 'Daftar peran',
        kind: 'repeatableRole',
        required: true,
        hint: 'Contoh ilustratif: Petugas pengumpulan, Koordinator, Pemeriksa — bukan struktur organisasi resmi BPS.',
      },
      {
        id: 'catatan_pks',
        label: 'Catatan PKS-LADU (jika relevan)',
        kind: 'textarea',
        placeholder:
          'Opsional untuk kegiatan non-survei: catatan singkat mengenai perjanjian/protokol data…',
        hint: 'Referensi sumber. Jangan mengklaim sebagai formulir resmi.',
      },
    ],
    evidence: [
      { id: 'e-4.2-a', label: 'Daftar peran petugas' },
      { id: 'e-4.2-b', label: 'Catatan tugas' },
    ],
    isReady: (v) => hasNamedRows(v, 'roles', 'peran'),
  },
  {
    cardId: 'collect-4.3',
    title: 'Siapkan rencana pelaksanaan pengumpulan',
    explanation:
      'Jelaskan bagaimana pengumpulan akan dijalankan. StatPlan tidak menjalankan kuesioner, tidak menyimpan responden, dan tidak menerima isian lapangan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 32–36',
    disclaimer:
      'Ini rencana pelaksanaan — bukan sistem pengumpulan data dan bukan catatan responden.',
    exampleBody:
      'Contoh ilustratif: wawancara tatap muka memakai kuesioner kepuasan, moda face-to-face, periode sesuai rencana waktu tahap Collect Anda.',
    exampleClass: 'C',
    educationalNote:
      'Rencana pengumpulan perlu menjelaskan bagaimana kegiatan akan dilaksanakan sesuai rancangan.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'cara_pelaksanaan',
        label: 'Cara pelaksanaan',
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
        label: 'Moda/cara memperoleh data',
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
        id: 'catatan_pelaksanaan',
        label: 'Catatan pelaksanaan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-4.3-a', label: 'Rencana pelaksanaan' },
      { id: 'e-4.3-b', label: 'Catatan periode pengumpulan' },
    ],
  },
  {
    cardId: 'collect-4.4',
    title: 'Siapkan rencana pemantauan / pengendalian',
    explanation:
      'Catat apa yang dipantau selama pelaksanaan dan tindak lanjut jika ada masalah. Bantuan perencanaan StatPlan — bukan dasbor status petugas lapangan.',
    sourceType: 'B',
    sourceLabel: 'Penjelasan sederhana',
    disclaimer:
      'Kartu ini menyusun rencana pemantauan secara sederhana. Tidak menjalankan pemantauan live dan tidak menautkan ke petugas nyata.',
    exampleBody:
      'Contoh ilustratif: pantau kelengkapan isian harian — cek laporan singkat — jika ada non-respon, rencanakan kunjungan ulang.',
    exampleClass: 'C',
    educationalNote:
      'Catat bagaimana pelaksanaan akan dipantau dan masalah yang perlu segera ditangani.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'monitoring',
        label: 'Daftar butir pemantauan',
        kind: 'repeatableMonitoring',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-4.4-a', label: 'Rencana pemantauan' },
      { id: 'e-4.4-b', label: 'Catatan penanganan masalah' },
    ],
    isReady: (v) => hasNamedRows(v, 'monitoring', 'hal'),
  },
  {
    cardId: 'collect-4.5',
    title: 'Siapkan catatan finalisasi hasil pengumpulan',
    explanation:
      'Rencanakan pemeriksaan hasil pengumpulan sebelum tahap berikutnya. Ini bukan pengolahan/validasi Process dan bukan klaim data sudah final di StatPlan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 32–36',
    disclaimer:
      'Persiapan finalisasi pengumpulan — bukan mesin validasi dan bukan status “data siap olah” otomatis.',
    exampleBody:
      'Contoh ilustratif: periksa kelengkapan berkas, catat hasil pemeriksaan, dan daftar perbaikan yang masih diperlukan.',
    exampleClass: 'C',
    educationalNote:
      'Setelah pengumpulan selesai, hasilnya perlu diperiksa dan difinalisasi sebelum masuk ke tahap berikutnya.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'hal_diperiksa',
        label: 'Apa yang perlu diperiksa?',
        kind: 'repeatableText',
        required: true,
        hint: 'Tambahkan satu atau beberapa butir pemeriksaan.',
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
    ],
    isReady: (v) => {
      const checks = v.hal_diperiksa
      const hasChecks =
        Array.isArray(checks) && checks.some((x) => typeof x === 'string' && x.trim())
      return hasChecks && hasText(v.hasil_pemeriksaan)
    },
  },
  {
    cardId: 'collect-4.6',
    title: 'Catatan kesiapan Collect',
    explanation:
      'Tinjau status bahan Collect dan catat risiko atau hal yang masih perlu disiapkan. Ringkasan Mode Terpandu — bukan persetujuan Collect dan bukan pernyataan pengumpulan selesai.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Ringkasan ini tidak membuka Process secara otomatis dan tidak merupakan persetujuan resmi BPS.',
    exampleBody:
      'Contoh ilustratif: penyiapan sasaran bahan siap, petugas masih draft, pemantauan masih perlu butir tindak lanjut.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'collect-4.1', label: 'Penyiapan sasaran' },
      { cardId: 'collect-4.2', label: 'Petugas' },
      { cardId: 'collect-4.3', label: 'Pelaksanaan' },
      { cardId: 'collect-4.4', label: 'Pemantauan' },
      { cardId: 'collect-4.5', label: 'Finalisasi' },
    ],
    fields: [
      {
        id: 'catatan_kesiapan',
        label: 'Catatan yang masih perlu disiapkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'risiko_list',
        label: 'Risiko/kendala yang perlu diperhatikan',
        kind: 'repeatableText',
        hint: 'Tambahkan satu atau beberapa risiko/kendala.',
      },
    ],
    evidence: [
      { id: 'e-4.6-a', label: 'Ringkasan kesiapan' },
      { id: 'e-4.6-b', label: 'Daftar hal yang masih perlu diperbaiki' },
    ],
  },
]

export function getCollectPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_COLLECT_PREPARATIONS.find((p) => p.cardId === cardId)
}
