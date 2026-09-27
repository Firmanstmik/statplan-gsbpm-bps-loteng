/**
 * Mode Terpandu — Perancangan learning cards (Slice 5).
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 */
import type { GuidedSourceClass } from '@/content/guidedPhaseNeed'
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const DESIGN_INTRO = {
  phaseId: 'design' as const,
  title: 'Perancangan',
  question: 'Bagaimana kebutuhan statistik diterjemahkan menjadi rancangan kegiatan?',
  explanation:
    'Pada tahap ini, Anda mulai merancang bagaimana kebutuhan statistik akan diterjemahkan menjadi data, output, metode, jadwal, dan persiapan pelaksanaan.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_DESIGN_CARDS: GuidedLearningCard[] = [
  {
    id: 'design-2.1',
    code: '2.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Output & Diseminasi',
    title: 'Rancangan output / tabulasi',
    apa: 'Sebelum menentukan data yang dikumpulkan, bayangkan informasi seperti apa yang nantinya ingin dihasilkan. Rancangan output membantu Anda membayangkan bentuk hasil akhir.',
    contoh:
      'Materi menampilkan “Contoh Rancangan Tabulasi” sebagai gambaran bentuk penyajian. Preview tersedia di materi — StatPlan tidak menggambar ulang tabel fiktif.',
    contohClass: 'A',
    pdfPage: 18,
    materiExamples: [
      {
        title: 'Contoh Rancangan Tabulasi',
        kind: 'table',
        note: 'Preview contoh tersedia di Materi Proses Bisnis Hal. 18. Visual asli tidak digambar ulang di StatPlan.',
      },
    ],
    materiLesson:
      'Contoh ini membantu membayangkan bentuk penyajian output sebelum merancang pengumpulan data.',
    lessonPoints: [
      'Rancangan tabulasi dibuat sebelum instrumen final.',
      'Bayangkan baris/kolom informasi yang ingin ditampilkan — bukan angka hasil.',
      'Susun versi kegiatan Anda di Format kerja StatPlan; jangan menyalin isi tabel materi sebagai data resmi.',
    ],
    templateTitle: 'Format kerja StatPlan — rancangan output',
    templateFields: [
      { label: 'Judul output' },
      { label: 'Informasi yang ingin ditampilkan' },
      { label: 'Kelompok / pembanding' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft rancangan output/tabulasi', 'Catatan kebutuhan informasi'],
    buktiClass: 'C',
  },
  {
    id: 'design-2.2',
    code: '2.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Variabel',
    title: 'Variabel',
    apa: 'Variabel adalah potongan informasi yang diperlukan untuk menghasilkan output. Menyusun daftar variabel awal membantu memastikan data yang dikumpulkan relevan.',
    contoh:
      'Contoh variabel yang terlihat pada materi: nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi.',
    contohClass: 'A',
    pdfPage: 19,
    materiExamples: [
      { title: 'nama', kind: 'other' },
      { title: 'umur', kind: 'other' },
      { title: 'jenis kelamin', kind: 'other' },
      { title: 'pendidikan', kind: 'other' },
      { title: 'pekerjaan', kind: 'other' },
      { title: 'instansi', kind: 'other' },
    ],
    materiLesson:
      'Daftar di atas adalah contoh variabel yang muncul di materi — bukan daftar wajib untuk setiap kegiatan.',
    lessonPoints: [
      'Pilih variabel yang benar-benar dibutuhkan untuk output.',
      'Tidak setiap kegiatan membutuhkan semua contoh di materi.',
      'Catat definisi singkat agar pengertian variabel seragam.',
    ],
    templateTitle: 'Format daftar variabel awal',
    templateFields: [
      { label: 'Nama variabel' },
      { label: 'Untuk apa digunakan?' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar variabel awal', 'Catatan definisi variabel'],
    buktiClass: 'C',
  },
  {
    id: 'design-2.3',
    code: '2.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Pengumpulan Data',
    title: 'Cara / metode / moda',
    apa: 'Pada bagian ini, Anda mulai menentukan bagaimana data akan diperoleh. Materi membedakan istilah cara, metode, dan moda pengumpulan.',
    contoh:
      'Taxonomy materi Hal. 20 membedakan cara, metode, dan moda. StatPlan tidak memilih metode otomatis untuk Anda.',
    contohClass: 'A',
    pdfPage: 20,
    materiExamples: [
      {
        title: 'Cara',
        kind: 'method',
        note: 'Bagaimana data diperoleh secara umum (misalnya survei), sesuai taxonomy materi.',
      },
      {
        title: 'Metode',
        kind: 'method',
        note: 'Teknik pengumpulan (misalnya wawancara), sesuai taxonomy materi.',
      },
      {
        title: 'Moda',
        kind: 'method',
        note: 'Media/alat pengumpulan (misalnya CAPI), sesuai taxonomy materi.',
      },
    ],
    materiLesson:
      'Bedakan tiga istilah sebelum mengisi rancangan. Pilihan tergantung konteks kegiatan Anda.',
    lessonPoints: [
      'Cara ≠ metode ≠ moda — tulis masing-masing secara terpisah.',
      'Jangan otomatis memilih satu metode hanya karena contoh umum.',
      'Catat alasan singkat agar keputusan metode dapat ditinjau ulang.',
    ],
    templateTitle: 'Format cara / metode / moda',
    templateFields: [
      { label: 'Cara' },
      { label: 'Metode' },
      { label: 'Moda' },
      { label: 'Catatan metode' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan cara/metode/moda'],
    buktiClass: 'B',
    buktiPdfPage: 20,
  },
  {
    id: 'design-2.4',
    code: '2.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Kerangka Sampel',
    title: 'Metode pengambilan sampel',
    apa: 'Jika kegiatan menggunakan sampel, tentukan bagaimana bagian dari populasi akan dipilih. Untuk sensus atau kompilasi data, kebutuhan sampling dapat berbeda atau tidak digunakan.',
    contoh:
      'Materi Hal. 21 membahas metode sampling. Bedakan konteks survei vs sensus vs kompilasi — StatPlan tidak menghitung ukuran sampel.',
    contohClass: 'A',
    pdfPage: 21,
    materiExamples: [
      {
        title: 'Survei',
        kind: 'method',
        note: 'Sampling biasanya relevan karena hanya sebagian populasi diamati.',
      },
      {
        title: 'Sensus',
        kind: 'method',
        note: 'Umumnya mencakup seluruh populasi — kebutuhan sampling berbeda.',
      },
      {
        title: 'Kompilasi',
        kind: 'method',
        note: 'Data dari sumber yang sudah ada; sampling sering tidak diterapkan seperti pada survei.',
      },
    ],
    materiLesson:
      'Jenis kegiatan memengaruhi apakah sampling digunakan. Pilih metode sesuai rancangan — bukan otomatis dari StatPlan.',
    lessonPoints: [
      'Tentukan dulu apakah kegiatan memakai sampel.',
      'Survei, sensus, dan kompilasi punya kebutuhan sampling yang berbeda.',
      'StatPlan tidak menyediakan kalkulator ukuran sampel.',
    ],
    templateTitle: 'Format catatan sampling',
    templateFields: [
      { label: 'Apakah menggunakan sampel?' },
      { label: 'Metode sampling (jika ya)' },
      { label: 'Alasan / catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan metode sampling, jika relevan'],
    buktiClass: 'B',
    buktiPdfPage: 21,
  },
  {
    id: 'design-2.5',
    code: 'SP-R5',
    mappingKind: 'statplan',
    title: 'Jadwal kegiatan',
    apa: 'Susun kegiatan utama di dalam rentang waktu yang sudah Anda tentukan. Jadwal ini melengkapi rencana waktu tahap — bukan menggantinya.',
    contoh:
      'Materi memuat contoh jadwal SKM. Itu contoh sumber — bukan klaim durasi wajib untuk proyek Anda.',
    contohClass: 'A',
    pdfPage: 23,
    materiExamples: [
      {
        title: 'Contoh jadwal SKM',
        kind: 'schedule',
        note: 'Contoh jadwal pada Materi Proses Bisnis Hal. 23 — bukan jadwal wajib.',
      },
    ],
    materiLesson:
      'Contoh jadwal membantu melihat bagaimana kegiatan diurutkan dalam waktu. Sesuaikan dengan rentang proyek Anda sendiri.',
    lessonPoints: [
      'Jadwal contoh di materi bukan durasi wajib.',
      'Susun kegiatan utama (persiapan → pengumpulan → pengolahan → diseminasi) sesuai kapasitas Anda.',
      'Catat mulai/selesai agar progress mudah ditinjau.',
    ],
    templateTitle: 'Format jadwal kegiatan',
    templateFields: [
      { label: 'Kegiatan' },
      { label: 'Mulai' },
      { label: 'Selesai' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft jadwal kegiatan'],
    buktiClass: 'C',
  },
  {
    id: 'design-2.6',
    code: 'SP-R6',
    mappingKind: 'statplan',
    title: 'SOP & persiapan rekomendasi',
    apa: 'Sebelum kegiatan berjalan, beberapa prosedur dan persiapan administratif perlu direncanakan — termasuk SOP dan persiapan rekomendasi bila relevan.',
    contoh:
      'Materi Hal. 23 mengaitkan perencanaan jadwal dengan SOP dan persiapan rekomendasi. StatPlan hanya membantu pencatatan — bukan memberikan approval.',
    contohClass: 'A',
    pdfPage: 23,
    materiExamples: [
      {
        title: 'SOP & persiapan rekomendasi',
        kind: 'document',
        note: 'Struktur/persiapan yang disebut pada materi Hal. 23 — bukan persetujuan StatPlan.',
      },
    ],
    materiLesson:
      'Siapkan catatan SOP dan status persiapan rekomendasi bila relevan. StatPlan tidak mengirim atau menyetujui rekomendasi.',
    lessonPoints: [
      'SOP menclarifikasi prosedur agar pelaksanaan konsisten.',
      'Persiapan rekomendasi (bila relevan) dicatat sebagai status — bukan approval BPS.',
      'Format kerja StatPlan hanya membantu dokumentasi awal.',
    ],
    templateTitle: 'Format SOP & persiapan rekomendasi',
    templateFields: [
      { label: 'Nama SOP' },
      { label: 'Status persiapan rekomendasi' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft SOP', 'Catatan persiapan rekomendasi'],
    buktiClass: 'B',
    buktiPdfPage: 23,
  },
]

export function getDesignCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_DESIGN_CARDS.find((c) => c.id === id)
}

export function designSourceNote(cls: GuidedSourceClass, page?: number): string {
  if (cls === 'A' && page != null) return `Menurut Materi Proses Bisnis · Hal. ${page}`
  if (cls === 'B' && page != null) return `Penjelasan sederhana · Hal. ${page}`
  if (cls === 'B') return 'Penjelasan sederhana'
  return 'Contoh ilustratif'
}
