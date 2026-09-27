/**
 * Slice 6 — Guided preparation for Build.
 * Working formats only. Does not write into Project instruments / checklist / export.
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

export const GUIDED_BUILD_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'build-3.1',
    title: 'Siapkan draft instrumen',
    explanation:
      'Susun gambaran awal instrumen yang akan dipakai untuk memperoleh data. Ini perencanaan desain — bukan pembangun kuesioner lengkap.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 25',
    disclaimer: 'Format kerja StatPlan — bukan template resmi BPS.',
    exampleBody:
      'Materi membahas aturan penyusunan kuesioner/instrumen. Contoh ilustratif: instrumen “Kuesioner kepuasan pelayanan” untuk mengumpulkan penilaian unsur layanan.',
    exampleClass: 'A',
    fields: [
      {
        id: 'nama_instrumen',
        label: 'Nama instrumen',
        kind: 'text',
        required: true,
      },
      {
        id: 'jenis_instrumen',
        label: 'Jenis instrumen',
        kind: 'select',
        required: true,
        options: [
          { value: 'kuesioner', label: 'Kuesioner' },
          { value: 'formulir', label: 'Formulir' },
          { value: 'daftar_isian', label: 'Daftar isian' },
          { value: 'lainnya', label: 'Lainnya' },
        ],
        hint: 'Pilihan generik untuk penyusunan awal — bukan taksonomi resmi BPS.',
      },
      {
        id: 'tujuan_instrumen',
        label: 'Tujuan instrumen',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'data_diperoleh',
        label: 'Data yang ingin diperoleh',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'catatan_desain',
        label: 'Catatan desain',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-3.1-a', label: 'Draft instrumen' },
      { id: 'e-3.1-b', label: 'Catatan desain instrumen' },
    ],
  },
  {
    cardId: 'build-3.2',
    title: 'Siapkan draft aturan pemeriksaan',
    explanation:
      'Tuliskan aturan pemeriksaan awal agar data lebih konsisten. StatPlan tidak menjalankan validasi terhadap data responden.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 26',
    disclaimer:
      'Format kerja StatPlan — bukan aturan validasi resmi BPS dan bukan mesin validasi otomatis. Contoh materi tidak otomatis berlaku untuk semua kegiatan.',
    exampleBody:
      'Setelah meninjau “Contoh Aturan Validasi” pada materi, tulis aturan pemeriksaan untuk kegiatan Anda. Contoh ilustratif isian: “Jika umur kosong, minta diisi ulang” — itu Data Anda.',
    exampleClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Aturan Validasi',
        kind: 'rule',
        note: 'Visual contoh aturan validasi pada materi — referensi pembelajaran, bukan engine validasi.',
      },
    ],
    materiLesson:
      'Contoh ini menunjukkan bahwa data perlu aturan pemeriksaan agar konsisten. Susun aturan sederhana untuk kegiatan Anda; StatPlan tidak menjalankan validasi terhadap data responden.',
    pdfPage: 26,
    fields: [
      {
        id: 'rules',
        label: 'Daftar pemeriksaan kegiatan Anda',
        kind: 'repeatableValidation',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-3.2-a', label: 'Draft aturan pemeriksaan' },
      { id: 'e-3.2-b', label: 'Catatan hasil review' },
    ],
    isReady: (v) => hasNamedRows(v, 'rules', 'nama'),
  },
  {
    cardId: 'build-3.3',
    title: 'Siapkan tabulasi awal',
    explanation:
      'Hubungkan output yang diinginkan dengan data yang akan digunakan. Format kerja sederhana — bukan mesin tabulasi statistik.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 27',
    disclaimer:
      'Format kerja StatPlan — bukan format tabulasi resmi BPS dan bukan formula/engine otomatis.',
    exampleBody:
      'Setelah meninjau “Contoh Aturan Tabulasi” pada materi, hubungkan output dengan data yang akan dipakai. Contoh ilustratif isian: tabel “Kepuasan menurut jenis layanan” memakai skor kepuasan dan jenis layanan — itu Data Anda.',
    exampleClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Aturan Tabulasi',
        kind: 'table',
        note: 'Visual contoh aturan tabulasi pada materi — referensi, bukan mesin perhitungan.',
      },
    ],
    materiLesson:
      'Contoh ini membantu menghubungkan output yang diinginkan dengan data yang akan dipakai. Catat rencana tabulasi Anda tanpa menghitung angka hasil.',
    pdfPage: 27,
    fields: [
      {
        id: 'tables',
        label: 'Daftar tabel/output kegiatan Anda',
        kind: 'repeatableBuildTabulation',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-3.3-a', label: 'Draft tabulasi' },
      { id: 'e-3.3-b', label: 'Catatan aturan pengolahan/tabulasi' },
    ],
    isReady: (v) => hasNamedRows(v, 'tables', 'nama'),
  },
  {
    cardId: 'build-3.4',
    title: 'Siapkan alur / pembagian kerja',
    explanation:
      'Jelaskan kegiatan, siapa yang berperan, dan hasil yang diharapkan. Contoh pada materi adalah rujukan belajar untuk konteks hortikultura — bukan template resmi yang harus disalin.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 28',
    disclaimer:
      'Format kerja StatPlan — bukan template resmi BPS. Contoh hortikultura pada materi bukan alur wajib untuk semua kegiatan. Draft Anda adalah perencanaan peran — bukan manajemen pegawai.',
    exampleBody:
      'Materi menampilkan: (1) Struktur Organisasi Pengelolaan Data Hortikultura, dan (2) Alur Laporan Dokumen Data Hortikultura. Setelah meninjau contoh tersebut, susun versi kegiatan Anda di kolom Isian Anda.',
    exampleClass: 'A',
    materiExamples: [
      {
        title: 'Struktur Organisasi Pengelolaan Data Hortikultura',
        kind: 'structure',
        note: 'Contoh struktur organisasi pengelolaan data pada materi.',
      },
      {
        title: 'Alur Laporan Dokumen Data Hortikultura',
        kind: 'flow',
        note: 'Contoh alur laporan dokumen pada materi.',
      },
    ],
    materiLesson:
      'Contoh ini menunjukkan bahwa kegiatan statistik perlu kejelasan struktur organisasi dan alur dokumen. Bentuknya menyesuaikan konteks kegiatan Anda — contoh hortikultura tidak wajib ditiru.',
    pdfPage: 28,
    fields: [
      {
        id: 'workflow',
        label: 'Struktur / alur kegiatan Anda',
        kind: 'repeatableWorkflow',
        required: true,
        hint: 'Format kerja StatPlan — isi untuk kegiatan Anda, bukan salinan contoh hortikultura.',
      },
    ],
    evidence: [
      { id: 'e-3.4-a', label: 'Draft alur kerja' },
      { id: 'e-3.4-b', label: 'Catatan pembagian peran' },
    ],
    isReady: (v) => hasNamedRows(v, 'workflow', 'kegiatan'),
  },
  {
    cardId: 'build-3.5',
    title: 'Siapkan rencana uji coba / pilot',
    explanation:
      'Rencanakan bagian mana yang akan diuji sebelum kegiatan utama. StatPlan tidak mengumpulkan data pilot dan tidak menghitung hasil statistik uji coba.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 30',
    disclaimer:
      'Ini rencana uji coba — bukan pelaksanaan pilot dan bukan pengumpulan data responden.',
    exampleBody:
      'Lingkup uji coba pada materi mencakup: kuesioner/instrumen, metodologi, pengolahan, dan tabel dummy.',
    exampleClass: 'A',
    educationalNote:
      'Uji coba membantu melihat apakah rancangan dapat digunakan sebelum kegiatan utama dilaksanakan.',
    educationalNoteClass: 'B',
    educationalNotePage: 30,
    fields: [
      {
        id: 'bagian_diuji',
        label: 'Bagian yang akan diuji',
        kind: 'multiSelect',
        required: true,
        options: [
          { value: 'instrumen', label: 'Instrumen/kuesioner' },
          { value: 'metodologi', label: 'Metodologi' },
          { value: 'pengolahan', label: 'Pengolahan' },
          { value: 'tabel_dummy', label: 'Tabel dummy' },
        ],
      },
      {
        id: 'tujuan_uji',
        label: 'Tujuan uji coba',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'temuan',
        label: 'Temuan yang perlu diperhatikan',
        kind: 'textarea',
      },
      {
        id: 'perbaikan',
        label: 'Perbaikan yang direncanakan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-3.5-a', label: 'Rencana uji coba' },
      { id: 'e-3.5-b', label: 'Catatan temuan/perbaikan' },
    ],
    isReady: (v) => {
      const parts = v.bagian_diuji
      const hasParts =
        Array.isArray(parts) && parts.some((x) => typeof x === 'string' && x.trim())
      return hasParts && hasText(v.tujuan_uji)
    },
  },
  {
    cardId: 'build-3.6',
    title: 'Finalisasi persiapan Build',
    explanation:
      'Tinjau status bahan Build dan catat perbaikan yang masih diperlukan. Ini ringkasan persiapan Mode Terpandu — bukan status resmi kegiatan.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Finalisasi ini tidak membuka Collect secara otomatis dan tidak merupakan persetujuan resmi BPS.',
    exampleBody:
      'Contoh ilustratif: instrumen sudah berstatus bahan siap, aturan pemeriksaan masih draft, uji coba masih perlu perbaikan pada tabel dummy.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'build-3.1', label: 'Instrumen' },
      { cardId: 'build-3.2', label: 'Aturan pemeriksaan' },
      { cardId: 'build-3.3', label: 'Tabulasi awal' },
      { cardId: 'build-3.4', label: 'Alur kerja' },
      { cardId: 'build-3.5', label: 'Uji coba' },
    ],
    fields: [
      {
        id: 'catatan_finalisasi',
        label: 'Catatan finalisasi',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'perbaikan_list',
        label: 'Hal yang masih perlu diperbaiki',
        kind: 'repeatableText',
        hint: 'Tambahkan satu atau beberapa butir perbaikan.',
      },
    ],
    evidence: [
      { id: 'e-3.6-a', label: 'Daftar bahan yang sudah disiapkan' },
      { id: 'e-3.6-b', label: 'Catatan perbaikan' },
    ],
  },
]

export function getBuildPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_BUILD_PREPARATIONS.find((p) => p.cardId === cardId)
}
