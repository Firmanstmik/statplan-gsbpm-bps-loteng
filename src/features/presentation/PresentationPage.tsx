import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft2,
  ArrowRight2,
  Hierarchy,
  TickSquare,
  ExportSquare,
  MagicStar,
  Book1,
  InfoCircle,
  PresentionChart,
} from 'iconsax-react'
import { useAppStore } from '@/store/appStore'
import { Card, Badge, ProgressBar } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { computeProjectProgress } from '@/domain/gsbpm'
import { cn, jenisLabel } from '@/lib/utils'
import { klasifikasiLabel } from '@/lib/projectMeta'

type TabId = 'sorotan' | 'slide' | 'script' | 'faq'

const highlights = [
  {
    id: 'guided',
    title: 'Mode Terpandu (utama untuk demo)',
    body: 'Tunjukkan Apa → Contoh → Format kerja → Bukti dukung → Sudah dipahami. Mode Terpandu membantu pemula menyusun rencana bertahap — bukan menjalankan pengumpulan data.',
    icon: Book1,
    tabHint: 'Mulai dari Landing → Lihat contoh → Buat rencana → Timeline → Mode Terpandu.',
  },
  {
    id: 'recommend',
    title: 'Rekomendasi jenis kegiatan',
    body: 'Asisten rule-based membantu mempertimbangkan Survei / Sensus / Kompromin. Ini bantuan perencanaan — bukan putusan resmi BPS.',
    icon: MagicStar,
    tabHint: 'Buka Asisten atau kartu rekomendasi di workspace.',
  },
  {
    id: 'portal',
    title: 'Portal rujukan statistik',
    body: 'Materi menekankan pemeriksaan SIRuSa / Romantik / Portal SDI sebelum pengumpulan baru. StatPlan membantu pencatatan hasil cek — tidak mengakses portal secara otomatis.',
    icon: TickSquare,
    tabHint: 'Guided Phase 1.5 atau workspace → kartu portal rujukan.',
  },
  {
    id: 'gsbpm',
    title: 'Alur GSBPM',
    body: 'Delapan fase GSBPM 5.2 dibungkus Mode Terpandu dan Workspace. GSBPM fleksibel; urutan Mode Terpandu adalah panduan belajar StatPlan, bukan urutan wajib.',
    icon: Hierarchy,
    tabHint: 'Mode Terpandu Phase 1–8 atau tab Alur kerja di workspace.',
  },
  {
    id: 'export',
    title: 'Ekspor draf DOCX',
    body: 'Ekspor menghasilkan draf perencanaan. Bukan dokumen resmi BPS dan bukan persetujuan kegiatan.',
    icon: ExportSquare,
    tabHint: 'Tab Ekspor setelah draf cukup lengkap — atau tunjukkan status gated pada proyek baru.',
  },
]

const slides = [
  {
    n: 1,
    title: 'Judul',
    body: 'StatPlan · Simulator perencanaan kegiatan statistik · berbasis GSBPM 5.2',
  },
  {
    n: 2,
    title: 'Apa ini',
    body: 'Media pembelajaran dan penyusunan rencana kegiatan statistik. Bukan LMS, bukan database lapangan, bukan sistem resmi BPS.',
  },
  {
    n: 3,
    title: 'Masalah',
    body: 'Seseorang ingin merancang kegiatan statistik, tetapi belum tahu apa yang harus disiapkan dan dari mana memulai.',
  },
  {
    n: 4,
    title: 'Solusi',
    body: 'StatPlan memandu secara bertahap: contoh → kebutuhan → timeline → Mode Terpandu (8 fase) → draf yang dapat ditinjau.',
  },
  {
    n: 5,
    title: 'Contoh utama',
    body: 'Survei Kepuasan Masyarakat Pelayanan Perizinan — contoh ilustratif StatPlan, bukan data kegiatan nyata.',
  },
  {
    n: 6,
    title: 'Mode Terpandu',
    body: 'Setiap kartu: Apa? · Contoh · Yang bisa dipelajari · Format kerja StatPlan · Bukti dukung · Sudah dipahami.',
  },
  {
    n: 7,
    title: 'GSBPM',
    body: 'Delapan fase Specify Need → … → Evaluate. Mode Terpandu membantu memahami; Workspace untuk penyusunan lanjut.',
  },
  {
    n: 8,
    title: 'Batasan',
    body: 'Client-side · localStorage · dokumen draf · contoh ilustratif · tanpa AI generatif · tanpa data responden nyata.',
  },
  {
    n: 9,
    title: 'Keluaran',
    body: 'Hasil = draf perencanaan. Bukan approval BPS, bukan dokumen resmi, bukan pengganti prosedur lembaga.',
  },
]

