import { cn } from '@/lib/utils'
import type { GuidedDraftStatus } from '@/content/guidedNeedPreparation'
import { draftStatusLabel } from '@/content/guidedNeedPreparation'

export function GuidedDraftStatus({
  status,
  className,
  compact,
}: {
  status: GuidedDraftStatus
  className?: string
  compact?: boolean
}) {
  const label = draftStatusLabel(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        status === 'ready'
          ? 'text-ink-900'
          : status === 'partial'
            ? 'text-ink-700'
            : 'text-ink-500',
        className,
      )}
    >
      <span aria-hidden className="tabular-nums">
        {status === 'ready' ? '✓' : status === 'partial' ? '◐' : '○'}
      </span>
      <span>
        {compact ? label : `Draft: ${label}`}
      </span>
    </span>
  )
}
