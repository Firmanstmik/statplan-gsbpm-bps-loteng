import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight2, TickCircle } from 'iconsax-react'
import { BrandLockup } from '@/components/branding/BrandLockup'
import { Button } from '@/components/ui/Button'
import { HOW_IT_WORKS_STEPS, LANDING_EXAMPLES, LANDING_OUTPUTS } from '@/content/landingExamples'
import { GUIDED_PHASES } from '@/content/guidedCards'
import { jenisLabel } from '@/lib/utils'

/**
 * Homepage — answers in a few seconds: what StatPlan is, how it helps, and what to do next
 * (start planning, or learn from an example first). No invented metrics or endorsements.
 */

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

const TOTAL_SUBPROCESSES = GUIDED_PHASES.reduce((n, p) => n + p.cards.length, 0)

/** Gentle entrance for below-the-fold sections; static when reduced motion is requested. */
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionIntro({
  id,
  eyebrow,
  title,
  lead,
}: {
  id: string
  eyebrow: string
  title: string
  lead?: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="t-eyebrow mb-3">{eyebrow}</p>
      <h2 id={id} className="text-balance font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-ink-950 sm:text-4xl">
        {title}
      </h2>
      {lead ? <p className="mt-4 text-base leading-relaxed text-ink-700 sm:text-lg">{lead}</p> : null}
    </div>
  )
}

const navLinks = [
  { label: 'Contoh', href: '#contoh' },
  { label: 'Cara kerja', href: '#cara-kerja' },
  { label: 'Presentasi', to: '/app/presentation' },
  { label: 'Proyek saya', to: '/app' },
] as const

