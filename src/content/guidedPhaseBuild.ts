/**
 * Mode Terpandu — Build learning cards (Slice 6).
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const BUILD_INTRO = {
  phaseId: 'build' as const,
  title: 'Build',
  question: 'Apa yang perlu disiapkan sebelum kegiatan dijalankan?',
  explanation:
    'Pada tahap ini, rancangan mulai diterjemahkan menjadi instrumen, aturan pemeriksaan, alur kerja, dan pengujian awal sebelum digunakan.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_BUILD_CARDS: GuidedLearningCard[] = [
  {
    id: 'build-3.1',
    code: '3.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Instrumen Pengumpulan',
    title: 'Instrumen',
    apa: 'Instrumen adalah alat yang digunakan untuk memperoleh data sesuai rancangan kegiatan. Menyusun draft instrumen membantu memastikan data yang dibutuhkan dapat dikumpulkan dengan jelas.',
    contoh:
      'Prinsip instrumen pada materi Hal. 25. Format isian di bawah adalah Format kerja StatPlan — bukan template resmi BPS.',
    contohClass: 'A',
    pdfPage: 25,
    materiExamples: [
      {
        title: 'Prinsip penyusunan instrumen / kuesioner',
        kind: 'document',
        note: 'Materi Hal. 25 membahas aturan/prinsip penyusunan instrumen.',
      },
    ],
    materiLesson:
      'Gunakan prinsip materi sebagai panduan konsep. Susun draft instrumen kegiatan Anda di Format kerja StatPlan.',
    contohDetail: [
      { label: 'Nama instrumen', value: 'Kuesioner SKM Pelayanan Perizinan' },
      { label: 'Jenis instrumen', value: 'Kuesioner terstruktur' },
      {
        label: 'Tujuan',
        value: 'Mengumpulkan penilaian masyarakat terhadap aspek pelayanan perizinan.',
      },
      {
        label: 'Data yang dikumpulkan',
        value: 'Penilaian aspek pelayanan; karakteristik responden yang relevan.',
      },
      {
        label: 'Catatan',
        value: 'Draft awal untuk uji coba — bukan instrumen resmi yang sudah disetujui.',
      },
    ],
    lessonPoints: [
      'Instrumen harus menghubungkan pertanyaan dengan data/output yang dirancang.',
      'Format di StatPlan adalah format kerja — bukan template resmi BPS.',
      'Siapkan catatan jenis, tujuan, dan data yang dikumpulkan sebelum uji coba.',
    ],
    templateTitle: 'Format kerja instrumen',
    templateFields: [
      { label: 'Nama instrumen' },
      { label: 'Jenis instrumen' },
      { label: 'Tujuan instrumen' },
      { label: 'Data yang ingin diperoleh' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft instrumen', 'Catatan desain instrumen'],
    buktiClass: 'C',
  },
  {
    id: 'build-3.2',
    code: '3.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Komponen Pengolahan & Analisis',
    title: 'Pemeriksaan / validasi',
    apa: 'Data yang diisi atau dikumpulkan perlu memiliki aturan pemeriksaan agar kualitas dan konsistensi lebih terjaga. Di Mode Terpandu, Anda menyusun draft aturan — bukan menjalankan mesin validasi.',
    contoh:
      'Materi memuat “Contoh Aturan Validasi”. Preview tersedia di materi — StatPlan tidak menggambar ulang isi visual yang tidak dapat diverifikasi.',
    contohClass: 'A',
    pdfPage: 26,
    materiExamples: [
      {
        title: 'Contoh Aturan Validasi',
        kind: 'rule',
        note: 'Preview contoh tersedia di Materi Proses Bisnis Hal. 26. Visual asli tidak digambar ulang di StatPlan.',
      },
    ],
    materiLesson:
      'Contoh ini menunjukkan bahwa data perlu aturan pemeriksaan agar konsisten. Susun aturan sederhana untuk kegiatan Anda di Format kerja StatPlan.',
    lessonPoints: [
      'Aturan validasi memeriksa kondisi data sebelum pengolahan lanjut.',
      'Draft StatPlan bukan mesin validasi otomatis.',
      'Catat: nama pemeriksaan, kondisi, dan tindakan jika tidak sesuai.',
    ],
    templateTitle: 'Format kerja StatPlan — draft aturan pemeriksaan',
    templateFields: [
      { label: 'Nama pemeriksaan' },
      { label: 'Kondisi yang diperiksa' },
      { label: 'Tindakan jika tidak sesuai' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft aturan pemeriksaan', 'Catatan hasil review'],
    buktiClass: 'C',
  },
  {
    id: 'build-3.3',
    code: '3.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Komponen Diseminasi',
    title: 'Tabulasi awal',
    apa: 'Menyiapkan rancangan tabulasi membantu menghubungkan output yang diinginkan dengan data yang akan diolah. Ini persiapan, bukan mesin perhitungan statistik.',
    contoh:
      'Materi memuat “Contoh Aturan Tabulasi”. Preview tersedia di materi — jangan menginvent isi visual.',
    contohClass: 'A',
    pdfPage: 27,
    materiExamples: [
      {
        title: 'Contoh Aturan Tabulasi',
        kind: 'table',
        note: 'Preview contoh tersedia di Materi Proses Bisnis Hal. 27. Visual asli tidak digambar ulang di StatPlan.',
      },
    ],
    materiLesson:
      'Contoh ini membantu menghubungkan output yang diinginkan dengan data yang akan dipakai. Catat rencana tabulasi tanpa menghitung angka hasil.',
    lessonPoints: [
      'Aturan tabulasi menghubungkan data dengan bentuk tabel/output.',
      'Jangan mengisi contoh dengan angka hasil fiktif.',
      'Format kerja StatPlan mencatat rencana — bukan engine perhitungan.',
    ],
    templateTitle: 'Format kerja StatPlan — tabulasi awal',
    templateFields: [
      { label: 'Nama tabel/output' },
      { label: 'Data yang digunakan' },
      { label: 'Catatan aturan tabulasi' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft tabulasi', 'Catatan aturan pengolahan/tabulasi'],
    buktiClass: 'C',
  },
  {
    id: 'build-3.4',
    code: '3.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Konfigurasi Alur Kerja',
    title: 'Alur / pembagian kerja',
    apa: 'Rancangan kegiatan perlu memperjelas siapa melakukan apa dan bagaimana proses berjalan. Materi Proses Bisnis menampilkan contoh struktur organisasi dan alur dokumen untuk konteks hortikultura — bukan alur wajib untuk semua kegiatan.',
    contoh:
      'Hal. 28 menampilkan contoh visual hortikultura yang benar-benar ada di materi — bukan contoh buatan StatPlan.',
    contohClass: 'A',
    pdfPage: 28,
    materiExamples: [
      {
        title: 'Struktur Organisasi Pengelolaan Data Hortikultura',
        kind: 'structure',
        note: 'Contoh struktur organisasi pengelolaan data pada materi Hal. 28.',
      },
      {
        title: 'Alur Laporan Dokumen Data Hortikultura',
        kind: 'flow',
        note: 'Contoh alur laporan dokumen pada materi Hal. 28.',
      },
    ],
    materiLesson:
      'Contoh ini menunjukkan bahwa kegiatan statistik perlu kejelasan struktur organisasi dan alur dokumen. Bentuknya menyesuaikan konteks kegiatan Anda — contoh hortikultura tidak wajib ditiru.',
    lessonPoints: [
      'Pelajari struktur dan alur dari contoh materi, lalu sesuaikan ke konteks Anda.',
      'Contoh hortikultura adalah Type A — jangan dilabeli sebagai buatan StatPlan.',
      'Format kerja StatPlan dipakai untuk menuliskan peran dan hasil yang diharapkan.',
    ],
    templateTitle: 'Format kerja StatPlan — alur / pembagian kerja',
    templateFields: [
      { label: 'Kegiatan' },
      { label: 'Pelaksana/peran' },
      { label: 'Hasil yang diharapkan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Draft alur kerja', 'Catatan pembagian peran'],
    buktiClass: 'C',
  },
  {
    id: 'build-3.5',
    code: '3.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Uji Proses Bisnis Statistik (Pilot)',
    title: 'Uji coba / pilot',
    apa: 'Uji coba membantu melihat apakah rancangan dapat digunakan sebelum kegiatan utama dilaksanakan. Mode Terpandu hanya membantu merencanakan uji coba — bukan menjalankan pengumpulan data.',
    contoh:
      'Ruang lingkup pilot pada materi Hal. 30 mencakup beberapa bagian yang dapat diuji.',
    contohClass: 'A',
    pdfPage: 30,
    materiExamples: [
      { title: 'questionnaire', kind: 'other', note: 'Ruang lingkup pilot: instrumen/kuesioner.' },
      { title: 'methodology', kind: 'other', note: 'Ruang lingkup pilot: metodologi.' },
      { title: 'processing', kind: 'other', note: 'Ruang lingkup pilot: pengolahan.' },
      { title: 'dummy table', kind: 'other', note: 'Ruang lingkup pilot: tabel dummy.' },
    ],
    materiLesson:
      'Empat cakupan di atas adalah contoh ruang lingkup pilot dari materi. Pilih bagian yang relevan untuk kegiatan Anda.',
    lessonPoints: [
      'Pilot menguji rancangan sebelum kegiatan utama.',
      'Ruang lingkup dapat mencakup instrumen, metodologi, pengolahan, dan tabel dummy.',
      'StatPlan membantu merencanakan — bukan menjalankan pengumpulan responden.',
    ],
    templateTitle: 'Rencana uji coba',
    templateFields: [
      { label: 'Bagian yang akan diuji' },
      { label: 'Tujuan uji coba' },
      { label: 'Temuan yang perlu diperhatikan' },
      { label: 'Perbaikan yang direncanakan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Rencana uji coba', 'Catatan temuan/perbaikan'],
    buktiClass: 'B',
    buktiPdfPage: 30,
  },
  {
    id: 'build-3.6',
    code: 'SP-B6',
    mappingKind: 'statplan',
    title: 'Finalisasi persiapan',
    apa: 'Sebelum masuk tahap berikutnya, tinjau apakah bahan Build sudah cukup sebagai persiapan awal. Ini ringkasan pembelajaran StatPlan — bukan persetujuan resmi.',
    contoh:
      'Ringkasan kesiapan bahan Build — status persiapan, bukan approval.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Instrumen', value: 'Siap ditinjau' },
      { label: 'Aturan validasi', value: 'Sudah disusun' },
      { label: 'Aturan tabulasi', value: 'Sudah disiapkan' },
      { label: 'Pilot', value: 'Ruang lingkup sudah ditentukan' },
    ],
    lessonPoints: [
      'Finalisasi adalah tinjauan kesiapan — bukan persetujuan BPS.',
      'Catat bagian yang masih perlu diperbaiki sebelum Collect.',
      'Gunakan ringkasan ini sebagai checklist pembelajaran.',
    ],
    templateTitle: 'Ringkasan finalisasi persiapan',
    templateFields: [
      { label: 'Catatan finalisasi' },
      { label: 'Hal yang masih perlu diperbaiki' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar bahan yang sudah disiapkan', 'Catatan perbaikan'],
    buktiClass: 'C',
  },
]

export function getBuildCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_BUILD_CARDS.find((c) => c.id === id)
}
