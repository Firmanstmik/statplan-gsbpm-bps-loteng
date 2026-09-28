/**
 * Slice 5 — Guided preparation for Perancangan (Design).
 * Working formats only. Does not write into Project.variables / design / timeline.
 */
import type {
  GuidedDraftValues,
  GuidedPreparationDef,
  GuidedScheduleRow,
  GuidedTabulationRow,
  GuidedVariableRow,
} from '@/content/guidedNeedPreparation'

function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function hasNamedRows(
  values: GuidedDraftValues,
  key: string,
  nameKey: 'name' | 'judul' | 'kegiatan' | 'nama',
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

/** Exact sampling methods on Materi Hal. 21 (Type A). */
export const SAMPLING_METHOD_OPTIONS = [
  { value: 'srs', label: 'Simple Random Sampling (probability)' },
  { value: 'stratified', label: 'Stratified Sampling (probability)' },
  { value: 'systematic', label: 'Systematic Sampling (probability)' },
  { value: 'cluster', label: 'Cluster Sampling (probability)' },
  { value: 'pps', label: 'Probability Proportional to Size Sampling (probability)' },
  { value: 'quota', label: 'Quota Sampling (non probability)' },
  { value: 'accidental', label: 'Accidental Sampling (non probability)' },
  { value: 'purposive', label: 'Purposive Sampling (non probability)' },
  { value: 'snowball', label: 'Snowball Sampling (non probability)' },
  { value: 'lainnya', label: 'Lainnya / belum ada di daftar materi' },
]

export const GUIDED_DESIGN_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'gsbpm-2.1',
    title: 'Siapkan rancangan output / tabulasi',
    explanation:
      'Susun rancangan tabel kegiatan Anda seperti “Contoh Rancangan Tabulasi” pada materi: judul lengkap, kelompok/pembanding, dan informasi yang ditampilkan — tanpa angka.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 18',
    disclaimer:
      'Format kerja StatPlan — bukan salinan tabel dari materi dan bukan template resmi BPS.',
    exampleBody:
      'Judul: Tabel 1. Indeks Kepuasan Masyarakat terhadap Pelayanan Perizinan Menurut Aspek Pelayanan, 2026.\nInformasi: nilai indeks, kategori mutu.\nKelompok: aspek pelayanan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    pdfPage: 18,
    fields: [
      {
        id: 'outputs',
        label: 'Rancangan tabel kegiatan Anda',
        kind: 'repeatableTabulation',
        required: true,
        hint: 'Satu baris = satu tabel. Isi judul lengkap seperti contoh materi.',
      },
      {
        id: 'indikator',
        label: 'Formulasi indikator yang akan dihasilkan',
        kind: 'textarea',
        placeholder: 'Nama indikator dan cara menghitungnya (sesuai kondef di 1.4)…',
      },
    ],
    evidence: [
      { id: 'e-2.1-a', label: 'Draft rancangan output/tabulasi' },
      { id: 'e-2.1-b', label: 'Catatan kebutuhan informasi' },
      { id: 'ev-2.1-out1', label: 'Rancangan tabel/layout publikasi/infografis', pdfPage: 17 },
      {
        id: 'ev-2.1-out2',
        label: 'Formulasi indikator statistik yang akan dihasilkan',
        pdfPage: 17,
      },
    ],
    isReady: (v) => hasNamedRows(v, 'outputs', 'judul'),
  },
  {
    cardId: 'gsbpm-2.2',
    title: 'Siapkan daftar variabel awal',
    explanation:
      'Tuliskan variabel yang dibutuhkan untuk mengisi rancangan output. Untuk setiap variabel, sebut dipakai untuk output apa.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 19',
    disclaimer:
      'Daftar ini adalah draft pembelajaran dan belum tersambung ke variabel ruang kerja.',
    exampleBody:
      'Jenis layanan → untuk “menurut jenis layanan” di Tabel 1.\nPenilaian aspek persyaratan → untuk nilai indeks aspek persyaratan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'variables',
        label: 'Daftar variabel',
        kind: 'repeatableVariable',
        required: true,
      },
      {
        id: 'cek_standar',
        label: 'Sudah dicek terhadap Standar Data Statistik Nasional?',
        kind: 'select',
        options: [
          { value: 'sudah', label: 'Sudah' },
          { value: 'sebagian', label: 'Sebagian variabel' },
          { value: 'belum', label: 'Belum' },
        ],
      },
    ],
    evidence: [
      { id: 'e-2.2-a', label: 'Daftar variabel awal' },
      { id: 'e-2.2-b', label: 'Catatan definisi variabel' },
    ],
    isReady: (v) => hasNamedRows(v, 'variables', 'name'),
  },
  {
    cardId: 'gsbpm-2.3',
    title: 'Pilih cara / metode / moda',
    explanation:
      'Pilih satu cara, metode, dan moda. Pilihan di bawah memakai istilah persis dari materi Hal. 20.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 20',
    disclaimer:
      'StatPlan tidak menentukan metode yang paling tepat secara otomatis. Catat alasan pilihan Anda.',
    exampleBody:
      'Cara: Survei · Metode: Wawancara · Moda: CAPI — karena responden ditemui di loket dan isian tablet dapat langsung divalidasi. (Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'cara',
        label: 'Cara pengumpulan data',
        kind: 'select',
        required: true,
        options: [
          { value: 'sensus', label: 'Sensus/pendataan lengkap' },
          { value: 'survei', label: 'Survei' },
          { value: 'kompromin', label: 'Kompilasi Produk Administratif (kompromin)' },
          { value: 'lainnya', label: 'Lainnya (mis. big data)' },
        ],
      },
      {
        id: 'metode',
        label: 'Metode pengumpulan data',
        kind: 'select',
        required: true,
        options: [
          { value: 'wawancara', label: 'Wawancara' },
          { value: 'self_enumeration', label: 'Self Enumeration' },
          { value: 'observasi', label: 'Observasi' },
        ],
      },
      {
        id: 'moda',
        label: 'Moda pengumpulan data',
        kind: 'select',
        required: true,
        options: [
          { value: 'papi', label: 'PAPI — Paper and Pencil Interviewing' },
          { value: 'capi', label: 'CAPI — Computer Assisted Personal Interviewing' },
          { value: 'cati', label: 'CATI — Computer Assisted Telephones Interviewing' },
          { value: 'cawi', label: 'CAWI — Computer Aided Web Interviewing' },
        ],
      },
      {
        id: 'catatan_metode',
        label: 'Alasan pilihan',
        kind: 'textarea',
        placeholder: 'Mengapa cara, metode, dan moda ini cocok untuk kegiatan Anda?',
      },
    ],
    evidence: [
      { id: 'e-2.3-a', label: 'Catatan cara/metode/moda' },
      { id: 'ev-2.3-b', label: 'Alasan pemilihan yang dapat ditinjau saat uji coba (3.6)' },
    ],
  },
  {
    cardId: 'gsbpm-2.4',
    title: 'Siapkan rancangan sampel',
    explanation:
      'Jika kegiatan memakai sampel, pilih metode sampling dari daftar materi Hal. 21 dan catat kerangka sampelnya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 21',
    disclaimer:
      'StatPlan tidak merekomendasikan metode tertentu dan tidak menghitung ukuran sampel.',
    exampleBody:
      'Menggunakan sampel: Ya.\nMetode: Systematic Sampling.\nKerangka: daftar penerima layanan selama periode survei.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    educationalNote:
      'Subproses ini tidak dilakukan jika pengumpulan data berupa sensus/pendataan lengkap atau kompilasi produk administrasi (kompromin).',
    educationalNoteClass: 'A',
    educationalNotePage: 21,
    fields: [
      {
        id: 'menggunakan_sampel',
        label: 'Apakah kegiatan menggunakan sampel?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak (sensus / kompromin)' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'metode_sampling',
        label: 'Metode sampling (daftar materi Hal. 21)',
        kind: 'select',
        options: SAMPLING_METHOD_OPTIONS,
        visibleWhen: { fieldId: 'menggunakan_sampel', values: ['ya'] },
      },
      {
        id: 'metode_sampling_lain',
        label: 'Metode lain / keterangan',
        kind: 'text',
        visibleWhen: { fieldId: 'metode_sampling', values: ['lainnya'] },
      },
      {
        id: 'kerangka_sampel',
        label: 'Kerangka sampel (daftar sumber pemilihan)',
        kind: 'text',
        placeholder: 'mis. daftar penerima layanan dari sistem loket',
        visibleWhen: { fieldId: 'menggunakan_sampel', values: ['ya'] },
      },
      {
        id: 'alasan_sampling',
        label: 'Alasan pemilihan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'menggunakan_sampel', values: ['ya'] },
      },
      {
        id: 'catatan_sampling',
        label: 'Catatan',
        kind: 'textarea',
        placeholder:
          'Jika tidak memakai sampel, tulis alasannya; jika belum, apa yang masih diputuskan…',
      },
    ],
    evidence: [
      { id: 'e-2.4-a', label: 'Catatan metode sampling, jika relevan' },
      { id: 'ev-2.4-b', label: 'Sumber kerangka sampel yang akan dipakai di 4.1' },
    ],
    isReady: (v) => {
      const choice = typeof v.menggunakan_sampel === 'string' ? v.menggunakan_sampel : ''
      if (!choice) return false
      if (choice === 'ya') {
        const method = typeof v.metode_sampling === 'string' ? v.metode_sampling : ''
        const methodOk = method === 'lainnya' ? hasText(v.metode_sampling_lain) : hasText(method)
        return methodOk && hasText(v.alasan_sampling)
      }
      return hasText(v.catatan_sampling)
    },
  },
  {
    cardId: 'gsbpm-2.5',
    title: 'Siapkan rancangan pengolahan & analisis',
    explanation:
      'Tulis aturan penyuntingan (editing), pengkodean (coding), dan pensahihan (validasi) yang akan dipakai, lalu pilih jenis analisis.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 22',
    disclaimer:
      'Rancangan ini dibangun menjadi aturan aplikasi di 3.2 dan dijalankan di tahap Pengolahan. StatPlan tidak menjalankannya.',
    exampleBody:
      'Editing: isian kosong dikembalikan ke petugas.\nCoding: jenis layanan → kode 1–5.\nValidasi: penilaian aspek harus 1–4.\nAnalisis: deskriptif.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'aturan_olah',
        label: 'Rancangan editing, coding, dan validasi',
        kind: 'repeatableRows',
        required: true,
        addLabel: '+ Tambah aturan',
        columns: [
          { key: 'aturan', label: 'Aturan', placeholder: 'mis. Nilai penilaian aspek harus 1–4' },
          { key: 'jenis', label: 'Jenis (editing / coding / validasi)' },
          { key: 'variabel', label: 'Variabel yang terkena' },
        ],
      },
      {
        id: 'jenis_analisis',
        label: 'Rancangan analisis',
        kind: 'select',
        required: true,
        options: [
          { value: 'deskriptif', label: 'Deskriptif (hanya narasi)' },
          { value: 'inferensia', label: 'Inferensia (metode analisis lebih lanjut)' },
          { value: 'keduanya', label: 'Deskriptif dan inferensia' },
        ],
      },
      {
        id: 'alasan_analisis',
        label: 'Alasan / catatan analisis',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'ev-2.5-a', label: 'Rancangan aturan editing, coding, dan validasi' },
      { id: 'ev-2.5-b', label: 'Catatan rancangan analisis' },
    ],
  },
  {
    cardId: 'gsbpm-2.6',
    title: 'Siapkan jadwal, SOP & persiapan rekomendasi',
    explanation:
      'Susun jadwal kegiatan di dalam rentang waktu proyek Anda, daftar SOP yang perlu dibuat, dan status persiapan rekomendasi kegiatan statistik.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 23',
    disclaimer:
      'Jadwal Juli–Desember pada materi adalah contoh, bukan durasi wajib. StatPlan tidak mengirim atau menyetujui rekomendasi ke BPS.',
    exampleBody:
      'Kegiatan: Perancangan instrumen · Mulai–selesai: sesuai rentang proyek Anda.\nSOP: Pengumpulan data SKM.\nRekomendasi: sedang disiapkan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'kegiatan',
        label: 'Jadwal kegiatan',
        kind: 'repeatableSchedule',
        required: true,
      },
      {
        id: 'sop_list',
        label: 'SOP yang perlu disiapkan',
        kind: 'repeatableSop',
        required: true,
      },
      {
        id: 'status_rekomendasi',
        label: 'Persiapan rekomendasi kegiatan statistik',
        kind: 'select',
        options: [
          { value: 'belum', label: 'Belum disiapkan' },
          { value: 'sedang', label: 'Sedang disiapkan' },
          { value: 'sudah', label: 'Sudah disiapkan' },
          { value: 'belum_diperlukan', label: 'Tidak diperlukan / belum ditentukan' },
        ],
      },
      {
        id: 'catatan_rekomendasi',
        label: 'Catatan persiapan rekomendasi',
        kind: 'textarea',
        placeholder: 'Catatan Anda — bukan status resmi BPS…',
      },
    ],
    evidence: [
      { id: 'e-2.5-a', label: 'Draft jadwal kegiatan' },
      { id: 'e-2.6-a', label: 'Draft SOP' },
      { id: 'e-2.6-b', label: 'Catatan persiapan rekomendasi' },
      { id: 'ev-2.6-out1', label: 'Rancangan sistem alur kerja (SOP)', pdfPage: 17 },
      {
        id: 'ev-2.6-out2',
        label: 'Surat Rekomendasi Kegiatan Statistik (sektoral)',
        pdfPage: 24,
      },
    ],
    isReady: (v) => {
      const rows = v.kegiatan
      const hasSchedule =
        Array.isArray(rows) &&
        rows.some((row) => {
          if (typeof row !== 'object' || row === null || !('kegiatan' in row)) return false
          const r = row as GuidedScheduleRow
          return hasText(r.kegiatan) && hasText(r.mulai) && hasText(r.selesai)
        })
      return hasSchedule && hasNamedRows(v, 'sop_list', 'nama')
    },
  },
]

export function getDesignPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_DESIGN_PREPARATIONS.find((p) => p.cardId === cardId)
}

/** Resolve Phase 1 or Phase 2 preparation by card id. */
export function resolvePreparation(cardId: string): GuidedPreparationDef | undefined {
  // Local import avoided — callers should try need then design; see getAnyPreparation.
  return getDesignPreparation(cardId)
}

export function emptyVariableRow(): GuidedVariableRow {
  return {
    id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    untukApa: '',
    catatan: '',
  }
}

export function emptyScheduleRow(): GuidedScheduleRow {
  return {
    id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kegiatan: '',
    mulai: '',
    selesai: '',
    catatan: '',
  }
}

export function emptyTabulationRow(): GuidedTabulationRow {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    judul: '',
    informasi: '',
    kelompok: '',
    catatan: '',
  }
}
