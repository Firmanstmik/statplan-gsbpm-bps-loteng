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

export const GUIDED_DESIGN_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'design-2.1',
    title: 'Siapkan rancangan output / tabulasi',
    explanation:
      'Bayangkan bentuk informasi yang ingin dihasilkan. Materi memuat “Contoh Rancangan Tabulasi” (Hal. 18) sebagai rujukan konsep.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 18',
    disclaimer:
      'Format kerja StatPlan — bukan salinan tabel dari materi dan bukan template resmi BPS.',
    exampleBody:
      'Setelah meninjau “Contoh Rancangan Tabulasi” pada materi, susun versi kegiatan Anda di Format kerja StatPlan. Contoh ilustratif isian: output “Tingkat kepuasan menurut jenis layanan” dengan pembanding jenis layanan dan wilayah — itu Data Anda, bukan isi tabel PDF.',
    exampleClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Rancangan Tabulasi',
        kind: 'table',
        note: 'Visual contoh rancangan tabulasi pada materi — bukan tabel editable di StatPlan.',
      },
    ],
    materiLesson:
      'Contoh ini membantu membayangkan bentuk penyajian output sebelum merancang pengumpulan data. Susun versi kegiatan Anda sendiri — jangan menyalin isi tabel materi sebagai data resmi.',
    pdfPage: 18,
    fields: [
      {
        id: 'outputs',
        label: 'Rancangan output kegiatan Anda',
        kind: 'repeatableTabulation',
        required: true,
        hint: 'Format kerja StatPlan — buat versi Anda, bukan salinan tabel materi.',
      },
    ],
    evidence: [
      { id: 'e-2.1-a', label: 'Draft rancangan output/tabulasi' },
      { id: 'e-2.1-b', label: 'Catatan kebutuhan informasi' },
    ],
    isReady: (v) => hasNamedRows(v, 'outputs', 'judul'),
  },
  {
    cardId: 'design-2.2',
    title: 'Siapkan daftar variabel awal',
    explanation:
      'Tuliskan potongan informasi yang dibutuhkan untuk menghasilkan output. Contoh variabel pada materi: nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 19',
    disclaimer:
      'Daftar ini adalah draft pembelajaran. Belum tersambung ke variabel ruang kerja. StatPlan menyediakan format kerja sederhana untuk membantu penyusunan awal.',
    exampleBody:
      'Contoh variabel pada materi: nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi. Tidak semua contoh wajib dipakai.',
    exampleClass: 'A',
    fields: [
      {
        id: 'variables',
        label: 'Daftar variabel',
        kind: 'repeatableVariable',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-2.2-a', label: 'Daftar variabel awal' },
      { id: 'e-2.2-b', label: 'Catatan definisi variabel' },
    ],
    isReady: (v) => hasNamedRows(v, 'variables', 'name'),
  },
  {
    cardId: 'design-2.3',
    title: 'Siapkan cara / metode / moda',
    explanation:
      'Catat rancangan awal bagaimana data akan diperoleh menggunakan istilah cara, metode, dan moda sesuai materi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 20',
    disclaimer:
      'Pilihan ini merupakan rancangan awal. StatPlan tidak menentukan metode yang paling tepat secara otomatis.',
    exampleBody:
      'Contoh ilustratif: cara Survei, metode Wawancara, moda CAPI — disesuaikan dengan kegiatan Anda.',
    exampleClass: 'C',
    fields: [
      {
        id: 'cara',
        label: 'Cara',
        kind: 'select',
        required: true,
        options: [
          { value: 'survei', label: 'Survei' },
          { value: 'sensus', label: 'Sensus' },
          { value: 'kompromin', label: 'Kompromin / kompilasi' },
        ],
      },
      {
        id: 'metode',
        label: 'Metode',
        kind: 'select',
        required: true,
        options: [
          { value: 'wawancara', label: 'Wawancara' },
          { value: 'self_enumeration', label: 'Self enumeration' },
          { value: 'observasi', label: 'Observasi' },
        ],
      },
      {
        id: 'moda',
        label: 'Moda',
        kind: 'select',
        required: true,
        options: [
          { value: 'papi', label: 'PAPI' },
          { value: 'capi', label: 'CAPI' },
          { value: 'cati', label: 'CATI' },
          { value: 'cawi', label: 'CAWI' },
        ],
      },
      {
        id: 'catatan_metode',
        label: 'Catatan metode',
        kind: 'textarea',
        placeholder: 'Catatan tambahan mengenai cara memperoleh data…',
      },
    ],
    evidence: [{ id: 'e-2.3-a', label: 'Catatan cara/metode/moda' }],
  },
  {
    cardId: 'design-2.4',
    title: 'Siapkan catatan pengambilan sampel',
    explanation:
      'Jika kegiatan menggunakan sampel, catat rencana pemilihan sampel. Untuk sensus atau kompilasi, sampling dapat berbeda atau tidak digunakan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 21',
    disclaimer:
      'StatPlan tidak merekomendasikan metode sampling tertentu dan tidak menghitung ukuran sampel di Mode Terpandu.',
    exampleBody:
      'Jika Ya: tuliskan metode yang direncanakan dan alasannya. Jika Tidak / Belum ditentukan: catat alasan atau hal yang masih perlu diputuskan.',
    exampleClass: 'B',
    educationalNote:
      'Untuk sensus atau kompilasi data, kebutuhan sampling dapat berbeda atau tidak digunakan.',
    educationalNoteClass: 'B',
    educationalNotePage: 21,
    fields: [
      {
        id: 'menggunakan_sampel',
        label: 'Apakah kegiatan menggunakan sampel?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'metode_sampling',
        label: 'Metode sampling yang direncanakan',
        kind: 'text',
        placeholder: 'Tuliskan metode yang direncanakan (jika Ya)…',
        hint: 'Isi jika jawaban Anda Ya. Tidak diwajibkan jika Tidak / Belum ditentukan.',
      },
      {
        id: 'alasan_sampling',
        label: 'Alasan pemilihan',
        kind: 'textarea',
        placeholder: 'Mengapa metode tersebut dipertimbangkan?',
      },
      {
        id: 'catatan_sampling',
        label: 'Catatan',
        kind: 'textarea',
        placeholder: 'Catatan jika Tidak menggunakan sampel, atau hal yang masih diputuskan…',
      },
    ],
    evidence: [{ id: 'e-2.4-a', label: 'Catatan metode sampling, jika relevan' }],
    isReady: (v) => {
      const choice = typeof v.menggunakan_sampel === 'string' ? v.menggunakan_sampel : ''
      if (!choice) return false
      if (choice === 'ya') {
        return hasText(v.metode_sampling) && hasText(v.alasan_sampling)
      }
      return hasText(v.catatan_sampling)
    },
  },
  {
    cardId: 'design-2.5',
    title: 'Siapkan jadwal kegiatan',
    explanation:
      'Tambahkan kegiatan utama di dalam rentang waktu tahap Perancangan Anda. Ini tidak mengganti rencana waktu tahap dari langkah sebelumnya.',
    sourceType: 'A',
    sourceLabel: 'Contoh sumber · Materi Proses Bisnis · Hal. 23',
    disclaimer:
      'Contoh jadwal Juli–Desember pada materi adalah contoh sumber, bukan jadwal wajib. Tanggal yang Anda isi adalah Input Anda.',
    exampleBody:
      'Contoh sumber: jadwal kegiatan pada materi (termasuk contoh SKM Juli–Desember). Contoh ilustratif StatPlan: “Penyusunan instrumen” pada rentang tanggal yang Anda tentukan sendiri.',
    exampleClass: 'A',
    fields: [
      {
        id: 'kegiatan',
        label: 'Daftar kegiatan',
        kind: 'repeatableSchedule',
        required: true,
      },
    ],
    evidence: [{ id: 'e-2.5-a', label: 'Draft jadwal kegiatan' }],
    isReady: (v) => {
      const rows = v.kegiatan
      if (!Array.isArray(rows)) return false
      return rows.some((row) => {
        if (typeof row !== 'object' || row === null || !('kegiatan' in row)) return false
        const r = row as GuidedScheduleRow
        return hasText(r.kegiatan) && hasText(r.mulai) && hasText(r.selesai)
      })
    },
  },
  {
    cardId: 'design-2.6',
    title: 'Siapkan SOP & persiapan rekomendasi',
    explanation:
      'Catat SOP yang perlu disiapkan dan status persiapan rekomendasi. StatPlan tidak mengirim atau menyetujui rekomendasi ke BPS.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 23',
    disclaimer:
      'Ini pencatatan persiapan saja — bukan alur persetujuan resmi dan bukan klaim “rekomendasi berhasil”.',
    exampleBody:
      'Contoh: daftar SOP pendataan lapangan dan status “Sedang disiapkan” untuk persiapan rekomendasi, beserta catatan tindak lanjut.',
    exampleClass: 'C',
    fields: [
      {
        id: 'sop_list',
        label: 'SOP yang perlu disiapkan',
        kind: 'repeatableSop',
        required: true,
      },
      {
        id: 'status_rekomendasi',
        label: 'Persiapan rekomendasi',
        kind: 'select',
        required: true,
        options: [
          { value: 'belum', label: 'Belum disiapkan' },
          { value: 'sedang', label: 'Sedang disiapkan' },
          { value: 'sudah', label: 'Sudah disiapkan' },
          { value: 'belum_diperlukan', label: 'Belum diperlukan / belum ditentukan' },
        ],
      },
      {
        id: 'catatan_rekomendasi',
        label: 'Catatan status pengajuan / persiapan',
        kind: 'textarea',
        placeholder: 'Catatan Anda — bukan status resmi BPS…',
      },
    ],
    evidence: [
      { id: 'e-2.6-a', label: 'Draft SOP' },
      { id: 'e-2.6-b', label: 'Catatan persiapan rekomendasi' },
    ],
    isReady: (v) =>
      hasNamedRows(v, 'sop_list', 'nama') && hasText(v.status_rekomendasi),
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
