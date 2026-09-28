import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { forwardRef, useState } from 'react'
import { TickCircle } from 'iconsax-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

/** inverse / inverseOutline are for dark surfaces (landing hero, closing bands). */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'inverse' | 'inverseOutline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  success?: boolean
  tooltip?: string
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white shadow-[0_1px_0_rgb(255_255_255/0.08)_inset] hover:bg-[#1c3f5e] active:bg-ink-950 disabled:bg-ink-900/35 disabled:shadow-none',
  secondary:
    'bg-white text-ink-900 border border-border-strong hover:border-ink-400 hover:bg-surface-muted active:bg-ink-100',
  ghost: 'bg-transparent text-ink-800 hover:bg-ink-100/70 active:bg-ink-100',
  danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
  gold: 'bg-accent text-white font-semibold hover:bg-[#d87a12] active:bg-accent-700',
  inverse: 'bg-white text-ink-950 hover:bg-white/90 active:bg-white/80',
  inverseOutline: 'border border-white/35 bg-transparent text-white hover:bg-white/10 active:bg-white/15',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-11 h-11 px-3.5 text-sm gap-1.5 rounded-xl sm:h-9 sm:min-h-9',
  md: 'min-h-12 h-12 px-4 text-sm gap-2 rounded-xl sm:h-11 sm:min-h-11',
  lg: 'min-h-12 h-12 px-6 text-base gap-2.5 rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    leftIcon,
    rightIcon,
    loading,
    success,
    tooltip,
    disabled,
    onClick,
    ...props
  },
  ref,
) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (loading || disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    window.setTimeout(() => {
      setRipples((r) => r.filter((x) => x.id !== id))
    }, 450)
    onClick?.(e)
  }

  const button = (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex touch-manipulation items-center justify-center overflow-hidden font-medium transition-all duration-200 ease-out focus-ring disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        success && 'success-flash',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-[btn-ripple_0.45s_ease-out_forwards] rounded-full bg-white/35"
          style={{ left: r.x, top: r.y }}
          aria-hidden
        />
      ))}
      {loading ? (
        <span
          className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : success ? (
        <span className="inline-flex shrink-0 text-success">
          <TickCircle size={16} variant="Bold" color="currentColor" />
        </span>
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && !success && rightIcon ? (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  )

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  }
  return button
})
