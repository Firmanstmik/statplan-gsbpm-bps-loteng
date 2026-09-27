/**
 * Slice 4 — Guided preparation templates & evidence for Identifikasi Kebutuhan.
 * Working formats for beginners. Not official BPS forms unless Class A + page.
 */
import type { GuidedMateriExample, GuidedSourceClass } from '@/content/guidedPhaseNeed'

export type GuidedEvidenceStatus = 'belum' | 'sedang' | 'sudah'

export type GuidedFieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiSelect'
  | 'repeatableText'
  | 'repeatableOutput'
  | 'date'
  | 'repeatableVariable'
  | 'repeatableSchedule'
  | 'repeatableTabulation'
  | 'repeatableSop'
  | 'repeatableValidation'
  | 'repeatableWorkflow'
  | 'repeatableBuildTabulation'
  | 'repeatableRole'
  | 'repeatableMonitoring'
  | 'repeatableSource'
  | 'repeatableCoding'
  | 'repeatableAnalyseOutput'
  | 'repeatableReview'
  | 'repeatableFinalOutput'
  | 'repeatableAspect'
  | 'repeatableImprovement'
  | 'repeatableActionPlan'

export type GuidedFieldOption = { value: string; label: string }

export type GuidedTemplateFieldDef = {
  id: string
  label: string
  kind: GuidedFieldKind
  required?: boolean
  placeholder?: string
  options?: GuidedFieldOption[]
  /** Shown under field when Class C working format */
  hint?: string
  /** Show field only when another field matches one of these values */
  visibleWhen?: { fieldId: string; values: string[] }
}

export type GuidedEvidenceDef = {
  id: string
  label: string
}

export type GuidedPreparationDef = {
  cardId: string
  title: string
  explanation: string
  sourceType: GuidedSourceClass
  /** Exact UI label for source badge */
  sourceLabel: string
  disclaimer: string
  exampleBody: string
  exampleClass: GuidedSourceClass
  /**
   * Named Type A examples from Materi Proses Bisnis (preview reference).
   * When present, UI distinguishes “Contoh dari Materi” from Format kerja StatPlan.
   */
  materiExamples?: GuidedMateriExample[]
  /** What the user can learn from materiExamples (Type B) */
  materiLesson?: string
  fields: GuidedTemplateFieldDef[]
  evidence: GuidedEvidenceDef[]
  /** Optional educational note (e.g. 1.5 compilation vs survey) */
  educationalNote?: string
  educationalNoteClass?: GuidedSourceClass
  educationalNotePage?: number | string
  /** PDF page for Type A materiExamples preview badge (when sourceType A) */
  pdfPage?: number | string
  /** Optional custom readiness (e.g. conditional sampling fields) */
  isReady?: (values: GuidedDraftValues) => boolean
  /** Optional related card status snapshot (e.g. Build finalisasi) */
  summaryFromCardIds?: { cardId: string; label: string }[]
}

const BENTUK_OPTIONS: GuidedFieldOption[] = [
  { value: 'tabel', label: 'Tabel' },
  { value: 'indikator', label: 'Indikator' },
  { value: 'ringkasan', label: 'Ringkasan' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'lainnya', label: 'Lainnya' },
]

const TERSEDIA_OPTIONS: GuidedFieldOption[] = [
  { value: 'ya', label: 'Ya' },
  { value: 'sebagian', label: 'Sebagian' },
  { value: 'belum_tahu', label: 'Belum tahu' },
  { value: 'tidak', label: 'Tidak' },
]

const SUMBER_OPTIONS: GuidedFieldOption[] = [
  { value: 'sirusa', label: 'Sirusa' },
  { value: 'romantik', label: 'Romantik' },
  { value: 'portal_sdi', label: 'Portal SDI' },
  { value: 'sumber_lain', label: 'Sumber lain' },
]

