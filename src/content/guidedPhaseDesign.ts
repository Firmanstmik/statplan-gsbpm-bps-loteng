/**
 * Mode Terpandu — Perancangan (Design) learning cards.
 * Six official subprocesses, Materi Proses Bisnis Hal. 17–23.
 * Educational layer only. Does NOT mutate domain checklist / progress / export.
 */
import type { GuidedSourceClass } from '@/content/guidedPhaseNeed'
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const DESIGN_INTRO: GuidedPhaseIntro = {
  phaseId: 'design',
  title: 'Perancangan',
  officialTitle: 'Design (Perancangan)',
  question: 'Bagaimana kebutuhan statistik diterjemahkan menjadi rancangan kegiatan?',
  explanation:
    'Pada tahap ini Anda merancang output, variabel, cara mengumpulkan data, sampel, pengolahan dan analisis, serta jadwal dan alur kerjanya.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 17–23',
  outputs: [
    'Rancangan tabel/layout publikasi/infografis',
    'Formulasi indikator statistik yang akan dihasilkan',
    'Rancangan sistem alur kerja (SOP)',
    'Rancangan Kegiatan Statistik',
  ],
  outputsPage: 17,
}

/** Exact schedule table on Materi Hal. 23 (Type A). */
export const MATERI_JADWAL_HAL_23 = {
  columns: ['No.', 'Kegiatan', 'Waktu'],
  rows: [
    ['1', 'Identifikasi kebutuhan', 'Juli – Agustus'],
    ['2', 'Perancangan instrumen', 'Agustus – September'],
    ['3', 'Pelatihan petugas', 'September'],
    ['4', 'Pengumpulan data', 'September – Oktober'],
    ['5', 'Pengolahan data', 'November'],
    ['6', 'Analisis hasil SKM', 'November – Desember'],
    ['7', 'Penyusunan laporan', 'Desember'],
    ['8', 'Evaluasi', 'Desember'],
  ],
}

