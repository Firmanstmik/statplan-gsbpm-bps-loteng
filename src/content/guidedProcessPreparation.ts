/**
 * Slice 8 — Guided preparation for Process.
 * Working formats only. Does not process data, compute stats, or mutate Project.
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

export const GUIDED_PROCESS_PREPARATIONS: GuidedPreparationDef[] = [
  {
    cardId: 'gsbpm-5.1',
    title: 'Siapkan rencana integrasi & penerimaan data',
    explanation:
      'Catat sumber yang akan digabungkan, kunci penggabungannya, dan bagaimana penerimaan data dicatat.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 38',
    disclaimer:
      'Format kerja StatPlan. Tidak melakukan integrasi data nyata dan tidak mengunggah berkas data.',
    exampleBody:
      'Sumber: isian CAPI (internal) + daftar layanan sistem perizinan (eksternal).\nKunci: nomor tiket layanan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'sources',
        label: 'Sumber data yang akan digabungkan',
        kind: 'repeatableSource',
        required: true,
      },
      {
        id: 'dasar_penggabungan',
        label: 'Kunci / dasar penggabungan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'hal_diperhatikan',
        label: 'Cara mencatat penerimaan data',
        kind: 'textarea',
        placeholder: 'Siapa menerima, bagaimana kelengkapan jumlah diperiksa, laporan perkembangan…',
      },
    ],
    evidence: [
      { id: 'e-5.1-a', label: 'Catatan sumber data' },
      { id: 'e-5.1-b', label: 'Rencana integrasi' },
      { id: 'ev-5.1-c', label: 'Daftar penerimaan data / laporan perkembangan penerimaan' },
    ],
    isReady: (v) => hasNamedRows(v, 'sources', 'nama') && hasText(v.dasar_penggabungan),
  },
  {
    cardId: 'gsbpm-5.2',
    title: 'Siapkan draft coding',
    explanation:
      'Susun kode untuk variabel yang perlu dikode — seperti contoh materi: pilihan tertutup menjadi kode angka/huruf.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 39',
    disclaimer: 'Format kerja StatPlan — bukan standar kode resmi BPS.',
    exampleBody:
      'Variabel: penilaian aspek waktu.\nKode 1 = Tidak puas, 2 = Kurang puas, 3 = Puas, 4 = Sangat puas.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'nama_variabel',
        label: 'Nama variabel',
        kind: 'text',
        required: true,
      },
      {
        id: 'coding_rows',
        label: 'Daftar kode / kategori',
        kind: 'repeatableCoding',
        required: true,
      },
    ],
    evidence: [
      { id: 'e-5.3-a', label: 'Draft coding' },
      { id: 'e-5.3-b', label: 'Daftar kode/kategori (kaidah coding)' },
    ],
    isReady: (v) => hasText(v.nama_variabel) && hasNamedRows(v, 'coding_rows', 'kode'),
  },
  {
    cardId: 'gsbpm-5.3',
    title: 'Siapkan rencana review & validasi',
    explanation:
      'Tentukan jenis masalah yang dicari (materi: pencilan, nonresponse item, kesalahan kode), aturan yang dipakai, dan tindak lanjutnya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 40',
    disclaimer: 'Rencana pemeriksaan — StatPlan tidak menjalankan validasi terhadap data Anda.',
    exampleBody:
      'Masalah: nonresponse item · Aturan: penilaian aspek tidak boleh kosong · Tindak lanjut: kembalikan ke petugas atau lanjut ke 5.4.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'jenis_masalah',
        label: 'Masalah yang diperiksa',
        kind: 'multiSelect',
        required: true,
        options: [
          { value: 'outlier', label: 'Pencilan (outlier)' },
          { value: 'nonresponse_item', label: 'Nonresponse item' },
          { value: 'kesalahan_kode', label: 'Kesalahan pemberian kode' },
          { value: 'lainnya', label: 'Ketidaksesuaian lain' },
        ],
      },
      {
        id: 'pemeriksaan',
        label: 'Aturan pemeriksaan dan tindak lanjut',
        kind: 'repeatableRows',
        addLabel: '+ Tambah aturan',
        columns: [
          { key: 'aturan', label: 'Aturan / yang diperiksa' },
          { key: 'tindak', label: 'Tindak lanjut jika ditemukan' },
        ],
      },
      {
        id: 'validasi_saat_kumpul',
        label: 'Apakah sebagian validasi sudah berjalan saat pengumpulan (CAPI/CAWI)?',
        kind: 'select',
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum tahu' },
        ],
      },
    ],
    evidence: [
      { id: 'ev-5.3-a', label: 'Daftar aturan validasi yang dijalankan' },
      { id: 'ev-5.3-b', label: 'Catatan hasil tiap putaran validasi' },
    ],
  },
  {
    cardId: 'gsbpm-5.4',
    title: 'Siapkan rencana editing & imputasi',
    explanation:
      'Untuk setiap masalah data, tulis keputusan (tambah/ubah/hapus), metode, dan penanda (flag) yang dipakai.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 41',
    disclaimer:
      'Rencana saja — StatPlan tidak mengubah atau mengimputasi data. Pilihan metode adalah keputusan tim Anda.',
    exampleBody:
      'Masalah: penilaian biaya kosong · Keputusan: tambah nilai · Metode: disepakati tim · Flag: flag_biaya = 1.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'rencana_edit',
        label: 'Rencana editing & imputasi',
        kind: 'repeatableRows',
        required: true,
        addLabel: '+ Tambah kasus',
        columns: [
          { key: 'masalah', label: 'Masalah data', placeholder: 'tidak benar / missing / tidak wajar' },
          { key: 'keputusan', label: 'Keputusan (tambah / ubah / hapus)' },
          { key: 'metode', label: 'Metode yang dipakai' },
          { key: 'flag', label: 'Penanda (flag)' },
        ],
      },
      {
        id: 'metadata_edit',
        label: 'Metadata editing & imputasi yang akan dicatat',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'ev-5.4-a', label: 'Rencana editing dan imputasi' },
      { id: 'ev-5.4-b', label: 'Metadata proses editing dan imputasi' },
    ],
  },
  {
    cardId: 'gsbpm-5.5',
    title: 'Siapkan rencana variabel & unit turunan',
    explanation:
      'Tentukan apakah perlu variabel atau unit statistik baru, dari apa dibentuk, dan urutan penurunannya.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 42',
    disclaimer:
      'Catatan perencanaan. StatPlan tidak membentuk variabel atau unit data nyata.',
    exampleBody:
      'Variabel baru: nilai_rata dari 9 aspek; lalu kategori_mutu dari nilai_rata.\nUnit baru: tidak diperlukan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'diperlukan',
        label: 'Apakah perlu variabel atau unit baru?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya' },
          { value: 'tidak', label: 'Tidak' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'unit_asal',
        label: 'Dibentuk dari (variabel / unit asal)',
        kind: 'text',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'unit_baru',
        label: 'Variabel / unit baru',
        kind: 'text',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'dasar_pembentukan',
        label: 'Rumus / dasar pembentukan dan urutannya',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'catatan_ya',
        label: 'Catatan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['ya'] },
      },
      {
        id: 'catatan_tidak',
        label: 'Catatan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['tidak'] },
      },
      {
        id: 'catatan_belum',
        label: 'Hal yang masih perlu diputuskan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'diperlukan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-5.4-a', label: 'Catatan unit analisis' },
      { id: 'e-5.4-b', label: 'Rencana pembentukan variabel/unit baru jika relevan' },
    ],
    isReady: (v) => {
      const choice = typeof v.diperlukan === 'string' ? v.diperlukan : ''
      if (!choice) return false
      if (choice === 'ya') {
        return hasText(v.unit_asal) && hasText(v.unit_baru) && hasText(v.dasar_pembentukan)
      }
      if (choice === 'tidak') return hasText(v.catatan_tidak)
      return hasText(v.catatan_belum)
    },
  },
  {
    cardId: 'gsbpm-5.6',
    title: 'Siapkan catatan perhitungan bobot',
    explanation:
      'Tentukan apakah penimbang dihitung. Materi Hal. 43: tidak dilakukan untuk sensus/pendataan lengkap dan kompromin.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 43',
    disclaimer:
      'Catatan perencanaan saja. StatPlan tidak menghitung bobot dan tidak menyatakan bobot telah dipakai.',
    exampleBody:
      'Relevan: Ya (survei).\nDasar: jumlah pengguna layanan ÷ jumlah sampel per jenis layanan.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    educationalNote:
      'Subproses ini tidak dilakukan jika pengumpulan data dilakukan secara sensus/pendataan lengkap dan kompilasi produk administrasi (kompromin).',
    educationalNoteClass: 'A',
    educationalNotePage: 43,
    fields: [
      {
        id: 'relevan',
        label: 'Apakah penimbang dihitung?',
        kind: 'select',
        required: true,
        options: [
          { value: 'ya', label: 'Ya (survei)' },
          { value: 'tidak', label: 'Tidak (sensus / kompromin)' },
          { value: 'belum', label: 'Belum ditentukan' },
        ],
      },
      {
        id: 'dasar_weighting',
        label: 'Dasar penimbang',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'catatan_ya',
        label: 'Tolok ukur eksternal / rencana kalibrasi',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['ya'] },
      },
      {
        id: 'alasan_tidak',
        label: 'Alasan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['tidak'] },
      },
      {
        id: 'hal_diputuskan',
        label: 'Hal yang perlu diputuskan',
        kind: 'textarea',
        visibleWhen: { fieldId: 'relevan', values: ['belum'] },
      },
    ],
    evidence: [
      { id: 'e-5.5-a', label: 'Catatan relevansi penimbang' },
      { id: 'e-5.5-b', label: 'Rencana penimbang dan kalibrasi jika relevan' },
    ],
    isReady: (v) => {
      const choice = typeof v.relevan === 'string' ? v.relevan : ''
      if (!choice) return false
      if (choice === 'ya') return hasText(v.dasar_weighting)
      if (choice === 'tidak') return hasText(v.alasan_tidak)
      return hasText(v.hal_diputuskan)
    },
  },
  {
    cardId: 'gsbpm-5.7',
    title: 'Siapkan rencana perhitungan agregat',
    explanation:
      'Catat data yang diagregasi, dasar pengelompokannya, dan aktivitas Hal. 44 yang berlaku untuk kegiatan Anda.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 44',
    disclaimer: 'Format kerja StatPlan — bukan mesin agregasi dan tanpa angka hasil.',
    exampleBody:
      'Data: penilaian aspek (berbobot).\nBerdasarkan: aspek pelayanan, jenis layanan.\nOutput: Tabel 1.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    fields: [
      {
        id: 'data_dikelompokkan',
        label: 'Data yang diagregasi',
        kind: 'text',
        required: true,
      },
      {
        id: 'berdasarkan',
        label: 'Dikelompokkan berdasarkan',
        kind: 'repeatableText',
        required: true,
      },
      {
        id: 'aktivitas_agregat',
        label: 'Aktivitas yang dilakukan (Hal. 44)',
        kind: 'multiSelect',
        options: [
          { value: 'penimbang', label: 'Menggunakan penimbang (survei)' },
          { value: 'tabulasi', label: 'Menghitung data/tabulasi agregat' },
          { value: 'turunan', label: 'Menyusun data set turunan' },
          { value: 'sampling_error', label: 'Menghitung sampling error (survei)' },
          { value: 'estimasi', label: 'Melakukan estimasi (survei)' },
          { value: 'rekonsiliasi', label: 'Rekonsiliasi antarwilayah' },
        ],
      },
      {
        id: 'output_diharapkan',
        label: 'Output yang diharapkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'catatan',
        label: 'Catatan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-5.2-a', label: 'Rencana pengelompokan/agregasi' },
      { id: 'e-5.2-b', label: 'Catatan output' },
    ],
    isReady: (v) => {
      const dims = v.berdasarkan
      const hasDims = Array.isArray(dims) && dims.some((x) => typeof x === 'string' && x.trim())
      return hasText(v.data_dikelompokkan) && hasDims && hasText(v.output_diharapkan)
    },
  },
  {
    cardId: 'gsbpm-5.8',
    title: 'Siapkan penyerahan file data final',
    explanation:
      'Catat file data final yang diserahkan ke tahap Analisis, penerimanya, dan pemeriksaan terakhir sebelum diserahkan.',
    sourceType: 'A',
    sourceLabel: 'Menurut Materi Proses Bisnis · Hal. 45',
    disclaimer:
      'Catatan penyerahan — tidak membuka tahap Analisis otomatis dan bukan persetujuan resmi.',
    exampleBody:
      'File: skm_2026_final + tabel_agregat_2026 · Diserahkan ke: tim analisis · Disertai: metadata variabel.\n(Contoh ilustratif StatPlan.)',
    exampleClass: 'C',
    summaryFromCardIds: [
      { cardId: 'gsbpm-5.1', label: 'Integrasi' },
      { cardId: 'gsbpm-5.2', label: 'Coding' },
      { cardId: 'gsbpm-5.3', label: 'Review & validasi' },
      { cardId: 'gsbpm-5.4', label: 'Editing & imputasi' },
      { cardId: 'gsbpm-5.5', label: 'Variabel & unit turunan' },
      { cardId: 'gsbpm-5.6', label: 'Bobot' },
      { cardId: 'gsbpm-5.7', label: 'Agregat' },
    ],
    fields: [
      {
        id: 'file_final',
        label: 'File data final yang diserahkan',
        kind: 'textarea',
        required: true,
      },
      {
        id: 'penerima',
        label: 'Diserahkan kepada',
        kind: 'text',
      },
      {
        id: 'hal_diperiksa',
        label: 'Pemeriksaan terakhir sebelum diserahkan',
        kind: 'repeatableText',
      },
      {
        id: 'catatan_proses',
        label: 'Catatan penyerahan',
        kind: 'textarea',
      },
    ],
    evidence: [
      { id: 'e-5.6-a', label: 'Ringkasan pengolahan' },
      { id: 'e-5.6-b', label: 'Daftar pemeriksaan akhir' },
      {
        id: 'ev-5.8-out1',
        label: 'Dataset mikro atau makro, baik data final maupun sementara',
        pdfPage: 37,
      },
      { id: 'ev-5.8-out2', label: 'Metadata Statistik Variabel', pdfPage: 37 },
    ],
  },
]

export function getProcessPreparation(cardId: string): GuidedPreparationDef | undefined {
  return GUIDED_PROCESS_PREPARATIONS.find((p) => p.cardId === cardId)
}
