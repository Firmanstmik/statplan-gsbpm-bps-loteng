import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight2,
  Category,
  ShieldTick,
  PresentionChart,
  Book1,
} from 'iconsax-react'
import { BrandLockup } from '@/components/branding/BrandLockup'
import { Button } from '@/components/ui/Button'
import { Badge, Card } from '@/components/ui/Badge'
import { HOW_IT_WORKS_STEPS, LANDING_EXAMPLES } from '@/content/landingExamples'
import { GSBPM_PHASES } from '@/domain/gsbpm'
import type { GsbpmPhaseId } from '@/domain/types'
import { jenisLabel } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const normalized = path.replace(/^\//, '')
  return `${base}${normalized}`
}

function SectionBackdrop({
  src,
  mobileSrc,
  tone,
  priority,
}: {
  src: string
  mobileSrc?: string
  tone: 'navy' | 'paper' | 'hero'
  priority?: boolean
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <picture>
        {mobileSrc ? (
          <source media="(max-width: 767px)" srcSet={assetUrl(mobileSrc)} />
        ) : null}
        <img
          src={assetUrl(src)}
          alt=""
          className={
            tone === 'hero'
              ? 'h-full w-full object-cover object-[center_22%] md:scale-105 md:object-[72%_40%]'
              : 'h-full w-full scale-105 object-cover'
          }
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'low'}
          loading={priority ? 'eager' : 'lazy'}
        />
      </picture>
      {tone === 'hero' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/25 via-ink-950/15 to-ink-950/88 md:hidden" />
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink-950 via-ink-950/75 to-transparent md:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink-950/92 via-ink-950/55 to-[#06131d]/22 md:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/25 md:block" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_12%,rgba(0,147,221,0.14),transparent_50%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#eb891b]/45 to-transparent" />
        </>
      ) : tone === 'navy' ? (
        <>
          <div className="absolute inset-0 bg-ink-950/84" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/35 via-ink-950/55 to-ink-950/88" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bps-orange/40 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-white/88" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-50/80 via-white/82 to-ink-50/92" />
        </>
      )}
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const projects = useAppStore((s) => s.projects)
  const recent = projects.slice(0, 3)
  const [selectedPhaseId, setSelectedPhaseId] = useState<GsbpmPhaseId>(GSBPM_PHASES[0].id)
  const selectedPhase =
    GSBPM_PHASES.find((phase) => phase.id === selectedPhaseId) ?? GSBPM_PHASES[0]

  function scrollToContoh() {
    const el = document.getElementById('contoh')
    el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="landing-page relative min-h-dvh overflow-hidden bg-ink-950 text-white">
      <div className="relative flex min-h-dvh flex-col">
        <SectionBackdrop
          src="/landing/hero-bps.png"
          mobileSrc="/landing/hero-mobile-bps.png"
          tone="hero"
          priority
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-8%] top-10 hidden h-[28rem] w-[28rem] rounded-full bg-[#0093dd]/12 blur-3xl md:block" />
          <div className="absolute bottom-10 left-1/3 hidden h-56 w-56 rounded-full bg-[#eb891b]/10 blur-3xl md:block" />
        </div>

        <header className="relative z-20 pt-[env(safe-area-inset-top)] md:bg-transparent">
          <div className="border-b border-white/10 bg-ink-950/35 backdrop-blur-xl md:hidden">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={`${import.meta.env.BASE_URL}branding/bps-logo.svg`}
                  alt=""
                  aria-hidden
                  className="h-8 w-auto shrink-0 object-contain drop-shadow-sm"
                />
                <span className="h-6 w-px shrink-0 bg-white/25" aria-hidden />
                <img
                  src={`${import.meta.env.BASE_URL}branding/statplan-logo.png`}
                  alt=""
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-[22%] shadow-md ring-1 ring-white/15"
                />
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[15px] font-semibold tracking-tight text-white">
                    StatPlan
                  </div>
                  <div className="truncate text-[10px] font-medium text-white/55">BPS Loteng</div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Buka Dashboard"
                onClick={() => navigate('/app')}
                className="focus-ring inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-bps-blue px-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgb(0_147_221/0.35)] transition active:scale-[0.97]"
              >
                <Category size={18} variant="Bold" color="currentColor" aria-hidden />
                Masuk
              </button>
            </div>
          </div>

          <div className="relative mx-auto hidden h-16 max-w-6xl items-center justify-between gap-3 px-6 md:flex">
            <BrandLockup size="sm" inverted compact className="min-w-0" />
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="landing-ghost-dark min-h-11 border border-white/10 text-white"
                onClick={() => navigate('/app/presentation')}
              >
                Mode presentasi
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="landing-btn-blue min-h-11 px-3.5"
                aria-label="Buka Dashboard"
                onClick={() => navigate('/app')}
              >
                Buka Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* ——— HERO: product first ——— */}
        <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:justify-center sm:px-6 sm:pb-16 sm:pt-12 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:pb-20 lg:pt-14">
          <div className="min-h-[34vh] flex-1 sm:hidden" aria-hidden />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' }}
            className="max-w-xl pb-2 sm:pb-0"
          >
            <p className="landing-kicker mb-2.5 text-bps-orange sm:mb-4">
              BPS Kabupaten Lombok Tengah
            </p>
            <h1 className="font-display text-[2.45rem] font-semibold leading-[0.96] tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
              StatPlan
            </h1>
            <p className="mt-3 max-w-lg text-[15px] font-medium leading-snug text-white sm:mt-4 sm:text-xl">
              Bantu susun rencana kegiatan statistik dengan langkah yang jelas.
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Ceritakan kegiatan yang ingin Anda lakukan. StatPlan membantu memberi contoh,
              menyusun jadwal, menyiapkan kebutuhan, memeriksa kelengkapan, dan menghasilkan
              draf rencana.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                variant="gold"
                size="lg"
                className="landing-shine min-h-12 w-full sm:w-auto"
                rightIcon={
                  <ArrowRight2 size={18} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={() => navigate('/app/new')}
              >
                Mulai perencanaan
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="landing-ghost-dark min-h-12 w-full border border-white/25 text-white sm:w-auto"
                onClick={scrollToContoh}
              >
                Lihat contoh
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/50 sm:text-xs">
              Tidak perlu paham GSBPM dulu. Anda bisa mengubah rencana nanti · keluaran berstatus
              draf bahan kerja
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.12 }}
            className="mt-10 hidden lg:mt-0 lg:block"
          >
            <div className="float-soft rounded-[1.75rem] border border-white/12 bg-ink-950/45 p-6 shadow-(--shadow-lift) backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                Cara kerja singkat
              </p>
              <ol className="mt-5 space-y-3">
                {HOW_IT_WORKS_STEPS.map((step) => (
                  <li key={step.number} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bps-orange/15 text-xs font-semibold text-bps-orange ring-1 ring-bps-orange/20">
                      {step.number}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{step.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ——— HOW IT WORKS (product) ——— */}
      <section
        aria-labelledby="how-it-works-heading"
        className="relative z-10 overflow-hidden text-ink-950"
      >
        <SectionBackdrop src="/landing/workspace-desk.png" tone="paper" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
          className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="max-w-2xl">
            <p className="landing-kicker mb-3 text-bps-blue">Langkah sederhana</p>
            <h2
              id="how-it-works-heading"
              className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Bagaimana StatPlan membantu?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-700">
              Tidak perlu memahami seluruh kerangka proses terlebih dahulu. Mulai dari kebutuhan
              Anda, lihat contoh, lalu susun rencana langkah demi langkah.
            </p>
          </div>

          <ol className="mt-10 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.li
                key={step.number}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: reduceMotion ? 0 : 0.35,
                  delay: reduceMotion ? 0 : index * 0.05,
                }}
                className="rounded-2xl border border-ink-900/10 bg-white/90 p-5"
              >
                <span className="font-display text-2xl font-semibold text-ink-900/20">
                  {step.number.padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{step.description}</p>
              </motion.li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-ink-900/10 bg-white/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                <ShieldTick size={18} variant="Bold" color="currentColor" aria-hidden />
                Tetap menjadi draf dan bahan kerja
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                StatPlan bukan sistem pengumpulan data responden atau persetujuan resmi BPS.
              </p>
            </div>
            <Button variant="gold" className="landing-shine shrink-0" onClick={() => navigate('/app/new')}>
              Mulai perencanaan
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ——— EXAMPLES (max 3, Type C) ——— */}
      <section
        id="contoh"
        aria-labelledby="demo-projects-heading"
        className="relative z-10 scroll-mt-4 overflow-hidden border-t border-ink-900/8 text-ink-950"
      >
        <SectionBackdrop src="/landing/opd-district.png" tone="paper" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="landing-kicker text-bps-blue">Titik awal</p>
              <Badge className="bg-bps-blue/10 font-medium text-bps-blue ring-1 ring-bps-blue/20">
                Contoh ilustratif
              </Badge>
            </div>
            <h2
              id="demo-projects-heading"
              className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Lihat contoh terlebih dahulu
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700">
              Belum yakin harus mulai dari mana? Lihat contoh singkat, lalu coba susun versi
              kegiatan Anda sendiri.
            </p>
          </div>

          <ul className="mt-10 grid list-none grid-cols-1 gap-4 md:grid-cols-3">
            {LANDING_EXAMPLES.map((example, index) => (
              <motion.li
                key={example.projectId}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: reduceMotion ? 0 : 0.35,
                  delay: reduceMotion ? 0 : index * 0.04,
                }}
                className="min-w-0"
              >
                <Card
                  hover
                  className="flex h-full flex-col border-ink-900/10 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{jenisLabel(example.jenis)}</Badge>
                    <Badge className="bg-ink-100 font-medium text-ink-700 ring-1 ring-ink-900/8">
                      {example.classificationLabel}
                    </Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-ink-950">
                    {example.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{example.purpose}</p>
                  <p className="mt-4 rounded-xl bg-ink-50 px-3 py-2.5 text-sm text-ink-800">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                      Hasil yang direncanakan
                    </span>
                    <span className="mt-1 block">{example.resultPreview}</span>
                  </p>
                  <div className="mt-auto pt-5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="landing-secondary-light"
                      rightIcon={
                        <ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />
                      }
                      aria-label={`Lihat contoh ${example.title}`}
                      onClick={() => navigate(`/contoh/${example.slug}`)}
                    >
                      Lihat contoh
                    </Button>
                  </div>
                </Card>
              </motion.li>
            ))}
          </ul>

          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-600">
            Contoh ini dibuat StatPlan untuk pembelajaran — bukan contoh resmi dari Materi Proses
            Bisnis, bukan hasil statistik, dan bukan proyek operasional BPS.
          </p>

          <div className="mt-8">
            <Button
              variant="gold"
              className="landing-shine"
              rightIcon={
                <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
              }
              onClick={() => navigate('/app/new')}
            >
              Coba buat sendiri
            </Button>
          </div>
        </div>
      </section>

      {/* ——— GSBPM secondary / reference ——— */}
      <section
        aria-labelledby="gsbpm-heading"
        className="relative z-10 overflow-hidden border-y border-white/10"
      >
        <SectionBackdrop src="/landing/gsbpm-process.png" tone="navy" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
          className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="landing-kicker mb-3 text-bps-orange">Referensi proses</p>
              <h2
                id="gsbpm-heading"
                className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                GSBPM sebagai panduan di balik layar
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                StatPlan menggunakan GSBPM 5.2 sebagai kerangka proses. Anda tidak perlu
                mempelajarinya dulu untuk mulai merencanakan — detail fase tersedia sebagai
                referensi.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Book1 size={16} variant="Bold" color="currentColor" aria-hidden />
              <span>GSBPM 5.2 · fleksibel, bukan urutan wajib</span>
            </div>
          </div>

          <ol className="mt-8 grid list-none grid-cols-2 gap-2 sm:grid-cols-4">
            {GSBPM_PHASES.map((phase) => {
              const active = phase.id === selectedPhase.id
              return (
                <li key={phase.id} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-controls="selected-phase-detail"
                    onClick={() => setSelectedPhaseId(phase.id)}
                    onFocus={() => setSelectedPhaseId(phase.id)}
                    className={`focus-ring h-full w-full rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? 'border-bps-orange/45 bg-bps-orange/12'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${
                        active ? 'text-bps-orange' : 'text-white/40'
                      }`}
                    >
                      {phase.code}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium text-white">
                      {phase.titleId}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div
            id="selected-phase-detail"
            className="mt-3 rounded-xl border border-white/10 bg-ink-900/55 px-4 py-3"
          >
            <p className="text-sm leading-relaxed text-white/70">{selectedPhase.purpose}</p>
          </div>
        </motion.div>
      </section>

      {recent.length > 0 ? (
        <section className="relative z-10 overflow-hidden">
          <SectionBackdrop src="/landing/documents.png" tone="navy" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                Proyek terkini di perangkat ini
              </h2>
              <button
                type="button"
                className="focus-ring rounded-lg px-1.5 py-1 text-xs text-bps-orange hover:text-bps-orange"
                onClick={() => navigate('/app')}
              >
                Lihat semua
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {recent.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/app/projects/${p.id}`)}
                  className="focus-ring rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-bps-orange/35 hover:bg-white/10"
                >
                  <div className="line-clamp-2 text-sm font-semibold text-white">{p.name}</div>
                  <div className="mt-2 text-[11px] text-white/45">
                    {p.rekomendasiBps.penyelenggara || 'OPD'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="final-cta-heading"
        className="relative z-10 overflow-hidden border-t border-ink-900/10 text-ink-950"
      >
        <SectionBackdrop src="/landing/cta-sunrise.png" tone="paper" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="landing-kicker mb-3 text-bps-blue">Siap mencoba?</p>
              <h2
                id="final-cta-heading"
                className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Mulai susun rencana kegiatan Anda.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-700">
                Ceritakan kebutuhan Anda. StatPlan membantu menyusun jadwal, kebutuhan, dan draf
                perencanaan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gold"
                className="landing-shine"
                rightIcon={
                  <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={() => navigate('/app/new')}
              >
                Mulai perencanaan
              </Button>
              <Button
                variant="secondary"
                className="landing-secondary-light"
                onClick={scrollToContoh}
              >
                Lihat contoh
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-ink-900/10 bg-white/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bps-blue text-white"
                aria-hidden
              >
                <PresentionChart size={20} variant="Bold" color="currentColor" />
              </span>
              <div>
                <div className="text-sm font-semibold text-ink-950">
                  Perlu mendemonstrasikan StatPlan?
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-700">
                  Mode presentasi tersedia untuk demonstrasi aplikasi.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="landing-secondary-light shrink-0"
              onClick={() => navigate('/app/presentation')}
            >
              Mode presentasi
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 overflow-hidden border-t border-white/10 px-4 py-8 text-white/60 sm:px-6">
        <SectionBackdrop src="/landing/hero-bps.png" tone="navy" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <div className="text-sm font-semibold text-white">StatPlan</div>
              <p className="mt-1.5 text-xs leading-relaxed">
                Bantu susun rencana kegiatan statistik. Berbasis GSBPM 5.2 sebagai panduan proses.
                Bukan sistem operasional atau mekanisme persetujuan resmi BPS.
              </p>
            </div>
            <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {[
                { label: 'Aplikasi', to: '/app' },
                { label: 'Bantuan', to: '/app/help' },
                { label: 'Tentang', to: '/app/about' },
                { label: 'Presentasi', to: '/app/presentation' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="focus-ring rounded-md text-white/65 transition hover:text-bps-orange"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/45">
            © {new Date().getFullYear()} StatPlan · Konteks demonstrasi BPS Kabupaten Lombok
            Tengah · Keluaran berstatus draf dan bahan kerja.
          </div>
        </div>
      </footer>
    </div>
  )
}
