import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowDown2, SearchNormal1 } from 'iconsax-react'
import { PageHeader } from '@/components/ui/EmptyState'
import { SourceNote } from '@/components/ui/Editorial'
import { FaqAnswer } from '@/components/ui/FaqLink'
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategoryId, type FaqItem } from '@/content/faq'
import { cn } from '@/lib/utils'

/** Lowercase + strip accents so "kompromin", "Kompromin" and quotes all match. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function itemText(item: FaqItem) {
  return normalize([item.q, ...item.a.flat()].join(' '))
}

export function FaqPage() {
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FaqCategoryId | 'all'>('all')
  const [open, setOpen] = useState<Set<string>>(() => new Set())

  // Deep link (/app/faq#apa-itu-variabel): clear filters, open the item, bring it into view.
  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    if (!id || !FAQ_ITEMS.some((f) => f.id === id)) return
    setQuery('')
    setCategory('all')
    setOpen((prev) => new Set(prev).add(id))
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`faq-q-${id}`)
      el?.scrollIntoView({ block: 'start' })
      el?.focus({ preventScroll: true })
    })
  }, [hash])

  const q = normalize(query.trim())
  const visible = useMemo(
    () =>
      FAQ_ITEMS.filter(
        (f) => (category === 'all' || f.category === category) && (!q || itemText(f).includes(q)),
      ),
    [category, q],
  )
  const groups = FAQ_CATEGORIES.map((c) => ({ ...c, items: visible.filter((f) => f.category === c.id) })).filter(
    (g) => g.items.length > 0,
  )

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="FAQ"
        title="Pertanyaan umum"
        description="Jawaban sederhana tentang StatPlan, GSBPM, dan proses kegiatan statistik."
      />

      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            Cari pertanyaan
          </label>
          <SearchNormal1
            size={18}
            color="currentColor"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari, misalnya: variabel, sampel, metadata"
            className="focus-ring h-12 w-full rounded-xl border border-border-strong bg-surface pl-11 pr-4 text-[15px] text-ink-950 placeholder:text-ink-400"
            aria-describedby="faq-count"
          />
        </div>

        {/* Phones: one compact select instead of six rows of chips. */}
        <div className="sm:hidden">
          <label htmlFor="faq-category" className="t-label mb-1.5 block">
            Kategori
          </label>
          <select
            id="faq-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FaqCategoryId | 'all')}
            className="focus-ring h-12 w-full rounded-xl border border-border-strong bg-surface px-3.5 text-[15px] text-ink-950"
          >
            <option value="all">Semua kategori</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div role="group" aria-label="Kategori pertanyaan" className="hidden flex-wrap gap-2 sm:flex">
          {[{ id: 'all' as const, label: 'Semua' }, ...FAQ_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'focus-ring min-h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
                category === c.id
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-border bg-surface text-ink-700 hover:border-ink-300 hover:text-ink-950',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p id="faq-count" className="t-support" aria-live="polite">
          {visible.length === FAQ_ITEMS.length
            ? `${FAQ_ITEMS.length} pertanyaan`
            : `${visible.length} dari ${FAQ_ITEMS.length} pertanyaan`}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center">
          <p className="t-card-title">Belum ada jawaban yang cocok</p>
          <p className="t-support mx-auto mt-1 max-w-sm">Coba kata lain, atau lihat semua pertanyaan.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('all')
            }}
            className="focus-ring mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold text-ink-900 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-900"
          >
            Tampilkan semua pertanyaan
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`faq-cat-${g.id}`}>
              <h2 id={`faq-cat-${g.id}`} className="t-section-title mb-3">
                {g.label}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {g.items.map((f) => {
                  const isOpen = open.has(f.id)
                  return (
                    <li key={f.id} id={f.id} className="scroll-mt-24">
                      <h3>
                        <button
                          type="button"
                          id={`faq-q-${f.id}`}
                          aria-expanded={isOpen}
                          aria-controls={`faq-a-${f.id}`}
                          onClick={() => toggle(f.id)}
                          className="focus-ring flex min-h-14 w-full items-start justify-between gap-4 px-4 py-3.5 text-left sm:px-5"
                        >
                          <span className="t-card-title">{f.q}</span>
                          <ArrowDown2
                            size={16}
                            color="currentColor"
                            aria-hidden
                            className={cn('mt-1 shrink-0 text-ink-500', isOpen && 'rotate-180')}
                          />
                        </button>
                      </h3>
                      <div
                        id={`faq-a-${f.id}`}
                        role="region"
                        aria-labelledby={`faq-q-${f.id}`}
                        hidden={!isOpen}
                        className="reading-width t-body px-4 pb-5 sm:px-5"
                      >
                        <FaqAnswer blocks={f.a} />
                        <SourceNote kind={f.source.kind} page={f.source.page} className="mt-4" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="t-support mt-10 border-t border-border pt-5">
        Belum menemukan jawabannya? Lihat{' '}
        <Link to="/contoh/skm" className="font-medium text-ink-900 underline underline-offset-2">
          contoh kegiatan
        </Link>{' '}
        atau mulai dari Mode Terpandu — setiap subproses dijelaskan satu per satu.
      </p>
    </div>
  )
}
