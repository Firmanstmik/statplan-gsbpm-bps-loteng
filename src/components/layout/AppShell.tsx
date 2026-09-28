import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Category,
  Add,
  Setting2,
  Book1,
  InfoCircle,
  PresentionChart,
  SearchNormal1,
} from 'iconsax-react'
import type { Icon } from 'iconsax-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrandLockup } from '@/components/branding/BrandLockup'
import { OnboardingOverlay } from '@/features/onboarding/OnboardingOverlay'
import { ShareImportBanner } from '@/features/share/ShareImportBanner'
import { ToastHost } from '@/components/ui/ToastHost'
import { isOnboardingDone } from '@/demo/seed'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

/** Primary destinations. Search and settings live as icon buttons; “Tentang” in the footer.
 *  The rule-based Asisten duplicates the intake suggestion, so it lives under Pengaturan, not here. */
const nav: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/app', label: 'Proyek saya', icon: Category, end: true },
  { to: '/contoh/skm', label: 'Contoh', icon: Book1 },
  { to: '/app/presentation', label: 'Presentasi', icon: PresentionChart },
  { to: '/app/faq', label: 'FAQ', icon: InfoCircle },
]

const mobileNav: {
  to: string
  label: string
  icon: Icon
  end?: boolean
  primary?: boolean
}[] = [
  { to: '/app', label: 'Proyek', icon: Category, end: true },
  { to: '/contoh/skm', label: 'Contoh', icon: Book1 },
  { to: '/app/new', label: 'Baru', icon: Add, primary: true },
  { to: '/app/search', label: 'Cari', icon: SearchNormal1 },
  { to: '/app/settings', label: 'Atur', icon: Setting2 },
]

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())

  return (
    <div className="min-h-dvh">
      {showOnboarding ? <OnboardingOverlay onDone={() => setShowOnboarding(false)} /> : null}
      <ToastHost />

      <header className="sticky top-0 z-40 border-b border-border bg-surface/92 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-6 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="focus-ring min-h-11 min-w-0 shrink rounded-xl px-0.5 transition-opacity duration-200 active:opacity-80"
            aria-label="Beranda StatPlan"
          >
            <BrandLockup size="sm" compact className="sm:gap-2.5" />
          </button>

          <nav aria-label="Navigasi utama" className="hidden flex-1 items-center gap-1 xl:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-ink-950 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-ink-900'
                      : 'text-ink-600 hover:text-ink-950',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              className="focus-ring hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-950 xl:inline-flex"
              aria-label="Cari"
              onClick={() => navigate('/app/search')}
            >
              <SearchNormal1 size={18} color="currentColor" aria-hidden />
            </button>
            <button
              type="button"
              className="focus-ring hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-950 xl:inline-flex"
              aria-label="Pengaturan"
              onClick={() => navigate('/app/settings')}
            >
              <Setting2 size={18} color="currentColor" aria-hidden />
            </button>
            <button
              type="button"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-950 xl:hidden"
              aria-label="FAQ"
              onClick={() => navigate('/app/faq')}
            >
              <InfoCircle size={20} color="currentColor" aria-hidden />
            </button>
            <div className="hidden sm:block">
              <Button
                size="sm"
                className="h-10 min-h-10 px-3.5"
                leftIcon={<Add size={16} color="currentColor" aria-hidden />}
                onClick={() => navigate('/app/new')}
              >
                Rencana baru
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 xl:pb-10">
        <ShareImportBanner />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl xl:hidden"
        aria-label="Navigasi utama (seluler)"
      >
        <div className="grid grid-cols-5 items-end gap-0.5 px-1.5 pb-1.5 pt-1.5">
          {mobileNav.map((item) => {
            if (item.primary) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label="Rencana baru"
                  className="focus-ring group relative flex min-h-14 flex-col items-center justify-end gap-1 rounded-xl px-1 pb-1 text-[10px] font-semibold text-ink-700"
                >
                  <span className="absolute -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-[0_6px_16px_rgb(21_50_75/0.25)] transition-transform active:scale-95">
                    <item.icon size={22} color="currentColor" aria-hidden />
                  </span>
                  <span className="mt-8 leading-none">{item.label}</span>
                </NavLink>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-semibold transition-colors active:bg-ink-50',
                    isActive ? 'text-ink-950' : 'text-ink-500',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                        isActive ? 'bg-brand-soft' : '',
                      )}
                    >
                      <item.icon
                        size={20}
                        variant={isActive ? 'Bold' : 'Linear'}
                        color="currentColor"
                        aria-hidden
                      />
                    </span>
                    <span className="leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      <footer className="mx-auto hidden max-w-7xl px-6 pb-10 pt-2 text-xs text-ink-500 xl:block">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <span>
            StatPlan · simulator perencanaan kegiatan statistik · kerangka GSBPM 5.2 (Materi Proses
            Bisnis) · keluaran berupa draf, bukan dokumen resmi BPS
          </span>
          <button
            type="button"
            className="focus-ring rounded-md font-medium text-ink-700 hover:text-ink-950"
            onClick={() => navigate('/app/about')}
          >
            Tentang StatPlan
          </button>
        </div>
      </footer>
    </div>
  )
}
