import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight2,
  MagicStar,
  Hierarchy,
  DocumentText,
  TickCircle,
  TaskSquare,
} from 'iconsax-react'
import { markOnboardingDone } from '@/demo/seed'
import { Button } from '@/components/ui/Button'
import { BrandLockup } from '@/components/branding/BrandLockup'

const steps = [
  {
    title: 'Selamat datang di StatPlan',
    body: 'Platform perencanaan kegiatan statistik untuk OPD Kabupaten Lombok Tengah, dipandu kerangka GSBPM 5.2. Keluaran aplikasi berstatus draf bahan kerja — bukan persetujuan resmi BPS.',
    icon: MagicStar,
  },
  {
    title: 'Apa itu StatPlan?',
    body: 'Ruang kerja untuk menyusun kebutuhan data, checklist fase, instrumen, metadata, dan draf dokumen — bukan modul pelatihan dan bukan entri data lapangan.',
    icon: DocumentText,
  },
  {
    title: 'Bagaimana cara mengerjakannya?',
    body: 'Portal rujukan → checklist GSBPM → perancangan → variabel → instrumen (jika perlu) → metadata → rekomendasi BPS (sektoral) → ekspor draf Word. Ikuti kartu “Langkah berikutnya” di dalam proyek.',
    icon: Hierarchy,
  },
  {
    title: 'Tutorial singkat',
    body: 'Beranda → buka proyek demo → kerjakan dari Alur kerja. Buka menu Bantuan untuk SOP 9 langkah. Mode Presentasi berisi naskah bila Anda mendemokan ke orang lain.',
    icon: TaskSquare,
  },
  {
    title: 'Siap mulai tanpa dipandu',
    body: 'Muat data demo di Beranda/Pengaturan untuk melihat 5 contoh OPD, atau buat proyek baru. Semua petunjuk ada di kartu Langkah berikutnya dan halaman Bantuan.',
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
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-gold-400">
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
