import type { Project } from '@/domain/types'
import { buildChecklistAtPct } from './checklist'
import {
  metaDukcapil,
  metaPadi,
  metaPendidikan,
  metaSkm,
  metaUmkm,
} from './metadata'
import { qPadi, qSkm, qUmkm } from './questionnaires'
import {
  buildKomprominTimeline,
  buildSensusTimeline,
  buildSurveiTimeline,
} from './timeline'
import {
  indDukcapil,
  indPadi,
  indPendidikan,
  indSkm,
  indUmkm,
  varsDukcapil,
  varsPadi,
  varsPendidikan,
  varsSkm,
  varsUmkm,
} from './variables'

/**
 * Five realistic OPD projects for BPS Lombok Tengah demonstration.
 * Target progress (approx): 98%, 67%, 42%, 100%, 85%
 */
export function buildDemoProjects(): Project[] {
  const now = new Date()
  const daysAgo = (d: number) => {
    const x = new Date(now)
    x.setDate(x.getDate() - d)
    return x.toISOString()
  }

  const skm: Project = {
    id: 'demo-skm-dpmptsp-2026',
    name: 'Survei Kepuasan Masyarakat Pelayanan Perizinan DPMPTSP 2026',
    description:
      'Survei untuk mengukur Indeks Kepuasan Masyarakat (IKM) terhadap pelayanan perizinan di Dinas Penanaman Modal dan PTSP Kabupaten Lombok Tengah, sebagai bahan evaluasi standar pelayanan publik.',
    topik: 'kepuasan pelayanan publik',
    klasifikasi: 'sektoral',
    jenisKegiatan: 'survei',
    aiRecommendation: {
      jenis: 'survei',
      confidence: 0.91,
      rationale: [
        'Data kepuasan layanan belum tersedia di portal rujukan; diperlukan pengumpulan baru melalui sampel pengguna layanan.',
        'Survei membutuhkan kerangka sampel, kuesioner, dan metode sampling sesuai Design 2.3–2.4.',
        'Sebagai statistik sektoral, bahan pengajuan rekomendasi kegiatan ke BPS perlu disiapkan (Design 2.6).',
      ],
      groundedRefs: [
        'Materi Proses Bisnis — Specify Need 1.5 (hal. 15)',
        'Materi Proses Bisnis — Design 2.3 (hal. 20)',
      ],
    },
    objectives: [
      'Mengukur tingkat kepuasan masyarakat terhadap sembilan unsur pelayanan perizinan DPMPTSP.',
      'Menghasilkan Indeks Kepuasan Masyarakat (IKM) sebagai bahan evaluasi kinerja pelayanan publik.',
      'Menyusun rekomendasi perbaikan standar pelayanan berdasarkan temuan survei.',
    ],
    variables: varsSkm,
    indicators: indSkm,
    timeline: buildSurveiTimeline('skm'),
    questionnaire: qSkm,
    design: {
      caraPengumpulan: 'survei',
      metodePengumpulan: 'wawancara',
      modaPengumpulan: 'capi',
      metodeSampling: 'Systematic sampling dari antrian pengguna layanan (probability)',
      ukuranSampel: '384 responden (margin error 5%, tingkat keyakinan 95%)',
    },
    portalSdi: {
      checked: true,
      sirusaChecked: true,
      romantikChecked: true,
      notes:
        'Tidak ditemukan kegiatan SKM sejenis pada sirusa/romantik untuk DPMPTSP Loteng tahun 2026. Survei baru diperlukan.',
      checkedAt: daysAgo(40),
    },
    rekomendasiBps: {
      namaKegiatan: 'Survei Kepuasan Masyarakat Pelayanan Perizinan DPMPTSP 2026',
      penyelenggara: 'DPMPTSP Kabupaten Lombok Tengah',
      tujuan: 'Mengukur IKM pelayanan perizinan untuk evaluasi standar pelayanan publik.',
      periode: 'Maret–Agustus 2026',
      catatan: 'Draf rekomendasi telah disusun; menunggu pengajuan resmi ke BPS.',
    },
    metadata: metaSkm(),
    checklistState: buildChecklistAtPct('survei', 'sektoral', 98),
    currentPhaseId: 'disseminate',
    status: 'ready_for_review',
    createdAt: daysAgo(55),
    updatedAt: daysAgo(2),
  }

  const umkm: Project = {
    id: 'demo-umkm-koperasi-2026',
    name: 'Pendataan UMKM Kabupaten Lombok Tengah 2026',
    description:
      'Pendataan lengkap unit usaha mikro, kecil, dan menengah di seluruh desa/kelurahan untuk memperbarui basis data UMKM Dinas Koperasi dan UKM Kabupaten Lombok Tengah.',
    topik: 'UMKM',
    klasifikasi: 'sektoral',
    jenisKegiatan: 'sensus',
    aiRecommendation: {
      jenis: 'sensus',
      confidence: 0.88,
      rationale: [
        'Kebutuhan mencakup pendataan lengkap seluruh unit UMKM di wilayah kabupaten.',
        'Subproses kerangka sampel tidak dilakukan pada pendataan lengkap (Design 2.4 & Collect 4.1).',
        'Penyelenggara statistik sektoral perlu menyiapkan bahan pengajuan rekomendasi kegiatan ke BPS.',
      ],
      groundedRefs: [
        'Materi Proses Bisnis — Design 2.3 (hal. 20)',
        'Materi Proses Bisnis — Design 2.4 (hal. 21)',
      ],
    },
    objectives: [
      'Memperoleh data lengkap UMKM di seluruh desa/kelurahan Kabupaten Lombok Tengah.',
      'Memetakan sebaran UMKM menurut jenis usaha, skala, dan status legalitas.',
      'Menyediakan basis data untuk perencanaan pemberdayaan dan penyaluran bantuan.',
    ],
    variables: varsUmkm,
    indicators: indUmkm,
    timeline: buildSensusTimeline('umkm'),
    questionnaire: qUmkm,
    design: {
      caraPengumpulan: 'sensus',
      metodePengumpulan: 'wawancara',
      modaPengumpulan: 'capi',
      metodeSampling: '',
      ukuranSampel: 'Pendataan lengkap (seluruh unit UMKM)',
    },
    portalSdi: {
      checked: true,
      sirusaChecked: true,
      romantikChecked: true,
      notes:
        'Data UMKM partial tersedia di sistem dinas, namun belum lengkap untuk seluruh desa. Diputuskan pendataan lengkap.',
      checkedAt: daysAgo(70),
    },
    rekomendasiBps: {
      namaKegiatan: 'Pendataan UMKM Kabupaten Lombok Tengah 2026',
      penyelenggara: 'Dinas Koperasi dan UKM Kabupaten Lombok Tengah',
      tujuan: 'Memperbarui basis data UMKM untuk pemberdayaan dan perencanaan ekonomi lokal.',
      periode: 'Januari–Oktober 2026',
      catatan: 'Rekomendasi sedang dalam proses penyusunan surat pengajuan.',
    },
    metadata: metaUmkm(),
    checklistState: buildChecklistAtPct('sensus', 'sektoral', 67),
    currentPhaseId: 'collect',
    status: 'in_progress',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(5),
  }

  const dukcapil: Project = {
    id: 'demo-dukcapil-kompromin-2026',
    name: 'Integrasi Data Kependudukan untuk Statistik Sektoral 2026',
    description:
      'Kompilasi produk administrasi kependudukan dari SIAK Disdukcapil untuk menghasilkan statistik kependudukan sektoral yang dapat digunakan OPD dan publikasi daerah.',
    topik: 'kependudukan',
    klasifikasi: 'sektoral',
    jenisKegiatan: 'kompromin',
    aiRecommendation: {
      jenis: 'kompromin',
      confidence: 0.94,
      rationale: [
        'Data administratif kependudukan sudah tersedia di SIAK dan memenuhi kebutuhan indikator.',
        'Kerangka sampel dan perhitungan bobot tidak diperlukan untuk kompromin.',
        'Fokus pada PKS/LADU, validasi kualitas sumber, dan metadata statistik kegiatan.',
      ],
      groundedRefs: [
        'Materi Proses Bisnis — Specify Need 1.5 (hal. 15)',
        'Materi Proses Bisnis — Design 2.3 (hal. 20)',
      ],
    },
    objectives: [
      'Mengompilasi data kependudukan dari SIAK menjadi statistik siap analisis.',
      'Menghasilkan indikator kependudukan (jumlah penduduk, pertumbuhan, rasio jenis kelamin).',
      'Menyediakan metadata MS-Keg/MS-Var/MS-Ind sesuai Perka BPS 5/2020.',
    ],
    variables: varsDukcapil,
    indicators: indDukcapil,
    timeline: buildKomprominTimeline('duk'),
    questionnaire: [],
    design: {
      caraPengumpulan: 'kompromin',
      metodePengumpulan: '',
      modaPengumpulan: '',
      metodeSampling: '',
      ukuranSampel: '',
    },
    portalSdi: {
      checked: true,
      sirusaChecked: true,
      romantikChecked: true,
      notes:
        'Data kependudukan tersedia di SIAK. Kegiatan bersifat kompilasi; PKS internal Disdukcapil–BPS Loteng sedang disusun.',
      checkedAt: daysAgo(25),
    },
    rekomendasiBps: {
      namaKegiatan: 'Integrasi Data Kependudukan untuk Statistik Sektoral 2026',
      penyelenggara: 'Disdukcapil Kabupaten Lombok Tengah',
      tujuan: 'Menghasilkan statistik kependudukan dari data administratif SIAK.',
      periode: 'Januari–Juni 2026',
      catatan: 'Draft rekomendasi belum final — menunggu kelengkapan PKS.',
    },
    metadata: metaDukcapil(),
    checklistState: (() => {
      const state = buildChecklistAtPct('kompromin', 'sektoral', 44)
      // Mid-progress: rekomendasi BPS belum dicentang — menampilkan metrik dashboard
      state['de-12'] = false
      return state
    })(),
    currentPhaseId: 'design',
    status: 'in_progress',
    createdAt: daysAgo(35),
    updatedAt: daysAgo(1),
  }

  const padi: Project = {
    id: 'demo-padi-pertanian-2026',
    name: 'Survei Produksi Padi Kabupaten Lombok Tengah 2026',
    description:
      'Survei untuk mengestimasi luas tanam, luas panen, produksi, dan produktivitas padi pada musim tanam 2026 sebagai dasar perencanaan ketahanan pangan daerah.',
    topik: 'produksi padi',
    klasifikasi: 'sektoral',
    jenisKegiatan: 'survei',
    aiRecommendation: {
      jenis: 'survei',
      confidence: 0.9,
      rationale: [
        'Estimasi produksi memerlukan sampel lahan/petani; data administratif belum mencukupi untuk seluruh indikator.',
        'Survei membutuhkan kerangka sampel dan metode sampling (Design 2.4).',
        'Statistik sektoral perlu menyiapkan bahan pengajuan rekomendasi kegiatan ke BPS.',
      ],
      groundedRefs: [
        'Materi Proses Bisnis — Design 2.3–2.4 (hal. 20–21)',
      ],
    },
    objectives: [
      'Mengestimasi luas tanam dan luas panen padi per musim tanam.',
      'Menghitung produksi dan produktivitas padi tingkat kabupaten.',
      'Menyediakan data pendukung perencanaan ketahanan pangan daerah.',
    ],
    variables: varsPadi,
    indicators: indPadi,
    timeline: buildSurveiTimeline('padi'),
    questionnaire: qPadi,
    design: {
      caraPengumpulan: 'survei',
      metodePengumpulan: 'wawancara',
      modaPengumpulan: 'capi',
      metodeSampling: 'Stratified random sampling menurut kecamatan penghasil padi',
      ukuranSampel: '240 petani (strata 8 kecamatan × 30 sampel)',
    },
    portalSdi: {
      checked: true,
      sirusaChecked: true,
      romantikChecked: true,
      notes:
        'BPS pusat memiliki Survei Pertanian; kegiatan ini bersifat sektoral daerah untuk kebutuhan perencanaan Loteng dan telah dikonsultasikan agar tidak menduplikasi.',
      checkedAt: daysAgo(90),
    },
    rekomendasiBps: {
      namaKegiatan: 'Survei Produksi Padi Kabupaten Lombok Tengah 2026',
      penyelenggara: 'Dinas Pertanian Kabupaten Lombok Tengah',
      tujuan: 'Estimasi produksi dan produktivitas padi untuk ketahanan pangan daerah.',
      periode: 'Februari–September 2026',
      catatan: 'Bahan pengajuan rekomendasi sudah disiapkan; status pengajuan ke BPS belum diverifikasi.',
    },
    metadata: metaPadi(),
    checklistState: buildChecklistAtPct('survei', 'sektoral', 100),
    currentPhaseId: 'evaluate',
    status: 'ready_for_review',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(3),
  }

  const pendidikan: Project = {
    id: 'demo-sarana-pendidikan-2026',
    name: 'Kompilasi Data Sarana dan Prasarana Pendidikan 2026',
    description:
      'Kompilasi data sarana pendidikan dari Dapodik dan pelaporan Dinas Pendidikan untuk perencanaan rehabilitasi sekolah dan pemerataan akses pendidikan di Kabupaten Lombok Tengah.',
    topik: 'sarana pendidikan',
    klasifikasi: 'sektoral',
    jenisKegiatan: 'kompromin',
    aiRecommendation: {
      jenis: 'kompromin',
      confidence: 0.93,
      rationale: [
        'Data satuan pendidikan sudah tersedia di Dapodik; kegiatan bersifat kompilasi dan validasi.',
        'Kerangka sampel tidak diperlukan; fokus pada kualitas data administratif dan metadata.',
        'PKS/LADU dengan pengelola Dapodik perlu dipastikan sebelum ekstraksi data.',
      ],
      groundedRefs: [
        'Materi Proses Bisnis — Specify Need 1.5 (hal. 15)',
        'Materi Proses Bisnis — Collect 4.2 (hal. 33–34)',
      ],
    },
    objectives: [
      'Mengompilasi data sarana dan prasarana seluruh satuan pendidikan.',
      'Mengidentifikasi sekolah dengan bangunan rusak untuk prioritas rehabilitasi.',
      'Menghitung rasio murid–guru sebagai indikator pemerataan tenaga pendidik.',
    ],
    variables: varsPendidikan,
    indicators: indPendidikan,
    timeline: buildKomprominTimeline('pend'),
    questionnaire: [],
    design: {
      caraPengumpulan: 'kompromin',
      metodePengumpulan: '',
      modaPengumpulan: '',
      metodeSampling: '',
      ukuranSampel: '',
    },
    portalSdi: {
      checked: true,
      sirusaChecked: true,
      romantikChecked: true,
      notes:
        'Data utama bersumber Dapodik. Tidak ada duplikasi kegiatan sejenis di romantik untuk Loteng 2026.',
      checkedAt: daysAgo(45),
    },
    rekomendasiBps: {
      namaKegiatan: 'Kompilasi Data Sarana dan Prasarana Pendidikan 2026',
      penyelenggara: 'Dinas Pendidikan Kabupaten Lombok Tengah',
      tujuan: 'Menyusun statistik sarana pendidikan untuk perencanaan rehabilitasi sekolah.',
      periode: 'Januari–Mei 2026',
      catatan: 'Rekomendasi siap diajukan.',
    },
    metadata: metaPendidikan(),
    checklistState: buildChecklistAtPct('kompromin', 'sektoral', 85),
    currentPhaseId: 'analyse',
    status: 'in_progress',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(4),
  }

  return [skm, umkm, dukcapil, padi, pendidikan]
}
