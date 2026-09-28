import { TickSquare } from 'iconsax-react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  className,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  hint?: ReactNode
  className?: string
  id?: string
}) {
  const autoId = useId()
  const boxId = id ?? autoId
  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 transition-all duration-200',
        'hover:border-ink-600/25 hover:bg-ink-50/80 hover:shadow-sm',
        checked && 'border-success/30 bg-success-soft/40',
        className,
      )}
    >
      <button
        id={boxId}
        type="button"
        role="checkbox"
        aria-checked={checked}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 focus-ring',
          checked
            ? 'scale-100 border-success bg-success text-white shadow-sm'
            : 'border-border-strong bg-white group-hover:border-ink-600/40',
        )}
        onClick={() => onChange(!checked)}
      >
        {checked ? (
          <TickSquare
            size={14}
            variant="Bold"
            color="currentColor"
            className="animate-[fade-in_0.15s_ease-out]"
          />
        ) : null}
      </button>
      {/* A real <label> names the checkbox and forwards clicks to it (one control, one Tab stop). */}
      <label htmlFor={boxId} className="min-w-0 flex-1 cursor-pointer text-left text-sm text-ink-800">
        {label}
        {hint}
      </label>
    </div>
  )
}
