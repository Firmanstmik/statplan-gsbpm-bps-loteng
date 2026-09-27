import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { recommendJenisKegiatan } from '@/domain/aiPlanner'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/store/toastStore'
import type { JenisKegiatan, Klasifikasi } from '@/domain/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Badge'
import { Field, Label, Textarea } from '@/components/ui/Field'
import { jenisLabel } from '@/lib/utils'
import { GuidedProgress } from '@/features/planner/guided/GuidedProgress'
import {
  STORY_EXAMPLE,
  deriveProjectName,
  deriveTopik,
  jenisPlainExplanation,
  pickOutcomeExample,
  understandNeedSummary,
} from '@/content/guidedJourney'
import { getExampleBySlug } from '@/content/exampleJourney'
import {
  DURATION_PRESET_MONTHS,
  allocatePhaseDates,
  formatDateID,
  formatDateRangeID,
  inclusiveDayCount,
  phasePlanToTimelineItems,
  todayISO,
  addMonthsISO,
  validateProjectDateRange,
  validatePhaseWithinProject,
  type PhaseDatePlan,
} from '@/content/planningTimeline'
import { cn } from '@/lib/utils'
import { createGuidedSession } from '@/lib/guidedSession'

type Step = 1 | 2 | 3 | 'handoff'

