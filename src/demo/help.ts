/**
 * Contextual help copy — display only; does not alter business rules.
 */
export const HELP_TOPICS = {
  portal_sdi: {
    title: 'Portal rujukan statistik',
    body: 'Sebelum mengumpulkan data baru, OPD wajib memeriksa ketersediaan data pada portal rujukan statistik — sirusa.web.bps.go.id, romantik.bps.go.id, portal SDI, dll. — agar tidak terjadi duplikasi kegiatan (Specify Need 1.5). Centang di tab Alur kerja setelah Anda benar-benar memeriksa.',
  },
  rekomendasi: {
    title: 'Rekomendasi ke BPS',
    body: 'Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS pada fase Perancangan (Hal. 17; Design 2.6). Isi formulir draf di Alur kerja, lalu centang checklist terkait. Tanpa ini, ekspor draf untuk proyek sektoral akan diblokir.',
  },
  metadata: {
    title: 'Metadata statistik',
    body: 'MS-Keg, MS-Var, dan MS-Ind mengikuti arah Peraturan BPS Nomor 5 Tahun 2020 sebagai draf. MS-Keg wajib lengkap sebelum ekspor. Isi field bertanda * sesuai kegiatan Anda — jangan biarkan contoh demo jika Anda sedang menyusun proyek nyata.',
  },
  gsbpm: {
    title: 'GSBPM 5.2',
    body: 'Generic Statistical Business Process Model membagi proses statistik menjadi delapan fase. Navigasi empat tahap di StatPlan adalah pembungkus antarmuka — bukan tahap resmi dalam modul PDF. Kerjakan checklist per fase di tab Alur kerja atau Checklist.',
  },
  checklist: {
    title: 'Checklist',
    body: 'Setiap subproses memiliki item wajib. Progres dihitung dari item yang relevan dengan jenis kegiatan dan klasifikasi. Target minimal 80% untuk ekspor. Centang hanya setelah pekerjaan benar-benar selesai.',
  },
  export: {
    title: 'Ekspor dokumen',
    body: 'Ekspor menghasilkan draf Word (.docx) di perangkat Anda setelah persyaratan wajib terpenuhi. Klik item error untuk loncat ke tab yang kurang. Dokumen ini draf bahan kerja, bukan dokumen resmi BPS.',
  },
  variables: {
    title: 'Manajer variabel',
    body: 'Variabel mendefinisikan unit data yang dikumpulkan (Design 2.2). Isi nama, definisi, tipe, skala, sumber, contoh nilai, dan aturan missing. Helper “Misal” mengikuti variabel yang sedang dibuka. Perubahan tersimpan otomatis.',
  },
  design: {
    title: 'Perancangan pengumpulan',
    body: 'Design 2.3 — pilih cara (Survei/Sensus/Kompromin), metode, dan moda. Mengubah cara pengumpulan menyesuaikan jenis kegiatan dan checklist. Survei: lengkapi sampling. Kompromin: fokus PKS/LADU dan sumber administratif.',
  },
  instruments: {
    title: 'Instrumen / kuesioner',
    body: 'Untuk Survei dan Sensus, susun pertanyaan runtun yang selaras variabel (Build 3.1). Untuk Kompromin tidak ada kuesioner — yang ditampilkan adalah pemetaan variabel ke sumber administrasi (Collect 4.2).',
  },
  timeline: {
    title: 'Timeline perencanaan',
    body: 'Menampilkan rencana minggu kerja per fase GSBPM sebagai gambaran jadwal. Pada versi demo bersifat ilustratif dan tidak menjadi syarat ekspor. Gunakan sebagai acuan diskusi perencanaan dengan BPS/OPD.',
  },
  activity: {
    title: 'Riwayat proyek',
    body: 'Menampilkan waktu pembuatan, perubahan terakhir, dan catatan pemeriksaan portal jika ada. Bukan log setiap aktivitas. Tidak perlu diisi manual dan tidak memengaruhi validasi ekspor.',
  },
  indicators: {
    title: 'Indikator',
    body: 'Indikator merangkum rumus yang memakai satu atau lebih variabel (misalnya IKM atau produktivitas). Pada data demo sudah terisi sebagai contoh. Pastikan rumus selaras dengan variabel yang Anda tetapkan sebelum dibahas dengan BPS.',
  },
  how_to: {
    title: 'Cara mengerjakan proyek',
    body: 'Urutan kerja: portal rujukan → checklist GSBPM → perancangan → variabel → instrumen (jika perlu) → metadata → rekomendasi BPS (sektoral) → ekspor draf. Ikuti kartu “Langkah berikutnya” di workspace agar tidak melewatkan syarat wajib.',
  },
  sampling: {
    title: 'Kalkulator ukuran sampel',
    body: 'Untuk Survei, gunakan kalkulator Yamane atau rumus Z di tab Perancangan sebagai hitungan awal ukuran sampel (rujukan modul ~hal. 48). Hasil ilustratif — desain sampel final wajib divalidasi BPS.',
  },
  contoh: {
    title: 'Contoh ilustrasi per topik',
    body: 'Panel Contoh ilustrasi menampilkan contoh per aktivitas/checklist pada fase GSBPM aktif, sesuai kata kunci topik. Template deterministik (bukan LLM). Bersifat demonstrasi — sesuaikan dengan konteks OPD.',
  },
  brainstorm: {
    title: 'Cek cepat GSBPM',
    body: 'Mode Asisten untuk mengecek jenis kegiatan dan fase GSBPM yang relevan tanpa membuat proyek atau mengunduh dokumen. Cocok untuk diskusi awal dengan BPS/OPD.',
  },
  share: {
    title: 'Tautan berbagi',
    body: 'Salin tautan berbagi dari workspace untuk mengirim draf perencanaan ke perangkat lain. Penerima membuka tautan lalu mengimpor proyek. Data tetap di browser — tidak ada server.',
  },
} as const

export type HelpTopicId = keyof typeof HELP_TOPICS
