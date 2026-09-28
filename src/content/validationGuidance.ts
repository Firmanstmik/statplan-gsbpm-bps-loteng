/**
 * Review guidance for validation issues: short title, why it matters, how to fix.
 * UI copy only — the rules themselves live in src/domain/validation.ts.
 * This is StatPlan’s review, never an official BPS validation.
 */
export type ValidationGuidance = {
  title: string
  why: string
  fix: string
  cta: string
}

export const VALIDATION_GUIDANCE: Record<string, ValidationGuidance> = {
  portal_sdi: {
    title: 'Pemeriksaan portal rujukan belum dicatat',
    why: 'Materi Hal. 15 meminta ketersediaan data dicek dulu agar tidak terjadi duplikasi kegiatan statistik.',
    fix: 'Catat hasil pengecekan SIRuSa dan Romantik (serta Portal SDI bila relevan) di Alur kerja.',
    cta: 'Buka pemeriksaan portal',
  },
  checklist_incomplete: {
    title: 'Checklist wajib belum mencapai 80%',
    why: 'Draf hanya bermakna bila sebagian besar subproses GSBPM yang wajib sudah disiapkan.',
    fix: 'Tandai butir checklist yang sudah benar-benar Anda siapkan, fase demi fase.',
    cta: 'Buka checklist',
  },
  jenis_undocumented: {
    title: 'Keputusan jenis kegiatan belum ditandai',
    why: 'Survei, sensus, atau kompilasi menentukan apakah sampel dan penimbang diperlukan.',
    fix: 'Tandai butir keputusan jenis kegiatan (1.5) setelah pemeriksaan data.',
    cta: 'Buka alur kerja',
  },
  rekomendasi_required: {
    title: 'Persiapan rekomendasi BPS belum ditandai',
    why: 'Penyelenggara statistik sektoral mengajukan rekomendasi kegiatan statistik ke BPS (Materi Hal. 17 & 23).',
    fix: 'Lengkapi draf rekomendasi di Alur kerja, lalu tandai butir 2.6.',
    cta: 'Buka rekomendasi',
  },
  rekomendasi_form: {
    title: 'Formulir draf rekomendasi belum lengkap',
    why: 'Nama kegiatan dan penyelenggara diperlukan agar draf rekomendasi dapat ditinjau.',
    fix: 'Isi nama kegiatan dan penyelenggara pada formulir rekomendasi.',
    cta: 'Buka rekomendasi',
  },
  metadata_keg: {
    title: 'Metadata kegiatan (MS-Keg) belum lengkap',
    why: 'Data statistik perlu metadata dengan struktur baku (Materi Hal. 58–59).',
    fix: 'Lengkapi kolom wajib Metadata Statistik Kegiatan.',
    cta: 'Buka metadata',
  },
  metadata_var: {
    title: 'Metadata variabel (MS-Var) belum lengkap',
    why: 'Setiap variabel perlu dokumentasi agar data dapat dipahami dan dipakai ulang.',
    fix: 'Lengkapi kolom wajib Metadata Statistik Variabel.',
    cta: 'Buka metadata',
  },
  metadata_ind: {
    title: 'Metadata indikator (MS-Ind) belum lengkap',
    why: 'Indikator perlu dokumentasi dasar pembentukannya sebelum disajikan.',
    fix: 'Lengkapi kolom wajib Metadata Statistik Indikator.',
    cta: 'Buka metadata',
  },
  no_variables: {
    title: 'Belum ada variabel',
    why: 'Variabel adalah dasar instrumen dan tabel output (Merancang Variabel, 2.2).',
    fix: 'Tambahkan variabel yang dibutuhkan output Anda.',
    cta: 'Buka variabel',
  },
  variable_def: {
    title: 'Ada variabel tanpa definisi',
    why: 'Definisi yang sama untuk semua pihak mencegah salah tafsir saat pengumpulan.',
    fix: 'Lengkapi definisi setiap variabel.',
    cta: 'Buka variabel',
  },
  design_cara: {
    title: 'Cara/metode/moda belum lengkap',
    why: 'Rancangan pengumpulan menentukan instrumen, petugas, dan jadwal (Merancang Pengumpulan Data, 2.3).',
    fix: 'Pilih cara, metode, dan moda pengumpulan data.',
    cta: 'Buka perancangan',
  },
  no_questionnaire: {
    title: 'Belum ada pertanyaan instrumen',
    why: 'Instrumen diperlukan untuk memperoleh data sesuai rancangan (3.1).',
    fix: 'Tambahkan pertanyaan pada instrumen.',
    cta: 'Buka instrumen',
  },
  sampling_design: {
    title: 'Rancangan sampel belum ditandai',
    why: 'Survei memerlukan kerangka dan metode sampling (Merancang Kerangka Sampel, 2.4).',
    fix: 'Lengkapi rancangan sampling di Perancangan.',
    cta: 'Buka perancangan',
  },
}

export function guidanceFor(code: string, message: string): ValidationGuidance {
  return (
    VALIDATION_GUIDANCE[code] ?? {
      title: message,
      why: '',
      fix: '',
      cta: 'Buka',
    }
  )
}
