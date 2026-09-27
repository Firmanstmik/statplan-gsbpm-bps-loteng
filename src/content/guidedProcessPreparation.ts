/**
 * Slice 8 — Guided preparation for Process.
 * Working formats only. Does not process data, compute stats, or mutate Project.
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

export const GUIDED_PROCESS_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'process-5.1',
    title: 'Siapkan rencana integrasi data',
    explanation:
      'Catat sumber yang akan digabungkan dan dasar penggabungannya. StatPlan tidak menjalankan join database dan tidak mengunggah berkas data.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 37–45',
    disclaimer:
      'Format kerja StatPlan. Tidak melakukan integrasi data nyata. Tidak semua kegiatan membutuhkan integrasi.',
    exampleBody:
      'Contoh ilustratif: gabungkan daftar isian lapangan dengan daftar administratif menggunakan kunci identitas yang sama.',
    exampleClass: 'C',
    educationalNote:
      'Jika data berasal dari beberapa bagian atau sumber, data dapat perlu digabungkan agar dapat diproses sebagai satu kesatuan.',
    educationalNoteClass: 'B',
    educationalNotePage: '37–45',
    fields: [
      {
        id: 'sources',
        label: 'Sumber data yang akan digabungkan',
        kind: 'repeatableSource',
        required: true,
      },
      {
        id: 'dasar_penggabungan',
        label: 'Dasar penggabungan',
        kind: 'textarea',
        required: true,
        placeholder: 'Misalnya: kunci identitas yang sama…',
      },
      {
        id: 'hal_diperhatikan',
        label: 'Hal yang perlu diperhatikan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-5.1-a', label: 'Catatan sumber data' },
      { id: 'e-5.1-b', label: 'Rencana integrasi' },
    ],
    isReady: (v) =>
      hasNamedRows(v, 'sources', 'nama') && hasText(v.dasar_penggabungan),
  },
  {
    cardId: 'process-5.2',
    title: 'Siapkan rencana agregasi / pengelompokan',
    explanation:
      'Rencanakan bagaimana data diringkas atau dikelompokkan. StatPlan tidak menghitung total, rata-rata, atau angka fiktif.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 44',
    disclaimer:
      'Format kerja StatPlan. Bukan mesin agregasi dan bukan hasil perhitungan statistik.',
    exampleBody:
      'Contoh ilustratif StatPlan: kelompokkan skor kepuasan berdasarkan wilayah atau jenis layanan. Contoh “wilayah / kelompok / kategori” bersifat ilustratif.',
    exampleClass: 'C',
    educationalNote:
      'Data yang tersedia pada tingkat tertentu dapat diringkas atau dikelompokkan untuk menghasilkan informasi yang dibutuhkan.',
    educationalNoteClass: 'B',
    educationalNotePage: 44,
    fields: [
      {
        id: 'data_dikelompokkan',
        label: 'Data yang akan dikelompokkan',
        kind: 'text',
        required: true,
      },
      {
        id: 'berdasarkan',
        label: 'Berdasarkan',
        kind: 'repeatableText',
        required: true,
        hint: 'Contoh ilustratif: wilayah, kelompok, kategori — bukan daftar wajib BPS.',
      },
      {
        id: 'output_diharapkan',
        label: 'Output yang diharapkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-5.2-a', label: 'Rencana pengelompokan/agregasi' },
      { id: 'e-5.2-b', label: 'Catatan output' },
    ],
    isReady: (v) => {
      const dims = v.berdasarkan
      const hasDims =
        Array.isArray(dims) && dims.some((x) => typeof x === 'string' && x.trim())
      return hasText(v.data_dikelompokkan) && hasDims && hasText(v.output_diharapkan)
    },
  },
  {
    cardId: 'process-5.3',
    title: 'Siapkan draft coding',
    explanation:
      'Susun draft kode dan kategori untuk variabel yang relevan. Ini rencana coding — bukan mesin pengodean dan bukan mengubah model variabel proyek.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 39',
    disclaimer:
      'Contoh coding pada materi adalah rujukan konsep. Format tabel di bawah adalah format kerja StatPlan — bukan standar kode resmi BPS yang digandakan.',
    exampleBody:
      'Menurut Materi Proses Bisnis · Hal. 39: materi memuat contoh coding. Contoh ilustratif StatPlan: variabel “jenis kelamin” — kode 1 = Laki-laki, kode 2 = Perempuan.',
    exampleClass: 'A',
    fields: [
      {
        id: 'nama_variabel',
        label: 'Nama variabel',
        kind: 'text',
        required: true,
      },
      {
        id: 'coding_rows',
        label: 'Daftar kode / kategori',
        kind: 'repeatableCoding',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-5.3-a', label: 'Draft coding' },
      { id: 'e-5.3-b', label: 'Daftar kode/kategori' },
    ],
    isReady: (v) => hasText(v.nama_variabel) && hasNamedRows(v, 'coding_rows', 'kode'),
  },
  {
    cardId: 'process-5.4',
    title: 'Siapkan rencana pembentukan unit baru',
    explanation:
      'Tentukan apakah unit analisis baru perlu dibentuk. Contoh rumah tangga pada materi adalah contoh sumber — bukan unit wajib untuk semua kegiatan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 42',
    disclaimer:
      'Catatan perencanaan. StatPlan tidak membentuk unit data nyata dan tidak menjalankan transformasi otomatis.',
    exampleBody:
      'Menurut Materi Proses Bisnis · Hal. 42: contoh sumber melibatkan pembentukan unit rumah tangga dari informasi individu. Gunakan hanya jika relevan bagi kegiatan Anda.',
    exampleClass: 'A',
    educationalNote:
      'Dalam kondisi tertentu, informasi dari beberapa unit dapat digunakan untuk membentuk unit analisis baru.',
    educationalNoteClass: 'B',
    educationalNotePage: 42,
    fields: [
      {
        id: 'diperlukan',
        label: 'Apakah pembentukan unit baru diperlukan?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'unit_asal',
        label: 'Unit asal',
        kind: 'text',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'unit_baru',
        label: 'Unit baru',
        kind: 'text',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'dasar_pembentukan',
        label: 'Dasar pembentukan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'catatan_ya',
        label: 'Catatan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'catatan_tidak',
        label: 'Catatan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['tidak'] },
      },
      {
        id: 'catatan_belum',
        label: 'Hal yang masih perlu diputuskan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-5.4-a', label: 'Catatan unit analisis' },
      { id: 'e-5.4-b', label: 'Rencana pembentukan unit baru jika relevan' },
    ],
    isReady: (v) => {
      const choice = typeof v.diperlukan === 'string' ? v.diperlukan : ''
      if (!choice) return false
      if (choice === 'ya') {
        return hasText(v.unit_asal) && hasText(v.unit_baru) && hasText(v.dasar_pembentukan)
      }
      if (choice === 'tidak') return hasText(v.catatan_tidak)
      return hasText(v.catatan_belum)
    },
  },
  {
    cardId: 'process-5.5',
    title: 'Siapkan catatan perencanaan weighting',
    explanation:
      'Tentukan apakah weighting relevan. Materi membedakan konteks survei dengan sensus/kompilasi. StatPlan tidak menghitung bobot dan tidak menerapkan formula.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 43',
    disclaimer:
      'Catatan perencanaan saja. StatPlan tidak menghitung bobot, tidak menerapkan formula, dan tidak menyatakan bobot telah dipakai.',
    exampleBody:
      'Menurut Materi Proses Bisnis · Hal. 43: weighting relevan dalam konteks tertentu dan tidak diterapkan dengan cara yang sama untuk sensus lengkap/kompilasi. Jika Tidak: tuliskan alasan singkat.',
    exampleClass: 'A',
    educationalNote:
      'Weighting dapat digunakan dalam konteks tertentu, tetapi tidak semua jenis kegiatan menggunakannya.',
    educationalNoteClass: 'B',
    educationalNotePage: 43,
    fields: [
      {
        id: 'relevan',
        label: 'Apakah weighting relevan?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'dasar_weighting',
        label: 'Dasar/rencana weighting',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_ya',
        label: 'Catatan perencanaan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'alasan_tidak',
        label: 'Alasan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['tidak'] },
      },
      {
        id: 'hal_diputuskan',
        label: 'Hal yang perlu diputuskan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-5.5-a', label: 'Catatan relevansi weighting' },
      { id: 'e-5.5-b', label: 'Rencana weighting jika relevan' },
    ],
    isReady: (v) => {
      const choice = typeof v.relevan === 'string' ? v.relevan : ''
      if (!choice) return false
      if (choice === 'ya') return hasText(v.dasar_weighting)
      if (choice === 'tidak') return hasText(v.alasan_tidak)
      return hasText(v.hal_diputuskan)
    },
  },
  {
    cardId: 'process-5.6',
    title: 'Rencana finalisasi proses',
    explanation:
      'Tinjau status bahan Process dan catat pemeriksaan serta risiko. Ringkasan Mode Terpandu — bukan pernyataan “proses selesai” dan bukan persetujuan resmi.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Ringkasan ini tidak membuka Analyse secara otomatis dan tidak merupakan persetujuan resmi BPS.',
    exampleBody:
      'Contoh ilustratif: integrasi bahan siap, coding masih draft, weighting ditandai tidak relevan untuk kompilasi.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'process-5.1', label: 'Integrasi' },
      { cardId: 'process-5.2', label: 'Agregasi' },
      { cardId: 'process-5.3', label: 'Coding' },
      { cardId: 'process-5.4', label: 'Unit baru' },
      { cardId: 'process-5.5', label: 'Weighting' },
    ],
    fields: [
      {
        id: 'catatan_proses',
        label: 'Catatan proses',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'hal_diperiksa',
        label: 'Hal yang masih perlu diperiksa',
        kind: 'repeatableText',
        hint: 'Tambahkan satu atau beberapa butir pemeriksaan.',
      },
      {
        id: 'risiko_list',
        label: 'Risiko/kendala',
        kind: 'repeatableText',
        hint: 'Tambahkan satu atau beberapa risiko/kendala.',
      },
    ],
    evidence: [
      { id: 'e-5.6-a', label: 'Ringkasan rencana proses' },
      { id: 'e-5.6-b', label: 'Daftar pemeriksaan' },
    ],
  },
]

export function getProcessPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_PROCESS_PREPARATIONS.find((p) => p.cardId === cardId)
}