export function NewProjectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createProject = useAppStore((s) => s.createProject)
  const setTimeline = useAppStore((s) => s.setTimeline)
  const setJenis = useAppStore((s) => s.setJenis)
  const updateProject = useAppStore((s) => s.updateProject)

  const fromSlug = searchParams.get('from')
  const fromExample = fromSlug ? getExampleBySlug(fromSlug) : undefined

  const [step, setStep] = useState<Step>(1)
  const [story, setStory] = useState(() => {
    if (fromSlug === 'skm') return STORY_EXAMPLE
    if (fromSlug === 'umkm') {
      return 'Saya ingin mendata unit usaha UMKM di wilayah untuk memperbarui basis data pemberdayaan.'
    }
    if (fromSlug === 'kompromin') {
      return 'Saya ingin menyusun statistik kependudukan dari data administratif yang sudah tersedia.'
    }
    return ''
  })
  const [jenis, setJenisLocal] = useState<JenisKegiatan | null>(
    () => fromExample?.jenis ?? null,
  )
  const [outcomes, setOutcomes] = useState<string[]>([])
  const [outcomeDraft, setOutcomeDraft] = useState('')
  const [writingOwn, setWritingOwn] = useState(false)

  const [startISO, setStartISO] = useState(() => todayISO())
  const [endISO, setEndISO] = useState(() => addMonthsISO(todayISO(), 3))
  const [presetMonths, setPresetMonths] = useState<number | null>(3)
  const [phasePlan, setPhasePlan] = useState<PhaseDatePlan[]>([])
  const [editingPlan, setEditingPlan] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const [phaseError, setPhaseError] = useState<string | null>(null)

  const [createdId, setCreatedId] = useState<string | null>(null)
  const [klasifikasi] = useState<Klasifikasi>('sektoral')

  const storyOk = story.trim().length >= 12
  const recommendation = useMemo(
    () =>
      storyOk
        ? recommendJenisKegiatan({
            description: story,
            dataAvailable: undefined,
            needCoverage: undefined,
          })
        : null,
    [story, storyOk],
  )

  const effectiveJenis = jenis ?? recommendation?.jenis ?? 'survei'
  const needSummary = understandNeedSummary(story)
  const outcomePack = pickOutcomeExample(story)

  const rangeValidation = validateProjectDateRange(startISO, endISO)
  const dayCount = rangeValidation.ok ? inclusiveDayCount(startISO, endISO) : 0

  useEffect(() => {
    if (recommendation && !jenis) setJenisLocal(recommendation.jenis)
  }, [recommendation, jenis])

  useEffect(() => {
    if (step !== 3) return
    const v = validateProjectDateRange(startISO, endISO)
    if (!v.ok) {
      setPhasePlan([])
      setDateError(v.message)
      return
    }
    setDateError(null)
    setPhasePlan(allocatePhaseDates(startISO, endISO))
    setEditingPlan(false)
    setPhaseError(null)
  }, [step, startISO, endISO])

  function applyStoryExample() {
    setStory(STORY_EXAMPLE)
  }

  function goHasil() {
    if (!storyOk) return
    if (!jenis && recommendation) setJenisLocal(recommendation.jenis)
    setStep(2)
    window.setTimeout(() => document.getElementById('guided-step-heading')?.focus(), 50)
  }

  function applyOutcomeExample() {
    setOutcomes([...outcomePack.items])
    setWritingOwn(false)
    setOutcomeDraft('')
  }

  function confirmOutcomesAndContinue() {
    const list = writingOwn
      ? outcomeDraft
          .split('\n')
          .map((l) => l.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean)
      : outcomes.length > 0
        ? outcomes
        : [...outcomePack.items]
    if (list.length === 0) return
    setOutcomes(list)
    setWritingOwn(false)
    setStep(3)
    window.setTimeout(() => document.getElementById('guided-step-heading')?.focus(), 50)
  }

  function applyPreset(months: number) {
    const start = startISO || todayISO()
    setStartISO(start)
    setEndISO(addMonthsISO(start, months))
    setPresetMonths(months)
  }

  function updatePhaseDate(index: number, field: 'startISO' | 'endISO', value: string) {
    setPhasePlan((prev) => {
      const next = [...prev]
      const row = next[index]
      if (!row) return prev
      next[index] = { ...row, [field]: value }
      return next
    })
    setPhaseError(null)
  }

  function finishAndCreate() {
    const range = validateProjectDateRange(startISO, endISO)
    if (!range.ok) {
      setDateError(range.message)
      return
    }
    if (phasePlan.length !== 8) {
      setPhaseError('Rencana waktu belum lengkap. Periksa tanggal kegiatan.')
      return
    }
    for (const phase of phasePlan) {
      const v = validatePhaseWithinProject(phase, startISO, endISO)
      if (!v.ok) {
        setPhaseError(`${phase.title}: ${v.message}`)
        return
      }
    }

    const name = deriveProjectName(story)
    const topik = deriveTopik(story)
    const needCoverage =
      effectiveJenis === 'kompromin' ? 'admin' : effectiveJenis === 'sensus' ? 'full' : 'sample'
    const dataAvailable = effectiveJenis === 'kompromin' ? true : false
    const timeline = phasePlanToTimelineItems(phasePlan)

    const project = createProject({
      name,
      topik,
      description: story.trim(),
      klasifikasi,
      dataAvailable,
      needCoverage,
    })

    if (project.jenisKegiatan !== effectiveJenis) {
      setJenis(project.id, effectiveJenis)
    }
    setTimeline(project.id, timeline)
    updateProject(project.id, {
      objectives: outcomes.length
        ? outcomes
        : [`Menghasilkan: ${needSummary || name}`],
      rekomendasiBps: {
        ...project.rekomendasiBps,
        periode: formatDateRangeID(startISO, endISO),
      },
    })

    createGuidedSession({
      projectId: project.id,
      startISO,
      endISO,
      phasePlan,
    })

    setCreatedId(project.id)
    setStep('handoff')
    toast('Rencana waktu tersimpan')
    window.setTimeout(() => document.getElementById('guided-step-heading')?.focus(), 50)
  }

  function openIdentifyNeed() {
    if (!createdId) return
    navigate(`/app/projects/${createdId}/guided`)
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      {fromExample ? (
        <aside className="mt-4 rounded-xl border border-border/80 bg-ink-50/90 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Dari contoh · {fromExample.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">
            Isian awal diambil dari contoh ilustratif. Ubah bebas — ini rencana Anda, bukan
            salinan wajib.
          </p>
        </aside>
      ) : null}
      {step !== 'handoff' ? <GuidedProgress current={step} /> : null}

      {step === 1 ? (
        <section className="mt-6 space-y-5" aria-labelledby="guided-step-heading">
          <header>
            <h1
              id="guided-step-heading"
              tabIndex={-1}
              className="font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
            >
              Ceritakan kegiatan yang ingin Anda lakukan
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Jelaskan dengan bahasa sehari-hari. Tidak perlu memahami GSBPM terlebih dahulu.
            </p>
          </header>

          <Card className="space-y-4">
            <Field>
              <Label htmlFor="guided-story">
                Apa yang ingin Anda ukur, ketahui, atau data apa yang ingin Anda hasilkan?
              </Label>
              <Textarea
                id="guided-story"
                rows={5}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={`Contoh: ${STORY_EXAMPLE}`}
                className="min-h-[8rem] text-base"
              />
            </Field>
            <div>
              <Button type="button" size="sm" variant="secondary" onClick={applyStoryExample}>
                Gunakan contoh
              </Button>
            </div>

            {storyOk && recommendation ? (
              <div className="space-y-3 rounded-xl bg-ink-50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                    Kami memahami kebutuhan Anda sebagai
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink-950">{needSummary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                    Pendekatan yang disarankan
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink-950">
                    {jenisLabel(effectiveJenis)}
                  </p>
                  <p className="mt-1 text-sm text-ink-700">
                    {jenisPlainExplanation(effectiveJenis)}
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    Berdasarkan informasi yang Anda berikan. Saran awal — dapat disesuaikan.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih jenis kegiatan">
                  {(['survei', 'sensus', 'kompromin'] as JenisKegiatan[]).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJenisLocal(j)}
                      className={cn(
                        'focus-ring min-h-11 rounded-xl px-3 py-2 text-sm font-medium ring-1 transition-colors',
                        effectiveJenis === j
                          ? 'bg-ink-900 text-white ring-ink-900'
                          : 'bg-white text-ink-800 ring-border hover:bg-ink-50',
                      )}
                    >
                      {jenisLabel(j)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!storyOk ? (
              <p className="text-xs text-ink-600">
                Tuliskan singkat kebutuhan Anda (minimal 12 karakter) untuk melanjutkan.
              </p>
            ) : null}

            <div className="flex justify-end pt-1">
              <Button
                className="w-full sm:w-auto"
                disabled={!storyOk}
                rightIcon={
                  <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={goHasil}
              >
                Lanjutkan
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-6 space-y-5" aria-labelledby="guided-step-heading">
          <header>
            <h1
              id="guided-step-heading"
              tabIndex={-1}
              className="font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
            >
              Apa yang ingin Anda dapatkan dari kegiatan ini?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Tentukan hasil yang ingin dibuat. Mulai dari contoh, lalu sesuaikan.
            </p>
          </header>

          {needSummary ? (
            <div className="rounded-xl border border-border/80 bg-ink-50/80 px-3 py-2.5 text-sm text-ink-800">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Kebutuhan awal
              </span>
              <p className="mt-1">{needSummary}</p>
            </div>
          ) : null}

          <Card className="space-y-4">
            {!writingOwn ? (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-bps-orange">
                    Contoh ilustratif
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink-950">{outcomePack.title}</h2>
                  <p className="mt-1 text-xs text-ink-600">{outcomePack.containsNote}</p>
                </div>
                <ul className="space-y-2">
                  {(outcomes.length ? outcomes : outcomePack.items).map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm text-ink-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button type="button" variant="secondary" onClick={applyOutcomeExample}>
                    Gunakan contoh ini
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setWritingOwn(true)}>
                    Tulis sendiri
                  </Button>
                </div>
              </>
            ) : (
              <Field>
                <Label htmlFor="guided-outcomes">Tulis hasil (satu baris per item)</Label>
                <Textarea
                  id="guided-outcomes"
                  rows={5}
                  value={outcomeDraft}
                  onChange={(e) => setOutcomeDraft(e.target.value)}
                  placeholder={'Contoh:\nTingkat kepuasan masyarakat\nHasil menurut jenis layanan'}
                />
              </Field>
            )}

            {outcomes.length > 0 && !writingOwn ? (
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Hasil yang direncanakan
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-800">
                  {outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                leftIcon={
                  <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={writingOwn && outcomeDraft.trim().length < 3}
                rightIcon={
                  <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={confirmOutcomesAndContinue}
              >
                {writingOwn
                  ? 'Gunakan & lanjutkan'
                  : outcomes.length
                    ? 'Gunakan & lanjutkan'
                    : 'Gunakan contoh & lanjutkan'}
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-6 space-y-5" aria-labelledby="guided-step-heading">
          <header>
            <h1
              id="guided-step-heading"
              tabIndex={-1}
              className="font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
            >
              Kapan kegiatan ini akan dilaksanakan?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Atur rentang waktu kegiatan. Setelah itu StatPlan membantu membagi waktu ke dalam
              tahapan perencanaan.
            </p>
          </header>

          <Card className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-ink-900">Pintasan durasi</p>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESET_MONTHS.map((p) => (
                  <button
                    key={p.months}
                    type="button"
                    onClick={() => applyPreset(p.months)}
                    className={cn(
                      'focus-ring min-h-11 rounded-xl px-3.5 py-2 text-sm font-medium ring-1 transition-colors',
                      presetMonths === p.months
                        ? 'bg-ink-900 text-white ring-ink-900'
                        : 'bg-white text-ink-800 ring-border hover:bg-ink-50',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Pintasan hanya mengisi tanggal. Anda dapat mengubah tanggal secara langsung.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="plan-start" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Tanggal mulai
                </label>
                <input
                  id="plan-start"
                  type="date"
                  value={startISO}
                  aria-describedby={dateError ? 'plan-date-error' : 'plan-date-help'}
                  onChange={(e) => {
                    setStartISO(e.target.value)
                    setPresetMonths(null)
                  }}
                  className="focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="plan-end" className="mb-1.5 block text-sm font-medium text-ink-900">
                  Tanggal selesai
                </label>
                <input
                  id="plan-end"
                  type="date"
                  value={endISO}
                  aria-describedby={dateError ? 'plan-date-error' : 'plan-date-help'}
                  onChange={(e) => {
                    setEndISO(e.target.value)
                    setPresetMonths(null)
                  }}
                  className="focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                />
              </div>
            </div>

            <p id="plan-date-help" className="text-xs text-ink-500">
              Gunakan format tanggal kalender. Rentang dihitung termasuk hari mulai dan selesai.
            </p>
            {dateError ? (
              <p id="plan-date-error" role="alert" className="text-sm text-danger">
                {dateError}
              </p>
            ) : null}

            {rangeValidation.ok ? (
              <div className="rounded-xl bg-ink-50 px-3.5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Durasi kegiatan
                </p>
                <p className="mt-1 text-sm font-medium text-ink-950">
                  {formatDateRangeID(startISO, endISO)}
                </p>
                <p className="mt-0.5 text-xs text-ink-600">{dayCount} hari (termasuk hari mulai & selesai)</p>
              </div>
            ) : null}

            <div>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink-950">Rencana waktu awal</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={!rangeValidation.ok || phasePlan.length === 0}
                  onClick={() => setEditingPlan((v) => !v)}
                >
                  {editingPlan ? 'Selesai sesuaikan' : 'Sesuaikan jadwal'}
                </Button>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-ink-500">
                StatPlan membantu membagi rentang waktu Anda ke dalam tahapan GSBPM sebagai titik
                awal. Durasi dapat disesuaikan — ini rencana awal, bukan durasi wajib BPS.
              </p>

              {phasePlan.length > 0 ? (
                <ol className="space-y-2.5">
                  {phasePlan.map((phase, idx) => (
                    <li
                      key={phase.phaseId}
                      className="rounded-xl border border-border/70 bg-white px-3.5 py-3"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-800">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink-950">{phase.title}</p>
                          {!editingPlan ? (
                            <>
                              <p className="mt-0.5 text-xs font-medium text-ink-600">
                                {formatDateID(phase.startISO)} – {formatDateID(phase.endISO)}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-ink-500 line-clamp-2">
                                {phase.purpose}
                              </p>
                            </>
                          ) : (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <div>
                                <label
                                  className="mb-1 block text-[11px] text-ink-600"
                                  htmlFor={`phase-start-${phase.phaseId}`}
                                >
                                  Mulai
                                </label>
                                <input
                                  id={`phase-start-${phase.phaseId}`}
                                  type="date"
                                  value={phase.startISO}
                                  min={startISO}
                                  max={endISO}
                                  onChange={(e) =>
                                    updatePhaseDate(idx, 'startISO', e.target.value)
                                  }
                                  className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                                />
                              </div>
                              <div>
                                <label
                                  className="mb-1 block text-[11px] text-ink-600"
                                  htmlFor={`phase-end-${phase.phaseId}`}
                                >
                                  Selesai
                                </label>
                                <input
                                  id={`phase-end-${phase.phaseId}`}
                                  type="date"
                                  value={phase.endISO}
                                  min={startISO}
                                  max={endISO}
                                  onChange={(e) => updatePhaseDate(idx, 'endISO', e.target.value)}
                                  className="focus-ring h-10 w-full rounded-lg border border-border px-2 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-ink-600">Isi tanggal yang valid untuk melihat rencana waktu.</p>
              )}
              {phaseError ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {phaseError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                leftIcon={
                  <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={() => setStep(2)}
              >
                Kembali
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={!rangeValidation.ok || phasePlan.length !== 8}
                rightIcon={
                  <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                }
                onClick={finishAndCreate}
              >
                Gunakan rencana waktu & lanjutkan
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      {step === 'handoff' ? (
        <section className="mt-6 space-y-5" aria-labelledby="guided-step-heading">
          <header>
            <h1
              id="guided-step-heading"
              tabIndex={-1}
              className="font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
            >
              Rencana waktu sudah dibuat
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Anda sudah punya kerangka waktu. Langkah berikutnya: mulai dari Identifikasi
              Kebutuhan.
            </p>
          </header>
          <Card className="space-y-4">
            <ul className="space-y-2 text-sm text-ink-800">
              <li className="flex gap-2">
                <span className="font-semibold text-success">✓</span>
                <span>
                  <strong>Kebutuhan</strong> — {needSummary || deriveProjectName(story)}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-success">✓</span>
                <span>
                  <strong>Hasil</strong> — {outcomes.length} item
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-success">✓</span>
                <span>
                  <strong>Waktu</strong> — {formatDateRangeID(startISO, endISO)}
                </span>
              </li>
            </ul>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Pembagian tahap
              </p>
              <ol className="mt-2 space-y-1.5">
                {phasePlan.slice(0, 3).map((p, i) => (
                  <li key={p.phaseId} className="text-sm text-ink-800">
                    {i + 1}. {p.title} · {formatDateID(p.startISO)} – {formatDateID(p.endISO)}
                  </li>
                ))}
                {phasePlan.length > 3 ? (
                  <li className="text-xs text-ink-500">+ {phasePlan.length - 3} tahap lainnya</li>
                ) : null}
              </ol>
            </div>

            <p className="text-xs leading-relaxed text-ink-500">
              Berikutnya Anda masuk Mode Terpandu: memahami apa yang perlu disiapkan pada
              Identifikasi Kebutuhan — bukan mencentang checklist proyek.
            </p>

            <Button
              className="w-full"
              rightIcon={
                <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
              }
              onClick={openIdentifyNeed}
            >
              Lanjut ke Identifikasi Kebutuhan
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => createdId && navigate(`/app/projects/${createdId}`)}
            >
              Buka ruang kerja lengkap
            </Button>
          </Card>
        </section>
      ) : null}
    </div>
  )
}
