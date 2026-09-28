/**
 * Mode Terpandu — Evaluasi (Evaluate) learning cards.
 * Three official subprocesses, Materi Proses Bisnis Hal. 60–63.
 * Educational + preparation only. Does NOT score, judge, or certify activities.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const EVALUATE_INTRO: GuidedPhaseIntro = {
  phaseId: 'evaluate',
  title: 'Evaluasi',
  officialTitle: 'Evaluate (Evaluasi)',
  question: 'Apa yang dipelajari dari kegiatan ini, dan apa yang diperbaiki pada siklus berikutnya?',
  explanation:
    'Pada tahap ini bahan evaluasi dari seluruh fase dihimpun, dianalisis menjadi laporan evaluasi, lalu disepakati rencana tindak lanjutnya.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 60–63',
  outputs: [
    'Dokumentasi Rapat/Diskusi Penyusunan Rencana Tindak Lanjut dan aksi perbaikan siklus berikutnya',
    'Tingkat kepuasan pengguna data',
  ],
  outputsPage: 60,
}

export const GUIDED_EVALUATE_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-8.1',
    code: '8.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menghimpun Bahan Evaluasi',
    title: 'Mengumpulkan bahan evaluasi',
    apa: 'Bahan evaluasi dikumpulkan dan disusun agar siap diproses tim evaluasi. Pengumpulannya bisa manual atau otomatis, dan sebaiknya berkelanjutan di setiap tahapan — bukan hanya di akhir.',
    materiPoints: [
      'Mengumpulkan dan menyusun bahan evaluasi agar siap untuk diproses oleh tim evaluasi.',
      'Pengumpulan bahan-bahan evaluasi dapat dilakukan secara manual atau otomatis serta dilakukan secara berkelanjutan pada setiap tahapan.',
      'Mengumpulkan masukan evaluasi dari seluruh fase (Hal. 60).',
    ],
    pdfPage: 61,
    contoh: 'Materi Hal. 60 menyebut empat sumber masukan evaluasi (di bawah).',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Sumber masukan evaluasi',
        kind: 'other',
        pdfPage: 60,
        items: ['Umpan balik pengguna', 'Paradata', 'Metrik sistem', 'Masukan staf'],
      },
    ],
    contohDetail: [
      { label: 'Umpan balik pengguna', value: 'Tanggapan DPMPTSP atas laporan ringkas SKM' },
      { label: 'Paradata', value: 'Durasi wawancara dan jumlah kunjungan ulang (4.4)' },
      { label: 'Metrik sistem', value: 'Jumlah Error validasi per putaran (5.3)' },
      { label: 'Masukan staf', value: 'Catatan petugas tentang kendala di loket' },
      { label: 'Cara menghimpun', value: 'Dicatat berkelanjutan sejak tahap 1, dirangkum di akhir' },
    ],
    lessonPoints: [
      'Bahan evaluasi dihimpun dari seluruh fase — bukan hanya dari hasil akhir.',
      'Empat sumber materi: umpan balik pengguna, paradata, metrik sistem, masukan staf.',
      'Mulai mencatat sejak awal agar bahan tidak hilang.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 60,
  },
  {
    id: 'gsbpm-8.2',
    code: '8.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Melakukan Evaluasi',
    title: 'Menganalisis dan menyusun laporan evaluasi',
    apa: 'Bahan evaluasi dianalisis dan dibandingkan dengan target, lalu disusun menjadi laporan evaluasi yang memuat setiap permasalahan, ketidaksesuaian kinerja dengan harapan, dan — bila perlu — rekomendasi perubahan.',
    materiPoints: [
      'Setelah bahan evaluasi dikumpulkan, bahan tersebut dianalisis dan disusun menjadi laporan evaluasi.',
      'Laporan evaluasi yang disusun harus memuat setiap permasalahan yang terjadi pada iterasi tahapan penyelenggaraan kegiatan statistik dan ketidaksesuaian antara kinerja dan harapan.',
      'Selain itu, jika diperlukan, laporan evaluasi juga memuat rekomendasi perubahan.',
      'Menganalisis hasil evaluasi dan membandingkan dengan target (Hal. 60).',
    ],
    pdfPage: 62,
    contoh:
      'SKM: laporan evaluasi mencatat target vs realisasi per tahap, masalah yang terjadi, dan rekomendasi perubahan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Target vs realisasi', value: 'Pengumpulan: target September, selesai pertengahan Oktober' },
      { label: 'Permasalahan', value: 'Antrean panjang membuat responden menolak wawancara' },
      { label: 'Ketidaksesuaian', value: 'Tingkat respon lebih rendah dari rencana' },
      { label: 'Rekomendasi perubahan', value: 'Wawancara dipindah ke area tunggu setelah layanan selesai' },
    ],
    lessonPoints: [
      'Evaluasi selalu membandingkan kinerja dengan target yang sudah ditetapkan.',
      'Laporan memuat setiap masalah — bukan hanya keberhasilan.',
      'StatPlan tidak memberi skor berhasil/gagal; isi berdasarkan bahan Anda.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-8.3',
    code: '8.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyepakati Rencana Tindak Lanjut',
    title: 'Menyepakati rencana tindak lanjut',
    apa: 'Menyusun dan mendokumentasikan rencana aksi dari hasil evaluasi, menyepakati prioritas dan penanggung jawab, lalu mendapatkan persetujuan — sebagai masukan siklus berikutnya.',
    materiPoints: [
      'Menyusun dan mendokumentasikan rencana aksi.',
      'Mendapatkan persetujuan terhadap rencana aksi yang telah disusun.',
      'Menyepakati prioritas dan penanggung jawab (Hal. 60).',
      'Menentukan mekanisme pemantauan dampak perbaikan sebagai masukan siklus berikutnya (Hal. 60).',
    ],
    pdfPage: 63,
    contoh:
      'SKM: rencana aksi dibahas dalam rapat, disepakati prioritas dan penanggung jawabnya, lalu disetujui pimpinan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Tindakan', value: 'Pindahkan wawancara ke area tunggu setelah layanan' },
      { label: 'Prioritas', value: 'Tinggi — memengaruhi tingkat respon' },
      { label: 'Penanggung jawab', value: 'Koordinator SKM' },
      { label: 'Target waktu', value: 'Sebelum SKM periode berikutnya (rencana)' },
      { label: 'Pemantauan dampak', value: 'Bandingkan tingkat respon periode berikutnya' },
      { label: 'Persetujuan', value: 'Notulen rapat RTL ditandatangani pimpinan' },
    ],
    lessonPoints: [
      'Rencana aksi harus disepakati dan disetujui — bukan sekadar daftar ide.',
      'Setiap aksi punya prioritas, penanggung jawab, dan cara memantau dampaknya.',
      'Hasilnya menjadi masukan tahap Identifikasi Kebutuhan pada siklus berikutnya.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 60,
  },
]

export function getEvaluateCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_EVALUATE_CARDS.find((c) => c.id === id)
}
