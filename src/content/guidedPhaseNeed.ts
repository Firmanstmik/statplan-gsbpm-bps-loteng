/**
 * Mode Terpandu — Identifikasi Kebutuhan learning cards.
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 *
 * Source classification (see docs/claude-source-inventory.md):
 *   A = teks/visual langsung dari Materi Proses Bisnis (wajib pdfPage)
 *   B = penjelasan sederhana (parafrase) atas materi
 *   C = contoh ilustratif buatan StatPlan
 *   D = isian pengguna (hanya di Format kerja — tidak pernah di file konten)
 *
 * Card ids use the official GSBPM 5.2 code (`gsbpm-1.1` …). Legacy positional ids
 * (`need-1.1` …) are migrated in src/lib/guidedSession.ts — never reuse them.
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
  /** Page of this specific example when it differs from the card page */
  pdfPage?: number | string
  /**
   * Public asset path of an image extracted byte-for-byte from the PDF (see public/materi).
   * Never a redrawn or reconstructed diagram.
   */
  imageSrc?: string
  imageWidth?: number
  imageHeight?: number
  /** Text alternative that describes what the source visual actually shows */
  imageAlt?: string
  /** Exact list from the PDF (e.g. sampling methods on Hal. 21) */
  items?: string[]
  /** Exact table text from the PDF (e.g. jadwal on Hal. 23) */
  table?: { columns: string[]; rows: string[][] }
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
  /** Beginner-friendly paraphrase of the subprocess */
  title: string
  /**
   * gsbpm = card maps to an official GSBPM 5.2 subprocess.
   * statplan = StatPlan learning/planning aid — NOT an official subprocess code.
   */
  mappingKind: 'gsbpm' | 'statplan'
  /** Official subprocess title exactly as written in the PDF */
  officialTitle?: string
  /** Type B — simple explanation */
  apa: string
  /** Type A — activity points for this subprocess, as written in the PDF */
  materiPoints?: string[]
  /** One-line summary of the example (class = contohClass) */
  contoh: string
  contohClass: GuidedSourceClass
  /** Page of the subprocess in the PDF. Number or range string (e.g. "32–36"). */
  pdfPage?: number | string
  /** Named Type A examples from the PDF (visual, list, or table). */
  materiExamples?: GuidedMateriExample[]
  /** What the user can learn from materiExamples (Type B paraphrase) */
  materiLesson?: string
  /** Structured worked example (Type C unless contohClass says otherwise). */
  contohDetail?: GuidedExampleRow[]
  /** Short learning bullets — “Yang bisa dipelajari” */
  lessonPoints?: string[]
  /** @deprecated Format kerja lives in the preparation def; kept optional for old data. */
  templateTitle?: string
  /** @deprecated see templateTitle */
  templateFields?: GuidedTemplateField[]
  buktiIntro?: string
  /** Fallback evidence labels when no preparation def exists */
  buktiItems?: string[]
  buktiClass: GuidedSourceClass
  buktiPdfPage?: number
}

/** Shared phase-intro shape used by all eight guided phases. */
export type GuidedPhaseIntro = {
  phaseId:
    | 'specify_need'
    | 'design'
    | 'build'
    | 'collect'
    | 'process'
    | 'analyse'
    | 'disseminate'
    | 'evaluate'
  title: string
  /** Title exactly as on the PDF phase slide */
  officialTitle: string
  question: string
  explanation: string
  gsbpmNote: string
  /** Page range of the phase in the PDF */
  pdfRange: string
  /** Type A — phase output documents listed on the PDF phase slide */
  outputs: string[]
  outputsPage: number
}

export const GSBPM_FLEXIBLE_NOTE =
  'StatPlan menggunakan urutan terpandu untuk membantu Anda mempelajari proses secara bertahap. GSBPM sendiri bersifat fleksibel dan tidak harus digunakan secara linear (Materi Proses Bisnis · Hal. 8).'