export const GUIDED_NEED_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'need-1.1',
    title: 'Siapkan rumusan kebutuhan',
    explanation:
      'Tuliskan masalah atau kebutuhan informasi yang ingin dijawab. Format ini membantu penyusunan awal — bukan template resmi BPS.',
    sourceType: 'C',
    sourceLabel: 'Contoh ilustratif',
    disclaimer:
      'StatPlan menyediakan format kerja sederhana untuk membantu penyusunan awal.',
    exampleBody:
      'Kegiatan: Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan.\nMasalah: belum tersedia informasi cukup mengenai pengalaman masyarakat setelah pelayanan.\nMengapa: untuk mengetahui aspek yang perlu diperbaiki.\nPengguna: DPMPTSP dan pihak terkait.\nDiharapkan: gambaran kepuasan terhadap beberapa aspek pelayanan.\n(Contoh ilustratif — bukan contoh resmi BPS.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'masalah',
        label: 'Masalah/kebutuhan yang ingin dijawab',
        kind: 'textarea',
        required: true,
        placeholder: 'Tuliskan kebutuhan informasi Anda…',
      },
      {
        id: 'kondisi',
        label: 'Kondisi saat ini',
        kind: 'textarea',
        placeholder: 'Apa yang sudah diketahui / belum diketahui?',
      },
      {
        id: 'mengapa',
        label: 'Mengapa informasi ini diperlukan?',
        kind: 'textarea',
        required: true,
        placeholder: 'Untuk keputusan atau evaluasi apa?',
      },
      {
        id: 'siapa',
        label: 'Siapa yang membutuhkan informasi ini?',
        kind: 'textarea',
        placeholder: 'Unit, pimpinan, atau pihak lain…',
      },
    ],
    evidence: [
      { id: 'e-1.1-a', label: 'Dokumen / uraian kebutuhan' },
      { id: 'e-1.1-b', label: 'Catatan rapat atau usulan awal' },
    ],
  },
  {
    cardId: 'need-1.2',
    title: 'Siapkan kebutuhan pengguna',
    explanation:
      'Catat siapa pengguna hasil dan informasi apa yang mereka perlukan. Format kerja sederhana StatPlan.',
    sourceType: 'C',
    sourceLabel: 'Contoh ilustratif',
    disclaimer:
      'StatPlan menyediakan format kerja sederhana untuk membantu penyusunan awal.',
    exampleBody:
      'Pengguna: DPMPTSP.\nInformasi: pengalaman dan tingkat kepuasan masyarakat.\nKeperluan: bahan evaluasi dan perbaikan pelayanan.\nBentuk: ringkasan indikator / tabel / gambaran hasil.\n(Contoh ilustratif.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'pengguna',
        label: 'Pengguna utama',
        kind: 'text',
        required: true,
        placeholder: 'Siapa yang akan memakai hasil?',
      },
      {
        id: 'informasi',
        label: 'Informasi yang dibutuhkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'keperluan',
        label: 'Untuk keperluan apa?',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'bentuk',
        label: 'Bentuk informasi yang diharapkan',
        kind: 'select',
        required: true,
        options: BENTUK_OPTIONS,
      },
    ],
    evidence: [
      { id: 'e-1.2-a', label: 'Catatan kebutuhan pengguna' },
      { id: 'e-1.2-b', label: 'Notulen konsultasi / rapat' },
    ],
  },
  {
    cardId: 'need-1.3',
    title: 'Siapkan tujuan kegiatan',
    explanation:
      'Rumuskan tujuan utama dan tujuan khusus agar arah kegiatan jelas. Format kerja sederhana StatPlan.',
    sourceType: 'C',
    sourceLabel: 'Contoh ilustratif',
    disclaimer:
      'StatPlan menyediakan format kerja sederhana untuk membantu penyusunan awal.',
    exampleBody:
      'Tujuan utama: Menghasilkan informasi mengenai kepuasan masyarakat terhadap pelayanan perizinan.\nTujuan khusus:\n• Mengidentifikasi aspek pelayanan yang dinilai masyarakat.\n• Menghasilkan informasi untuk evaluasi.\n• Menyediakan gambaran hasil berdasarkan karakteristik relevan.\n(Contoh ilustratif.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'tujuan_utama',
        label: 'Tujuan utama',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'tujuan_khusus',
        label: 'Tujuan khusus',
        kind: 'repeatableText',
        hint: 'Tambahkan satu atau beberapa tujuan khusus.',
      },
    ],
    evidence: [
      { id: 'e-1.3-a', label: 'Dokumen tujuan kegiatan' },
      { id: 'e-1.3-b', label: 'Catatan kesepakatan tujuan dengan pengguna' },
    ],
  },
  {
    cardId: 'need-1.4',
    title: 'Siapkan data / output yang dibutuhkan',
    explanation:
      'Daftarkan hasil statistik yang ingin dihasilkan. Ini baru daftar persiapan — bukan perancang variabel lengkap.',
    sourceType: 'C',
    sourceLabel: 'Contoh ilustratif',
    disclaimer:
      'StatPlan menyediakan format kerja sederhana untuk membantu penyusunan awal. Perancangan variabel detail ada di ruang kerja lengkap.',
    exampleBody:
      'Data: Penilaian masyarakat terhadap pelayanan → Output: Indikator kepuasan.\nData: Karakteristik responden → Output: Tabulasi/gambaran berdasarkan karakteristik.\n(Contoh ilustratif — tanpa angka hasil fiktif.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'outputs',
        label: 'Daftar data / output',
        kind: 'repeatableOutput',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-1.4-a', label: 'Daftar data/output yang dibutuhkan' },
      { id: 'e-1.4-b', label: 'Catatan bentuk hasil yang diharapkan' },
    ],
  },
  {
    cardId: 'need-1.5',
    title: 'Catat hasil pemeriksaan data',
    explanation:
      'Periksa apakah data yang dibutuhkan sudah tersedia sebelum menentukan cara memperoleh data. Catat hasil pemeriksaan Anda — StatPlan tidak memeriksa portal secara otomatis.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 15',
    disclaimer:
      'Antarmuka ini hanya membantu pencatatan. StatPlan tidak terhubung ke Sirusa, Romantik, atau Portal SDI.',
    exampleBody:
      'Portal dicek: SIRuSa, Romantik, Portal SDI.\nPeriksa: apakah data tersedia? dari mana sumbernya? apakah sesuai kebutuhan? jika belum, apa tindak lanjut?\n(Struktur berdasarkan Materi Proses Bisnis · Hal. 15 — isi portal tidak dikarang StatPlan.)',
    exampleClass: 'A',
    educationalNote:
      'Jika kegiatan menggunakan data yang sudah tersedia, pertimbangkan apakah kegiatan tersebut termasuk kompilasi data atau memerlukan survei/sensus.',
    educationalNoteClass: 'B',
    educationalNotePage: 15,
    fields: [
      {
        id: 'sumber_ingin',
        label: 'Sumber/data yang ingin diperiksa',
        kind: 'text',
        required: true,
      },
      {
        id: 'sudah_tersedia',
        label: 'Sudah tersedia?',
        kind: 'select',
        required: true,
        options: TERSEDIA_OPTIONS,
      },
      {
        id: 'sumber_dicek',
        label: 'Sumber yang diperiksa',
        kind: 'multiSelect',
        options: SUMBER_OPTIONS,
      },
      {
        id: 'hasil',
        label: 'Hasil pemeriksaan',
        kind: 'textarea',
        required: true,
        placeholder: 'Catat hasil pemeriksaan Anda…',
      },
      {
        id: 'tindak_lanjut',
        label: 'Tindak lanjut',
        kind: 'textarea',
        placeholder: 'Langkah berikutnya yang Anda rencanakan…',
      },
    ],
    evidence: [
      { id: 'e-1.5-a', label: 'Catatan hasil pengecekan sumber data' },
      { id: 'e-1.5-b', label: 'Ringkasan keputusan sementara jenis kegiatan' },
    ],
  },
  {
    cardId: 'need-1.6',
    title: 'Siapkan proposal / KAK awal',
    explanation:
      'Dokumentasikan temuan tahap kebutuhan. Struktur di bawah mengikuti outline materi sumber.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 16',
    disclaimer:
      'StatPlan menggunakan bagian ini sebagai format kerja awal. Ini bukan template resmi BPS.',
    exampleBody:
      'Format berdasarkan Materi Proses Bisnis · Hal. 16.\nProses yang berjalan: pelayanan sudah berjalan, belum ada ringkasan kepuasan.\nSolusi: kegiatan statistik untuk bahan evaluasi.\nBiaya dan manfaat: ringkas sumber daya vs manfaat evaluasi.\nKendala: waktu responden, kesiapan instrumen, koordinasi.\n(Isian contoh = ilustratif StatPlan; format kerja berdasarkan materi.)',
    exampleClass: 'A',
    fields: [
      {
        id: 'proses',
        label: 'Proses berjalan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'solusi',
        label: 'Solusi yang direncanakan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'biaya_manfaat',
        label: 'Biaya dan manfaat',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'kendala',
        label: 'Kendala',
        kind: 'textarea',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-1.6-a', label: 'Draft proposal / KAK' },
      { id: 'e-1.6-b', label: 'Ringkasan temuan tahap kebutuhan' },
    ],
  },
]

