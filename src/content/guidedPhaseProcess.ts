/**
 * Mode Terpandu — Pengolahan Data (Process) learning cards.
 * Eight official subprocesses, Materi Proses Bisnis Hal. 37–45.
 * Educational + preparation only. Does NOT process data or compute statistics.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const PROCESS_INTRO: GuidedPhaseIntro = {
  phaseId: 'process',
  title: 'Pengolahan Data',
  officialTitle: 'Process (Pengolahan Data)',
  question: 'Bagaimana data mentah disiapkan sampai siap dianalisis?',
  explanation:
    'Pada tahap ini data digabungkan, dikode, diperiksa, diperbaiki, diberi bobot bila perlu, dibentuk variabel/unit baru, dihitung agregatnya, lalu difinalisasi.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 37–45',
  outputs: [
    'Dataset mikro atau makro, baik data final maupun sementara',
    'Metadata Statistik Variabel',
  ],
  outputsPage: 37,
}

export const GUIDED_PROCESS_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-5.1',
    code: '5.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Integrasi Data',
    title: 'Menggabungkan dan menerima data',
    apa: 'Menggabungkan data dari dua atau lebih sumber (internal maupun eksternal), lalu mencatat penerimaannya: data diterima dari petugas, jumlahnya diperiksa, dan kemajuannya dilaporkan.',
    materiPoints: [
      'Aktivitas yang bertujuan menggabungkan data yang berasal dari dua atau lebih sumber data, baik bersumber dari internal maupun eksternal.',
      'Data internal adalah data yang diperoleh dari dalam, sedangkan data eksternal adalah data yang diperoleh dari luar organisasi penyelenggara kegiatan statistik.',
      'Data yang telah diintegrasikan lalu dicatat dalam suatu daftar penerimaan data oleh unit kerja yang melaksanakan penerimaan data.',
      'Kegiatan penerimaan data meliputi: menerima data dari petugas lapangan/pengumpul data; memeriksa kelengkapan jumlah data; membuat laporan perkembangan penerimaan data.',
    ],
    pdfPage: 38,
    contoh:
      'SKM: isian CAPI (internal) digabung dengan daftar jenis layanan dari sistem perizinan (eksternal bagi tim SKM) memakai nomor tiket layanan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Sumber internal', value: 'Isian SKM dari aplikasi CAPI' },
      { label: 'Sumber eksternal', value: 'Daftar layanan dari sistem perizinan' },
      { label: 'Kunci penggabungan', value: 'Nomor tiket layanan' },
      { label: 'Daftar penerimaan', value: 'Petugas · jumlah isian diterima · jumlah target · tanggal' },
    ],
    lessonPoints: [
      'Tentukan kunci penggabungan sebelum data digabung.',
      'Daftar penerimaan data menjadi dasar laporan perkembangan.',
      'Kelengkapan jumlah diperiksa saat data diterima — bukan di akhir.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.2',
    code: '5.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Klasifikasi dan Pengodean',
    title: 'Memberi kode dan klasifikasi',
    apa: 'Isian diberi kode atau klasifikasi agar mudah diolah — misalnya pilihan jawaban diubah menjadi angka. Editing dan coding mengikuti kaidah yang sudah ditetapkan karena sangat memengaruhi kualitas data.',
    materiPoints: [
      'Data yang diperoleh, baik dari pengumpulan data maupun akuisisi data, dilakukan klasifikasi dan/atau pengkodean pada variabel tertentu (jika diperlukan untuk memudahkan pengolahan lebih lanjut).',
      'Proses pemeriksaan dan memperbaiki penulisan yang salah/kurang jelas dan pemberian kode pada isian dokumen hasil pencacahan dengan memperhatikan kaidah-kaidah editing dan coding yang telah ditetapkan.',
      'Hasil editing dan coding sangat mempengaruhi kualitas data dan proses pengolahan selanjutnya.',
    ],
    pdfPage: 39,
    contoh: 'Materi memberi dua contoh coding yang konkret (di bawah).',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh coding pada materi',
        kind: 'rule',
        items: [
          'Mengubah pilihan (centang/silang) pada pertanyaan tertutup menjadi kode (angka/huruf).',
          'Menambahkan kode klasifikasi (angka/huruf) pada isian variabel yang diperoleh dari akuisisi data.',
        ],
      },
    ],
    contohDetail: [
      { label: 'Variabel', value: 'Penilaian aspek waktu pelayanan' },
      {
        label: 'Coding pilihan tertutup',
        value: '☐ Tidak puas → 1 · ☐ Kurang puas → 2 · ☐ Puas → 3 · ☐ Sangat puas → 4',
      },
      { label: 'Kode klasifikasi', value: 'Jenis izin dari sistem perizinan → kode 1–5' },
    ],
    lessonPoints: [
      'Coding mengubah jawaban menjadi kode yang konsisten.',
      'Kode klasifikasi juga diberikan pada data hasil akuisisi.',
      'Pakai kaidah coding tertulis agar semua pengolah memberi kode yang sama.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.3',
    code: '5.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Review & Validasi Data',
    title: 'Memeriksa dan memvalidasi data',
    apa: 'Data yang sudah diinput diperiksa dengan aturan validasi (dari 3.2) untuk menemukan masalah: pencilan, item kosong, atau kode yang salah. Validasi bisa diulang dan sebagian dapat berjalan sejak pengumpulan (CAPI/CAWI).',
    materiPoints: [
      'Reviu dan pengujian data (validasi) terhadap data-data yang telah diinput untuk mengidentifikasi potensi masalah, kesalahan, dan ketidaksesuaian, seperti pencilan (outlier), nonresponse item, atau terjadinya kesalahan pemberian kode.',
      'Validasi dapat dilakukan berulang kali sesuai aturan yang telah ditetapkan sebelumnya.',
      'Meskipun validasi dikategorikan dalam tahapan pengolahan, dalam praktiknya beberapa elemen validasi dapat diterapkan pada tahap pengumpulan data, terutama pada moda yang menggunakan bantuan komputer, seperti CAPI atau CAWI.',
    ],
    pdfPage: 40,
    contoh:
      'SKM: jalankan aturan validasi 3.2 atas seluruh isian; catat jumlah Error per jenis masalah.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Pencilan (outlier)', value: 'Durasi layanan tercatat 300 hari → periksa' },
      { label: 'Nonresponse item', value: 'Penilaian aspek biaya kosong pada 12 isian' },
      { label: 'Kesalahan kode', value: 'Kode jenis layanan “7” padahal daftar hanya 1–5' },
      { label: 'Putaran validasi', value: 'Putaran 1 → perbaikan → putaran 2 sampai Clean' },
    ],
    lessonPoints: [
      'Tiga masalah yang disebut materi: pencilan, nonresponse item, kesalahan kode.',
      'Validasi berulang sampai aturan terpenuhi — catat setiap putaran.',
      'Validasi CAPI/CAWI saat pengumpulan tidak menghapus kebutuhan validasi di sini.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.4',
    code: '5.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Editing & Imputasi',
    title: 'Memperbaiki dan mengisi data',
    apa: 'Jika data dianggap tidak benar, kosong (missing), atau tidak wajar, nilainya dapat diubah, diisi dengan nilai baru (imputasi), atau dihapus — dan setiap perubahan ditandai (flag) serta didokumentasikan.',
    materiPoints: [
      'Edit dan imputasi diperlukan ketika data dianggap tidak benar, tidak ada isian (missing), tidak wajar, sehingga dapat dimasukkan suatu nilai baru atau dilakukan penghapusan pada data yang tidak wajar.',
      'Menentukan apakah akan menambah atau mengubah data.',
      'Memilih metode yang akan digunakan.',
      'Menambah/mengubah nilai data.',
      'Menuliskan kembali nilai data baru ke dalam set data dan menandainya (flag) sebagai penanda bahwa data yang ada telah diubah.',
      'Membuat metadata pada proses editing dan imputasi.',
    ],
    pdfPage: 41,
    contoh:
      'SKM: penilaian kosong yang tidak bisa ditanyakan ulang diisi dengan metode yang disepakati dan diberi flag “imputasi”.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Masalah', value: 'Penilaian aspek biaya kosong; responden tidak dapat dihubungi' },
      { label: 'Keputusan', value: 'Tambah nilai (imputasi) — bukan menghapus isian' },
      { label: 'Metode', value: 'Metode yang disepakati tim pengolah (tulis alasannya)' },
      { label: 'Flag', value: 'Kolom flag_biaya = 1 menandai nilai hasil imputasi' },
      { label: 'Metadata', value: 'Jumlah nilai diimputasi dan metode yang dipakai' },
    ],
    lessonPoints: [
      'Urutan materi: putuskan → pilih metode → ubah nilai → beri flag → buat metadata.',
      'Flag membuat perubahan dapat ditelusuri kembali.',
      'Tanpa metadata editing/imputasi, pengguna tidak tahu data mana yang diubah.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.5',
    code: '5.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Penurunan Variabel & Unit',
    title: 'Membentuk variabel dan unit baru',
    apa: 'Membentuk variabel baru (dengan rumus dari variabel yang ada) atau unit statistik baru (dengan menggabungkan/memisahkan data) yang dibutuhkan output tetapi tidak dikumpulkan langsung.',
    materiPoints: [
      'Pembentukan Variabel Baru dan Unit Statistik Baru (yang secara eksplisit tidak disediakan dalam pengumpulan data atau akuisisi data) mungkin diperlukan untuk menghasilkan data sesuai dengan output yang dibutuhkan.',
      'Pembentukan Variabel Baru dilakukan dengan menerapkan rumus aritmatika ke satu variabel atau lebih yang sudah ada di dalam set data atau dengan menerapkan asumsi model yang berbeda. Penting untuk memastikan bahwa variabel diturunkan dengan urutan yang benar.',
      'Pembentukan Unit Statistik Baru dapat diperoleh dengan menggabungkan atau memisahkan data yang ada atau dengan berbagai metode estimasi lainnya.',
    ],
    pdfPage: 42,
    contoh:
      'Materi: pembentukan unit statistik baru berupa rumah tangga dari unit observasi yang dikumpulkan berupa individu.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh pada materi',
        kind: 'other',
        items: [
          'Pembentukan unit statistik baru berupa rumah tangga dari unit observasi yang dikumpulkan berupa individu.',
        ],
      },
    ],
    contohDetail: [
      {
        label: 'Variabel baru (SKM)',
        value: 'nilai_rata = rata-rata penilaian 9 aspek per responden',
      },
      { label: 'Urutan turunan', value: 'nilai_rata dulu → baru kategori_mutu dari nilai_rata' },
      { label: 'Unit baru', value: 'Tidak diperlukan — unit analisis tetap responden' },
    ],
    lessonPoints: [
      'Variabel turunan bisa bertingkat — urutannya harus benar.',
      'Unit baru dibentuk dengan menggabungkan atau memisahkan data (individu → rumah tangga).',
      'Buat hanya yang dibutuhkan output di 2.1.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.6',
    code: '5.6',
    mappingKind: 'gsbpm',
    officialTitle: 'Perhitungan Bobot',
    title: 'Menghitung penimbang (bobot)',
    apa: 'Untuk survei, dihitung penimbang agar sampel mewakili populasi, dan dapat dilakukan kalibrasi dengan tolok ukur eksternal. Tidak dilakukan untuk sensus/pendataan lengkap dan kompromin.',
    materiPoints: [
      'Menghitung penimbang.',
      'Mendapatkan tolok ukur eksternal dan melakukan estimasi kalibrasi.',
      'Subproses ini tidak dilakukan, jika pengumpulan data dilakukan secara Sensus/Pendataan Lengkap dan Kompilasi Produk Administrasi (Kompromin).',
    ],
    pdfPage: 43,
    contoh:
      'SKM (survei, Systematic Sampling): penimbang dihitung dari jumlah pengguna layanan dibanding jumlah sampel.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Dilakukan?', value: 'Ya — cara pengumpulan survei (2.3)' },
      { label: 'Dasar penimbang', value: 'Jumlah pengguna layanan ÷ jumlah sampel per jenis layanan' },
      { label: 'Tolok ukur eksternal', value: 'Total pengguna layanan dari sistem perizinan' },
      { label: 'Jika sensus/kompromin', value: 'Subproses ini dilewati — catat alasannya' },
    ],
    lessonPoints: [
      'Penimbang hanya relevan bila memakai sampel.',
      'Kalibrasi menyesuaikan hasil dengan tolok ukur eksternal yang dipercaya.',
      'StatPlan tidak menghitung bobot — catat rencananya.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.7',
    code: '5.7',
    mappingKind: 'gsbpm',
    officialTitle: 'Perhitungan Agregat',
    title: 'Menghitung agregat dan tabulasi',
    apa: 'Menghitung data/tabulasi agregat (memakai penimbang bila survei), menyusun dataset turunan, menghitung sampling error dan estimasi untuk survei, serta merekonsiliasi tabulasi antarwilayah.',
    materiPoints: [
      'Menggunakan penimbang yang telah ditetapkan (jika Survei).',
      'Menghitung data/tabulasi agregat.',
      'Menyusun data set turunan untuk kebutuhan analisis khusus.',
      'Menghitung sampling error (jika Survei).',
      'Melakukan estimasi (jika Survei).',
      'Melakukan rekonsiliasi data/tabulasi antar wilayah.',
    ],
    pdfPage: 44,
    contoh:
      'SKM: Tabel 1 diisi mengikuti aturan tabulasi 3.3, dengan penimbang 5.6 dan sampling error per aspek.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Tabulasi', value: 'Tabel 1 diisi sesuai aturan tabulasi 3.3' },
      { label: 'Penimbang', value: 'Dipakai karena kegiatan berupa survei' },
      { label: 'Sampling error', value: 'Dihitung per aspek pelayanan' },
      { label: 'Rekonsiliasi', value: 'Jumlah per kantor layanan = total kabupaten?' },
    ],
    lessonPoints: [
      'Agregat mengikuti aturan tabulasi yang sudah dibangun — bukan dibuat ulang.',
      'Empat butir materi khusus survei: penimbang, sampling error, estimasi.',
      'Rekonsiliasi memastikan angka antarwilayah konsisten.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-5.8',
    code: '5.8',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi File Data',
    title: 'Menyerahkan file data final',
    apa: 'Data disiapkan untuk tahap berikutnya dan file data final diserahkan untuk digunakan di tahap Analisis, bersama metadata statistik variabelnya.',
    materiPoints: [
      'Menyiapkan data untuk dilanjutkan ke tahap berikutnya.',
      'Menyerahkan data final untuk digunakan di tahap analisis.',
    ],
    pdfPage: 45,
    contoh:
      'SKM: file data final (mikro berbobot + tabel agregat) diserahkan ke analis beserta metadata variabel.',
    contohClass: 'C',
    contohDetail: [
      { label: 'File final', value: 'skm_2026_final (mikro) + tabel_agregat_2026' },
      { label: 'Diserahkan kepada', value: 'Tim analisis' },
      { label: 'Disertai', value: 'Metadata Statistik Variabel, catatan flag imputasi' },
    ],
    lessonPoints: [
      'Finalisasi = file dikunci dan diserahkan; perubahan setelahnya harus tercatat.',
      'Metadata Statistik Variabel adalah output resmi tahap Pengolahan.',
      'Sertakan catatan editing/imputasi agar analis memahami datanya.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 37,
  },
]

export function getProcessCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_PROCESS_CARDS.find((c) => c.id === id)
}
