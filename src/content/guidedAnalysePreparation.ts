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
    cardId: 'gsbpm-6.1',
    title: 'Siapkan rencana output awal',
    explanation:
      'Daftar output awal (tabulasi/grafik/peta) yang akan disusun dari data hasil pengolahan untuk divalidasi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 47',
    disclaimer: 'StatPlan tidak menghitung atau menampilkan angka hasil.',
    exampleBody:
      'Output: Tabel 1 (draf) · Jenis: Tabel · Ingin dilihat: indeks per aspek.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'outputs',
        label: 'Daftar output awal',
        kind: 'repeatableAnalyseOutput',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-6.2-a', label: 'Rencana output awal' },
      { id: 'e-6.2-b', label: 'Draft tabel/visual jika tersedia' },
    ],
    isReady: (v) => hasNamedRows(v, 'outputs', 'nama'),
  },
  {
    cardId: 'gsbpm-6.2',
    title: 'Siapkan daftar validasi output',
    explanation:
      'Pilih pemeriksaan dari daftar materi Hal. 48 dan tuliskan apa yang diperiksa serta tindak lanjutnya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 48',
    disclaimer: 'Bukan mesin PASS/FAIL statistik — ini daftar pemeriksaan Anda.',
    exampleBody:
      'Periksa: tingkat respon · Mengapa: memastikan cakupan cukup · Tindakan: jika rendah, beri catatan kehati-hatian.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'jenis_validasi',
        label: 'Pemeriksaan yang dilakukan (Hal. 48)',
        kind: 'multiSelect',
        options: [
          { value: 'konsistensi', label: 'Konsistensi' },
          { value: 'cakupan', label: 'Cakupan populasi dan tingkat respon' },
          { value: 'periode_lalu', label: 'Perbandingan dengan periode sebelumnya' },
          { value: 'metadata', label: 'Metadata, paradata, indikator kualitas' },
          { value: 'koherensi', label: 'Koherensi dengan data lain' },
          { value: 'makro', label: 'Penyuntingan tingkat agregat/makro' },
          { value: 'ekspektasi', label: 'Sesuai ekspektasi dan keilmuan' },
        ],
      },
      {
        id: 'reviews',
        label: 'Rincian pemeriksaan',
        kind: 'repeatableReview',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-6.3-a', label: 'Catatan pemeriksaan output' },
      { id: 'e-6.3-b', label: 'Daftar pertanyaan review' },
      { id: 'ev-6.2-out', label: 'Dokumentasi pembahasan validasi output', pdfPage: 46 },
    ],
    isReady: (v) => hasNamedRows(v, 'reviews', 'hal'),
  },
  {
    cardId: 'gsbpm-6.3',
    title: 'Siapkan rencana interpretasi',
    explanation:
      'Tulis ekspektasi awal sebelum melihat hasil, perspektif yang akan dipakai, dan analisis mendalam yang direncanakan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 49',
    disclaimer: 'Jangan mengisi kesimpulan atau angka hasil sebelum output tersedia.',
    exampleBody:
      'Ekspektasi: aspek waktu paling rendah.\nPerspektif: menurut jenis layanan.\nAnalisis lanjutan: keterbandingan dengan tahun lalu.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'pertanyaan',
        label: 'Ekspektasi / hipotesis awal',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'informasi',
        label: 'Perspektif yang akan dipakai',
        kind: 'textarea',
      },
      {
        id: 'analisis_lanjut',
        label: 'Analisis mendalam yang direncanakan',
        kind: 'multiSelect',
        options: [
          { value: 'deret_waktu', label: 'Analisis deret waktu' },
          { value: 'dampak', label: 'Analisis dampak' },
          { value: 'keterbandingan', label: 'Analisis keterbandingan' },
          { value: 'revisi', label: 'Analisis hasil revisi' },
          { value: 'asimetri', label: 'Analisis asimetri' },
          { value: 'tidak', label: 'Tidak diperlukan' },
        ],
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-6.1-a', label: 'Catatan ekspektasi / pertanyaan analisis' },
      { id: 'ev-6.3-b', label: 'Draf interpretasi dan catatan teknis' },
    ],
  },
  {
    cardId: 'gsbpm-6.4',
    title: 'Siapkan catatan disclosure control',
    explanation:
      'Tentukan output mana yang berisiko mengungkap kerahasiaan dan tindakan yang diterapkan, mengikuti aturan materi Hal. 50.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 50',
    disclaimer:
      'StatPlan tidak menganonimkan data dan tidak membuat keputusan hukum.',
    exampleBody:
      'Informasi dilindungi: nama dan nomor tiket responden.\nRisiko: sel tabel < 3 responden.\nTindakan: anonimisasi mikro data; sel kecil tidak disajikan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'perlu_diperhatikan',
        label: 'Apakah ada output yang berisiko mengungkap kerahasiaan?',
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
        hint: 'Materi: anonimisasi data individu; agregat yang dapat ditelusuri (mis. < 3 unit) tidak disajikan.',
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
      { id: 'ev-6.4-out', label: 'Mikro data final (sudah anonimisasi)', pdfPage: 46 },
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
    cardId: 'gsbpm-6.5',
    title: 'Siapkan finalisasi output',
    explanation:
      'Daftar output akhir, pengguna, dan bentuknya, lalu catat diskusi pra-rilis, level penyajian, dan catatan kehati-hatian.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 51',
    disclaimer:
      'Tidak menandai output sebagai dirilis dan tidak membuka Diseminasi secara otomatis.',
    exampleBody:
      'Output: Ringkasan SKM · Pengguna: DPMPTSP · Level: kabupaten dan jenis layanan · Catatan: hanya periode survei.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'final_outputs',
        label: 'Daftar output akhir',
        kind: 'repeatableFinalOutput',
        required: true,
      },
      {
        id: 'pra_rilis',
        label: 'Diskusi pra-rilis (dengan siapa, kapan)',
        kind: 'textarea',
      },
      {
        id: 'level_penyajian',
        label: 'Level penyajian rilis',
        kind: 'text',
        placeholder: 'mis. kabupaten, jenis layanan',
      },
      {
        id: 'catatan_kehati',
        label: 'Catatan kehati-hatian',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-6.5-a', label: 'Daftar output akhir' },
      { id: 'e-6.5-b', label: 'Catatan finalisasi' },
      {
        id: 'ev-6.5-out1',
        label: 'Dokumentasi diskusi pra rilis dan persetujuan rilis',
        pdfPage: 46,
      },
      { id: 'ev-6.5-out2', label: 'Metadata Statistik Indikator', pdfPage: 46 },
    ],
    isReady: (v) => hasNamedRows(v, 'final_outputs', 'nama'),
  },
]

export function getAnalysePreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_ANALYSE_PREPARATIONS.find((p) => p.cardId === cardId)
}
