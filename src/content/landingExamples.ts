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
  /** What a beginner learns from this example (one line) */
  lesson: string
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
    lesson: 'Cara merancang survei dengan sampel — dari masalah sampai tabel hasil.',
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
    lesson: 'Kapan pendataan lengkap (sensus) dipakai, dan mengapa tidak perlu sampel.',
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
    lesson: 'Cara memakai data yang sudah ada, termasuk perjanjian dan kerahasiaan data.',
    classification: 'C',
    classificationLabel: 'Contoh ilustratif',
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Ceritakan kebutuhan',
    description: 'Tulis dengan bahasa sehari-hari informasi apa yang ingin Anda hasilkan.',
  },
  {
    number: '02',
    title: 'Pelajari contoh & saran',
    description: 'Lihat contoh kegiatan serupa dan saran cara memperoleh datanya.',
  },
  {
    number: '03',
    title: 'Susun langkah dan persiapan',
    description: 'Ikuti Mode Terpandu satu langkah demi satu langkah, lengkap dengan contohnya.',
  },
  {
    number: '04',
    title: 'Dapatkan draf',
    description: 'Periksa kelengkapan, lalu unduh draf rencana kegiatan dalam format Word.',
  },
] as const

/** What the draft actually contains (mirrors the Ekspor tab contents list). */
export const LANDING_OUTPUTS = [
  'Identitas, tujuan, dan kebutuhan kegiatan',
  'Rancangan: cara, metode, dan sampel',
  'Variabel dan indikator',
  'Instrumen (bila diperlukan)',
  'Jadwal kegiatan per fase',
  'Checklist GSBPM 5.2',
  'Metadata kegiatan, variabel, dan indikator',
] as const
