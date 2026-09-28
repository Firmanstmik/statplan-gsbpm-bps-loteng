/**
 * Mode Terpandu — Penyajian dan Penyebarluasan Data (Disseminate) learning cards.
 * Five official subprocesses, Materi Proses Bisnis Hal. 52–59.
 * Educational + preparation only. Does NOT publish, release, or promote products.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const DISSEMINATE_INTRO: GuidedPhaseIntro = {
  phaseId: 'disseminate',
  title: 'Penyajian dan Penyebarluasan',
  officialTitle: 'Disseminate (Penyajian dan Penyebarluasan Data)',
  question: 'Bagaimana output disiapkan, dirilis, dan sampai ke pengguna?',
  explanation:
    'Pada tahap ini data dan metadata dimuat ke sistem output, produk diseminasi dibuat, dirilis sesuai jadwal, dipromosikan, dan pengguna dilayani.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 52–59',
  outputs: [
    'Produk statis & dinamis yang disajikan melalui berbagai kanal',
    'Dokumentasi rilis dan promosi hasil kegiatan',
    'Data dan Metadata Statistik sesuai format baku',
  ],
  outputsPage: 52,
}

export const GUIDED_DISSEMINATE_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-7.1',
    code: '7.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Memutakhirkan Sistem Output',
    title: 'Memuat data dan metadata ke sistem output',
    apa: 'Data dan metadata diformat lalu dimasukkan ke sistem output (database), dan dipastikan setiap data terhubung dengan metadata yang sesuai. Metadata mengikuti struktur dan format baku yang ditetapkan BPS.',
    materiPoints: [
      'Memformat data dan metadata agar siap dimasukkan ke dalam sistem output (database).',
      'Memasukkan data dan metadata ke dalam sistem output (database).',
      'Memastikan bahwa data sudah terhubung dengan metadata yang sesuai.',
      'Memastikan kelengkapan metadata sebelum rilis (Hal. 52).',
    ],
    pdfPage: 53,
    contoh:
      'Materi Hal. 58–59: metadata statistik mengikuti Peraturan BPS Nomor 5 Tahun 2020 dan terdiri dari tiga jenis.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Jenis Metadata Statistik',
        kind: 'document',
        pdfPage: 59,
        items: [
          'Metadata Statistik – Kegiatan (MS-Keg): dokumentasi dari penyelenggaraan kegiatan statistik.',
          'Metadata Statistik – Variabel (MS-Var): dokumentasi penyusunan suatu variabel dalam kegiatan statistik.',
          'Metadata Statistik – Indikator (MS-Ind): dokumentasi dasar terbentuknya suatu indikator.',
        ],
        note: 'Struktur dan format metadata baku ditetapkan BPS — Peraturan BPS Nomor 5 Tahun 2020 tentang Petunjuk Teknis Metadata Statistik (Hal. 58).',
      },
    ],
    contohDetail: [
      { label: 'Data', value: 'Tabel indeks kepuasan per aspek (hasil final 6.5)' },
      { label: 'Format', value: 'Disesuaikan dengan struktur tabel pada sistem output unit' },
      { label: 'Tautan metadata', value: 'Tabel ↔ MS-Ind “Indeks Kepuasan Masyarakat”; dataset ↔ MS-Var' },
      { label: 'Cek sebelum rilis', value: 'MS-Keg, MS-Var, MS-Ind lengkap dan tertaut' },
    ],
    lessonPoints: [
      'Sistem output diperbarui sebelum produk dibuat dan dirilis.',
      'Setiap data harus terhubung ke metadata yang tepat.',
      'Tiga jenis metadata: kegiatan, variabel, indikator — semuanya mengikuti format baku BPS.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 52,
  },
  {
    id: 'gsbpm-7.2',
    code: '7.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Menghasilkan Produk Diseminasi',
    title: 'Membuat produk diseminasi',
    apa: 'Membuat produk diseminasi — publikasi cetak/elektronik atau tabulasi/grafik/peta — sesuai rencana: menyiapkan komponennya, menyatukannya, lalu memeriksa dan menyuntingnya agar memenuhi standar publikasi.',
    materiPoints: [
      'Menghasilkan produk diseminasi (berupa Publikasi Cetak/Elektronik atau Tabulasi/Grafik/Peta), sebagaimana yang telah direncanakan, untuk memenuhi kebutuhan pengguna.',
      'Menyiapkan komponen-komponen dari produk diseminasi, seperti catatan atau penjelasan teknis, tabel, grafik, peta, pernyataan kualitas, dan lain-lain.',
      'Menyusun atau menyatukan komponen-komponen dari produk diseminasi menjadi suatu produk diseminasi.',
      'Memeriksa dan menyunting produk diseminasi agar memenuhi standar publikasi.',
    ],
    pdfPage: 54,
    contoh:
      'SKM: laporan ringkas elektronik berisi Tabel 1, grafik per aspek, catatan teknis, dan pernyataan kualitas.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Produk', value: 'Laporan Ringkas SKM Pelayanan Perizinan 2026 (PDF)' },
      { label: 'Komponen', value: 'Tabel 1 · Grafik per aspek · Catatan teknis · Pernyataan kualitas' },
      { label: 'Disatukan menjadi', value: 'Satu dokumen 8 halaman' },
      { label: 'Pemeriksaan', value: 'Cek angka tabel = angka final 6.5; sunting bahasa' },
    ],
    lessonPoints: [
      'Produk dibuat sesuai rencana (3.3) — tidak mendadak.',
      'Komponen pendukung (catatan teknis, pernyataan kualitas) sama pentingnya dengan tabel.',
      'Pemeriksaan akhir memastikan angka produk sama dengan output final.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 52,
  },
  {
    id: 'gsbpm-7.3',
    code: '7.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Merilis Produk Statistik',
    title: 'Merilis produk',
    apa: 'Memastikan semua produk siap, mengatur jadwal dan mekanisme rilis, briefing pra-rilis bagi pimpinan, dan menyiapkan mekanisme jika ditemukan kesalahan setelah terbit.',
    materiPoints: [
      'Memastikan bahwa seluruh produk diseminasi sudah siap dan tersedia untuk dirilis atau diterbitkan.',
      'Mengatur jadwal dan mekanisme rilis produk diseminasi.',
      'Mengatur mekanisme ketika ditemukan kesalahan pada produk diseminasi yang telah diterbitkan ke masyarakat.',
      'Briefing pra rilis bagi pimpinan dan atau pemangku kepentingan (Hal. 52).',
    ],
    pdfPage: 55,
    contoh:
      'SKM: rilis dijadwalkan sebelum rapat evaluasi; briefing pra-rilis untuk Kepala DPMPTSP sehari sebelumnya.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Kesiapan', value: 'Laporan ringkas final dan metadata tertaut (7.1, 7.2)' },
      { label: 'Jadwal rilis', value: 'Tanggal rencana Anda — bukan jadwal resmi BPS' },
      { label: 'Mekanisme rilis', value: 'Diunggah ke laman unit dan dibagikan di rapat' },
      { label: 'Briefing pra-rilis', value: 'Kepala DPMPTSP, H-1' },
      { label: 'Jika ada kesalahan', value: 'Ralat diterbitkan dengan catatan perubahan dan tanggal' },
    ],
    lessonPoints: [
      'Rilis punya jadwal dan mekanisme yang ditetapkan sebelumnya.',
      'Mekanisme ralat disiapkan sebelum terjadi kesalahan.',
      'Briefing pra-rilis memberi pimpinan waktu memahami hasil.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 52,
  },
  {
    id: 'gsbpm-7.4',
    code: '7.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Mempromosikan Produk Statistik',
    title: 'Mempromosikan produk',
    apa: 'Mempromosikan produk diseminasi secara aktif agar menjangkau masyarakat seluas mungkin, misalnya melalui media sosial atau situs web.',
    materiPoints: [
      'Mempromosikan produk diseminasi secara aktif untuk menjangkau masyarakat seluas mungkin (misal: melalui media sosial ataupun situs web).',
      'Mempromosikan produk agar menjangkau pengguna luas, dapat melalui website, media sosial, dan platform digital (Hal. 52).',
    ],
    pdfPage: 56,
    contoh:
      'SKM: infografis satu halaman di media sosial instansi dan tautan laporan di situs web.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Produk dipromosikan', value: 'Laporan Ringkas SKM 2026' },
      { label: 'Sasaran', value: 'Masyarakat pengguna layanan dan pemangku kepentingan' },
      { label: 'Kanal', value: 'Media sosial instansi · situs web · papan informasi loket' },
      { label: 'Materi pendukung', value: 'Infografis satu halaman' },
    ],
    lessonPoints: [
      'Promosi aktif — produk tidak cukup hanya diunggah.',
      'Pilih kanal yang benar-benar dipakai pengguna sasaran.',
      'Dokumentasikan promosi: ini bagian dari output resmi tahap Diseminasi.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 52,
  },
  {
    id: 'gsbpm-7.5',
    code: '7.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Layanan dan Dukungan Pengguna',
    title: 'Melayani pengguna',
    apa: 'Memastikan permohonan atau pertanyaan pengguna — misalnya permintaan data mikro yang sudah dianonimisasi — dicatat dan dipenuhi dalam batas waktu yang ditentukan, serta menyediakan FAQ.',
    materiPoints: [
      'Memastikan bahwa permohonan atau pertanyaan terhadap suatu layanan, seperti layanan data mikro (rawdata yang telah dianonimisasi), dicatat serta dipenuhi dalam batas waktu yang telah ditentukan.',
      'Mencatat, menindaklanjuti dan mengelola pertanyaan/permintaan data pengguna (Hal. 52).',
      'Menyediakan dan mengelola FAQ dan basis pengetahuan (Hal. 52).',
    ],
    pdfPage: 57,
    contoh:
      'SKM: permintaan data dicatat di buku layanan, dijawab maksimal 5 hari kerja; FAQ tentang cara membaca indeks.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Pencatatan', value: 'Tanggal masuk · peminta · isi permintaan · tanggal dipenuhi' },
      { label: 'Batas waktu', value: '5 hari kerja (contoh — tetapkan sesuai kebijakan unit)' },
      { label: 'Data mikro', value: 'Hanya versi anonim dari 6.4' },
      { label: 'FAQ', value: '“Apakah hasil mewakili seluruh layanan?” — jelaskan cakupan' },
    ],
    lessonPoints: [
      'Setiap permintaan dicatat dan punya batas waktu pemenuhan.',
      'Data mikro yang dilayani harus sudah dianonimisasi.',
      'FAQ mengurangi pertanyaan berulang dan menjelaskan batasan hasil.',
    ],
    buktiClass: 'C',
  },
]

export function getDisseminateCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_DISSEMINATE_CARDS.find((c) => c.id === id)
}
