import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { Button } from '@/components/ui/Button'
import { SourceNote } from '@/components/ui/Editorial'
import { GUIDED_PHASES } from '@/content/guidedCards'
import { LANDING_EXAMPLES } from '@/content/landingExamples'
import { cn, jenisLabel } from '@/lib/utils'

/**
 * Mode presentasi — helps someone demonstrate StatPlan truthfully.
 * Self-contained (no project required); every claim matches what the app actually does.
 */

type TabId = 'slide' | 'naskah' | 'faq'

const TOTAL_SUBPROCESSES = GUIDED_PHASES.reduce((n, p) => n + p.cards.length, 0)

type Slide = {
  eyebrow: string
  title: string
  points: string[]
  extra?: ReactNode
  show?: { to: string; label: string }
}

const slides: Slide[] = [
  {
    eyebrow: 'Apa itu StatPlan',
    title: 'Simulator perencanaan kegiatan statistik untuk pemula',
    points: [
      'Media belajar sekaligus alat bantu menyusun rencana kegiatan statistik.',
      'Kerangka proses mengikuti GSBPM 5.2 dari Materi Proses Bisnis.',
      'Berjalan di browser; data tersimpan di perangkat pengguna.',
    ],
    show: { to: '/', label: 'Buka halaman depan' },
  },
  {
    eyebrow: 'Masalah yang dibantu',
    title: '“Saya perlu kegiatan statistik, tapi harus mulai dari mana?”',
    points: [
      'Istilah GSBPM dan dokumen yang perlu disiapkan terasa asing bagi pemula.',
      'Sulit membayangkan bentuk kegiatan sebelum melihat contohnya.',
      'Tidak jelas apa yang sudah siap dan apa yang masih kurang.',
    ],
  },
  {
    eyebrow: 'Bagaimana alurnya',
    title: 'Dari contoh sampai draf, satu langkah pada satu waktu',
    points: [],
    extra: (
      <ol className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          'Pelajari contoh',
          'Ceritakan kebutuhan',
          'Tentukan waktu',
          'Mode Terpandu',
          'Ruang kerja',
          'Tinjauan',
          'Draf dokumen',
        ].map((s, i) => (
          <li key={s} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
            <span className="font-display text-sm tabular-nums text-ink-500">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-sm font-medium text-ink-900">{s}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    eyebrow: 'Contoh kegiatan',
    title: 'Belajar dari contoh sebelum membuat rencana sendiri',
    points: [
      'Setiap contoh adalah studi kasus ilustratif StatPlan — bukan data kegiatan nyata.',
      '“Mulai dari contoh ini” membuat salinan baru; contoh asli tidak berubah.',
    ],
    extra: (
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {LANDING_EXAMPLES.map((ex) => (
          <li key={ex.slug} className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="text-sm font-semibold text-ink-950">{ex.title}</p>
            <p className="text-xs text-ink-500">{jenisLabel(ex.jenis)}</p>
          </li>
        ))}
      </ul>
    ),
    show: { to: '/contoh/skm', label: 'Buka contoh SKM' },
  },
  {
    eyebrow: 'Mode Terpandu',
    title: 'Satu subproses, satu pelajaran',
    points: [
      'Setiap subproses: Apa? · Contoh · Yang bisa dipelajari · Format kerja · Bukti dukung.',
      'Contoh asli dari materi (mis. Hal. 18, 26, 27, 28) ditampilkan dengan rujukan halaman.',
      '“Sudah dipahami” adalah status belajar — bukan kegiatan selesai atau disetujui.',
    ],
    show: { to: '/app/new?from=skm', label: 'Coba dari contoh SKM' },
  },
  {
    eyebrow: 'GSBPM 5.2',
    title: `8 fase, ${TOTAL_SUBPROCESSES} subproses resmi`,
    points: [
      'Nama dan nomor subproses mengikuti Materi Proses Bisnis.',
      'GSBPM bersifat fleksibel; urutan Mode Terpandu adalah urutan belajar StatPlan.',
    ],
    extra: (
      <ol className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GUIDED_PHASES.map((p, i) => (
          <li key={p.intro.phaseId} className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <p className="text-[11px] tabular-nums text-ink-500">{String(i + 1).padStart(2, '0')}</p>
            <p className="text-sm font-semibold leading-snug text-ink-950">{p.intro.title}</p>
            <p className="text-xs text-ink-500">{p.cards.length} subproses</p>
          </li>
        ))}
      </ol>
    ),
  },
  {
    eyebrow: 'Keluaran',
    title: 'Draf rencana kegiatan dalam format Word',
    points: [
      'Berisi identitas kegiatan, perancangan, variabel, instrumen, timeline, checklist GSBPM, dan metadata.',
      'Unduhan dibuka setelah tinjauan kelengkapan terpenuhi (misalnya checklist wajib ≥ 80%).',
      'Selalu berstatus draf bahan kerja — bukan dokumen resmi BPS.',
    ],
  },
  {
    eyebrow: 'Yang tidak diklaim StatPlan',
    title: 'Jujur tentang batasannya',
    points: [
      'Bukan sistem resmi atau operasional BPS, dan tidak memberi persetujuan kegiatan.',
      'Tidak memakai AI generatif; saran jenis kegiatan berbasis aturan sederhana.',
      'Tidak mengumpulkan data responden dan tidak menghitung hasil statistik.',
      'Contoh buatan StatPlan selalu dilabeli “contoh ilustratif”.',
    ],
  },
]

const script = [
  ['Halaman depan', 'StatPlan membantu pemula menyusun rencana kegiatan statistik, dipandu contoh dan GSBPM 5.2.'],
  ['Pelajari contoh → SKM', 'Tunjukkan studi kasus: latar belakang, 8 fase, dan contoh asli dari materi.'],
  ['Mulai dari contoh ini', 'Isian awal terisi dari contoh. Tekankan bahwa contoh asli tetap aman.'],
  ['Tentukan waktu', 'Rentang waktu dibagi ke fase sebagai rencana awal — bukan durasi wajib BPS.'],
  ['Mode Terpandu', 'Buka satu subproses: Apa, Contoh, Format kerja, Bukti dukung, lalu tandai sudah dipahami.'],
  ['Ruang kerja', 'Tempat melengkapi rencana secara rinci; tinjauan menjelaskan apa yang masih kurang.'],
  ['Ekspor', 'Tunjukkan isi draf dan alasan jika unduhan belum dibuka.'],
  ['Penutup', 'Sampaikan batasan: draf, bukan dokumen resmi; tanpa AI generatif; tanpa data responden.'],
] as const

const faqs = [
  ['Apakah ini sistem resmi BPS?', 'Tidak. StatPlan adalah simulator perencanaan dan media belajar berbasis GSBPM 5.2.'],
  ['Di mana data disimpan?', 'Di browser perangkat Anda (localStorage). Jangan mengisi data pribadi nyata.'],
  ['Apakah saran jenis kegiatan adalah keputusan BPS?', 'Tidak. Saran berbasis aturan sederhana; keputusan formal tetap di luar StatPlan.'],
  ['Apakah Mode Terpandu urutan wajib GSBPM?', 'Tidak. GSBPM fleksibel; Mode Terpandu adalah urutan belajar StatPlan.'],
  ['Apakah file ekspor dokumen resmi?', 'Tidak. File Word berstatus draf perencanaan.'],
  ['Dari mana contoh gambar pada materi?', 'Diambil langsung dari Materi Proses Bisnis, lengkap dengan nomor halaman, tanpa digambar ulang.'],
] as const

export function PresentationPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('slide')
  const [index, setIndex] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const slide = slides[index]!
  const tabs: { id: TabId; label: string }[] = [
    { id: 'slide', label: 'Slide' },
    { id: 'naskah', label: 'Naskah demo' },
    { id: 'faq', label: 'FAQ' },
  ]

  function go(delta: number) {
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)))
  }

  function onStageKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  function onTabsKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = tabs.findIndex((t) => t.id === tab)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]!
      setTab(next.id)
      document.getElementById(`pres-tab-${next.id}`)?.focus()
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="t-eyebrow mb-2">Mode presentasi</p>
          <h1 className="t-page-title">Presentasi StatPlan</h1>
          <p className="t-body mt-2">
            Materi singkat untuk memperkenalkan StatPlan kepada atasan, dosen, rekan kerja, atau calon
            pengguna — lengkap dengan naskah demo dan jawaban pertanyaan umum.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => navigate('/app')}>
          Kembali ke Proyek saya
        </Button>
      </header>

      <div role="tablist" aria-label="Bagian presentasi" onKeyDown={onTabsKey} className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`pres-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`pres-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={cn(
              'focus-ring -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.id ? 'border-ink-900 text-ink-950' : 'border-transparent text-ink-500 hover:text-ink-950',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'slide' ? (
        <section id="pres-panel-slide" role="tabpanel" aria-labelledby="pres-tab-slide">
          <div
            ref={stageRef}
            tabIndex={0}
            onKeyDown={onStageKey}
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} dari ${slides.length}: ${slide.title}`}
            className="focus-ring flex min-h-[26rem] flex-col rounded-3xl border border-border bg-surface p-6 sm:p-10"
          >
            <div className="flex items-baseline justify-between gap-4">
              <p className="t-eyebrow">{slide.eyebrow}</p>
              <p className="text-xs tabular-nums text-ink-400" aria-hidden>
                {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </p>
            </div>
            <h2 className="mt-4 max-w-3xl font-display text-2xl font-semibold leading-snug text-ink-950 sm:text-[2rem]">
              {slide.title}
            </h2>
            {slide.points.length ? (
              <ul className="mt-6 max-w-3xl space-y-3">
                {slide.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-ink-800 sm:text-base">
                    <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-accent" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {slide.extra ? <div className="mt-6">{slide.extra}</div> : null}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
              {slide.show ? (
                <Link
                  to={slide.show.to}
                  className="focus-ring inline-flex min-h-6 items-center rounded text-sm font-semibold text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900"
                >
                  Tunjukkan di aplikasi: {slide.show.label}
                </Link>
              ) : (
                <span />
              )}
              {index === 5 ? <SourceNote kind="A" page="10–63" /> : null}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              disabled={index === 0}
              leftIcon={<ArrowLeft2 size={14} variant="Bold" color="currentColor" aria-hidden />}
              onClick={() => go(-1)}
            >
              Sebelumnya
            </Button>
            <ol className="hidden items-center sm:flex" aria-label="Pilih slide">
              {slides.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    aria-label={`Slide ${i + 1}: ${s.eyebrow}`}
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => setIndex(i)}
                    className="group focus-ring flex h-6 min-w-6 items-center justify-center rounded-full px-[3px]"
                  >
                    {/* 24px hit area (WCAG 2.5.8); the visible dot stays small */}
                    <span
                      aria-hidden
                      className={cn(
                        'block h-2 rounded-full transition-all',
                        i === index ? 'w-6 bg-ink-900' : 'w-2 bg-ink-200 group-hover:bg-ink-400',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            <Button
              disabled={index === slides.length - 1}
              rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />}
              onClick={() => go(1)}
            >
              Berikutnya
            </Button>
          </div>
          <p className="t-support mt-3">Tip: klik area slide, lalu gunakan tombol panah kiri/kanan.</p>
        </section>
      ) : null}

      {tab === 'naskah' ? (
        <section id="pres-panel-naskah" role="tabpanel" aria-labelledby="pres-tab-naskah">
          <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {script.map(([aksi, ucap], i) => (
              <li key={aksi} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
                <p className="text-sm font-semibold text-ink-950">
                  <span className="mr-2 tabular-nums text-ink-500">{i + 1}.</span>
                  {aksi}
                </p>
                <p className="t-body">{ucap}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {tab === 'faq' ? (
        <section id="pres-panel-faq" role="tabpanel" aria-labelledby="pres-tab-faq" className="space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-border bg-surface px-5 py-4">
              <summary className="focus-ring cursor-pointer list-none rounded text-[15px] font-semibold text-ink-950">
                {q}
              </summary>
              <p className="t-body mt-2">{a}</p>
            </details>
          ))}
        </section>
      ) : null}

      <p className="t-support border-t border-border pt-4">
        Semua keluaran StatPlan berstatus draf. StatPlan bukan sistem resmi BPS dan tidak memberikan
        persetujuan kegiatan statistik.
      </p>
    </div>
  )
}
