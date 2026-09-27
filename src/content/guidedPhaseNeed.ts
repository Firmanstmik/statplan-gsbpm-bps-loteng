/**
 * Mode Terpandu — Identifikasi Kebutuhan learning cards (Slice 3).
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 *
 * Source classification: A = PDF direct, B = PDF paraphrase, C = StatPlan illustration
 */
export type GuidedSourceClass = 'A' | 'B' | 'C'

export type GuidedTemplateField = {
  label: string
}

/** Named concrete example from Materi Proses Bisnis (Type A), shown as reference — not editable. */
export type GuidedMateriExample = {
  title: string
  /** What the PDF presents (structure, flow, table, rule, …) */
  kind: 'structure' | 'flow' | 'table' | 'rule' | 'document' | 'method' | 'schedule' | 'other'
  /** Optional short note grounded in the PDF context */
  note?: string
  /**
   * Optional public asset path for a PDF page/region preview.
   * Only set when a verified extract exists under public/ — never a reconstructed fake diagram.
   */
  imageSrc?: string
}

/** Structured illustrative or grounded example rows (shown via progressive disclosure). */
export type GuidedExampleRow = {
  label: string
  value: string
}

export type GuidedLearningCard = {
  id: string
  /**
   * Display code. For mappingKind 'gsbpm' this must be an official subprocess code
   * from src/domain/gsbpm.ts. For 'statplan' use a non-GSBPM label (e.g. SP-1).
   */
  code: string
  title: string
  /**
   * gsbpm = card maps to an official GSBPM 5.2 subprocess.
   * statplan = StatPlan learning/planning aid — NOT an official subprocess code.
   */
  mappingKind: 'gsbpm' | 'statplan'
  /** Official subprocess title when beginner title is a paraphrase */
  officialTitle?: string
  apa: string
  /** Short summary shown by default (2–4 lines ideal) */
  contoh: string
  contohClass: GuidedSourceClass
  /** Required for class A; optional for B. Number or range string (e.g. "32–36"). */
  pdfPage?: number | string
  /**
   * Named Type A examples from the PDF (e.g. Hal. 28 hortikultura).
   * When set, UI shows “Contoh dari Materi Proses Bisnis” as preview — not an editable template.
   */
  materiExamples?: GuidedMateriExample[]
  /** What the user can learn from materiExamples (Type B paraphrase) */
  materiLesson?: string
  /** Structured full example (label/value). Type C unless paired with Class A materiExamples. */
  contohDetail?: GuidedExampleRow[]
  /** Short learning bullets — “Yang bisa dipelajari” */
  lessonPoints?: string[]
  templateTitle: string
  templateFields: GuidedTemplateField[]
  buktiIntro: string
  buktiItems: string[]
  buktiClass: GuidedSourceClass
  buktiPdfPage?: number
}