const scriptSteps = [
  {
    aksi: 'Landing',
    ucap: 'StatPlan membantu menyusun rencana kegiatan statistik secara bertahap berdasarkan GSBPM — simulator perencanaan, bukan sistem resmi BPS.',
  },
  {
    aksi: 'Lihat contoh → SKM Perizinan',
    ucap: 'Ini contoh ilustratif. User belajar bentuk rencana sebelum mengisi sendiri.',
  },
  {
    aksi: 'Buat rencana seperti ini → Intake → Timeline',
    ucap: 'User menceritakan kebutuhan dengan bahasa sehari-hari, lalu menyusun rencana waktu. Bukan durasi wajib BPS.',
  },
  {
    aksi: 'Mode Terpandu Phase 1',
    ucap: 'Setiap kartu: pahami Apa, lihat Contoh, pelajari poinnya, isi Format kerja, catat Bukti dukung, tandai Sudah dipahami.',
  },
  {
    aksi: 'Phase 2–8 (ringkas)',
    ucap: 'Pola pembelajaran konsisten di delapan fase GSBPM. Tidak perlu membuka semua kartu di demo singkat.',
  },
  {
    aksi: 'Completion → Workspace',
    ucap: 'Mode Terpandu selesai dipelajari — bukan kegiatan statistik selesai. Workspace untuk penyusunan lanjut.',
  },
  {
    aksi: 'Validasi / Ekspor',
    ucap: 'Periksa kelengkapan draf. Ekspor = dokumen draf Word, bukan dokumen resmi BPS.',
  },
  {
    aksi: 'Batasan (closing)',
    ucap: 'Tanpa AI generatif, tanpa data responden, tanpa approval. Contoh SKM berlabel contoh ilustratif.',
  },
]

const faqs = [
  {
    q: 'Apakah ini sistem resmi BPS?',
    a: 'Tidak. StatPlan adalah simulator perencanaan dan media pembelajaran berbasis GSBPM.',
  },
  {
    q: 'Apakah data responden disimpan di server?',
    a: 'Tidak. Progress tersimpan di browser (localStorage). Jangan isi data pribadi nyata.',
  },
  {
    q: 'Apakah rekomendasi aplikasi = putusan BPS?',
    a: 'Tidak. Rekomendasi rule-based membantu perencanaan; keputusan formal tetap di luar StatPlan.',
  },
  {
    q: 'Apakah Mode Terpandu = urutan wajib GSBPM?',
    a: 'Tidak. GSBPM fleksibel. Mode Terpandu adalah panduan belajar StatPlan.',
  },
  {
    q: 'Apakah hasil ekspor dokumen resmi?',
    a: 'Tidak. File Word berstatus draf perencanaan.',
  },
]

const demoProjectsBrief = [
  { jenis: 'Survei', nama: 'SKM Perizinan DPMPTSP' },
  { jenis: 'Sensus', nama: 'Pendataan UMKM' },
  { jenis: 'Kompromin', nama: 'Integrasi Kependudukan Dukcapil' },
  { jenis: 'Survei', nama: 'Survei Produksi Padi' },
  { jenis: 'Kompromin', nama: 'Sarpras Pendidikan' },
]

