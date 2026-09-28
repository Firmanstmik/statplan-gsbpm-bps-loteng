import type { GsbpmPhase, JenisKegiatan, Klasifikasi, SdiStage } from './types'

/** 4-stage navigation wrapper for OPD UX (maps to 8 GSBPM phases).
 * Not from Materi Proses Bisnis.pdf — PDF uses 8 GSBPM phases only.
 * "SDI" in the PDF means portal Satu Data Indonesia (hal. 15), not these stages.
 */
export const SDI_STAGES: SdiStage[] = [
  {
    id: 'perencanaan',
    title: 'Perencanaan',
    subtitle: 'Tentukan kebutuhan dan rancang kegiatan',
    phases: ['specify_need', 'design'],
    order: 1,
  },
  {
    id: 'pengumpulan',
    title: 'Pengumpulan',
    subtitle: 'Bangun instrumen dan kumpulkan data',
    phases: ['build', 'collect'],
    order: 2,
  },
  {
    id: 'pemeriksaan',
    title: 'Pemeriksaan',
    subtitle: 'Olah dan analisis hingga siap rilis',
    phases: ['process', 'analyse'],
    order: 3,
  },
  {
    id: 'penyebarluasan',
    title: 'Penyebarluasan',
    subtitle: 'Diseminasikan hasil dan evaluasi siklus',
    phases: ['disseminate', 'evaluate'],
    order: 4,
  },
]

/**
 * GSBPM 5.2 content engine — grounded in Materi Proses Bisnis.pdf (BPS, Jan 2026).
 * Sub-process codes and activities mirror the official training module.
 */
