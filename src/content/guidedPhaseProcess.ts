/**
 * Mode Terpandu — Process learning cards (Slice 8).
 * Educational + preparation only. Does NOT process data or compute statistics.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const PROCESS_INTRO = {
  phaseId: 'process' as const,
  title: 'Process',
  question: 'Bagaimana data disiapkan dan diolah sebelum menghasilkan informasi?',
  explanation:
    'Pada tahap ini, data yang sudah dikumpulkan mulai disiapkan dan diolah agar dapat digunakan untuk menghasilkan informasi.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_PROCESS_CARDS: GuidedLearningCard[] = [
  {
    id: 'process-5.1',
    code: '5.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Integrasi Data',
    title: 'Integrasi data',
    apa: 'Jika data berasal dari beberapa bagian atau sumber, data dapat perlu digabungkan agar dapat diproses sebagai satu kesatuan. Tidak semua kegiatan membutuhkan integrasi.',
    contoh:
      'Rencana penggabungan sumber data — tanpa menjalankan join database di StatPlan.',
    contohClass: 'A',
    pdfPage: '37–45',
    contohDetail: [
      {
        label: 'Sumber data yang akan digabungkan (ilustratif)',
        value: 'Sumber A (hasil pengumpulan) + Sumber B (data pendukung yang sudah ada).',
      },
      {
        label: 'Dasar penggabungan',
        value: 'Kunci/identifikasi yang sama antar sumber (direncanakan — bukan dieksekusi di sini).',
      },
      {
        label: 'Hal yang perlu diperhatikan',
        value: 'Kelengkapan kunci · Duplikasi · Konsistensi definisi antar sumber.',
      },
    ],
    lessonPoints: [
      'Integrasi relevan jika ada lebih dari satu sumber.',
      'StatPlan hanya membantu merencanakan — bukan menjalankan join.',
      'Catat dasar penggabungan sebelum pengolahan lanjut.',
    ],
    templateTitle: 'Rencana integrasi data',
    templateFields: [
      { label: 'Sumber data yang akan digabungkan' },
      { label: 'Dasar penggabungan' },
      { label: 'Hal yang perlu diperhatikan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan sumber data', 'Rencana integrasi'],
    buktiClass: 'C',
  },
  {
    id: 'process-5.2',
    code: 'SP-P2',
    mappingKind: 'statplan',
    title: 'Agregasi / pengelompokan',
    apa: 'Data yang tersedia pada tingkat tertentu dapat diringkas atau dikelompokkan untuk menghasilkan informasi yang dibutuhkan. Mode Terpandu hanya membantu merencanakan — bukan menghitung agregat.',
    contoh:
      'Konsep agregasi dari materi: rencanakan pengelompokan tanpa mengisi angka hasil fiktif.',
    contohClass: 'A',
    pdfPage: 44,
    contohDetail: [
      { label: 'Data yang akan dikelompokkan', value: 'Data unit yang sudah siap diolah' },
      {
        label: 'Berdasarkan',
        value: 'Wilayah / kelompok / kategori (sesuaikan dengan output yang dirancang)',
      },
      {
        label: 'Output yang diharapkan',
        value: 'Ringkasan/tabulasi sesuai rancangan — tanpa angka hasil di StatPlan.',
      },
    ],
    lessonPoints: [
      'Agregasi merangkum data ke tingkat yang dibutuhkan pengguna.',
      'Jangan membuat angka hasil statistik fiktif di contoh.',
      'Rencana agregasi mengikuti rancangan output di Design.',
    ],
    templateTitle: 'Rencana pengelompokan / agregasi',
    templateFields: [
      { label: 'Data yang akan dikelompokkan' },
      { label: 'Berdasarkan' },
      { label: 'Output yang diharapkan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Rencana pengelompokan/agregasi', 'Catatan output'],
    buktiClass: 'C',
  },
  {
    id: 'process-5.3',
    code: '5.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Klasifikasi dan Pengodean',
    title: 'Coding',
    apa: 'Coding membantu menerjemahkan nilai atau kategori menjadi kode yang konsisten untuk pengolahan. Di Mode Terpandu Anda menyusun draft coding — bukan mesin pengodean otomatis.',
    contoh:
      'Contoh coding pada Materi Proses Bisnis Hal. 39. Preview konsep tersedia di materi.',
    contohClass: 'A',
    pdfPage: 39,
    materiExamples: [
      {
        title: 'Contoh coding',
        kind: 'rule',
        note: 'Materi: mengubah pilihan tertutup menjadi kode; menambahkan kode klasifikasi pada variabel akuisisi. Visual detail tidak digambar ulang di StatPlan.',
      },
    ],
    materiLesson:
      'Coding membuat nilai/kategori konsisten untuk pengolahan. Susun draft kode kegiatan Anda di Format kerja StatPlan.',
    lessonPoints: [
      'Contoh materi: pilihan tertutup → kode angka/huruf.',
      'Contoh materi: tambahkan kode klasifikasi pada isian akuisisi bila diperlukan.',
      'Draft StatPlan bukan mesin pengodean otomatis.',
    ],
    templateTitle: 'Draft coding',
    templateFields: [
      { label: 'Nama variabel' },
      { label: 'Kode' },
      { label: 'Nilai/kategori' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft coding', 'Daftar kode/kategori'],
    buktiClass: 'C',
  },
  {
    id: 'process-5.4',
    code: '5.6',
    mappingKind: 'gsbpm',
    officialTitle: 'Penurunan Variabel & Unit',
    title: 'Pembentukan unit baru',
    apa: 'Dalam kondisi tertentu, informasi dari beberapa unit dapat digunakan untuk membentuk unit analisis baru. Tidak setiap kegiatan memerlukan pembentukan unit baru.',
    contoh:
      'Materi Hal. 42 memuat contoh pembentukan unit rumah tangga dari informasi individu.',
    contohClass: 'A',
    pdfPage: 42,
    materiExamples: [
      {
        title: 'Pembentukan unit rumah tangga dari individu',
        kind: 'other',
        note: 'Contoh dari Materi Proses Bisnis Hal. 42 — bukan unit wajib untuk semua kegiatan.',
      },
    ],
    materiLesson:
      'Contoh ini menunjukkan bagaimana unit baru dapat dibentuk dari unit asal. Gunakan hanya jika kegiatan Anda membutuhkannya.',
    lessonPoints: [
      'Tidak setiap kegiatan membutuhkan pembentukan unit baru.',
      'Contoh household dari individual adalah contoh materi (Type A).',
      'Catat unit asal, unit baru, dan dasar pembentukan.',
    ],
    templateTitle: 'Rencana pembentukan unit',
    templateFields: [
      { label: 'Apakah pembentukan unit baru diperlukan?' },
      { label: 'Unit asal' },
      { label: 'Unit baru' },
      { label: 'Dasar pembentukan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan unit analisis',
      'Rencana pembentukan unit baru jika relevan',
    ],
    buktiClass: 'C',
  },
  {
    id: 'process-5.5',
    code: '5.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Perhitungan Bobot',
    title: 'Weighting jika relevan',
    apa: 'Weighting dapat digunakan dalam konteks tertentu, tetapi tidak semua jenis kegiatan menggunakannya. Untuk sensus lengkap atau kompilasi, weighting tidak diterapkan dengan cara yang sama seperti survei.',
    contoh:
      'Materi Hal. 43 membahas weighting. Weighting tidak diterapkan untuk sensus/kompilasi dengan cara yang sama seperti survei.',
    contohClass: 'A',
    pdfPage: 43,
    materiExamples: [
      {
        title: 'Weighting (konteks survei)',
        kind: 'method',
        note: 'Relevan pada konteks tertentu sesuai materi — bukan untuk semua jenis kegiatan.',
      },
      {
        title: 'Sensus / kompilasi',
        kind: 'method',
        note: 'Sesuai materi, weighting tidak diterapkan dengan cara yang sama seperti survei.',
      },
    ],
    materiLesson:
      'Tentukan dulu apakah weighting relevan. StatPlan tidak menyediakan kalkulator weighting.',
    lessonPoints: [
      'Weighting tidak otomatis untuk semua kegiatan.',
      'Sensus/kompilasi: weighting tidak diterapkan seperti pada survei (sesuai materi).',
      'Jangan mengklaim bobot sudah dihitung di StatPlan.',
    ],
    templateTitle: 'Catatan perencanaan weighting',
    templateFields: [
      { label: 'Apakah weighting relevan?' },
      { label: 'Dasar/rencana weighting' },
      { label: 'Catatan / alasan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan relevansi weighting',
      'Rencana weighting jika relevan',
    ],
    buktiClass: 'C',
  },
  {
    id: 'process-5.6',
    code: 'SP-P6',
    mappingKind: 'statplan',
    title: 'Rencana finalisasi proses',
    apa: 'Tinjau apakah rencana Process sudah cukup sebagai persiapan awal. Ini ringkasan Mode Terpandu — bukan pernyataan bahwa pengolahan data telah selesai.',
    contoh: 'Ringkasan rencana Process — dibuat StatPlan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Integrasi', value: 'Rencana sumber & dasar penggabungan dicatat / tidak relevan' },
      { label: 'Agregasi', value: 'Rencana pengelompokan disusun' },
      { label: 'Coding', value: 'Draft kode/kategori disiapkan' },
      { label: 'Unit baru', value: 'Diperlukan / tidak — sudah dicatat' },
      { label: 'Weighting', value: 'Relevan / tidak — sesuai jenis kegiatan' },
    ],
    lessonPoints: [
      'Ini ringkasan pembelajaran — bukan bukti pengolahan selesai.',
      'Periksa celah rencana sebelum Analyse.',
      'Catat risiko yang masih terbuka.',
    ],
    templateTitle: 'Ringkasan rencana proses',
    templateFields: [
      { label: 'Catatan proses' },
      { label: 'Hal yang masih perlu diperiksa' },
      { label: 'Risiko/kendala' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Ringkasan rencana proses', 'Daftar pemeriksaan'],
    buktiClass: 'C',
  },
]

export function getProcessCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_PROCESS_CARDS.find((c) => c.id === id)
}
