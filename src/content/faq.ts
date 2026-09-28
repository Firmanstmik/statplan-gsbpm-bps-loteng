/**
 * FAQ / knowledge base — the single source for /app/faq, contextual FAQ links and docs/faq-content-map.md.
 *
 * Source kinds (never blur them):
 *   A        Menurut Materi Proses Bisnis · Hal. N   — stated in the PDF (page verified in docs/_pdf-extract)
 *   B        Penjelasan sederhana · Hal. N            — simplified wording of PDF content
 *   STATPLAN Penjelasan StatPlan                      — how StatPlan itself works (not a BPS statement)
 * Omit `page` when a page cannot be pointed to exactly.
 */

export type FaqCategoryId =
  | 'statplan'
  | 'gsbpm'
  | 'memulai'
  | 'perancangan'
  | 'olah'
  | 'hasil'
  | 'output'
  | 'bantuan'

export type FaqSource = { kind: 'A' | 'B' | 'STATPLAN'; page?: string }

/** A paragraph, or a bullet list when given as an array. */
export type FaqBlock = string | string[]

export interface FaqItem {
  id: string
  category: FaqCategoryId
  q: string
  a: FaqBlock[]
  source: FaqSource
  /** Related GSBPM 5.2 phase ("2") or subprocess ("2.4"), when there is one. */
  gsbpm?: string
}

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: string }[] = [
  { id: 'statplan', label: 'Tentang StatPlan' },
  { id: 'gsbpm', label: 'Tentang GSBPM' },
  { id: 'memulai', label: 'Memulai kegiatan' },
  { id: 'perancangan', label: 'Perancangan' },
  { id: 'olah', label: 'Pengumpulan, pengolahan & analisis' },
  { id: 'hasil', label: 'Hasil & diseminasi' },
  { id: 'output', label: 'Output StatPlan' },
  { id: 'bantuan', label: 'Bantuan' },
]