export const GSBPM_PHASES: GsbpmPhase[] = [
  {
    id: 'specify_need',
    code: '1',
    title: 'Specify Need',
    titleId: 'Identifikasi Kebutuhan',
    purpose:
      'Mengidentifikasi statistik yang dibutuhkan, mengonfirmasi dengan pemangku kepentingan, dan memeriksa apakah data yang tersedia sudah memadai.',
    sdiStage: 'perencanaan',
    pdfRef: 'Hal. 11–16',
    subProcesses: [
      {
        id: '1.1',
        code: '1.1',
        title: 'Identifikasi Kebutuhan',
        description:
          'Langkah pertama kegiatan statistik: merumuskan masalah dan statistik (data/indikator) yang diperlukan.',
        activities: [
          'Identifikasi awal statistik yang diperlukan (data atau indikator)',
          'Identifikasi hal-hal yang dibutuhkan dari statistik tersebut',
        ],
        checklist: [
          { id: 'sn-1', label: 'Masalah kebijakan sudah dirumuskan', required: true },
          { id: 'sn-2', label: 'Daftar data/indikator kebutuhan sudah disusun', required: true },
        ],
        outputs: ['Daftar kebutuhan data dan data prioritas'],
        pdfRef: 'Hal. 11',
      },
      {
        id: '1.2',
        code: '1.2',
        title: 'Konsultasi & Konfirmasi Kebutuhan',
        description:
          'Konsultasi dengan stakeholder dan konfirmasi rinci atas kebutuhan data statistik.',
        activities: [
          'Konsultasi dengan pemangku kepentingan internal dan eksternal',
          'Konfirmasi mengapa statistik diperlukan, output yang diharapkan, dan jadwal diseminasi',
        ],
        checklist: [
          { id: 'sn-3', label: 'Dokumentasi rapat/konsultasi stakeholder tersedia', required: true },
          { id: 'sn-4', label: 'Kebutuhan pengguna sudah dikonfirmasi', required: true },
        ],
        outputs: ['Dokumentasi rapat pembahasan kebutuhan data'],
        pdfRef: 'Hal. 12',
      },
      {
        id: '1.3',
        code: '1.3',
        title: 'Penetapan Tujuan Output',
        description: 'Merumuskan tujuan dan output statistik yang menjawab kebutuhan pengguna.',
        activities: [
          'Menetapkan tujuan kegiatan',
          'Merumuskan output statistik yang diusulkan',
          'Memastikan kesesuaian output dengan langkah-langkah yang akan dilakukan',
        ],
        checklist: [
          { id: 'sn-5', label: 'Tujuan kegiatan sudah ditetapkan', required: true },
          { id: 'sn-6', label: 'Output statistik sudah dirumuskan', required: true },
        ],
        outputs: ['Tujuan dan bentuk output statistik'],
        pdfRef: 'Hal. 13',
      },
      {
        id: '1.4',
        code: '1.4',
        title: 'Identifikasi Konsep Definisi',
        description:
          'Mengidentifikasi konsep dan definisi indikator yang akan diukur sesuai standar statistik.',
        activities: [
          'Identifikasi konsep dan definisi indikator',
          'Merujuk referensi standar statistik nasional',
        ],
        checklist: [
          { id: 'sn-7', label: 'Konsep-definisi (kondef) sudah disusun', required: true },
          { id: 'sn-8', label: 'Kondef merujuk standar statistik', required: true },
        ],
        outputs: ['Dokumen konsep dan definisi'],
        pdfRef: 'Hal. 14',
      },
      {
        id: '1.5',
        code: '1.5',
        title: 'Pemeriksaan Ketersediaan & Kelayakan Data',
        description:
          'Cek portal data (sirusa, romantik, portal SDI) untuk menghindari duplikasi. Jika data tersedia dan sesuai → kompilasi; jika belum → sensus/survei.',
        activities: [
          'Cek ketersediaan data pada portal rujukan statistik',
          'Nilai kelayakan data yang tersedia terhadap kebutuhan',
          'Putuskan jenis kegiatan: kompilasi, sensus, atau survei',
        ],
        checklist: [
          { id: 'sn-9', label: 'Cek portal SDI / sirusa / romantik sudah dilakukan', required: true },
          { id: 'sn-10', label: 'Keputusan jenis kegiatan sudah didokumentasikan', required: true },
        ],
        outputs: ['Hasil telaah ketersediaan dan kelayakan data'],
        pdfRef: 'Hal. 15',
      },
      {
        id: '1.6',
        code: '1.6',
        title: 'Penyusunan Proposal / KAK',
        description:
          'Mendokumentasikan temuan tahap kebutuhan dalam proposal/KAK untuk mendapatkan persetujuan.',
        activities: [
          'Uraikan proses bisnis yang berjalan (jika ada)',
          'Uraikan solusi/proses bisnis yang diusulkan',
          'Nilai biaya, manfaat, dan kendala eksternal',
        ],
        checklist: [
          { id: 'sn-11', label: 'Draf KAK / proposal sudah disusun', required: true },
          { id: 'sn-12', label: 'Analisis biaya-manfaat sudah dilampirkan', required: false },
        ],
        outputs: ['Kerangka Acuan Kerja (KAK) / Proposal kegiatan'],
        pdfRef: 'Hal. 16',
      },
    ],
  },
  {
    id: 'design',
    code: '2',
    title: 'Design',
    titleId: 'Perancangan',
    purpose:
      'Merancang output, variabel, metode pengumpulan, kerangka sampel (jika perlu), alur kerja, serta pengolahan dan analisis.',
    sdiStage: 'perencanaan',
    pdfRef: 'Hal. 17–23',
    subProcesses: [
      {
        id: '2.1',
        code: '2.1',
        title: 'Merancang Output & Diseminasi',
        description: 'Merancang detail output, produk, layanan statistik, dan sistem diseminasi.',
        activities: [
          'Rancang tabel / layout publikasi / infografis',
          'Formulasi indikator statistik',
          'Tentukan sistem, alat, dan prosedur diseminasi',
        ],
        checklist: [
          { id: 'de-1', label: 'Rancangan tabulasi / layout output tersedia', required: true },
          { id: 'de-2', label: 'Rencana produk diseminasi sudah ditetapkan', required: true },
        ],
        outputs: ['Rancangan tabel/layout', 'Formulasi indikator'],
        pdfRef: 'Hal. 18',
      },
      {
        id: '2.2',
        code: '2.2',
        title: 'Merancang Variabel',
        description: 'Merancang variabel yang akan dikumpulkan dan cek Standar Data Statistik Nasional.',
        activities: [
          'Susun daftar variabel yang akan dikumpulkan',
          'Cek Standar Data Statistik Nasional untuk setiap variabel',
          'Cek ketersediaan variabel',
        ],
        checklist: [
          { id: 'de-3', label: 'Daftar variabel sudah lengkap', required: true },
          { id: 'de-4', label: 'Variabel dicek terhadap standar nasional', required: true },
        ],
        outputs: ['Daftar variabel dan kondef'],
        pdfRef: 'Hal. 19',
      },
      {
        id: '2.3',
        code: '2.3',
        title: 'Merancang Pengumpulan Data',
        description:
          'Tentukan cara (sensus/survei/kompromin), metode (wawancara/self-enumeration/observasi), dan moda (PAPI/CAPI/CATI/CAWI).',
        activities: [
          'Pilih cara pengumpulan data',
          'Pilih metode dan moda pengumpulan',
          'Rancang instrumen sesuai jenis kegiatan',
        ],
        checklist: [
          { id: 'de-5', label: 'Cara, metode, dan moda pengumpulan sudah ditetapkan', required: true },
          {
            id: 'de-6',
            label: 'Rancangan kuesioner tersedia',
            required: true,
            jenis: ['survei', 'sensus'],
          },
        ],
        outputs: ['Rancangan instrumen pengumpulan'],
        pdfRef: 'Hal. 20',
      },
      {
        id: '2.4',
        code: '2.4',
        title: 'Merancang Kerangka Sampel',
        description:
          'Susun kerangka sampel dan metode sampling. Tidak dilakukan untuk sensus lengkap dan kompromin.',
        activities: [
          'Susun kerangka sampel / basis register',
          'Pilih metode sampling (probability / non-probability)',
          'Hitung ukuran sampel',
        ],
        checklist: [
          {
            id: 'de-8',
            label: 'Kerangka sampel tersedia',
            required: true,
            jenis: ['survei'],
          },
          {
            id: 'de-9',
            label: 'Metode sampling dan ukuran sampel ditetapkan',
            required: true,
            jenis: ['survei'],
          },
        ],
        outputs: ['Rancangan kerangka dan metode sampel'],
        skipWhen: ['sensus', 'kompromin'],
        pdfRef: 'Hal. 21',
      },
      {
        id: '2.5',
        code: '2.5',
        title: 'Merancang Pengolahan & Analisis',
        description: 'Rancang editing, coding, validasi, dan metode analisis (deskriptif/inferensia).',
        activities: [
          'Rancang penyuntingan, pengkodean, dan pensahihan',
          'Rancang metode analisis data',
        ],
        checklist: [
          { id: 'de-13', label: 'Aturan editing/coding/validasi sudah dirancang', required: true },
          { id: 'de-14', label: 'Metode analisis sudah ditetapkan', required: true },
        ],
        outputs: ['Rancangan pengolahan dan analisis'],
        pdfRef: 'Hal. 22',
      },
      {
        id: '2.6',
        code: '2.6',
        title: 'Merancang Sistem Produksi & Alur Kerja',
        description: 'Susun jadwal, SOP, dan (untuk statistik sektoral) ajukan rekomendasi ke BPS.',
        activities: [
          'Susun jadwal kegiatan',
          'Susun Standar Operasional Prosedur (SOP)',
          'Ajukan rekomendasi kegiatan statistik ke BPS (penyelenggara statistik sektoral)',
        ],
        checklist: [
          { id: 'de-10', label: 'Jadwal kegiatan sudah disusun', required: true },
          { id: 'de-11', label: 'SOP alur kerja sudah disusun', required: true },
          {
            id: 'de-12',
            label: 'Pengajuan rekomendasi kegiatan statistik ke BPS sudah disiapkan',
            required: true,
            klasifikasi: ['sektoral'],
          },
        ],
        outputs: ['SOP', 'Jadwal', 'Surat rekomendasi (jika wajib)'],
        pdfRef: 'Hal. 17 & 23',
      },
    ],
  },
  {
    id: 'build',
    code: '3',
    title: 'Build',
    titleId: 'Pembangunan',
    purpose:
      'Membangun instrumen, komponen pengolahan/analisis/diseminasi, mengonfigurasi alur kerja, dan melakukan uji coba.',
    sdiStage: 'pengumpulan',
    pdfRef: 'Hal. 24–31',
    subProcesses: [
      {
        id: '3.1',
        code: '3.1',
        title: 'Membangun Instrumen Pengumpulan',
        description:
          'Bangun kuesioner/panduan. Perhatikan alur pertanyaan, uji validitas & reliabilitas, dan hindari pertanyaan ganda/mengarahkan.',
        activities: [
          'Susun instrumen dengan alur logis',
          'Uji coba validitas dan reliabilitas',
          'Susun buku pedoman',
        ],
        checklist: [
          { id: 'bu-1', label: 'Instrumen pengumpulan sudah dibangun', required: true },
          { id: 'bu-2', label: 'Pedoman teknis / buku pedoman tersedia', required: true },
        ],
        outputs: ['Instrumen (kuesioner/panduan)', 'Buku pedoman'],
        pdfRef: 'Hal. 25',
      },
      {
        id: '3.2',
        code: '3.2',
        title: 'Membangun Komponen Pengolahan & Analisis',
        description: 'Bangun aplikasi, aturan editing/coding/validasi, dan integrasi data.',
        activities: [
          'Bangun aplikasi pengolahan sesuai rancangan',
          'Terapkan aturan editing, coding, validation',
          'Susun aturan integrasi data',
        ],
        checklist: [
          { id: 'bu-3', label: 'Komponen pengolahan siap diuji', required: true },
          { id: 'bu-4', label: 'Aturan validasi terdokumentasi', required: true },
        ],
        outputs: ['Sistem pengolahan', 'Aturan validasi'],
        pdfRef: 'Hal. 26',
      },
      {
        id: '3.3',
        code: '3.3',
        title: 'Membangun Komponen Diseminasi',
        description: 'Siapkan sistem penyebarluasan, akses data, dan rencana produk diseminasi.',
        activities: [
          'Atur sistem penyebarluasan dan akses data',
          'Susun rencana produk (buku, leaflet, banner, web, dll.)',
        ],
        checklist: [
          { id: 'bu-5', label: 'Komponen diseminasi sudah dikonfigurasi', required: false },
          { id: 'bu-6', label: 'Rencana produk diseminasi final', required: true },
        ],
        outputs: ['Sistem diseminasi', 'Rencana produk'],
        pdfRef: 'Hal. 27',
      },
      {
        id: '3.4',
        code: '3.4',
        title: 'Konfigurasi Alur Kerja',
        description: 'Susun struktur organisasi kegiatan dan alur dokumen.',
        activities: [
          'Tetapkan struktur organisasi kegiatan',
          'Susun alur dokumen dari pengumpulan hingga diseminasi',
        ],
        checklist: [
          { id: 'bu-7', label: 'Struktur organisasi terdokumentasi', required: true },
          { id: 'bu-8', label: 'Alur dokumen sudah dikonfigurasi', required: true },
        ],
        outputs: ['Alur kerja / workflow'],
        pdfRef: 'Hal. 28',
      },
      {
        id: '3.5',
        code: '3.5',
        title: 'Pengujian Sistem Produksi',
        description:
          'Uji interaksi antar komponen dan pastikan seluruh komponen berfungsi sesuai rancangan.',
        activities: [
          'Uji interaksi antar komponen',
          'Pastikan seluruh komponen berfungsi',
        ],
        checklist: [
          { id: 'bu-11', label: 'Uji interaksi antar komponen selesai', required: true },
          { id: 'bu-12', label: 'Seluruh komponen berfungsi sesuai rancangan', required: true },
        ],
        outputs: ['Laporan pengujian sistem produksi'],
        pdfRef: 'Hal. 29',
      },
      {
        id: '3.6',
        code: '3.6',
        title: 'Uji Proses Bisnis Statistik (Pilot)',
        description:
          'Uji coba kuesioner, metodologi lapangan, dan pengolahan (editing, coding, entry, dummy table).',
        activities: [
          'Uji coba instrumen dan kondef di lapangan',
          'Uji organisasi lapangan dan pelatihan',
          'Uji pengolahan dan aturan validasi',
        ],
        checklist: [
          { id: 'bu-9', label: 'Pilot / uji coba sudah dilaksanakan', required: true },
          { id: 'bu-10', label: 'Temuan pilot sudah ditindaklanjuti', required: true },
          {
            id: 'bu-10a',
            label: 'Uji pengolahan termasuk dummy table (jika relevan) sudah dilakukan',
            required: false,
          },
        ],
        outputs: ['Hasil uji coba / pilot'],
        pdfRef: 'Hal. 30',
      },
      {
        id: '3.7',
        code: '3.7',
        title: 'Finalisasi Sistem Produksi',
        description:
          'Susun dokumentasi teknis, panduan pengguna, dan pindahkan sistem ke lingkungan produksi.',
        activities: [
          'Susun dokumentasi teknis dan panduan pengguna',
          'Pindahkan ke lingkungan produksi',
        ],
        checklist: [
          { id: 'bu-13', label: 'Dokumentasi teknis dan panduan pengguna lengkap', required: true },
          { id: 'bu-14', label: 'Sistem siap dipindahkan ke lingkungan produksi', required: true },
        ],
        outputs: ['Sistem siap operasional', 'Dokumentasi teknis'],
        pdfRef: 'Hal. 31',
      },
    ],
  },
  {
    id: 'collect',
    code: '4',
    title: 'Collect',
    titleId: 'Pengumpulan Data',
    purpose:
      'Menyiapkan dan melaksanakan pengumpulan data, memantau kualitas, serta finalisasi data yang terkumpul.',
    sdiStage: 'pengumpulan',
    pdfRef: 'Hal. 32–36',
    subProcesses: [
      {
        id: '4.1',
        code: '4.1',
        title: 'Menyusun Kerangka dan Memilih Sampel',
        description: 'Siapkan kerangka dan penarikan sampel. Tidak untuk sensus lengkap dan kompromin.',
        activities: ['Menyiapkan kerangka sampel', 'Melakukan penarikan sampel'],
        checklist: [
          {
            id: 'co-1',
            label: 'Kerangka sampel final tersedia',
            required: true,
            jenis: ['survei'],
          },
          {
            id: 'co-2',
            label: 'Daftar sampel (unit observasi) tersedia',
            required: true,
            jenis: ['survei'],
          },
        ],
        outputs: ['Daftar sampel'],
        skipWhen: ['sensus', 'kompromin'],
        pdfRef: 'Hal. 33',
      },
      {
        id: '4.2',
        code: '4.2',
        title: 'Menyiapkan Pengumpulan Data',
        description:
          'Siapkan petugas, pelatihan, sumber daya, instrumen, dan protokol manajemen data. Non-survei: siapkan perjanjian dengan penyedia data.',
        activities: [
          'Menyiapkan dan melatih petugas',
          'Menyiapkan instrumen dan sumber daya',
          'Menyiapkan protokol manajemen data / PKS-LADU (non-survei)',
        ],
        checklist: [
          { id: 'co-3', label: 'Petugas sudah dilatih', required: true, jenis: ['survei', 'sensus'] },
          {
            id: 'co-4',
            label: 'Perjanjian penggunaan data (PKS/LADU) tersedia',
            required: true,
            jenis: ['kompromin'],
          },
          { id: 'co-5', label: 'Sumber daya dan instrumen siap', required: true },
        ],
        outputs: ['Dokumentasi pelatihan', 'PKS/LADU (jika relevan)'],
        pdfRef: 'Hal. 34',
      },
      {
        id: '4.3',
        code: '4.3',
        title: 'Melaksanakan Pengumpulan Data',
        description: 'Sosialisasi, pengumpulan, monitoring progress, dan tindak lanjut non-respon.',
        activities: [
          'Sosialisasi pengumpulan data',
          'Mengumpulkan data',
          'Monitoring dan laporan progress',
          'Tindak lanjut non-respon',
        ],
        checklist: [
          { id: 'co-6', label: 'Pengumpulan data sedang/telah berjalan', required: true },
          { id: 'co-7', label: 'Monitoring kualitas terdokumentasi', required: true },
        ],
        outputs: ['Laporan progress pengumpulan', 'Metadata kegiatan'],
        pdfRef: 'Hal. 35',
      },
      {
        id: '4.4',
        code: '4.4',
        title: 'Finalisasi Pengumpulan',
        description: 'Data capture, digitalisasi, konversi format, dan analisis metadata/paradata.',
        activities: [
          'Penginputan dan penyimpanan data',
          'Analisis metadata dan paradata pengumpulan',
        ],
        checklist: [
          { id: 'co-8', label: 'Data hasil pengumpulan sudah difinalisasi', required: true },
          { id: 'co-9', label: 'Metadata kegiatan sudah diisi', required: true },
        ],
        outputs: ['Dataset terkumpul', 'Metadata statistik kegiatan'],
        pdfRef: 'Hal. 36',
      },
    ],
  },
  {
    id: 'process',
    code: '5',
    title: 'Process',
    titleId: 'Pengolahan Data',
    purpose:
      'Mengolah data input agar siap dianalisis: integrasi, klasifikasi, validasi, imputasi, bobot (jika survei), dan agregat.',
    sdiStage: 'pemeriksaan',
    pdfRef: 'Hal. 37–45',
    subProcesses: [
      {
        id: '5.1',
        code: '5.1',
        title: 'Integrasi Data',
        description: 'Gabungkan data dari satu atau lebih sumber internal/eksternal.',
        activities: [
          'Terima dan cek kelengkapan data',
          'Integrasikan sumber data',
          'Catat daftar penerimaan data',
        ],
        checklist: [
          { id: 'pr-1', label: 'Integrasi data selesai', required: true },
          { id: 'pr-2', label: 'Laporan penerimaan data tersedia', required: false },
        ],
        outputs: ['Dataset terintegrasi'],
        pdfRef: 'Hal. 38',
      },
      {
        id: '5.2',
        code: '5.2',
        title: 'Klasifikasi dan Pengodean',
        description: 'Klasifikasi dan coding variabel sesuai kaidah editing & coding.',
        activities: [
          'Ubah pilihan tertutup menjadi kode',
          'Tambahkan kode klasifikasi pada isian',
          'Terapkan kaidah editing dan coding',
        ],
        checklist: [
          { id: 'pr-3', label: 'Editing dan coding selesai', required: true },
        ],
        outputs: ['Dataset terkode'],
        pdfRef: 'Hal. 39',
      },
      {
        id: '5.3',
        code: '5.3',
        title: 'Review & Validasi Data',
        description: 'Identifikasi outlier, nonresponse item, dan kesalahan kode.',
        activities: [
          'Jalankan aturan validasi',
          'Identifikasi outlier dan ketidaksesuaian',
          'Ulangi validasi sesuai kebutuhan',
        ],
        checklist: [
          { id: 'pr-4', label: 'Validasi data selesai', required: true },
        ],
        outputs: ['Laporan validasi'],
        pdfRef: 'Hal. 40',
      },
      {
        id: '5.4',
        code: '5.4',
        title: 'Editing & Imputasi',
        description: 'Perbaiki data tidak benar/missing/tidak wajar dan tandai perubahan.',
        activities: [
          'Tentukan metode editing/imputasi',
          'Ubah/tambah nilai dan flag perubahan',
          'Susun metadata proses editing',
        ],
        checklist: [
          { id: 'pr-5', label: 'Editing dan imputasi terdokumentasi', required: true },
        ],
        outputs: ['Dataset bersih', 'Metadata editing'],
        pdfRef: 'Hal. 41',
      },
      {
        id: '5.5',
        code: '5.5',
        title: 'Penurunan Variabel & Unit',
        description: 'Bentuk variabel dan unit statistik baru dari data yang telah diolah.',
        activities: [
          'Bentuk variabel statistik baru',
          'Bentuk unit statistik baru',
        ],
        checklist: [
          { id: 'pr-7', label: 'Variabel dan unit statistik baru sudah diturunkan', required: true },
        ],
        outputs: ['Variabel dan unit statistik turunan'],
        pdfRef: 'Hal. 42',
      },
      {
        id: '5.6',
        code: '5.6',
        title: 'Perhitungan Bobot',
        description: 'Hitung penimbang dan kalibrasi. Tidak untuk sensus lengkap dan kompromin.',
        activities: [
          'Hitung penimbang unit',
          'Lakukan estimasi kalibrasi bila diperlukan',
        ],
        checklist: [
          {
            id: 'pr-6',
            label: 'Bobot/penimbang sudah dihitung',
            required: true,
            jenis: ['survei'],
          },
        ],
        outputs: ['Dataset berbobot'],
        skipWhen: ['sensus', 'kompromin'],
        pdfRef: 'Hal. 43',
      },
      {
        id: '5.7',
        code: '5.7',
        title: 'Perhitungan Agregat',
        description:
          'Hitung agregat (jumlah, rata-rata, sebaran) dan sampling error untuk survei.',
        activities: [
          'Hitung agregat (jumlah, rata-rata, sebaran)',
          'Hitung sampling error dan estimasi (jika survei)',
        ],
        checklist: [
          { id: 'pr-9', label: 'Agregat / tabulasi sudah dihitung', required: true },
          {
            id: 'pr-10',
            label: 'Sampling error / estimasi dihitung',
            required: false,
            jenis: ['survei'],
          },
        ],
        outputs: ['Dataset mikro/makro', 'Metadata statistik variabel'],
        pdfRef: 'Hal. 44',
      },
      {
        id: '5.8',
        code: '5.8',
        title: 'Finalisasi File Data',
        description: 'Finalisasi file data agar siap untuk tahap analisis.',
        activities: [
          'Finalisasi struktur file data',
          'Pastikan file data siap untuk analisis',
        ],
        checklist: [
          { id: 'pr-8', label: 'File data final siap untuk analisis', required: true },
        ],
        outputs: ['File data final'],
        pdfRef: 'Hal. 45',
      },
    ],
  },
  {
    id: 'analyse',
    code: '6',
    title: 'Analyse',
    titleId: 'Analisis Data',
    purpose:
      'Mengubah hasil pengolahan menjadi output statistik, memvalidasi, menafsirkan, dan menerapkan disclosure control.',
    sdiStage: 'pemeriksaan',
    subProcesses: [
      {
        id: '6.1',
        code: '6.1',
        title: 'Menyusun Output Awal',
        description: 'Transformasi data menjadi tabulasi/grafik/peta sesuai desain output.',
        activities: [
          'Bangun tabel analisis, indeks, dan produk awal',
          'Siapkan mikrodata untuk review internal',
        ],
        checklist: [
          { id: 'an-1', label: 'Output awal sudah disusun', required: true },
        ],
        outputs: ['Draft output statistik'],
        pdfRef: 'Hal. 47',
      },
      {
        id: '6.2',
        code: '6.2',
        title: 'Validasi Output',
        description:
          'Periksa konsistensi, cakupan, koherensi dengan periode sebelumnya dan sumber lain.',
        activities: [
          'Periksa konsistensi dan cakupan',
          'Bandingkan dengan periode sebelumnya / sumber lain',
          'Selidiki anomali dan inkonsistensi',
        ],
        checklist: [
          { id: 'an-2', label: 'Validasi output selesai', required: true },
          { id: 'an-3', label: 'Dokumentasi pembahasan validasi tersedia', required: false },
        ],
        outputs: ['Output tervalidasi'],
        pdfRef: 'Hal. 48',
      },
      {
        id: '6.3',
        code: '6.3',
        title: 'Interpretasi dan Penjelasan',
        description: 'Berikan pemahaman mendalam atas output; analisis lanjutan bila diperlukan.',
        activities: [
          'Evaluasi kesesuaian dengan hipotesis awal',
          'Analisis mendalam (deret waktu, dampak, dll.)',
          'Susun catatan teknis dan interpretasi',
        ],
        checklist: [
          { id: 'an-4', label: 'Interpretasi dan catatan teknis siap', required: true },
        ],
        outputs: ['Narasi analisis', 'Metadata statistik indikator'],
        pdfRef: 'Hal. 49',
      },
      {
        id: '6.4',
        code: '6.4',
        title: 'Pengendalian Kerahasiaan',
        description:
          'Pastikan data dan metadata yang dipublikasikan tidak melanggar kerahasiaan (anonimisasi, suppress n<3).',
        activities: [
          'Anonimisasi mikrodata',
          'Terapkan disclosure control pada agregat',
          'Lindungi data sensitif hasil kompilasi',
        ],
        checklist: [
          { id: 'an-5', label: 'Disclosure control sudah diterapkan', required: true },
        ],
        outputs: ['Output aman untuk diseminasi'],
        pdfRef: 'Hal. 50',
      },
      {
        id: '6.5',
        code: '6.5',
        title: 'Finalisasi Output',
        description: 'Diskusi pra-rilis, persetujuan konten, tingkat rilis, dan catatan kehati-hatian.',
        activities: [
          'Diskusi pra-rilis dengan pakar',
          'Setujui konten yang akan dirilis',
          'Tetapkan level rilis dan catatan khusus',
        ],
        checklist: [
          { id: 'an-6', label: 'Persetujuan rilis sudah diperoleh', required: true },
          { id: 'an-7', label: 'Catatan kehati-hatian disusun', required: false },
        ],
        outputs: ['Output final layak diseminasi'],
        pdfRef: 'Hal. 51',
      },
    ],
  },
  {
    id: 'disseminate',
    code: '7',
    title: 'Disseminate',
    titleId: 'Penyajian & Penyebarluasan',
    purpose:
      'Memformat, merilis, dan mempromosikan produk statistik serta menyediakan layanan dukungan pengguna. Metadata wajib mengikuti Perka BPS 5/2020.',
    sdiStage: 'penyebarluasan',
    subProcesses: [
      {
        id: '7.1',
        code: '7.1',
        title: 'Memutakhirkan Sistem Output',
        description: 'Format dan muat data + metadata ke sistem output; pastikan keterhubungan.',
        activities: [
          'Format data dan metadata',
          'Muat ke sistem output',
          'Pastikan kelengkapan metadata sebelum rilis',
        ],
        checklist: [
          { id: 'di-1', label: 'Data dan metadata termuat di sistem output', required: true },
          { id: 'di-2', label: 'Metadata mengikuti format baku BPS', required: true },
        ],
        outputs: ['Data & metadata di sistem output'],
        pdfRef: 'Hal. 53',
      },
      {
        id: '7.2',
        code: '7.2',
        title: 'Menghasilkan Produk Diseminasi',
        description: 'Susun publikasi, tabulasi, grafik, peta sesuai desain.',
        activities: [
          'Siapkan komponen produk (tabel, grafik, catatan teknis)',
          'Satukan menjadi produk diseminasi',
          'Sunting agar memenuhi standar publikasi',
        ],
        checklist: [
          { id: 'di-3', label: 'Produk diseminasi sudah dihasilkan', required: true },
        ],
        outputs: ['Publikasi / produk diseminasi'],
        pdfRef: 'Hal. 54',
      },
      {
        id: '7.3',
        code: '7.3',
        title: 'Merilis Produk Statistik',
        description: 'Atur jadwal dan mekanisme rilis, termasuk koreksi jika ditemukan kesalahan.',
        activities: [
          'Pastikan produk siap rilis',
          'Atur jadwal dan mekanisme rilis',
          'Siapkan mekanisme koreksi pasca-rilis',
        ],
        checklist: [
          { id: 'di-4', label: 'Jadwal rilis ditetapkan', required: true },
          { id: 'di-5', label: 'Dokumentasi rilis tersedia', required: true },
        ],
        outputs: ['Dokumentasi rilis'],
        pdfRef: 'Hal. 55',
      },
      {
        id: '7.4',
        code: '7.4',
        title: 'Mempromosikan Produk Statistik',
        description: 'Promosi aktif melalui website, media sosial, dan platform digital.',
        activities: ['Promosikan produk agar menjangkau pengguna luas'],
        checklist: [
          { id: 'di-6', label: 'Promosi produk sudah direncanakan/dilaksanakan', required: false },
        ],
        outputs: ['Dokumentasi promosi'],
        pdfRef: 'Hal. 56',
      },
      {
        id: '7.5',
        code: '7.5',
        title: 'Layanan dan Dukungan Pengguna',
        description: 'Catat dan penuhi permintaan data dalam batas waktu; kelola FAQ.',
        activities: [
          'Kelola pertanyaan/permintaan data pengguna',
          'Sediakan FAQ dan basis pengetahuan',
        ],
        checklist: [
          { id: 'di-7', label: 'Kanal dukungan pengguna siap', required: false },
        ],
        outputs: ['Log layanan pengguna'],
        pdfRef: 'Hal. 57',
      },
    ],
  },
  {
    id: 'evaluate',
    code: '8',
    title: 'Evaluate',
    titleId: 'Evaluasi',
    purpose:
      'Menghimpun masukan dari seluruh fase, menyusun laporan evaluasi, dan menyepakati rencana tindak lanjut siklus berikutnya.',
    sdiStage: 'penyebarluasan',
    subProcesses: [
      {
        id: '8.1',
        code: '8.1',
        title: 'Menghimpun Bahan Evaluasi',
        description:
          'Kumpulkan umpan balik pengguna, paradata, metrik sistem, dan masukan staf secara berkelanjutan.',
        activities: [
          'Kumpulkan bahan evaluasi dari seluruh fase',
          'Susun bahan agar siap diproses tim evaluasi',
        ],
        checklist: [
          { id: 'ev-1', label: 'Bahan evaluasi terkumpul', required: true },
        ],
        outputs: ['Paket bahan evaluasi'],
        pdfRef: 'Hal. 61',
      },
      {
        id: '8.2',
        code: '8.2',
        title: 'Melakukan Evaluasi',
        description:
          'Analisis bahan, bandingkan dengan target, susun laporan masalah dan rekomendasi perubahan.',
        activities: [
          'Analisis hasil evaluasi vs target',
          'Susun laporan evaluasi',
        ],
        checklist: [
          { id: 'ev-2', label: 'Laporan evaluasi selesai', required: true },
        ],
        outputs: ['Laporan evaluasi'],
        pdfRef: 'Hal. 62',
      },
      {
        id: '8.3',
        code: '8.3',
        title: 'Menyepakati Rencana Tindak Lanjut',
        description: 'Susun RTL, tetapkan prioritas dan penanggung jawab, pantau dampak perbaikan.',
        activities: [
          'Susun dan dokumentasikan rencana aksi',
          'Dapatkan persetujuan RTL',
          'Tetapkan mekanisme pemantauan dampak',
        ],
        checklist: [
          { id: 'ev-3', label: 'RTL disepakati dan terdokumentasi', required: true },
        ],
        outputs: ['Rencana Tindak Lanjut (RTL)'],
        pdfRef: 'Hal. 63',
      },
    ],
  },
]