export const GUIDED_NEED_INTRO: GuidedPhaseIntro = {
  phaseId: 'specify_need',
  title: 'Identifikasi Kebutuhan',
  officialTitle: 'Specify Need (Identifikasi Kebutuhan)',
  question: 'Apa yang perlu dipahami sebelum mulai?',
  explanation:
    'Tahap ini membantu Anda memahami kebutuhan statistik, siapa yang memakai hasilnya, tujuan dan output, konsep yang akan diukur, serta apakah data yang sudah ada cukup sebelum merancang pengumpulan baru.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 10–16',
  outputs: [
    'Kerangka Acuan Kerja',
    'Dokumentasi rapat pembahasan kebutuhan data',
    'Daftar Kebutuhan Data (Daftar Data dan Data Prioritas)',
  ],
  outputsPage: 10,
}

/** Six official subprocesses of Specify Need (Materi Hal. 11–16). */
export const GUIDED_NEED_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-1.1',
    code: '1.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Identifikasi Kebutuhan',
    title: 'Merumuskan kebutuhan statistik',
    apa: 'Langkah pertama kegiatan statistik: merumuskan masalah yang ingin dijawab, lalu statistik (data atau indikator) apa yang diperlukan untuk menjawabnya.',
    materiPoints: [
      'Identifikasi kebutuhan merupakan langkah pertama dalam melakukan suatu kegiatan statistik yang ditentukan dari perumusan masalah yang dikembangkan.',
      'Identifikasi awal statistik yang diperlukan, baik berupa data maupun indikator.',
      'Identifikasi hal-hal yang dibutuhkan dari statistik tersebut.',
    ],
    pdfPage: 11,
    contoh:
      'Kegiatan: Survei Kepuasan Masyarakat (SKM) terhadap Pelayanan Perizinan — kebutuhan informasi untuk perbaikan layanan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Kegiatan', value: 'Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan' },
      {
        label: 'Masalah',
        value:
          'Belum tersedia informasi yang cukup mengenai pengalaman masyarakat setelah menerima pelayanan perizinan.',
      },
      {
        label: 'Mengapa dibutuhkan',
        value: 'Untuk mengetahui aspek pelayanan yang masih perlu diperbaiki.',
      },
      { label: 'Pengguna', value: 'DPMPTSP dan pihak terkait pelayanan publik.' },
      {
        label: 'Informasi (data / indikator)',
        value: 'Indikator kepuasan masyarakat per aspek pelayanan.',
      },
    ],
    lessonPoints: [
      'Kebutuhan berangkat dari masalah — bukan dari topik umum.',
      'Rumusan yang baik memuat kegiatan, masalah, alasan, pengguna, dan informasi yang diharapkan.',
      'Sebut data atau indikator yang dibutuhkan, belum perlu variabel rinci.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 10,
  },
  {
    id: 'gsbpm-1.2',
    code: '1.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Konsultasi & Konfirmasi Kebutuhan',
    title: 'Mengonfirmasi kebutuhan dengan pengguna',
    apa: 'Membicarakan kebutuhan dengan pemangku kepentingan agar jelas mengapa statistik diperlukan, apa yang diharapkan, kapan dibutuhkan, dan bagaimana menghitungnya.',
    materiPoints: [
      'Konsultasi dengan stakeholder dan melakukan konfirmasi secara rinci atas kebutuhan data statistik.',
      'Manfaat data statistik yang akan dikumpulkan harus dipahami secara detail agar penyelenggara kegiatan statistik dapat mengetahui mengapa statistik itu diperlukan, apa yang diharapkan, kapan didiseminasikan, bagaimana penghitungannya, dll.',
    ],
    pdfPage: 12,
    contoh:
      'Pengguna: DPMPTSP — membutuhkan gambaran kepuasan masyarakat untuk evaluasi pelayanan, paling lambat akhir tahun.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Pengguna', value: 'DPMPTSP' },
      {
        label: 'Mengapa diperlukan',
        value: 'Bahan evaluasi dan perbaikan pelayanan perizinan.',
      },
      {
        label: 'Apa yang diharapkan',
        value: 'Gambaran kepuasan masyarakat per aspek pelayanan.',
      },
      { label: 'Kapan didiseminasikan', value: 'Sebelum rapat evaluasi akhir tahun.' },
      {
        label: 'Bagaimana penghitungan',
        value: 'Disepakati bersama pengguna (mis. indeks per aspek) — dicatat, belum dihitung.',
      },
    ],
    lessonPoints: [
      'Materi menyebut empat hal yang dikonfirmasi: mengapa, apa, kapan, dan bagaimana.',
      'Konfirmasi dicatat — notulen menjadi bukti dukung.',
      'Konsultasi mencegah hasil yang akhirnya tidak dipakai.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 10,
  },
  {
    id: 'gsbpm-1.3',
    code: '1.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Penetapan Tujuan Output',
    title: 'Menetapkan tujuan dan output',
    apa: 'Merumuskan tujuan kegiatan beserta output statistik yang harus dihasilkan untuk menjawab kebutuhan pengguna, lalu memastikan langkah kegiatan sesuai dengan output tersebut.',
    materiPoints: [
      'Tujuan dapat berisi output statistik yang diperlukan.',
      'Output statistik dirumuskan untuk menjawab kebutuhan pengguna.',
      'Setelah tujuan ditentukan, perlu dilakukan kesesuaian antara output statistik yang diusulkan dalam tujuan dengan langkah-langkah yang akan dilakukan.',
    ],
    pdfPage: 13,
    contoh:
      'Tujuan: menghasilkan indikator kepuasan masyarakat terhadap pelayanan perizinan — output: tabel indeks per aspek.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Tujuan utama',
        value: 'Menghasilkan informasi mengenai kepuasan masyarakat terhadap pelayanan perizinan.',
      },
      {
        label: 'Output statistik',
        value: 'Tabel indeks kepuasan per aspek pelayanan; ringkasan menurut jenis layanan.',
      },
      {
        label: 'Menjawab kebutuhan',
        value: 'DPMPTSP dapat melihat aspek yang perlu diperbaiki (kebutuhan di 1.1).',
      },
      {
        label: 'Cek kesesuaian langkah',
        value: 'Output per aspek → instrumen harus menanyakan penilaian tiap aspek.',
      },
    ],
    lessonPoints: [
      'Tujuan yang baik menyebut output statistik, bukan hanya niat umum.',
      'Setiap output harus bisa ditelusuri ke kebutuhan pengguna.',
      'Periksa: apakah langkah kegiatan nanti benar-benar menghasilkan output ini?',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-1.4',
    code: '1.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Identifikasi Konsep Definisi',
    title: 'Menyepakati konsep dan definisi',
    apa: 'Menentukan konsep dan definisi (kondef) dari indikator yang akan diukur, sesuai tujuan. Kondef diambil dari rujukan yang jelas dan sebaiknya mengikuti standar statistik, agar semua pihak memaknai istilah dengan sama.',
    materiPoints: [
      'Identifikasi konsep dan definisi dari indikator yang akan diukur (sesuai tujuan).',
      'Kondef berdasarkan referensi berbagai sumber.',
      'Kondef sebaiknya sesuai standar statistik.',
    ],
    pdfPage: 14,
    contoh:
      'Konsep “kepuasan masyarakat” didefinisikan dan dicatat sumber rujukannya sebelum instrumen disusun.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Indikator', value: 'Indeks kepuasan masyarakat terhadap pelayanan perizinan' },
      { label: 'Konsep', value: 'Kepuasan masyarakat' },
      {
        label: 'Definisi (draf)',
        value:
          'Pendapat masyarakat setelah menerima pelayanan, dibandingkan dengan harapannya, untuk tiap aspek pelayanan.',
      },
      {
        label: 'Rujukan',
        value:
          'Pedoman penyusunan SKM yang berlaku di instansi Anda; periksa apakah sudah ada standar statistiknya.',
      },
      {
        label: 'Istilah lain yang perlu disepakati',
        value: '“Pengguna layanan”, “aspek pelayanan”, periode pelayanan yang dinilai.',
      },
    ],
    lessonPoints: [
      'Kondef ditetapkan untuk indikator yang akan diukur — bukan untuk semua kata.',
      'Selalu catat rujukan; materi menganjurkan mengikuti standar statistik.',
      'Kondef yang disepakati sekarang akan dipakai di Merancang Variabel (2.2) dan uji coba (3.6).',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-1.5',
    code: '1.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Pemeriksaan Ketersediaan & Kelayakan Data',
    title: 'Memeriksa data yang sudah tersedia',
    apa: 'Sebelum mengumpulkan data baru, periksa apakah data yang dibutuhkan sudah tersedia pada portal rujukan. Hasilnya menentukan apakah kegiatan cukup berupa kompilasi atau memerlukan sensus/survei.',
    materiPoints: [
      'Untuk menghindari duplikasi data, cek terlebih dahulu ketersediaan data pada berbagai portal data yang menjadi rujukan statistik, seperti: sirusa.web.bps.go.id, romantik.bps.go.id, portal SDI, dll.',
      'Jika data sesuai kebutuhan, maka kegiatan statistik (yang akan dilakukan) bersifat kompilasi data.',
      'Jika data yang tersedia belum sesuai kebutuhan, maka kegiatan statistik dapat berupa sensus/survei.',
      'Data yang tersedia dapat digunakan sebagai data pendukung terhadap hasil sensus/survei.',
    ],
    pdfPage: 15,
    contoh:
      'Cek SIRuSa, Romantik, dan Portal SDI — catat apa yang ditemukan dan keputusan sementara jenis kegiatan.',
    contohClass: 'C',
    materiExamples: [
      {
        title: 'Portal rujukan yang disebut materi',
        kind: 'other',
        items: ['sirusa.web.bps.go.id', 'romantik.bps.go.id', 'Portal SDI'],
        note: 'StatPlan tidak terhubung ke portal ini — Anda mencatat hasil pengecekan sendiri.',
      },
    ],
    contohDetail: [
      { label: 'Data yang dicari', value: 'Indikator kepuasan pelayanan perizinan kabupaten' },
      { label: 'Portal diperiksa', value: 'SIRuSa, Romantik, Portal SDI' },
      {
        label: 'Hasil',
        value: 'Belum ditemukan data kepuasan per aspek untuk layanan ini.',
      },
      {
        label: 'Keputusan sementara',
        value: 'Data belum sesuai kebutuhan → kegiatan berupa survei (sesuai logika Hal. 15).',
      },
    ],
    lessonPoints: [
      'Pemeriksaan portal mencegah duplikasi kegiatan statistik.',
      'Data sesuai kebutuhan → kompilasi; belum sesuai → sensus/survei.',
      'Data yang ada tetap berguna sebagai data pendukung.',
    ],
    buktiClass: 'B',
    buktiPdfPage: 15,
  },
  {
    id: 'gsbpm-1.6',
    code: '1.6',
    mappingKind: 'gsbpm',
    officialTitle: 'Penyusunan Proposal Kegiatan / Kerangka Acuan Kerja (KAK)',
    title: 'Menyusun proposal / KAK',
    apa: 'Mendokumentasikan temuan subproses 1.1–1.5 menjadi proposal kegiatan (KAK) untuk mendapatkan persetujuan menjalankan proses bisnis statistik yang baru atau yang dimodifikasi.',
    materiPoints: [
      'Mendokumentasikan hasil temuan ataupun kesimpulan dari subproses-subproses lain pada tahapan penentuan kebutuhan dalam bentuk proposal kegiatan untuk mendapatkan persetujuan.',
      'Proposal berisi: uraian tentang proses bisnis statistik yang sedang berjalan.',
      'Uraian tentang solusi atau proses bisnis yang diusulkan.',
      'Penilaian terkait biaya dan manfaat, serta kendala eksternal yang mungkin terjadi.',
    ],
    pdfPage: 16,
    contoh:
      'Empat bagian isi proposal mengikuti Hal. 16; isian di bawah adalah contoh ilustratif untuk SKM.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Proses yang sedang berjalan',
        value:
          'Pelayanan perizinan sudah berjalan, tetapi belum ada ringkasan sistematis mengenai kepuasan masyarakat.',
      },
      {
        label: 'Solusi yang diusulkan',
        value: 'Kegiatan SKM untuk menghasilkan indeks kepuasan per aspek sebagai bahan evaluasi.',
      },
      {
        label: 'Biaya dan manfaat',
        value: 'Biaya: petugas, pencetakan/aplikasi, waktu. Manfaat: dasar perbaikan layanan.',
      },
      {
        label: 'Kendala eksternal',
        value: 'Ketersediaan waktu responden, koordinasi antar unit.',
      },
    ],
    lessonPoints: [
      'Proposal/KAK merangkum 1.1–1.5 — bukan dokumen yang berdiri sendiri.',
      'Materi menyebut tiga isi pokok: proses berjalan, solusi, biaya-manfaat & kendala.',
      'Tujuan akhirnya adalah persetujuan untuk melanjutkan kegiatan.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 10,
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
  return 'Contoh ilustratif StatPlan'
}
