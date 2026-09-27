/**
 * Mode Terpandu — Collect learning cards (Slice 7).
 * Educational + preparation only. Does NOT run data collection.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const COLLECT_INTRO = {
  phaseId: 'collect' as const,
  title: 'Collect',
  question: 'Bagaimana data akan dikumpulkan sesuai rancangan?',
  explanation:
    'Pada tahap ini, rancangan kegiatan mulai diterapkan untuk memperoleh data sesuai metode dan instrumen yang telah disiapkan.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_COLLECT_CARDS: GuidedLearningCard[] = [
  {
    id: 'collect-4.1',
    code: '4.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyusun Kerangka dan Memilih Sampel',
    title: 'Penyiapan sampel',
    apa: 'Jika kegiatan menggunakan sampel, sebelum pengumpulan dilakukan perlu disiapkan sasaran yang akan dicakup. Tidak semua kegiatan membutuhkan sampel (misalnya sensus lengkap atau kompilasi).',
    contoh:
      'Materi Collect membahas penyiapan kerangka/sampel. Contoh di bawah hanya relevan jika kegiatan Anda berupa survei.',
    contohClass: 'A',
    pdfPage: 33,
    contohDetail: [
      {
        label: 'Apakah relevan?',
        value: 'Ya — jika kegiatan menggunakan sampel (survei). Tidak — jika sensus lengkap atau kompilasi tanpa sampel.',
      },
      {
        label: 'Sasaran yang akan dicakup (ilustratif)',
        value: 'Daftar unit/responden yang akan dicakup sesuai kerangka sampel yang disiapkan.',
      },
      {
        label: 'Sumber daftar sasaran',
        value: 'Catat sumber kerangka (bukan membuat data responden di StatPlan).',
      },
    ],
    lessonPoints: [
      'Contoh kerangka/sampel hanya masuk akal pada konteks survei.',
      'Sensus lengkap atau kompilasi sering tidak membutuhkan pemilihan sampel.',
      'StatPlan tidak menyimpan data responden nyata.',
    ],
    templateTitle: 'Format penyiapan sasaran/sampel',
    templateFields: [
      { label: 'Apakah bagian ini relevan?' },
      { label: 'Sasaran yang akan dicakup' },
      { label: 'Sumber daftar sasaran' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Daftar sasaran/sample yang akan digunakan, jika relevan',
      'Catatan sumber daftar sasaran',
    ],
    buktiClass: 'C',
  },
  {
    id: 'collect-4.2',
    code: '4.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyiapkan Pengumpulan Data',
    title: 'Petugas pelaksana',
    apa: 'Pengumpulan data perlu disiapkan siapa yang akan melaksanakan kegiatan dan apa perannya. Untuk kegiatan non-survei, materi juga menyebut persiapan perjanjian/protokol data (PKS-LADU) jika relevan.',
    contoh:
      'Materi Collect membahas penyiapan petugas. Contoh peran di bawah bersifat ilustratif StatPlan.',
    contohClass: 'A',
    pdfPage: '32–36',
    contohDetail: [
      {
        label: 'Peran (ilustratif)',
        value: 'Koordinator lapangan · Petugas pengumpul · Pemeriksa kelengkapan',
      },
      {
        label: 'Tugas (ilustratif)',
        value:
          'Koordinator: mengatur jadwal.\nPengumpul: melaksanakan pengumpulan sesuai instrumen.\nPemeriksa: memeriksa kelengkapan isian.',
      },
      {
        label: 'Catatan non-survei',
        value: 'Jika relevan, materi menyebut persiapan perjanjian/protokol data (PKS-LADU).',
      },
    ],
    lessonPoints: [
      'Tuliskan peran dan tugas sebelum pelaksanaan.',
      'Contoh peran bersifat ilustratif — sesuaikan dengan kegiatan Anda.',
      'Untuk non-survei, periksa apakah perjanjian data relevan.',
    ],
    templateTitle: 'Format peran petugas',
    templateFields: [
      { label: 'Peran' },
      { label: 'Tugas' },
      { label: 'Catatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar peran petugas', 'Catatan tugas'],
    buktiClass: 'C',
  },
  {
    id: 'collect-4.3',
    code: '4.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Melaksanakan Pengumpulan Data',
    title: 'Pelaksanaan pengumpulan',
    apa: 'Rencana pengumpulan perlu menjelaskan bagaimana kegiatan akan dilaksanakan sesuai rancangan. Mode Terpandu hanya membantu menyusun rencana — bukan menjalankan pengumpulan.',
    contoh:
      'Rencana pelaksanaan mencakup cara, instrumen, moda, dan periode — tanpa membuat catatan responden di StatPlan.',
    contohClass: 'A',
    pdfPage: '32–36',
    contohDetail: [
      { label: 'Cara pelaksanaan', value: 'Sesuai rancangan Design (mis. survei).' },
      { label: 'Instrumen yang digunakan', value: 'Draft instrumen yang sudah disiapkan di Build.' },
      { label: 'Moda', value: 'Sesuai moda yang dipilih (mis. wawancara / CAPI).' },
      { label: 'Periode pelaksanaan', value: 'Rentang waktu pengumpulan yang direncanakan.' },
    ],
    lessonPoints: [
      'Rencana harus selaras dengan cara/metode/moda di Design.',
      'StatPlan menyusun rencana — bukan menjalankan pengumpulan lapangan.',
      'Jangan memasukkan data responden ke dalam aplikasi ini.',
    ],
    templateTitle: 'Rencana pelaksanaan',
    templateFields: [
      { label: 'Cara pelaksanaan' },
      { label: 'Instrumen yang digunakan' },
      { label: 'Moda/cara memperoleh data' },
      { label: 'Periode pelaksanaan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Rencana pelaksanaan', 'Catatan periode pengumpulan'],
    buktiClass: 'C',
  },
  {
    id: 'collect-4.4',
    code: 'SP-C4',
    mappingKind: 'statplan',
    title: 'Pemantauan / pengendalian',
    apa: 'Catat bagaimana pelaksanaan akan dipantau dan masalah yang perlu segera ditangani. Ini bantuan perencanaan StatPlan — bukan dasbor pemantauan lapangan.',
    contoh:
      'Format kerja StatPlan untuk rencana pemantauan — bukan klaim subprocess resmi jika materi tidak memberi contoh spesifik.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Hal yang perlu dipantau', value: 'Kelengkapan isian · Ketercapaian sasaran · Kendala lapangan' },
      { label: 'Cara memeriksa', value: 'Review berkala catatan pelaksanaan (di luar StatPlan).' },
      {
        label: 'Tindak lanjut jika ada masalah',
        value: 'Catat masalah, penanggung jawab, dan tindakan perbaikan.',
      },
    ],
    lessonPoints: [
      'Pemantauan mencegah masalah menumpuk di akhir pengumpulan.',
      'Ini format kerja StatPlan — bukan dasbor lapangan.',
      'Fokus pada apa yang dipantau, cara cek, dan tindak lanjut.',
    ],
    templateTitle: 'Rencana pemantauan',
    templateFields: [
      { label: 'Hal yang perlu dipantau' },
      { label: 'Cara memeriksa' },
      { label: 'Tindak lanjut jika ada masalah' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Rencana pemantauan', 'Catatan penanganan masalah'],
    buktiClass: 'C',
  },
  {
    id: 'collect-4.5',
    code: '4.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi Pengumpulan',
    title: 'Finalisasi hasil pengumpulan',
    apa: 'Setelah pengumpulan selesai, hasilnya perlu diperiksa dan difinalisasi sebelum masuk ke tahap berikutnya. Ini persiapan finalisasi pengumpulan — bukan pengolahan data (Process).',
    contoh:
      'Catat apa yang dicek dan perbaikan yang masih diperlukan — tanpa mengklaim data sudah divalidasi di StatPlan.',
    contohClass: 'A',
    pdfPage: '32–36',
    contohDetail: [
      {
        label: 'Apa yang perlu diperiksa?',
        value: 'Kelengkapan bahan pengumpulan · Kesesuaian dengan rencana · Catatan masalah terbuka',
      },
      {
        label: 'Hasil pemeriksaan (struktur)',
        value: 'Lengkap / sebagian / belum — tanpa mengunggah data lapangan ke StatPlan.',
      },
      {
        label: 'Perbaikan yang masih diperlukan',
        value: 'Daftar butir yang perlu dilengkapi sebelum Process.',
      },
    ],
    lessonPoints: [
      'Finalisasi Collect ≠ pengolahan Process.',
      'Fokus pada kesiapan bahan, bukan angka hasil.',
      'Jangan mengklaim validasi data di dalam StatPlan.',
    ],
    templateTitle: 'Catatan finalisasi pengumpulan',
    templateFields: [
      { label: 'Apa yang perlu diperiksa?' },
      { label: 'Hasil pemeriksaan' },
      { label: 'Perbaikan yang masih diperlukan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan pemeriksaan hasil pengumpulan',
      'Catatan finalisasi',
    ],
    buktiClass: 'C',
  },
  {
    id: 'collect-4.6',
    code: 'SP-C6',
    mappingKind: 'statplan',
    title: 'Catatan kesiapan Collect',
    apa: 'Tinjau apakah bahan Collect sudah cukup sebagai persiapan awal. Ini ringkasan Mode Terpandu — bukan pernyataan bahwa pengumpulan telah selesai atau disetujui.',
    contoh: 'Ringkasan kesiapan Collect — dibuat StatPlan untuk pembelajaran.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Penyiapan sampel', value: 'Relevan / tidak relevan — sudah dicatat' },
      { label: 'Petugas', value: 'Peran dan tugas sudah disusun' },
      { label: 'Pelaksanaan', value: 'Rencana cara/instrumen/moda/periode sudah ada' },
      { label: 'Pemantauan', value: 'Butir pantau sudah direncanakan' },
      { label: 'Finalisasi', value: 'Checklist pemeriksaan sudah disiapkan' },
    ],
    lessonPoints: [
      'Ini ringkasan pembelajaran StatPlan — bukan bukti pengumpulan selesai.',
      'Gunakan untuk melihat celah persiapan sebelum Process.',
      'Catat risiko yang masih terbuka.',
    ],
    templateTitle: 'Ringkasan kesiapan Collect',
    templateFields: [
      { label: 'Catatan yang masih perlu disiapkan' },
      { label: 'Risiko/kendala yang perlu diperhatikan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Ringkasan kesiapan', 'Daftar hal yang masih perlu diperbaiki'],
    buktiClass: 'C',
  },
]

export function getCollectCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_COLLECT_CARDS.find((c) => c.id === id)
}
