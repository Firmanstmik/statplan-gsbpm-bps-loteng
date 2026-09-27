/**
 * Landing example cards (Slice B) — presentation only.
 * Demo projects are StatPlan illustrations (Type C), not PDF examples.
 */
import type { JenisKegiatan } from '@/domain/types'

export type ContentClassification = 'A' | 'B' | 'C' | 'D'

export type LandingExampleCard = {
  /** Walkthrough slug → /contoh/:slug */
  slug: string
  /** Existing demo project id — secondary “open workspace” only */
  projectId: string
  /** Shorter card title for beginners */
  title: string
  purpose: string
  jenis: JenisKegiatan
  /** One-line planned result preview */
  resultPreview: string
  /** Always C for these landing cards */
  classification: 'C'
  classificationLabel: string
}

/**
 * Max 3 cards: Survei · Sensus · Kompromin.
 * Content is illustrative StatPlan demo narrative — not from Materi Proses Bisnis.pdf.
 */
export const LANDING_EXAMPLES: LandingExampleCard[] = [
  {
    slug: 'skm',
    projectId: 'demo-skm-dpmptsp-2026',
    title: 'Survei kepuasan pelayanan perizinan',
    purpose: 'Mengetahui tingkat kepuasan masyarakat terhadap pelayanan perizinan.',
    jenis: 'survei',
    resultPreview: 'Indeks kepuasan dan temuan untuk perbaikan layanan.',
    classification: 'C',
    classificationLabel: 'Contoh ilustratif',
  },
  {
    slug: 'umkm',
    projectId: 'demo-umkm-koperasi-2026',
    title: 'Pendataan lengkap UMKM',
    purpose: 'Mendata unit usaha di wilayah untuk memperbarui basis data pemberdayaan.',
    jenis: 'sensus',
    resultPreview: 'Profil dan sebaran UMKM menurut jenis usaha dan wilayah.',
    classification: 'C',
    classificationLabel: 'Contoh ilustratif',
  },
  {
    slug: 'kompromin',
    projectId: 'demo-dukcapil-kompromin-2026',
    title: 'Kompilasi data kependudukan',
    purpose: 'Menyusun statistik dari data administratif yang sudah tersedia.',
    jenis: 'kompromin',
    resultPreview: 'Indikator kependudukan dari sumber administratif.',
    classification: 'C',
    classificationLabel: 'Contoh ilustratif',
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    number: '1',
    title: 'Ceritakan atau lihat contoh',
    description: 'Jelaskan kegiatan Anda, atau mulai dari contoh ilustratif.',
  },
  {
    number: '2',
    title: 'Pahami bentuk rencana',
    description: 'Lihat alur, jadwal, dan apa yang perlu disiapkan.',
  },
  {
    number: '3',
    title: 'Susun bersama StatPlan',
    description: 'StatPlan memandu kebutuhan, jadwal, dan langkah berikutnya.',
  },
  {
    number: '4',
    title: 'Dapatkan draf',
    description: 'Periksa lalu unduh draf perencanaan.',
  },
] as const
