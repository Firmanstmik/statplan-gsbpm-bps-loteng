/**
 * Mode Terpandu — Analisis Data (Analyse) learning cards.
 * Five official subprocesses, Materi Proses Bisnis Hal. 46–51.
 * Educational + preparation only. Does NOT calculate statistics or fabricate results.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GSBPM_FLEXIBLE_NOTE } from '@/content/guidedPhaseNeed'

export const ANALYSE_INTRO: GuidedPhaseIntro = {
  phaseId: 'analyse',
  title: 'Analisis Data',
  officialTitle: 'Analyse (Analisis Data)',
  question: 'Bagaimana hasil pengolahan menjadi output yang layak dirilis?',
  explanation:
    'Pada tahap ini output awal disusun, divalidasi, diinterpretasi, dilindungi kerahasiaannya, lalu difinalisasi hingga disetujui untuk rilis.',
  gsbpmNote: GSBPM_FLEXIBLE_NOTE,
  pdfRange: 'Hal. 46–51',
  outputs: [
    'Output kegiatan layak digunakan sebelum diseminasi',
    'Mikro data final (sudah anonimisasi)',
    'Dokumentasi pembahasan validasi output, diskusi pra rilis, persetujuan rilis, dll',
    'Metadata Statistik Indikator',
  ],
  outputsPage: 46,
}

export const GUIDED_ANALYSE_CARDS: GuidedLearningCard[] = [
  {
    id: 'gsbpm-6.1',
    code: '6.1',
    mappingKind: 'gsbpm',
    officialTitle: 'Menyusun output awal',
    title: 'Menyusun output awal',
    apa: 'Data hasil pengolahan diubah menjadi bentuk output atau indikator yang akan ditampilkan — tabel, grafik, atau peta — sebagai draf yang akan divalidasi di subproses berikutnya.',
    materiPoints: [
      'Pada subproses ini, data mentah (raw data) hasil dari tahap pengolahan dilakukan transformasi sesuai dengan output ataupun indikator yang akan ditampilkan (berupa tabulasi/grafik/peta), sehingga dapat dilakukan penyahihan (validasi) pada subproses berikutnya.',
    ],
    pdfPage: 47,
    contoh:
      'SKM: Tabel 1 versi draf dan satu grafik batang indeks per aspek, diberi label “draf — belum divalidasi”.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Output awal 1', value: 'Tabel 1 (draf) — indeks per aspek pelayanan' },
      { label: 'Output awal 2', value: 'Grafik batang indeks per aspek' },
      { label: 'Bentuk', value: 'Tabulasi dan grafik sesuai rancangan 2.1' },
      { label: 'Status', value: 'Draf — masuk ke validasi output (6.2)' },
    ],
    lessonPoints: [
      'Output awal adalah draf untuk divalidasi, bukan hasil akhir.',
      'Bentuknya mengikuti rancangan output (2.1): tabulasi, grafik, atau peta.',
      'Tandai jelas sebagai draf agar tidak tersebar sebelum waktunya.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-6.2',
    code: '6.2',
    mappingKind: 'gsbpm',
    officialTitle: 'Validasi output',
    title: 'Memvalidasi kualitas output',
    apa: 'Memeriksa kualitas output terhadap pedoman dan target kualitas: konsistensi, cakupan dan tingkat respon, perbandingan dengan periode lalu dan sumber lain, serta kelengkapan metadata.',
    materiPoints: [
      'Memeriksa konsistensi.',
      'Memeriksa dan memastikan cakupan populasi dan tingkat respon sesuai dengan kebutuhan.',
      'Membandingkan output statistik dengan periode sebelumnya (jika ada).',
      'Memeriksa dan memastikan bahwa metadata, paradata, dan indikator kualitas tersedia dan sesuai dengan harapan.',
      'Membandingkan output statistik dengan data relevan lainnya, baik internal maupun eksternal (koherensi).',
      'Menyelidiki ketidakkonsistenan pada output statistik.',
      'Memeriksa dan melakukan penyuntingan pada tingkat agregat atau makro.',
      'Memeriksa dan memastikan bahwa output statistik telah sesuai ekspektasi dan keilmuan terkait.',
    ],
    pdfPage: 48,
    contoh:
      'SKM: tingkat respon dicek, indeks dibandingkan dengan SKM tahun lalu, dan jumlah per kantor dicocokkan dengan total.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Konsistensi', value: 'Jumlah responden per aspek sama dengan total responden?' },
      { label: 'Tingkat respon', value: 'Respon vs sampel — memenuhi kebutuhan?' },
      { label: 'Periode sebelumnya', value: 'Bandingkan dengan SKM tahun lalu (jika ada)' },
      { label: 'Koherensi', value: 'Selaras dengan data pengaduan layanan?' },
      { label: 'Tindak lanjut', value: 'Selisih besar diselidiki sebelum output dilanjutkan' },
    ],
    lessonPoints: [
      'Validasi output bekerja di tingkat agregat — berbeda dengan validasi data di 5.3.',
      'Perbandingan dengan periode lalu dan sumber lain menguji koherensi.',
      'Setiap ketidakkonsistenan diselidiki, bukan diabaikan.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 46,
  },
  {
    id: 'gsbpm-6.3',
    code: '6.3',
    mappingKind: 'gsbpm',
    officialTitle: 'Interpretasi dan penjelasan',
    title: 'Menafsirkan dan menjelaskan output',
    apa: 'Memberi pemahaman mendalam atas output: seberapa sesuai dengan ekspektasi awal, dilihat dari berbagai sudut pandang, dan bila perlu dianalisis lebih dalam.',
    materiPoints: [
      'Mengevaluasi seberapa baik output statistik tersebut mencerminkan ekspektasi (hipotesis awal).',
      'Melihat statistik dari berbagai perspektif dengan menggunakan alat dan media yang berbeda.',
      'Melakukan analisis secara mendalam, seperti analisis deret waktu, analisis dampak, analisis keterbandingan, analisis hasil revisi, analisis asimetri, dan lain-lain.',
    ],
    pdfPage: 49,
    contoh:
      'SKM: ekspektasi awal “aspek waktu paling rendah” dibandingkan dengan hasil; dijelaskan menurut jenis layanan.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Ekspektasi awal', value: 'Aspek waktu penyelesaian dinilai paling rendah' },
      { label: 'Apa yang ditunjukkan output', value: 'Ditulis setelah output tersedia — bukan diisi sekarang' },
      { label: 'Perspektif lain', value: 'Menurut jenis layanan dan menurut kantor layanan' },
      { label: 'Analisis lanjutan', value: 'Keterbandingan dengan tahun lalu (jika tersedia)' },
    ],
    lessonPoints: [
      'Tulis ekspektasi sebelum melihat hasil agar interpretasi jujur.',
      'Satu angka dibaca dari beberapa sudut pandang sebelum disimpulkan.',
      'Interpretasi menjelaskan makna — tidak mengubah angka.',
    ],
    buktiClass: 'C',
  },
  {
    id: 'gsbpm-6.4',
    code: '6.4',
    mappingKind: 'gsbpm',
    officialTitle: 'Pengendalian Kerahasiaan (Disclosure Control)',
    title: 'Menjaga kerahasiaan data',
    apa: 'Memastikan data dan metadata yang akan dipublikasikan tidak melanggar kerahasiaan. Caranya berbeda untuk setiap output — mikro data berbeda dengan tabulasi.',
    materiPoints: [
      'Penerapan disclosure control merupakan subproses untuk memastikan bahwa data dan metadata yang akan dipublikasikan tidak melanggar kerahasiaan.',
      'Penerapan disclosure control bervariasi untuk setiap output; disclosure control untuk micro data berbeda dengan untuk tabulasi.',
    ],
    pdfPage: 50,
    contoh: 'Materi memberi aturan konkret untuk data survei dan data kompilasi (di bawah).',
    contohClass: 'A',
    materiExamples: [
      {
        title: 'Disclosure control data hasil survei',
        kind: 'rule',
        items: [
          'Data individu yang disajikan harus dianonimisasi (diubah dengan sandi tertentu) terlebih dahulu.',
          'Data agregat yang unit sampelnya dapat ditelusuri/diungkap tidak dapat disajikan (misal: jumlah sampel yang kurang dari 3 unit pada suatu wilayah).',
        ],
      },
      {
        title: 'Disclosure control data hasil kompilasi',
        kind: 'rule',
        items: [
          'Data yang berpotensi sensitif dan dapat diungkap dari karakteristiknya harus dianonimkan atau dihilangkan.',
        ],
      },
    ],
    contohDetail: [
      { label: 'Mikro data SKM', value: 'Nama dan nomor tiket dihapus sebelum data dibagikan' },
      {
        label: 'Tabulasi',
        value: 'Sel “kantor layanan × jenis izin” dengan < 3 responden tidak disajikan',
      },
      { label: 'Metadata', value: 'Catat aturan kerahasiaan yang diterapkan' },
    ],
    lessonPoints: [
      'Anonimisasi untuk data individu; sel kecil (< 3 unit) untuk tabulasi.',
      'Data kompilasi pun bisa sensitif dari karakteristiknya.',
      'Terapkan sebelum output disetujui untuk rilis (6.5).',
    ],
    buktiClass: 'A',
    buktiPdfPage: 46,
  },
  {
    id: 'gsbpm-6.5',
    code: '6.5',
    mappingKind: 'gsbpm',
    officialTitle: 'Finalisasi Output',
    title: 'Memfinalisasi dan menyetujui output',
    apa: 'Pemeriksaan konsistensi terakhir, melengkapi informasi pendukung, diskusi pra-rilis dengan pakar, menyetujui konten rilis, menetapkan level penyajian dan catatan kehati-hatian, serta menyusun dokumen pendukung.',
    materiPoints: [
      'Melengkapi pemeriksaan konsistensi (pengecekan ulang konsistensi).',
      'Mengumpulkan informasi pendukung yang diperlukan, termasuk interpretasi, pendapat pakar, catatan teknis, penjelasan, ukuran ketidakpastian dan metadata lainnya.',
      'Melakukan diskusi pra-rilis dengan para ahli atau pakar di bidangnya. Menyetujui konten statistik yang akan dirilis.',
      'Menetapkan level penyajian rilis dan menyusun catatan khusus atau kondisi tertentu yang harus diperhatikan.',
      'Menyusun dokumen pendukung internal.',
      'Menerjemahkan output statistik dalam bahasa lain (jika diperlukan).',
    ],
    pdfPage: 51,
    contoh:
      'SKM: diskusi pra-rilis dengan pimpinan unit dan akademisi, lalu persetujuan konten rilis dicatat.',
    contohClass: 'C',
    contohDetail: [
      { label: 'Cek ulang konsistensi', value: 'Tabel 1 dan grafik memakai angka yang sama' },
      { label: 'Informasi pendukung', value: 'Catatan teknis, sampling error, metadata indikator' },
      { label: 'Diskusi pra-rilis', value: 'Pimpinan DPMPTSP dan satu akademisi' },
      { label: 'Level penyajian', value: 'Kabupaten dan jenis layanan; tidak per kantor' },
      { label: 'Catatan kehati-hatian', value: 'Hasil hanya menggambarkan periode survei' },
    ],
    lessonPoints: [
      'Finalisasi berakhir dengan persetujuan konten yang akan dirilis.',
      'Level penyajian dan catatan kehati-hatian ditetapkan sebelum rilis.',
      'Dokumentasi diskusi pra-rilis dan persetujuan rilis adalah output resmi tahap ini.',
    ],
    buktiClass: 'A',
    buktiPdfPage: 46,
  },
]

export function getAnalyseCard(id: string): GuidedLearningCard | undefined {
  return GUIDED_ANALYSE_CARDS.find((c) => c.id === id)
}