export function LandingPage() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="landing-page relative min-h-dvh bg-surface-muted text-ink-950">
      <header className="absolute inset-x-0 top-0 z-20 pt-[env(safe-area-inset-top)] text-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link to="/" className="focus-ring min-w-0 rounded-lg" aria-label="StatPlan — beranda">
              <BrandLockup size="sm" inverted compact className="min-w-0" />
            </Link>
            <nav aria-label="Navigasi halaman depan" className="hidden shrink-0 items-center gap-0.5 whitespace-nowrap md:flex lg:gap-1">
              {navLinks.map((item) =>
                'href' in item ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(item.href.slice(1))
                    }}
                    className="focus-ring rounded-lg px-2.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 lg:px-3"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="focus-ring rounded-lg px-2.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 lg:px-3"
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <Link
                to="/app/new"
                className="focus-ring ml-2 inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-white/90"
              >
                Rencana baru
              </Link>
            </nav>
            <Link
              to="/app"
              className="focus-ring inline-flex h-11 items-center rounded-xl border border-white/25 px-3.5 text-sm font-semibold text-white md:hidden"
            >
              Proyek saya
            </Link>
          </div>
      </header>

      <main id="konten">
      {/* ——— HERO (dark, photographic) ——— */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate overflow-hidden bg-ink-950 pt-16 text-white"
      >
        <picture className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <source media="(max-width: 767px)" srcSet={assetUrl('/landing/hero-mobile-bps.png')} />
          <img
            src={assetUrl('/landing/hero-bps.png')}
            alt=""
            className="h-full w-full object-cover object-[center_30%] md:object-[70%_40%]"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-ink-950/70 md:bg-transparent md:bg-gradient-to-r md:from-ink-950/95 md:via-ink-950/70 md:to-ink-950/10"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950/80 to-transparent" aria-hidden />


          <div className="mx-auto flex max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 md:min-h-[min(46rem,calc(100dvh-4rem))] md:pb-28">
            <div className="max-w-[40rem]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f7b76e] sm:text-xs">
                Simulator perencanaan kegiatan statistik
              </p>
              <h1
                id="hero-heading"
                className="mt-4 text-balance font-display text-[2.05rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]"
              >
                Susun kegiatan statistik dengan langkah yang lebih jelas.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                StatPlan membantu Anda memahami apa yang perlu disiapkan, mengikuti prosesnya satu
                langkah demi satu langkah, dan menghasilkan draf rencana yang tersusun.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="inverse"
                  rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
                  onClick={() => navigate('/app/new')}
                >
                  Mulai perencanaan
                </Button>
                <Button
                  size="lg"
                  variant="inverseOutline"
                  onClick={() => scrollTo('contoh')}
                >
                  Pelajari contoh
                </Button>
              </div>
              <p className="mt-5 text-sm text-white/80">
                Tidak perlu paham GSBPM dulu. Hasilnya berupa draf, bukan dokumen resmi BPS.
              </p>
            </div>
          </div>
      </section>

      {/* ——— HOW IT WORKS ——— */}
      <section id="cara-kerja" aria-labelledby="cara-kerja-heading" className="scroll-mt-4 border-b border-border">
        <Reveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionIntro
            id="cara-kerja-heading"
            eyebrow="Cara kerja"
            title="Empat langkah, dari kebutuhan sampai draf"
          />
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <li key={step.number} className="border-t-2 border-ink-900 pt-5">
                <span className="font-display text-sm tabular-nums text-accent-700">{step.number}</span>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-ink-950">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{step.description}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* ——— EXAMPLES ——— */}
      <section id="contoh" aria-labelledby="contoh-heading" className="scroll-mt-4 border-b border-border">
        <Reveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionIntro
            id="contoh-heading"
            eyebrow="Belajar dari contoh"
            title="Belum tahu harus mulai dari mana?"
            lead="Pelajari contoh kegiatan statistik yang sudah disusun langkah demi langkah — lalu mulai rencana Anda dari contoh itu."
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {LANDING_EXAMPLES.map((ex) => (
              <li key={ex.slug} className="min-w-0">
                <Link
                  to={`/contoh/${ex.slug}`}
                  aria-label={`Pelajari contoh: ${ex.title}`}
                  className="focus-ring group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-ink-400"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                    {jenisLabel(ex.jenis)}
                  </span>
                  <span className="mt-3 text-lg font-semibold leading-snug text-ink-950">{ex.title}</span>
                  <span className="mt-2 text-[15px] leading-relaxed text-ink-700">{ex.purpose}</span>
                  <span className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-ink-800">
                    <span className="block text-xs font-medium text-ink-500">Yang bisa dipelajari</span>
                    {ex.lesson}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink-950">
                    Pelajari contoh
                    <ArrowRight2
                      size={14}
                      variant="Bold"
                      color="currentColor"
                      className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink-500">
            Contoh ilustratif buatan StatPlan untuk belajar — bukan data kegiatan nyata.
          </p>
        </Reveal>
      </section>

      {/* ——— GSBPM ——— */}
      <section aria-labelledby="gsbpm-heading" className="border-b border-border bg-surface">
        <Reveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionIntro
            id="gsbpm-heading"
            eyebrow="Kerangka di baliknya"
            title="Tersusun mengikuti GSBPM 5.2"
            lead="StatPlan menggunakan GSBPM sebagai kerangka untuk membantu menyusun kegiatan statistik secara terstruktur. Anda tidak perlu mempelajarinya lebih dulu — StatPlan menjelaskannya sambil jalan."
          />
          <ol className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {GUIDED_PHASES.map((p, i) => (
              <li key={p.intro.phaseId} className="bg-surface px-4 py-4 sm:px-5 sm:py-5">
                <span className="font-display text-sm tabular-nums text-accent-700">{i + 1}</span>
                <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink-950">{p.intro.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {p.intro.officialTitle.split(' (')[0]} · {p.cards.length} subproses
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-col gap-2 text-sm leading-relaxed text-ink-600 sm:flex-row sm:justify-between sm:gap-8">
            <p className="max-w-2xl">
              GSBPM bersifat fleksibel: fase bisa berulang atau berjalan bersamaan. Mode Terpandu
              StatPlan hanya mengurutkannya agar mudah dipelajari.
            </p>
            <p className="shrink-0 text-ink-500">
              8 fase · {TOTAL_SUBPROCESSES} subproses · sumber: Materi Proses Bisnis
            </p>
          </div>
        </Reveal>
      </section>

      {/* ——— OUTPUT ——— */}
      <section aria-labelledby="hasil-heading" className="border-b border-border">
        <Reveal className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <SectionIntro
            id="hasil-heading"
            eyebrow="Hasil akhir"
            title="Apa yang Anda dapatkan?"
            lead="Draf rencana kegiatan dalam format Word (.docx), tersusun mengikuti fase GSBPM dan siap Anda tinjau bersama tim."
          />
          <div>
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {LANDING_OUTPUTS.map((item) => (
                <li key={item} className="flex items-start gap-3 px-5 py-3.5">
                  <TickCircle size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0 text-ink-900" aria-hidden />
                  <span className="text-[15px] text-ink-900">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Sebelum mengunduh, StatPlan menunjukkan apa yang masih perlu dilengkapi. Hasilnya
              tetap berupa draf bahan kerja.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ——— HONESTY ——— */}
      <section aria-labelledby="tentang-heading" className="border-b border-border bg-surface">
        <Reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 id="tentang-heading" className="t-label">
            Tentang StatPlan
          </h2>
          <div className="mt-5 grid gap-8 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-[15px] font-semibold text-ink-950">StatPlan adalah</p>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-700">
                <li>Simulator dan media belajar perencanaan kegiatan statistik.</li>
                <li>Berbasis GSBPM 5.2 dari Materi Proses Bisnis.</li>
                <li>Alat bantu menyusun persiapan secara terstruktur, di browser Anda.</li>
              </ul>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink-950">StatPlan bukan</p>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-700">
                <li>Sistem operasional atau sistem persetujuan resmi BPS.</li>
                <li>Pengganti prosedur lembaga atau penilaian ahli metodologi.</li>
                <li>Penghasil dokumen resmi — semua keluaran berstatus draf.</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ——— FAQ ——— */}
      <section aria-labelledby="faq-heading" className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="faq-heading" className="t-section-title text-balance">
              Masih bingung?
            </h2>
            <p className="t-body mt-2">
              Temukan jawaban sederhana tentang StatPlan, GSBPM, dan proses kegiatan statistik.
            </p>
          </div>
          <Button variant="secondary" className="w-full shrink-0 md:w-auto" onClick={() => navigate('/app/faq')}>
            Lihat FAQ
          </Button>
        </div>
      </section>

      {/* ——— FINAL CTA ——— */}
      <section aria-labelledby="mulai-heading" className="bg-ink-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 id="mulai-heading" className="text-balance font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Siap menyusun rencana Anda?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/75">
                Mulai dari kebutuhan Anda sendiri, atau pelajari contoh terlebih dahulu.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="inverse"
                rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
                onClick={() => navigate('/app/new')}
              >
                Mulai perencanaan
              </Button>
              <Button
                size="lg"
                variant="inverseOutline"
                onClick={() => scrollTo('contoh')}
              >
                Pelajari contoh
              </Button>
            </div>
          </div>
        </div>
      </section>
      </main>

      <footer className="border-t border-white/10 bg-ink-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>StatPlan · simulator perencanaan kegiatan statistik · keluaran berupa draf</p>
            <nav aria-label="Tautan footer" className="-mx-2 flex flex-wrap">
              {[
                { label: 'Proyek saya', to: '/app' },
                { label: 'Presentasi', to: '/app/presentation' },
                { label: 'FAQ', to: '/app/faq' },
                { label: 'Tentang', to: '/app/about' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="focus-ring inline-flex min-h-11 items-center rounded-lg px-2 text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
      </footer>
    </div>
  )
}