export function getNeedPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_NEED_PREPARATIONS.find((p) => p.cardId === cardId)
}

/** @deprecated Prefer getPreparation from guidedPreparation.ts */
export function getPreparation(cardId: string): GuidedPreparationDef | undefined {
  return getNeedPreparation(cardId)
}

export type GuidedOutputRow = {
  id: string
  name: string
  bentuk: string
  keterangan: string
}

export type GuidedVariableRow = {
  id: string
  name: string
  untukApa: string
  catatan: string
}

export type GuidedScheduleRow = {
  id: string
  kegiatan: string
  mulai: string
  selesai: string
  catatan: string
}

export type GuidedTabulationRow = {
  id: string
  judul: string
  informasi: string
  kelompok: string
  catatan: string
}

export type GuidedSopRow = {
  id: string
  nama: string
  catatan: string
}

export type GuidedValidationRow = {
  id: string
  nama: string
  kondisi: string
  tindakan: string
  catatan: string
}

export type GuidedWorkflowRow = {
  id: string
  kegiatan: string
  pelaksana: string
  hasil: string
  catatan: string
}

export type GuidedBuildTabulationRow = {
  id: string
  nama: string
  dataDigunakan: string
  catatan: string
}

export type GuidedRoleRow = {
  id: string
  peran: string
  tugas: string
  catatan: string
}

