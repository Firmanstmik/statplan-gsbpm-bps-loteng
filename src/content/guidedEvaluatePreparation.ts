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
    cardId: 'gsbpm-8.1',
    title: 'Siapkan rencana menghimpun bahan evaluasi',
    explanation:
      'Tentukan sumber bahan evaluasi (materi: umpan balik pengguna, paradata, metrik sistem, masukan staf), apa yang dikumpulkan, dan caranya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 61',
    disclaimer:
      'StatPlan tidak mengumpulkan respons atau menjalankan survei umpan balik.',
    exampleBody:
      'Sumber: umpan balik DPMPTSP, paradata durasi wawancara, catatan petugas.\nCara: dicatat berkelanjutan sejak tahap 1.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'sumber_masukan',
        label: 'Sumber bahan evaluasi',
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
        label: 'Cara menghimpun (manual / otomatis, kapan)',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'aspects',
        label: 'Aspek yang akan dievaluasi',
        kind: 'repeatableAspect',
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
      { id: 'e-8.2-a', label: 'Daftar aspek evaluasi' },
      { id: 'ev-8.1-out', label: 'Tingkat kepuasan pengguna data', pdfPage: 60 },
    ],
    isReady: (v) => {
      const sources = v.sumber_masukan
      const hasSources =
        Array.isArray(sources) && sources.some((x) => typeof x === 'string' && x.trim())
      return hasSources && hasText(v.hal_dikumpulkan) && hasText(v.cara_memperoleh)
    },
  },
  {
    cardId: 'gsbpm-8.2',
    title: 'Siapkan kerangka laporan evaluasi',
    explanation:
      'Isi observasi Anda sendiri: apa yang sesuai target, masalah, ketidaksesuaian kinerja dengan harapan, dan rekomendasi perubahan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 62',
    disclaimer:
      'Semua temuan adalah isian Anda. StatPlan tidak menghasilkan temuan, skor, atau kesimpulan berhasil/gagal.',
    exampleBody:
      'Kendala: antrean panjang → responden menolak.\nTemuan: tingkat respon di bawah rencana.\nRekomendasi: wawancara di area tunggu.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'berjalan_baik',
        label: 'Yang sesuai target / berjalan baik',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'kendala',
        label: 'Permasalahan yang terjadi',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'temuan',
        label: 'Ketidaksesuaian kinerja dengan harapan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'dampak',
        label: 'Dampak terhadap kegiatan',
        kind: 'textarea',
      },
      {
        id: 'improvements',
        label: 'Rekomendasi perubahan',
        kind: 'repeatableImprovement',
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
      { id: 'e-8.4-a', label: 'Daftar rekomendasi perubahan' },
      { id: 'ev-8.2-c', label: 'Laporan evaluasi' },
    ],
  },
  {
    cardId: 'gsbpm-8.3',
    title: 'Siapkan rencana tindak lanjut',
    explanation:
      'Susun rencana aksi dengan prioritas, penanggung jawab, target waktu, dan cara memantau dampaknya — lalu catat persetujuannya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 63',
    disclaimer:
      'Target waktu = tanggal rencana. Status rencana ≠ tindakan sudah selesai.',
    exampleBody:
      'Tindakan: pindahkan wawancara ke area tunggu · PJ: Koordinator SKM · Status: Direncanakan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'actions',
        label: 'Rencana aksi',
        kind: 'repeatableActionPlan',
        required: true,
      },
      {
        id: 'pemantauan_dampak',
        label: 'Mekanisme pemantauan dampak perbaikan',
        kind: 'textarea',
      },
      {
        id: 'persetujuan',
        label: 'Persetujuan rencana aksi',
        kind: 'select',
        options: [
          { value: 'belum', label: 'Belum dibahas' },
          { value: 'dibahas', label: 'Sudah dibahas, belum disetujui' },
          { value: 'disetujui', label: 'Sudah disetujui' },
        ],
      },
    ],
    evidence: [
      { id: 'e-8.5-a', label: 'Daftar tindakan rencana' },
      { id: 'e-8.5-b', label: 'Catatan target waktu (rencana)' },
      {
        id: 'ev-8.3-out',
        label:
          'Dokumentasi Rapat/Diskusi Penyusunan Rencana Tindak Lanjut dan aksi perbaikan siklus berikutnya',
        pdfPage: 60,
      },
    ],
    isReady: (v) => hasNamedRows(v, 'actions', 'tindakan'),
  },
]

export function getEvaluatePreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_EVALUATE_PREPARATIONS.find((p) => p.cardId === cardId)
}
