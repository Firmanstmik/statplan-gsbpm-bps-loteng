import { Link } from 'react-router-dom'
import { ArrowDown2, MessageQuestion } from 'iconsax-react'
import { SourceNote } from '@/components/ui/Editorial'
import { faqHref, faqItem, type FaqBlock } from '@/content/faq'
import { cn } from '@/lib/utils'

/** Renders an FAQ answer: strings are paragraphs, arrays are bullet lists. */
export function FaqAnswer({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) =>
        Array.isArray(b) ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-ink-300">
            {b.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b}</p>
        ),
      )}
    </div>
  )
}

/** Subtle contextual link to one FAQ answer. Label defaults to the question itself. */
export function FaqLink({ id, label, className }: { id: string; label?: string; className?: string }) {
  const item = faqItem(id)
  if (!item) return null
  return (
    <Link
      to={faqHref(id)}
      className={cn(
        'focus-ring inline-flex min-h-6 items-center gap-1.5 rounded text-[13px] font-medium text-ink-700 underline decoration-ink-300 underline-offset-4 hover:text-ink-950 hover:decoration-ink-900',
        className,
      )}
    >
      <MessageQuestion size={14} color="currentColor" aria-hidden className="shrink-0 text-ink-500" />
      {label ?? item.q}
    </Link>
  )
}

/**
 * The same FAQ answer shown in place (native disclosure) — for forms whose unsaved input would be
 * lost by navigating away, such as the intake.
 */
export function FaqInline({ id, label, className }: { id: string; label?: string; className?: string }) {
  const item = faqItem(id)
  if (!item) return null
  return (
    <details className={cn('group', className)}>
      <summary className="focus-ring inline-flex min-h-6 cursor-pointer list-none items-center gap-1.5 rounded text-[13px] font-medium text-ink-700 underline decoration-ink-300 underline-offset-4 hover:text-ink-950 [&::-webkit-details-marker]:hidden">
        <MessageQuestion size={14} color="currentColor" aria-hidden className="shrink-0 text-ink-500" />
        {label ?? item.q}
        <ArrowDown2 size={12} color="currentColor" aria-hidden className="text-ink-500 group-open:rotate-180" />
      </summary>
      <div className="t-support mt-2 rounded-xl bg-ink-50 px-3.5 py-3 text-ink-700">
        <FaqAnswer blocks={item.a} />
        <SourceNote kind={item.source.kind} page={item.source.page} className="mt-2.5" />
      </div>
    </details>
  )
}