export const GUIDED_NEED_INTRO = {
  phaseId: 'specify_need' as const,
  title: 'Identifikasi Kebutuhan',
  question: 'Apa yang perlu dipahami sebelum mulai?',
  explanation:
    'Tahap ini membantu Anda memahami kebutuhan statistik, siapa yang memakai hasilnya, tujuan dan output, serta apakah data yang sudah ada cukup sebelum merancang pengumpulan baru.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

/** Six beginner learning cards for Phase 1 — mapped to official GSBPM 1.1–1.6. */
export const GUIDED_NEED_CARDS: GuidedLearningCard[] = [
  {
    id: 'need-1.1',
    code: '1.1',
    mappingKind: 'gsbpm',
    title: 'Identifikasi Kebutuhan',
    apa: 'Menjelaskan kebutuhan informasi atau masalah yang ingin dijawab melalui kegiatan statistik. Rumusan yang jelas menjadi dasar langkah-langkah berikutnya.',
    contoh:
      'Kegiatan: Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan — kebutuhan informasi untuk perbaikan layanan.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Kegiatan',
        value: 'Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan',
      },
      {
        label: 'Masalah / kondisi',
        value:
          'Belum tersedia informasi yang cukup mengenai pengalaman masyarakat setelah menerima pelayanan perizinan.',
      },
      {
        label: 'Mengapa informasi dibutuhkan',
        value:
          'Informasi diperlukan untuk mengetahui aspek pelayanan yang masih perlu diperbaiki.',
      },
      {
        label: 'Pengguna informasi',
        value: 'DPMPTSP dan pihak terkait pelayanan publik.',
      },
      {
        label: 'Informasi yang diharapkan',
        value:
          'Gambaran kepuasan masyarakat terhadap beberapa aspek pelayanan.',
      },
    ],
    lessonPoints: [
      'Rumusan kebutuhan memuat kegiatan, masalah, alasan, pengguna, dan informasi yang diharapkan.',
      'Tuliskan kondisi yang belum tersedia — bukan hanya topik umum.',
      'Sebutkan siapa yang akan memakai hasil agar arah kegiatan jelas.',
    ],
    templateTitle: 'Format rumusan kebutuhan',
    templateFields: [
      { label: 'Kebutuhan statistik' },
      { label: 'Masalah yang ingin dijawab' },
      { label: 'Pengguna hasil (jika sudah diketahui)' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan rumusan masalah / kebutuhan informasi',
      'Surat atau usulan kebutuhan dari instansi',
      'Catatan awal dari rapat atau diskusi internal',
    ],
    buktiClass: 'C',
  },
  {
    id: 'need-1.2',
    code: '1.2',
    mappingKind: 'gsbpm',
    title: 'Konsultasi & Konfirmasi Kebutuhan',
    apa: 'Memahami siapa yang membutuhkan hasil statistik dan informasi apa yang mereka perlukan, agar hasil kegiatan benar-benar dipakai.',
    contoh:
      'Pengguna: DPMPTSP — membutuhkan gambaran kepuasan masyarakat untuk evaluasi pelayanan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Pengguna', value: 'DPMPTSP' },
      {
        label: 'Informasi yang dibutuhkan',
        value:
          'Informasi mengenai pengalaman dan tingkat kepuasan masyarakat terhadap pelayanan perizinan.',
      },
      {
        label: 'Keperluan',
        value: 'Bahan untuk evaluasi dan perbaikan pelayanan.',
      },
      {
        label: 'Bentuk informasi',
        value: 'Ringkasan indikator / tabel / gambaran hasil.',
      },
    ],
    lessonPoints: [
      'Bedakan siapa pengguna, apa yang mereka butuhkan, dan untuk keperluan apa.',
      'Bentuk informasi (tabel, ringkasan, indeks) ikut dikonfirmasi sejak awal.',
      'Konsultasi membantu memastikan hasil benar-benar dipakai.',
    ],
    templateTitle: 'Format kebutuhan pengguna',
    templateFields: [
      { label: 'Siapa pengguna hasil' },
      { label: 'Informasi yang dibutuhkan' },
      { label: 'Kapan hasil diharapkan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Notulen konsultasi atau rapat',
      'Catatan konfirmasi kebutuhan pengguna',
      'Daftar pemangku kepentingan terkait',
    ],
    buktiClass: 'C',
  },
  {
    id: 'need-1.3',
    code: '1.3',
    mappingKind: 'gsbpm',
    title: 'Penetapan Tujuan Output',
    apa: 'Merumuskan tujuan kegiatan dan output statistik berdasarkan kebutuhan yang sudah diidentifikasi, dalam bahasa yang singkat dan dapat diperiksa.',
    contoh:
      'Tujuan utama: menghasilkan informasi kepuasan masyarakat terhadap pelayanan perizinan.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Tujuan utama',
        value:
          'Menghasilkan informasi mengenai kepuasan masyarakat terhadap pelayanan perizinan.',
      },
      {
        label: 'Tujuan khusus',
        value:
          '• Mengidentifikasi aspek pelayanan yang dinilai masyarakat.\n• Menghasilkan informasi yang dapat digunakan untuk evaluasi.\n• Menyediakan gambaran hasil berdasarkan karakteristik yang relevan.',
      },
    ],
    lessonPoints: [
      'Tujuan utama menjawab kebutuhan informasi secara ringkas.',
      'Tujuan khusus memecah tujuan utama menjadi hasil yang dapat diperiksa.',
      'Hindari tujuan yang terlalu luas atau tidak terkait pengguna.',
    ],
    templateTitle: 'Format tujuan kegiatan',
    templateFields: [
      { label: 'Tujuan utama kegiatan' },
      { label: 'Tujuan tambahan (jika ada)' },
      { label: 'Kaitan tujuan dengan kebutuhan pengguna' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan tujuan kegiatan', 'Ringkasan kesepakatan tujuan dengan pengguna'],
    buktiClass: 'C',
  },
  {
    id: 'need-1.4',
    code: '1.4',
    mappingKind: 'gsbpm',
    title: 'Identifikasi Konsep Definisi',
    apa: 'Menyamakan pengertian istilah dan indikator yang akan diukur, serta bentuk hasil statistik yang diharapkan, agar hasil tidak ambigu.',
    contoh:
      'Pasangkan data yang dikumpulkan dengan output yang diharapkan — tanpa angka hasil fiktif.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Data → Output (1)',
        value:
          'Data: Penilaian masyarakat terhadap pelayanan\nOutput: Indikator kepuasan',
      },
      {
        label: 'Data → Output (2)',
        value:
          'Data: Karakteristik responden\nOutput: Tabulasi / gambaran hasil berdasarkan karakteristik tertentu',
      },
      {
        label: 'Definisi yang perlu disepakati',
        value:
          'Arti “kepuasan”, aspek pelayanan yang diukur, dan satuan penyajian hasil.',
      },
    ],
    lessonPoints: [
      'Setiap data yang dikumpulkan sebaiknya punya output yang jelas.',
      'Definisi istilah (misalnya “kepuasan”) disepakati sebelum instrumen dibuat.',
      'Jangan mengisi contoh dengan angka hasil statistik — fokus pada bentuk data dan output.',
    ],
    templateTitle: 'Format konsep-definisi & output',
    templateFields: [
      { label: 'Output utama yang diharapkan' },
      { label: 'Bentuk penyajian (tabel, indeks, laporan, dll.)' },
      { label: 'Indikator atau data yang akan diukur' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Daftar output yang diharapkan',
      'Catatan indikator atau data prioritas',
      'Contoh bentuk hasil yang diinginkan pengguna',
    ],
    buktiClass: 'C',
  },
  {
    id: 'need-1.5',
    code: '1.5',
    mappingKind: 'gsbpm',
    title: 'Pemeriksaan Ketersediaan & Kelayakan Data',
    apa: 'Memeriksa apakah data yang dibutuhkan sudah tersedia pada portal atau sumber rujukan sebelum memutuskan pengumpulan data baru. Ini membantu menghindari duplikasi kegiatan.',
    contoh:
      'Materi menunjuk pemeriksaan sumber/portal sebelum memutuskan pengumpulan baru.',
    contohClass: 'A',
    pdfPage: 15,
    materiExamples: [
      {
        title: 'SIRuSa',
        kind: 'other',
        note: 'Portal rujukan yang disebut dalam materi untuk pemeriksaan ketersediaan data.',
      },
      {
        title: 'Romantik',
        kind: 'other',
        note: 'Portal rujukan yang disebut dalam materi untuk pemeriksaan ketersediaan data.',
      },
      {
        title: 'Portal SDI',
        kind: 'other',
        note: 'Portal rujukan yang disebut dalam materi untuk pemeriksaan ketersediaan data.',
      },
    ],
    materiLesson:
      'Periksa apakah data sudah tersedia, dari mana sumbernya, apakah sesuai kebutuhan, dan apa tindak lanjut jika belum tersedia. StatPlan tidak mengisi isi portal — Anda yang mencatat hasil pengecekan.',
    contohDetail: [
      {
        label: 'Apakah data sudah tersedia?',
        value: 'Ya / sebagian / tidak — catat hasil pemeriksaan.',
      },
      {
        label: 'Dari mana sumber data diperoleh?',
        value: 'Catat portal atau sumber yang diperiksa (mis. SIRuSa, Romantik, Portal SDI).',
      },
      {
        label: 'Apakah data sesuai dengan kebutuhan?',
        value: 'Sesuai / sebagian / tidak sesuai — bandingkan dengan rumusan kebutuhan.',
      },
      {
        label: 'Jika belum tersedia, tindak lanjut',
        value:
          'Pertimbangkan pengumpulan baru atau gunakan data yang ada sebagai pendukung. Keputusan jenis kegiatan mengikuti hasil pemeriksaan.',
      },
    ],
    lessonPoints: [
      'Materi menekankan pemeriksaan sumber sebelum memutuskan pengumpulan baru.',
      'Portal yang disebut di materi: SIRuSa, Romantik, dan Portal SDI — tanpa mengarang isi portal.',
      'Isian contoh di bawah adalah format kerja StatPlan untuk membantu Anda mencatat hasil cek.',
    ],
    templateTitle: 'Format pemeriksaan data',
    templateFields: [
      { label: 'Portal / sumber yang dicek' },
      { label: 'Data yang ditemukan (jika ada)' },
      { label: 'Apakah sesuai kebutuhan? (ya / sebagian / tidak)' },
      { label: 'Keputusan sementara jenis kegiatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan hasil cek Sirusa / Romantik / Portal SDI',
      'Ringkasan kelayakan data terhadap kebutuhan',
      'Catatan keputusan jenis kegiatan beserta alasannya',
    ],
    buktiClass: 'B',
    buktiPdfPage: 15,
  },
  {
    id: 'need-1.6',
    code: '1.6',
    mappingKind: 'gsbpm',
    title: 'Penyusunan Proposal / KAK',
    apa: 'Mendokumentasikan temuan tahap kebutuhan ke dalam proposal atau Kerangka Acuan Kerja (KAK) agar kegiatan dapat dipertimbangkan untuk dilanjutkan. Format di StatPlan adalah format kerja — bukan template resmi BPS.',
    contoh:
      'Struktur pada Materi Proses Bisnis Hal. 16: Proses yang berjalan · Solusi · Biaya dan manfaat · Kendala.',
    contohClass: 'A',
    pdfPage: 16,
    materiExamples: [
      { title: 'Proses yang berjalan', kind: 'document' },
      { title: 'Solusi', kind: 'document' },
      { title: 'Biaya dan manfaat', kind: 'document' },
      { title: 'Kendala', kind: 'document' },
    ],
    materiLesson:
      'Format kerja StatPlan berdasarkan materi Hal. 16. Bagian di bawah adalah contoh ilustratif pengisian — bukan template resmi BPS.',
    contohDetail: [
      {
        label: 'Proses yang berjalan',
        value:
          'Pelayanan perizinan sudah berjalan, tetapi belum ada ringkasan sistematis mengenai kepuasan masyarakat terhadap layanan tersebut.',
      },
      {
        label: 'Solusi',
        value:
          'Melakukan kegiatan statistik untuk menghasilkan informasi kepuasan masyarakat sebagai bahan evaluasi pelayanan.',
      },
      {
        label: 'Biaya dan manfaat',
        value:
          'Biaya: sumber daya penyusunan dan pengumpulan (ringkas).\nManfaat: bahan evaluasi yang dapat dipakai unit pelayanan.',
      },
      {
        label: 'Kendala',
        value:
          'Ketersediaan waktu responden, kesiapan instrumen, dan koordinasi antar unit.',
      },
    ],
    lessonPoints: [
      'Empat bagian di atas mengikuti kerangka Materi Proses Bisnis Hal. 16.',
      'Isi contoh pengisian adalah ilustratif StatPlan — bukan salinan dokumen resmi.',
      'Gunakan Format kerja StatPlan untuk mengisi versi kegiatan Anda sendiri.',
    ],
    templateTitle: 'Format kerja StatPlan — draf proposal / KAK',
    templateFields: [
      { label: 'Proses / kondisi yang sedang berjalan' },
      { label: 'Solusi yang diusulkan' },
      { label: 'Biaya dan manfaat (ringkas)' },
      { label: 'Kendala yang perlu diperhatikan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Draf proposal atau KAK',
      'Ringkasan temuan tahap kebutuhan',
      'Catatan biaya–manfaat dan kendala (versi awal)',
    ],
    buktiClass: 'B',
    buktiPdfPage: 16,
  },
]

export function getGuidedNeedCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_NEED_CARDS.find((c) => c.id === id)
}

export function sourceBadgeLabel(
  cls: GuidedSourceClass,
  pdfPage?: number | string,
): string {
  if (cls === 'A' && pdfPage != null && pdfPage !== '') {
    return `Menurut Materi Proses Bisnis · Hal. ${pdfPage}`
  }
  if (cls === 'B' && pdfPage != null && pdfPage !== '') {
    return `Penjelasan sederhana · Hal. ${pdfPage}`
  }
  if (cls === 'B') return 'Penjelasan sederhana'
  return 'Contoh ilustratif'
}
