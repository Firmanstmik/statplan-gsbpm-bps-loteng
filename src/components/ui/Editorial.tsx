import type { ReactNode } from 'react'
import { Book1 } from 'iconsax-react'
import { cn } from '@/lib/utils'

/**
 * Shared editorial primitives — one visual language for Example, Guided, Workspace.
 *
 * Source hierarchy (see docs/claude-source-inventory.md):
 *   A      Menurut Materi Proses Bisnis · Hal. N
 *   B      Penjelasan sederhana berdasarkan materi
 *   C      Contoh ilustratif StatPlan
 *   FORMAT Format kerja StatPlan
 *   USER   Isian Anda
 *   STATPLAN Penjelasan StatPlan (how StatPlan works; used by the FAQ)
 */
import { sourceLabel, type SourceKind } from '@/lib/sourceLabel'

export function SourceNote({
  kind,
  page,
  className,
}: {
  kind: SourceKind
  page?: number | string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium leading-none',
        kind === 'A' ? 'text-ink-800' : 'text-ink-500',
        className,
      )}
    >
      {kind === 'A' ? (
        <Book1 size={12} variant="Bold" color="currentColor" className="text-accent" aria-hidden />
      ) : (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink-300" />
      )}
      {sourceLabel(kind, page)}
    </span>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  id,
  className,
  as: Tag = 'h2',
  aside,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  id?: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  aside?: ReactNode
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3',
        aside ? 'sm:flex-row sm:items-end sm:justify-between' : 'self-start',
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="t-eyebrow mb-2">{eyebrow}</p> : null}
        <Tag id={id} className={Tag === 'h1' ? 't-page-title' : 't-section-title'}>
          {title}
        </Tag>
        {lead ? <p className="t-body mt-2.5">{lead}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  )
}

export function InfoGrid({
  items,
  className,
  columns = 3,
}: {
  items: { label: string; value: ReactNode }[]
  className?: string
  columns?: 2 | 3
}) {
  return (
    <dl
      className={cn(
        'grid gap-px overflow-hidden rounded-2xl border border-border bg-border',
        columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
    >
      {items.map((it) => (
        <div key={it.label} className="bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
          <dt className="t-label">{it.label}</dt>
          <dd className="mt-1.5 text-[15px] leading-snug text-ink-950">{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
