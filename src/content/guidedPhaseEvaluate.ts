/**
 * Mode Terpandu — Evaluate learning cards (Slice 11).
 * Educational + preparation only. Does NOT score, judge, or certify activities.
 *
 * Card numbering (8.1–8.6) is StatPlan learning organization of Evaluate concepts,
 * not a claim of official GSBPM Evaluate sub-process codes.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const EVALUATE_INTRO = {
  phaseId: 'evaluate' as const,
  title: 'Evaluate',
  question:
    'Apa yang perlu dikumpulkan untuk mengevaluasi kegiatan, apa yang perlu diperbaiki, dan apa yang perlu direncanakan berikutnya?',
  explanation:
    'Pada tahap ini, Anda menyiapkan cara mengumpulkan masukan, meninjau pelaksanaan, dan merencanakan perbaikan — tanpa menilai skor atau menyatakan kegiatan berhasil/gagal.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_EVALUATE_CARDS: GuidedLearningCard[] = [
  {
    id: 'evaluate-8.1',
    code: '8.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menghimpun Bahan Evaluasi',
    title: 'Mengumpulkan masukan',
    apa: 'Evaluasi dimulai dengan merencanakan masukan apa yang perlu dikumpulkan. Mode Terpandu membantu merencanakan pengumpulan — bukan menjalankan survei umpan balik.',
    contoh:
      'Bahan evaluasi: feedback, paradata, metrics, staff feedback — sebagai rencana, bukan data yang sudah terkumpul di StatPlan.',
    contohClass: 'A',
    pdfPage: '60–63',
    materiExamples: [
      { title: 'Feedback pengguna', kind: 'other', note: 'Masukan dari pengguna hasil.' },
      { title: 'Paradata', kind: 'other', note: 'Catatan proses pelaksanaan (bila relevan).' },
      { title: 'Metrics', kind: 'other', note: 'Ukuran proses/hasil yang sudah disepakati.' },
      { title: 'Staff feedback', kind: 'other', note: 'Catatan dari pelaksana/staf.' },
    ],
    materiLesson:
      'Rencanakan sumber masukan sebelum menilai. StatPlan tidak mengumpulkan umpan balik otomatis.',
    lessonPoints: [
      'Siapkan beragam sumber masukan — bukan hanya satu jenis.',
      'Ini rencana menghimpun bahan, bukan hasil evaluasi jadi.',
      'Jangan mengisi angka evaluasi fiktif.',
    ],
    templateTitle: 'Rencana pengumpulan masukan',
    templateFields: [
      { label: 'Sumber masukan' },
      { label: 'Hal yang ingin dikumpulkan' },
      { label: 'Cara memperoleh masukan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan sumber masukan', 'Rencana cara memperoleh masukan'],
    buktiClass: 'C',
  },
  {
    id: 'evaluate-8.2',
    code: 'SP-E2',
    mappingKind: 'statplan',
    title: 'Menentukan hal yang dievaluasi',
    apa: 'Tentukan aspek kegiatan yang ingin ditinjau. Ini daftar fokus evaluasi — bukan skor otomatis dan bukan penilaian resmi.',
    contoh:
      'Bandingkan hasil dengan target — struktur evaluasi, bukan skor palsu.',
    contohClass: 'A',
    pdfPage: '60–63',
    contohDetail: [
      { label: 'Aspek yang dievaluasi', value: 'Ketepatan waktu · Kelengkapan output · Kejelasan produk' },
      { label: 'Alasan', value: 'Aspek ini memengaruhi apakah hasil dapat dipakai pengguna.' },
      {
        label: 'Informasi yang diperlukan',
        value: 'Catatan jadwal vs realisasi · Daftar output · Masukan pengguna',
      },
    ],
    lessonPoints: [
      'Tentukan aspek sebelum menulis temuan.',
      'Evaluasi membandingkan hasil dengan target/rencana.',
      'StatPlan tidak memberi skor otomatis.',
    ],
    templateTitle: 'Aspek yang dievaluasi',
    templateFields: [
      { label: 'Aspek yang dievaluasi' },
      { label: 'Alasan' },
      { label: 'Informasi yang diperlukan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar aspek evaluasi', 'Catatan informasi yang diperlukan'],
    buktiClass: 'C',
  },
  {
    id: 'evaluate-8.3',
    code: '8.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Melakukan Evaluasi',
    title: 'Menilai pelaksanaan dan hasil',
    apa: 'Siapkan catatan observasi untuk meninjau pelaksanaan dan hasil. Ini persiapan evaluasi — bukan penilaian otomatis dan bukan kesimpulan berhasil/gagal.',
    contoh:
      'Struktur observasi: berjalan baik · kendala · temuan — diisi sendiri, tanpa hasil evaluasi palsu.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Hal yang berjalan baik (struktur)',
        value: 'Tuliskan sendiri apa yang sesuai rencana — jangan mengarang angka keberhasilan.',
      },
      {
        label: 'Kendala (struktur)',
        value: 'Catat hambatan pelaksanaan atau kualitas bahan.',
      },
      {
        label: 'Temuan vs target',
        value: 'Bandingkan realisasi dengan target yang sudah disepakati.',
      },
      {
        label: 'Dampak terhadap kegiatan',
        value: 'Jelaskan dampak singkat terhadap output/pengguna.',
      },
    ],
    lessonPoints: [
      'Gunakan struktur observasi, bukan skor otomatis.',
      'Bandingkan dengan target — jangan mengarang hasil statistik.',
      'StatPlan tidak menilai berhasil/gagal untuk Anda.',
    ],
    templateTitle: 'Persiapan evaluasi (observasi)',
    templateFields: [
      { label: 'Hal yang berjalan baik' },
      { label: 'Kendala' },
      { label: 'Temuan' },
      { label: 'Dampak terhadap kegiatan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan observasi pelaksanaan', 'Catatan temuan (input Anda)'],
    buktiClass: 'C',
  },
  {
    id: 'evaluate-8.4',
    code: 'SP-E4',
    mappingKind: 'statplan',
    title: 'Mengidentifikasi perbaikan',
    apa: 'Ubah observasi menjadi usulan perbaikan. Prioritas diisi oleh Anda — StatPlan tidak menentukan prioritas yang “benar”.',
    contoh:
      'Dari temuan ke usulan perbaikan — struktur, bukan rekomendasi resmi.',
    contohClass: 'A',
    pdfPage: '60–63',
    contohDetail: [
      { label: 'Masalah / temuan', value: 'Keterlambatan jadwal pada satu tahap' },
      { label: 'Usulan perbaikan', value: 'Perjelas alur komunikasi dan titik peninjauan mingguan' },
      { label: 'Prioritas', value: 'Diisi sendiri (tinggi / sedang / rendah)' },
      { label: 'Penanggung jawab', value: 'Unit/orang yang Anda tetapkan' },
    ],
    lessonPoints: [
      'Setiap temuan idealnya punya usulan perbaikan.',
      'Prioritas diisi pengguna — bukan oleh StatPlan.',
      'Ini usulan kerja, bukan approval.',
    ],
    templateTitle: 'Usulan perbaikan',
    templateFields: [
      { label: 'Masalah / temuan' },
      { label: 'Usulan perbaikan' },
      { label: 'Prioritas' },
      { label: 'Penanggung jawab' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar usulan perbaikan', 'Catatan prioritas (rencana Anda)'],
    buktiClass: 'C',
  },
  {
    id: 'evaluate-8.5',
    code: '8.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyepakati Rencana Tindak Lanjut',
    title: 'Rencana tindak lanjut',
    apa: 'Susun rencana aksi dari usulan perbaikan. Target waktu adalah tanggal rencana — bukan bukti bahwa tindakan sudah selesai.',
    contoh:
      'Struktur tindak lanjut: tindakan · prioritas · penanggung jawab · monitoring.',
    contohClass: 'A',
    pdfPage: '60–63',
    contohDetail: [
      { label: 'Tindakan', value: 'Perbarui daftar peran dan titik peninjauan jadwal' },
      { label: 'Tujuan', value: 'Mengurangi keterlambatan koordinasi' },
      { label: 'Penanggung jawab', value: 'Koordinator kegiatan (rencana Anda)' },
      { label: 'Target waktu', value: 'Tanggal rencana — bukan bukti selesai' },
      { label: 'Monitoring', value: 'Cek status di tinjauan berikutnya (Direncanakan)' },
    ],
    lessonPoints: [
      'Tindak lanjut memuat tindakan, penanggung jawab, dan monitoring.',
      'Status “Direncanakan” ≠ sudah dilaksanakan.',
      'Jangan membuat hasil evaluasi palsu sebagai bukti.',
    ],
    templateTitle: 'Rencana tindak lanjut',
    templateFields: [
      { label: 'Tindakan' },
      { label: 'Tujuan' },
      { label: 'Penanggung jawab' },
      { label: 'Target waktu' },
      { label: 'Status rencana' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar tindakan rencana', 'Catatan target waktu (rencana)'],
    buktiClass: 'C',
  },
  {
    id: 'evaluate-8.6',
    code: 'SP-E6',
    mappingKind: 'statplan',
    title: 'Catatan finalisasi Evaluate',
    apa: 'Tinjau bahan Evaluate sebagai draf perencanaan evaluasi dan tindak lanjut. Persiapan Evaluate selesai dipelajari — bukan evaluasi kegiatan selesai, dan bukan kegiatan dinyatakan berhasil.',
    contoh: 'Ringkasan persiapan Evaluate — dibuat StatPlan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Masukan', value: 'Sumber masukan sudah direncanakan' },
      { label: 'Aspek', value: 'Fokus evaluasi sudah ditentukan' },
      { label: 'Observasi', value: 'Struktur catatan siap diisi' },
      { label: 'Perbaikan', value: 'Usulan perbaikan sudah disusun' },
      { label: 'Tindak lanjut', value: 'Rencana aksi & monitoring ada' },
    ],
    lessonPoints: [
      'Ini ringkasan pembelajaran — bukan sertifikasi berhasil.',
      'Catat hal yang masih terbuka untuk siklus berikutnya.',
    ],
    templateTitle: 'Ringkasan finalisasi Evaluate',
    templateFields: [
      { label: 'Catatan finalisasi' },
      { label: 'Hal yang masih terbuka' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Ringkasan persiapan evaluasi', 'Daftar catatan terbuka'],
    buktiClass: 'C',
  },
]

export function getEvaluateCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_EVALUATE_CARDS.find((c) => c.id === id)
}