export const FAQ_ITEMS: FaqItem[] = [
  // ——— Tentang StatPlan ———
  {
    id: 'apa-itu-statplan',
    category: 'statplan',
    q: 'Apa itu StatPlan?',
    a: [
      'StatPlan adalah simulator untuk belajar dan menyusun rencana kegiatan statistik. Anda dibantu memahami apa yang perlu disiapkan, melihat contoh, mengikuti langkahnya satu per satu, lalu mendapatkan draf rencana berbasis GSBPM 5.2.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'untuk-siapa',
    category: 'statplan',
    q: 'Untuk siapa StatPlan dibuat?',
    a: [
      'Untuk siapa saja yang ingin menyelenggarakan kegiatan statistik tetapi belum tahu harus mulai dari mana — misalnya pegawai instansi yang baru pertama kali merencanakan survei, pendataan lengkap, atau kompilasi data administratif.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'apa-yang-bisa',
    category: 'statplan',
    q: 'Apa yang bisa dilakukan dengan StatPlan?',
    a: [
      [
        'Melihat contoh kegiatan statistik yang disusun langkah demi langkah.',
        'Menceritakan kebutuhan Anda dan mendapat saran awal cara memperoleh datanya.',
        'Menyusun jadwal kegiatan.',
        'Mempelajari 44 subproses GSBPM satu per satu di Mode Terpandu, lengkap dengan contoh dan format kerja.',
        'Melengkapi variabel, instrumen, dan metadata di Ruang kerja.',
        'Melihat apa yang masih kurang, lalu mengunduh draf rencana dalam format Word.',
      ],
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'perlu-paham-gsbpm',
    category: 'statplan',
    q: 'Apakah saya harus memahami GSBPM sebelum menggunakan StatPlan?',
    a: [
      'Tidak. StatPlan menjelaskan GSBPM sambil jalan: setiap subproses dibuka satu per satu dengan penjelasan sederhana, contoh, dan rujukan ke materi.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'sistem-resmi',
    category: 'statplan',
    q: 'Apakah StatPlan merupakan sistem resmi BPS?',
    a: [
      'Bukan. StatPlan adalah simulator dan alat bantu belajar. StatPlan tidak terhubung dengan sistem BPS dan tidak menggantikan prosedur maupun pembinaan statistik oleh BPS.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'persetujuan-bps',
    category: 'statplan',
    q: 'Apakah hasil dari StatPlan merupakan persetujuan BPS?',
    a: [
      'Bukan. Hasil StatPlan adalah draf bahan kerja. Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS pada fase Perancangan (Hal. 17) — StatPlan hanya membantu Anda menyiapkan bahannya.',
    ],
    source: { kind: 'STATPLAN' },
    gsbpm: '2',
  },

  // ——— Tentang GSBPM ———
  {
    id: 'apa-itu-gsbpm',
    category: 'gsbpm',
    q: 'Apa itu GSBPM?',
    a: [
      'GSBPM (Generic Statistical Business Process Model) adalah kerangka kerja standar internasional untuk menjelaskan rangkaian proses yang dibutuhkan untuk menghasilkan statistik. Kerangka ini ditetapkan oleh UNECE dan telah diadopsi oleh lembaga statistik nasional di berbagai negara.',
    ],
    source: { kind: 'A', page: '5' },
  },
  {
    id: 'mengapa-gsbpm',
    category: 'gsbpm',
    q: 'Mengapa GSBPM digunakan?',
    a: [
      'Menurut materi, GSBPM bermanfaat untuk:',
      [
        'mendokumentasikan proses statistik secara runtut dan saling berkaitan,',
        'membandingkan proses di dalam maupun antar organisasi,',
        'membuat keputusan yang lebih baik tentang sistem produksi dan kebutuhan sumber daya,',
        'menilai dan memperbaiki kualitas proses.',
      ],
    ],
    source: { kind: 'A', page: '5' },
  },
  {
    id: 'tahapan-gsbpm',
    category: 'gsbpm',
    q: 'Apa saja tahapan GSBPM?',
    a: [
      'GSBPM 5.2 memiliki 8 fase:',
      [
        '1. Identifikasi Kebutuhan (Specify Need)',
        '2. Perancangan (Design)',
        '3. Pembangunan (Build)',
        '4. Pengumpulan Data (Collect)',
        '5. Pengolahan Data (Process)',
        '6. Analisis Data (Analyse)',
        '7. Penyajian dan Penyebarluasan (Disseminate)',
        '8. Evaluasi (Evaluate)',
      ],
    ],
    source: { kind: 'A', page: '6' },
  },
  {
    id: 'harus-urut',
    category: 'gsbpm',
    q: 'Apakah GSBPM harus dikerjakan secara urut?',
    a: [
      'Tidak harus. Menurut materi, GSBPM dapat diterapkan secara fleksibel: alur subproses tidak harus berurutan, dapat berulang (iterasi), dan tahapannya saling terkait.',
      'StatPlan menggunakan alur bertahap agar lebih mudah dipelajari. GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait.',
    ],
    source: { kind: 'A', page: '5, 8' },
  },
  {
    id: 'hubungan-statplan-gsbpm',
    category: 'gsbpm',
    q: 'Apa hubungan StatPlan dengan GSBPM?',
    a: [
      'StatPlan memakai 8 fase dan 44 subproses GSBPM 5.2 sebagai kerangka. Nama dan kode subproses mengikuti Materi Proses Bisnis. Urutan di Mode Terpandu adalah urutan belajar StatPlan — bukan urutan wajib GSBPM.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'apa-itu-subproses',
    category: 'gsbpm',
    q: 'Apa itu subproses dalam GSBPM?',
    a: [
      'Setiap fase GSBPM dipecah menjadi subproses, yaitu langkah kerja yang lebih rinci. Misalnya fase Identifikasi Kebutuhan terdiri dari 1.1 Identifikasi Kebutuhan sampai 1.6 Penyusunan Proposal Kegiatan/Kerangka Acuan Kerja (KAK). Di StatPlan, kedelapan fase berisi total 44 subproses.',
    ],
    source: { kind: 'B', page: '6, 11' },
    gsbpm: '1',
  },

  // ——— Memulai kegiatan ———
  {
    id: 'mulai-dari-mana',
    category: 'memulai',
    q: 'Saya baru pertama kali membuat kegiatan statistik, harus mulai dari mana?',
    a: [
      'Lihat satu contoh kegiatan dulu. Setelah itu pilih "Rencana baru" dan ceritakan dengan bahasa sehari-hari informasi apa yang ingin Anda ketahui. StatPlan memberi saran cara memperoleh datanya, lalu Anda menentukan jadwal dan mulai belajar di Mode Terpandu.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'informasi-disiapkan',
    category: 'memulai',
    q: 'Informasi apa yang perlu saya siapkan?',
    a: [
      'Cukup mulai dari hal sederhana: apa yang ingin diketahui, siapa yang akan memakai hasilnya, untuk apa, kapan dibutuhkan, dan data apa yang mungkin sudah ada.',
      'Menurut materi, hasil fase Identifikasi Kebutuhan antara lain Kerangka Acuan Kerja, dokumentasi rapat pembahasan kebutuhan data, dan daftar kebutuhan data.',
    ],
    source: { kind: 'B', page: '10, 12' },
    gsbpm: '1',
  },
  {
    id: 'survei-sensus-kompilasi',
    category: 'memulai',
    q: 'Apa perbedaan survei, sensus, dan kompilasi data?',
    a: [
      [
        'Sensus (pendataan lengkap): semua unit yang dituju didata.',
        'Survei: hanya sebagian unit yang dipilih (sampel) yang didata.',
        'Kompilasi produk administrasi (kompromin): memakai data yang sudah tersedia, misalnya dari catatan administrasi instansi.',
      ],
      'Materi menyarankan: jika data yang tersedia sudah sesuai kebutuhan, kegiatan bersifat kompilasi; jika belum, kegiatan dapat berupa sensus atau survei.',
    ],
    source: { kind: 'B', page: '15, 20–21' },
    gsbpm: '2.3',
  },
  {
    id: 'menentukan-kebutuhan',
    category: 'memulai',
    q: 'Bagaimana menentukan kebutuhan statistik?',
    a: [
      'Mulai dari masalah yang ingin dijawab, lalu tentukan data atau indikator apa yang diperlukan. Bicarakan dengan calon pengguna hasilnya agar jelas mengapa statistik itu diperlukan dan apa yang diharapkan. Setelah itu tetapkan tujuan dan bentuk output-nya.',
    ],
    source: { kind: 'B', page: '11–13' },
    gsbpm: '1.1',
  },
  {
    id: 'cek-data-tersedia',
    category: 'memulai',
    q: 'Mengapa perlu melihat data yang sudah tersedia?',
    a: [
      'Untuk menghindari duplikasi data. Materi menyarankan memeriksa dulu portal rujukan statistik seperti sirusa.web.bps.go.id, romantik.bps.go.id, dan Portal SDI. Data yang sudah tersedia juga dapat dipakai sebagai data pendukung hasil sensus atau survei.',
    ],
    source: { kind: 'A', page: '15' },
    gsbpm: '1.5',
  },

  // ——— Perancangan ———
  {
    id: 'tujuan-kegiatan',
    category: 'perancangan',
    q: 'Apa itu tujuan kegiatan?',
    a: [
      'Tujuan menjelaskan apa yang ingin dicapai atau dijawab oleh kegiatan. Menurut materi, tujuan dapat berisi output statistik yang diperlukan, dan output itu dirumuskan untuk menjawab kebutuhan pengguna.',
    ],
    source: { kind: 'B', page: '13' },
    gsbpm: '1.3',
  },
  {
    id: 'apa-itu-indikator',
    category: 'perancangan',
    q: 'Apa itu indikator?',
    a: [
      'Indikator adalah angka ringkas yang menggambarkan suatu keadaan, misalnya persentase atau rata-rata. Indikator dihitung dari variabel yang dikumpulkan. Konsep dan definisinya ditetapkan sejak awal, lalu rumusnya dirancang pada fase Perancangan.',
    ],
    source: { kind: 'B', page: '14, 17' },
    gsbpm: '2.1',
  },
  {
    id: 'apa-itu-variabel',
    category: 'perancangan',
    q: 'Apa itu variabel?',
    a: [
      'Variabel adalah informasi yang ingin dikumpulkan atau digunakan dalam kegiatan statistik, misalnya nama, umur, jenis kelamin, tingkat pendidikan, atau pekerjaan utama.',
    ],
    source: { kind: 'B', page: '19' },
    gsbpm: '2.2',
  },
  {
    id: 'variabel-perlu',
    category: 'perancangan',
    q: 'Mengapa variabel perlu ditentukan?',
    a: [
      'Agar data yang dikumpulkan sesuai kebutuhan — tidak kurang dan tidak berlebihan. Materi menyarankan memeriksa Standar Data Statistik Nasional untuk setiap variabel dan memeriksa apakah variabel itu sudah tersedia.',
    ],
    source: { kind: 'B', page: '19' },
    gsbpm: '2.2',
  },
  {
    id: 'apa-itu-instrumen',
    category: 'perancangan',
    q: 'Apa itu instrumen?',
    a: [
      'Instrumen adalah alat untuk mengumpulkan data, misalnya kuesioner atau panduan teknis kegiatan. Beberapa saran dari materi:',
      [
        'susun pertanyaan secara runtut dan tidak meloncat-loncat,',
        'letakkan pertanyaan yang mudah di awal,',
        'letakkan pertanyaan sensitif dan jawaban terbuka di akhir,',
        'gunakan pertanyaan yang singkat dan jelas.',
      ],
    ],
    source: { kind: 'B', page: '24–25' },
    gsbpm: '3.1',
  },
  {
    id: 'apa-itu-sampling',
    category: 'perancangan',
    q: 'Apa itu sampling?',
    a: [
      'Sampling adalah cara memilih sebagian unit (sampel) untuk mewakili seluruh populasi. Materi membedakan dua kelompok metode:',
      [
        'Probability sampling: simple random, stratified, systematic, cluster, dan probability proportional to size.',
        'Non probability sampling: quota, accidental, purposive, dan snowball.',
      ],
    ],
    source: { kind: 'A', page: '21' },
    gsbpm: '2.4',
  },
  {
    id: 'kapan-sampling',
    category: 'perancangan',
    q: 'Kapan sampling diperlukan?',
    a: [
      'Saat kegiatan berupa survei. Menurut materi, subproses kerangka sampel tidak dilakukan jika pengumpulan data dilakukan dengan sensus/pendataan lengkap atau kompilasi produk administrasi (kompromin).',
    ],
    source: { kind: 'A', page: '21, 33' },
    gsbpm: '2.4',
  },
  {
    id: 'rancangan-tabulasi',
    category: 'perancangan',
    q: 'Apa itu rancangan tabulasi?',
    a: [
      'Rancangan tabulasi adalah rancangan tabel hasil yang ingin disajikan. Tabel dirancang sebelum data dikumpulkan agar jelas variabel apa saja yang dibutuhkan. Materi memuat contoh rancangan tabulasi.',
    ],
    source: { kind: 'B', page: '18' },
    gsbpm: '2.1',
  },
  {
    id: 'jadwal-kegiatan',
    category: 'perancangan',
    q: 'Mengapa perlu membuat jadwal kegiatan?',
    a: [
      'Jadwal membantu semua pihak tahu kapan setiap tahap dikerjakan dan kapan hasilnya siap. Materi menempatkan penyusunan jadwal kegiatan pada fase Perancangan dan memberi contoh jadwal.',
      'Di StatPlan, pembagian waktu per fase adalah contoh jadwal ilustratif — bukan durasi wajib BPS. Anda bisa menyesuaikannya.',
    ],
    source: { kind: 'B', page: '23' },
    gsbpm: '2.6',
  },

  // ——— Pengumpulan, pengolahan & analisis ———
  {
    id: 'pengumpulan-data',
    category: 'olah',
    q: 'Apa yang dimaksud pengumpulan data?',
    a: [
      'Pengumpulan data adalah tahap mendapatkan data sesuai rancangan: menyiapkan dan melatih petugas, mengumpulkan data dengan instrumen yang ditetapkan, memantau kemajuan dan kualitasnya, serta menindaklanjuti unit yang belum merespons.',
    ],
    source: { kind: 'B', page: '32, 34–35' },
    gsbpm: '4',
  },
  {
    id: 'apa-itu-validasi',
    category: 'olah',
    q: 'Mengapa data perlu divalidasi?',
    a: [
      'Validasi adalah pemeriksaan data untuk menemukan masalah, kesalahan, atau ketidaksesuaian — misalnya nilai yang jauh berbeda dari lainnya (outlier), isian yang kosong, atau kode yang salah. Validasi dapat dilakukan berulang kali, dan sebagian sudah bisa diterapkan saat pengumpulan data dengan bantuan komputer (misalnya CAPI atau CAWI).',
    ],
    source: { kind: 'A', page: '40' },
    gsbpm: '5.3',
  },
  {
    id: 'apa-itu-editing',
    category: 'olah',
    q: 'Apa itu editing?',
    a: [
      'Editing (penyuntingan) adalah memeriksa dan memperbaiki isian yang salah atau kurang jelas pada dokumen hasil pencacahan, mengikuti kaidah editing yang telah ditetapkan.',
    ],
    source: { kind: 'A', page: '39' },
    gsbpm: '5.4',
  },
  {
    id: 'apa-itu-imputasi',
    category: 'olah',
    q: 'Apa itu imputasi?',
    a: [
      'Imputasi adalah mengisi atau mengganti nilai data yang dianggap tidak benar, kosong (missing), atau tidak wajar dengan metode yang dipilih. Data yang diubah diberi penanda (flag) dan prosesnya dicatat dalam metadata.',
    ],
    source: { kind: 'A', page: '41' },
    gsbpm: '5.4',
  },
  {
    id: 'apa-itu-coding',
    category: 'olah',
    q: 'Apa itu coding?',
    a: [
      'Coding (pengodean) adalah memberi kode angka atau huruf pada isian, misalnya mengubah pilihan centang pada pertanyaan tertutup menjadi kode, agar data lebih mudah diolah.',
    ],
    source: { kind: 'A', page: '39' },
    gsbpm: '5.2',
  },
  {
    id: 'periksa-sebelum-analisis',
    category: 'olah',
    q: 'Mengapa data perlu diperiksa sebelum dianalisis?',
    a: [
      'Kesalahan kecil pada data — isian kosong, salah ketik, atau salah kode — dapat mengubah hasil dan kesimpulan. Karena itu data diperiksa, divalidasi, dan diperbaiki pada tahap pengolahan sebelum dianalisis.',
    ],
    source: { kind: 'B', page: '37, 40' },
    gsbpm: '5',
  },
  {
    id: 'olah-vs-analisis',
    category: 'olah',
    q: 'Apa perbedaan pengolahan dan analisis?',
    a: [
      'Pengolahan menyiapkan data agar siap dipakai: menggabungkan, memberi kode, memvalidasi, memperbaiki, menghitung bobot, dan menghitung agregat.',
      'Analisis mengubah hasil olahan menjadi output statistik — tabel, indeks, atau grafik — lalu memeriksa, menafsirkan maknanya, dan menjaga kerahasiaan data individu.',
    ],
    source: { kind: 'B', page: '37, 46' },
    gsbpm: '6',
  },
  {
    id: 'kualitas-data',
    category: 'olah',
    q: 'Mengapa kualitas data perlu diperhatikan?',
    a: [
      'Karena statistik hanya berguna bila dapat dipercaya. Materi menyebut statistik yang dihasilkan perlu memenuhi dimensi kualitas: mudah ditafsirkan, akurat, mudah diakses, relevan, konsisten, dan tepat waktu. Kualitas dijaga di setiap fase, bukan pada satu tahap saja.',
    ],
    source: { kind: 'A', page: '4' },
  },

  // ——— Hasil & diseminasi ———
  {
    id: 'produk-statistik',
    category: 'hasil',
    q: 'Apa yang dimaksud produk statistik?',
    a: [
      'Produk statistik adalah hasil kegiatan yang disajikan kepada pengguna, misalnya publikasi cetak atau elektronik, tabel, grafik, atau peta. Bentuknya dirancang sejak fase Perancangan agar sesuai kebutuhan pengguna.',
    ],
    source: { kind: 'B', page: '17, 54' },
    gsbpm: '7.2',
  },
  {
    id: 'cara-penyajian',
    category: 'hasil',
    q: 'Bagaimana hasil statistik dapat disajikan?',
    a: [
      'Menurut materi, produk dapat berbentuk publikasi, siaran pers, web, tabel, peta, grafik interaktif, atau microdata. Produk juga dipromosikan agar menjangkau pengguna luas, misalnya melalui website dan media sosial.',
    ],
    source: { kind: 'A', page: '52, 56' },
    gsbpm: '7',
  },
  {
    id: 'apa-itu-metadata',
    category: 'hasil',
    q: 'Apa itu metadata?',
    a: [
      'Metadata adalah informasi dalam struktur dan format baku untuk menggambarkan dan menjelaskan data, serta memudahkan pencarian, penggunaan, dan pengelolaannya. Materi menyebut tiga jenis: Metadata Statistik Kegiatan (MS-Keg), Variabel (MS-Var), dan Indikator (MS-Ind).',
    ],
    source: { kind: 'A', page: '58–59' },
  },
  {
    id: 'metadata-perlu',
    category: 'hasil',
    q: 'Mengapa metadata diperlukan?',
    a: [
      'Metadata memudahkan orang lain memahami dan memakai data dengan benar. Menurut materi, metadata membantu interpretasi data, pengelolaan data, dokumentasi, dan pengendalian mutu, serta membantu menghindari duplikasi kegiatan.',
    ],
    source: { kind: 'A', page: '59' },
  },
  {
    id: 'sebelum-rilis',
    category: 'hasil',
    q: 'Apa yang perlu diperhatikan sebelum hasil dirilis?',
    a: [
      [
        'Periksa ulang konsistensi output.',
        'Lakukan diskusi pra-rilis dengan pakar di bidangnya.',
        'Pastikan metadata sudah lengkap.',
        'Atur jadwal dan mekanisme rilis, termasuk cara menangani kesalahan yang ditemukan setelah rilis.',
      ],
    ],
    source: { kind: 'B', page: '51–52, 55' },
    gsbpm: '7.3',
  },
  {
    id: 'fungsi-faq',
    category: 'hasil',
    q: 'Apa fungsi FAQ dan basis pengetahuan dalam layanan pengguna?',
    a: [
      'Menurut materi, menyediakan dan mengelola FAQ dan basis pengetahuan termasuk aktivitas fase Penyajian dan Penyebarluasan, bersama mencatat dan menindaklanjuti pertanyaan serta permintaan data pengguna. Tujuannya agar pertanyaan pengguna terjawab dengan cepat dan konsisten.',
    ],
    source: { kind: 'A', page: '52' },
    gsbpm: '7.5',
  },

  // ——— Output StatPlan ———
  {
    id: 'apa-dihasilkan',
    category: 'output',
    q: 'Apa saja yang bisa dihasilkan StatPlan?',
    a: [
      'Draf rencana kegiatan dalam format Word (.docx). Isinya antara lain identitas kegiatan, pemeriksaan portal rujukan, rancangan (cara, metode, moda, sampel), variabel dan indikator, instrumen, draf rekomendasi, timeline, checklist GSBPM 5.2, dan metadata.',
      'Selain itu, bahan kerja yang Anda siapkan per subproses di Mode Terpandu tersimpan di proyek.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'fungsi-workspace',
    category: 'output',
    q: 'Apa fungsi Ruang kerja (Workspace)?',
    a: [
      'Ruang kerja adalah tempat melihat dan mengubah seluruh isi proyek sekaligus: Timeline, Alur kerja, Checklist, Perancangan, Variabel, Instrumen, Metadata, Riwayat, dan Ekspor. Jika Anda baru mulai, cukup ikuti Mode Terpandu dulu; Ruang kerja dipakai untuk meninjau dan melengkapi.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'belum-bisa-ekspor',
    category: 'output',
    q: 'Mengapa proyek saya belum bisa diekspor?',
    a: [
      'Tombol unduh terbuka setelah hal yang wajib terpenuhi: checklist wajib minimal 80%, pemeriksaan portal rujukan dicatat, metadata kegiatan (MS-Keg) lengkap, dan — untuk penyelenggara statistik sektoral — persiapan rekomendasi. Buka tab Ekspor: setiap kekurangan ditampilkan beserta alasannya dan tombol menuju bagian yang perlu dilengkapi.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'siap-ditinjau',
    category: 'output',
    q: 'Apa arti "Siap ditinjau"?',
    a: [
      'Status ini muncul setelah draf berhasil diunduh. Artinya draf siap Anda tinjau bersama tim — bukan berarti kegiatan sudah disetujui BPS.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'word-resmi',
    category: 'output',
    q: 'Apakah dokumen Word yang dihasilkan sudah merupakan dokumen resmi?',
    a: [
      'Belum. Dokumen yang diunduh adalah draf perencanaan untuk bahan kerja dan diskusi. Dokumen ini belum merupakan dokumen resmi BPS dan tidak menggantikan proses resmi di instansi Anda.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'ubah-rencana',
    category: 'output',
    q: 'Apakah saya bisa mengubah kembali rencana?',
    a: [
      'Bisa. Kebutuhan, bahan kerja, variabel, instrumen, dan metadata dapat diubah kapan saja di Mode Terpandu atau Ruang kerja. Jadwal ditentukan saat membuat rencana.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'tersimpan-di-mana',
    category: 'output',
    q: 'Apakah data proyek tersimpan di server?',
    a: [
      'Tidak. Semua proyek tersimpan di browser pada perangkat Anda. Jika data browser dihapus, proyek ikut terhapus, dan proyek tidak otomatis pindah ke perangkat lain. Untuk membagikan proyek, gunakan "Salin tautan berbagi" di Ruang kerja.',
    ],
    source: { kind: 'STATPLAN' },
  },

  // ——— Bantuan ———
  {
    id: 'masih-bingung',
    category: 'bantuan',
    q: 'Saya masih bingung, apa yang harus saya lakukan?',
    a: [
      'Tidak apa-apa. Buka satu contoh kegiatan untuk melihat bentuk akhirnya, lalu ikuti Mode Terpandu — satu subproses dalam satu waktu. Di setiap proyek, kartu "Langkah berikutnya" menunjukkan apa yang sebaiknya dikerjakan sekarang, dan tombol ⓘ menjelaskan istilah di halaman itu.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'langkah-belum-selesai',
    category: 'bantuan',
    q: 'Apa yang harus dilakukan jika sebuah langkah belum selesai?',
    a: [
      'Lanjutkan saja. Bahan kerja boleh disiapkan bertahap, dan "Sudah dipahami" hanya menandai bahwa Anda sudah mempelajari subproses itu. Hal yang wajib sebelum draf dapat diunduh akan ditunjukkan di tab Ekspor.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'kembali-langkah',
    category: 'bantuan',
    q: 'Bisakah saya kembali ke langkah sebelumnya?',
    a: [
      'Bisa. Fase yang sudah dibuka di Mode Terpandu dapat dibuka lagi kapan saja, dan dari Ruang kerja ada tombol "Kembali ke Mode Terpandu". Isian Anda tetap tersimpan.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'contoh-ilustratif',
    category: 'bantuan',
    q: 'Apa arti "Contoh ilustratif StatPlan"?',
    a: [
      'Label ini menandai contoh yang dibuat StatPlan untuk membantu belajar. Contoh tersebut bukan data kegiatan nyata dan bukan contoh resmi BPS. Isi yang diambil langsung dari materi diberi label "Menurut Materi Proses Bisnis" beserta nomor halamannya.',
    ],
    source: { kind: 'STATPLAN' },
  },
  {
    id: 'sumber-materi',
    category: 'bantuan',
    q: 'Di mana saya bisa melihat sumber materi?',
    a: [
      'Sumber utama StatPlan adalah Materi Proses Bisnis (GSBPM 5.2). Rujukan halamannya ditampilkan di setiap subproses Mode Terpandu, di halaman Contoh, dan pada jawaban FAQ ini. Gambar yang diambil dari materi selalu mencantumkan nomor halamannya.',
    ],
    source: { kind: 'STATPLAN' },
  },
]

export function faqItem(id: string): FaqItem | undefined {
  return FAQ_ITEMS.find((f) => f.id === id)
}

/** Deep link used by contextual links; the FAQ page opens and scrolls to the item. */
export function faqHref(id: string): string {
  return `/app/faq#${id}`
}
