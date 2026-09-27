/**
 * Mode Terpandu — Disseminate learning cards (Slice 10).
 * Educational + preparation only. Does NOT publish, release, or promote products.
 *
 * Card numbering (7.1–7.6) is StatPlan learning organization of Disseminate concepts,
 * not a claim of official GSBPM Disseminate sub-process codes.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const DISSEMINATE_INTRO = {
  phaseId: 'disseminate' as const,
  title: 'Disseminate',
  question:
    'Bagaimana merencanakan bentuk produk, waktu rilis, promosi, dan dukungan pengguna?',
  explanation:
    'Pada tahap ini, hasil statistik yang sudah siap direncanakan agar dapat tersedia bagi pengguna — tanpa menjalankan publikasi di StatPlan.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_DISSEMINATE_CARDS: GuidedLearningCard[] = [
  {
    id: 'disseminate-7.1',
    code: '7.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Memutakhirkan Sistem Output',
    title: 'Produk statistik',
    apa: 'Produk statistik adalah bentuk hasil yang direncanakan untuk tersedia bagi pengguna. Di Mode Terpandu Anda merencanakan produk — bukan menerbitkan hasil statistik.',
    contoh:
      'Rencana produk: nama, bentuk, informasi, dan pengguna sasaran — contoh ilustratif tanpa portal BPS palsu.',
    contohClass: 'C',
    pdfPage: '52–57',
    contohDetail: [
      { label: 'Nama produk', value: 'Ringkasan kepuasan pelayanan perizinan' },
      { label: 'Bentuk produk', value: 'Laporan ringkas / tabel indikator' },
      {
        label: 'Informasi yang disajikan',
        value: 'Gambaran kepuasan menurut aspek pelayanan (tanpa angka fiktif di StatPlan).',
      },
      { label: 'Pengguna sasaran', value: 'Pengelola layanan / pihak terkait' },
    ],
    lessonPoints: [
      'Produk statistik dirancang untuk pengguna, bukan hanya untuk arsip internal.',
      'Contoh isian adalah ilustratif StatPlan.',
      'Jangan membuat portal BPS palsu sebagai kanal.',
    ],
    templateTitle: 'Rencana produk statistik',
    templateFields: [
      { label: 'Nama produk' },
      { label: 'Bentuk produk' },
      { label: 'Informasi yang disajikan' },
      { label: 'Pengguna sasaran' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan bentuk produk', 'Daftar pengguna sasaran'],
    buktiClass: 'C',
  },
  {
    id: 'disseminate-7.2',
    code: '7.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Menghasilkan Produk Diseminasi',
    title: 'Rencana rilis',
    apa: 'Rencana rilis membantu memikirkan kapan dan dalam kondisi apa produk direncanakan tersedia. Target waktu di sini adalah rencana Anda — bukan jadwal rilis resmi BPS.',
    contoh:
      'Mekanisme rilis sebagai rencana: target waktu + kondisi kesiapan — bukan klaim sudah dirilis.',
    contohClass: 'C',
    pdfPage: '52–57',
    contohDetail: [
      { label: 'Nama produk', value: 'Ringkasan kepuasan pelayanan' },
      { label: 'Target waktu rilis', value: 'Sesuai jadwal kegiatan Anda (rencana)' },
      {
        label: 'Kondisi kesiapan',
        value: 'Output final · Disclosure ditinjau · Format produk siap',
      },
      { label: 'Catatan', value: 'Ini rencana — bukan bukti rilis resmi.' },
    ],
    lessonPoints: [
      'Rilis direncanakan, bukan ditandai otomatis di StatPlan.',
      'Sebutkan kondisi kesiapan sebelum target waktu.',
      'Jangan meniru klaim jadwal resmi BPS.',
    ],
    templateTitle: 'Rencana rilis',
    templateFields: [
      { label: 'Nama produk' },
      { label: 'Target waktu rilis' },
      { label: 'Kondisi kesiapan' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan target waktu rilis (rencana)', 'Daftar kondisi kesiapan'],
    buktiClass: 'C',
  },
  {
    id: 'disseminate-7.3',
    code: '7.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Merilis Produk Statistik',
    title: 'Rencana penyebarluasan',
    apa: 'Rencana penyebarluasan menjelaskan bagaimana produk direncanakan tersedia bagi pengguna. Ini perencanaan kanal dan bentuk — bukan publikasi yang sudah berjalan.',
    contoh:
      'Format publikasi/kanal: pilih kanal yang relevan untuk pengguna Anda — contoh ilustratif.',
    contohClass: 'C',
    pdfPage: '52–57',
    contohDetail: [
      { label: 'Kanal', value: 'Rapat internal / berbagi dokumen internal unit (ilustratif)' },
      { label: 'Bentuk penyajian', value: 'Ringkasan singkat + tabel indikator' },
      { label: 'Pengguna sasaran', value: 'Pengelola layanan' },
      {
        label: 'Catatan',
        value: 'Jangan membuat portal BPS palsu. Sesuaikan kanal dengan kebijakan unit Anda.',
      },
    ],
    lessonPoints: [
      'Kanal dan bentuk penyajian mengikuti pengguna sasaran.',
      'Contoh kanal bersifat ilustratif StatPlan.',
      'Penyebarluasan di sini adalah rencana, bukan publikasi berjalan.',
    ],
    templateTitle: 'Rencana penyebarluasan',
    templateFields: [
      { label: 'Kanal' },
      { label: 'Bentuk penyajian' },
      { label: 'Pengguna sasaran' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan kanal yang direncanakan', 'Catatan bentuk penyajian'],
    buktiClass: 'C',
  },
  {
    id: 'disseminate-7.4',
    code: '7.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Mempromosikan Produk',
    title: 'Promosi / pengenalan produk',
    apa: 'Disseminate dapat mencakup pengenalan produk kepada pengguna sasaran. Mode Terpandu membantu merencanakan pengenalan — bukan menyatakan promosi sudah dilakukan.',
    contoh:
      'Contoh ilustratif pengenalan produk kepada pengguna sasaran.',
    contohClass: 'C',
    pdfPage: '52–57',
    contohDetail: [
      { label: 'Produk yang dikenalkan', value: 'Ringkasan kepuasan pelayanan' },
      { label: 'Sasaran', value: 'Pengelola layanan / pimpinan unit' },
      { label: 'Cara pengenalan', value: 'Rapat internal / briefing singkat' },
      { label: 'Materi pendukung', value: 'Satu halaman ringkasan + FAQ singkat' },
    ],
    lessonPoints: [
      'Promosi di sini berarti pengenalan produk, bukan kampanye pemasaran.',
      'Rencana pengenalan ≠ pernyataan sudah dipromosikan.',
      'Siapkan materi pendukung yang ringkas.',
    ],
    templateTitle: 'Rencana pengenalan produk',
    templateFields: [
      { label: 'Produk yang dikenalkan' },
      { label: 'Sasaran' },
      { label: 'Cara pengenalan' },
      { label: 'Materi pendukung' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan rencana pengenalan', 'Daftar materi pendukung (rencana)'],
    buktiClass: 'C',
  },
  {
    id: 'disseminate-7.5',
    code: '7.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Layanan dan Dukungan Pengguna',
    title: 'Dukungan pengguna',
    apa: 'Dukungan pengguna merencanakan bagaimana pengguna dapat memperoleh penjelasan terkait produk. Ini rencana dukungan — bukan sistem tiket atau layanan operasional.',
    contoh:
      'Layanan pengguna + FAQ — contoh ilustratif StatPlan.',
    contohClass: 'C',
    pdfPage: '52–57',
    contohDetail: [
      {
        label: 'Kebutuhan dukungan',
        value: 'Penjelasan cara membaca indikator · Batasan hasil · Cara meminta klarifikasi',
      },
      {
        label: 'FAQ (ilustratif)',
        value:
          'Q: Apakah angka ini mewakili seluruh masyarakat?\nA: Jelaskan cakupan dan batasan kegiatan Anda.\n\nQ: Siapa yang dapat dihubungi?\nA: Cantumkan penanggung jawab unit.',
      },
      { label: 'Kanal dukungan', value: 'Kontak penanggung jawab di unit kerja' },
    ],
    lessonPoints: [
      'FAQ membantu pengguna memahami batasan hasil.',
      'Dukungan adalah rencana layanan — bukan helpdesk operasional di StatPlan.',
      'Sebutkan kanal dan penanggung jawab yang realistis.',
    ],
    templateTitle: 'Rencana dukungan pengguna',
    templateFields: [
      { label: 'Kebutuhan dukungan' },
      { label: 'Informasi yang perlu dijelaskan' },
      { label: 'Kanal dukungan' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan kebutuhan dukungan', 'Rencana kanal dukungan'],
    buktiClass: 'C',
  },
  {
    id: 'disseminate-7.6',
    code: 'SP-D6',
    mappingKind: 'statplan',
    title: 'Catatan finalisasi Disseminate',
    apa: 'Tinjau apakah bahan Disseminate sudah cukup sebagai persiapan awal. Persiapan Disseminate selesai dipelajari — bukan Disseminate selesai dilaksanakan.',
    contoh: 'Ringkasan rencana Disseminate — dibuat StatPlan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Produk', value: 'Bentuk produk sudah direncanakan' },
      { label: 'Rilis', value: 'Target waktu & kondisi kesiapan dicatat' },
      { label: 'Penyebarluasan', value: 'Kanal & bentuk penyajian disusun' },
      { label: 'Promosi', value: 'Rencana pengenalan ada' },
      { label: 'Dukungan', value: 'FAQ/kanal dukungan direncanakan' },
    ],
    lessonPoints: [
      'Ini ringkasan pembelajaran — bukan bukti publikasi selesai.',
      'Catat hal yang masih terbuka sebelum Evaluate.',
    ],
    templateTitle: 'Ringkasan finalisasi Disseminate',
    templateFields: [
      { label: 'Catatan finalisasi' },
      { label: 'Hal yang masih terbuka' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Ringkasan rencana Disseminate', 'Daftar catatan terbuka'],
    buktiClass: 'C',
  },
]

export function getDisseminateCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_DISSEMINATE_CARDS.find((c) => c.id === id)
}
