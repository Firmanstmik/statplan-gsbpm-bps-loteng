/**
 * Mode Terpandu — Pengumpulan Data (Collect) learning cards.
 * Four official subprocesses, Materi Proses Bisnis Hal. 32–36.
 * Educational + preparation only. Does NOT run data collection.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const COLLECT_INTRO: GuidedPhaseIntro = {
  phaseId: 'collect',
  title: 'Pengumpulan Data',
  officialTitle: 'Collect (Pengumpulan Data)',
  question: 'Bagaimana data dikumpulkan sesuai rancangan?',
  explanation:
    'Pada tahap ini sampel dipilih, petugas dan sumber daya disiapkan, data dikumpulkan sambil dipantau, lalu hasil pengumpulan difinalisasi.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 32–36',
  outputs: [
    'Daftar sampel (unit observasi)',
    'Surat Perjanjian Penggunaan Data (PKS/LADU)',
    'Dokumentasi Pelaksanaan Pelatihan Petugas',
    'Dokumentasi Rapat Monitoring Pelaksanaan dan Pemantauan Kualitas Pengumpulan Data',
    'Metadata Statistik Kegiatan',
  ],
  outputsPage: 32,
}

export const GUIDED_COLLECT_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-4.1',
    code: '4.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyusun Kerangka dan Memilih Sampel',
    title: 'Menyiapkan kerangka dan menarik sampel',
    apa: 'Rancangan sampel (2.4) dijalankan: kerangka sampel disiapkan, lalu sampel ditarik. Tidak dilakukan untuk sensus/pendataan lengkap atau kompromin.',
    materiPoints: [
      'Menyiapkan kerangka sampel.',
      'Melakukan penarikan sampel.',
      'Subproses ini tidak dilakukan, jika pengumpulan data dilakukan secara Sensus/Pendataan Lengkap dan Kompilasi Produk Administrasi (Kompromin).',
    ],
    pdfPage: 33,
    contoh:
      'SKM: daftar penerima layanan bulan berjalan disiapkan sebagai kerangka, lalu dipilih setiap pengguna ke-k.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Kerangka sampel', value: 'Daftar penerima layanan dari sistem loket' },
      { label: 'Penarikan sampel', value: 'Systematic Sampling sesuai rancangan 2.4' },
      { label: 'Hasil', value: 'Daftar sampel (unit observasi) untuk petugas' },
      { label: 'Jika sensus/kompromin', value: 'Subproses ini dilewati — catat alasannya' },
    ],
    lessonPoints: [
      'Kerangka harus lengkap dan mutakhir sebelum sampel ditarik.',
      'Penarikan mengikuti metode yang sudah dirancang, bukan dipilih ulang di lapangan.',
      'Output-nya adalah daftar sampel (unit observasi).',
    ],
    buktiClass: 'A',
    buktiPdfPage: 32,
  },
  {
    id: 'gsbpm-4.2',
    code: '4.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyiapkan Pengumpulan Data',
    title: 'Menyiapkan petugas dan sumber daya',
    apa: 'Menyiapkan dan melatih petugas, menyiapkan instrumen dan sumber daya, sumber daya penjaminan kualitas, serta protokol manajemen data. Untuk kegiatan non-survei, siapkan perjanjian dengan penyedia data.',
    materiPoints: [
      'Menyiapkan petugas.',
      'Melatih petugas.',
      'Menyiapkan sumber daya dan instrumen pengumpulan data sesuai rancangan.',
      'Menyiapkan sumber daya penjaminan kualitas.',
      'Menyiapkan protokol manajemen data.',
      'Jika non survei: menyiapkan proses dan perjanjian dengan penyedia data (Hal. 32).',
    ],
    pdfPage: 34,
    contoh:
      'SKM: 4 petugas loket dilatih satu hari memakai panduan dari 3.7; tablet dan akun aplikasi disiapkan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Petugas', value: '4 petugas wawancara + 1 pemeriksa' },
      { label: 'Pelatihan', value: '1 hari: kondef, cara bertanya, penggunaan aplikasi CAPI' },
      { label: 'Sumber daya', value: 'Tablet, akun aplikasi, kuesioner cadangan' },
      { label: 'Penjaminan kualitas', value: 'Pemeriksa mengecek 10% isian per hari' },
      { label: 'Protokol manajemen data', value: 'Siapa boleh mengakses isian; cara backup harian' },
    ],
    lessonPoints: [
      'Pelatihan petugas didokumentasikan — ini output resmi tahap Collect.',
      'Penjaminan kualitas disiapkan sebelum lapangan, bukan saat masalah muncul.',
      'Non-survei (kompilasi) butuh perjanjian penggunaan data (PKS/LADU).',
    ],
    buktiClass: 'A',
    buktiPdfPage: 32,
  },
  {
    id: 'gsbpm-4.3',
    code: '4.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Melaksanakan Pengumpulan Data',
    title: 'Mengumpulkan dan memantau',
    apa: 'Pengumpulan data dijalankan: sosialisasi, pengumpulan, monitoring kemajuan dengan laporan progres, dan tindak lanjut kasus non-respon.',
    materiPoints: [
      'Sosialisasi mengenai pengumpulan data.',
      'Mengumpulkan data.',
      'Melakukan monitoring dan penyusunan laporan progress pengumpulan data.',
      'Melakukan tindak lanjut terhadap kasus non-respon.',
    ],
    pdfPage: 35,
    contoh:
      'SKM: poster sosialisasi di loket, wawancara setelah layanan, laporan progres mingguan, kunjungan ulang untuk non-respon.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Sosialisasi', value: 'Pengumuman di loket bahwa survei sedang berjalan' },
      { label: 'Pengumpulan', value: 'Wawancara CAPI sesuai daftar sampel' },
      {
        label: 'Monitoring',
        value: 'Laporan progres mingguan: target vs terkumpul per petugas',
      },
      { label: 'Non-respon', value: 'Responden menolak → dicatat; diganti sesuai aturan rancangan' },
    ],
    lessonPoints: [
      'Monitoring adalah bagian resmi subproses ini (Hal. 35) — bukan tambahan.',
      'Laporan progres membuat masalah terlihat sebelum pengumpulan berakhir.',
      'Non-respon ditindaklanjuti dengan aturan yang sudah ditetapkan.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 32,
  },
  {
    id: 'gsbpm-4.4',
    code: '4.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi Pengumpulan',
    title: 'Menyelesaikan hasil pengumpulan',
    apa: 'Data yang terkumpul diinput dan disimpan (data capture), lalu metadata dan paradata pengumpulan dianalisis. Hasilnya siap diserahkan ke tahap Pengolahan.',
    materiPoints: [
      'Penginputan dan penyimpanan data (data capture) secara manual ataupun otomatis.',
      'Analisis metadata dan paradata terkait dengan pengumpulan data.',
      'Finalisasi data (digitalisasi data, konversi format, dan pengodean variabel) yang telah dikumpulkan (Hal. 32).',
    ],
    pdfPage: 36,
    contoh:
      'SKM: isian CAPI tersimpan di server; paradata durasi wawancara dicek untuk menemukan isian yang janggal.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Data capture', value: 'Otomatis — isian CAPI tersinkron ke server' },
      { label: 'Paradata', value: 'Durasi wawancara < 2 menit ditandai untuk diperiksa' },
      { label: 'Metadata', value: 'Periode, jumlah sampel, jumlah respon, jumlah non-respon' },
      { label: 'Hasil', value: 'File hasil pengumpulan siap diserahkan ke Pengolahan' },
    ],
    lessonPoints: [
      'Paradata (data tentang proses pengumpulan) membantu mendeteksi isian bermasalah.',
      'Metadata kegiatan disusun di sini — output resmi tahap Collect.',
      'Finalisasi pengumpulan berbeda dari validasi di Pengolahan (5.3).',
    ],
    buktiClass: 'A',
    buktiPdfPage: 32,
  },
]

export function getCollectCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_COLLECT_CARDS.find((c) => c.id === id)
}
