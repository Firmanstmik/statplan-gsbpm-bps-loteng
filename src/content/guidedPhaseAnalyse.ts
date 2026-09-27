/**
 * Mode Terpandu — Analyse learning cards (Slice 9).
 * Educational + preparation only. Does NOT calculate statistics or fabricate results.
 */
import type { GuidedLearningCard } from '@/content/guidedPhaseNeed'

export const ANALYSE_INTRO = {
  phaseId: 'analyse' as const,
  title: 'Analyse',
  question: 'Bagaimana hasil pengolahan dianalisis menjadi informasi yang dapat digunakan?',
  explanation:
    'Pada tahap ini, hasil yang sudah diproses dianalisis untuk menghasilkan informasi yang dapat digunakan.',
  gsbpmNote:
    'Ini adalah mode panduan StatPlan. GSBPM bersifat fleksibel; Anda dapat kembali dan menyesuaikan langkah sebelumnya. Mode Terpandu bukan urutan wajib GSBPM.',
}

export const GUIDED_ANALYSE_CARDS: GuidedLearningCard[] = [
  {
    id: 'analyse-6.1',
    code: 'SP-A1',
    mappingKind: 'statplan',
    title: 'Tujuan analisis',
    apa: 'Tujuan analisis menjelaskan pertanyaan yang ingin dijawab dari hasil pengolahan. Ini berbeda dari tujuan kegiatan secara umum: di sini fokus pada apa yang ingin dibaca dari data yang sudah diproses.',
    contoh:
      'Contoh ilustratif: pertanyaan analisis dan bentuk jawaban — tanpa angka hasil fiktif.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Pertanyaan yang ingin dijawab',
        value: 'Bagaimana gambaran kepuasan masyarakat menurut aspek pelayanan?',
      },
      {
        label: 'Informasi yang ingin diperoleh',
        value: 'Aspek yang dinilai lebih rendah/tinggi relatif terhadap aspek lain (deskriptif).',
      },
      {
        label: 'Output yang akan digunakan',
        value: 'Ringkasan indikator / tabulasi sesuai rancangan — tanpa angka di StatPlan.',
      },
    ],
    lessonPoints: [
      'Tujuan analisis fokus pada apa yang dibaca dari data yang sudah diproses.',
      'Bedakan dari tujuan kegiatan di tahap Specify Need.',
      'Jangan mengisi contoh dengan angka hasil statistik.',
    ],
    templateTitle: 'Format tujuan analisis',
    templateFields: [
      { label: 'Pertanyaan yang ingin dijawab' },
      { label: 'Informasi yang ingin diperoleh' },
      { label: 'Output yang akan digunakan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: [
      'Catatan tujuan/pertanyaan analisis',
      'Daftar informasi yang ingin diperoleh',
    ],
    buktiClass: 'C',
  },
  {
    id: 'analyse-6.2',
    code: '6.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyusun Output Awal',
    title: 'Output awal',
    apa: 'Output awal digunakan untuk melihat hasil pengolahan sebelum ditetapkan sebagai output akhir. Mode Terpandu hanya membantu merencanakan output — bukan menghitung statistik.',
    contoh:
      'Struktur output awal: nama, jenis, dan apa yang ingin dilihat — tanpa angka hasil.',
    contohClass: 'A',
    pdfPage: '46–51',
    contohDetail: [
      { label: 'Nama output', value: 'Ringkasan indikator kepuasan (draf awal)' },
      { label: 'Jenis output', value: 'Tabel ringkas / gambaran indikator' },
      {
        label: 'Apa yang ingin dilihat?',
        value: 'Gambaran per aspek pelayanan dan karakteristik yang relevan.',
      },
    ],
    lessonPoints: [
      'Output awal untuk ditinjau sebelum finalisasi.',
      'Struktur lebih penting daripada angka di tahap perencanaan.',
      'StatPlan tidak menghitung statistik untuk Anda.',
    ],
    templateTitle: 'Rencana output awal',
    templateFields: [
      { label: 'Nama output' },
      { label: 'Jenis output' },
      { label: 'Apa yang ingin dilihat?' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Rencana output awal', 'Draft tabel/visual jika tersedia'],
    buktiClass: 'C',
  },
  {
    id: 'analyse-6.3',
    code: '6.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Interpretasi dan Penjelasan',
    title: 'Pemeriksaan / interpretasi output',
    apa: 'Output perlu diperiksa sebelum digunakan atau disampaikan. Di Mode Terpandu Anda menyusun pertanyaan pemeriksaan — bukan mesin kualitas statistik otomatis.',
    contoh:
      'Contoh pemeriksaan konsistensi dan cara menjelaskan hasil — tanpa hasil statistik palsu.',
    contohClass: 'C',
    contohDetail: [
      {
        label: 'Apa yang perlu diperiksa?',
        value: 'Kelengkapan tabel · Konsistensi antar-output · Kesesuaian dengan tujuan analisis',
      },
      {
        label: 'Mengapa perlu diperiksa?',
        value: 'Agar penjelasan kepada pengguna tidak bertentangan antar bagian output.',
      },
      {
        label: 'Cara menjelaskan (struktur)',
        value:
          'Jelaskan konteks · sebutkan batasan · arahkan ke keputusan yang relevan — tanpa mengarang angka.',
      },
      {
        label: 'Tindakan jika ada masalah',
        value: 'Catat temuan, perbaiki output, atau kembali ke Process bila perlu.',
      },
    ],
    lessonPoints: [
      'Validasi output memeriksa konsistensi, bukan “lolos otomatis”.',
      'Interpretasi menjelaskan makna hasil tanpa mengarang statistik.',
      'Siapkan pertanyaan pemeriksaan sebelum menyajikan ke pengguna.',
    ],
    templateTitle: 'Rencana pemeriksaan output',
    templateFields: [
      { label: 'Apa yang perlu diperiksa?' },
      { label: 'Mengapa perlu diperiksa?' },
      { label: 'Tindakan jika ada masalah' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan pemeriksaan output', 'Daftar pertanyaan review'],
    buktiClass: 'C',
  },
  {
    id: 'analyse-6.4',
    code: '6.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Pengendalian Kerahasiaan',
    title: 'Disclosure / kerahasiaan',
    apa: 'Sebelum output digunakan atau disebarluaskan, pertimbangkan apakah informasi yang ditampilkan dapat mengungkap informasi yang seharusnya tidak dibuka.',
    contoh:
      'Contoh pengendalian kerahasiaan pada Materi Proses Bisnis Hal. 50 — disajikan sebagai contoh/praktik, bukan aturan universal tunggal.',
    contohClass: 'A',
    pdfPage: 50,
    materiExamples: [
      {
        title: 'Anonimisasi data individu (survei)',
        kind: 'rule',
        note: 'Materi: data individu yang disajikan harus dianonimisasi terlebih dahulu.',
      },
      {
        title: 'Agregat dengan n < 3',
        kind: 'rule',
        note: 'Materi: agregat yang unit sampelnya dapat ditelusuri (mis. jumlah sampel < 3 pada suatu wilayah) tidak dapat disajikan.',
      },
      {
        title: 'Sensitivitas pada data kompilasi',
        kind: 'rule',
        note: 'Materi: data kompilasi yang berpotensi sensitif dan dapat diungkap dari karakteristiknya harus dianonimkan atau dihilangkan.',
      },
    ],
    materiLesson:
      'Disclosure control bervariasi untuk setiap output. Contoh di materi membedakan praktik survei dan kompilasi — bukan klaim hukum universal.',
    lessonPoints: [
      'Anonimisasi relevan untuk data individu yang akan disajikan.',
      'Agregat dengan n kecil dapat berisiko pengungkapan (contoh materi: n < 3).',
      'Data kompilasi punya pertimbangan sensitivitas tersendiri sesuai materi.',
    ],
    templateTitle: 'Catatan disclosure',
    templateFields: [
      { label: 'Apakah disclosure perlu diperhatikan?' },
      { label: 'Informasi yang perlu dilindungi' },
      { label: 'Risiko pengungkapan' },
      { label: 'Tindakan yang direncanakan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Catatan disclosure', 'Rencana perlindungan informasi'],
    buktiClass: 'C',
  },
  {
    id: 'analyse-6.5',
    code: '6.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi Output',
    title: 'Output akhir',
    apa: 'Setelah output diperiksa dan hal-hal yang perlu diperbaiki ditangani, hasil dapat disiapkan sebagai output akhir. Ini perencanaan — bukan publikasi atau penyebarluasan.',
    contoh:
      'Checklist persiapan output akhir — tanpa mengklaim hasil sudah dirilis.',
    contohClass: 'A',
    pdfPage: '46–51',
    contohDetail: [
      { label: 'Nama output', value: 'Ringkasan hasil untuk pengguna sasaran' },
      { label: 'Siapa pengguna output?', value: 'Unit/pengelola yang membutuhkan informasi' },
      { label: 'Bentuk penyajian', value: 'Tabel ringkas / laporan singkat / ringkasan indikator' },
      {
        label: 'Checklist finalisasi',
        value: 'Sudah diperiksa · Disclosure ditinjau · Siap untuk rencana Disseminate',
      },
    ],
    lessonPoints: [
      'Finalisasi output ≠ publikasi.',
      'Pastikan pemeriksaan dan disclosure sudah ditinjau.',
      'Siapkan daftar output akhir sebelum Disseminate.',
    ],
    templateTitle: 'Rencana output akhir',
    templateFields: [
      { label: 'Nama output' },
      { label: 'Siapa pengguna output?' },
      { label: 'Bentuk penyajian' },
      { label: 'Catatan finalisasi' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Daftar output akhir', 'Catatan finalisasi'],
    buktiClass: 'C',
  },
  {
    id: 'analyse-6.6',
    code: 'SP-A6',
    mappingKind: 'statplan',
    title: 'Catatan finalisasi analisis',
    apa: 'Tinjau apakah bahan Analyse sudah cukup sebagai persiapan awal. Ini ringkasan Mode Terpandu — bukan pernyataan bahwa analisis sudah selesai atau hasil sudah dihitung.',
    contoh: 'Ringkasan kesiapan Analyse — dibuat StatPlan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Tujuan analisis', value: 'Pertanyaan analisis sudah dirumuskan' },
      { label: 'Output awal', value: 'Struktur output awal sudah direncanakan' },
      { label: 'Pemeriksaan', value: 'Daftar pemeriksaan sudah disiapkan' },
      { label: 'Disclosure', value: 'Catatan kerahasiaan sudah ditinjau' },
      { label: 'Output akhir', value: 'Daftar output akhir sudah disusun' },
    ],
    lessonPoints: [
      'Ini ringkasan pembelajaran — bukan bukti analisis selesai.',
      'Catat perbaikan yang masih diperlukan sebelum Disseminate.',
    ],
    templateTitle: 'Ringkasan finalisasi analisis',
    templateFields: [
      { label: 'Catatan analisis' },
      { label: 'Hal yang masih perlu diperiksa' },
      { label: 'Perbaikan yang masih diperlukan' },
    ],
    buktiIntro: 'Yang dapat disiapkan',
    buktiItems: ['Ringkasan analisis', 'Daftar perbaikan'],
    buktiClass: 'C',
  },
]

export function getAnalyseCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_ANALYSE_CARDS.find((c) => c.id === id)
}