export function getPhase(id: string) {
  return GSBPM_PHASES.find((p) => p.id === id)
}

export function getStageForPhase(phaseId: string) {
  return SDI_STAGES.find((s) => s.phases.includes(phaseId as never))
}

export function isSubProcessVisible(
  skipWhen: JenisKegiatan[] | undefined,
  jenis: JenisKegiatan,
) {
  if (!skipWhen?.length) return true
  return !skipWhen.includes(jenis)
}

export function isChecklistVisible(
  item: Pick<import('./types').ChecklistItem, 'jenis' | 'klasifikasi'>,
  jenis: JenisKegiatan,
  klasifikasi: Klasifikasi,
) {
  if (item.jenis?.length && !item.jenis.includes(jenis)) return false
  if (item.klasifikasi?.length && !item.klasifikasi.includes(klasifikasi)) return false
  return true
}

export function computePhaseProgress(
  phaseId: string,
  jenis: JenisKegiatan,
  klasifikasi: Klasifikasi,
  checklistState: Record<string, boolean>,
) {
  const phase = getPhase(phaseId)
  if (!phase) return { done: 0, total: 0, pct: 0 }

  let done = 0
  let total = 0
  for (const sp of phase.subProcesses) {
    if (!isSubProcessVisible(sp.skipWhen, jenis)) continue
    for (const item of sp.checklist) {
      if (!isChecklistVisible(item, jenis, klasifikasi)) continue
      if (!item.required) continue
      total += 1
      if (checklistState[item.id]) done += 1
    }
  }
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function computeProjectProgress(
  jenis: JenisKegiatan,
  klasifikasi: Klasifikasi,
  checklistState: Record<string, boolean>,
) {
  let done = 0
  let total = 0
  for (const phase of GSBPM_PHASES) {
    const p = computePhaseProgress(phase.id, jenis, klasifikasi, checklistState)
    done += p.done
    total += p.total
  }
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}
