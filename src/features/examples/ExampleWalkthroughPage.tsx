import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft2, ArrowRight2, Lock, TickCircle } from 'iconsax-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  EXAMPLE_WALKTHROUGH_STEPS,
  getExampleBySlug,
  sourceBadgeLabel,
  type ExamplePreparePhase,
  type PrepareItem,
  type TemplateCard,
} from '@/content/exampleJourney'
import {
  allocatePhaseDates,
  formatDateID,
  validateProjectDateRange,
} from '@/content/planningTimeline'
import { cn, jenisLabel } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4

function Progress({ current }: { current: Step }) {
  return (
    <nav aria-label="Tahap contoh" className="space-y-3">
      <p className="text-sm text-ink-700 sm:hidden">
        Langkah {current} dari 4
        <span className="font-semibold text-ink-950">
          {' '}
          · {EXAMPLE_WALKTHROUGH_STEPS[current - 1]?.label}
        </span>
      </p>
      <div className="flex gap-1.5 sm:hidden" aria-hidden>
        {EXAMPLE_WALKTHROUGH_STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              'h-2 flex-1 rounded-full',
              s.id <= current ? 'bg-ink-900' : 'bg-ink-200',
            )}
          />
        ))}
      </div>
      <ol className="hidden list-none gap-2 sm:grid sm:grid-cols-4">
        {EXAMPLE_WALKTHROUGH_STEPS.map((s) => {
          const active = s.id === current
          const done = s.id < current
          return (
            <li key={s.id} aria-current={active ? 'step' : undefined}>
              <div
                className={cn(
                  'rounded-xl px-3 py-2.5 text-center text-sm ring-1',
                  active
                    ? 'bg-ink-900 font-semibold text-white ring-ink-900'
                    : done
                      ? 'bg-ink-100 font-medium text-ink-800 ring-ink-900/10'
                      : 'bg-white text-ink-500 ring-border',
                )}
              >
                <span className="block text-[10px] uppercase tracking-wide opacity-70">
                  {String(s.id).padStart(2, '0')}
                </span>
                {s.label}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function SourceBadge({
  sourceType,
  pdfPage,
}: {
  sourceType: 'pdf' | 'illustrative'
  pdfPage?: number | string
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full rounded-lg px-2 py-1 text-[11px] font-medium ring-1',
        sourceType === 'pdf'
          ? 'bg-bps-blue/10 text-bps-blue ring-bps-blue/25'
          : 'bg-ink-100 text-ink-700 ring-ink-900/10',
      )}
    >
      {sourceBadgeLabel({ sourceType, pdfPage })}
    </span>
  )
}

function TemplatePreview({ template }: { template: TemplateCard }) {
  const hasFields = Boolean(template.fields && template.fields.length > 0)
  return (
    <div className="rounded-xl border border-dashed border-ink-900/15 bg-white px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        {template.sourceType === 'illustrative' || hasFields
          ? 'Format kerja StatPlan'
          : 'Template'}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-950">{template.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-700">{template.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SourceBadge sourceType={template.sourceType} pdfPage={template.pdfPage} />
        {hasFields ? (
          <span className="text-[11px] text-ink-500">Preview format kerja</span>
        ) : template.status === 'coming_soon' ? (
          <span className="text-[11px] text-ink-500">
            Struktur format sedang disusun — bukan unduhan template resmi
          </span>
        ) : (
          <span className="text-[11px] text-ink-500">Preview format</span>
        )}
      </div>
      {hasFields ? (
        <dl className="mt-3 space-y-2 border-t border-ink-900/10 pt-3">
          {template.fields!.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                {f.label}
              </dt>
              <dd className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-ink-900">
                {f.example?.trim() ? f.example : '…'}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {template.note ? (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-600">{template.note}</p>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
        Bukan template resmi BPS kecuali dilabeli sumber materi secara eksplisit. StatPlan
        menampilkan format kerja di sini — tidak menyediakan unduhan template resmi.
      </p>
    </div>
  )
}

function ContohBlock({ item }: { item: PrepareItem }) {
  const [open, setOpen] = useState(false)
  const hasDetail = Boolean(item.contohDetail && item.contohDetail.length > 0)
  const hasLessons = Boolean(item.lessonPoints && item.lessonPoints.length > 0)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Contoh</p>
        <SourceBadge sourceType={item.sourceType} pdfPage={item.pdfPage} />
      </div>
      <div className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-ink-900/5">
        <p className="text-sm font-medium leading-relaxed text-ink-950">{item.contoh}</p>
        {hasDetail ? (
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 px-2 text-xs font-semibold text-ink-800"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Sembunyikan contoh lengkap' : 'Lihat contoh lengkap'}
            </Button>
            {open ? (
              <dl className="mt-2 space-y-2.5 border-t border-ink-900/10 pt-2.5">
                {item.contohDetail!.map((row) => (
                  <div key={row.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-ink-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </div>
      {hasLessons ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Yang bisa dipelajari
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink-800">
            {item.lessonPoints!.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function PrepareLearn({
  items,
  onPhaseComplete,
}: {
  items: PrepareItem[]
  onPhaseComplete?: (complete: boolean) => void
}) {
  const [understood, setUnderstood] = useState<Set<string>>(() => new Set())
  const [openId, setOpenId] = useState<string | null>(null)
  const baseId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)

  const unlockedIndex = Math.min(understood.size, items.length - 1)
  const allDone = items.length > 0 && items.every((i) => understood.has(i.id))

  useEffect(() => {
    onPhaseComplete?.(allDone)
  }, [allDone, onPhaseComplete])

  useEffect(() => {
    setUnderstood(new Set())
    setOpenId(null)
  }, [items])

  function canOpen(index: number) {
    return index <= unlockedIndex || understood.has(items[index]!.id)
  }

  function toggle(id: string, index: number) {
    if (!canOpen(index)) return
    setOpenId((cur) => (cur === id ? null : id))
  }

  function markUnderstood(id: string) {
    setUnderstood((prev) => new Set(prev).add(id))
    setOpenId(null)
  }

  useEffect(() => {
    if (openId && panelRef.current) panelRef.current.focus()
  }, [openId])

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-ink-100/80 px-3.5 py-3 text-sm leading-relaxed text-ink-800">
        Urutan belajar: <strong>Apa?</strong> → <strong>Contoh</strong> →{' '}
        <strong>Template</strong> → <strong>Bukti dukung</strong>. Tandai sudah memahami
        setelah meninjau — bukan berarti kegiatan selesai atau disetujui BPS.
      </p>
      <ul className="space-y-2.5">
        {items.map((item, index) => {
          const open = openId === item.id
          const done = understood.has(item.id)
          const locked = !canOpen(index)
          const regionId = `${baseId}-${item.id}`
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={locked}
                aria-expanded={open}
                aria-controls={regionId}
                aria-disabled={locked || undefined}
                title={locked ? 'Buka item sebelumnya terlebih dahulu' : undefined}
                onClick={() => toggle(item.id, index)}
                className={cn(
                  'focus-ring flex w-full min-h-12 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                  locked
                    ? 'cursor-not-allowed border-border/60 bg-ink-50/50 opacity-55'
                    : open
                      ? 'border-ink-900/20 bg-white shadow-sm'
                      : 'border-border bg-white hover:border-ink-900/15 hover:bg-ink-50/70',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    done
                      ? 'bg-ink-900 text-white'
                      : locked
                        ? 'bg-ink-200 text-ink-400'
                        : 'bg-ink-100 text-ink-500 ring-1 ring-ink-900/10',
                  )}
                  aria-hidden
                >
                  {done ? '✓' : locked ? '·' : '○'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink-950">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {item.subprocess}
                    {locked
                      ? ' · buka item sebelumnya dulu'
                      : done
                        ? open
                          ? ' · dibuka'
                          : ' · sudah dipahami'
                        : ' · klik untuk melihat'}
                  </span>
                </span>
                {!locked ? (
                  <span className="text-ink-400" aria-hidden>
                    →
                  </span>
                ) : null}
              </button>
              {open ? (
                <div
                  id={regionId}
                  ref={panelRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={`Persiapan ${item.title}`}
                  className="mt-2 space-y-3 rounded-2xl border border-border/80 bg-ink-50 px-4 py-4 outline-none"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Apa?
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-900">{item.apa}</p>
                  </div>
                  <ContohBlock item={item} />
                  <TemplatePreview template={item.template} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Bukti dukung
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-800">{item.buktiDukung}</p>
                    <p className="mt-1 text-[11px] text-ink-500">
                      Ilustrasi / daftar yang biasanya disiapkan — bukan dokumen resmi lembaga.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!done ? (
                      <Button type="button" size="sm" onClick={() => markUnderstood(item.id)}>
                        Tandai sudah memahami
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-ink-600">Sudah dipahami</span>
                    )}
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      {allDone ? (
        <p className="rounded-xl border border-ink-900/10 bg-white px-3.5 py-3 text-sm text-ink-800">
          Materi tahap ini selesai dipelajari. Ini bukan klaim bahwa dokumen resmi sudah lengkap.
        </p>
      ) : null}
    </div>
  )
}

function PreparePhases({ phases }: { phases: ExamplePreparePhase[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [phaseItemsDone, setPhaseItemsDone] = useState(false)

  const active = phases[activeIndex]!
  const maxUnlocked = completed.size

  function isUnlocked(index: number) {
    return index <= maxUnlocked
  }

  function markPhaseDone() {
    if (!phaseItemsDone) return
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(active.phaseId)
      return next
    })
    if (activeIndex < phases.length - 1) {
      setActiveIndex(activeIndex + 1)
      setPhaseItemsDone(false)
    }
  }

  const phaseDone = completed.has(active.phaseId)
  const nextPhase = phases[activeIndex + 1]
  const allPhasesDone = phases.every((p) => completed.has(p.phaseId))

  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {phases.map((phase, index) => {
          const unlocked = isUnlocked(index)
          const done = completed.has(phase.phaseId)
          const current = index === activeIndex
          return (
            <li key={phase.phaseId}>
              <button
                type="button"
                disabled={!unlocked}
                title={
                  unlocked
                    ? undefined
                    : `Belum dibuka. Selesaikan tahap sebelumnya terlebih dahulu.`
                }
                aria-label={`${phase.titleId}. ${
                  done ? 'Selesai dipelajari' : unlocked ? (current ? 'Sedang dipelajari' : 'Tersedia') : 'Belum dibuka'
                }`}
                onClick={() => {
                  if (!unlocked) return
                  setActiveIndex(index)
                  setPhaseItemsDone(done)
                }}
                className={cn(
                  'focus-ring flex w-full min-h-11 flex-col items-start rounded-xl px-2.5 py-2 text-left text-xs ring-1',
                  current
                    ? 'bg-ink-900 text-white ring-ink-900'
                    : done
                      ? 'bg-ink-100 text-ink-800 ring-ink-900/10'
                      : unlocked
                        ? 'bg-white text-ink-700 ring-border'
                        : 'cursor-not-allowed bg-ink-50 text-ink-400 opacity-60 ring-border/60',
                )}
              >
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide opacity-80">
                  {done ? (
                    <TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />
                  ) : !unlocked ? (
                    <Lock size={11} variant="Bold" color="currentColor" aria-hidden />
                  ) : null}
                  {phase.code}
                </span>
                <span className="mt-0.5 font-medium leading-snug">{phase.titleId}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          {active.code} · {active.titleId}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink-950">
          {active.titleId}
        </h3>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Apa ini?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-800">{active.intro}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Kenapa diperlukan?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-800">{active.why}</p>
          </div>
        </div>
      </div>

      {phaseDone ? (
        <p className="rounded-xl border border-ink-900/10 bg-ink-50 px-3.5 py-3 text-sm text-ink-800">
          Tahap ini selesai dipelajari. Buka tahap berikutnya yang sudah tersedia, atau tinjau
          tahap lain yang terbuka.
        </p>
      ) : (
        <PrepareLearn
          key={active.phaseId}
          items={active.items}
          onPhaseComplete={setPhaseItemsDone}
        />
      )}

      <div className="space-y-2">
        {!phaseDone && phaseItemsDone ? (
          <Button className="w-full sm:w-auto" onClick={markPhaseDone}>
            {nextPhase
              ? `Selesai mempelajari · lanjut ke ${nextPhase.titleId}`
              : 'Selesai mempelajari tahap terakhir'}
          </Button>
        ) : null}
        {phaseDone && nextPhase ? (
          <p className="text-sm text-ink-700">
            Berikutnya: <span className="font-semibold">{nextPhase.titleId}</span> — sekarang
            tersedia.
          </p>
        ) : null}
        {allPhasesDone ? (
          <p className="rounded-xl bg-ink-50 px-3.5 py-3 text-sm leading-relaxed text-ink-800">
            Semua tahap contoh selesai dipelajari. Ini pembelajaran contoh StatPlan — bukan
            penyelesaian kegiatan statistik resmi.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel: string
  showBack?: boolean
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      {showBack && onBack ? (
        <Button type="button" variant="ghost" onClick={onBack} className="justify-start">
          Kembali
        </Button>
      ) : (
        <span />
      )}
      <Button
        className="w-full sm:w-auto"
        rightIcon={<ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />}
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </div>
  )
}

function TryYourDates() {
  const today = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])
  const defaultEnd = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 3)
    d.setDate(d.getDate() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const [startISO, setStartISO] = useState(today)
  const [endISO, setEndISO] = useState(defaultEnd)
  const validation = validateProjectDateRange(startISO, endISO)
  const plan = validation.ok ? allocatePhaseDates(startISO, endISO) : []

  return (
    <section className="space-y-3 rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ink-950">Coba tentukan rentang waktu Anda</h3>
      <p className="text-sm leading-relaxed text-ink-700">
        Kalau Anda membuat versi sendiri, Anda bisa menentukan rentang waktunya. Ini hanya
        latihan perencanaan di halaman contoh — tidak mengubah data demo.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-600">Tanggal mulai</span>
          <input
            type="date"
            value={startISO}
            onChange={(e) => setStartISO(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-border px-3 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-600">Tanggal selesai</span>
          <input
            type="date"
            value={endISO}
            onChange={(e) => setEndISO(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-border px-3 text-sm"
          />
        </label>
      </div>
      {!validation.ok ? (
        <p className="text-sm text-danger">{validation.message}</p>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Contoh pembagian waktu · rencana yang Anda susun
          </p>
          <ol className="space-y-1.5">
            {plan.map((p) => (
              <li
                key={p.phaseId}
                className="flex flex-col gap-0.5 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-800 sm:flex-row sm:justify-between"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-ink-500">
                  {formatDateID(p.startISO)} – {formatDateID(p.endISO)}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] leading-relaxed text-ink-500">
            Bukan jadwal resmi BPS dan bukan durasi wajib. Hanya contoh pembagian waktu dari
            tanggal yang Anda pilih.
          </p>
        </>
      )}
    </section>
  )
}

export function ExampleWalkthroughPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const example = getExampleBySlug(slug)
  const [step, setStep] = useState<Step>(1)

  useEffect(() => {
    setStep(1)
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    document.getElementById('walkthrough-heading')?.focus()
  }, [step])

  if (!example) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-dvh bg-[#f7f6f3] text-ink-950">
      <header className="border-b border-ink-900/8 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-ink-700 hover:bg-ink-100/80"
          >
            <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
            Kembali
          </button>
          <span className="text-sm font-semibold tracking-tight text-ink-900">StatPlan</span>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 pb-32 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-ink-100 font-medium text-ink-800 ring-1 ring-ink-900/10">
            Contoh ilustratif
          </Badge>
          <Badge tone="brand">{jenisLabel(example.jenis)}</Badge>
        </div>

        <h1 className="mt-4 font-display text-[1.85rem] font-semibold leading-tight tracking-tight sm:text-4xl">
          {example.title}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-700">
          Belajar dari contoh singkat — lalu buat rencana versi Anda sendiri.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-500">
          Ini bukan ruang kerja proyek. Materi Proses Bisnis ditandai dengan halaman sumber; contoh
          StatPlan dilabeli “Contoh ilustratif”.
        </p>

        <div className="mt-8">
          <Progress current={step} />
        </div>

        <section className="mt-8 space-y-6" aria-labelledby="walkthrough-heading">
          {step === 1 ? (
            <>
              <h2
                id="walkthrough-heading"
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight outline-none"
              >
                Apa kegiatan ini?
              </h2>
              <div className="space-y-5 rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Nama kegiatan
                  </p>
                  <p className="mt-1.5 text-base font-medium leading-relaxed text-ink-900">
                    {example.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Jenis kegiatan
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {jenisLabel(example.jenis)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Apa yang ingin diketahui?
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {example.whatToKnow}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Mengapa dilakukan?
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {example.whyConducted}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Hasil yang direncanakan
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {example.plannedResult}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Bagaimana datanya diperoleh?
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {example.howDataObtained}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Setelah data terkumpul
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-900">
                    {example.afterData}
                  </p>
                </div>
                <p className="text-[11px] text-ink-500">Contoh ilustratif · bukan dokumen resmi.</p>
              </div>

              <ol className="flex list-none flex-col items-stretch">
                {example.flowLabels.map((label, i) => (
                  <li key={label} className="flex flex-col items-center">
                    <div className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-center text-sm font-medium text-ink-900">
                      {label}
                    </div>
                    {i < example.flowLabels.length - 1 ? (
                      <span className="py-1 text-ink-400" aria-hidden>
                        ↓
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>

              <StepNav showBack={false} onNext={() => setStep(2)} nextLabel="Berikutnya: lihat jadwal" />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2
                id="walkthrough-heading"
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight outline-none"
              >
                Jadwal contoh
              </h2>
              <p className="text-sm text-ink-700">
                Lihat dulu contoh jadwal kegiatan ini. Setelah itu, coba tentukan rentang waktu
                Anda sendiri.
              </p>
              <SourceBadge
                sourceType={example.schedule.sourceType}
                pdfPage={example.schedule.pdfPage}
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Contoh jadwal
              </p>
              <ol className="space-y-3">
                {example.schedule.months.map((block) => (
                  <li
                    key={block.month}
                    className="rounded-2xl border border-ink-900/8 bg-white px-4 py-3.5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-bps-blue">
                      {block.month}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {block.activities.map((a) => (
                        <li key={a} className="flex gap-2 text-sm text-ink-900">
                          <span className="text-ink-400" aria-hidden>
                            ●
                          </span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              {example.schedule.sourceRows ? (
                <details className="rounded-xl border border-border/70 bg-white px-4 py-3 text-sm">
                  <summary className="cursor-pointer font-medium text-ink-800">
                    Lihat baris kegiatan seperti di materi
                  </summary>
                  <ul className="mt-3 space-y-2 text-ink-700">
                    {example.schedule.sourceRows.map((row) => (
                      <li
                        key={row.activity}
                        className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"
                      >
                        <span>{row.activity}</span>
                        <span className="text-xs text-ink-500">{row.period}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              <p className="text-xs leading-relaxed text-ink-500">{example.schedule.note}</p>

              <TryYourDates />

              <StepNav
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                nextLabel="Berikutnya: apa yang disiapkan"
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2
                id="walkthrough-heading"
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight outline-none"
              >
                Apa yang disiapkan?
              </h2>
              <p className="text-sm text-ink-600">
                Pelajari satu tahap proses dulu. Tahap berikutnya terbuka setelah tahap saat ini
                selesai dipelajari — bukan checklist raksasa sekaligus.
              </p>
              <PreparePhases phases={example.preparePhases} />
              <StepNav
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                nextLabel="Berikutnya: ringkasan"
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <h2
                id="walkthrough-heading"
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight outline-none"
              >
                Beginilah bentuk rencananya
              </h2>

              <div className="space-y-4 rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Yang dipelajari
                  </p>
                  <dl className="mt-3 space-y-3">
                    {(
                      [
                        ['Konteks', example.summary.need],
                        ['Hasil', example.summary.result],
                        ['Jadwal', example.summary.schedule],
                        ['Persiapan', example.summary.prepare],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs font-medium text-ink-500">{k}</dt>
                        <dd className="mt-0.5 text-sm leading-relaxed text-ink-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Yang tersedia di contoh ini
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-800">
                    <li>Contoh konteks kegiatan (ilustratif)</li>
                    <li>Contoh jadwal + latihan rentang waktu Anda</li>
                    <li>Contoh & format kerja persiapan per tahap</li>
                    <li>Daftar bukti dukung ilustratif</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-ink-700">
                Anda tidak harus memahami semua istilah GSBPM untuk mulai. Berikutnya, buat
                versi Anda sendiri dengan Mode Terpandu.
              </p>

              <div className="space-y-3 rounded-2xl border border-ink-900/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Langkah berikutnya
                </p>
                <p className="text-sm leading-relaxed text-ink-700">
                  Siap mencoba? Mulai perencanaan dengan konteks contoh ini — Anda tetap bisa
                  mengubah semua isian.
                </p>
                <Button
                  className="w-full"
                  rightIcon={
                    <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => navigate(`/app/new?from=${example.slug}`)}
                >
                  Coba buat rencana seperti ini
                </Button>
                <p className="text-center text-xs leading-relaxed text-ink-500">
                  Membuka penyusunan baru. Tidak menimpa rencana yang sudah Anda miliki. Ruang
                  kerja lengkap bersifat opsional.
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                Kembali
              </Button>
            </>
          ) : null}
        </section>
      </main>
    </div>
  )
}