export type GuidedMonitoringRow = {
  id: string
  hal: string
  cara: string
  tindakLanjut: string
}

export type GuidedSourceRow = {
  id: string
  nama: string
  keterangan: string
}

export type GuidedCodingRow = {
  id: string
  kode: string
  nilai: string
  catatan: string
}

export type GuidedAnalyseOutputRow = {
  id: string
  nama: string
  jenis: string
  apaDilihat: string
  catatan: string
}

export type GuidedReviewRow = {
  id: string
  hal: string
  mengapa: string
  tindakan: string
}

export type GuidedFinalOutputRow = {
  id: string
  nama: string
  pengguna: string
  bentuk: string
  catatan: string
}

export type GuidedAspectRow = {
  id: string
  aspek: string
  alasan: string
  informasi: string
  catatan: string
}

export type GuidedImprovementRow = {
  id: string
  masalah: string
  usulan: string
  prioritas: string
  penanggungJawab: string
  catatan: string
}

export type GuidedActionPlanRow = {
  id: string
  tindakan: string
  tujuan: string
  penanggungJawab: string
  targetWaktu: string
  statusRencana: string
  catatan: string
}

export type GuidedDraftValue =
  | string
  | string[]
  | GuidedOutputRow[]
  | GuidedVariableRow[]
  | GuidedScheduleRow[]
  | GuidedTabulationRow[]
  | GuidedSopRow[]
  | GuidedValidationRow[]
  | GuidedWorkflowRow[]
  | GuidedBuildTabulationRow[]
  | GuidedRoleRow[]
  | GuidedMonitoringRow[]
  | GuidedSourceRow[]
  | GuidedCodingRow[]
  | GuidedAnalyseOutputRow[]
  | GuidedReviewRow[]
  | GuidedFinalOutputRow[]
  | GuidedAspectRow[]
  | GuidedImprovementRow[]
  | GuidedActionPlanRow[]

export type GuidedDraftValues = Record<string, GuidedDraftValue>

export type GuidedDraftStatus = 'empty' | 'partial' | 'ready'

function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function fieldHasContent(kind: GuidedFieldKind, value: GuidedDraftValue | undefined): boolean {
  if (value == null) return false
  if (kind === 'multiSelect' || kind === 'repeatableText') {
    return Array.isArray(value) && value.some((x) => typeof x === 'string' && x.trim())
  }
  if (kind === 'repeatableOutput') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'name' in row &&
          isNonEmptyString((row as GuidedOutputRow).name),
      )
    )
  }
  if (kind === 'repeatableVariable') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'name' in row &&
          isNonEmptyString((row as GuidedVariableRow).name),
      )
    )
  }
  if (kind === 'repeatableSchedule') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'kegiatan' in row &&
          isNonEmptyString((row as GuidedScheduleRow).kegiatan),
      )
    )
  }
  if (kind === 'repeatableTabulation') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'judul' in row &&
          isNonEmptyString((row as GuidedTabulationRow).judul),
      )
    )
  }
  if (kind === 'repeatableSop') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedSopRow).nama),
      )
    )
  }
  if (kind === 'repeatableValidation') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedValidationRow).nama),
      )
    )
  }
  if (kind === 'repeatableWorkflow') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'kegiatan' in row &&
          isNonEmptyString((row as GuidedWorkflowRow).kegiatan),
      )
    )
  }
  if (kind === 'repeatableBuildTabulation') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedBuildTabulationRow).nama),
      )
    )
  }
  if (kind === 'repeatableRole') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'peran' in row &&
          isNonEmptyString((row as GuidedRoleRow).peran),
      )
    )
  }
  if (kind === 'repeatableMonitoring') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'hal' in row &&
          isNonEmptyString((row as GuidedMonitoringRow).hal),
      )
    )
  }
  if (kind === 'repeatableSource') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedSourceRow).nama),
      )
    )
  }
  if (kind === 'repeatableCoding') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'kode' in row &&
          isNonEmptyString((row as GuidedCodingRow).kode),
      )
    )
  }
  if (kind === 'repeatableAnalyseOutput') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedAnalyseOutputRow).nama),
      )
    )
  }
  if (kind === 'repeatableReview') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'hal' in row &&
          isNonEmptyString((row as GuidedReviewRow).hal),
      )
    )
  }
  if (kind === 'repeatableFinalOutput') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'nama' in row &&
          isNonEmptyString((row as GuidedFinalOutputRow).nama),
      )
    )
  }
  if (kind === 'repeatableAspect') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'aspek' in row &&
          isNonEmptyString((row as GuidedAspectRow).aspek),
      )
    )
  }
  if (kind === 'repeatableImprovement') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'masalah' in row &&
          isNonEmptyString((row as GuidedImprovementRow).masalah),
      )
    )
  }
  if (kind === 'repeatableActionPlan') {
    return (
      Array.isArray(value) &&
      value.some(
        (row) =>
          typeof row === 'object' &&
          row !== null &&
          'tindakan' in row &&
          isNonEmptyString((row as GuidedActionPlanRow).tindakan),
      )
    )
  }
  return isNonEmptyString(value)
}

