/**
 * Presentation-layer helpers for Beginner Guided Planning (Slice 1).
 * Does not modify domain GSBPM definitions.
 */
import type { GsbpmPhaseId, JenisKegiatan, TimelineItem } from '@/domain/types'

export const GUIDED_STEPS = [
  { id: 1, label: 'Ceritakan', short: 'Ceritakan' },
  { id: 2, label: 'Tentukan hasil', short: 'Hasil' },
  { id: 3, label: 'Tentukan waktu', short: 'Waktu' },
  { id: 4, label: 'Siapkan kegiatan', short: 'Siapkan', future: true },
  { id: 5, label: 'Periksa', short: 'Periksa', future: true },
  { id: 6, label: 'Dapatkan draf', short: 'Draf', future: true },
] as const

export const STORY_EXAMPLE =
  'Saya ingin mengetahui kepuasan masyarakat terhadap pelayanan perizinan.'

export type OutcomeExamplePack = {
  id: string
  match: (text: string) => boolean
  title: string
  items: string[]
  containsNote: string
}

export const OUTCOME_EXAMPLE_PACKS: OutcomeExamplePack[] = [
  {
    id: 'skm-pelayanan',
    match: (t) =>
      /kepuasan|pelayanan|perizinan|skm|masyarakat/.test(t.toLowerCase()),
    title: 'Contoh hasil untuk kegiatan kepuasan pelayanan',
    items: [
      'Tingkat kepuasan masyarakat terhadap pelayanan',
      'Hasil menurut jenis layanan',
      'Aspek pelayanan yang perlu diperbaiki',
    ],
    containsNote:
      'Contoh ini membantu Anda membayangkan bentuk hasil. Bukan template resmi BPS.',
  },
  {
    id: 'umkm',
    match: (t) => /umkm|usaha mikro|usaha kecil/.test(t.toLowerCase()),
    title: 'Contoh hasil untuk kegiatan UMKM',
    items: [
      'Jumlah dan profil unit usaha',
      'Omzet atau skala usaha (jika dikumpulkan)',
      'Sebaran wilayah usaha',
    ],
    containsNote:
      'Contoh ilustratif untuk memulai. Sesuaikan dengan kebutuhan dinas Anda.',
  },
  {
    id: 'default',
    match: () => true,
    title: 'Contoh hasil yang dapat direncanakan',
    items: [
      'Data atau indikator utama yang menjawab kebutuhan',
      'Ringkasan temuan untuk pengambilan keputusan',
      'Tabel atau grafik ringkas untuk diseminasi',
    ],
    containsNote:
      'Contoh ilustratif umum. Ubah agar sesuai kegiatan Anda.',
  },
]

export function pickOutcomeExample(story: string): OutcomeExamplePack {
  return OUTCOME_EXAMPLE_PACKS.find((p) => p.match(story)) ?? OUTCOME_EXAMPLE_PACKS[OUTCOME_EXAMPLE_PACKS.length - 1]!
}

export function deriveProjectName(story: string): string {
  const clean = story.trim().replace(/\s+/g, ' ')
  if (!clean) return 'Kegiatan statistik baru'
  const capped = clean.charAt(0).toUpperCase() + clean.slice(1)
  if (capped.length <= 72) return capped
  return `${capped.slice(0, 69).trim()}…`
}

export function deriveTopik(story: string): string {
  const t = story.toLowerCase()
  if (/kepuasan|pelayanan|perizinan|skm/.test(t)) return 'pelayanan publik'
  if (/umkm|usaha mikro|usaha kecil/.test(t)) return 'UMKM'
  if (/penduduk|kependudukan|keluarga/.test(t)) return 'kependudukan'
  if (/pendidikan|sekolah|siswa/.test(t)) return 'pendidikan'
  if (/kesehatan|puskesmas|rumah sakit/.test(t)) return 'kesehatan'
  if (/padi|pertanian|hortikultura/.test(t)) return 'pertanian'
  return 'kegiatan statistik'
}

export function understandNeedSummary(story: string): string {
  const clean = story.trim().replace(/\s+/g, ' ')
  if (!clean) return ''
  const lower = clean.toLowerCase()
  if (lower.startsWith('saya ingin')) {
    return `Kegiatan untuk ${clean.slice('saya ingin'.length).trim()}`
  }
  if (lower.startsWith('saya mau') || lower.startsWith('ingin ingin')) {
    return `Kegiatan untuk ${clean.replace(/^saya\s+(mau|ingin ingin)\s+/i, '').trim()}`
  }
  return `Kegiatan terkait: ${clean}`
}

