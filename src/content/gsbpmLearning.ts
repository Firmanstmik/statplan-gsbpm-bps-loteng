/**
 * Presentation-only learning copy for GSBPM subprocesses.
 * Grounded in Materi Proses Bisnis.pdf — does NOT mutate domain/gsbpm.ts.
 *
 * Slice 0: Specify Need (1.1–1.6) only.
 */
import type { GsbpmPhaseId } from '@/domain/types'

export type LearningExampleSuitability = 'A' | 'B' | 'C' | 'D'

export type LearningExample = {
  id: string
  suitability: LearningExampleSuitability
  title: string
  body: string
  /** Citation; never claim official BPS template unless source supports it */
  sourceNote: string
  simplified?: boolean
}

export type SubprocessLearning = {
  phaseId: GsbpmPhaseId
  code: string
  plainMeaning: string
  whyItMatters: string
  prepareHints: string[]
  /** Beginner voice of expected outputs; aligned with domain outputs */
  afterThisYouHave: string[]
  examples: LearningExample[]
  /** Optional copy for conditional applicability (display only) */
  conditionCopy?: string
  /** Suggested next subprocess code within the same phase */
  suggestedNextCode?: string
}

export type PhaseLearningIntro = {
  phaseId: GsbpmPhaseId
  plainPurpose: string
  flexibilityNote: string
}

export const SPECIFY_NEED_INTRO: PhaseLearningIntro = {
  phaseId: 'specify_need',
  plainPurpose:
    'Memahami statistik apa yang dibutuhkan, mengonfirmasi dengan pemangku kepentingan, dan memeriksa apakah data yang sudah ada cukup sebelum merancang pengumpulan baru.',
  flexibilityNote:
    'GSBPM bersifat fleksibel: urutan subproses di bawah ini adalah saran belajar, bukan kewajiban ketat. Anda dapat membuka subproses mana pun.',
}

/**
 * Learning copy keyed by subprocess code (e.g. "1.1").
 * Activities/checklist/outputs still come from domain SubProcess.
 */
