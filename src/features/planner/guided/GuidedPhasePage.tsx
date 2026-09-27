import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft2, ArrowRight2, Lock, TickCircle } from 'iconsax-react'
import { GSBPM_PHASES } from '@/domain/gsbpm'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import {
  allocatePhaseDates,
  formatDateID,
  formatDateRangeID,
} from '@/content/planningTimeline'
import {
  GUIDED_NEED_CARDS,
  GUIDED_NEED_INTRO,
} from '@/content/guidedPhaseNeed'
import {
  DESIGN_INTRO,
  GUIDED_DESIGN_CARDS,
} from '@/content/guidedPhaseDesign'
import {
  BUILD_INTRO,
  GUIDED_BUILD_CARDS,
} from '@/content/guidedPhaseBuild'
import {
  COLLECT_INTRO,
  GUIDED_COLLECT_CARDS,
} from '@/content/guidedPhaseCollect'
import {
  PROCESS_INTRO,
  GUIDED_PROCESS_CARDS,
} from '@/content/guidedPhaseProcess'
import {
  ANALYSE_INTRO,
  GUIDED_ANALYSE_CARDS,
} from '@/content/guidedPhaseAnalyse'
import {
  DISSEMINATE_INTRO,
  GUIDED_DISSEMINATE_CARDS,
} from '@/content/guidedPhaseDisseminate'
import {
  EVALUATE_INTRO,
  GUIDED_EVALUATE_CARDS,
} from '@/content/guidedPhaseEvaluate'
import {
  computeDraftStatus,
  type GuidedDraftValues,
} from '@/content/guidedNeedPreparation'
import { getPreparation } from '@/content/guidedPreparation'
import {
  allCardsUnderstood,
  completePhase1AndUnlockDesign,
  completePhase2Learning,
  completePhase3Learning,
  completePhase4Learning,
  completePhase5Learning,
  completePhase6Learning,
  completePhase7Learning,
  completePhase8Learning,
  countUnderstood,
  createGuidedSession,
  getGuidedSession,
  markCardUnderstood,
  resetTemplateDraft,
  upsertEvidenceItem,
  upsertTemplateDraft,
  type GuidedSession,
} from '@/lib/guidedSession'
import { GuidedLearningCard } from '@/features/planner/guided/GuidedLearningCard'
import {
  GuidedMaterialsSummary,
  GuidedTemplatePanel,
} from '@/features/planner/guided/GuidedTemplatePanel'
import { cn } from '@/lib/utils'
import type { GsbpmPhaseId } from '@/domain/types'
import type { GuidedLearningCard as CardData } from '@/content/guidedPhaseNeed'

type View =
  | 'phase1'
  | 'phase1-done'
  | 'phase2'
  | 'phase2-done'
  | 'phase3'
  | 'phase3-done'
  | 'phase4'
  | 'phase4-done'
  | 'phase5'
  | 'phase5-done'
  | 'phase6'
  | 'phase6-done'
  | 'phase7'
  | 'phase7-done'
  | 'phase8'
  | 'phase8-done'

