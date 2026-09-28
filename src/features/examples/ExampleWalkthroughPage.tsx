import { useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown2, ArrowLeft2, ArrowRight2, ArrowUp2, ShieldTick } from 'iconsax-react'
import { Button } from '@/components/ui/Button'
import { InfoGrid, SectionHeader, SourceNote } from '@/components/ui/Editorial'
import {
  EXAMPLE_JOURNEYS,
  getExampleBySlug,
  type ExampleJourney,
  type ExamplePreparePhase,
} from '@/content/exampleJourney'
import { GUIDED_PHASES } from '@/content/guidedCards'
import { MATERI_JADWAL_HAL_23 } from '@/content/guidedPhaseDesign'
import { cn, jenisLabel } from '@/lib/utils'

/**
 * Contoh kegiatan — editorial case study.
 * Read-only learning surface: never mutates demo projects, checklist, or export.
 * “Mulai dari contoh ini” opens the intake with a copy of the example (/app/new?from=slug).
 */

type MateriVisual = {
  key: string
  title: string
  page: number | string
  src: string
  width?: number
  height?: number
  alt: string
  lesson?: string
  usedIn: string
  phaseIndex: number
}

function collectMateriVisuals(): MateriVisual[] {
  const out: MateriVisual[] = []
  GUIDED_PHASES.forEach((phase, phaseIndex) => {
    for (const card of phase.cards) {
      for (const ex of card.materiExamples ?? []) {
        if (!ex.imageSrc) continue
        out.push({
          key: ex.imageSrc,
          title: ex.title,
          page: ex.pdfPage ?? card.pdfPage ?? '',
          src: ex.imageSrc,
          width: ex.imageWidth,
          height: ex.imageHeight,
          alt: ex.imageAlt ?? ex.title,
          lesson: card.materiLesson,
          usedIn: `${card.code} ${card.officialTitle ?? card.title}`,
          phaseIndex,
        })
      }
    }
  })
  return out
}

/** Pull “Masalah / Mengapa / Pengguna / Informasi” from the example’s own 1.1 rows (Type C). */
function caseFacts(example: ExampleJourney) {
  const rows = example.prepareItems[0]?.contohDetail ?? []
  const find = (re: RegExp) => rows.find((r) => re.test(r.label))?.value
  return {
    fullTitle: find(/^Kegiatan/) ?? example.title,
    masalah: find(/^Masalah/) ?? example.whatToKnow,
    mengapa: find(/^Mengapa/) ?? example.whyConducted,
    pengguna: find(/^Pengguna/) ?? '—',
    informasi: find(/^Informasi/) ?? example.plannedResult,
  }
}

function SourcePill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-ink-700">
      {children}
    </span>
  )
}