export const SPECIFY_NEED_LEARNING: Record<string, SubprocessLearning> = {
  '1.1': {
    phaseId: 'specify_need',
    code: '1.1',
    plainMeaning:
      'Merumuskan masalah kebijakan dan mengidentifikasi statistik (data atau indikator) yang diperlukan dari masalah tersebut.',
    whyItMatters:
      'Tanpa identifikasi kebutuhan yang jelas, langkah berikutnya (konsultasi, desain, pengumpulan) mudah melenceng dari pertanyaan yang ingin dijawab.',
    prepareHints: [
      'Rumusan singkat masalah atau pertanyaan kebijakan yang ingin dijawab',
      'Daftar sementara data atau indikator yang menurut Anda dibutuhkan',
      'Catatan siapa yang akan memakai hasil statistik ini (jika sudah diketahui)',
    ],
    afterThisYouHave: [
      'Daftar kebutuhan data dan data prioritas (versi awal)',
    ],
    examples: [],
    suggestedNextCode: '1.2',
  },
  '1.2': {
    phaseId: 'specify_need',
    code: '1.2',
    plainMeaning:
      'Berkonsultasi dengan pemangku kepentingan internal dan eksternal, lalu mengonfirmasi mengapa statistik diperlukan, output yang diharapkan, dan jadwal diseminasi.',
    whyItMatters:
      'Kebutuhan yang hanya disusun satu pihak sering tidak akurat. Konfirmasi mengurangi risiko mengumpulkan data yang tidak dipakai.',
    prepareHints: [
      'Daftar stakeholder yang relevan (OPD, pengguna data, penyedia data)',
      'Pertanyaan konsultasi: mengapa dibutuhkan, hasil apa, kapan disebarluaskan',
      'Tempat menyimpan notulen atau dokumentasi rapat',
    ],
    afterThisYouHave: ['Dokumentasi rapat pembahasan kebutuhan data'],
    examples: [],
    suggestedNextCode: '1.3',
  },
  '1.3': {
    phaseId: 'specify_need',
    code: '1.3',
    plainMeaning:
      'Menetapkan tujuan kegiatan dan bentuk output statistik yang menjawab kebutuhan pengguna.',
    whyItMatters:
      'Tujuan dan output yang tertulis menjadi acuan desain, pengolahan, dan diseminasi agar semua tahap mengarah ke hasil yang sama.',
    prepareHints: [
      'Tujuan kegiatan dalam 1–3 kalimat',
      'Bentuk output yang diusulkan (tabel, indikator, laporan, dll.)',
      'Cek kesesuaian output dengan langkah kerja yang akan dilakukan',
    ],
    afterThisYouHave: ['Tujuan dan bentuk output statistik'],
    examples: [],
    suggestedNextCode: '1.4',
  },
  '1.4': {
    phaseId: 'specify_need',
    code: '1.4',
    plainMeaning:
      'Menyusun konsep dan definisi (kondef) indikator yang akan diukur, sebaiknya merujuk standar statistik.',
    whyItMatters:
      'Tanpa kondef yang jelas, data dari sumber berbeda sulit dibandingkan dan mudah disalahartikan.',
    prepareHints: [
      'Daftar indikator yang akan diukur',
      'Referensi standar atau definisi resmi yang relevan (jika ada)',
      'Catatan istilah yang masih ambigu dan perlu dipastikan',
    ],
    afterThisYouHave: ['Dokumen konsep dan definisi'],
    examples: [],
    suggestedNextCode: '1.5',
  },
  '1.5': {
    phaseId: 'specify_need',
    code: '1.5',
    plainMeaning:
      'Memeriksa apakah data yang dibutuhkan sudah tersedia dan layak dipakai (termasuk lewat portal rujukan), lalu memutuskan jenis kegiatan: kompilasi, sensus, atau survei.',
    whyItMatters:
      'Pemeriksaan ini mencegah duplikasi kegiatan dan membantu memilih jalur yang proporsional terhadap ketersediaan data.',
    prepareHints: [
      'Hasil pengecekan portal rujukan (sirusa, romantik, portal SDI, dll.)',
      'Catatan kelayakan data yang ditemukan terhadap kebutuhan',
      'Keputusan sementara jenis kegiatan beserta alasannya',
    ],
    afterThisYouHave: ['Hasil telaah ketersediaan dan kelayakan data'],
    examples: [
      {
        id: 'ex-1.5-portals',
        suitability: 'A',
        title: 'Portal yang biasa diperiksa',
        body: 'Materi menyebutkan pemeriksaan portal rujukan statistik, antara lain sirusa.web.bps.go.id, romantik.bps.go.id, dan portal Satu Data Indonesia (SDI), untuk menghindari duplikasi kegiatan.',
        sourceNote: 'Materi Proses Bisnis.pdf · Hal. 15',
      },
    ],
    conditionCopy:
      'Jika data tersedia dan sesuai kebutuhan → cenderung kompilasi produk administrasi. Jika belum → sensus atau survei. Data yang ada tetap dapat dipakai sebagai data pendukung.',
    suggestedNextCode: '1.6',
  },
  '1.6': {
    phaseId: 'specify_need',
    code: '1.6',
    plainMeaning:
      'Mendokumentasikan temuan tahap kebutuhan ke dalam proposal atau Kerangka Acuan Kerja (KAK) untuk mendapatkan persetujuan.',
    whyItMatters:
      'Proposal/KAK merangkum kebutuhan, solusi, serta pertimbangan biaya–manfaat agar kegiatan dapat disetujui dan dilanjutkan ke perancangan.',
    prepareHints: [
      'Uraian proses yang berjalan (jika ada) dan proses yang diusulkan',
      'Ringkasan biaya, manfaat, dan kendala eksternal',
      'Draf KAK atau proposal kegiatan',
    ],
    afterThisYouHave: ['Kerangka Acuan Kerja (KAK) / Proposal kegiatan'],
    examples: [
      {
        id: 'ex-1.6-proposal-outline',
        suitability: 'A',
        title: 'Isi proposal yang disebut dalam materi',
        body: 'Materi mengarahkan dokumentasi temuan kebutuhan ke proposal/KAK, mencakup gambaran proses yang berjalan, solusi yang diusulkan, serta pertimbangan biaya–manfaat dan kendala eksternal.',
        sourceNote: 'Materi Proses Bisnis.pdf · Specify Need (Hal. 10–16)',
        simplified: true,
      },
    ],
    suggestedNextCode: undefined,
  },
}

export function getSpecifyNeedLearning(code: string): SubprocessLearning | undefined {
  return SPECIFY_NEED_LEARNING[code]
}