function ensureSession(projectId: string): GuidedSession {
  const existing = getGuidedSession(projectId)
  if (existing) return existing

  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const startISO = `${y}-${m}-${d}`
  const end = new Date(today)
  end.setMonth(end.getMonth() + 3)
  end.setDate(end.getDate() - 1)
  const endISO = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`

  return createGuidedSession({
    projectId,
    startISO,
    endISO,
    phasePlan: allocatePhaseDates(startISO, endISO),
  })
}

function materialsFor(
  session: GuidedSession,
  cards: CardData[],
) {
  return cards.map((card) => {
    const prep = getPreparation(card.id)
    const status = prep
      ? computeDraftStatus(prep, session.templateDrafts[card.id]?.values)
      : 'empty'
    return { id: card.id, title: card.title, status }
  })
}

export function GuidedPhasePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = useAppStore((s) => (id ? s.projects.find((p) => p.id === id) : undefined))

  const [session, setSession] = useState<GuidedSession | null>(() =>
    id ? ensureSession(id) : null,
  )
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [prepCardId, setPrepCardId] = useState<string | null>(null)
  const [view, setView] = useState<View>(() => {
    if (!id) return 'phase1'
    const s = getGuidedSession(id)
    if (s?.completedPhases.includes('evaluate')) return 'phase8-done'
    if (s?.completedPhases.includes('disseminate')) return 'phase8'
    if (s?.completedPhases.includes('analyse')) return 'phase7'
    if (s?.completedPhases.includes('process')) return 'phase6'
    if (s?.completedPhases.includes('collect')) return 'phase5'
    if (s?.completedPhases.includes('build')) return 'phase4'
    if (s?.completedPhases.includes('design')) return 'phase3'
    if (s?.completedPhases.includes('specify_need')) return 'phase2'
    return 'phase1'
  })

  const needCardIds = useMemo(() => GUIDED_NEED_CARDS.map((c) => c.id), [])
  const designCardIds = useMemo(() => GUIDED_DESIGN_CARDS.map((c) => c.id), [])
  const buildCardIds = useMemo(() => GUIDED_BUILD_CARDS.map((c) => c.id), [])
  const collectCardIds = useMemo(() => GUIDED_COLLECT_CARDS.map((c) => c.id), [])
  const processCardIds = useMemo(() => GUIDED_PROCESS_CARDS.map((c) => c.id), [])
  const analyseCardIds = useMemo(() => GUIDED_ANALYSE_CARDS.map((c) => c.id), [])
  const disseminateCardIds = useMemo(() => GUIDED_DISSEMINATE_CARDS.map((c) => c.id), [])
  const evaluateCardIds = useMemo(() => GUIDED_EVALUATE_CARDS.map((c) => c.id), [])

  const needUnderstoodCount = session ? countUnderstood(session, needCardIds) : 0
  const designUnderstoodCount = session ? countUnderstood(session, designCardIds) : 0
  const buildUnderstoodCount = session ? countUnderstood(session, buildCardIds) : 0
  const collectUnderstoodCount = session ? countUnderstood(session, collectCardIds) : 0
  const processUnderstoodCount = session ? countUnderstood(session, processCardIds) : 0
  const analyseUnderstoodCount = session ? countUnderstood(session, analyseCardIds) : 0
  const disseminateUnderstoodCount = session
    ? countUnderstood(session, disseminateCardIds)
    : 0
  const evaluateUnderstoodCount = session ? countUnderstood(session, evaluateCardIds) : 0
  const allNeedUnderstood = session ? allCardsUnderstood(session, needCardIds) : false
  const allDesignUnderstood = session ? allCardsUnderstood(session, designCardIds) : false
  const allBuildUnderstood = session ? allCardsUnderstood(session, buildCardIds) : false
  const allCollectUnderstood = session ? allCardsUnderstood(session, collectCardIds) : false
  const allProcessUnderstood = session ? allCardsUnderstood(session, processCardIds) : false
  const allAnalyseUnderstood = session ? allCardsUnderstood(session, analyseCardIds) : false
  const allDisseminateUnderstood = session
    ? allCardsUnderstood(session, disseminateCardIds)
    : false
  const allEvaluateUnderstood = session ? allCardsUnderstood(session, evaluateCardIds) : false
  const phase1Done = Boolean(session?.completedPhases.includes('specify_need'))
  const phase2Done = Boolean(session?.completedPhases.includes('design'))
  const phase3Done = Boolean(session?.completedPhases.includes('build'))
  const phase4Done = Boolean(session?.completedPhases.includes('collect'))
  const phase5Done = Boolean(session?.completedPhases.includes('process'))
  const phase6Done = Boolean(session?.completedPhases.includes('analyse'))
  const phase7Done = Boolean(session?.completedPhases.includes('disseminate'))
  const phase8Done = Boolean(session?.completedPhases.includes('evaluate'))

  const needPhaseDates = session?.phasePlan.find((p) => p.phaseId === 'specify_need')
  const designPhaseDates = session?.phasePlan.find((p) => p.phaseId === 'design')
  const buildPhaseDates = session?.phasePlan.find((p) => p.phaseId === 'build')
  const collectPhaseDates = session?.phasePlan.find((p) => p.phaseId === 'collect')
  const processPhaseDates = session?.phasePlan.find((p) => p.phaseId === 'process')
  const analysePhaseDates = session?.phasePlan.find((p) => p.phaseId === 'analyse')
  const disseminatePhaseDates = session?.phasePlan.find((p) => p.phaseId === 'disseminate')
  const evaluatePhaseDates = session?.phasePlan.find((p) => p.phaseId === 'evaluate')

  const prepDef = prepCardId ? getPreparation(prepCardId) : undefined

  const needMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_NEED_CARDS) : []),
    [session],
  )
  const designMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_DESIGN_CARDS) : []),
    [session],
  )
  const buildMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_BUILD_CARDS) : []),
    [session],
  )
  const collectMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_COLLECT_CARDS) : []),
    [session],
  )
  const processMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_PROCESS_CARDS) : []),
    [session],
  )
  const analyseMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_ANALYSE_CARDS) : []),
    [session],
  )
  const disseminateMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_DISSEMINATE_CARDS) : []),
    [session],
  )
  const evaluateMaterialsRows = useMemo(
    () => (session ? materialsFor(session, GUIDED_EVALUATE_CARDS) : []),
    [session],
  )

  const relatedDraftStatuses = useMemo(() => {
    if (!session || !prepDef?.summaryFromCardIds) return undefined
    return prepDef.summaryFromCardIds.map((row) => {
      const prep = getPreparation(row.cardId)
      const status = prep
        ? computeDraftStatus(prep, session.templateDrafts[row.cardId]?.values)
        : 'empty'
      return { label: row.label, status }
    })
  }, [session, prepDef])

  if (!id || !project || !session) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <p className="text-sm font-medium text-ink-900">Rencana ini belum tersedia di sini.</p>
        <p className="mt-2 text-sm text-ink-700">
          Belum ada sesi Mode Terpandu untuk tautan ini, atau proyek tidak ditemukan di perangkat
          Anda.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/app')}>
          Kembali ke beranda
        </Button>
        <Button className="mt-2 w-full sm:ml-2 sm:mt-4 sm:w-auto" onClick={() => navigate('/app/new')}>
          Mulai perencanaan baru
        </Button>
      </div>
    )
  }

  const activeSession = session

  function refreshSession() {
    const next = getGuidedSession(id!)
    if (next) setSession(next)
  }

  function handleMarkUnderstood(cardId: string) {
    markCardUnderstood(id!, cardId, true)
    refreshSession()
  }

  function handleFinishPhase1() {
    if (!allNeedUnderstood) return
    completePhase1AndUnlockDesign(id!)
    refreshSession()
    setView('phase1-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase2() {
    if (!allDesignUnderstood) return
    completePhase2Learning(id!)
    refreshSession()
    setView('phase2-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase3() {
    if (!allBuildUnderstood) return
    completePhase3Learning(id!)
    refreshSession()
    setView('phase3-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase4() {
    if (!allCollectUnderstood) return
    completePhase4Learning(id!)
    refreshSession()
    setView('phase4-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase5() {
    if (!allProcessUnderstood) return
    completePhase5Learning(id!)
    refreshSession()
    setView('phase5-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase6() {
    if (!allAnalyseUnderstood) return
    completePhase6Learning(id!)
    refreshSession()
    setView('phase6-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase7() {
    if (!allDisseminateUnderstood) return
    completePhase7Learning(id!)
    refreshSession()
    setView('phase7-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleFinishPhase8() {
    if (!allEvaluateUnderstood) return
    completePhase8Learning(id!)
    refreshSession()
    setView('phase8-done')
    window.setTimeout(() => document.getElementById('guided-phase-heading')?.focus(), 50)
  }

  function handleSaveDraft(cardId: string, values: GuidedDraftValues) {
    upsertTemplateDraft(id!, cardId, values)
    refreshSession()
  }

  function handleResetDraft(cardId: string) {
    resetTemplateDraft(id!, cardId)
    refreshSession()
  }

  function phaseStatus(phaseId: GsbpmPhaseId): 'done' | 'open' | 'locked' {
    if (activeSession.completedPhases.includes(phaseId)) return 'done'
    if (phaseId === 'specify_need') return 'open'
    if (phaseId === 'design' && phase1Done) return 'open'
    if (phaseId === 'build' && phase2Done) return 'open'
    if (phaseId === 'collect' && phase3Done) return 'open'
    if (phaseId === 'process' && phase4Done) return 'open'
    if (phaseId === 'analyse' && phase5Done) return 'open'
    if (phaseId === 'disseminate' && phase6Done) return 'open'
    if (phaseId === 'evaluate' && phase7Done) return 'open'
    if (phaseId === 'design' && activeSession.unlockedPhases.includes('design')) return 'open'
    if (phaseId === 'build' && activeSession.unlockedPhases.includes('build')) return 'open'
    if (phaseId === 'collect' && activeSession.unlockedPhases.includes('collect')) return 'open'
    if (phaseId === 'process' && activeSession.unlockedPhases.includes('process')) return 'open'
    if (phaseId === 'analyse' && activeSession.unlockedPhases.includes('analyse')) return 'open'
    if (phaseId === 'disseminate' && activeSession.unlockedPhases.includes('disseminate'))
      return 'open'
    if (phaseId === 'evaluate' && activeSession.unlockedPhases.includes('evaluate')) return 'open'
    return 'locked'
  }

  const showPhase1 = view === 'phase1' || view === 'phase1-done'
  const showPhase2 = view === 'phase2' || view === 'phase2-done'
  const showPhase3 = view === 'phase3' || view === 'phase3-done'
  const showPhase4 = view === 'phase4' || view === 'phase4-done'
  const showPhase5 = view === 'phase5' || view === 'phase5-done'
  const showPhase6 = view === 'phase6' || view === 'phase6-done'
  const showPhase7 = view === 'phase7' || view === 'phase7-done'
  const showPhase8 = view === 'phase8' || view === 'phase8-done'

  const headerDates =
    showPhase8 && evaluatePhaseDates
      ? `${formatDateID(evaluatePhaseDates.startISO)} – ${formatDateID(evaluatePhaseDates.endISO)}`
      : showPhase7 && disseminatePhaseDates
        ? `${formatDateID(disseminatePhaseDates.startISO)} – ${formatDateID(disseminatePhaseDates.endISO)}`
        : showPhase6 && analysePhaseDates
          ? `${formatDateID(analysePhaseDates.startISO)} – ${formatDateID(analysePhaseDates.endISO)}`
          : showPhase5 && processPhaseDates
            ? `${formatDateID(processPhaseDates.startISO)} – ${formatDateID(processPhaseDates.endISO)}`
            : showPhase4 && collectPhaseDates
              ? `${formatDateID(collectPhaseDates.startISO)} – ${formatDateID(collectPhaseDates.endISO)}`
              : showPhase3 && buildPhaseDates
                ? `${formatDateID(buildPhaseDates.startISO)} – ${formatDateID(buildPhaseDates.endISO)}`
                : showPhase2 && designPhaseDates
                  ? `${formatDateID(designPhaseDates.startISO)} – ${formatDateID(designPhaseDates.endISO)}`
                  : needPhaseDates
                    ? `${formatDateID(needPhaseDates.startISO)} – ${formatDateID(needPhaseDates.endISO)}`
                    : formatDateRangeID(session.startISO, session.endISO)

  function renderCardList(cards: CardData[]) {
    return (
      <div className="space-y-2.5">
        {cards.map((card) => (
          <GuidedLearningCard
            key={card.id}
            card={card}
            open={openCardId === card.id}
            understood={Boolean(activeSession.understood[card.id])}
            draftValues={activeSession.templateDrafts[card.id]?.values}
            evidenceStates={activeSession.evidenceStates[card.id]}
            onToggle={() => setOpenCardId((cur) => (cur === card.id ? null : card.id))}
            onMarkUnderstood={() => handleMarkUnderstood(card.id)}
            onPrepare={() => setPrepCardId(card.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <header className="space-y-3 border-b border-border/70 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-bps-orange">
          Mode Terpandu
        </p>
        <div>
          <p className="text-xs font-medium text-ink-600">Rencana waktu Anda</p>
          <p className="mt-0.5 text-sm font-medium text-ink-950">{headerDates}</p>
          <p className="mt-1 text-[11px] text-ink-500">
            Rentang yang Anda tentukan untuk tahap ini — bukan durasi wajib BPS. Anda bisa
            mengubahnya nanti.
          </p>
        </div>
        <p className="text-sm text-ink-700">
          Kegiatan: <span className="font-medium text-ink-900">{project.name}</span>
        </p>
        <p className="text-sm leading-relaxed text-ink-700">
          Di sini Anda belajar apa yang perlu disiapkan — satu bagian per satu. Anda tidak perlu
          memahami GSBPM terlebih dahulu; StatPlan menjelaskan langkahnya.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Urutan belajar Mode Terpandu" className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Urutan belajar StatPlan
          </p>
          <ol className="space-y-1.5">
            {GSBPM_PHASES.map((phase, idx) => {
              const status = phaseStatus(phase.id)
              const isCurrent =
                (showPhase1 && phase.id === 'specify_need') ||
                (showPhase2 && phase.id === 'design') ||
                (showPhase3 && phase.id === 'build') ||
                (showPhase4 && phase.id === 'collect') ||
                (showPhase5 && phase.id === 'process') ||
                (showPhase6 && phase.id === 'analyse') ||
                (showPhase7 && phase.id === 'disseminate') ||
                (showPhase8 && phase.id === 'evaluate')
              const prevPhase = idx > 0 ? GSBPM_PHASES[idx - 1] : null
              const lockedHint = prevPhase
                ? `Belum dibuka. Selesaikan belajar tahap ${prevPhase.titleId} terlebih dahulu.`
                : 'Belum dibuka'
              return (
                <li key={phase.id}>
                  <button
                    type="button"
                    disabled={status === 'locked'}
                    title={status === 'locked' ? lockedHint : undefined}
                    aria-label={
                      status === 'locked'
                        ? `${phase.titleId}. ${lockedHint}`
                        : `${phase.titleId}. ${
                            status === 'done'
                              ? 'Sudah dipahami'
                              : isCurrent
                                ? 'Sedang dipelajari'
                                : 'Tersedia'
                          }`
                    }
                    onClick={() => {
                      if (phase.id === 'specify_need') {
                        setView(phase1Done ? 'phase1-done' : 'phase1')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'design' && phase1Done) {
                        setView(phase2Done ? 'phase2-done' : 'phase2')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'build' && phase2Done) {
                        setView(phase3Done ? 'phase3-done' : 'phase3')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'collect' && phase3Done) {
                        setView(phase4Done ? 'phase4-done' : 'phase4')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'process' && phase4Done) {
                        setView(phase5Done ? 'phase5-done' : 'phase5')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'analyse' && phase5Done) {
                        setView(phase6Done ? 'phase6-done' : 'phase6')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'disseminate' && phase6Done) {
                        setView(phase7Done ? 'phase7-done' : 'phase7')
                        setOpenCardId(null)
                      }
                      if (phase.id === 'evaluate' && phase7Done) {
                        setView(phase8Done ? 'phase8-done' : 'phase8')
                        setOpenCardId(null)
                      }
                    }}
                    className={cn(
                      'focus-ring flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-xs',
                      isCurrent ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-50',
                      status === 'locked'
                        ? 'cursor-not-allowed opacity-55 hover:bg-transparent'
                        : '',
                    )}
                  >
                    <span className="mt-0.5 flex w-4 shrink-0 justify-center" aria-hidden>
                      {status === 'done' ? (
                        <TickCircle size={14} variant="Bold" color="currentColor" />
                      ) : status === 'locked' ? (
                        <Lock size={12} variant="Bold" color="currentColor" />
                      ) : (
                        <span className="font-semibold">{idx + 1}</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium leading-snug">{phase.titleId}</span>
                      <span
                        className={cn(
                          'mt-0.5 block text-[10px]',
                          isCurrent ? 'text-white/75' : 'text-ink-500',
                        )}
                      >
                        {status === 'done'
                          ? 'Dipahami'
                          : status === 'open'
                            ? isCurrent
                              ? 'Sedang dipelajari'
                              : 'Tersedia'
                            : 'Belum dibuka'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-3 text-[10px] leading-relaxed text-ink-500">
            Kunci tahap adalah urutan belajar StatPlan, bukan urutan wajib GSBPM.
          </p>
        </nav>

        <div className="min-w-0">
          {showPhase1 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  1 · Identifikasi Kebutuhan
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {GUIDED_NEED_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {GUIDED_NEED_INTRO.question}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {GUIDED_NEED_INTRO.explanation}
                </p>
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">
                  {GUIDED_NEED_INTRO.gsbpmNote}
                </p>
              </aside>
              {renderCardList(GUIDED_NEED_CARDS)}
              <GuidedMaterialsSummary
                rows={needMaterialsRows}
                onContinue={() => {
                  const firstEmpty = needMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_NEED_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {needUnderstoodCount} dari {GUIDED_NEED_CARDS.length} materi dipahami
                </p>
                {!phase1Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allNeedUnderstood}
                      onClick={handleFinishPhase1}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    <p className="mt-2 text-xs leading-relaxed text-ink-500">
                      Semua materi sudah dipahami. Bahan kerja dapat disiapkan bertahap; tidak
                      semua bahan harus lengkap untuk melanjutkan pembelajaran.
                    </p>
                  </>
                ) : null}
              </div>
              {view === 'phase1-done' || phase1Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Fase ini sudah Anda pelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">
                    Selanjutnya: Perancangan. Ini urutan belajar StatPlan untuk membantu Anda
                    memahami proses — GSBPM sendiri bersifat fleksibel.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase2')
                      setOpenCardId(null)
                    }}
                    rightIcon={
                      <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                    }
                  >
                    Lanjut ke Perancangan
                  </Button>
                </div>
              ) : null}
            </section>
          ) : null}

          {showPhase2 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  2 · Perancangan
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {DESIGN_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">{DESIGN_INTRO.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {DESIGN_INTRO.explanation}
                </p>
                {designPhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(designPhaseDates.startISO)} –{' '}
                    {formatDateID(designPhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{DESIGN_INTRO.gsbpmNote}</p>
              </aside>
              {renderCardList(GUIDED_DESIGN_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan perancangan Anda"
                rows={designMaterialsRows}
                onContinue={() => {
                  const firstEmpty = designMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_DESIGN_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {designUnderstoodCount} dari {GUIDED_DESIGN_CARDS.length} materi
                  dipahami
                </p>
                {!phase2Done ? (
                  <Button
                    className="mt-4 w-full"
                    disabled={!allDesignUnderstood}
                    onClick={handleFinishPhase2}
                    rightIcon={
                      <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                    }
                  >
                    Selesai memahami tahap ini
                  </Button>
                ) : null}
              </div>
              {view === 'phase2-done' || phase2Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Perancangan selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Build</p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase3')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Build
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setView(phase1Done ? 'phase1-done' : 'phase1')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Identifikasi Kebutuhan
                </Button>
              )}
            </section>
          ) : null}

          {showPhase3 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  3 · Build
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {BUILD_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">{BUILD_INTRO.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {BUILD_INTRO.explanation}
                </p>
                {buildPhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(buildPhaseDates.startISO)} –{' '}
                    {formatDateID(buildPhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{BUILD_INTRO.gsbpmNote}</p>
              </aside>
              {renderCardList(GUIDED_BUILD_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Build Anda"
                rows={buildMaterialsRows}
                onContinue={() => {
                  const firstEmpty = buildMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_BUILD_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {buildUnderstoodCount} dari {GUIDED_BUILD_CARDS.length} materi dipahami
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Memahami materi berbeda dari mengisi draft. Bahan dapat dilengkapi bertahap.
                </p>
                {!phase3Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allBuildUnderstood}
                      onClick={handleFinishPhase3}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allBuildUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Build sudah dipahami. Anda dapat lanjut ke Collect.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase3-done' || phase3Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Build selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Collect</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Ini bukan klaim bahwa kegiatan sudah siap operasional atau disetujui secara
                    resmi.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase4')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Collect
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase2Done ? 'phase2-done' : 'phase2')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Perancangan
                </Button>
              )}
            </section>
          ) : null}

          {showPhase4 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  4 · Collect
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {COLLECT_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">{COLLECT_INTRO.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {COLLECT_INTRO.explanation}
                </p>
                {collectPhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(collectPhaseDates.startISO)} –{' '}
                    {formatDateID(collectPhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{COLLECT_INTRO.gsbpmNote}</p>
              </aside>
              {renderCardList(GUIDED_COLLECT_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Collect Anda"
                rows={collectMaterialsRows}
                onContinue={() => {
                  const firstEmpty = collectMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_COLLECT_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {collectUnderstoodCount} dari {GUIDED_COLLECT_CARDS.length} materi
                  dipahami
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Memahami materi berbeda dari mengisi draft. Bahan dapat dilengkapi bertahap.
                  Persiapan bukan pelaksanaan pengumpulan.
                </p>
                {!phase4Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allCollectUnderstood}
                      onClick={handleFinishPhase4}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allCollectUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Collect sudah dipahami. Anda dapat lanjut ke Process.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase4-done' || phase4Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Collect selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Process</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Ini bukan klaim bahwa pengumpulan data telah dilaksanakan atau disetujui
                    secara resmi.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase5')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Process
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase3Done ? 'phase3-done' : 'phase3')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Build
                </Button>
              )}
            </section>
          ) : null}

          {showPhase5 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  5 · Process
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {PROCESS_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">{PROCESS_INTRO.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {PROCESS_INTRO.explanation}
                </p>
                {processPhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(processPhaseDates.startISO)} –{' '}
                    {formatDateID(processPhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{PROCESS_INTRO.gsbpmNote}</p>
              </aside>
              {renderCardList(GUIDED_PROCESS_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Process Anda"
                rows={processMaterialsRows}
                onContinue={() => {
                  const firstEmpty = processMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_PROCESS_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {processUnderstoodCount} dari {GUIDED_PROCESS_CARDS.length} materi
                  dipahami
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Memahami materi berbeda dari mengisi draft. Bahan dapat dilengkapi bertahap.
                  Persiapan bukan pelaksanaan pengolahan data.
                </p>
                {!phase5Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allProcessUnderstood}
                      onClick={handleFinishPhase5}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allProcessUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Process sudah dipahami. Anda dapat lanjut ke Analyse.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase5-done' || phase5Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Process selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Analyse</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Ini bukan klaim bahwa data telah diolah atau disetujui secara resmi.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase6')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Analyse
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase4Done ? 'phase4-done' : 'phase4')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Collect
                </Button>
              )}
            </section>
          ) : null}

          {showPhase6 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  6 · Analyse
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {ANALYSE_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">{ANALYSE_INTRO.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {ANALYSE_INTRO.explanation}
                </p>
                {analysePhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(analysePhaseDates.startISO)} –{' '}
                    {formatDateID(analysePhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{ANALYSE_INTRO.gsbpmNote}</p>
              </aside>
              {renderCardList(GUIDED_ANALYSE_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Analyse Anda"
                rows={analyseMaterialsRows}
                onContinue={() => {
                  const firstEmpty = analyseMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_ANALYSE_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {analyseUnderstoodCount} dari {GUIDED_ANALYSE_CARDS.length} materi
                  dipahami
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Memahami materi berbeda dari mengisi draft. Bahan dapat dilengkapi bertahap.
                  Rencana analisis bukan hasil analisis.
                </p>
                {!phase6Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allAnalyseUnderstood}
                      onClick={handleFinishPhase6}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allAnalyseUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Analyse sudah dipahami. Anda dapat lanjut ke Disseminate.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase6-done' || phase6Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Analyse selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Disseminate</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Ini bukan klaim bahwa analisis telah dihitung, hasil dipublikasikan, atau
                    disetujui secara resmi.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase7')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Disseminate
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase5Done ? 'phase5-done' : 'phase5')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Process
                </Button>
              )}
            </section>
          ) : null}

          {showPhase7 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  7 · Disseminate
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {DISSEMINATE_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {DISSEMINATE_INTRO.question}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {DISSEMINATE_INTRO.explanation}
                </p>
                {disseminatePhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(disseminatePhaseDates.startISO)} –{' '}
                    {formatDateID(disseminatePhaseDates.endISO)}
                  </p>
                ) : null}
              </header>
              <aside className="rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3">
                <p className="text-xs font-semibold text-ink-900">Berbasis GSBPM 5.2</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">
                  {DISSEMINATE_INTRO.gsbpmNote}
                </p>
              </aside>
              {renderCardList(GUIDED_DISSEMINATE_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Disseminate Anda"
                rows={disseminateMaterialsRows}
                onContinue={() => {
                  const firstEmpty = disseminateMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_DISSEMINATE_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-950">
                  Progress: {disseminateUnderstoodCount} dari {GUIDED_DISSEMINATE_CARDS.length}{' '}
                  materi dipahami
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Memahami materi berbeda dari mengisi draft. Rencana rilis dan penyebarluasan
                  bukan publikasi yang sudah terjadi.
                </p>
                {!phase7Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allDisseminateUnderstood}
                      onClick={handleFinishPhase7}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allDisseminateUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Disseminate sudah dipahami. Anda dapat lanjut ke Evaluate.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase7-done' || phase7Done ? (
                <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                    <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                    Persiapan Disseminate selesai dipelajari.
                  </p>
                  <p className="mt-2 text-sm text-ink-700">Berikutnya: Evaluate</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Ini bukan klaim bahwa produk dipublikasikan, rilis telah terjadi, atau
                    kegiatan disetujui secara resmi.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setView('phase8')
                      setOpenCardId(null)
                    }}
                  >
                    Lanjut ke Evaluate
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase6Done ? 'phase6-done' : 'phase6')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Analyse
                </Button>
              )}
            </section>
          ) : null}

          {showPhase8 ? (
            <section aria-labelledby="guided-phase-heading" className="space-y-5">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                  8 · Evaluate
                </p>
                <h1
                  id="guided-phase-heading"
                  tabIndex={-1}
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {EVALUATE_INTRO.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {EVALUATE_INTRO.question}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                  {EVALUATE_INTRO.explanation}
                </p>
                {evaluatePhaseDates ? (
                  <p className="mt-3 text-sm text-ink-800">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Rencana waktu Anda
                    </span>
                    <br />
                    {formatDateID(evaluatePhaseDates.startISO)} –{' '}
                    {formatDateID(evaluatePhaseDates.endISO)}
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-ink-500">
                  {EVALUATE_INTRO.gsbpmNote}
                </p>
              </header>

              {renderCardList(GUIDED_EVALUATE_CARDS)}
              <GuidedMaterialsSummary
                title="Bahan Evaluate Anda"
                rows={evaluateMaterialsRows}
                onContinue={() => {
                  const firstEmpty = evaluateMaterialsRows.find((r) => r.status === 'empty')
                  const target = firstEmpty?.id ?? GUIDED_EVALUATE_CARDS[0]!.id
                  setOpenCardId(target)
                  setPrepCardId(target)
                }}
              />
              <div className="rounded-2xl border border-border/80 bg-white px-4 py-4">
                <p className="text-sm font-medium text-ink-900">
                  Progress: {evaluateUnderstoodCount} dari {GUIDED_EVALUATE_CARDS.length} materi
                  dipahami
                </p>
                {!phase8Done ? (
                  <>
                    <Button
                      className="mt-4 w-full"
                      disabled={!allEvaluateUnderstood}
                      onClick={handleFinishPhase8}
                      rightIcon={
                        <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                      }
                    >
                      Selesai memahami tahap ini
                    </Button>
                    {allEvaluateUnderstood ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-500">
                        Semua materi Evaluate sudah dipahami. Persiapan Evaluate selesai
                        dipelajari — bukan evaluasi kegiatan selesai.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Tandai semua materi sebagai sudah dipahami untuk menyelesaikan tahap
                        belajar ini.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
              {view === 'phase8-done' || phase8Done ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-ink-900/10 bg-ink-50 px-4 py-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                      <TickCircle size={18} variant="Bold" color="currentColor" aria-hidden />
                      Persiapan Evaluate selesai dipelajari.
                    </p>
                    <p className="mt-2 text-sm text-ink-700">
                      Ini adalah draf perencanaan evaluasi dan tindak lanjut — bukan hasil
                      evaluasi resmi, bukan skor, dan bukan pernyataan kegiatan berhasil/gagal.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-ink-900/15 bg-white px-4 py-5">
                    <h2 className="font-display text-xl font-semibold tracking-tight text-ink-950">
                      Mode Terpandu selesai
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">
                      Anda sudah mempelajari seluruh tahapan yang dibahas StatPlan — dari
                      kebutuhan hingga evaluasi.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-500">
                      Ini penyelesaian Mode Terpandu StatPlan — bukan bahwa kegiatan statistik
                      selesai, disetujui BPS, atau lulus evaluasi resmi.
                    </p>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-600">
                      Yang telah dipersiapkan (status belajar)
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink-800">
                      {[
                        { label: 'Identifikasi Kebutuhan', done: phase1Done },
                        { label: 'Perancangan', done: phase2Done },
                        { label: 'Pembangunan', done: phase3Done },
                        { label: 'Pengumpulan Data', done: phase4Done },
                        { label: 'Pengolahan Data', done: phase5Done },
                        { label: 'Analisis Data', done: phase6Done },
                        { label: 'Penyajian & Penyebarluasan', done: phase7Done },
                        { label: 'Evaluasi', done: phase8Done },
                      ].map((row) => (
                        <li key={row.label} className="flex items-center gap-2">
                          <span
                            className={row.done ? 'text-ink-900' : 'text-ink-300'}
                            aria-hidden
                          >
                            <TickCircle size={16} variant="Bold" color="currentColor" />
                          </span>
                          <span>
                            {row.label}
                            {row.done ? ' — dipelajari' : ' — belum'}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 rounded-xl border border-border/80 bg-ink-50/80 px-3.5 py-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                        Review StatPlan
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                        Tinjau identitas kegiatan, jadwal, checklist, dan kesiapan ekspor draf.
                        Review perencanaan — bukan persetujuan resmi BPS. Tidak ada sinkronisasi
                        otomatis ke ruang kerja.
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/app/projects/${id}?tab=checklist`)}
                        rightIcon={
                          <ArrowRight2 size={16} variant="Bold" color="currentColor" aria-hidden />
                        }
                      >
                        Periksa di Workspace
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/app/projects/${id}?tab=export`)}
                      >
                        Unduh draf
                      </Button>
                      <p className="text-[11px] leading-relaxed text-ink-500">
                        Dokumen yang dihasilkan adalah draf — bukan persetujuan resmi. Jika ekspor
                        belum siap, Workspace akan menjelaskan bagian yang perlu dilengkapi.
                      </p>
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setView('phase8')
                          setOpenCardId(null)
                          window.setTimeout(
                            () => document.getElementById('guided-phase-heading')?.focus(),
                            50,
                          )
                        }}
                      >
                        Lihat kembali persiapan
                      </Button>
                      <button
                        type="button"
                        className="focus-ring text-center text-sm text-ink-600 underline-offset-2 hover:underline"
                        onClick={() => navigate('/app')}
                      >
                        Kembali ke beranda
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    leftIcon={
                      <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                    }
                    onClick={() => {
                      setView(phase7Done ? 'phase7-done' : 'phase7')
                      setOpenCardId(null)
                    }}
                  >
                    Kembali ke Disseminate
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  leftIcon={
                    <ArrowLeft2 size={16} variant="Bold" color="currentColor" aria-hidden />
                  }
                  onClick={() => {
                    setView(phase7Done ? 'phase7-done' : 'phase7')
                    setOpenCardId(null)
                  }}
                >
                  Kembali ke Disseminate
                </Button>
              )}
            </section>
          ) : null}

          {!phase8Done ? (
            <div className="mt-8 border-t border-border/70 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/app/projects/${id}`)}
              >
                Buka ruang kerja lengkap
              </Button>
              <p className="mt-1.5 text-[11px] text-ink-500">
                Ruang kerja lengkap adalah pengalaman lanjutan terpisah dari Mode Terpandu.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {prepDef && prepCardId ? (
        <GuidedTemplatePanel
          open
          prep={prepDef}
          initialValues={session.templateDrafts[prepCardId]?.values}
          evidenceStates={session.evidenceStates[prepCardId]}
          relatedDraftStatuses={relatedDraftStatuses}
          onClose={() => setPrepCardId(null)}
          onSaveDraft={(values) => handleSaveDraft(prepCardId, values)}
          onResetDraft={() => handleResetDraft(prepCardId)}
          onEvidenceChange={(evidenceId, patch) => {
            upsertEvidenceItem(id, prepCardId, evidenceId, patch)
            refreshSession()
          }}
        />
      ) : null}
    </div>
  )
}
