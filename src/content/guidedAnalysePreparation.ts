/**
 * Slice 9 — Guided preparation for Analyse.
 * Working formats only. Does not calculate statistics, fabricate results, or mutate Project.
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

export const GUIDED_ANALYSE_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'analyse-6.1',
    title: 'Siapkan tujuan analisis',
    explanation:
      'Tuliskan pertanyaan yang ingin dijawab dari hasil pengolahan. Ini rencana analisis — bukan hasil statistik.',
    sourceType: 'B',
    sourceLabel: 'Penjelasan sederhana',
    disclaimer:
      'Format kerja StatPlan. Perbedaan “tujuan kegiatan” dan “tujuan analisis” adalah penjelasan sederhana — bukan taksonomi resmi PDF.',
    exampleBody:
      'Contoh ilustratif: pertanyaan “Bagaimana tingkat kepuasan menurut jenis layanan?”; informasi yang ingin diperoleh: pola kepuasan; output yang akan digunakan: tabel silang.',
    exampleClass: 'C',
    educationalNote:
      'Tujuan analisis fokus pada pertanyaan dari data yang sudah diproses, berbeda dari tujuan kegiatan secara umum.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'pertanyaan',
        label: 'Pertanyaan yang ingin dijawab',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'informasi',
        label: 'Informasi yang ingin diperoleh',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'output_digunakan',
        label: 'Output yang akan digunakan',
        kind: 'text',
        required: true,
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-6.1-a', label: 'Catatan tujuan/pertanyaan analisis' },
      { id: 'e-6.1-b', label: 'Daftar informasi yang ingin diperoleh' },
    ],
  },
  {
    cardId: 'analyse-6.2',
    title: 'Siapkan rencana output awal',
    explanation:
      'Rencanakan output awal untuk meninjau hasil pengolahan sebelum output akhir. Jangan mengisi angka hasil fiktif.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 46–51',
    disclaimer:
      'Jenis output adalah pilihan kerja StatPlan — bukan taksonomi resmi BPS. StatPlan tidak menghitung atau menampilkan statistik fiktif.',
    exampleBody:
      'Contoh ilustratif: output “Tabel kepuasan menurut layanan” — jenis Tabel — ingin melihat pola skor antar layanan. Tanpa angka hasil.',
    exampleClass: 'C',
    educationalNote:
      'Output awal digunakan untuk melihat hasil pengolahan sebelum ditetapkan sebagai output akhir.',
    educationalNoteClass: 'B',
    educationalNotePage: '46–51',
    fields: [
      {
        id: 'outputs',
        label: 'Daftar output awal',
        kind: 'repeatableAnalyseOutput',
        required: true,
        hint: 'Pilihan jenis: Tabel / Indikator / Grafik / Ringkasan / Lainnya — pilihan kerja StatPlan.',
      },
    ],
    evidence: [
      { id: 'e-6.2-a', label: 'Rencana output awal' },
      { id: 'e-6.2-b', label: 'Draft tabel/visual jika tersedia' },
    ],
    isReady: (v) => hasNamedRows(v, 'outputs', 'nama'),
  },
  {
    cardId: 'analyse-6.3',
    title: 'Siapkan rencana pemeriksaan / interpretasi output',
    explanation:
      'Susun pertanyaan pemeriksaan sebelum output digunakan. Ini bantuan perencanaan — bukan mesin PASS/FAIL statistik.',
    sourceType: 'B',
    sourceLabel: 'Penjelasan sederhana',
    disclaimer:
      'Format kerja StatPlan. Tidak menjalankan validasi statistik otomatis dan tidak menghasilkan kesimpulan analisis.',
    exampleBody:
      'Contoh ilustratif: periksa kelengkapan kolom tabel — agar tidak menyesatkan pengguna — jika ada missing, tandai untuk diperbaiki.',
    exampleClass: 'C',
    educationalNote: 'Output perlu diperiksa sebelum digunakan atau disampaikan.',
    educationalNoteClass: 'B',
    fields: [
      {
        id: 'reviews',
        label: 'Daftar pemeriksaan',
        kind: 'repeatableReview',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-6.3-a', label: 'Catatan pemeriksaan output' },
      { id: 'e-6.3-b', label: 'Daftar pertanyaan review' },
    ],
    isReady: (v) => hasNamedRows(v, 'reviews', 'hal'),
  },
  {
    cardId: 'analyse-6.4',
    title: 'Siapkan catatan disclosure / kerahasiaan',
    explanation:
      'Pertimbangkan risiko pengungkapan sebelum output digunakan. Contoh pada materi bersifat pertimbangan — bukan kesimpulan hukum universal.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 50',
    disclaimer:
      'Contoh anonimisasi, agregat n kecil, dan informasi sensitif kompilasi adalah rujukan sumber. StatPlan tidak menganonimkan data dan tidak membuat keputusan hukum.',
    exampleBody:
      'Menurut Materi Proses Bisnis · Hal. 50: contoh pengendalian kerahasiaan mencakup anonimisasi, pertimbangan agregat dengan n kecil, dan informasi sensitif pada kompilasi. Contoh tindakan di bawah bersifat ilustratif StatPlan.',
    exampleClass: 'A',
    educationalNote:
      'Sebelum output digunakan atau disebarluaskan, pertimbangkan apakah informasi yang ditampilkan dapat mengungkap informasi yang seharusnya tidak dibuka.',
    educationalNoteClass: 'B',
    educationalNotePage: 50,
    fields: [
      {
        id: 'perlu_diperhatikan',
        label: 'Apakah disclosure perlu diperhatikan?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'informasi_dilindungi',
        label: 'Informasi yang perlu dilindungi',
        kind: 'textarea',
        visibleWhen: { fieldId: 'perlu_diperhatikan', values: ['ya'] },
      },
      {
        id: 'risiko',
        label: 'Risiko pengungkapan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'perlu_diperhatikan', values: ['ya'] },
      },
      {
        id: 'tindakan',
        label: 'Tindakan yang direncanakan',
        kind: 'repeatableText',
        hint: 'Contoh ilustratif: Anonimisasi, Agregasi, Pembatasan detail output — bukan daftar hukum wajib.',
        visibleWhen: { fieldId: 'perlu_diperhatikan', values: ['ya'] },
      },
      {
        id: 'catatan_tidak',
        label: 'Catatan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'perlu_diperhatikan', values: ['tidak'] },
      },
      {
        id: 'catatan_belum',
        label: 'Hal yang masih perlu diputuskan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'perlu_diperhatikan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-6.4-a', label: 'Catatan disclosure' },
      { id: 'e-6.4-b', label: 'Rencana perlindungan informasi' },
    ],
    isReady: (v) => {
      const choice = typeof v.perlu_diperhatikan === 'string' ? v.perlu_diperhatikan : ''
      if (!choice) return false
      if (choice === 'ya') {
        const actions = v.tindakan
        const hasActions =
          Array.isArray(actions) && actions.some((x) => typeof x === 'string' && x.trim())
        return hasText(v.informasi_dilindungi) && hasText(v.risiko) && hasActions
      }
      if (choice === 'tidak') return hasText(v.catatan_tidak)
      return hasText(v.catatan_belum)
    },
  },
  {
    cardId: 'analyse-6.5',
    title: 'Siapkan rencana output akhir',
    explanation:
      'Rencanakan output akhir setelah pemeriksaan. Ini bukan publikasi, bukan rilis, dan bukan angka hasil analisis.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 46–51',
    disclaimer:
      'Format kerja StatPlan. Tidak menandai output sebagai dipublikasikan dan tidak membuka Disseminate secara otomatis.',
    exampleBody:
      'Contoh ilustratif: output “Ringkasan kepuasan layanan” untuk pengelola pelayanan, bentuk ringkasan singkat, catatan finalisasi: perlu tinjau disclosure.',
    exampleClass: 'C',
    educationalNote:
      'Setelah output diperiksa dan hal-hal yang perlu diperbaiki ditangani, hasil dapat disiapkan sebagai output akhir.',
    educationalNoteClass: 'B',
    educationalNotePage: '46–51',
    fields: [
      {
        id: 'final_outputs',
        label: 'Daftar output akhir',
        kind: 'repeatableFinalOutput',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-6.5-a', label: 'Daftar output akhir' },
      { id: 'e-6.5-b', label: 'Catatan finalisasi' },
    ],
    isReady: (v) => hasNamedRows(v, 'final_outputs', 'nama'),
  },
  {
    cardId: 'analyse-6.6',
    title: 'Catatan finalisasi analisis',
    explanation:
      'Tinjau status bahan Analyse dan catat perbaikan. Ringkasan Mode Terpandu — bukan pernyataan “analisis selesai” dan bukan hasil statistik.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Ringkasan ini tidak membuka Disseminate secara otomatis dan tidak merupakan persetujuan resmi BPS.',
    exampleBody:
      'Contoh ilustratif: tujuan analisis bahan siap, disclosure masih draft, output akhir perlu catatan pengguna.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'analyse-6.1', label: 'Tujuan analisis' },
      { cardId: 'analyse-6.2', label: 'Output awal' },
      { cardId: 'analyse-6.3', label: 'Pemeriksaan output' },
      { cardId: 'analyse-6.4', label: 'Disclosure' },
      { cardId: 'analyse-6.5', label: 'Output akhir' },
    ],
    fields: [
      {
        id: 'catatan_analisis',
        label: 'Catatan analisis',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'hal_diperiksa',
        label: 'Hal yang masih perlu diperiksa',
        kind: 'repeatableText',
      },
      {
        id: 'perbaikan_list',
        label: 'Perbaikan yang masih diperlukan',
        kind: 'repeatableText',
      },
    ],
    evidence: [
      { id: 'e-6.6-a', label: 'Ringkasan analisis' },
      { id: 'e-6.6-b', label: 'Daftar perbaikan' },
    ],
  },
]

export function getAnalysePreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_ANALYSE_PREPARATIONS.find((p) => p.cardId === cardId)
}
