/**
 * Slice 11 — Guided preparation for Evaluate.
 * Working formats only. Does not score, judge success/failure, or certify quality.
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

export const GUIDED_EVALUATE_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'evaluate-8.1',
    title: 'Siapkan rencana pengumpulan masukan',
    explanation:
      'Rencanakan sumber dan cara memperoleh masukan. StatPlan tidak mengumpulkan respons dan tidak menjalankan survei umpan balik.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 60–63',
    disclaimer:
      'Format kerja StatPlan. Rencana pengumpulan ≠ masukan yang sudah terkumpul secara operasional.',
    exampleBody:
      'Contoh ilustratif: sumber — staf pelaksana dan pengguna hasil; hal yang dikumpulkan — catatan kendala jadwal; cara — diskusi singkat internal.',
    exampleClass: 'C',
    educationalNote:
      'Evaluasi dimulai dengan merencanakan masukan apa yang perlu dikumpulkan — bukan dengan menilai skor kegiatan.',
    educationalNoteClass: 'B',
    educationalNotePage: '60–63',
    fields: [
      {
        id: 'sumber_masukan',
        label: 'Sumber masukan',
        kind: 'repeatableText',
        required: true,
      },
      {
        id: 'hal_dikumpulkan',
        label: 'Hal yang ingin dikumpulkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'cara_memperoleh',
        label: 'Cara memperoleh masukan',
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
      { id: 'e-8.1-a', label: 'Catatan sumber masukan' },
      { id: 'e-8.1-b', label: 'Rencana cara memperoleh masukan' },
    ],
    isReady: (v) => {
      const sources = v.sumber_masukan
      const hasSources =
        Array.isArray(sources) && sources.some((x) => typeof x === 'string' && x.trim())
      return hasSources && hasText(v.hal_dikumpulkan) && hasText(v.cara_memperoleh)
    },
  },
  {
    cardId: 'evaluate-8.2',
    title: 'Siapkan daftar aspek yang dievaluasi',
    explanation:
      'Tentukan aspek yang ingin ditinjau dan alasan singkatnya. Ini daftar fokus — bukan skor otomatis.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 60–63',
    disclaimer:
      'Format kerja StatPlan. Daftar aspek ≠ hasil penilaian dan ≠ sertifikasi kualitas.',
    exampleBody:
      'Contoh ilustratif: aspek “ketepatan waktu pengumpulan”; alasan “sering terlambat di tahap lapangan”; informasi yang diperlukan “catatan jadwal aktual”.',
    exampleClass: 'C',
    educationalNote:
      'Tentukan aspek kegiatan yang ingin ditinjau sebelum menyusun observasi.',
    educationalNoteClass: 'B',
    educationalNotePage: '60–63',
    fields: [
      {
        id: 'aspects',
        label: 'Daftar aspek',
        kind: 'repeatableAspect',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-8.2-a', label: 'Daftar aspek evaluasi' },
      { id: 'e-8.2-b', label: 'Catatan informasi yang diperlukan' },
    ],
    isReady: (v) => hasNamedRows(v, 'aspects', 'aspek'),
  },
  {
    cardId: 'evaluate-8.3',
    title: 'Siapkan catatan observasi pelaksanaan dan hasil',
    explanation:
      'Isi observasi sendiri. Persiapan evaluasi — bukan penilaian otomatis. StatPlan tidak menyimpulkan berhasil atau gagal.',
    sourceType: 'B',
    sourceLabel: 'Penjelasan sederhana',
    disclaimer:
      'Semua temuan diisi oleh Anda (Input Anda). StatPlan tidak menghasilkan temuan, skor, atau kesimpulan berhasil/gagal.',
    exampleBody:
      'Contoh ilustratif format: “Hal yang berjalan baik…” / “Kendala…” / “Temuan…” — biarkan kosong hingga Anda mengisi sendiri.',
    exampleClass: 'C',
    educationalNote:
      'Siapkan pertanyaan atau observasi untuk meninjau pelaksanaan — tanpa mesin penilaian otomatis.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'berjalan_baik',
        label: 'Hal yang berjalan baik',
        kind: 'textarea',
        required: true,
        placeholder: 'Tuliskan observasi Anda…',
      },
      {
        id: 'kendala',
        label: 'Kendala',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'temuan',
        label: 'Temuan',
        kind: 'textarea',
        required: true,
        hint: 'Input Anda — bukan temuan yang digenerate StatPlan.',
      },
      {
        id: 'dampak',
        label: 'Dampak terhadap kegiatan',
        kind: 'textarea',
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-8.3-a', label: 'Catatan observasi pelaksanaan' },
      { id: 'e-8.3-b', label: 'Catatan temuan (input Anda)' },
    ],
  },
  {
    cardId: 'evaluate-8.4',
    title: 'Siapkan usulan perbaikan',
    explanation:
      'Ubah observasi menjadi usulan perbaikan. Prioritas adalah pilihan perencanaan Anda — bukan ranking otomatis StatPlan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 60–63',
    disclaimer:
      'Usulan perbaikan = rencana. Bukan keputusan resmi dan bukan aksi yang sudah selesai. Prioritas diisi pengguna.',
    exampleBody:
      'Contoh ilustratif: masalah “jadwal field terlambat”; usulan “rapat koordinasi mingguan”; prioritas “Sedang” — diisi sendiri.',
    exampleClass: 'C',
    educationalNote:
      'Identifikasi perbaikan menerjemahkan observasi menjadi usulan tindak lanjut.',
    educationalNoteClass: 'B',
    educationalNotePage: '60–63',
    fields: [
      {
        id: 'improvements',
        label: 'Daftar usulan perbaikan',
        kind: 'repeatableImprovement',
        required: true,
        hint: 'Prioritas adalah pilihan Anda — bukan ranking otomatis.',
      },
    ],
    evidence: [
      { id: 'e-8.4-a', label: 'Daftar usulan perbaikan' },
      { id: 'e-8.4-b', label: 'Catatan prioritas (rencana Anda)' },
    ],
    isReady: (v) => hasNamedRows(v, 'improvements', 'masalah'),
  },
  {
    cardId: 'evaluate-8.5',
    title: 'Siapkan rencana tindak lanjut',
    explanation:
      'Susun tindakan, tujuan, penanggung jawab, dan target waktu. Status rencana adalah status perencanaan — bukan bukti pelaksanaan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 60–63',
    disclaimer:
      'Target waktu = tanggal rencana. Status rencana ≠ tindakan sudah selesai. Tidak ada klaim aksi operasional.',
    exampleBody:
      'Contoh ilustratif: tindakan “perbarui daftar peran”; status rencana “Direncanakan”; target waktu sesuai rencana Anda.',
    exampleClass: 'C',
    educationalNote:
      'Rencana tindak lanjut mengubah usulan perbaikan menjadi rencana aksi yang dapat ditinjau kembali.',
    educationalNoteClass: 'B',
    educationalNotePage: '60–63',
    fields: [
      {
        id: 'actions',
        label: 'Daftar tindakan',
        kind: 'repeatableActionPlan',
        required: true,
        hint: 'Status rencana: Belum direncanakan / Direncanakan / Sedang disiapkan — bukan “sudah dilaksanakan”.',
      },
    ],
    evidence: [
      { id: 'e-8.5-a', label: 'Daftar tindakan rencana' },
      { id: 'e-8.5-b', label: 'Catatan target waktu (rencana)' },
    ],
    isReady: (v) => hasNamedRows(v, 'actions', 'tindakan'),
  },
  {
    cardId: 'evaluate-8.6',
    title: 'Catatan finalisasi Evaluate',
    explanation:
      'Tinjau bahan Evaluate. Persiapan Evaluate selesai dipelajari — bukan evaluasi kegiatan selesai, bukan kegiatan dinyatakan berhasil, dan bukan kegiatan dinyatakan memenuhi standar.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Ringkasan pembelajaran Mode Terpandu. Bukan laporan evaluasi resmi, bukan sertifikasi kualitas, dan bukan persetujuan BPS.',
    exampleBody:
      'Contoh ilustratif: masukan dan aspek bahan siap; observasi masih draft; rencana tindak lanjut perlu penanggung jawab.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'evaluate-8.1', label: 'Masukan' },
      { cardId: 'evaluate-8.2', label: 'Aspek evaluasi' },
      { cardId: 'evaluate-8.3', label: 'Observasi' },
      { cardId: 'evaluate-8.4', label: 'Perbaikan' },
      { cardId: 'evaluate-8.5', label: 'Tindak lanjut' },
    ],
    fields: [
      {
        id: 'catatan_finalisasi',
        label: 'Catatan finalisasi',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'hal_terbuka',
        label: 'Hal yang masih terbuka',
        kind: 'repeatableText',
      },
    ],
    evidence: [
      { id: 'e-8.6-a', label: 'Ringkasan persiapan evaluasi' },
      { id: 'e-8.6-b', label: 'Daftar catatan terbuka' },
    ],
  },
]

export function getEvaluatePreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_EVALUATE_PREPARATIONS.find((p) => p.cardId === cardId)
}
