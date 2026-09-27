/**
 * Slice 10 — Guided preparation for Disseminate.
 * Working formats only. Does not publish, release, promote, or run user support.
 */
import type {
  GuidedDraftValues,
  GuidedPreparationDef,
} from '@/content/guidedNeedPreparation'

function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

export const GUIDED_DISSEMINATE_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'disseminate-7.1',
    title: 'Siapkan rencana produk statistik',
    explanation:
      'Tuliskan bentuk produk yang direncanakan. StatPlan tidak menerbitkan hasil statistik dan tidak membuat angka fiktif.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 52–57',
    disclaimer:
      'Format kerja StatPlan — bukan template resmi BPS. Rencana produk ≠ produk yang sudah dipublikasikan.',
    exampleBody:
      'Contoh ilustratif: nama “Ringkasan kepuasan pelayanan”; bentuk ringkasan singkat; informasi yang disajikan: pola kepuasan; pengguna sasaran: pengelola layanan.',
    exampleClass: 'C',
    educationalNote:
      'Produk statistik adalah bentuk hasil yang direncanakan untuk tersedia bagi pengguna — bukan hasil yang sudah dirilis di StatPlan.',
    educationalNoteClass: 'B',
    educationalNotePage: '52–57',
    fields: [
      {
        id: 'nama_produk',
        label: 'Nama produk',
        kind: 'text',
        required: true,
      },
      {
        id: 'bentuk_produk',
        label: 'Bentuk produk',
        kind: 'text',
        required: true,
        placeholder: 'Misalnya: ringkasan, tabel, infografis…',
        hint: 'Pilihan kerja StatPlan — bukan taksonomi resmi BPS.',
      },
      {
        id: 'informasi_disajikan',
        label: 'Informasi yang disajikan',
        kind: 'textarea',
        required: true,
        placeholder: 'Tanpa angka hasil fiktif…',
      },
      {
        id: 'pengguna_sasaran',
        label: 'Pengguna sasaran',
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
      { id: 'e-7.1-a', label: 'Catatan bentuk produk' },
      { id: 'e-7.1-b', label: 'Daftar pengguna sasaran' },
    ],
  },
  {
    cardId: 'disseminate-7.2',
    title: 'Siapkan rencana rilis',
    explanation:
      'Tentukan target waktu dan kondisi kesiapan. Tanggal di bawah adalah rencana Anda — bukan jadwal rilis resmi BPS dan bukan tanggal publikasi aktual.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 52–57',
    disclaimer:
      'Target waktu rilis = rencana pengguna (Input Anda). Bukan jadwal resmi, bukan tanggal publikasi aktual, dan bukan persetujuan rilis.',
    exampleBody:
      'Contoh ilustratif: produk “Ringkasan kepuasan”; target waktu sesuai rencana tahap Disseminate Anda; kondisi kesiapan: output akhir dan catatan disclosure sudah ditinjau.',
    exampleClass: 'C',
    educationalNote:
      'Rencana rilis membantu memikirkan kapan produk direncanakan tersedia. Planned release ≠ actual release.',
    educationalNoteClass: 'B',
    educationalNotePage: '52–57',
    fields: [
      {
        id: 'nama_produk',
        label: 'Nama produk',
        kind: 'text',
        required: true,
      },
      {
        id: 'target_waktu',
        label: 'Target waktu rilis (rencana)',
        kind: 'date',
        required: true,
        hint: 'Tanggal rencana Anda — bukan tanggal publikasi aktual.',
      },
      {
        id: 'kondisi_kesiapan',
        label: 'Kondisi kesiapan',
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
      { id: 'e-7.2-a', label: 'Catatan target waktu rilis (rencana)' },
      { id: 'e-7.2-b', label: 'Daftar kondisi kesiapan' },
    ],
  },
  {
    cardId: 'disseminate-7.3',
    title: 'Siapkan rencana penyebarluasan',
    explanation:
      'Rencanakan bagaimana produk dapat tersedia. Planned channel ≠ published channel. StatPlan tidak mempublikasikan apa pun.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 52–57',
    disclaimer:
      'Format kerja StatPlan — bukan template resmi BPS. Rencana penyebarluasan ≠ publikasi yang sudah berjalan.',
    exampleBody:
      'Contoh ilustratif: kanal rapat internal / portal internal OPD; bentuk ringkasan singkat; pengguna sasaran pengelola layanan.',
    exampleClass: 'C',
    educationalNote:
      'Rencana penyebarluasan menjelaskan bagaimana produk direncanakan tersedia — bukan bahwa produk sudah tersedia.',
    educationalNoteClass: 'B',
    educationalNotePage: '52–57',
    fields: [
      {
        id: 'kanal',
        label: 'Kanal',
        kind: 'repeatableText',
        required: true,
        hint: 'Pilihan kerja StatPlan. Contoh ilustratif: rapat internal, portal internal, surat edaran.',
      },
      {
        id: 'bentuk_penyajian',
        label: 'Bentuk penyajian',
        kind: 'text',
        required: true,
      },
      {
        id: 'pengguna_sasaran',
        label: 'Pengguna sasaran',
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
      { id: 'e-7.3-a', label: 'Catatan kanal yang direncanakan' },
      { id: 'e-7.3-b', label: 'Catatan bentuk penyajian' },
    ],
    isReady: (v: GuidedDraftValues) => {
      const kanal = v.kanal
      const hasKanal =
        Array.isArray(kanal) && kanal.some((x) => typeof x === 'string' && x.trim())
      return hasKanal && hasText(v.bentuk_penyajian) && hasText(v.pengguna_sasaran)
    },
  },
  {
    cardId: 'disseminate-7.4',
    title: 'Siapkan rencana promosi / pengenalan produk',
    explanation:
      'Rencanakan bagaimana produk dikenalkan kepada sasaran. Promotion plan ≠ promotion performed. Tidak ada metrik pemasaran.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 52–57',
    disclaimer:
      'Format kerja StatPlan. Rencana pengenalan ≠ promosi yang sudah dilaksanakan. Tidak membuat analytics promosi.',
    exampleBody:
      'Contoh ilustratif: produk ringkasan kepuasan dikenalkan kepada pengelola layanan melalui paparan singkat di rapat bulanan.',
    exampleClass: 'C',
    educationalNote:
      'Disseminate dapat mencakup pengenalan produk kepada pengguna sasaran — sebagai rencana, bukan klaim sudah dilakukan.',
    educationalNoteClass: 'B',
    educationalNotePage: '52–57',
    fields: [
      {
        id: 'produk_dikenalkan',
        label: 'Produk yang dikenalkan',
        kind: 'text',
        required: true,
      },
      {
        id: 'sasaran',
        label: 'Sasaran',
        kind: 'text',
        required: true,
      },
      {
        id: 'cara_pengenalan',
        label: 'Cara pengenalan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'materi_pendukung',
        label: 'Materi pendukung',
        kind: 'textarea',
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-7.4-a', label: 'Catatan rencana pengenalan' },
      { id: 'e-7.4-b', label: 'Daftar materi pendukung (rencana)' },
    ],
  },
  {
    cardId: 'disseminate-7.5',
    title: 'Siapkan rencana dukungan pengguna',
    explanation:
      'Rencanakan bagaimana pengguna dapat memperoleh penjelasan. User support plan ≠ support operation. Tidak ada sistem tiket.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 52–57',
    disclaimer:
      'Format kerja StatPlan. Rencana dukungan ≠ layanan operasional yang sudah berjalan.',
    exampleBody:
      'Contoh ilustratif: kebutuhan FAQ singkat; informasi yang dijelaskan: cara membaca tabel; kanal: email unit kerja / meja layanan.',
    exampleClass: 'C',
    educationalNote:
      'Dukungan pengguna merencanakan cara memperoleh penjelasan terkait produk — bukan menjalankan helpdesk.',
    educationalNoteClass: 'B',
    educationalNotePage: '52–57',
    fields: [
      {
        id: 'kebutuhan_dukungan',
        label: 'Kebutuhan dukungan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'informasi_dijelaskan',
        label: 'Informasi yang perlu dijelaskan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'kanal_dukungan',
        label: 'Kanal dukungan',
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
      { id: 'e-7.5-a', label: 'Catatan kebutuhan dukungan' },
      { id: 'e-7.5-b', label: 'Rencana kanal dukungan' },
    ],
  },
  {
    cardId: 'disseminate-7.6',
    title: 'Catatan finalisasi Disseminate',
    explanation:
      'Tinjau status bahan Disseminate. Persiapan Disseminate selesai dipelajari — bukan Disseminate selesai dilaksanakan, bukan produk dipublikasikan, dan bukan persetujuan resmi.',
    sourceType: 'C',
    sourceLabel: 'Format kerja StatPlan',
    disclaimer:
      'Ringkasan ini tidak membuka Evaluate secara otomatis dan tidak merupakan publikasi, rilis, atau persetujuan resmi BPS.',
    exampleBody:
      'Contoh ilustratif: produk dan rencana rilis bahan siap; promosi masih draft; dukungan pengguna perlu kontak penanggung jawab.',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'disseminate-7.1', label: 'Produk' },
      { cardId: 'disseminate-7.2', label: 'Rencana rilis' },
      { cardId: 'disseminate-7.3', label: 'Penyebarluasan' },
      { cardId: 'disseminate-7.4', label: 'Promosi' },
      { cardId: 'disseminate-7.5', label: 'Dukungan pengguna' },
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
      { id: 'e-7.6-a', label: 'Ringkasan rencana Disseminate' },
      { id: 'e-7.6-b', label: 'Daftar catatan terbuka' },
    ],
  },
]

export function getDisseminatePreparation(
  cardId: string,
): GuidedPreparationDef | undefined {
  return GUIDED_DISSEMINATE_PREPARATIONS.find((p) => p.cardId === cardId)
}
