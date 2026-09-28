import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight2, MagicStar, Hierarchy, TickCircle } from 'iconsax-react'
import { markOnboardingDone } from '@/demo/seed'
import { Button } from '@/components/ui/Button'
import { BrandLockup } from '@/components/branding/BrandLockup'

const steps = [
  {
    title: 'Selamat datang di StatPlan',
    body: 'Simulator untuk belajar dan menyusun rencana kegiatan statistik berbasis GSBPM 5.2. Hasilnya draf bahan kerja — bukan dokumen atau persetujuan resmi BPS.',
    icon: MagicStar,
  },
  {
    title: 'Cara memakainya',
    body: 'Lihat contoh kegiatan → ceritakan kebutuhan Anda → tentukan jadwal → pelajari dan siapkan bahan di Mode Terpandu → periksa di Ruang kerja → unduh draf Word.',
    icon: Hierarchy,
  },
  {
    title: 'Butuh bantuan?',
    body: 'Di setiap proyek, kartu “Langkah berikutnya” menunjukkan apa yang sebaiknya dikerjakan sekarang. Istilah yang membingungkan dijelaskan di FAQ.',
    icon: TickCircle,
  },
]

export function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const current = steps[step]
  const Icon = current.icon

  function finish(goApp?: boolean) {
    markOnboardingDone()
    onDone()
    if (goApp) navigate('/app')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/55 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-white shadow-(--shadow-lift)"
      >
        <div className="border-b border-border bg-ink-50/80 px-6 py-4">
          <BrandLockup size="sm" />
        </div>
        <div className="px-6 py-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-ink-500">
            <Icon size={24} variant="Bold" color="currentColor" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <h2 className="font-display text-2xl font-semibold tracking-tight">{current.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{current.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-ink-900' : 'bg-ink-100'}`}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => finish()}>
              Lewati
            </Button>
            <div className="flex gap-2">
              {step > 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Kembali
                </Button>
              ) : null}
              {step < steps.length - 1 ? (
                <Button
                  size="sm"
                  rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" />}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Lanjut
                </Button>
              ) : (
                <Button variant="gold" size="sm" onClick={() => finish(true)}>
                  Buka beranda
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
