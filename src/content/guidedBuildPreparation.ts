/**
 * Slice 6 — Guided preparation for Build.
 * Working formats only. Does not write into Project instruments / checklist / export.
 */
import type {
  GuidedDraftValues,
  GuidedPreparationDef,
} from '@/content/guidedNeedPreparation'

function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function hasNamedRows(
  values: GuidedDraftValues,
  key: string,
  nameKey: string,
): boolean {
  const raw = values[key]
  if (!Array.isArray(raw)) return false
  return raw.some(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      nameKey in row &&
      hasText((row as Record<string, string>)[nameKey]),
  )
}

export const GUIDED_BUILD_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'gsbpm-3.1',
    title: 'Siapkan draft instrumen',
    explanation:
      'Susun gambaran awal instrumen: nama, tujuan, data yang ingin diperoleh, dan urutan bloknya mengikuti prinsip materi Hal. 25.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 25',
    disclaimer: 'Format kerja StatPlan — bukan template resmi BPS.',
    exampleBody:
      'Kuesioner SKM Pelayanan Perizinan.\nBlok I identitas layanan (mudah) → Blok II penilaian aspek → Blok III saran terbuka (akhir).\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'nama_instrumen',
        label: 'Nama instrumen',
        kind: 'text',
        required: true,
      },
      {
        id: 'jenis_instrumen',
        label: 'Jenis instrumen',
        kind: 'select',
        required: true,
        options: [
          { value: 'kuesioner', label: 'Kuesioner' },
          { value: 'panduan_teknis', label: 'Panduan teknis kegiatan' },
          { value: 'formulir', label: 'Formulir / daftar isian' },
          { value: 'lainnya', label: 'Lainnya' },
        ],
      },
      {
        id: 'tujuan_instrumen',
        label: 'Tujuan instrumen',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'data_diperoleh',
        label: 'Data yang ingin diperoleh',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'urutan_blok',
        label: 'Urutan blok pertanyaan',
        kind: 'repeatableText',
        hint: 'Mulai dari pertanyaan mudah; letakkan pertanyaan sensitif/terbuka di akhir.',
      },
      {
        id: 'catatan_desain',
        label: 'Catatan desain (mis. pertanyaan ganda yang dipecah)',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-3.1-a', label: 'Draft instrumen' },
      { id: 'e-3.1-b', label: 'Catatan desain instrumen' },
      { id: 'ev-3.1-out', label: 'Instrumen (Kuesioner/Panduan Teknis Kegiatan)', pdfPage: 24 },
    ],
  },
  {
    cardId: 'gsbpm-3.2',
    title: 'Siapkan draft aturan validasi',
    explanation:
      'Tulis aturan pemeriksaan seperti “Contoh Aturan Validasi” pada materi: kondisi, tindakan/pesan perbaikan jika Error.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 26',
    disclaimer:
      'Format kerja StatPlan — bukan aturan validasi resmi BPS dan bukan mesin validasi otomatis.',
    exampleBody:
      'Nama: Jenis layanan vs penilaian aspek waktu.\nKondisi Error: jenis layanan ada isian, penilaian waktu kosong.\nPerbaikan: tanyakan kembali penilaian aspek waktu.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    pdfPage: 26,
    fields: [
      {
        id: 'rules',
        label: 'Daftar aturan validasi',
        kind: 'repeatableValidation',
        required: true,
      },
      {
        id: 'aplikasi',
        label: 'Aplikasi yang dipakai',
        kind: 'text',
        placeholder: 'mis. aplikasi CAPI, Excel, SPSS',
      },
    ],
    evidence: [
      { id: 'e-3.2-a', label: 'Draft aturan pemeriksaan' },
      { id: 'e-3.2-b', label: 'Catatan hasil review' },
    ],
    isReady: (v) => hasNamedRows(v, 'rules', 'nama'),
  },
  {
    cardId: 'gsbpm-3.3',
    title: 'Siapkan aturan tabulasi & rencana produk',
    explanation:
      'Hubungkan setiap tabel dengan kode variabel yang mengisinya (seperti Contoh Aturan Tabulasi Hal. 27), lalu catat produk diseminasi yang direncanakan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 27',
    disclaimer:
      'Format kerja StatPlan — bukan format tabulasi resmi BPS dan bukan mesin perhitungan.',
    exampleBody:
      'Tabel 1 · kolom (2) Nilai indeks ← rata-rata kode r201–r209.\nProduk: laporan ringkas + leaflet.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    pdfPage: 27,
    fields: [
      {
        id: 'tables',
        label: 'Aturan tabulasi per tabel',
        kind: 'repeatableBuildTabulation',
        required: true,
      },
      {
        id: 'produk_rencana',
        label: 'Rencana produk diseminasi',
        kind: 'multiSelect',
        options: [
          { value: 'buku', label: 'Buku' },
          { value: 'brosur', label: 'Brosur' },
          { value: 'leaflet', label: 'Leaflet' },
          { value: 'booklet', label: 'Booklet' },
          { value: 'banner', label: 'Banner' },
          { value: 'website', label: 'Tampilan website' },
        ],
      },
    ],
    evidence: [
      { id: 'e-3.3-a', label: 'Draft tabulasi' },
      { id: 'e-3.3-b', label: 'Catatan aturan pengolahan/tabulasi' },
    ],
    isReady: (v) => hasNamedRows(v, 'tables', 'nama'),
  },
  {
    cardId: 'gsbpm-3.4',
    title: 'Siapkan struktur & alur kerja',
    explanation:
      'Tulis siapa mengerjakan apa dan ke mana hasilnya diserahkan. Contoh hortikultura pada materi adalah rujukan bentuk — bukan alur wajib.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 28',
    disclaimer:
      'Format kerja StatPlan — bukan template resmi BPS. Draft Anda adalah perencanaan peran, bukan manajemen pegawai.',
    exampleBody:
      'Kegiatan: wawancara di loket · Pelaksana: petugas SKM · Hasil: isian terkirim ke server.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    pdfPage: 28,
    fields: [
      {
        id: 'workflow',
        label: 'Struktur / alur kegiatan Anda',
        kind: 'repeatableWorkflow',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-3.4-a', label: 'Draft alur kerja' },
      { id: 'e-3.4-b', label: 'Catatan pembagian peran' },
      { id: 'ev-3.4-out', label: 'Sistem alur kerja (SOP)', pdfPage: 24 },
    ],
    isReady: (v) => hasNamedRows(v, 'workflow', 'kegiatan'),
  },
  {
    cardId: 'gsbpm-3.5',
    title: 'Siapkan rencana pengujian sistem',
    explanation:
      'Daftar komponen yang diuji — sendiri-sendiri dan saat saling terhubung — beserta hasil yang diharapkan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 29',
    disclaimer: 'Ini rencana pengujian. StatPlan tidak menjalankan pengujian aplikasi Anda.',
    exampleBody:
      'Uji: kirim 5 isian dari CAPI → server · Harapan: 5 isian terbaca aplikasi pengolahan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'uji_komponen',
        label: 'Daftar pengujian',
        kind: 'repeatableRows',
        required: true,
        addLabel: '+ Tambah pengujian',
        columns: [
          { key: 'uji', label: 'Yang diuji', placeholder: 'Komponen atau interaksi antarkomponen' },
          { key: 'harapan', label: 'Hasil yang diharapkan' },
          { key: 'hasil', label: 'Hasil / catatan (diisi saat pengujian)' },
        ],
      },
    ],
    evidence: [
      { id: 'ev-3.5-a', label: 'Rencana dan catatan hasil pengujian sistem' },
      { id: 'ev-3.5-b', label: 'Daftar perbaikan dari pengujian' },
    ],
  },
  {
    cardId: 'gsbpm-3.6',
    title: 'Siapkan rencana uji coba / pilot',
    explanation:
      'Pilih lingkup uji coba sesuai materi Hal. 30 dan tuliskan tujuan serta ukuran yang ingin diperoleh.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 30',
    disclaimer: 'Ini rencana uji coba — bukan pelaksanaan pilot dan bukan data responden.',
    exampleBody:
      'Lingkup: uji coba kuesioner dan pengolahan.\nTujuan: apakah kondef “aspek pelayanan” dipahami responden.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'bagian_diuji',
        label: 'Lingkup uji coba',
        kind: 'multiSelect',
        required: true,
        options: [
          { value: 'instrumen', label: 'Uji coba kuesioner' },
          { value: 'metodologi', label: 'Uji coba metodologi' },
          { value: 'pengolahan', label: 'Uji coba pengolahan data' },
          { value: 'tabel_dummy', label: 'Dummy table' },
        ],
      },
      {
        id: 'tujuan_uji',
        label: 'Tujuan uji coba',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'temuan',
        label: 'Temuan yang perlu diperhatikan',
        kind: 'textarea',
      },
      {
        id: 'perbaikan',
        label: 'Perbaikan yang direncanakan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-3.5-a', label: 'Rencana uji coba' },
      { id: 'e-3.5-b', label: 'Catatan temuan/perbaikan' },
    ],
    isReady: (v) => {
      const parts = v.bagian_diuji
      const hasParts =
        Array.isArray(parts) && parts.some((x) => typeof x === 'string' && x.trim())
      return hasParts && hasText(v.tujuan_uji)
    },
  },
  {
    cardId: 'gsbpm-3.7',
    title: 'Siapkan finalisasi sistem produksi',
    explanation:
      'Catat dokumentasi yang sudah disusun dan status pemindahan komponen ke lingkungan produksi.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 31',
    disclaimer:
      'Finalisasi ini tidak membuka tahap berikutnya secara otomatis dan bukan persetujuan resmi BPS.',
    exampleBody:
      'Dokumentasi: panduan aplikasi SKM, daftar aturan validasi.\nPemindahan: aplikasi versi final terpasang di semua tablet.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'gsbpm-3.1', label: 'Instrumen' },
      { cardId: 'gsbpm-3.2', label: 'Aturan validasi' },
      { cardId: 'gsbpm-3.3', label: 'Aturan tabulasi' },
      { cardId: 'gsbpm-3.4', label: 'Alur kerja' },
      { cardId: 'gsbpm-3.5', label: 'Pengujian sistem' },
      { cardId: 'gsbpm-3.6', label: 'Uji coba (pilot)' },
    ],
    fields: [
      {
        id: 'dokumentasi',
        label: 'Dokumentasi yang disusun',
        kind: 'multiSelect',
        options: [
          { value: 'teknis', label: 'Dokumentasi teknis' },
          { value: 'panduan', label: 'Panduan pengguna' },
          { value: 'pedoman', label: 'Buku pedoman petugas' },
        ],
      },
      {
        id: 'status_produksi',
        label: 'Komponen sudah dipindahkan ke lingkungan produksi?',
        kind: 'select',
        options: [
          { value: 'sudah', label: 'Sudah dan berfungsi' },
          { value: 'sebagian', label: 'Sebagian' },
          { value: 'belum', label: 'Belum' },
        ],
      },
      {
        id: 'catatan_finalisasi',
        label: 'Catatan finalisasi',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'perbaikan_list',
        label: 'Hal yang masih perlu diperbaiki',
        kind: 'repeatableText',
      },
    ],
    evidence: [
      { id: 'e-3.6-a', label: 'Daftar bahan yang sudah disiapkan' },
      { id: 'e-3.6-b', label: 'Catatan perbaikan' },
      {
        id: 'ev-3.7-out',
        label: 'Sistem Pengumpulan, Pengolahan dan Diseminasi Data yang siap digunakan',
        pdfPage: 24,
      },
    ],
  },
]

export function getBuildPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_BUILD_PREPARATIONS.find((p) => p.cardId === cardId)
}
