import { cn } from '@/lib/utils'
import { GUIDED_STEPS } from '@/content/guidedJourney'

export function GuidedProgress({ current }: { current: 1 | 2 | 3 }) {
  const currentStep = GUIDED_STEPS.find((s) => s.id === current)
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
          Langkah {current} dari 6
        </p>
        <p className="mt-0.5 text-sm font-medium text-ink-900 sm:hidden">
          {currentStep?.label}
        </p>
      </div>
      <ol className="hidden gap-1.5 sm:flex" aria-label="Progres panduan">
        {GUIDED_STEPS.map((step) => {
          const active = step.id === current
          const done = step.id < current
          const future = 'future' in step && step.future
          return (
            <li
              key={step.id}
              className="min-w-0 flex-1"
              aria-current={active ? 'step' : undefined}
            >
              <div
                className={cn(
                  'h-1.5 rounded-full',
                  active || done ? 'bg-ink-900' : 'bg-ink-100',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'mt-1.5 block truncate text-[11px]',
                  active ? 'font-semibold text-ink-950' : 'text-ink-500',
                  future && !active ? 'opacity-50' : undefined,
                )}
              >
                {step.short}
                {future ? ' · nanti' : ''}
              </span>
            </li>
          )
        })}
      </ol>
      <div className="flex gap-1 sm:hidden" aria-hidden>
        {GUIDED_STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              step.id <= current ? 'bg-ink-900' : 'bg-ink-100',
            )}
          />
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-ink-500">
        Berbasis GSBPM 5.2 — langkah panduan StatPlan, bukan urutan wajib.
      </p>
    </div>
  )
}