export const DURATION_PRESETS = [
  { id: '1', months: 1, label: '1 bulan' },
  { id: '2', months: 2, label: '2 bulan' },
  { id: '3', months: 3, label: '3 bulan' },
  { id: '6', months: 6, label: '6 bulan' },
] as const

type ScheduleRow = { title: string; phaseId: GsbpmPhaseId; weight: number }

function scheduleTemplate(jenis: JenisKegiatan): ScheduleRow[] {
  if (jenis === 'kompromin') {
    return [
      { title: 'Persiapan & telaah data', phaseId: 'specify_need', weight: 2 },
      { title: 'Perancangan kompilasi', phaseId: 'design', weight: 2 },
      { title: 'Pengambilan data administratif', phaseId: 'collect', weight: 3 },
      { title: 'Pengolahan & validasi', phaseId: 'process', weight: 2 },
      { title: 'Analisis', phaseId: 'analyse', weight: 2 },
      { title: 'Penyusunan hasil & diseminasi', phaseId: 'disseminate', weight: 2 },
    ]
  }
  if (jenis === 'sensus') {
    return [
      { title: 'Persiapan', phaseId: 'specify_need', weight: 2 },
      { title: 'Perancangan', phaseId: 'design', weight: 2 },
      { title: 'Persiapan petugas & uji coba', phaseId: 'build', weight: 2 },
      { title: 'Pendataan lengkap', phaseId: 'collect', weight: 4 },
      { title: 'Pengolahan', phaseId: 'process', weight: 2 },
      { title: 'Analisis', phaseId: 'analyse', weight: 1 },
      { title: 'Penyusunan hasil & diseminasi', phaseId: 'disseminate', weight: 1 },
    ]
  }
  return [
    { title: 'Persiapan', phaseId: 'specify_need', weight: 2 },
    { title: 'Perancangan', phaseId: 'design', weight: 2 },
    { title: 'Pengumpulan data', phaseId: 'collect', weight: 3 },
    { title: 'Pengolahan', phaseId: 'process', weight: 1 },
    { title: 'Analisis', phaseId: 'analyse', weight: 1 },
    { title: 'Penyusunan hasil', phaseId: 'analyse', weight: 1 },
    { title: 'Diseminasi', phaseId: 'disseminate', weight: 2 },
  ]
}

function uid() {
  return `guided-tl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Build illustrative TimelineItem[] scaled to duration (weeks ≈ months × 4). */
export function buildIllustrativeSchedule(
  months: number,
  jenis: JenisKegiatan,
): TimelineItem[] {
  const totalWeeks = Math.max(4, Math.round(months * 4))
  const template = scheduleTemplate(jenis)
  const weightSum = template.reduce((a, r) => a + r.weight, 0)

  let acc = 0
  const items: TimelineItem[] = template.map((row, index) => {
    const startFrac = acc / weightSum
    acc += row.weight
    const endFrac = acc / weightSum
    let start = Math.floor(startFrac * totalWeeks) + 1
    let end = Math.ceil(endFrac * totalWeeks)
    if (end < start) end = start
    if (index === template.length - 1) end = totalWeeks
    start = Math.min(Math.max(1, start), totalWeeks)
    end = Math.min(Math.max(end, start), totalWeeks)
    return {
      id: uid(),
      title: row.title,
      phaseId: row.phaseId,
      startWeek: start,
      endWeek: end,
    }
  })

  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]!
    const cur = items[i]!
    if (cur.startWeek < prev.startWeek) cur.startWeek = prev.startWeek
    if (cur.endWeek < cur.startWeek) cur.endWeek = cur.startWeek
  }
  if (items.length) {
    items[0]!.startWeek = 1
    items[items.length - 1]!.endWeek = totalWeeks
  }

  return items
}

export function weekRangeLabel(start: number, end: number): string {
  if (start === end) return `Minggu ${start}`
  return `Minggu ${start}–${end}`
}

export function jenisPlainExplanation(jenis: JenisKegiatan): string {
  if (jenis === 'kompromin') {
    return 'Kompilasi data cocok ketika informasi sudah tersedia dari sumber administratif dan tidak perlu pengumpulan lapangan baru.'
  }
  if (jenis === 'sensus') {
    return 'Sensus / pendataan lengkap cocok ketika seluruh unit perlu dicakup, bukan hanya sampel.'
  }
  return 'Survei cocok ketika informasi perlu diperoleh dari sebagian unit (responden) melalui pengumpulan data.'
}