export function PresentationPage() {
  const navigate = useNavigate()
  const projects = useAppStore((s) => s.projects)
  const loadDemoData = useAppStore((s) => s.loadDemoData)
  const [tab, setTab] = useState<TabId>('slide')
  const [step, setStep] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const [projectIndex, setProjectIndex] = useState(0)

  const sample = projects[projectIndex] ?? projects[0]
  const highlight = highlights[step]
  const Icon = highlight.icon
  const slide = slides[slideIndex]

  const progress = useMemo(
    () =>
      sample
        ? computeProjectProgress(sample.jenisKegiatan, sample.klasifikasi, sample.checklistState)
        : { pct: 0, done: 0, total: 0 },
    [sample],
  )

  if (projects.length === 0) {
    return (
      <Card className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-lg font-semibold">Belum ada proyek untuk presentasi</h1>
        <p className="mt-2 text-sm text-ink-700">Muat data demo terlebih dahulu.</p>
        <Button className="mt-6" variant="gold" onClick={() => loadDemoData()}>
          Muat data demo
        </Button>
      </Card>
    )
  }

  const tabs: { id: TabId; label: string; icon: typeof PresentionChart }[] = [
    { id: 'slide', label: 'Materi slide', icon: PresentionChart },
    { id: 'script', label: 'Naskah demo', icon: Book1 },
    { id: 'sorotan', label: 'Sorotan fitur', icon: MagicStar },
    { id: 'faq', label: 'FAQ', icon: InfoCircle },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-600">
            Mode presentasi
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Materi Presentasi StatPlan
          </h1>
          <p className="mt-2 text-sm text-ink-700">
            Naskah demo, slide, dan FAQ untuk presentasi singkat. Keluaran aplikasi berstatus{' '}
            <span className="font-medium text-ink-900">draf</span>. Proyek demo ={' '}
            <span className="font-medium text-ink-900">contoh ilustratif</span>, bukan data kegiatan
            nyata.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => navigate('/')}>
          Kembali ke beranda
        </Button>
      </div>

      {/* Handout singkat */}
      <Card className="border-ink-900/10 bg-gradient-to-br from-ink-50 to-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">Handout singkat</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          <strong>StatPlan</strong> adalah simulator perencanaan kegiatan statistik berbasis{' '}
          <strong>GSBPM 5.2</strong>. Alur utama demo: lihat contoh → ceritakan kebutuhan →
          timeline → Mode Terpandu (8 fase) → periksa di Workspace → unduh{' '}
          <strong>draf</strong>. Semua contoh demo berlabel contoh ilustratif. Bukan sistem
          resmi BPS dan bukan pengganti prosedur lembaga.
        </p>
      </Card>

      {/* Proyek aktif */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="brand">{jenisLabel(sample.jenisKegiatan)}</Badge>
              <Badge tone="gold">{klasifikasiLabel(sample.klasifikasi)}</Badge>
            </div>
            <h2 className="text-lg font-semibold">{sample.name}</h2>
            <p className="mt-1 text-xs text-ink-600">{sample.rekomendasiBps.penyelenggara}</p>
            <div className="mt-4 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-ink-600">
                <span>Progres</span>
                <span>{progress.pct}%</span>
              </div>
              <ProgressBar value={progress.pct} premium={progress.pct >= 80} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={projectIndex <= 0}
              onClick={() => setProjectIndex((i) => Math.max(0, i - 1))}
            >
              Proyek sebelumnya
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={projectIndex >= projects.length - 1}
              onClick={() => setProjectIndex((i) => Math.min(projects.length - 1, i + 1))}
            >
              Proyek berikutnya
            </Button>
            <Button
              size="sm"
              variant="gold"
              onClick={() => navigate(`/app/projects/${sample.id}`)}
            >
              Buka workspace
            </Button>
          </div>
        </div>
      </Card>

      {/* Tab materi */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const TabIcon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition',
                tab === t.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 ring-1 ring-border hover:bg-ink-50',
              )}
            >
              <TabIcon size={14} variant="Bold" color="currentColor" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'slide' ? (
        <Card>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Slide {slide.n} / {slides.length}
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight">{slide.title}</h3>
          <p className="mt-4 text-base leading-relaxed text-ink-800">{slide.body}</p>
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft2 size={14} variant="Bold" color="currentColor" />}
              disabled={slideIndex <= 0}
              onClick={() => setSlideIndex((s) => Math.max(0, s - 1))}
            >
              Slide sebelumnya
            </Button>
            <Button
              size="sm"
              rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" />}
              disabled={slideIndex >= slides.length - 1}
              onClick={() => setSlideIndex((s) => Math.min(slides.length - 1, s + 1))}
            >
              Slide berikutnya
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {slides.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setSlideIndex(i)}
                className={cn(
                  'rounded-xl px-3 py-2 text-left text-xs font-medium transition',
                  i === slideIndex
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-50 text-ink-700 hover:bg-ink-100',
                )}
              >
                {s.n}. {s.title}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === 'script' ? (
        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Naskah demo live (±10–12 menit)</h3>
            <ol className="space-y-3">
              {scriptSteps.map((row, i) => (
                <li
                  key={row.aksi}
                  className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
                >
                  <div className="flex gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-medium text-ink-900">{row.aksi}</div>
                      <p className="mt-0.5 text-ink-700">“{row.ucap}”</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold">Lima proyek demo (contoh ilustratif)</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {demoProjectsBrief.map((p) => (
                <li
                  key={p.nama}
                  className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm"
                >
                  <Badge tone="brand">{p.jenis}</Badge>
                  <span className="text-ink-800">{p.nama}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}

      {tab === 'sorotan' ? (
        <>
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-gold-400">
                <Icon size={22} variant="Bold" color="currentColor" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Sorotan {step + 1} / {highlights.length}
                </div>
                <h3 className="text-xl font-semibold">{highlight.title}</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink-700">{highlight.body}</p>
            <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-600">
              {highlight.tabHint}
            </p>
            <div className="mt-6 flex flex-wrap justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeft2 size={14} variant="Bold" color="currentColor" />}
                disabled={step <= 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Langkah sebelumnya
              </Button>
              <Button
                size="sm"
                rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" />}
                disabled={step >= highlights.length - 1}
                onClick={() => setStep((s) => Math.min(highlights.length - 1, s + 1))}
              >
                Langkah berikutnya
              </Button>
            </div>
          </Card>
          <div className="grid gap-2 sm:grid-cols-5">
            {highlights.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  'rounded-xl px-3 py-2 text-left text-xs font-medium transition',
                  i === step
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-ink-700 ring-1 ring-border hover:bg-ink-50',
                )}
              >
                {i + 1}. {h.title}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {tab === 'faq' ? (
        <Card>
          <h3 className="mb-4 font-semibold">FAQ reviewer</h3>
          <ul className="space-y-4">
            {faqs.map((f) => (
              <li key={f.q} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="text-sm font-medium text-ink-900">{f.q}</div>
                <p className="mt-1 text-sm text-ink-700">{f.a}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
