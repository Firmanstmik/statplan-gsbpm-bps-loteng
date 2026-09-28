/**
 * Mode Terpandu — Pembangunan (Build) learning cards.
 * Seven official subprocesses, Materi Proses Bisnis Hal. 24–31.
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const BUILD_INTRO: GuidedPhaseIntro = {
  phaseId: 'build',
  title: 'Pembangunan',
  officialTitle: 'Build (Pembangunan)',
  question: 'Apa yang perlu dibangun dan diuji sebelum kegiatan dijalankan?',
  explanation:
    'Pada tahap ini rancangan diwujudkan menjadi instrumen, aplikasi dan aturan pengolahan, komponen diseminasi, dan alur kerja — lalu diuji dan difinalisasi.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 24–31',
  outputs: [
    'Sistem alur kerja (SOP)',
    'Instrumen (Kuesioner/Panduan Teknis Kegiatan)',
    'Sistem Pengumpulan, Pengolahan dan Diseminasi Data yang siap digunakan',
    'Surat Rekomendasi Kegiatan Statistik',
  ],
  outputsPage: 24,
}

export const GUIDED_BUILD_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-3.1',
    code: '3.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Instrumen Pengumpulan',
    title: 'Menyusun kuesioner',
    apa: 'Instrumen (kuesioner atau panduan teknis) dibangun dari rancangan variabel. Materi memberi prinsip urutan dan bentuk pertanyaan agar mudah dijawab dan tidak bias.',
    materiPoints: [
      'Susunan pertanyaan saling berkaitan satu sama lain secara logis, runtun, dan tidak meloncat-loncat.',
      'Pertanyaan yang mudah sebaiknya pada bagian awal kuesioner.',
      'Pertanyaan sensitif dan jawaban terbuka sebaiknya di bagian akhir kuesioner.',
      'Gunakan pertanyaan secara singkat dan jelas, tidak bertele-tele.',
      'Jangan gunakan pasangan pertanyaan yang mengecek reliabilitas.',
      'Perlu diperhatikan: relevansi pertanyaan (tujuan, responden, jenis studi), uji coba (validitas & reliabilitas), penyusunan buku pedoman.',
      'Hindari: pertanyaan ganda, pertanyaan yang mengarahkan, pertanyaan sensitif, pertanyaan yang menakut-nakuti.',
    ],
    pdfPage: 25,
    contoh:
      'Kuesioner SKM disusun dari yang mudah (identitas layanan) ke penilaian, lalu saran terbuka di akhir.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Blok I — mudah', value: 'Jenis layanan yang diterima, tanggal layanan' },
      { label: 'Blok II — inti', value: 'Penilaian tiap aspek pelayanan (skala 1–4)' },
      { label: 'Blok III — terbuka', value: 'Saran perbaikan (jawaban terbuka, di bagian akhir)' },
      {
        label: 'Contoh perbaikan',
        value:
          '“Apakah petugas ramah dan cepat?” → pertanyaan ganda; dipecah menjadi dua pertanyaan.',
      },
      { label: 'Pendamping', value: 'Buku pedoman pencacahan untuk petugas' },
    ],
    lessonPoints: [
      'Urutan: mudah → inti → sensitif/terbuka di akhir.',
      'Satu pertanyaan = satu hal; hindari yang mengarahkan.',
      'Instrumen selalu disertai buku pedoman dan diuji coba (3.6).',
    ],
    buktiClass: 'A',
    buktiPdfPage: 24,
  },
  {
    id: 'gsbpm-3.2',
    code: '3.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Komponen Pengolahan & Analisis',
    title: 'Membangun aplikasi dan aturan pengolahan',
    apa: 'Rancangan pengolahan (2.5) diwujudkan menjadi aplikasi beserta aturan editing, coding, validasi, dan integrasi data di dalamnya.',
    materiPoints: [
      'Membangun aplikasi sesuai rancangan (SPSS, EXCEL, desktop-based application).',
      'Membangun aturan editing, coding, dan validation pada aplikasi.',
      'Menyusun aturan integrasi data.',
    ],
    pdfPage: 26,
    contoh:
      'Materi menampilkan “Contoh Aturan Validasi”: kombinasi kondisi dua isian, status Clean/Error, pesan kesalahan, dan pesan perbaikan.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Aturan Validasi',
        kind: 'rule',
        imageSrc: '/materi/hal-26-contoh-aturan-validasi.png',
        imageWidth: 1319,
        imageHeight: 286,
        imageAlt:
          'Aturan 2.11: Hubungan b2r1a2k8 (nilai upah/gaji dalam bentuk barang untuk pekerja tetap perempuan selama setahun) dengan b2r1a2k4 (nilai pada Bulan Desember). Kolom: No., Kondisi b2r1a2k4 (2a), Kondisi b2r1a2k8 (2b), Status (3), Pesan Kesalahan (4), Pesan Perbaikan (5), Keterangan (6). Baris 1: ada isian, ada isian, Clean. Baris 2: b2r1a2k4 ada isian, b2r1a2k8 blank/0, Error, pesan “b2r1a2k8 tidak ada isian, tetapi b2r1a2k4 ada isian”, perbaikan “Jika b2r1a2k4 ada isian, maka b2r1a2k8 harus ada isian”. Baris 3 dan 4: Clean.',
        note: 'Gambar asli dari materi — tidak digambar ulang.',
      },
    ],
    materiLesson:
      'Aturan validasi ditulis sebagai tabel kondisi: semua kombinasi isian dicantumkan, hanya kombinasi yang tidak logis diberi status Error, dan setiap Error punya pesan kesalahan serta petunjuk perbaikan.',
    contohDetail: [
      { label: 'Aturan', value: 'Hubungan “jenis layanan” dengan “penilaian aspek waktu”' },
      { label: 'Kondisi → status', value: 'Jenis layanan ada isian, penilaian waktu kosong → Error' },
      { label: 'Pesan kesalahan', value: 'Penilaian aspek waktu kosong padahal layanan diterima' },
      { label: 'Pesan perbaikan', value: 'Tanyakan kembali penilaian aspek waktu kepada responden' },
    ],
    lessonPoints: [
      'Tulis semua kombinasi kondisi, bukan hanya kasus salah.',
      'Setiap Error wajib punya pesan kesalahan dan pesan perbaikan.',
      'Aturan dibangun di aplikasi sekarang; dijalankan di tahap Pengolahan (5.3).',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-3.3',
    code: '3.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Membangun Komponen Diseminasi',
    title: 'Menyiapkan komponen diseminasi',
    apa: 'Menyiapkan sistem penyebarluasan dan akses data, tampilan website, layanan pengguna, rencana produk diseminasi — termasuk aturan tabulasi yang menghubungkan rancangan tabel dengan kode variabel.',
    materiPoints: [
      'Mencakup pengaturan dan sistem penyebarluasan dan akses data, tampilan pada halaman website, layanan bagi penyedia data dan pengguna data, dan fungsi lain yang mendukung kegiatan diseminasi output statistik.',
      'Menyusun rencana produk diseminasi (buku, brosur, leaflet, booklet, banner, dsb).',
    ],
    pdfPage: 27,
    contoh:
      'Materi menampilkan “Contoh Aturan Tabulasi”: tabel yang sama dengan Hal. 18, kini tiap sel berisi kode variabel dan rumus.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Aturan Tabulasi',
        kind: 'table',
        imageSrc: '/materi/hal-27-contoh-aturan-tabulasi.png',
        imageWidth: 1106,
        imageHeight: 292,
        imageAlt:
          'Tabel 7.1. Jumlah Pekerja Laki-laki Perusahaan Peternakan Sapi Perah Pada Akhir Tahun 2024 Menurut Status Pekerja, berisi aturan: kolom Provinsi (1) diisi b1r1, Pekerja Tetap (2) diisi b2r1a1k2, Pekerja Honorer (3) diisi b2r1b1k2, Jumlah (4) diisi kol (2) + kol (3). Baris terakhir: Indonesia.',
        note: 'Gambar asli dari materi — bandingkan dengan rancangan tabel kosong di Hal. 18.',
      },
    ],
    materiLesson:
      'Aturan tabulasi mengubah rancangan tabel (2.1) menjadi instruksi pengolahan: setiap kolom menunjuk kode variabel di kuesioner, dan kolom turunan ditulis sebagai rumus.',
    contohDetail: [
      { label: 'Tabel', value: 'Tabel 1. Indeks Kepuasan … Menurut Aspek Pelayanan' },
      { label: 'Kolom (2) Nilai indeks', value: 'Rata-rata kode penilaian aspek (mis. r201–r209)' },
      { label: 'Kolom (3) Kategori mutu', value: 'Turunan dari kolom (2) sesuai kondef 1.4' },
      { label: 'Produk diseminasi', value: 'Laporan ringkas + leaflet hasil SKM' },
    ],
    lessonPoints: [
      'Setiap sel tabel harus bisa ditelusuri ke kode variabel di kuesioner.',
      'Kolom jumlah/turunan ditulis sebagai rumus antar kolom.',
      'Rencana produk diseminasi disusun sejak Build, bukan menunggu hasil.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-3.4',
    code: '3.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Konfigurasi Alur Kerja',
    title: 'Menyusun struktur organisasi dan alur dokumen',
    apa: 'Menetapkan struktur organisasi kegiatan dan alur dokumen: siapa melapor kepada siapa, siapa berkoordinasi dengan siapa, dan ke mana dokumen/data mengalir.',
    materiPoints: ['Struktur organisasi kegiatan.', 'Alur dokumen.'],
    pdfPage: 28,
    contoh:
      'Materi memberi contoh nyata dari pengelolaan data hortikultura: struktur organisasi dan alur laporan dokumen.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Struktur Organisasi Pengelolaan Data Hortikultura',
        kind: 'structure',
        imageSrc: '/materi/hal-28-struktur-organisasi-hortikultura.png',
        imageWidth: 555,
        imageHeight: 487,
        imageAlt:
          'Bagan struktur organisasi. Garis komando: Badan Pusat Statistik → BPS Provinsi → BPS Kabupaten/Kota; Diperta Kabupaten/Kota → Petugas Pengumpul Data Kecamatan. Koordinasi dan kerja sama (garis putus-putus): Kementerian Pertanian (Ditjen Hortikultura dan Pusdatin) ↔ Diperta Provinsi ↔ Diperta Kabupaten/Kota; BPS Provinsi ↔ Diperta Provinsi; BPS Kabupaten/Kota ↔ Diperta Kabupaten/Kota.',
      },
      {
        title: 'Alur Laporan Dokumen Data Hortikultura',
        kind: 'flow',
        imageSrc: '/materi/hal-28-alur-laporan-dokumen-hortikultura.png',
        imageWidth: 561,
        imageHeight: 589,
        imageAlt:
          'Diagram alur laporan. Dari Lahan (Petani/Perusahaan) melalui Desa, PPL, dan BPP ke Petugas Pengumpul Data; lalu ke Diperta Kab/Kota dan BPS Kab/Kota; data masuk ke Server Kementan dan Server BPS RI; berlanjut ke Diperta Provinsi, BPS, dan Direktorat Jenderal Hortikultura dan Pusdatin. Daftar Isian SPH berwarna putih, hijau, dan kuning ditandai pada jalur masing-masing. Keterangan: panah putus-putus = kerja sama dan koordinasi; panah utuh = pelaporan.',
      },
    ],
    materiLesson:
      'Dua gambar ini menjawab dua pertanyaan berbeda: struktur organisasi = siapa bertanggung jawab kepada siapa; alur dokumen = ke mana dokumen dan data bergerak. Keduanya memakai keterangan garis yang berbeda untuk komando/pelaporan dan koordinasi.',
    contohDetail: [
      { label: 'Garis komando', value: 'Kepala DPMPTSP → Koordinator SKM → Petugas loket' },
      { label: 'Koordinasi', value: 'Koordinator SKM ↔ Bagian TI (server aplikasi)' },
      { label: 'Alur dokumen', value: 'Isian CAPI → server → pengolah → laporan ke Kepala DPMPTSP' },
    ],
    lessonPoints: [
      'Bedakan garis komando/pelaporan dari garis koordinasi.',
      'Alur dokumen menunjukkan titik serah-terima data — tempat masalah sering muncul.',
      'Contoh hortikultura dipelajari bentuknya, bukan disalin isinya.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 24,
  },
  {
    id: 'gsbpm-3.5',
    code: '3.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Pengujian Sistem Produksi',
    title: 'Menguji sistem secara menyeluruh',
    apa: 'Menguji komponen yang sudah dibangun — tidak hanya satu per satu, tetapi juga interaksi antarkomponen — untuk memastikan sistem produksi bekerja dari awal sampai akhir.',
    materiPoints: [
      'Pengujian terhadap komponen dan alur kerja terkait yang sudah dibangun/diatur.',
      'Pengujian tidak hanya dilakukan secara individual pada masing-masing komponen, tetapi juga mencakup pengujian terhadap interaksi antar komponen, dan memastikan bahwa sistem produksi dapat bekerja dan berfungsi dengan baik.',
    ],
    pdfPage: 29,
    contoh:
      'Uji ujung-ke-ujung: isian uji di CAPI dikirim ke server, divalidasi, lalu muncul di tabel dummy.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Komponen', value: 'Aplikasi CAPI · Server · Aplikasi pengolahan · Tabel dummy' },
      { label: 'Uji individual', value: 'Setiap aturan validasi 3.2 dicoba dengan isian benar dan salah' },
      {
        label: 'Uji interaksi',
        value: '5 isian uji dikirim dari CAPI → apakah masuk server dan terbaca aplikasi pengolahan?',
      },
      { label: 'Hasil yang dicatat', value: 'Lulus / gagal per langkah + perbaikan yang diperlukan' },
    ],
    lessonPoints: [
      'Komponen yang lulus sendiri-sendiri belum tentu lulus saat digabung.',
      'Pengujian sistem berbeda dari pilot (3.6): di sini yang diuji adalah sistemnya.',
      'Catat hasil tiap langkah agar perbaikan dapat dilacak.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-3.6',
    code: '3.6',
    mappingKind: 'gsbpm',
    officialTitle: 'Uji Proses Bisnis Statistik (Pilot)',
    title: 'Uji coba proses (pilot)',
    apa: 'Uji coba seluruh proses dalam skala kecil sebelum kegiatan utama: kuesioner, metodologi lapangan, dan pengolahan data — untuk melihat apakah rancangan benar-benar bisa dijalankan.',
    materiPoints: [
      'Mencakup uji coba kuesioner, uji coba metodologi, dan uji coba pengolahan data.',
      'Uji coba kuesioner: apakah kondef dari variabel sudah dapat diaplikasikan seluruhnya di lapangan.',
      'Uji coba metodologi: apakah rancangan organisasi lapangan sudah memadai (beban tugas, koordinasi kerja, durasi setiap kegiatan, dsb).',
      'Uji coba pengolahan data: editing, coding, data entry, aturan validasi, dan dummy table — apakah pedoman dan program dapat berjalan sesuai yang diharapkan.',
      'Dapat diketahui rata-rata lamanya editing per dokumen, rata-rata entry data per dokumen, dan ukuran lain yang diperlukan.',
    ],
    pdfPage: 30,
    contoh:
      'Materi menyebut tiga lingkup uji coba — kuesioner, metodologi, dan pengolahan data — beserta tujuan masing-masing.',
    contohClass: 'A',
    contohDetail: [
      { label: 'Uji coba kuesioner', value: '10 pengguna layanan: apakah “aspek pelayanan” dipahami?' },
      { label: 'Uji coba metodologi', value: 'Berapa wawancara per petugas per hari tanpa antrean?' },
      { label: 'Uji coba pengolahan', value: 'Aturan validasi dan tabel dummy berjalan dengan data uji?' },
      { label: 'Ukuran yang dicatat', value: 'Rata-rata waktu wawancara dan entri per dokumen' },
    ],
    lessonPoints: [
      'Pilot menguji rancangan di lapangan, bukan hanya aplikasinya.',
      'Hasil pilot dipakai memperbaiki kondef, organisasi lapangan, dan aturan pengolahan.',
      'Ukuran waktu dari pilot membantu menyusun jadwal yang realistis.',
    ],
    buktiClass: 'B',
    buktiPdfPage: 30,
  },
  {
    id: 'gsbpm-3.7',
    code: '3.7',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi Sistem Produksi',
    title: 'Finalisasi dan dokumentasi sistem',
    apa: 'Memastikan semua komponen siap dipakai untuk produksi: menyusun dokumentasi teknis dan panduan pengguna, lalu memindahkan komponen ke lingkungan produksi.',
    materiPoints: [
      'Memastikan bahwa semua komponen yang telah dibangun, baik yang sudah ada maupun yang baru dibuat, berfungsi dengan baik dan siap digunakan pada proses produksi statistik.',
      'Penyusunan dokumentasi tentang komponen proses bisnis, termasuk penyusunan dokumentasi teknis dan panduan pengguna proses bisnis.',
      'Pemindahan komponen-komponen proses bisnis ke lingkungan produksi dan memastikan bahwa proses bisnis tersebut berjalan atau berfungsi sesuai harapan.',
    ],
    pdfPage: 31,
    contoh:
      'Aplikasi CAPI versi final dipasang di tablet petugas, disertai buku panduan dan dokumentasi teknis.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Dokumentasi teknis', value: 'Daftar aturan validasi, struktur database, cara backup' },
      { label: 'Panduan pengguna', value: 'Buku pedoman pencacahan dan penggunaan aplikasi SKM' },
      { label: 'Pemindahan ke produksi', value: 'Aplikasi versi final dipasang di semua tablet' },
      { label: 'Cek akhir', value: 'Satu isian uji di lingkungan produksi berhasil terkirim' },
    ],
    lessonPoints: [
      'Finalisasi = siap dipakai, terdokumentasi, dan sudah di lingkungan produksi.',
      'Panduan pengguna adalah bukti yang dibutuhkan saat pelatihan petugas (4.2).',
      'Setelah finalisasi, perubahan sistem sebaiknya tercatat.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 24,
  },
]

export function getBuildCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_BUILD_CARDS.find((c) => c.id === id)
}
