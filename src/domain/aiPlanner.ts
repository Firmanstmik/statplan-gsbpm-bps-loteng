import type { AiRecommendation, JenisKegiatan } from './types'

const SURVEI_KEYWORDS = [
  'survei',
  'survey',
  'sampel',
  'responden',
  'kuesioner',
  'wawancara',
  'kepuasan',
  'opini',
  'persepsi',
  'rumah tangga',
  'umkm',
  'petani',
]

const SENSUS_KEYWORDS = [
  'sensus',
  'pendataan lengkap',
  'semua unit',
  'lengkap',
  'seluruh populasi',
  'semua desa',
  'semua sekolah',
]

const KOMPROMIN_KEYWORDS = [
  'kompilasi',
  'kompromin',
  'administrasi',
  'admin',
  'register',
  'rekam medis',
  'laporan rutin',
  'data sekunder',
  'sudah tersedia',
  'portal sdi',
  'dari dinas',
  'data existing',
  'arsip',
]

function score(text: string, keywords: string[]) {
  const t = text.toLowerCase()
  return keywords.reduce((acc, kw) => (t.includes(kw) ? acc + 1 : acc), 0)
}

/**
 * Deterministic, module-grounded recommender (PDF slides 15–16, 20–21).
 * No LLM — rule-based so outputs are auditable and never hallucinate.
 */
export function recommendJenisKegiatan(input: {
  description: string
  dataAvailable?: boolean
  needCoverage?: 'sample' | 'full' | 'admin'
}): AiRecommendation {
  const text = input.description
  const sSurvei = score(text, SURVEI_KEYWORDS)
  const sSensus = score(text, SENSUS_KEYWORDS)
  const sKomp = score(text, KOMPROMIN_KEYWORDS)

  let jenis: JenisKegiatan = 'survei'
  const rationale: string[] = []
  const groundedRefs: string[] = [
    'Materi Proses Bisnis — Specify Need 1.5 (hal. 15): Pemeriksaan Ketersediaan & Kelayakan Data',
    'Materi Proses Bisnis — Design 2.3 (hal. 20): Cara Pengumpulan (Sensus / Survei / Kompromin)',
  ]

  if (input.dataAvailable === true || input.needCoverage === 'admin' || (sKomp > sSurvei && sKomp > sSensus)) {
    jenis = 'kompromin'
    rationale.push(
      'Data administratif/register yang sudah tersedia dapat memenuhi kebutuhan — kegiatan bersifat kompilasi produk administrasi (kompromin).',
    )
    rationale.push(
      'Menurut modul BPS: jika data pada portal rujukan sudah sesuai kebutuhan, kegiatan statistik bersifat kompilasi data.',
    )
    rationale.push(
      'Kerangka sampel dan perhitungan bobot tidak diperlukan untuk kompromin; fokus pada perjanjian penggunaan data (PKS/LADU) dan kualitas sumber administratif.',
    )
  } else if (input.needCoverage === 'full' || sSensus > sSurvei) {
    jenis = 'sensus'
    rationale.push(
      'Kebutuhan mencakup pendataan lengkap / seluruh unit observasi — cocok dengan sensus/pendataan lengkap.',
    )
    rationale.push(
      'Subproses kerangka sampel tidak dilakukan pada sensus lengkap (modul Design 2.4 & Collect 4.1, hal. 21 & 33).',
    )
    rationale.push(
      'Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS (Design 2.6, hal. 17 & 23).',
    )
  } else {
    jenis = 'survei'
    rationale.push(
      'Data yang tersedia belum memenuhi kebutuhan secara lengkap; pengumpulan baru melalui sampel diperlukan.',
    )
    rationale.push(
      'Survei membutuhkan kerangka sampel, metode sampling, dan kuesioner (Design 2.3–2.4, hal. 20–21).',
    )
    rationale.push(
      'Pastikan cek portal SDI/sirusa/romantik terlebih dahulu untuk menghindari duplikasi kegiatan (Specify Need 1.5, hal. 15).',
    )
  }

  const maxScore = Math.max(sSurvei, sSensus, sKomp, 1)
  const chosen =
    jenis === 'kompromin' ? sKomp : jenis === 'sensus' ? sSensus : sSurvei
  const confidence = Math.min(0.92, 0.55 + (chosen / (maxScore + 2)) * 0.35 + (input.dataAvailable !== undefined ? 0.1 : 0))

  return {
    jenis,
    confidence: Math.round(confidence * 100) / 100,
    rationale,
    groundedRefs,
  }
}

