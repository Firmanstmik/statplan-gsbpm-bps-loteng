/**
 * Example Walkthrough — presentation-only case study (Slice 1 + BPS demo alignment).
 * Never mutates Workspace checklist / domain / export / canonical demo projects.
 *
 * Interaction language: Apa? → Contoh → Template → Bukti dukung → Sudah dipahami
 * Progressive phases: current process only; next unlocks after understood.
 */
import type { GsbpmPhaseId, JenisKegiatan } from '@/domain/types'

export type ExampleSourceType = 'pdf' | 'illustrative'

export type TemplateFieldPreview = {
  label: string
  /** Short illustrative fill so the format feels “alive” */
  example?: string
}

export type TemplateCard = {
  title: string
  description: string
  /**
   * preview = format kerja / struktur materi ditampilkan di UI.
   * coming_soon hanya jika benar-benar belum ada struktur (hindari untuk demo).
   */
  status: 'preview' | 'coming_soon'
  sourceType: ExampleSourceType
  pdfPage?: number | string
  /** Bagian format yang dapat dipelajari — menggantikan “unduhan belum tersedia” */
  fields?: TemplateFieldPreview[]
  note?: string
}

export type ContohDetailRow = {
  label: string
  value: string
}

export type PrepareItem = {
  id: string
  /** Quiet GSBPM code */
  subprocess: string
  title: string
  apa: string
  /** Ringkasan contoh (2–4 baris ideal) */
  contoh: string
  /** Contoh lengkap — progressive disclosure di UI */
  contohDetail?: ContohDetailRow[]
  /** Poin pembelajaran singkat */
  lessonPoints?: string[]
  template: TemplateCard
  buktiDukung: string
  sourceType: ExampleSourceType
  pdfPage?: number | string
}

export type ExamplePreparePhase = {
  phaseId: GsbpmPhaseId
  code: string
  titleId: string
  /** Apa ini? */
  intro: string
  /** Kenapa diperlukan? */
  why: string
  items: PrepareItem[]
}

export type ScheduleMonthBlock = {
  month: string
  activities: string[]
}

export type ExampleJourney = {
  slug: string
  projectId: string
  title: string
  jenis: JenisKegiatan
  whatToKnow: string
  plannedResult: string
  howDataObtained: string
  afterData: string
  /** Why the activity is conducted (illustrative) */
  whyConducted: string
  flowLabels: string[]
  schedule: {
    sourceType: ExampleSourceType
    pdfPage?: number
    note: string
    sourceRows?: { activity: string; period: string }[]
    months: ScheduleMonthBlock[]
  }
  /** Legacy alias: Specify Need items (phase 1) — kept for QA / consumers */
  prepareItems: PrepareItem[]
  /** Progressive preparation phases (Need → Evaluate) */
  preparePhases: ExamplePreparePhase[]
  summary: {
    need: string
    result: string
    schedule: string
    prepare: string
  }
}

export const EXAMPLE_WALKTHROUGH_STEPS = [
  { id: 1, label: 'Alur' },
  { id: 2, label: 'Jadwal' },
  { id: 3, label: 'Persiapan' },
  { id: 4, label: 'Ringkasan' },
] as const

const TPL_KEBUTUHAN: TemplateCard = {
  title: 'Format kerja StatPlan — rumusan kebutuhan',
  description:
    'Kerangka sederhana untuk menulis kebutuhan statistik. Bukan template resmi BPS.',
  status: 'preview',
  sourceType: 'illustrative',
  fields: [
    { label: 'Kegiatan / topik', example: '…' },
    { label: 'Masalah / kondisi saat ini', example: '…' },
    { label: 'Mengapa informasi dibutuhkan', example: '…' },
    { label: 'Pengguna informasi', example: '…' },
    { label: 'Informasi yang diharapkan', example: '…' },
  ],
  note: 'Isi contoh di kartu di atas adalah ilustratif. Salin strukturnya ke kegiatan Anda.',
}

const TPL_PENGGUNA: TemplateCard = {
  title: 'Format kerja StatPlan — kebutuhan pengguna',
  description: 'Catat siapa yang memakai hasil dan dalam bentuk apa.',
  status: 'preview',
  sourceType: 'illustrative',
  fields: [
    { label: 'Pengguna', example: '…' },
    { label: 'Informasi yang dibutuhkan', example: '…' },
    { label: 'Keperluan', example: '…' },
    { label: 'Bentuk informasi', example: 'Ringkasan / tabel / indikator' },
  ],
}

const TPL_TUJUAN: TemplateCard = {
  title: 'Format kerja StatPlan — tujuan & output',
  description: 'Tujuan utama dan tujuan khusus yang dapat diperiksa.',
  status: 'preview',
  sourceType: 'illustrative',
  fields: [
    { label: 'Tujuan utama', example: '…' },
    { label: 'Tujuan khusus', example: '• …\n• …' },
    { label: 'Kaitan dengan kebutuhan pengguna', example: '…' },
  ],
}

const TPL_KONDEF: TemplateCard = {
  title: 'Format kerja StatPlan — konsep & definisi',
  description:
    'Samakan pengertian istilah/indikator (materi menekankan kondef sesuai tujuan). Bukan katalog resmi.',
  status: 'preview',
  sourceType: 'illustrative',
  fields: [
    { label: 'Istilah / indikator', example: '…' },
    { label: 'Definisi yang dipakai', example: '…' },
    { label: 'Referensi (jika ada)', example: '…' },
    { label: 'Data → Output', example: 'Data: … → Output: …' },
  ],
  note: 'Materi: kondef sebaiknya sesuai standar statistik bila tersedia (Hal. 14).',
}

const TPL_PORTAL: TemplateCard = {
  title: 'Format kerja StatPlan — pemeriksaan data',
  description:
    'Berdasarkan Materi Proses Bisnis Hal. 15: cek portal rujukan sebelum pengumpulan baru.',
  status: 'preview',
  sourceType: 'pdf',
  pdfPage: 15,
  fields: [
    { label: 'Portal / sumber dicek', example: 'SIRuSa · Romantik · Portal SDI' },
    { label: 'Apakah data tersedia?', example: 'Ya / sebagian / tidak' },
    { label: 'Apakah sesuai kebutuhan?', example: 'Sesuai / sebagian / tidak' },
    {
      label: 'Tindak lanjut',
      example: 'Kompilasi / survei / sensus — sesuai hasil cek (isi Anda)',
    },
  ],
  note: 'StatPlan tidak mengisi isi portal. Anda yang mencatat hasil pengecekan.',
}

const TPL_KAK: TemplateCard = {
  title: 'Format kerja StatPlan — proposal / KAK',
  description:
    'Struktur berdasarkan Materi Proses Bisnis Hal. 16. Format kerja StatPlan — bukan template resmi BPS.',
  status: 'preview',
  sourceType: 'pdf',
  pdfPage: 16,
  fields: [
    { label: 'Proses yang berjalan', example: '…' },
    { label: 'Solusi yang diusulkan', example: '…' },
    { label: 'Biaya dan manfaat', example: '…' },
    { label: 'Kendala', example: '…' },
  ],
  note: 'Isian contoh di kartu = ilustratif. Struktur empat bagian = dari materi.',
}

const TPL_JADWAL: TemplateCard = {
  title: 'Contoh jadwal kegiatan (materi)',
  description: 'Bentuk jadwal Juli–Desember seperti pada materi (contoh SKM). Bukan durasi wajib.',
  status: 'preview',
  sourceType: 'pdf',
  pdfPage: 23,
  fields: [
    { label: 'Identifikasi kebutuhan', example: 'Juli – Agustus' },
    { label: 'Perancangan instrumen', example: 'Agustus – September' },
    { label: 'Pelatihan petugas', example: 'September' },
    { label: 'Pengumpulan data', example: 'September – Oktober' },
    { label: 'Pengolahan data', example: 'November' },
    { label: 'Analisis hasil SKM', example: 'November – Desember' },
    { label: 'Penyusunan laporan', example: 'Desember' },
    { label: 'Evaluasi', example: 'Desember' },
  ],
  note: 'Menurut Materi Proses Bisnis · Hal. 23 — contoh bentuk, bukan jadwal wajib proyek Anda.',
}