export function isFieldVisible(
  field: GuidedTemplateFieldDef,
  values: GuidedDraftValues,
): boolean {
  if (!field.visibleWhen) return true
  const cur = values[field.visibleWhen.fieldId]
  return typeof cur === 'string' && field.visibleWhen.values.includes(cur)
}

export function emptyDraftFor(prep: GuidedPreparationDef): GuidedDraftValues {
  const values: GuidedDraftValues = {}
  for (const f of prep.fields) {
    if (
      f.kind === 'multiSelect' ||
      f.kind === 'repeatableText' ||
      f.kind === 'repeatableOutput' ||
      f.kind === 'repeatableVariable' ||
      f.kind === 'repeatableSchedule' ||
      f.kind === 'repeatableTabulation' ||
      f.kind === 'repeatableSop' ||
      f.kind === 'repeatableValidation' ||
      f.kind === 'repeatableWorkflow' ||
      f.kind === 'repeatableBuildTabulation' ||
      f.kind === 'repeatableRole' ||
      f.kind === 'repeatableMonitoring' ||
      f.kind === 'repeatableSource' ||
      f.kind === 'repeatableCoding' ||
      f.kind === 'repeatableAnalyseOutput' ||
      f.kind === 'repeatableReview' ||
      f.kind === 'repeatableFinalOutput' ||
      f.kind === 'repeatableAspect' ||
      f.kind === 'repeatableImprovement' ||
      f.kind === 'repeatableActionPlan'
    ) {
      values[f.id] = []
    } else {
      values[f.id] = ''
    }
  }
  return values
}

export function computeDraftStatus(
  prep: GuidedPreparationDef,
  values: GuidedDraftValues | undefined,
): GuidedDraftStatus {
  const v = values ?? {}
  const visibleFields = prep.fields.filter((f) => isFieldVisible(f, v))

  let any = false
  for (const f of visibleFields) {
    if (fieldHasContent(f.kind, v[f.id])) any = true
  }
  if (!any) return 'empty'

  if (prep.isReady) {
    return prep.isReady(v) ? 'ready' : 'partial'
  }

  const required = visibleFields.filter((f) => f.required)
  const reqOk =
    required.length === 0
      ? any
      : required.every((f) => fieldHasContent(f.kind, v[f.id]))

  return reqOk ? 'ready' : 'partial'
}

export function draftStatusLabel(status: GuidedDraftStatus): string {
  if (status === 'ready') return 'Bahan siap'
  if (status === 'partial') return 'Draft disiapkan'
  return 'Belum diisi'
}

export function draftStatusSymbol(status: GuidedDraftStatus): string {
  if (status === 'ready') return '✓'
  if (status === 'partial') return '◐'
  return '—'
}

export function countEvidenceReady(
  evidence: GuidedEvidenceDef[],
  states: Record<string, { status: GuidedEvidenceStatus }> | undefined,
): { ready: number; total: number } {
  const total = evidence.length
  const ready = evidence.filter((e) => states?.[e.id]?.status === 'sudah').length
  return { ready, total }
}