export function generateObjectives(topik: string, jenis: JenisKegiatan): string[] {
  const base = [
    `Menghasilkan data/indikator terkait ${topik} yang relevan bagi pengambilan keputusan.`,
    'Memastikan proses penyelenggaraan mengikuti kerangka GSBPM 5.2.',
  ]
  if (jenis === 'kompromin') {
    return [
      ...base,
      'Mengompilasi dan menstandarkan data administratif dari sumber yang telah diverifikasi kelayakannya.',
      'Menyusun metadata statistik kegiatan, variabel, dan indikator sesuai Perka BPS 5/2020.',
    ]
  }
  if (jenis === 'sensus') {
    return [
      ...base,
      'Melakukan pendataan lengkap pada seluruh unit observasi sesuai cakupan yang ditetapkan.',
      'Menjamin kelengkapan dan kualitas data melalui monitoring pengumpulan.',
    ]
  }
  return [
    ...base,
    'Mengumpulkan data melalui survei sampel yang representatif sesuai desain sampling.',
    'Menghasilkan estimasi dengan ukuran kesalahan sampling yang terdokumentasi.',
  ]
}

export function generateStarterVariables(topik: string) {
  const t = topik.toLowerCase()
  const common = [
    { name: 'Nama responden/unit', definition: 'Identitas unit observasi', type: 'teks' as const },
    { name: 'Wilayah', definition: 'Lokasi administratif unit observasi', type: 'kategorik' as const },
  ]
  if (t.includes('umkm') || t.includes('usaha')) {
    return [
      ...common,
      { name: 'Omzet', definition: 'Nilai penjualan dalam periode tertentu', type: 'numerik' as const, unit: 'Rp' },
      { name: 'Jumlah tenaga kerja', definition: 'Jumlah pekerja pada unit usaha', type: 'numerik' as const, unit: 'orang' },
      { name: 'Jenis usaha', definition: 'Klasifikasi kegiatan usaha', type: 'kategorik' as const },
    ]
  }
  if (t.includes('penduduk') || t.includes('kependudukan')) {
    return [
      ...common,
      { name: 'Jenis kelamin', definition: 'Jenis kelamin penduduk', type: 'kategorik' as const },
      { name: 'Usia', definition: 'Usia dalam tahun', type: 'numerik' as const, unit: 'tahun' },
      { name: 'Status pekerjaan', definition: 'Status kegiatan ketenagakerjaan', type: 'kategorik' as const },
    ]
  }
  if (t.includes('pendidikan') || t.includes('sekolah')) {
    return [
      ...common,
      { name: 'Jenjang pendidikan', definition: 'Jenjang satuan pendidikan', type: 'kategorik' as const },
      { name: 'Jumlah peserta didik', definition: 'Jumlah siswa/mahasiswa', type: 'numerik' as const, unit: 'orang' },
      { name: 'Rasio guru-murid', definition: 'Perbandingan jumlah guru terhadap murid', type: 'numerik' as const },
    ]
  }
  if (t.includes('kesehatan')) {
    return [
      ...common,
      { name: 'Jenis fasilitas', definition: 'Jenis fasilitas pelayanan kesehatan', type: 'kategorik' as const },
      { name: 'Jumlah kunjungan', definition: 'Jumlah kunjungan pasien dalam periode', type: 'numerik' as const },
      { name: 'Cakupan imunisasi', definition: 'Persentase sasaran yang diimunisasi', type: 'numerik' as const, unit: '%' },
    ]
  }
  return [
    ...common,
    { name: 'Indikator utama', definition: `Ukuran pokok terkait ${topik}`, type: 'numerik' as const },
    { name: 'Kategori unit', definition: 'Klasifikasi unit observasi', type: 'kategorik' as const },
  ]
}