function ZoomFigure({ visual }: { visual: MateriVisual }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <figure className="m-0 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="space-y-1.5 border-b border-border px-4 py-3.5">
        <figcaption className="t-card-title">{visual.title}</figcaption>
        <SourceNote kind="A" page={visual.page} />
        <p className="text-xs text-ink-500">Dipakai pada subproses {visual.usedIn}</p>
      </div>
      <div className={cn('bg-surface-muted p-3', zoomed ? 'overflow-x-auto' : 'overflow-hidden')}>
        <img
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          loading="lazy"
          decoding="async"
          className={cn(
            'mx-auto block h-auto rounded-md bg-white',
            zoomed ? 'w-[min(1100px,260%)] max-w-none' : 'max-h-72 w-full object-contain',
          )}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-3.5">
        {visual.lesson ? (
          <p className="t-support">
            <span className="font-semibold text-ink-900">Contoh ini menunjukkan: </span>
            {visual.lesson}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-ink-500">
          <span>Gambar asli — tidak digambar ulang</span>
          <button
            type="button"
            className="focus-ring rounded px-1 font-semibold text-ink-800 underline-offset-2 hover:underline"
            aria-pressed={zoomed}
            onClick={() => setZoomed((z) => !z)}
          >
            {zoomed ? 'Perkecil' : 'Perbesar'}
          </button>
        </div>
      </div>
    </figure>
  )
}

function PhaseLesson({
  phase,
  index,
  open,
  onToggle,
  hasVisuals,
  schedule,
}: {
  phase: ExamplePreparePhase
  index: number
  open: boolean
  onToggle: () => void
  hasVisuals: boolean
  schedule?: ReactNode
}) {
  const reduce = useReducedMotion()
  const panelId = useId()
  const [showDetail, setShowDetail] = useState(false)
  const official = GUIDED_PHASES[index]
  const items = phase.items
  const overview = items.length === 1 ? items[0] : undefined
  const lessons = Array.from(new Set(items.flatMap((it) => it.lessonPoints ?? []))).slice(0, 4)
  const num = String(index + 1).padStart(2, '0')

  return (
    <li data-phase-lesson={phase.phaseId} id={`fase-${index + 1}`} className="scroll-mt-24 border-t border-border first:border-t-0">
      <h3>
        <button
          type="button"
          className="focus-ring group flex w-full items-start gap-4 rounded-xl py-5 text-left sm:gap-6"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="font-display text-lg tabular-nums text-ink-400 sm:text-xl" aria-hidden>
            {num}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
              {official?.intro.officialTitle.split(' (')[0]} · {official?.cards.length} subproses
            </span>
            <span className="mt-1 block font-display text-lg font-semibold leading-snug text-ink-950 sm:text-xl">
              {phase.titleId}
            </span>
            <span className="t-support mt-1 block">{phase.intro}</span>
          </span>
          <span
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-ink-600 transition-colors group-hover:border-ink-400"
            aria-hidden
          >
            {open ? (
              <ArrowUp2 size={14} variant="Bold" color="currentColor" />
            ) : (
              <ArrowDown2 size={14} variant="Bold" color="currentColor" />
            )}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Pelajari ${phase.titleId}`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-8 pl-0 sm:pl-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="min-w-0 space-y-7">
                <section>
                  <p className="t-label">Mengapa penting</p>
                  <p className="t-body mt-1.5">{phase.why}</p>
                </section>

                <section>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="t-label">Contoh</p>
                    <SourceNote kind="C" />
                  </div>
                  {overview ? (
                    <>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink-900">{overview.contoh}</p>
                      {overview.contohDetail?.length ? (
                        <>
                          <button
                            type="button"
                            className="focus-ring mt-2 rounded text-sm font-semibold text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900"
                            aria-expanded={showDetail}
                            onClick={() => setShowDetail((v) => !v)}
                          >
                            {showDetail ? 'Sembunyikan rincian contoh' : 'Lihat rincian contoh'}
                          </button>
                          {showDetail ? (
                            <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
                              {overview.contohDetail.map((row) => (
                                <div
                                  key={row.label}
                                  className="grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4"
                                >
                                  <dt className="text-xs font-semibold text-ink-600">{row.label}</dt>
                                  <dd className="whitespace-pre-line text-sm text-ink-900">{row.value}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      {items.map((it) => (
                        <li key={it.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                          <p className="text-sm font-semibold text-ink-950">
                            <span className="mr-1.5 tabular-nums text-ink-500">{it.subprocess}</span>
                            {it.title}
                          </p>
                          <p className="t-support mt-1">{it.contoh}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                {lessons.length ? (
                  <section>
                    <p className="t-label">Yang bisa dipelajari</p>
                    <ul className="mt-2 space-y-1.5">
                      {lessons.map((l) => (
                        <li key={l} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-800">
                          <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-accent" />
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {schedule ? <section>{schedule}</section> : null}
              </div>

              <aside className="space-y-5 lg:border-l lg:border-border lg:pl-6">
                <div>
                  <p className="t-label">Subproses resmi</p>
                  <ol className="mt-2 space-y-1">
                    {official?.cards.map((c) => (
                      <li key={c.id} className="flex gap-2 text-sm leading-snug text-ink-800">
                        <span className="w-7 shrink-0 tabular-nums text-ink-500">{c.code}</span>
                        <span>{c.officialTitle}</span>
                      </li>
                    ))}
                  </ol>
                  <SourceNote kind="A" page={official?.intro.pdfRange.replace('Hal. ', '')} className="mt-3" />
                </div>
                <div>
                  <p className="t-label">Bukti dukung</p>
                  <p className="t-support mt-1.5">
                    {overview
                      ? overview.buktiDukung.replace(/^Yang biasanya disiapkan:\s*/i, '')
                      : official?.intro.outputs.join(' · ')}
                  </p>
                </div>
                {hasVisuals ? (
                  <a
                    href="#materi"
                    className="focus-ring inline-flex items-center gap-1 rounded text-sm font-semibold text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900"
                  >
                    Lihat contoh asli dari materi
                    <ArrowDown2 size={12} variant="Bold" color="currentColor" aria-hidden />
                  </a>
                ) : null}
              </aside>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}


function ScheduleBlock({ example }: { example: ExampleJourney }) {
  const fromPdf = example.schedule.sourceType === 'pdf'
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="t-label">Contoh jadwal</p>
        {fromPdf ? (
          <SourceNote kind="A" page={example.schedule.pdfPage} />
        ) : (
          <SourceNote kind="C" />
        )}
      </div>
      <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[18rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-500">
              <th scope="col" className="px-4 py-2 font-semibold">
                {fromPdf ? 'Kegiatan' : 'Waktu'}
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                {fromPdf ? 'Waktu' : 'Kegiatan'}
              </th>
            </tr>
          </thead>
          <tbody>
            {fromPdf
              ? MATERI_JADWAL_HAL_23.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-ink-900">{r[1]}</td>
                    <td className="px-4 py-2 text-ink-700">{r[2]}</td>
                  </tr>
                ))
              : example.schedule.months.map((m) => (
                  <tr key={m.month} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-2 text-ink-700">{m.month}</td>
                    <td className="px-4 py-2 text-ink-900">{m.activities.join(' · ')}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <p className="t-support mt-2">{example.schedule.note}</p>
    </div>
  )
}

export function ExampleWalkthroughPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const example = slug ? getExampleBySlug(slug) : undefined
  const [openPhase, setOpenPhase] = useState<number | null>(0)
  const [showAllVisuals, setShowAllVisuals] = useState(false)
  const lessonsRef = useRef<HTMLDivElement>(null)
  const visuals = useMemo(() => collectMateriVisuals(), [])

  if (!example) return <Navigate to="/" replace />

  const facts = caseFacts(example)
  const startHref = `/app/new?from=${example.slug}`
  const others = EXAMPLE_JOURNEYS.filter((e) => e.slug !== example.slug)
  const shownVisuals = showAllVisuals ? visuals : visuals.slice(0, 3)
  const visualPhases = new Set(visuals.map((v) => v.phaseIndex))

  function openFromRoadmap(i: number) {
    setOpenPhase(i)
    window.setTimeout(() => {
      document.getElementById(`fase-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  return (
    <div className="min-h-dvh bg-surface-muted pb-24 text-ink-950 sm:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface-muted/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/#contoh"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-ink-700 hover:text-ink-950"
          >
            <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
            Semua contoh
          </Link>
          <Link to="/" className="focus-ring rounded font-semibold tracking-tight text-ink-950">
            StatPlan
          </Link>
          <div className="hidden sm:block">
            <Button
              size="sm"
              onClick={() => navigate(startHref)}
              rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />}
            >
              Mulai dari contoh ini
            </Button>
          </div>
          <span className="w-16 sm:hidden" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* HERO */}
        <section data-section="hero" aria-labelledby="contoh-title" className="pb-12 pt-10 sm:pb-16 sm:pt-16">
          <div className="max-w-3xl">
            <p className="t-eyebrow">Contoh kegiatan</p>
            <h1 id="contoh-title" className="t-page-title mt-3 text-balance sm:text-[2.75rem]">
              {facts.fullTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              Pelajari bagaimana sebuah kebutuhan statistik dapat diterjemahkan menjadi rencana
              kegiatan secara bertahap — sebelum Anda membuat rencana sendiri.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SourcePill>Contoh ilustratif StatPlan</SourcePill>
              <SourcePill>Berbasis konsep GSBPM 5.2</SourcePill>
              <SourcePill>{jenisLabel(example.jenis)}</SourcePill>
            </div>
            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-auto py-3 text-left"
                onClick={() => navigate(startHref)}
                rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
              >
                Gunakan contoh ini untuk membuat rencana
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => lessonsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Pelajari langkahnya dulu
              </Button>
            </div>
          </div>
        </section>

        {/* AT A GLANCE */}
        <section data-section="sekilas" aria-labelledby="sekilas" className="pb-14 sm:pb-20">
          <h2 id="sekilas" className="t-label mb-3">
            Sekilas
          </h2>
          <InfoGrid
            items={[
              { label: 'Jenis kegiatan', value: jenisLabel(example.jenis) },
              { label: 'Topik', value: example.title },
              { label: 'Tujuan', value: example.whatToKnow },
              { label: 'Pengguna informasi', value: facts.pengguna },
              { label: 'Output yang direncanakan', value: example.plannedResult },
              { label: 'Periode contoh', value: example.summary.schedule },
            ]}
          />
          <p className="t-support mt-3">
            Semua isian adalah contoh ilustratif — tidak ada angka hasil atau data responden.
          </p>
        </section>

        {/* WHY */}
        <section
          data-section="mengapa"
          aria-labelledby="mengapa"
          className="grid gap-8 border-t border-border py-14 sm:py-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16"
        >
          <SectionHeader
            id="mengapa"
            eyebrow="Latar belakang"
            title="Mengapa kegiatan ini dibutuhkan?"
          />
          <div className="space-y-8">
            <blockquote className="border-l-2 border-accent pl-5 font-display text-xl leading-relaxed text-ink-950 sm:text-2xl">
              {facts.masalah}
            </blockquote>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="t-label">Mengapa informasi dibutuhkan</dt>
                <dd className="t-body mt-1.5">{facts.mengapa}</dd>
              </div>
              <div>
                <dt className="t-label">Siapa yang membutuhkan</dt>
                <dd className="t-body mt-1.5">{facts.pengguna}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="t-label">Informasi yang diharapkan</dt>
                <dd className="t-body mt-1.5">{facts.informasi}</dd>
              </div>
            </dl>
            <SourceNote kind="C" />
          </div>
        </section>

        {/* ROADMAP */}
        <section data-section="roadmap" aria-labelledby="disiapkan" className="border-t border-border py-14 sm:py-20">
          <SectionHeader
            id="disiapkan"
            eyebrow="Gambaran besar"
            title="Apa yang perlu disiapkan?"
            lead="Kegiatan statistik melewati delapan fase GSBPM 5.2. Pilih satu fase untuk melihat apa yang dikerjakan di sana."
          />
          <ol className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {example.preparePhases.map((p, i) => (
              <li key={p.phaseId} className="bg-surface">
                <button
                  type="button"
                  onClick={() => openFromRoadmap(i)}
                  className={cn(
                    'focus-ring flex h-full w-full flex-col items-start gap-1 px-4 py-4 text-left transition-colors hover:bg-surface-muted sm:px-5 sm:py-5',
                    openPhase === i && 'bg-surface-muted',
                  )}
                >
                  <span className="font-display text-sm tabular-nums text-ink-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold leading-snug text-ink-950 sm:text-[15px]">
                    {p.titleId}
                  </span>
                  <span className="text-xs text-ink-500">
                    {GUIDED_PHASES[i]?.cards.length} subproses
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="t-support mt-3">
            Urutan ini membantu belajar bertahap. GSBPM sendiri bersifat fleksibel dan tidak harus
            dijalankan secara linear.
          </p>
        </section>

        {/* PHASE LESSONS */}
        <section
          data-section="pelajari"
          ref={lessonsRef}
          aria-labelledby="pelajari"
          className="scroll-mt-20 border-t border-border py-14 sm:py-20"
        >
          <SectionHeader
            id="pelajari"
            eyebrow="Pelajari langkahnya"
            title="Satu fase, satu langkah"
            lead="Setiap fase menjelaskan apa yang dilakukan, contohnya pada kegiatan ini, dan bukti yang biasanya disiapkan."
          />
          <ol className="mt-6 rounded-2xl border border-border bg-surface px-4 sm:px-6">
            {example.preparePhases.map((p, i) => (
              <PhaseLesson
                key={p.phaseId}
                phase={p}
                index={i}
                open={openPhase === i}
                onToggle={() => setOpenPhase((cur) => (cur === i ? null : i))}
                hasVisuals={visualPhases.has(i)}
                schedule={p.phaseId === 'design' ? <ScheduleBlock example={example} /> : undefined}
              />
            ))}
          </ol>
        </section>

        {/* MATERI VISUALS */}
        <section data-section="materi" id="materi" aria-labelledby="materi-title" className="scroll-mt-20 border-t border-border py-14 sm:py-20">
          <SectionHeader
            id="materi-title"
            eyebrow="Sumber"
            title="Contoh asli dari materi"
            lead="Gambar berikut diambil langsung dari Materi Proses Bisnis — bukan buatan StatPlan. Pelajari bentuknya, lalu susun versi kegiatan Anda."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shownVisuals.map((v) => (
              <ZoomFigure key={v.key} visual={v} />
            ))}
          </div>
          {visuals.length > 3 ? (
            <div className="mt-5">
              <Button variant="secondary" onClick={() => setShowAllVisuals((s) => !s)}>
                {showAllVisuals
                  ? 'Tampilkan lebih sedikit'
                  : `Tampilkan ${visuals.length - 3} contoh lainnya`}
              </Button>
            </div>
          ) : null}
        </section>

        {/* TAKEAWAYS */}
        <section data-section="tiru" aria-labelledby="tiru" className="border-t border-border py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
            <SectionHeader id="tiru" eyebrow="Untuk rencana Anda" title="Apa yang bisa saya tiru?" />
            <div>
              <ol className="space-y-5">
                {example.takeaways.map((t, i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-display text-lg tabular-nums text-accent-700" aria-hidden>
                      {i + 1}
                    </span>
                    <p className="text-[15px] leading-relaxed text-ink-900 sm:text-base">{t}</p>
                  </li>
                ))}
              </ol>
              <SourceNote kind="C" className="mt-6" />
            </div>
          </div>
        </section>
      </main>

      {/* START */}
      <section data-section="mulai" aria-labelledby="mulai" className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Buat versi saya
            </p>
            <h2 id="mulai" className="mt-3 font-display text-2xl font-semibold leading-snug sm:text-3xl">
              Siap menyusun rencana Anda sendiri?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/75">
              StatPlan mengisi awal rencana dari contoh ini. Anda bebas mengubah semuanya, lalu Mode
              Terpandu membimbing Anda melewati 44 subproses GSBPM satu per satu.
            </p>
            <p className="mt-4 inline-flex items-start gap-2 text-sm text-white/80">
              <ShieldTick size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0 text-accent" aria-hidden />
              Contoh asli tetap aman. Anda akan membuat salinan untuk rencana Anda sendiri.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <Button
              size="lg"
              variant="gold"
              onClick={() => navigate(startHref)}
              rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
            >
              Mulai dari contoh ini
            </Button>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
              <span>Contoh lain:</span>
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={`/contoh/${o.slug}`}
                  className="focus-ring rounded font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  {o.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:hidden">
        <Button
          className="w-full"
          onClick={() => navigate(startHref)}
          rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
        >
          Mulai dari contoh ini
        </Button>
      </div>
    </div>
  )
}