export const GUIDED_DESIGN_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-2.1',
    code: '2.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Output & Diseminasi',
    title: 'Merancang bentuk output',
    apa: 'Sebelum menentukan data yang dikumpulkan, rancang dulu bentuk hasil akhirnya: tabel apa yang akan disajikan dan indikator apa yang akan dihitung. Rancangan tabel dibuat kosong — tanpa angka.',
    materiPoints: [
      'Rancangan tabel.',
      'Formulasi indikator statistik yang akan dihasilkan.',
    ],
    pdfPage: 18,
    contoh:
      'Materi menampilkan “Contoh Rancangan Tabulasi”: judul tabel lengkap, kolom bernomor, baris total, dan sel yang masih kosong.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Rancangan Tabulasi',
        kind: 'table',
        imageSrc: '/materi/hal-18-contoh-rancangan-tabulasi.png',
        imageWidth: 1079,
        imageHeight: 288,
        imageAlt:
          'Tabel 7.1. Jumlah Pekerja Laki-laki Perusahaan Peternakan Sapi Perah Pada Akhir Tahun 2024 Menurut Status Pekerja. Kolom: Provinsi (1), Pekerja Tetap (2), Pekerja Honorer (3), Jumlah (4). Sel isian masih kosong; baris terakhir berlabel Indonesia.',
        note: 'Gambar asli dari materi — tidak digambar ulang.',
      },
    ],
    materiLesson:
      'Perhatikan anatomi rancangan tabel: judul menyebut apa, siapa, kapan, dan “menurut” apa; setiap kolom diberi nomor; ada baris total; isinya dibiarkan kosong karena data belum dikumpulkan.',
    contohDetail: [
      {
        label: 'Judul tabel',
        value:
          'Tabel 1. Indeks Kepuasan Masyarakat terhadap Pelayanan Perizinan Menurut Aspek Pelayanan, 2026',
      },
      { label: 'Kolom', value: 'Aspek pelayanan (1) · Nilai indeks (2) · Kategori mutu (3)' },
      { label: 'Baris', value: 'Persyaratan · Prosedur · Waktu · Biaya · … · Seluruh aspek' },
      {
        label: 'Formulasi indikator',
        value: 'Nilai indeks per aspek — rumus mengikuti kondef yang disepakati di 1.4.',
      },
      { label: 'Diseminasi', value: 'Laporan ringkas untuk DPMPTSP (dirinci di tahap 7).' },
    ],
    lessonPoints: [
      'Judul tabel memuat apa yang diukur, cakupan, waktu, dan pembeda (“menurut …”).',
      'Rancangan tabel menentukan variabel yang nanti wajib dikumpulkan.',
      'Tidak ada angka di rancangan — isi sel kosong adalah hal yang benar.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 17,
  },
  {
    id: 'gsbpm-2.2',
    code: '2.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Variabel',
    title: 'Menentukan variabel',
    apa: 'Variabel adalah potongan informasi yang dikumpulkan untuk mengisi rancangan output. Setiap variabel dicek terhadap Standar Data Statistik Nasional dan ketersediaannya.',
    materiPoints: [
      'Merancang variabel yang akan dikumpulkan. Misal: nama, umur, jenis kelamin, tingkat pendidikan, pekerjaan utama, instansi, dll.',
      'Cek Standar Data Statistik Nasional untuk setiap variabel.',
      'Cek ketersediaan variabel.',
    ],
    pdfPage: 19,
    contoh:
      'Contoh variabel pada materi: nama, umur, jenis kelamin, tingkat pendidikan, pekerjaan utama, instansi.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh variabel pada materi',
        kind: 'other',
        items: ['nama', 'umur', 'jenis kelamin', 'tingkat pendidikan', 'pekerjaan utama', 'instansi'],
        note: 'Contoh dari materi — bukan daftar wajib untuk setiap kegiatan.',
      },
    ],
    contohDetail: [
      { label: 'Variabel', value: 'Jenis layanan perizinan' },
      { label: 'Untuk output', value: 'Kolom/baris “menurut jenis layanan” di Tabel 1 (2.1)' },
      { label: 'Cek standar', value: 'Periksa apakah ada Standar Data Statistik Nasional terkait' },
      { label: 'Variabel lain', value: 'Penilaian tiap aspek pelayanan, jenis kelamin, tingkat pendidikan' },
    ],
    lessonPoints: [
      'Tarik variabel dari rancangan output — setiap kolom/baris butuh variabel.',
      'Hindari variabel yang tidak dipakai di output mana pun.',
      'Cek standar data dan ketersediaan sebelum menambah pertanyaan baru.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-2.3',
    code: '2.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Pengumpulan Data',
    title: 'Memilih cara, metode, dan moda',
    apa: 'Materi membedakan tiga hal: cara (seberapa luas data diambil), metode (bagaimana data diperoleh dari responden), dan moda (media yang dipakai). Ketiganya dipilih terpisah.',
    pdfPage: 20,
    contoh:
      'Istilah persis dari materi Hal. 20 ditampilkan di bawah; penjelasan “seberapa luas / bagaimana / media” adalah parafrase StatPlan.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Cara Pengumpulan Data',
        kind: 'method',
        items: [
          'Sensus/pendataan lengkap',
          'Survei',
          'Kompilasi Produk Administratif (kompromin)',
          'Lainnya; Misal: big data',
        ],
      },
      {
        title: 'Metode Pengumpulan Data',
        kind: 'method',
        items: ['Wawancara', 'Self Enumeration', 'Observasi'],
      },
      {
        title: 'Moda Pengumpulan Data',
        kind: 'method',
        items: [
          'Paper and Pencil Interviewing (PAPI)',
          'Computer Assisted Personal Interviewing (CAPI)',
          'Computer Assisted Telephones Interviewing (CATI)',
          'Computer Aided Web Interviewing (CAWI)',
        ],
      },
    ],
    contohDetail: [
      { label: 'Cara', value: 'Survei — hanya sebagian pengguna layanan yang ditanya' },
      { label: 'Metode', value: 'Wawancara — petugas menanyakan langsung setelah layanan selesai' },
      { label: 'Moda', value: 'CAPI — isian di tablet agar validasi bisa langsung berjalan' },
      { label: 'Alasan', value: 'Responden ada di loket; CAPI mengurangi kesalahan isian' },
    ],
    lessonPoints: [
      'Cara ≠ metode ≠ moda — tulis masing-masing secara terpisah.',
      'Pilihan cara menentukan apakah 2.4 (sampel) dan 5.6 (bobot) dilakukan.',
      'Catat alasan pilihan agar dapat ditinjau saat uji coba.',
    ],
    buktiClass: 'B',
    buktiPdfPage: 20,
  },
  {
    id: 'gsbpm-2.4',
    code: '2.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Kerangka Sampel',
    title: 'Merancang sampel',
    apa: 'Jika cara pengumpulan adalah survei, rancang kerangka sampel dan metode pemilihan sampelnya. Materi membagi metode sampling menjadi probability dan non probability.',
    materiPoints: [
      'Subproses ini tidak dilakukan, jika pengumpulan data dilakukan secara Sensus/Pendataan Lengkap dan Kompilasi Produk Administrasi (Kompromin).',
    ],
    pdfPage: 21,
    contoh:
      'Metode sampling persis seperti tercantum pada materi Hal. 21. StatPlan tidak menghitung ukuran sampel.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Probability Sampling',
        kind: 'method',
        items: [
          'Simple Random Sampling',
          'Stratified Sampling',
          'Systematic Sampling',
          'Cluster Sampling',
          'Probability Proportional to Size Sampling',
        ],
      },
      {
        title: 'Non Probability Sampling',
        kind: 'method',
        items: ['Quota Sampling', 'Accidental Sampling', 'Purposive Sampling', 'Snowball Sampling'],
      },
    ],
    contohDetail: [
      { label: 'Menggunakan sampel?', value: 'Ya — cara pengumpulan adalah survei (2.3)' },
      { label: 'Kerangka sampel', value: 'Daftar penerima layanan perizinan selama periode survei' },
      { label: 'Metode', value: 'Systematic Sampling — setiap pengguna ke-k dalam daftar' },
      { label: 'Alasan', value: 'Daftar berurutan menurut waktu layanan tersedia di sistem loket' },
    ],
    lessonPoints: [
      'Tanyakan dulu: apakah kegiatan memakai sampel? Sensus dan kompromin tidak.',
      'Probability sampling memungkinkan perhitungan bobot (5.6) dan sampling error (5.7).',
      'Kerangka sampel = daftar dari mana sampel dipilih; siapkan sumbernya.',
    ],
    buktiClass: 'B',
    buktiPdfPage: 21,
  },
  {
    id: 'gsbpm-2.5',
    code: '2.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Pengolahan & Analisis',
    title: 'Merancang pengolahan dan analisis',
    apa: 'Rancang dari awal bagaimana data akan diperiksa dan diolah — penyuntingan, pengkodean, dan pensahihan — serta apakah analisisnya deskriptif atau inferensia.',
    materiPoints: [
      'Rancangan penyuntingan (editing), pengkodean (coding), pensahihan (validasi).',
      'Rancangan analisis: deskriptif (hanya narasi) atau inferensia (menggunakan metode analisis lebih lanjut).',
    ],
    pdfPage: 22,
    contoh:
      'Untuk SKM: satu aturan editing, satu aturan coding, satu aturan validasi, dan analisis deskriptif.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Editing', value: 'Isian penilaian yang kosong dikembalikan ke petugas untuk dilengkapi' },
      { label: 'Coding', value: 'Jenis layanan diberi kode 1–5 sesuai daftar layanan' },
      { label: 'Validasi', value: 'Nilai penilaian aspek harus 1–4; di luar itu ditandai error' },
      { label: 'Analisis', value: 'Deskriptif — narasi dan tabel indeks per aspek' },
    ],
    lessonPoints: [
      'Aturan editing, coding, dan validasi dirancang sekarang, dibangun di 3.2, dijalankan di tahap 5.',
      'Deskriptif cukup untuk menggambarkan; inferensia dipakai jika perlu menguji atau menaksir lebih jauh.',
      'Rancangan analisis harus bisa menghasilkan output yang dirancang di 2.1.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-2.6',
    code: '2.6',
    mappingKind: 'gsbpm',
    officialTitle: 'Merancang Sistem Produksi & Alur Kerja',
    title: 'Menyusun jadwal, SOP, dan rekomendasi',
    apa: 'Susun jadwal kegiatan dan SOP alur kerja. Penyelenggara statistik sektoral juga menyiapkan pengajuan rekomendasi kegiatan statistik ke BPS.',
    materiPoints: [
      'Menyusun Jadwal Kegiatan.',
      'Menyusun Standar Operasional Prosedur (SOP).',
      'Mengajukan rekomendasi kegiatan Statistik.',
      'Mengajukan permintaan rekomendasi Kegiatan statistik ke BPS (khusus Penyelenggara Statistik Sektoral) — Hal. 17.',
    ],
    pdfPage: 23,
    contoh:
      'Materi Hal. 23 memuat contoh jadwal delapan kegiatan SKM (Juli–Desember) dan potongan contoh SOP SKM.',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Contoh Jadwal Kegiatan',
        kind: 'schedule',
        table: MATERI_JADWAL_HAL_23,
        note: 'Isi tabel sama persis dengan materi. Durasi ini contoh — bukan jadwal wajib.',
      },
      {
        title: 'Contoh SOP (SKM)',
        kind: 'flow',
        imageSrc: '/materi/hal-23-contoh-sop-skm.png',
        imageWidth: 1286,
        imageHeight: 858,
        imageAlt:
          'Potongan tabel SOP SKM. Kolom: No, Aktivitas, Pelaksana (Pejabat Administrator, Pejabat Pengawas, JFU/JFT), Mutu Baku (Kelengkapan, Waktu, Output), Ket. Aktivitas 1–7: menerima surat perintah pelaksanaan SKM, koordinasi dengan stakeholder, menyusun bahan pelatihan petugas, pelatihan petugas, pengumpulan data SKM (2–4 bulan), pengolahan data SKM (2–4 bulan), konsolidasi hasil SKM. Alur antar pelaksana digambar dengan kotak dan panah.',
        note: 'Gambar asli dari materi. Pada materi, tabel ini memang tampil terpotong di baris 7.',
      },
    ],
    materiLesson:
      'Jadwal mengurutkan kegiatan dalam waktu; SOP merinci siapa mengerjakan apa, dengan kelengkapan, waktu, dan output tiap langkah.',
    contohDetail: [
      { label: 'Jadwal', value: 'Sesuaikan 8 baris contoh ke rentang waktu proyek Anda' },
      { label: 'SOP', value: 'SOP pengumpulan data SKM: aktivitas, pelaksana, waktu, output' },
      {
        label: 'Rekomendasi',
        value: 'Jika instansi Anda penyelenggara statistik sektoral: siapkan pengajuan ke BPS',
      },
    ],
    lessonPoints: [
      'Contoh jadwal materi berurutan dari identifikasi kebutuhan sampai evaluasi.',
      'SOP yang baik memuat pelaksana, kelengkapan, waktu, dan output setiap aktivitas.',
      'Rekomendasi BPS wajib untuk statistik sektoral — StatPlan hanya mencatat persiapannya.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 17,
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