const TPL_FORMAT: TemplateCard = {
  title: 'Format kerja StatPlan',
  description:
    'Kerangka perencanaan ilustratif untuk memahami apa yang biasanya disiapkan pada tahap ini.',
  status: 'preview',
  sourceType: 'illustrative',
  fields: [
    { label: 'Yang akan disiapkan', example: '…' },
    { label: 'Catatan / batasannya', example: '…' },
  ],
}

function phaseOverviewItem(
  id: string,
  subprocess: string,
  title: string,
  apa: string,
  contoh: string,
  prepareList: string,
  opts?: {
    template?: TemplateCard
    contohDetail?: ContohDetailRow[]
    lessonPoints?: string[]
    sourceType?: ExampleSourceType
    pdfPage?: number | string
  },
): PrepareItem {
  return {
    id,
    subprocess,
    title,
    apa,
    contoh,
    contohDetail: opts?.contohDetail,
    lessonPoints: opts?.lessonPoints,
    template: opts?.template ?? TPL_FORMAT,
    buktiDukung: prepareList,
    sourceType: opts?.sourceType ?? 'illustrative',
    pdfPage: opts?.pdfPage,
  }
}

function buildLaterPhases(ctx: {
  designContoh: string
  designDetail: ContohDetailRow[]
  buildContoh: string
  buildDetail: ContohDetailRow[]
  collectContoh: string
  collectDetail: ContohDetailRow[]
  processContoh: string
  processDetail: ContohDetailRow[]
  analyseContoh: string
  analyseDetail: ContohDetailRow[]
  disseminateContoh: string
  disseminateDetail: ContohDetailRow[]
  evaluateContoh: string
  evaluateDetail: ContohDetailRow[]
}): ExamplePreparePhase[] {
  const designTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rancangan awal',
    description:
      'Struktur belajar dari materi Design. Preview format — bukan unduhan template resmi.',
    status: 'preview',
    sourceType: 'pdf',
    pdfPage: 18,
    fields: [
      { label: 'Judul output / tabulasi', example: '…' },
      { label: 'Variabel utama', example: '…' },
      { label: 'Cara / metode / moda', example: '…' },
      { label: 'Sampling (jika relevan)', example: 'Ya/Tidak · metode…' },
    ],
    note: 'Contoh Rancangan Tabulasi: Materi Proses Bisnis · Hal. 18.',
  }
  const buildTpl: TemplateCard = {
    title: 'Format kerja StatPlan — persiapan Build',
    description: 'Berdasarkan prinsip instrumen & komponen di materi (Hal. 25–30).',
    status: 'preview',
    sourceType: 'pdf',
    pdfPage: 25,
    fields: [
      { label: 'Nama instrumen', example: '…' },
      { label: 'Jenis instrumen', example: '…' },
      { label: 'Aturan validasi (draft)', example: '…' },
      { label: 'Aturan tabulasi (draft)', example: '…' },
      { label: 'Ruang lingkup pilot', example: '…' },
    ],
  }
  const collectTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rencana Collect',
    description: 'Rencana pengumpulan (materi Hal. 32–36) — bukan runner lapangan.',
    status: 'preview',
    sourceType: 'illustrative',
    fields: [
      { label: 'Sasaran / sampel (jika relevan)', example: '…' },
      { label: 'Peran petugas', example: '…' },
      { label: 'Cara / instrumen / moda / periode', example: '…' },
      { label: 'Hal yang dipantau', example: '…' },
    ],
  }
  const processTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rencana Process',
    description: 'Rencana pengolahan berdasarkan materi Hal. 37–45.',
    status: 'preview',
    sourceType: 'pdf',
    pdfPage: 39,
    fields: [
      { label: 'Sumber / integrasi', example: '…' },
      { label: 'Coding (variabel → kode)', example: '…' },
      { label: 'Agregasi / pengelompokan', example: '…' },
      { label: 'Weighting relevan?', example: 'Ya / Tidak' },
    ],
  }
  const analyseTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rencana Analyse',
    description: 'Rencana analisis & kerahasiaan (materi Hal. 46–51).',
    status: 'preview',
    sourceType: 'pdf',
    pdfPage: 50,
    fields: [
      { label: 'Pertanyaan analisis', example: '…' },
      { label: 'Output awal', example: '…' },
      { label: 'Pemeriksaan konsistensi', example: '…' },
      { label: 'Catatan disclosure', example: '…' },
    ],
  }
  const dissTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rencana Disseminate',
    description: 'Rencana produk & layanan pengguna (konsep materi Hal. 52–57).',
    status: 'preview',
    sourceType: 'illustrative',
    fields: [
      { label: 'Nama produk', example: '…' },
      { label: 'Bentuk / kanal', example: '…' },
      { label: 'Pengguna sasaran', example: '…' },
      { label: 'FAQ / dukungan', example: '…' },
    ],
  }
  const evalTpl: TemplateCard = {
    title: 'Format kerja StatPlan — rencana Evaluate',
    description: 'Rencana evaluasi & tindak lanjut (materi Hal. 60–63).',
    status: 'preview',
    sourceType: 'illustrative',
    fields: [
      { label: 'Sumber masukan', example: '…' },
      { label: 'Aspek yang dievaluasi', example: '…' },
      { label: 'Usulan perbaikan', example: '…' },
      { label: 'Tindak lanjut / monitoring', example: '…' },
    ],
  }

  return [
    {
      phaseId: 'design',
      code: '2',
      titleId: 'Perancangan',
      intro:
        'Tahap merancang bagaimana kegiatan akan dijalankan: output, variabel, cara pengumpulan, dan alur kerja.',
      why: 'Tanpa rancangan yang jelas, pengumpulan data dan hasil bisa tidak sesuai kebutuhan.',
      items: [
        phaseOverviewItem(
          'p-2.overview',
          '2',
          'Gambaran perancangan',
          'Menyusun rancangan awal output, variabel, dan cara pengumpulan sebelum membangun instrumen.',
          ctx.designContoh,
          'Yang biasanya disiapkan: daftar output/tabulasi, daftar variabel, catatan cara/metode/moda, catatan sampling (jika relevan), jadwal, SOP.',
          {
            contohDetail: ctx.designDetail,
            lessonPoints: [
              'Materi Hal. 18: Contoh Rancangan Tabulasi.',
              'Bedakan cara, metode, moda (Hal. 20).',
              'Jadwal contoh SKM Hal. 23 — bukan durasi wajib.',
            ],
            sourceType: 'pdf',
            pdfPage: 18,
            template: designTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'build',
      code: '3',
      titleId: 'Pembangunan',
      intro:
        'Tahap menyiapkan instrumen, alur kerja, dan komponen yang dibutuhkan sebelum pengumpulan.',
      why: 'Persiapan yang matang mengurangi kesalahan saat pelaksanaan lapangan atau kompilasi.',
      items: [
        phaseOverviewItem(
          'p-3.overview',
          '3',
          'Gambaran pembangunan',
          'Menyiapkan instrumen dan komponen pendukung sebelum data dikumpulkan.',
          ctx.buildContoh,
          'Yang biasanya disiapkan: draf instrumen, aturan validasi, aturan tabulasi, alur/pembagian kerja, rencana pilot.',
          {
            contohDetail: ctx.buildDetail,
            lessonPoints: [
              'Contoh Aturan Validasi Hal. 26; Aturan Tabulasi Hal. 27.',
              'Hal. 28: struktur & alur hortikultura (Type A).',
              'Pilot: questionnaire, methodology, processing, dummy table (Hal. 30).',
            ],
            sourceType: 'pdf',
            pdfPage: 25,
            template: buildTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'collect',
      code: '4',
      titleId: 'Pengumpulan Data',
      intro: 'Tahap merencanakan dan memahami bagaimana data akan dikumpulkan.',
      why: 'Tanpa rencana pengumpulan, jadwal, peran, dan kualitas data mudah terabaikan.',
      items: [
        phaseOverviewItem(
          'p-4.overview',
          '4',
          'Gambaran pengumpulan',
          'Merencanakan siapa yang mengumpulkan, bagaimana, dan kapan.',
          ctx.collectContoh,
          'Yang biasanya disiapkan: kerangka/sampel (jika survei), daftar peran, rencana pelaksanaan, pemantauan, catatan finalisasi.',
          {
            contohDetail: ctx.collectDetail,
            lessonPoints: [
              'Sampling terutama untuk survei; sensus/kompilasi berbeda.',
              'StatPlan menyusun rencana — bukan menjalankan pengumpulan responden.',
            ],
            sourceType: 'pdf',
            pdfPage: '32–36',
            template: collectTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'process',
      code: '5',
      titleId: 'Pengolahan Data',
      intro: 'Tahap merencanakan bagaimana data dibersihkan, dikode, dan disusun.',
      why: 'Rencana pengolahan membantu menjaga konsistensi sebelum analisis.',
      items: [
        phaseOverviewItem(
          'p-5.overview',
          '5',
          'Gambaran pengolahan',
          'Menyiapkan catatan sumber, coding, dan pemeriksaan kualitas data.',
          ctx.processContoh,
          'Yang biasanya disiapkan: rencana integrasi, agregasi, coding, unit baru (jika perlu), weighting (jika relevan).',
          {
            contohDetail: ctx.processDetail,
            lessonPoints: [
              'Contoh coding Hal. 39.',
              'Weighting tidak sama untuk sensus/kompilasi seperti survei (Hal. 43).',
              'Jangan mengisi angka hasil fiktif.',
            ],
            sourceType: 'pdf',
            pdfPage: 39,
            template: processTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'analyse',
      code: '6',
      titleId: 'Analisis Data',
      intro: 'Tahap merencanakan bagaimana hasil dibaca dan disusun menjadi informasi.',
      why: 'Analisis yang direncanakan menjaga agar output sesuai pertanyaan awal.',
      items: [
        phaseOverviewItem(
          'p-6.overview',
          '6',
          'Gambaran analisis',
          'Menyiapkan catatan apa yang akan dilihat dari data dan bentuk penyajian awal.',
          ctx.analyseContoh,
          'Yang biasanya disiapkan: tujuan analisis, output awal, pemeriksaan, catatan disclosure, output akhir.',
          {
            contohDetail: ctx.analyseDetail,
            lessonPoints: [
              'Disclosure Hal. 50: anonimisasi, agregat n < 3, sensitivitas kompilasi.',
              'Jangan membuat hasil statistik palsu.',
            ],
            sourceType: 'pdf',
            pdfPage: 50,
            template: analyseTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'disseminate',
      code: '7',
      titleId: 'Penyajian & Penyebarluasan',
      intro: 'Tahap merencanakan bagaimana hasil dibagikan kepada pengguna.',
      why: 'Tanpa rencana diseminasi, hasil sulit dipakai orang yang membutuhkan.',
      items: [
        phaseOverviewItem(
          'p-7.overview',
          '7',
          'Gambaran diseminasi',
          'Merencanakan produk, saluran, dan dukungan pengguna — sebagai rencana, bukan publikasi aktual.',
          ctx.disseminateContoh,
          'Yang biasanya disiapkan: rencana produk, rilis, kanal, promosi/pengenalan, FAQ/dukungan.',
          {
            contohDetail: ctx.disseminateDetail,
            lessonPoints: [
              'Rencana diseminasi ≠ produk sudah dipublikasikan.',
              'Jangan membuat portal BPS palsu.',
            ],
            sourceType: 'illustrative',
            template: dissTpl,
          },
        ),
      ],
    },
    {
      phaseId: 'evaluate',
      code: '8',
      titleId: 'Evaluasi',
      intro:
        'Tahap merencanakan bagaimana kegiatan ditinjau dan diperbaiki untuk siklus berikutnya.',
      why: 'Evaluasi membantu pembelajaran — tanpa menilai skor otomatis di StatPlan.',
      items: [
        phaseOverviewItem(
          'p-8.overview',
          '8',
          'Gambaran evaluasi',
          'Merencanakan masukan, aspek yang ditinjau, dan rencana tindak lanjut.',
          ctx.evaluateContoh,
          'Yang biasanya disiapkan: sumber masukan, aspek evaluasi, observasi, usulan perbaikan, rencana tindak lanjut.',
          {
            contohDetail: ctx.evaluateDetail,
            lessonPoints: [
              'Bahan evaluasi: feedback, paradata, metrics, staff feedback (Hal. 60–63).',
              'Struktur tindak lanjut — bukan skor palsu.',
            ],
            sourceType: 'pdf',
            pdfPage: '60–63',
            template: evalTpl,
          },
        ),
      ],
    },
  ]
}

function withPreparePhases(
  needItems: PrepareItem[],
  later: ReturnType<typeof buildLaterPhases>,
): { prepareItems: PrepareItem[]; preparePhases: ExamplePreparePhase[] } {
  const needPhase: ExamplePreparePhase = {
    phaseId: 'specify_need',
    code: '1',
    titleId: 'Identifikasi Kebutuhan',
    intro:
      'Ini adalah tahap untuk memahami kebutuhan kegiatan statistik sebelum merancang pengumpulan.',
    why: 'Jika kebutuhan belum jelas, kegiatan mudah melenceng dari pertanyaan yang ingin dijawab.',
    items: needItems,
  }
  return { prepareItems: needItems, preparePhases: [needPhase, ...later] }
}

const SKM_NEED: PrepareItem[] = [
  {
    id: 'p-1.1',
    subprocess: '1.1',
    title: 'Menentukan masalah / kebutuhan',
    apa: 'Menjelaskan kebutuhan informasi atau masalah yang ingin dijawab melalui kegiatan statistik sebelum memilih cara pengumpulan.',
    contoh:
      'Kegiatan: Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan — kebutuhan informasi untuk perbaikan layanan.',
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
        value: 'Gambaran kepuasan masyarakat terhadap beberapa aspek pelayanan.',
      },
    ],
    lessonPoints: [
      'Rumusan kebutuhan memuat kegiatan, masalah, alasan, pengguna, dan informasi yang diharapkan.',
      'Ini contoh ilustratif StatPlan — bukan data kegiatan nyata.',
    ],
    template: {
      ...TPL_KEBUTUHAN,
      fields: [
        {
          label: 'Kegiatan / topik',
          example: 'Survei Kepuasan Masyarakat terhadap Pelayanan Perizinan',
        },
        {
          label: 'Masalah / kondisi saat ini',
          example: 'Belum ada ringkasan pengalaman masyarakat setelah pelayanan',
        },
        {
          label: 'Mengapa informasi dibutuhkan',
          example: 'Untuk mengetahui aspek yang perlu diperbaiki',
        },
        { label: 'Pengguna informasi', example: 'DPMPTSP dan pihak terkait' },
        {
          label: 'Informasi yang diharapkan',
          example: 'Gambaran kepuasan terhadap beberapa aspek pelayanan',
        },
      ],
    },
    buktiDukung:
      'Catatan rumusan masalah / kebutuhan · surat atau usulan kebutuhan · catatan rapat awal.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.2',
    subprocess: '1.2',
    title: 'Kebutuhan pengguna',
    apa: 'Memastikan siapa yang membutuhkan hasil, informasi apa yang mereka perlukan, dan untuk keperluan apa.',
    contoh: 'Pengguna: DPMPTSP — membutuhkan gambaran kepuasan untuk evaluasi pelayanan.',
    contohDetail: [
      { label: 'Pengguna', value: 'DPMPTSP' },
      {
        label: 'Informasi yang dibutuhkan',
        value: 'Pengalaman dan tingkat kepuasan masyarakat terhadap pelayanan perizinan.',
      },
      { label: 'Keperluan', value: 'Bahan evaluasi dan perbaikan pelayanan.' },
      {
        label: 'Bentuk informasi',
        value: 'Ringkasan indikator / tabel / gambaran hasil.',
      },
    ],
    lessonPoints: [
      'Bedakan siapa pengguna, apa yang dibutuhkan, dan untuk keperluan apa.',
      'Bentuk informasi ikut dikonfirmasi sejak awal.',
    ],
    template: {
      ...TPL_PENGGUNA,
      fields: [
        { label: 'Pengguna', example: 'DPMPTSP' },
        {
          label: 'Informasi yang dibutuhkan',
          example: 'Pengalaman dan tingkat kepuasan masyarakat',
        },
        { label: 'Keperluan', example: 'Evaluasi dan perbaikan pelayanan' },
        {
          label: 'Bentuk informasi',
          example: 'Ringkasan indikator / tabel / gambaran hasil',
        },
      ],
    },
    buktiDukung: 'Notulen konsultasi · catatan konfirmasi kebutuhan · daftar pemangku kepentingan.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.3',
    subprocess: '1.3',
    title: 'Tujuan dan hasil',
    apa: 'Merumuskan tujuan kegiatan dan bentuk hasil statistik yang diharapkan, dalam bahasa yang dapat diperiksa.',
    contoh:
      'Tujuan utama: menghasilkan informasi kepuasan masyarakat terhadap pelayanan perizinan.',
    contohDetail: [
      {
        label: 'Tujuan utama',
        value:
          'Menghasilkan informasi mengenai kepuasan masyarakat terhadap pelayanan perizinan.',
      },
      {
        label: 'Tujuan khusus',
        value:
          '• Mengidentifikasi aspek pelayanan yang dinilai masyarakat.\n• Menghasilkan informasi untuk evaluasi.\n• Menyediakan gambaran hasil berdasarkan karakteristik relevan.',
      },
    ],
    lessonPoints: [
      'Tujuan utama menjawab kebutuhan secara ringkas.',
      'Tujuan khusus memecah tujuan menjadi hasil yang dapat diperiksa.',
    ],
    template: {
      ...TPL_TUJUAN,
      fields: [
        {
          label: 'Tujuan utama',
          example: 'Menghasilkan informasi kepuasan terhadap pelayanan perizinan',
        },
        {
          label: 'Tujuan khusus',
          example:
            '• Identifikasi aspek pelayanan\n• Informasi untuk evaluasi\n• Gambaran menurut karakteristik',
        },
        {
          label: 'Kaitan dengan kebutuhan pengguna',
          example: 'Mendukung evaluasi pelayanan DPMPTSP',
        },
      ],
    },
    buktiDukung: 'Catatan tujuan kegiatan · ringkasan kesepakatan tujuan dengan pengguna.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.4',
    subprocess: '1.4',
    title: 'Konsep dan definisi',
    apa: 'Menyamakan pengertian istilah dan indikator yang akan diukur (materi menekankan kondef sesuai tujuan).',
    contoh:
      'Pasangkan data yang dikumpulkan dengan output yang diharapkan — tanpa angka hasil fiktif.',
    contohDetail: [
      {
        label: 'Data → Output (1)',
        value: 'Data: Penilaian masyarakat terhadap pelayanan\nOutput: Indikator kepuasan',
      },
      {
        label: 'Data → Output (2)',
        value:
          'Data: Karakteristik responden\nOutput: Tabulasi / gambaran menurut karakteristik',
      },
      {
        label: 'Definisi yang perlu disepakati',
        value: 'Arti “kepuasan”, aspek pelayanan yang diukur, satuan penyajian.',
      },
    ],
    lessonPoints: [
      'Materi Hal. 14: identifikasi konsep-definisi sesuai tujuan; sebaiknya sesuai standar statistik bila ada.',
      'Setiap data sebaiknya punya output yang jelas.',
    ],
    template: {
      ...TPL_KONDEF,
      fields: [
        { label: 'Istilah / indikator', example: 'Kepuasan pelayanan' },
        {
          label: 'Definisi yang dipakai',
          example: 'Persepsi responden terhadap unsur pelayanan yang ditetapkan',
        },
        { label: 'Referensi (jika ada)', example: 'Sesuai kebijakan unit / standar terkait' },
        {
          label: 'Data → Output',
          example: 'Penilaian aspek → indikator kepuasan',
        },
      ],
    },
    buktiDukung: 'Daftar konsep-definisi · daftar output · catatan indikator prioritas.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.5',
    subprocess: '1.5',
    title: 'Pemeriksaan data',
    apa: 'Memeriksa apakah data yang dibutuhkan sudah tersedia pada portal/sumber rujukan sebelum merancang pengumpulan baru.',
    contoh:
      'Periksa SIRuSa, Romantik, Portal SDI: apakah data ada, sesuai kebutuhan, dan apa tindak lanjutnya.',
    contohDetail: [
      {
        label: 'Portal / sumber yang dicek',
        value: 'SIRuSa · Romantik · Portal SDI (sesuai materi Hal. 15).',
      },
      {
        label: 'Apakah data sudah tersedia?',
        value: 'Ya / sebagian / tidak — catat hasil pemeriksaan Anda.',
      },
      {
        label: 'Apakah sesuai kebutuhan?',
        value: 'Sesuai / sebagian / tidak — bandingkan dengan rumusan kebutuhan.',
      },
      {
        label: 'Tindak lanjut',
        value:
          'Jika sesuai → cenderung kompilasi. Jika belum → survei/sensus. Data yang ada tetap dapat jadi pendukung.',
      },
    ],
    lessonPoints: [
      'Menurut Materi Proses Bisnis · Hal. 15.',
      'StatPlan tidak mengisi isi portal — Anda yang mencatat hasil cek.',
    ],
    template: TPL_PORTAL,
    buktiDukung:
      'Catatan hasil cek SIRuSa / Romantik / Portal SDI · ringkasan kelayakan · keputusan jenis kegiatan.',
    sourceType: 'pdf',
    pdfPage: 15,
  },
  {
    id: 'p-1.6',
    subprocess: '1.6',
    title: 'Proposal / KAK',
    apa: 'Mendokumentasikan temuan tahap kebutuhan ke proposal/KAK. Format di StatPlan adalah format kerja — bukan template resmi BPS.',
    contoh:
      'Struktur materi Hal. 16: Proses yang berjalan · Solusi · Biaya dan manfaat · Kendala.',
    contohDetail: [
      {
        label: 'Proses yang berjalan',
        value:
          'Pelayanan perizinan sudah berjalan, tetapi belum ada ringkasan sistematis mengenai kepuasan masyarakat.',
      },
      {
        label: 'Solusi',
        value:
          'Melakukan kegiatan statistik untuk menghasilkan informasi kepuasan sebagai bahan evaluasi.',
      },
      {
        label: 'Biaya dan manfaat',
        value:
          'Biaya: sumber daya penyusunan dan pengumpulan (ringkas).\nManfaat: bahan evaluasi untuk unit pelayanan.',
      },
      {
        label: 'Kendala',
        value: 'Waktu responden, kesiapan instrumen, koordinasi antar unit.',
      },
    ],
    lessonPoints: [
      'Empat bagian mengikuti Materi Proses Bisnis Hal. 16.',
      'Isian contoh = ilustratif StatPlan.',
    ],
    template: {
      ...TPL_KAK,
      fields: [
        {
          label: 'Proses yang berjalan',
          example: 'Pelayanan berjalan; belum ada ringkasan kepuasan',
        },
        {
          label: 'Solusi yang diusulkan',
          example: 'Kegiatan statistik untuk bahan evaluasi pelayanan',
        },
        {
          label: 'Biaya dan manfaat',
          example: 'Biaya penyusunan/pengumpulan · manfaat evaluasi',
        },
        {
          label: 'Kendala',
          example: 'Waktu responden · kesiapan instrumen · koordinasi',
        },
      ],
    },
    buktiDukung: 'Draf proposal/KAK · ringkasan temuan kebutuhan · catatan biaya–manfaat & kendala.',
    sourceType: 'pdf',
    pdfPage: 16,
  },
]

const SKM_PREP = withPreparePhases(
  SKM_NEED,
  buildLaterPhases({
    designContoh:
      'Rancang output indeks/gambaran kepuasan, variabel unsur pelayanan, dan cara/metode/moda wawancara — pelajari bentuk tabulasi materi Hal. 18.',
    designDetail: [
      { label: 'Output', value: 'Ringkasan indikator kepuasan per aspek pelayanan' },
      {
        label: 'Variabel (contoh materi-style)',
        value: 'nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi + penilaian aspek',
      },
      { label: 'Cara / metode / moda', value: 'Survei · wawancara · moda sesuai kapasitas' },
      {
        label: 'Jadwal rujukan',
        value: 'Contoh jadwal SKM Hal. 23 (bukan durasi wajib)',
      },
    ],
    buildContoh:
      'Siapkan draf instrumen SKM, aturan pemeriksaan, rencana tabulasi, dan ruang lingkup pilot.',
    buildDetail: [
      { label: 'Instrumen', value: 'Kuesioner SKM Pelayanan Perizinan (draft)' },
      { label: 'Validasi', value: 'Draft aturan pemeriksaan (lihat konsep Hal. 26)' },
      { label: 'Tabulasi', value: 'Draft aturan tabulasi (lihat konsep Hal. 27)' },
      {
        label: 'Pilot',
        value: 'questionnaire · methodology · processing · dummy table (Hal. 30)',
      },
    ],
    collectContoh:
      'Rencanakan kerangka/sampel (jika survei), peran petugas, cara/instrumen/moda/periode, dan pemantauan — tanpa data responden di StatPlan.',
    collectDetail: [
      { label: 'Sampel', value: 'Relevan untuk survei — catat sumber kerangka' },
      {
        label: 'Peran (ilustratif)',
        value: 'Koordinator · petugas pengumpul · pemeriksa kelengkapan',
      },
      { label: 'Pelaksanaan', value: 'Sesuai instrumen & moda yang disiapkan' },
      { label: 'Pemantauan', value: 'Kelengkapan isian · ketercapaian sasaran · kendala' },
    ],
    processContoh:
      'Rencanakan coding jawaban dan pemeriksaan kelengkapan sebelum analisis — tanpa angka hasil fiktif.',
    processDetail: [
      { label: 'Coding', value: 'Pilihan tertutup → kode (konsep Hal. 39)' },
      { label: 'Pemeriksaan', value: 'Kelengkapan & konsistensi isian' },
      { label: 'Weighting', value: 'Tentukan relevansi sesuai jenis kegiatan' },
    ],
    analyseContoh:
      'Rencanakan pertanyaan analisis, output awal, pemeriksaan, dan catatan disclosure (Hal. 50).',
    analyseDetail: [
      {
        label: 'Pertanyaan analisis',
        value: 'Bagaimana gambaran kepuasan menurut aspek pelayanan?',
      },
      { label: 'Output awal', value: 'Ringkasan indikator per aspek (struktur, bukan angka)' },
      {
        label: 'Disclosure',
        value: 'Pertimbangkan anonimisasi / agregat n kecil bila relevan',
      },
    ],
    disseminateContoh:
      'Rencanakan produk ringkasan untuk pengelola layanan, kanal internal, dan FAQ singkat.',
    disseminateDetail: [
      { label: 'Produk', value: 'Ringkasan kepuasan pelayanan perizinan' },
      { label: 'Kanal', value: 'Rapat internal / berbagi dokumen unit' },
      { label: 'Dukungan', value: 'FAQ singkat + kontak penanggung jawab' },
    ],
    evaluateContoh:
      'Rencanakan masukan (feedback/paradata/staff), aspek yang ditinjau, dan tindak lanjut.',
    evaluateDetail: [
      { label: 'Masukan', value: 'Feedback pengguna · catatan petugas · metrics proses' },
      { label: 'Aspek', value: 'Ketepatan waktu · kelengkapan output · kejelasan produk' },
      {
        label: 'Tindak lanjut',
        value: 'Tindakan · penanggung jawab · monitoring (status: direncanakan)',
      },
    ],
  }),
)

export const EXAMPLE_SKM: ExampleJourney = {
  slug: 'skm',
  projectId: 'demo-skm-dpmptsp-2026',
  title: 'Survei Kepuasan Pelayanan',
  jenis: 'survei',
  whatToKnow: 'Mengetahui tingkat kepuasan masyarakat terhadap pelayanan yang diberikan.',
  plannedResult:
    'Indeks kepuasan dan temuan yang dapat digunakan untuk perbaikan layanan.',
  howDataObtained: 'Data dikumpulkan dari pengguna layanan melalui survei.',
  afterData:
    'Data diperiksa, diolah, dianalisis, lalu hasilnya disiapkan menjadi informasi yang dapat digunakan.',
  whyConducted:
    'Agar unit pelayanan memahami apa yang sudah berjalan baik dan apa yang perlu diperbaiki.',
  flowLabels: [
    'Kebutuhan',
    'Perencanaan',
    'Pengumpulan',
    'Pengolahan',
    'Analisis',
    'Penyajian',
    'Evaluasi',
  ],
  schedule: {
    sourceType: 'pdf',
    pdfPage: 23,
    note: 'Jadwal ini digunakan sebagai contoh bentuk perencanaan. Durasi kegiatan tidak otomatis menjadi durasi wajib.',
    sourceRows: [
      { activity: 'Identifikasi kebutuhan', period: 'Juli – Agustus' },
      { activity: 'Perancangan instrumen', period: 'Agustus – September' },
      { activity: 'Pelatihan petugas', period: 'September' },
      { activity: 'Pengumpulan data', period: 'September – Oktober' },
      { activity: 'Pengolahan data', period: 'November' },
      { activity: 'Analisis hasil SKM', period: 'November – Desember' },
      { activity: 'Penyusunan laporan', period: 'Desember' },
      { activity: 'Evaluasi', period: 'Desember' },
    ],
    months: [
      { month: 'Juli', activities: ['Identifikasi kebutuhan'] },
      { month: 'Agustus', activities: ['Identifikasi kebutuhan', 'Perancangan instrumen'] },
      {
        month: 'September',
        activities: ['Perancangan instrumen', 'Pelatihan petugas', 'Pengumpulan data'],
      },
      { month: 'Oktober', activities: ['Pengumpulan data'] },
      { month: 'November', activities: ['Pengolahan data', 'Analisis hasil SKM'] },
      {
        month: 'Desember',
        activities: ['Analisis hasil SKM', 'Penyusunan laporan', 'Evaluasi'],
      },
    ],
  },
  prepareItems: SKM_PREP.prepareItems,
  preparePhases: SKM_PREP.preparePhases,
  summary: {
    need: 'Mengukur kepuasan masyarakat.',
    result: 'Indeks kepuasan dan temuan pelayanan.',
    schedule: 'Juli–Desember (contoh dari materi · Hal. 23).',
    prepare:
      'Rumusan kebutuhan, tujuan, konsep, pemeriksaan data, dan proposal/KAK — lihat contoh & kerangka sebelum mengerjakan versi Anda.',
  },
}

const UMKM_NEED: PrepareItem[] = [
  {
    id: 'p-1.1',
    subprocess: '1.1',
    title: 'Menentukan masalah / kebutuhan',
    apa: 'Menjelaskan pertanyaan yang ingin dijawab sebelum memilih cara pengumpulan.',
    contoh:
      'Kegiatan: Pendataan lengkap UMKM — kebutuhan memperbarui basis data unit usaha di wilayah.',
    contohDetail: [
      { label: 'Kegiatan', value: 'Pendataan lengkap UMKM di wilayah' },
      {
        label: 'Masalah / kondisi',
        value: 'Basis data unit usaha belum lengkap/mutakhir untuk perencanaan pemberdayaan.',
      },
      {
        label: 'Mengapa dibutuhkan',
        value: 'Agar pemetaan unit usaha lebih lengkap untuk perencanaan pemberdayaan.',
      },
      { label: 'Pengguna', value: 'Dinas terkait pemberdayaan UMKM' },
      {
        label: 'Informasi yang diharapkan',
        value: 'Profil dan sebaran UMKM menurut jenis usaha dan wilayah.',
      },
    ],
    lessonPoints: [
      'Rumusan kebutuhan menjawab “apa yang belum tersedia” dan “siapa yang memakai”.',
      'Contoh ilustratif — bukan data kegiatan nyata.',
    ],
    template: {
      ...TPL_KEBUTUHAN,
      fields: [
        { label: 'Kegiatan / topik', example: 'Pendataan lengkap UMKM' },
        {
          label: 'Masalah / kondisi saat ini',
          example: 'Basis data unit usaha belum lengkap/mutakhir',
        },
        {
          label: 'Mengapa informasi dibutuhkan',
          example: 'Perencanaan pemberdayaan di wilayah',
        },
        { label: 'Pengguna informasi', example: 'Dinas terkait UMKM' },
        {
          label: 'Informasi yang diharapkan',
          example: 'Profil dan sebaran menurut jenis usaha & wilayah',
        },
      ],
    },
    buktiDukung: 'Catatan rumusan kebutuhan kebijakan · usulan dinas · catatan rapat awal.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.2',
    subprocess: '1.2',
    title: 'Kebutuhan pengguna',
    apa: 'Memastikan siapa yang memakai hasil dan untuk apa.',
    contoh: 'Hasil dipakai dinas untuk perencanaan pemberdayaan UMKM.',
    contohDetail: [
      { label: 'Pengguna', value: 'Dinas terkait pemberdayaan UMKM' },
      {
        label: 'Informasi yang dibutuhkan',
        value: 'Jumlah, sebaran, dan profil unit usaha di wilayah.',
      },
      { label: 'Keperluan', value: 'Perencanaan dan targeting pemberdayaan.' },
      { label: 'Bentuk informasi', value: 'Tabel sebaran · profil ringkas' },
    ],
    lessonPoints: ['Konfirmasikan bentuk hasil sejak awal agar desain variabel tepat.'],
    template: TPL_PENGGUNA,
    buktiDukung: 'Notulen konsultasi / konfirmasi kebutuhan.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.3',
    subprocess: '1.3',
    title: 'Tujuan dan hasil',
    apa: 'Menuliskan tujuan dan bentuk hasil yang diharapkan.',
    contoh: 'Menghasilkan data lengkap dan peta sebaran unit usaha.',
    contohDetail: [
      {
        label: 'Tujuan utama',
        value: 'Menghasilkan data lengkap unit usaha di wilayah.',
      },
      {
        label: 'Tujuan khusus',
        value:
          '• Memutakhirkan daftar unit usaha.\n• Menyusun sebaran menurut jenis usaha dan wilayah.\n• Menyediakan dasar pemberdayaan.',
      },
    ],
    lessonPoints: ['Tujuan khusus harus dapat dicek pada output.'],
    template: TPL_TUJUAN,
    buktiDukung: 'Catatan tujuan dan daftar output.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.4',
    subprocess: '1.4',
    title: 'Konsep dan definisi',
    apa: 'Menyamakan pengertian unit yang dihitung (materi menekankan kondef sesuai tujuan).',
    contoh: 'Definisi unit UMKM yang dihitung dalam kegiatan ini disepakati sebelum instrumen.',
    contohDetail: [
      { label: 'Istilah', value: 'Unit UMKM / unit usaha' },
      {
        label: 'Definisi yang dipakai',
        value: 'Definisi operasional yang disepakati untuk kegiatan ini (isi Anda).',
      },
      {
        label: 'Data → Output',
        value: 'Data unit usaha → profil & sebaran menurut jenis/wilayah',
      },
    ],
    lessonPoints: ['Kondef mencegah double-count dan interpretasi berbeda.'],
    template: TPL_KONDEF,
    buktiDukung: 'Daftar konsep-definisi.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.5',
    subprocess: '1.5',
    title: 'Pemeriksaan data',
    apa: 'Memeriksa ketersediaan data sebelum memutuskan jenis kegiatan (materi Hal. 15).',
    contoh:
      'Cek SIRuSa, Romantik, Portal SDI. Jika data belum lengkap untuk seluruh wilayah, pendataan lengkap dapat dipertimbangkan.',
    contohDetail: [
      {
        label: 'Portal dicek',
        value: 'SIRuSa · Romantik · Portal SDI (Hal. 15)',
      },
      {
        label: 'Hasil (struktur)',
        value: 'Tersedia / sebagian / tidak — isi hasil cek Anda',
      },
      {
        label: 'Tindak lanjut',
        value: 'Jika belum sesuai kebutuhan cakupan → pertimbangkan pendataan lengkap (sensus)',
      },
    ],
    lessonPoints: ['Menurut Materi Proses Bisnis · Hal. 15.', 'Jangan mengarang isi portal.'],
    template: TPL_PORTAL,
    buktiDukung: 'Catatan hasil cek portal.',
    sourceType: 'pdf',
    pdfPage: 15,
  },
  {
    id: 'p-1.6',
    subprocess: '1.6',
    title: 'Proposal / KAK',
    apa: 'Mendokumentasikan keputusan kebutuhan (struktur Hal. 16).',
    contoh:
      'Proposal berisi proses yang berjalan, solusi yang diusulkan, serta biaya–manfaat dan kendala eksternal.',
    contohDetail: [
      {
        label: 'Proses yang berjalan',
        value: 'Basis data UMKM ada tetapi belum memadai untuk perencanaan wilayah.',
      },
      {
        label: 'Solusi',
        value: 'Pendataan lengkap untuk memutakhirkan daftar dan sebaran unit usaha.',
      },
      {
        label: 'Biaya dan manfaat',
        value: 'Biaya pendataan · manfaat basis data untuk pemberdayaan',
      },
      { label: 'Kendala', value: 'Cakupan wilayah · kesiapan petugas · waktu' },
    ],
    lessonPoints: ['Struktur empat bagian = Materi Hal. 16.', 'Isian = ilustratif.'],
    template: TPL_KAK,
    buktiDukung: 'Draf proposal / KAK.',
    sourceType: 'pdf',
    pdfPage: 16,
  },
]

const UMKM_PREP = withPreparePhases(
  UMKM_NEED,
  buildLaterPhases({
    designContoh:
      'Rancang daftar variabel unit usaha dan wilayah sebelum instrumen dibuat; pelajari bentuk rancangan tabulasi materi Hal. 18.',
    designDetail: [
      { label: 'Output', value: 'Profil & sebaran UMKM menurut jenis usaha dan wilayah' },
      { label: 'Variabel', value: 'Identitas unit · jenis usaha · lokasi · karakteristik relevan' },
      { label: 'Cara', value: 'Pendataan lengkap (bukan sampel)' },
    ],
    buildContoh:
      'Siapkan formulir pendataan, aturan pemeriksaan, dan daftar periksa kelengkapan isian.',
    buildDetail: [
      { label: 'Instrumen', value: 'Formulir pendataan unit usaha (draft)' },
      { label: 'Validasi', value: 'Draft aturan kelengkapan & konsistensi' },
      { label: 'Pilot', value: 'Uji formulir & alur pada cakupan terbatas' },
    ],
    collectContoh:
      'Rencanakan wilayah kerja petugas dan jadwal pendataan lengkap — tanpa data responden di StatPlan.',
    collectDetail: [
      { label: 'Cakupan', value: 'Seluruh unit di wilayah yang ditetapkan' },
      { label: 'Peran', value: 'Koordinator wilayah · petugas pendata' },
      { label: 'Pemantauan', value: 'Cakupan · kelengkapan · kendala lapangan' },
    ],
    processContoh:
      'Rencanakan pembersihan duplikasi dan kodifikasi jenis usaha (konsep coding Hal. 39).',
    processDetail: [
      { label: 'Coding', value: 'Jenis usaha → kode klasifikasi yang disepakati' },
      { label: 'Pembersihan', value: 'Duplikasi · kelengkapan identitas' },
    ],
    analyseContoh:
      'Rencanakan tabulasi sebaran UMKM menurut jenis usaha dan wilayah — tanpa angka fiktif.',
    analyseDetail: [
      { label: 'Pertanyaan analisis', value: 'Bagaimana sebaran unit menurut jenis & wilayah?' },
      { label: 'Output awal', value: 'Tabel sebaran (struktur)' },
    ],
    disseminateContoh:
      'Rencanakan ringkasan untuk dinas dan forum pemberdayaan.',
    disseminateDetail: [
      { label: 'Produk', value: 'Ringkasan profil & sebaran UMKM' },
      { label: 'Kanal', value: 'Internal dinas / forum pemberdayaan' },
    ],
    evaluateContoh:
      'Rencanakan catatan cakupan wilayah dan usulan perbaikan siklus berikutnya.',
    evaluateDetail: [
      { label: 'Masukan', value: 'Catatan petugas · cakupan wilayah' },
      { label: 'Tindak lanjut', value: 'Perbaikan daftar · SOP · monitoring' },
    ],
  }),
)

export const EXAMPLE_UMKM: ExampleJourney = {
  slug: 'umkm',
  projectId: 'demo-umkm-koperasi-2026',
  title: 'Pendataan Lengkap UMKM',
  jenis: 'sensus',
  whatToKnow: 'Memperbarui basis data unit usaha di wilayah.',
  plannedResult: 'Profil dan sebaran UMKM menurut jenis usaha dan wilayah.',
  howDataObtained: 'Data diperoleh melalui pendataan lengkap (bukan sampel).',
  afterData: 'Data dicek, disusun, dianalisis, lalu dipakai untuk pemberdayaan.',
  whyConducted:
    'Agar pemetaan unit usaha lebih lengkap untuk perencanaan pemberdayaan di wilayah.',
  flowLabels: [
    'Kebutuhan',
    'Perencanaan',
    'Pendataan',
    'Pengolahan',
    'Analisis',
    'Penyajian',
    'Evaluasi',
  ],
  schedule: {
    sourceType: 'illustrative',
    note: 'Contoh jadwal ilustratif StatPlan — bukan dari tabel Hal. 23 dan bukan durasi wajib.',
    months: [
      { month: 'Bulan 1–2', activities: ['Persiapan & sosialisasi'] },
      { month: 'Bulan 2–3', activities: ['Perancangan instrumen & SOP'] },
      { month: 'Bulan 3', activities: ['Pelatihan petugas'] },
      { month: 'Bulan 4–6', activities: ['Pendataan lengkap'] },
      { month: 'Bulan 7', activities: ['Pengolahan'] },
      { month: 'Bulan 8', activities: ['Analisis & penyusunan hasil'] },
      { month: 'Bulan 9', activities: ['Diseminasi & evaluasi'] },
    ],
  },
  prepareItems: UMKM_PREP.prepareItems,
  preparePhases: UMKM_PREP.preparePhases,
  summary: {
    need: 'Memperbarui data UMKM wilayah.',
    result: 'Profil dan sebaran unit usaha.',
    schedule: 'Contoh jadwal ilustratif (bukan Hal. 23).',
    prepare:
      'Rumusan kebutuhan, tujuan, konsep, pemeriksaan data (Hal. 15), dan proposal/KAK (Hal. 16) — dengan format kerja yang dapat dipelajari.',
  },
}

const KOMPROMIN_NEED: PrepareItem[] = [
  {
    id: 'p-1.1',
    subprocess: '1.1',
    title: 'Menentukan masalah / kebutuhan',
    apa: 'Menjelaskan kebutuhan informasi statistik yang ingin dijawab — bukan hanya satu pertanyaan umum.',
    contoh:
      'Kegiatan: Kompilasi data kependudukan — kebutuhan indikator untuk perencanaan daerah dari sumber administratif.',
    contohDetail: [
      {
        label: 'Kegiatan',
        value: 'Kompilasi data kependudukan untuk perencanaan sektoral',
      },
      {
        label: 'Masalah / kondisi',
        value:
          'Indikator kependudukan yang dibutuhkan perencanaan belum tersedia secara konsisten dari satu rangkaian kompilasi yang disepakati.',
      },
      {
        label: 'Mengapa informasi dibutuhkan',
        value: 'Untuk menyiapkan statistik kependudukan yang dapat dipakai OPD terkait.',
      },
      { label: 'Pengguna informasi', value: 'OPD terkait perencanaan / kependudukan' },
      {
        label: 'Informasi yang diharapkan',
        value: 'Indikator kependudukan dari sumber administratif yang sudah ada.',
      },
    ],
    lessonPoints: [
      'Tulis kegiatan, masalah, alasan, pengguna, dan informasi yang diharapkan.',
      'Contoh ilustratif — bukan klaim data resmi daerah.',
    ],
    template: {
      ...TPL_KEBUTUHAN,
      fields: [
        {
          label: 'Kegiatan / topik',
          example: 'Kompilasi data kependudukan untuk perencanaan',
        },
        {
          label: 'Masalah / kondisi saat ini',
          example: 'Indikator belum tersedia secara konsisten',
        },
        {
          label: 'Mengapa informasi dibutuhkan',
          example: 'Bahan perencanaan sektoral OPD',
        },
        { label: 'Pengguna informasi', example: 'OPD terkait' },
        {
          label: 'Informasi yang diharapkan',
          example: 'Indikator kependudukan dari data administratif',
        },
      ],
    },
    buktiDukung: 'Catatan rumusan kebutuhan · usulan OPD · catatan rapat awal.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.2',
    subprocess: '1.2',
    title: 'Kebutuhan pengguna',
    apa: 'Memastikan pengguna hasil dan tujuan penggunaan.',
    contoh: 'Hasil dipakai OPD terkait sebagai statistik kependudukan yang konsisten.',
    contohDetail: [
      { label: 'Pengguna', value: 'OPD terkait perencanaan / kependudukan' },
      {
        label: 'Informasi yang dibutuhkan',
        value: 'Indikator kependudukan yang selaras antar periode.',
      },
      { label: 'Keperluan', value: 'Perencanaan sektoral dan pemantauan.' },
      { label: 'Bentuk informasi', value: 'Paket indikator / tabel ringkas' },
    ],
    lessonPoints: ['Konfirmasikan bentuk paket indikator sejak awal.'],
    template: TPL_PENGGUNA,
    buktiDukung: 'Notulen konfirmasi kebutuhan.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.3',
    subprocess: '1.3',
    title: 'Tujuan dan hasil',
    apa: 'Menuliskan tujuan dan bentuk output.',
    contoh: 'Menghasilkan indikator kependudukan dari data administratif.',
    contohDetail: [
      {
        label: 'Tujuan utama',
        value: 'Menghasilkan indikator kependudukan dari sumber administratif.',
      },
      {
        label: 'Tujuan khusus',
        value:
          '• Menyepakati daftar indikator.\n• Menyusun alur kompilasi dari sumber yang ada.\n• Menyiapkan paket untuk OPD.',
      },
    ],
    lessonPoints: ['Output kompilasi mengikuti data yang tersedia — bukan survei baru otomatis.'],
    template: TPL_TUJUAN,
    buktiDukung: 'Catatan tujuan dan output.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.4',
    subprocess: '1.4',
    title: 'Konsep dan definisi',
    apa: 'Menyamakan definisi indikator (materi: kondef sesuai tujuan).',
    contoh: 'Samakan definisi setiap indikator kependudukan yang akan dikompilasi.',
    contohDetail: [
      { label: 'Indikator', value: 'Daftar indikator yang disepakati (isi Anda)' },
      {
        label: 'Definisi',
        value: 'Definisi operasional + satuan + periode acuan',
      },
      {
        label: 'Data → Output',
        value: 'Data administratif → indikator kependudukan',
      },
    ],
    lessonPoints: ['Tanpa kondef, kompilasi antar sumber mudah tidak konsisten.'],
    template: TPL_KONDEF,
    buktiDukung: 'Daftar konsep-definisi.',
    sourceType: 'illustrative',
  },
  {
    id: 'p-1.5',
    subprocess: '1.5',
    title: 'Pemeriksaan data',
    apa: 'Memeriksa apakah data administratif sudah tersedia dan sesuai kebutuhan (Hal. 15).',
    contoh:
      'Jika data administratif sudah sesuai, kegiatan dapat bersifat kompilasi. Tetap cek portal rujukan.',
    contohDetail: [
      {
        label: 'Portal / sumber',
        value: 'SIRuSa · Romantik · Portal SDI · sumber administratif terkait',
      },
      {
        label: 'Apakah sesuai kebutuhan?',
        value: 'Jika ya → cenderung kompilasi (sesuai materi Hal. 15)',
      },
      {
        label: 'Data pendukung',
        value: 'Data yang ada tetap dapat dipakai sebagai pendukung',
      },
    ],
    lessonPoints: [
      'Menurut Materi Proses Bisnis · Hal. 15.',
      'Kompilasi dipilih bila data sesuai kebutuhan — bukan tebak-tebakan.',
    ],
    template: TPL_PORTAL,
    buktiDukung: 'Catatan hasil cek portal / sumber administratif.',
    sourceType: 'pdf',
    pdfPage: 15,
  },
  {
    id: 'p-1.6',
    subprocess: '1.6',
    title: 'Proposal / KAK',
    apa: 'Mendokumentasikan keputusan kebutuhan (struktur Hal. 16).',
    contoh:
      'Proposal berisi uraian proses, solusi yang diusulkan, serta biaya–manfaat dan kendala eksternal.',
    contohDetail: [
      {
        label: 'Proses yang berjalan',
        value: 'Data administratif tersebar; belum ada paket indikator yang disepakati.',
      },
      {
        label: 'Solusi',
        value: 'Kompilasi terencana untuk menghasilkan indikator kependudukan.',
      },
      {
        label: 'Biaya dan manfaat',
        value: 'Biaya akses/integrasi · manfaat indikator untuk perencanaan',
      },
      {
        label: 'Kendala',
        value: 'Perjanjian akses data · keselarasan definisi · jadwal sumber',
      },
    ],
    lessonPoints: ['Struktur Hal. 16 · isian ilustratif.'],
    template: TPL_KAK,
    buktiDukung: 'Draf proposal / KAK.',
    sourceType: 'pdf',
    pdfPage: 16,
  },
]

const KOMPROMIN_PREP = withPreparePhases(
  KOMPROMIN_NEED,
  buildLaterPhases({
    designContoh:
      'Rancang indikator kependudukan dan metadata sumber administratif; pelajari bentuk rancangan tabulasi materi Hal. 18.',
    designDetail: [
      { label: 'Output', value: 'Paket indikator kependudukan' },
      { label: 'Sumber', value: 'Data administratif yang disepakati' },
      { label: 'Cara', value: 'Kompilasi (bukan survei primer)' },
    ],
    buildContoh:
      'Siapkan daftar variabel kompilasi, catatan akses data, dan aturan pemeriksaan.',
    buildDetail: [
      { label: 'Variabel kompilasi', value: 'Daftar field dari sumber administratif' },
      { label: 'Akses data', value: 'Catatan perjanjian / protokol bila relevan' },
      { label: 'Validasi', value: 'Draft aturan konsistensi antar sumber' },
    ],
    collectContoh:
      'Rencanakan pengambilan data dari sumber administratif yang disepakati — bukan runner survei.',
    collectDetail: [
      { label: 'Sumber', value: 'Sistem/administrasi yang disepakati' },
      { label: 'Periode kutip', value: 'Rentang waktu data yang diambil' },
      { label: 'Pemantauan', value: 'Kelengkapan kiriman · keterlambatan · isu akses' },
    ],
    processContoh:
      'Rencanakan validasi dan integrasi antar sumber administratif; coding bila diperlukan (Hal. 39).',
    processDetail: [
      { label: 'Integrasi', value: 'Gabungan sumber dengan kunci yang disepakati' },
      { label: 'Coding', value: 'Kode klasifikasi pada variabel akuisisi bila perlu' },
      { label: 'Weighting', value: 'Umumnya tidak seperti survei — cek relevansi (Hal. 43)' },
    ],
    analyseContoh:
      'Rencanakan indikator turunan dan catatan disclosure untuk data kompilasi (Hal. 50).',
    analyseDetail: [
      { label: 'Pertanyaan analisis', value: 'Indikator mana yang siap untuk perencanaan?' },
      {
        label: 'Disclosure kompilasi',
        value: 'Data sensitif yang dapat diungkap dari karakteristik — anonimkan/hilangkan (Hal. 50)',
      },
    ],
    disseminateContoh:
      'Rencanakan paket indikator untuk OPD terkait dan FAQ singkat.',
    disseminateDetail: [
      { label: 'Produk', value: 'Paket indikator kependudukan' },
      { label: 'Kanal', value: 'Berbagi internal OPD (bukan portal BPS palsu)' },
      { label: 'FAQ', value: 'Cakupan · periode · batasan sumber' },
    ],
    evaluateContoh:
      'Rencanakan catatan kualitas sumber dan perbaikan perjanjian data.',
    evaluateDetail: [
      { label: 'Masukan', value: 'Kualitas sumber · feedback OPD · keterlambatan' },
      {
        label: 'Tindak lanjut',
        value: 'Perbaiki perjanjian akses · kondef · monitoring',
      },
    ],
  }),
)

export const EXAMPLE_KOMPROMIN: ExampleJourney = {
  slug: 'kompromin',
  projectId: 'demo-dukcapil-kompromin-2026',
  title: 'Kompilasi Data Kependudukan',
  jenis: 'kompromin',
  whatToKnow: 'Menyusun statistik kependudukan untuk perencanaan sektoral.',
  plannedResult: 'Indikator kependudukan dari sumber administratif.',
  howDataObtained: 'Data diambil dari sumber administratif yang sudah tersedia (kompilasi).',
  afterData: 'Data divalidasi, diintegrasikan, dianalisis, lalu disusun sebagai statistik.',
  whyConducted:
    'Agar indikator kependudukan tersedia secara lebih konsisten untuk perencanaan daerah.',
  flowLabels: [
    'Kebutuhan',
    'Perencanaan',
    'Kompilasi',
    'Pengolahan',
    'Analisis',
    'Penyajian',
    'Evaluasi',
  ],
  schedule: {
    sourceType: 'illustrative',
    note: 'Contoh jadwal ilustratif StatPlan — bukan durasi wajib.',
    months: [
      { month: 'Bulan 1', activities: ['Telaah kebutuhan & ketersediaan data'] },
      { month: 'Bulan 1–2', activities: ['Perancangan kompilasi & metadata'] },
      { month: 'Bulan 2', activities: ['Persiapan akses data / perjanjian'] },
      { month: 'Bulan 3', activities: ['Pengambilan data administratif'] },
      { month: 'Bulan 4', activities: ['Validasi & pengolahan'] },
      { month: 'Bulan 5', activities: ['Analisis & penyusunan hasil'] },
      { month: 'Bulan 6', activities: ['Diseminasi & evaluasi'] },
    ],
  },
  prepareItems: KOMPROMIN_PREP.prepareItems,
  preparePhases: KOMPROMIN_PREP.preparePhases,
  summary: {
    need: 'Statistik kependudukan untuk perencanaan.',
    result: 'Indikator dari data administratif.',
    schedule: 'Contoh jadwal ilustratif.',
    prepare: 'Rumusan kebutuhan, tujuan, konsep, pemeriksaan data, dan proposal/KAK.',
  },
}

/** Re-export for schedule template card reference in UI if needed */
export const SKM_SCHEDULE_TEMPLATE = TPL_JADWAL

export const EXAMPLE_JOURNEYS: ExampleJourney[] = [
  EXAMPLE_SKM,
  EXAMPLE_UMKM,
  EXAMPLE_KOMPROMIN,
]

export function getExampleBySlug(slug: string): ExampleJourney | undefined {
  return EXAMPLE_JOURNEYS.find((e) => e.slug === slug)
}

export function sourceBadgeLabel(item: {
  sourceType: ExampleSourceType
  pdfPage?: number | string
}): string {
  if (item.sourceType === 'pdf' && item.pdfPage) {
    return `Menurut Materi Proses Bisnis · Hal. ${item.pdfPage}`
  }
  return 'Contoh ilustratif'
}
