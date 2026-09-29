import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import {
  ArrowDown2,
  ArrowRight2,
  Calendar,
  TickCircle,
  TickSquare,
  ClipboardText,
  DocumentDownload,
  DocumentText,
  TaskSquare,
  Edit2,
  Hashtag,
  Hierarchy,
  Link1,
} from 'iconsax-react'
import type { Icon } from 'iconsax-react'
import {
  GSBPM_PHASES,
  SDI_STAGES,
  computePhaseProgress,
  computeProjectProgress,
  getPhase,
  getStageForPhase,
  isChecklistVisible,
  isSubProcessVisible,
} from '@/domain/gsbpm'
import {
  MS_IND_FIELDS,
  MS_KEG_FIELDS,
  MS_VAR_FIELDS,
  metadataSectionComplete,
} from '@/domain/metadataSchema'
import { canExport, validateProject } from '@/domain/validation'
import { exportProjectDocument } from '@/lib/generateDocument'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/store/toastStore'
import type { GsbpmPhaseId, PortalSdiCheck } from '@/domain/types'
import { Badge, Card, ProgressBar } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Field, Input, Label, Select, Textarea } from '@/components/ui/Field'
import { PdfRefBadge } from '@/components/ui/PdfRefBadge'
import { ValidationBanner } from '@/components/ui/ValidationBanner'
import { HelpTip } from '@/components/ui/HelpTip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { VariableCard } from '@/features/workspace/VariableCard'
import { QuestionCard } from '@/features/workspace/QuestionCard'
import { NextStepsCard } from '@/features/workspace/NextStepsCard'
import { ContohPanel } from '@/features/workspace/ContohPanel'
import { SpecifyNeedLearningPanel } from '@/features/workspace/learning/SpecifyNeedLearningPanel'
import { SampelKalkulator } from '@/features/workspace/SampelKalkulator'
import { TAB_GUIDES } from '@/content/howToWork'
import { isDemoProject } from '@/demo'
import {
  exportStatusLabel,
  klasifikasiLabel,
  methodLabel,
  projectOpd,
  projectOwner,
} from '@/lib/projectMeta'
import { useAutosaveFeedback } from '@/hooks/useAutosaveFeedback'
import { cn, formatDateTime, jenisLabel, statusLabel } from '@/lib/utils'
import { getGuidedSession } from '@/lib/guidedSession'
import { FaqLink } from '@/components/ui/FaqLink'
import { ISSUE_FOCUS, type WorkspaceFocus } from '@/lib/projectAttention'
import { formatDateID, formatDateRangeID } from '@/content/planningTimeline'
import { buildShareUrl, copyText, encodeProjectShare } from '@/lib/shareLink'

type TabId =
  | 'timeline'
  | 'workflow'
  | 'checklist'
  | 'design'
  | 'variables'
  | 'instruments'
  | 'metadata'
  | 'activity'
  | 'export'

// StatPlan's reading order (kapan → alur → apa yang disiapkan → detail), not a GSBPM sequence.
const tabs: { id: TabId; label: string; icon: Icon }[] = [
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'workflow', label: 'Alur kerja', icon: Hierarchy },
  { id: 'checklist', label: 'Checklist', icon: TaskSquare },
  { id: 'design', label: 'Perancangan', icon: Edit2 },
  { id: 'variables', label: 'Variabel', icon: Hashtag },
  { id: 'instruments', label: 'Instrumen', icon: ClipboardText },
  { id: 'metadata', label: 'Metadata', icon: DocumentText },
  { id: 'activity', label: 'Riwayat', icon: TickSquare },
  { id: 'export', label: 'Ekspor', icon: DocumentDownload },
]

/** Opened when the URL names no tab (`/app/projects/:id`). Explicit `?tab=` always wins. */
const DEFAULT_TAB: TabId = 'timeline'

const demoBadgeClass =
  'bg-ink-50 font-medium text-ink-700 ring-1 ring-dashed ring-ink-900/15'

/** One contextual FAQ question inside a tab's "Cara kerja" box (see docs/faq-content-map.md). */
const TAB_FAQ: Partial<Record<TabId, { id: string; label?: string }>> = {
  variables: { id: 'apa-itu-variabel' },
  metadata: { id: 'metadata-perlu' },
  export: { id: 'word-resmi', label: 'Apakah hasil ini dokumen resmi BPS?' },
}

function TabHowTo({ tabId }: { tabId: TabId }) {
  const g = TAB_GUIDES[tabId]
  const faq = TAB_FAQ[tabId]
  return (
    <div className="mb-4 rounded-xl border border-border/80 bg-ink-50/70 px-3 py-2.5 text-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
        {g.title}
      </div>
      <p className="mt-1 text-ink-700">{g.body}</p>
      {faq ? <FaqLink id={faq.id} label={faq.label} className="mt-1.5" /> : null}
    </div>
  )
}

export function ProjectWorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const project = useAppStore((s) => s.projects.find((p) => p.id === id))
  const toggleChecklist = useAppStore((s) => s.toggleChecklist)
  const setPhase = useAppStore((s) => s.setPhase)
  const setJenis = useAppStore((s) => s.setJenis)
  const upsertVariable = useAppStore((s) => s.upsertVariable)
  const removeVariable = useAppStore((s) => s.removeVariable)
  const setVariables = useAppStore((s) => s.setVariables)
  const setQuestionnaire = useAppStore((s) => s.setQuestionnaire)
  const setDesign = useAppStore((s) => s.setDesign)
  const setRekomendasiBps = useAppStore((s) => s.setRekomendasiBps)
  const updateMetadata = useAppStore((s) => s.updateMetadata)
  const updateProject = useAppStore((s) => s.updateProject)

  const initialTab = (() => {
    const q = searchParams.get('tab')
    if (q && tabs.some((t) => t.id === q)) return q as TabId
    return DEFAULT_TAB
  })()
  const [tab, setTab] = useState<TabId>(initialTab)
  const [exporting, setExporting] = useState(false)
  const [exportStage, setExportStage] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [focusVariableId, setFocusVariableId] = useState<string | null>(null)
  const [focusQuestionId, setFocusQuestionId] = useState<string | null>(null)
  const [progressDelta, setProgressDelta] = useState<number | null>(null)
  const [portalEditing, setPortalEditing] = useState(false)
  const [rekomendasiEditing, setRekomendasiEditing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const prevPct = useRef<number | null>(null)
  const { phase: savePhase, notifySaved, markSaved } = useAutosaveFeedback(
    'Perubahan berhasil disimpan',
  )

  // Timeline display only: dates chosen at intake live in the guided session; the scale grows with the
  // plan so long projects (e.g. the 6-month preset) stay inside their track.
  const guidedPlan = id ? getGuidedSession(id) : null
  const timelineRange =
    guidedPlan?.startISO && guidedPlan.endISO
      ? formatDateRangeID(guidedPlan.startISO, guidedPlan.endISO)
      : project?.rekomendasiBps.periode || null
  const timelineDates =
    guidedPlan && project && guidedPlan.phasePlan.length === project.timeline.length
      ? guidedPlan.phasePlan
      : null
  const timelineWeeks = Math.max(16, ...(project?.timeline.map((t) => t.endWeek) ?? []))

  const [specifyFocus, setSpecifyFocus] = useState<{ code: string; n: number } | null>(null)
  const tabPanelRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const q = searchParams.get('tab')
    if (q && tabs.some((t) => t.id === q)) {
      setTab(q as TabId)
    }
  }, [searchParams])

  /** Make a fix location exist before scrolling to it: portal → Specify Need 1.5, rekomendasi → Design phase. */
  function reveal(target: WorkspaceFocus) {
    if (!project || project.currentPhaseId !== 'specify_need') return
    if (target === 'portal') setSpecifyFocus({ code: '1.5', n: Date.now() })
    else setPhase(project.id, 'design')
  }

  function goTab(next: TabId, focusId?: string) {
    const target = (['focus-portal', 'focus-rekomendasi'] as const).includes(focusId as 'focus-portal')
      ? (focusId!.replace('focus-', '') as WorkspaceFocus)
      : null
    if (target) reveal(target)
    setTab(next)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === DEFAULT_TAB) p.delete('tab')
        else p.set('tab', next)
        if (target) p.set('focus', target)
        else p.delete('focus')
        return p
      },
      { replace: true },
    )
    window.setTimeout(() => {
      const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'
      if (focusId) {
        const el = document.getElementById(focusId)
        if (el) {
          el.scrollIntoView({ behavior, block: 'start' })
          return
        }
      }
      tabPanelRef.current?.scrollIntoView({ behavior, block: 'start' })
    }, target ? 140 : 60)
  }

  // ?focus=portal|rekomendasi from other pages (dashboard attention links) and on refresh
  const urlFocus = searchParams.get('focus')
  const urlFocusDone = useRef<string | null>(null)
  useEffect(() => {
    if (!project || tab !== 'workflow' || (urlFocus !== 'portal' && urlFocus !== 'rekomendasi')) return
    if (urlFocusDone.current === `${project.id}:${urlFocus}`) return
    urlFocusDone.current = `${project.id}:${urlFocus}`
    reveal(urlFocus)
    window.setTimeout(() => {
      document.getElementById(`focus-${urlFocus}`)?.scrollIntoView({ block: 'start' })
    }, 160)
  })

  function onTabListKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const current = tabs.findIndex((t) => t.id === tab)
    if (current < 0) return
    let next = current
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (current + 1) % tabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (current - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = tabs.length - 1
    }
    const nextId = tabs[next]?.id
    if (!nextId) return
    goTab(nextId)
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`tab-${nextId}`)
      el?.focus()
      // Keep the focused tab visible inside the horizontally scrolling tablist.
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
  }

  const progress = useMemo(
    () =>
      project
        ? computeProjectProgress(
            project.jenisKegiatan,
            project.klasifikasi,
            project.checklistState,
          )
        : { done: 0, total: 0, pct: 0 },
    [project],
  )

  useEffect(() => {
    if (prevPct.current === null) {
      prevPct.current = progress.pct
      return
    }
    const d = progress.pct - prevPct.current
    prevPct.current = progress.pct
    if (d === 0) return
    setProgressDelta(d)
    const t = window.setTimeout(() => setProgressDelta(null), 1200)
    return () => window.clearTimeout(t)
  }, [progress.pct])

  const validationIssues = useMemo(
    () => (project ? validateProject(project) : []),
    [project],
  )

  const exportAllowed = project ? canExport(project) : false

  if (!project) {
    return (
      <EmptyState
        icon={DocumentText}
        title="Proyek tidak ditemukan"
        description="Proyek mungkin telah dihapus atau tautan tidak valid."
        why="Kembali ke dashboard untuk memilih proyek aktif, atau muat ulang data demo."
        actionLabel="Kembali ke dashboard"
        onAction={() => {
          navigate('/app')
        }}
      />
    )
  }

  const phase = getPhase(project.currentPhaseId)!
  const stage = getStageForPhase(project.currentPhaseId)
  const owner = projectOwner(project)
  const opd = projectOpd(project)
  const demo = isDemoProject(project)

  async function handleExport() {
    if (!project || !exportAllowed) {
      goTab('export')
      return
    }
    setExporting(true)
    setExportSuccess(false)
    try {
      setExportStage('Menyiapkan dokumen…')
      await new Promise((r) => setTimeout(r, 280))
      setExportStage('Menghasilkan…')
      await exportProjectDocument(project)
      setExportStage('Mengunduh…')
      await new Promise((r) => setTimeout(r, 220))
      updateProject(project.id, { status: 'ready_for_review' })
      setExportSuccess(true)
      toast('Ekspor berhasil — draf dokumen diunduh')
      window.setTimeout(() => setExportSuccess(false), 1600)
    } catch {
      toast('Ekspor gagal. Coba lagi.', 'error')
    } finally {
      setExporting(false)
      setExportStage(null)
    }
  }

  function onChecklistToggle(itemId: string) {
    if (!project) return
    toggleChecklist(project.id, itemId)
    toast('Checklist diperbarui')
    markSaved({ silent: true })
  }

  function updatePortal(patch: Partial<PortalSdiCheck>) {
    if (!project) return
    const sirusa = patch.sirusaChecked ?? project.portalSdi.sirusaChecked
    const romantik = patch.romantikChecked ?? project.portalSdi.romantikChecked
    const complete = sirusa && romantik
    const next: PortalSdiCheck = {
      ...project.portalSdi,
      ...patch,
      sirusaChecked: sirusa,
      romantikChecked: romantik,
      checked: complete,
      checkedAt: complete ? new Date().toISOString() : project.portalSdi.checkedAt,
    }
    updateProject(project.id, {
      portalSdi: next,
      checklistState: {
        ...project.checklistState,
        'sn-9': complete,
      },
    })
  }

  const portalComplete =
    project.portalSdi.sirusaChecked && project.portalSdi.romantikChecked
  const rekomendasiIncomplete =
    project.klasifikasi === 'sektoral' &&
    (!project.checklistState['de-12'] ||
      !project.rekomendasiBps.namaKegiatan.trim() ||
      !project.rekomendasiBps.penyelenggara.trim())

  return (
    <div>
      <div className="mb-8">
        <nav aria-label="Lokasi" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
          <Link to="/app" className="focus-ring rounded hover:text-ink-950">
            Proyek saya
          </Link>
          <span aria-hidden className="hidden sm:inline">/</span>
          <span className="hidden truncate text-ink-800 sm:inline">{project.name}</span>
        </nav>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow mb-2">Ruang kerja lanjutan</p>
            <h1 className="t-page-title break-words">{project.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{jenisLabel(project.jenisKegiatan)}</Badge>
              <Badge>{statusLabel(project.status)}</Badge>
              {demo ? <Badge className={demoBadgeClass}>Demo · contoh ilustratif</Badge> : null}
            </div>
            {project.description && project.description.trim() !== project.name.trim() ? (
              <p className="t-body reading-width mt-3">
                <span className="text-ink-500">Kebutuhan: </span>
                {project.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              <div className="bg-surface px-4 py-3.5">
                <p className="t-label">Fase saat ini</p>
                <p className="mt-1 text-[15px] font-semibold text-ink-950">{phase.titleId}</p>
                <p className="text-xs text-ink-500">{stage?.title ?? '—'}</p>
              </div>
              <div className="bg-surface px-4 py-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="t-label">Checklist wajib</p>
                  <span className="text-sm font-semibold tabular-nums text-ink-950">{progress.pct}%</span>
                </div>
                <ProgressBar
                  className="mt-2.5"
                  value={progress.pct}
                  premium={progress.pct >= 80}
                  label="Progres checklist wajib"
                  delta={progressDelta}
                />
                <p className="mt-1.5 text-xs text-ink-500">Minimal 80% untuk ekspor draf</p>
              </div>
              <div className="bg-surface px-4 py-3.5">
                <p className="t-label">Draf dokumen</p>
                <p className="mt-1 text-[15px] font-semibold text-ink-950">
                  {exportAllowed ? 'Siap diunduh' : 'Belum siap'}
                </p>
                <p className="text-xs text-ink-500">{exportStatusLabel(project)}</p>
              </div>
            </div>
            <SaveIndicator className="mt-3" phase={savePhase} updatedAt={project.updatedAt} />

            <details className="group mt-4">
              <summary className="focus-ring inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-sm font-semibold text-ink-800 hover:text-ink-950">
                Detail proyek
                <ArrowDown2
                  size={12}
                  variant="Bold"
                  color="currentColor"
                  className="transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl border border-border bg-surface px-4 py-4 sm:grid-cols-2">
                {(
                  [
                    ['OPD', opd],
                    ['Penanggung jawab', owner],
                    ['Klasifikasi', klasifikasiLabel(project.klasifikasi)],
                    ['Metode', methodLabel(project)],
                    ['Portal rujukan', portalComplete ? 'Sudah dikonfirmasi' : 'Belum lengkap'],
                    [
                      'Rekomendasi BPS',
                      project.checklistState['de-12'] ? 'Disiapkan' : 'Belum / tidak wajib',
                    ],
                    ['Dibuat', formatDateTime(project.createdAt)],
                    ['Diperbarui', formatDateTime(project.updatedAt)],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs font-medium text-ink-500">{k}</dt>
                    <dd className="mt-0.5 break-words text-sm text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:max-w-xs lg:w-56">
            <Button
              className="w-full min-h-12"
              variant={exportAllowed ? 'primary' : 'secondary'}
              loading={exporting}
              success={exportSuccess}
              leftIcon={<DocumentDownload size={16} variant="Bold" color="currentColor" aria-hidden />}
              disabled={exporting}
              onClick={() => {
                if (!exportAllowed) {
                  goTab('export')
                  return
                }
                void handleExport()
              }}
            >
              {exporting
                ? exportStage ?? 'Menyiapkan…'
                : exportAllowed
                  ? 'Unduh draf dokumen'
                  : 'Lihat persyaratan ekspor'}
            </Button>
            <Button
              className="w-full"
              size="sm"
              variant="secondary"
              loading={sharing}
              leftIcon={<Link1 size={14} variant="Bold" color="currentColor" aria-hidden />}
              onClick={() => {
                setSharing(true)
                void (async () => {
                  try {
                    const { hash, tooLarge } = await encodeProjectShare(project)
                    if (tooLarge) {
                      toast(
                        'Proyek terlalu besar untuk tautan. Gunakan ekspor JSON di Pengaturan.',
                        'error',
                      )
                      return
                    }
                    const url = buildShareUrl(hash)
                    const ok = await copyText(url)
                    toast(
                      ok
                        ? 'Tautan berbagi disalin ke clipboard'
                        : 'Gagal menyalin — salin manual dari bilah alamat setelah bagikan',
                    )
                    if (!ok) {
                      window.prompt('Salin tautan berbagi:', url)
                    }
                  } catch {
                    toast('Gagal membuat tautan berbagi', 'error')
                  } finally {
                    setSharing(false)
                  }
                })()
              }}
            >
              Salin tautan berbagi
            </Button>
            <Link
              to={`/app/projects/${project.id}/guided`}
              className="focus-ring mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-ink-800 hover:text-ink-950"
            >
              Kembali ke Mode Terpandu
              <ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* The Ekspor tab shows the full review (why + how to fix); don't list the same issues twice. */}
      {tab !== 'export' ? (
        <NextStepsCard
          project={project}
          onGoTab={(t, focusId) => goTab(t as TabId, focusId)}
        />
      ) : null}


      {project.aiRecommendation ? (
        <Card className="mb-6 bg-ink-50/80">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-600">
              Rekomendasi awal asisten
            </div>
            <PdfRefBadge ref="Hal. 15 & 20" />
          </div>
          <p className="mt-1 text-sm text-ink-800">
            {jenisLabel(project.aiRecommendation.jenis)} —{' '}
            {project.aiRecommendation.rationale[0]}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-ink-600">Ubah jenis kegiatan:</span>
            {(['survei', 'sensus', 'kompromin'] as const).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJenis(project.id, j)}
                className={cn(
                  'focus-ring min-h-9 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  project.jenisKegiatan === j
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-ink-700 ring-1 ring-border-strong',
                )}
                aria-pressed={project.jenisKegiatan === j}
              >
                {jenisLabel(j)}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <div
        ref={tabPanelRef}
        id="workspace-tab-panel"
        className="scroll-mt-24"
      >
      <div className="relative mb-5 min-w-0 max-w-full overflow-hidden border-b border-border sm:mb-6">
        <div
          role="tablist"
          aria-label="Bagian workspace"
          aria-orientation="horizontal"
          onKeyDown={onTabListKeyDown}
          className="-mb-px flex min-w-0 w-full gap-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none]"
        >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="workspace-tab-content"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => goTab(t.id)}
            className={cn(
              'focus-ring inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors duration-200',
              tab === t.id
                ? 'border-ink-900 text-ink-950'
                : 'border-transparent text-ink-500 hover:text-ink-950',
            )}
          >
            <t.icon
              size={16}
              variant={tab === t.id ? 'Bold' : 'Linear'}
              color="currentColor"
              aria-hidden
            />
            {t.label}
          </button>
        ))}
        </div>
      </div>

      <div
        id="workspace-tab-content"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >

      {tab === 'workflow' && (
        <div className="space-y-4">
          <TabHowTo tabId="workflow" />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit space-y-4">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-600">
              Kelompok pembelajaran
            </div>
            <p className="text-[11px] leading-snug text-ink-500">
              Pengelompokan antarmuka (bukan fase resmi GSBPM). Delapan fase di bawah tetap
              merujuk GSBPM 5.2.
            </p>
            {SDI_STAGES.map((s) => (
              <div key={s.id}>
                <div className="mb-2 text-sm font-semibold text-ink-950">{s.title}</div>
                <div className="space-y-1">
                  {s.phases.map((pid) => {
                    const ph = getPhase(pid)!
                    const pr = computePhaseProgress(
                      pid,
                      project.jenisKegiatan,
                      project.klasifikasi,
                      project.checklistState,
                    )
                    const active = project.currentPhaseId === pid
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setPhase(project.id, pid as GsbpmPhaseId)}
                        className={cn(
                          'focus-ring flex min-h-12 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                          active
                            ? 'bg-ink-900 text-white'
                            : 'text-ink-800 hover:bg-ink-50',
                        )}
                        aria-pressed={active}
                        aria-label={`${ph.code}. ${ph.titleId}, progres ${pr.pct} persen`}
                      >
                        <span>
                          {ph.code}. {ph.titleId}
                        </span>
                        <span className={cn('text-xs', active ? 'text-ink-500' : 'text-ink-600')}>
                          {pr.pct}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </Card>

          <div className="space-y-4">
            {phase.id === 'specify_need' ? (
              <SpecifyNeedLearningPanel
                phase={phase}
                jenisKegiatan={project.jenisKegiatan}
                klasifikasi={project.klasifikasi}
                checklistState={project.checklistState}
                onChecklistToggle={onChecklistToggle}
                focusRequest={specifyFocus}
                contextualSlotForCode={(code) =>
                  code === '1.5' ? (
                    portalComplete && !portalEditing ? (
                      <div
                        id="focus-portal"
                        className="scroll-mt-28 rounded-xl border border-success/20 bg-success-soft/30 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-ink-950">
                                Pemeriksaan portal rujukan statistik
                              </h4>
                              <Badge tone="success">Sudah dikonfirmasi</Badge>
                              <HelpTip topic="portal_sdi" />
                            </div>
                            <p className="mt-2 text-sm text-ink-700">
                              Sirusa dan Romantik telah dicentang
                              {project.portalSdi.notes?.trim()
                                ? ` · ${project.portalSdi.notes.trim().slice(0, 80)}`
                                : ''}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPortalEditing(true)}
                          >
                            Ubah
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        id="focus-portal"
                        className="scroll-mt-28 rounded-xl border border-brand/20 bg-brand-soft/30 p-3"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-ink-950">
                              Pemeriksaan portal rujukan statistik
                            </h4>
                            <HelpTip topic="portal_sdi" />
                            <PdfRefBadge ref="Hal. 15" />
                          </div>
                          {portalComplete ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPortalEditing(false)}
                            >
                              Selesai
                            </Button>
                          ) : null}
                        </div>
                        <p className="mb-4 text-sm text-ink-700">
                          Cek sirusa.web.bps.go.id, romantik.bps.go.id, dan portal SDI (dll.)
                          untuk menghindari duplikasi kegiatan (Specify Need 1.5).
                        </p>
                        <div className="space-y-3">
                          <Checkbox
                            checked={project.portalSdi.sirusaChecked}
                            onChange={(next) => {
                              updatePortal({ sirusaChecked: next })
                              toast('Pemeriksaan portal diperbarui')
                              markSaved({ silent: true })
                            }}
                            label="Sudah mengecek sirusa.web.bps.go.id"
                          />
                          <Checkbox
                            checked={project.portalSdi.romantikChecked}
                            onChange={(next) => {
                              updatePortal({ romantikChecked: next })
                              toast('Pemeriksaan portal diperbarui')
                              markSaved({ silent: true })
                            }}
                            label="Sudah mengecek romantik.bps.go.id"
                          />
                          <Field>
                            <Label>Catatan hasil pengecekan</Label>
                            <Textarea
                              value={project.portalSdi.notes}
                              onChange={(e) => updatePortal({ notes: e.target.value })}
                              onBlur={() => notifySaved()}
                              placeholder="Contoh: Data belum tersedia di portal, perlu survei baru"
                            />
                          </Field>
                        </div>
                      </div>
                    )
                  ) : null
                }
              />
            ) : (
              <>
            <Card>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="text-xs font-medium text-ink-600">
                  {stage?.title} · GSBPM {phase.code}
                </div>
                {phase.pdfRef ? <PdfRefBadge ref={phase.pdfRef} /> : null}
              </div>
              <h2 className="text-xl font-semibold">
                {phase.titleId}{' '}
                <span className="font-normal text-ink-600">({phase.title})</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{phase.purpose}</p>
            </Card>

            <ContohPanel
              topik={project.topik}
              phaseId={project.currentPhaseId}
              jenisKegiatan={project.jenisKegiatan}
            />

            {portalComplete && !portalEditing ? (
              <Card id="focus-portal" className="scroll-mt-28 border-success/20 bg-success-soft/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-950">
                        Pemeriksaan portal rujukan statistik
                      </h3>
                      <Badge tone="success">Sudah dikonfirmasi</Badge>
                      <HelpTip topic="portal_sdi" />
                    </div>
                    <p className="mt-2 text-sm text-ink-700">
                      Sirusa dan Romantik telah dicentang
                      {project.portalSdi.notes?.trim()
                        ? ` · ${project.portalSdi.notes.trim().slice(0, 80)}`
                        : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPortalEditing(true)}
                  >
                    Ubah
                  </Button>
                </div>
              </Card>
            ) : (
              <Card id="focus-portal" className="scroll-mt-28 border-brand/20 bg-brand-soft/30">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink-950">
                      Pemeriksaan portal rujukan statistik
                    </h3>
                    <HelpTip topic="portal_sdi" />
                    <PdfRefBadge ref="Hal. 15" />
                  </div>
                  {portalComplete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPortalEditing(false)}
                    >
                      Selesai
                    </Button>
                  ) : null}
                </div>
                <p className="mb-4 text-sm text-ink-700">
                  Cek sirusa.web.bps.go.id, romantik.bps.go.id, dan portal SDI (dll.) untuk menghindari
                  duplikasi kegiatan (Specify Need 1.5).
                </p>
                <div className="space-y-3">
                  <Checkbox
                    checked={project.portalSdi.sirusaChecked}
                    onChange={(next) => {
                      updatePortal({ sirusaChecked: next })
                      toast('Pemeriksaan portal diperbarui')
                      markSaved({ silent: true })
                    }}
                    label="Sudah mengecek sirusa.web.bps.go.id"
                  />
                  <Checkbox
                    checked={project.portalSdi.romantikChecked}
                    onChange={(next) => {
                      updatePortal({ romantikChecked: next })
                      toast('Pemeriksaan portal diperbarui')
                      markSaved({ silent: true })
                    }}
                    label="Sudah mengecek romantik.bps.go.id"
                  />
                  <Field>
                    <Label>Catatan hasil pengecekan</Label>
                    <Textarea
                      value={project.portalSdi.notes}
                      onChange={(e) => updatePortal({ notes: e.target.value })}
                      onBlur={() => notifySaved()}
                      placeholder="Contoh: Data belum tersedia di portal, perlu survei baru"
                    />
                  </Field>
                </div>
              </Card>
            )}

            {project.klasifikasi === 'sektoral' &&
            !rekomendasiIncomplete &&
            !rekomendasiEditing ? (
              <Card id="focus-rekomendasi" className="scroll-mt-28 border-success/20 bg-success-soft/20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-950">
                        Draf rekomendasi kegiatan statistik ke BPS
                      </h3>
                      <Badge tone="success">Disiapkan</Badge>
                      <HelpTip topic="rekomendasi" />
                    </div>
                    <p className="mt-2 text-sm text-ink-700">
                      {project.rekomendasiBps.namaKegiatan || 'Nama kegiatan'} ·{' '}
                      {project.rekomendasiBps.penyelenggara || 'Penyelenggara'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRekomendasiEditing(true)}
                  >
                    Ubah
                  </Button>
                </div>
              </Card>
            ) : null}

            {project.klasifikasi === 'sektoral' &&
            (rekomendasiIncomplete || rekomendasiEditing) ? (
              <Card id="focus-rekomendasi" className="scroll-mt-28 border-gold-500/30 bg-gold-100/60">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink-950">
                      Draf rekomendasi kegiatan statistik ke BPS
                    </h3>
                    <HelpTip topic="rekomendasi" />
                    <PdfRefBadge ref="Hal. 17 & 23" />
                  </div>
                  {!rekomendasiIncomplete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRekomendasiEditing(false)}
                    >
                      Selesai
                    </Button>
                  ) : null}
                </div>
                <p className="mb-4 text-sm text-ink-700">
                  Wajib bagi penyelenggara statistik sektoral (Design 2.6). Setelah formulir lengkap,
                  centang checklist &quot;Pengajuan rekomendasi ke BPS&quot; pada subproses 2.6.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <Label>Nama kegiatan</Label>
                    <Input
                      value={project.rekomendasiBps.namaKegiatan}
                      onChange={(e) =>
                        setRekomendasiBps(project.id, {
                          ...project.rekomendasiBps,
                          namaKegiatan: e.target.value,
                        })
                      }
                      onBlur={() => notifySaved()}
                    />
                  </Field>
                  <Field>
                    <Label>Penyelenggara</Label>
                    <Input
                      value={project.rekomendasiBps.penyelenggara}
                      onChange={(e) =>
                        setRekomendasiBps(project.id, {
                          ...project.rekomendasiBps,
                          penyelenggara: e.target.value,
                        })
                      }
                      onBlur={() => notifySaved()}
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <Label>Tujuan kegiatan</Label>
                    <Textarea
                      value={project.rekomendasiBps.tujuan}
                      onChange={(e) =>
                        setRekomendasiBps(project.id, {
                          ...project.rekomendasiBps,
                          tujuan: e.target.value,
                        })
                      }
                      onBlur={() => notifySaved()}
                    />
                  </Field>
                  <Field>
                    <Label>Periode pelaksanaan</Label>
                    <Input
                      value={project.rekomendasiBps.periode}
                      onChange={(e) =>
                        setRekomendasiBps(project.id, {
                          ...project.rekomendasiBps,
                          periode: e.target.value,
                        })
                      }
                      onBlur={() => notifySaved()}
                    />
                  </Field>
                  <Field>
                    <Label>Catatan tambahan</Label>
                    <Input
                      value={project.rekomendasiBps.catatan}
                      onChange={(e) =>
                        setRekomendasiBps(project.id, {
                          ...project.rekomendasiBps,
                          catatan: e.target.value,
                        })
                      }
                      onBlur={() => notifySaved()}
                    />
                  </Field>
                </div>
              </Card>
            ) : null}

            {phase.subProcesses.map((sp) => {
              const visible = isSubProcessVisible(sp.skipWhen, project.jenisKegiatan)
              if (!visible) {
                return (
                  <Card key={sp.id} className="border-dashed opacity-70">
                    <div className="text-sm font-medium text-ink-700">
                      {sp.code} {sp.title}
                    </div>
                    <p className="mt-1 text-xs text-ink-600">
                      Dilewati untuk jenis kegiatan {jenisLabel(project.jenisKegiatan)} — sesuai
                      modul BPS.
                    </p>
                  </Card>
                )
              }
              return (
                <Card key={sp.id}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="text-xs font-medium text-ink-600">{sp.code}</div>
                    {sp.pdfRef ? <PdfRefBadge ref={sp.pdfRef} /> : null}
                  </div>
                  <h3 className="font-semibold text-ink-950">{sp.title}</h3>
                  <p className="mt-1 text-sm text-ink-700">{sp.description}</p>
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-600">
                      Kegiatan
                    </div>
                    <ul className="space-y-1.5">
                      {sp.activities.map((a) => (
                        <li key={a} className="flex gap-2 text-sm text-ink-800">
                          <span className="mt-0.5 shrink-0 text-ink-600">
                            <TickSquare size={14} variant="Bold" color="currentColor" />
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 rounded-xl bg-ink-50 p-3">
                    <div className="mb-2 text-xs font-medium text-ink-700">Keluaran</div>
                    <div className="flex flex-wrap gap-2">
                      {sp.outputs.map((o) => (
                        <Badge key={o}>{o}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {sp.checklist
                      .filter((c) =>
                        isChecklistVisible(c, project.jenisKegiatan, project.klasifikasi),
                      )
                      .map((c) => (
                        <Checkbox
                          key={c.id}
                          checked={!!project.checklistState[c.id]}
                          onChange={() => onChecklistToggle(c.id)}
                          label={
                            <>
                              {c.label}
                              {c.required ? (
                                <span className="ml-1 text-xs text-danger">*</span>
                              ) : null}
                            </>
                          }
                        />
                      ))}
                  </div>
                </Card>
              )
            })}
              </>
            )}
          </div>
        </div>
        </div>
      )}

      {tab === 'checklist' && (
        <div id="focus-checklist" className="space-y-4 scroll-mt-28">
          <TabHowTo tabId="checklist" />
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Checklist seluruh fase GSBPM 5.2</h2>
            <HelpTip topic="checklist" />
            <HelpTip topic="gsbpm" />
          </div>
          <div className="space-y-6">
            {GSBPM_PHASES.map((ph) => (
              <div key={ph.id}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">
                    {ph.code}. {ph.titleId}
                  </h3>
                  <span className="text-xs text-ink-600">
                    {
                      computePhaseProgress(
                        ph.id,
                        project.jenisKegiatan,
                        project.klasifikasi,
                        project.checklistState,
                      ).pct
                    }
                    %
                  </span>
                </div>
                <div className="space-y-2">
                  {ph.subProcesses.flatMap((sp) => {
                    if (!isSubProcessVisible(sp.skipWhen, project.jenisKegiatan)) return []
                    return sp.checklist
                      .filter((c) =>
                        isChecklistVisible(c, project.jenisKegiatan, project.klasifikasi),
                      )
                      .map((c) => (
                        <Checkbox
                          key={c.id}
                          checked={!!project.checklistState[c.id]}
                          onChange={() => onChecklistToggle(c.id)}
                          label={
                            <>
                              <span className="text-ink-600">{sp.code}</span> {c.label}
                            </>
                          }
                        />
                      ))
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>
      )}

      {tab === 'design' && (
        <div className="space-y-4">
          <TabHowTo tabId="design" />
        <Card className="max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Perancangan pengumpulan data</h2>
            <HelpTip topic="design" />
            <PdfRefBadge ref="Hal. 20" />
          </div>
          <p className="text-sm text-ink-700">
            Design 2.3 — tentukan cara, metode, dan moda pengumpulan sesuai jenis kegiatan.
          </p>
          <Field helper="Mengubah cara pengumpulan juga menyesuaikan jenis kegiatan dan checklist yang relevan.">
            <Label>Cara pengumpulan</Label>
            <Select
              value={project.design.caraPengumpulan}
              onChange={(e) => {
                const cara = e.target.value as typeof project.design.caraPengumpulan
                setJenis(project.id, cara as typeof project.jenisKegiatan)
                toast('Jenis kegiatan diperbarui')
                markSaved({ silent: true })
              }}
            >
              <option value="survei">Survei</option>
              <option value="sensus">Sensus</option>
              <option value="kompromin">Kompilasi produk administrasi (kompromin)</option>
            </Select>
          </Field>
          {project.jenisKegiatan !== 'kompromin' ? (
            <>
              <Field helper="Wawancara · pengisian mandiri · observasi lapangan">
                <Label>Metode pengumpulan</Label>
                <Select
                  value={project.design.metodePengumpulan}
                  onChange={(e) =>
                    setDesign(project.id, {
                      ...project.design,
                      metodePengumpulan: e.target.value as typeof project.design.metodePengumpulan,
                    })
                  }
                >
                  <option value="wawancara">Wawancara</option>
                  <option value="self_enumeration">Pengisian mandiri</option>
                  <option value="observasi">Observasi</option>
                </Select>
              </Field>
                <Field helper="PAPI kertas · CAPI tablet · CATI telepon · CAWI daring">
                  <Label>Moda pengumpulan</Label>
                  <Select
                  value={project.design.modaPengumpulan}
                  onChange={(e) =>
                    setDesign(project.id, {
                      ...project.design,
                      modaPengumpulan: e.target.value as typeof project.design.modaPengumpulan,
                    })
                  }
                >
                  <option value="papi">PAPI — kertas & pensil</option>
                  <option value="capi">CAPI — komputer/tablet</option>
                  <option value="cati">CATI — wawancara telepon</option>
                  <option value="cawi">CAWI — daring/web</option>
                </Select>
                </Field>
            </>
          ) : (
            <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-700">
              Untuk kompromin, fokus pada perjanjian penggunaan data (PKS/LADU) dan pemetaan
              variabel dari sumber administratif — bukan kuesioner lapangan.
            </p>
          )}
          {project.jenisKegiatan === 'survei' ? (
            <>
              <Field>
                <Label>Metode sampling (Design 2.4)</Label>
                <Input
                  value={project.design.metodeSampling}
                  onChange={(e) =>
                    setDesign(project.id, {
                      ...project.design,
                      metodeSampling: e.target.value,
                    })
                  }
                  placeholder="Contoh: Sampling acak berstrata"
                />
              </Field>
              <Field>
                <Label>Ukuran sampel</Label>
                <Input
                  value={project.design.ukuranSampel}
                  onChange={(e) =>
                    setDesign(project.id, {
                      ...project.design,
                      ukuranSampel: e.target.value,
                    })
                  }
                  placeholder="Catat hasil perhitungan ukuran sampel"
                />
              </Field>
              <SampelKalkulator
                value={project.design.ukuranSampel}
                onApply={(ukuran, metodeHint) => {
                  setDesign(project.id, {
                    ...project.design,
                    ukuranSampel: ukuran,
                    metodeSampling:
                      project.design.metodeSampling.trim() ||
                      metodeHint ||
                      project.design.metodeSampling,
                  })
                  toast('Ukuran sampel dari kalkulator diterapkan')
                  markSaved({ silent: true })
                }}
              />
            </>
          ) : null}
        </Card>
        </div>
      )}

      {tab === 'variables' && (
        <div className="space-y-4">
          <TabHowTo tabId="variables" />
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Manajer variabel</h2>
                  <HelpTip topic="variables" />
                </div>
                <p className="text-sm text-ink-700">
                  Design 2.2 — edit langsung, tersimpan otomatis ke perangkat. Isi nama + definisi
                  dulu, lalu tipe/skala/sumber/contoh/missing.
                </p>
              </div>
              <Button
                size="sm"
                tooltip="Tambah variabel baru"
                onClick={() => {
                  const id = crypto.randomUUID()
                  upsertVariable(project.id, {
                    id,
                    name: '',
                    definition: '',
                    type: 'teks',
                    scale: 'nominal',
                    category: '',
                    unit: '',
                    source: '',
                    exampleValue: '',
                    missingValueRule: '',
                  })
                  setFocusVariableId(id)
                  toast('Variabel baru ditambahkan')
                  markSaved({ silent: true })
                }}
              >
                + Tambah
              </Button>
            </div>
            <div className="space-y-3">
              {project.variables.length === 0 ? (
                <EmptyState
                  icon={Hashtag}
                  title="Belum ada variabel"
                  description="Tambahkan variabel sesuai kebutuhan kegiatan statistik Anda."
                  why="Daftar variabel menjadi dasar instrumen, metadata MS-Var, dan analisis."
                  actionLabel="Tambah variabel"
                  onAction={() => {
                    const id = crypto.randomUUID()
                    upsertVariable(project.id, {
                      id,
                      name: '',
                      definition: '',
                      type: 'teks',
                    })
                    setFocusVariableId(id)
                  }}
                  className="border-0 bg-transparent p-8 shadow-none"
                />
              ) : (
                project.variables.map((v, idx) => (
                  <VariableCard
                    key={v.id}
                    variable={v}
                    index={idx}
                    total={project.variables.length}
                    autoFocus={focusVariableId === v.id}
                    onChange={(next) => upsertVariable(project.id, next)}
                    onAutosave={() => notifySaved()}
                    onRemove={() => removeVariable(project.id, v.id)}
                    onDuplicate={() => {
                      const copy = {
                        ...v,
                        id: crypto.randomUUID(),
                        name: `${v.name || 'Variabel'} (salinan)`,
                      }
                      const next = [...project.variables]
                      next.splice(idx + 1, 0, copy)
                      setVariables(project.id, next)
                      setFocusVariableId(copy.id)
                    }}
                    onMove={(dir) => {
                      const next = [...project.variables]
                      const j = idx + dir
                      if (j < 0 || j >= next.length) return
                      ;[next[idx], next[j]] = [next[j], next[idx]]
                      setVariables(project.id, next)
                      toast('Urutan variabel diperbarui')
                    }}
                  />
                ))
              )}
            </div>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Indikator</h2>
              <HelpTip topic="indicators" />
            </div>
            <p className="mb-3 text-sm text-ink-700">
              Rumus yang memakai variabel terkait. Pada data demo sudah terisi sebagai contoh
              ilustratif — pastikan selaras dengan variabel sebelum dibahas dengan BPS.
            </p>
            {project.indicators.length === 0 ? (
              <p className="text-sm text-ink-600">
                Belum ada indikator. Indikator biasanya disusun setelah variabel utama ditetapkan
                (misalnya IKM dari skor unsur, atau produktivitas dari produksi/luas).
              </p>
            ) : (
              <ul className="space-y-2">
                {project.indicators.map((i) => (
                  <li key={i.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-ink-700">{i.formula}</div>
                    {i.relatedVariables?.length ? (
                      <div className="mt-1 text-xs text-ink-600">
                        Variabel terkait: {i.relatedVariables.join(', ')}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Tujuan</h2>
            <p className="mb-2 text-sm text-ink-700">
              Tujuan kegiatan yang diarahkan asisten/perencanaan. Gunakan sebagai acuan saat menyusun
              variabel dan instrumen.
            </p>
            <ul className="space-y-2">
              {project.objectives.map((o) => (
                <li key={o} className="text-sm text-ink-800">
                  • {o}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'instruments' && (
        <div className="space-y-4">
          <TabHowTo tabId="instruments" />
          {project.jenisKegiatan === 'kompromin' ? (
            <Card>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Struktur pencatatan kompilasi</h2>
                <HelpTip topic="instruments" />
                <PdfRefBadge ref="Hal. 33–34" />
              </div>
              <p className="text-sm text-ink-700">
                Kompromin menggunakan data administratif yang sudah tersedia. Dokumentasikan
                pemetaan variabel dari sumber data dan pastikan PKS/LADU dengan penyedia data
                (Collect 4.2).
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-800">
                {project.variables.map((v) => (
                  <li key={v.id} className="rounded-lg border border-border px-3 py-2">
                    <span className="font-medium">{v.name || 'Tanpa nama'}</span>
                    <span className="text-ink-600"> — sumber: {v.source || 'belum ditentukan'}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Rancangan instrumen</h2>
                    <HelpTip topic="instruments" />
                  </div>
                  <p className="text-sm text-ink-700">
                    Susun pertanyaan runtun, singkat, hindari pertanyaan ganda/mengarahkan (Build
                    3.1). Samakan opsi jawaban dengan kategori variabel. Perubahan tersimpan
                    otomatis.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const id = crypto.randomUUID()
                    setQuestionnaire(project.id, [
                      ...project.questionnaire,
                      {
                        id,
                        number: String(project.questionnaire.length + 1),
                        text: '',
                        type: 'tertutup',
                        options: ['Ya', 'Tidak'],
                      },
                    ])
                    setFocusQuestionId(id)
                    toast('Pertanyaan baru ditambahkan')
                    markSaved({ silent: true })
                  }}
                >
                  Tambah
                </Button>
              </div>
              {project.questionnaire.length === 0 ? (
                <EmptyState
                  icon={ClipboardText}
                  title="Belum ada pertanyaan"
                  description="Tambahkan butir kuesioner sesuai rancangan Design 2.3."
                  why="Instrumen yang jelas mengurangi kesalahan pengumpulan di lapangan."
                  actionLabel="Tambah pertanyaan"
                  onAction={() => {
                    const id = crypto.randomUUID()
                    setQuestionnaire(project.id, [
                      {
                        id,
                        number: '1',
                        text: '',
                        type: 'tertutup',
                        options: ['Ya', 'Tidak'],
                      },
                    ])
                    setFocusQuestionId(id)
                  }}
                  className="border-0 bg-transparent p-8 shadow-none"
                />
              ) : (
                <div className="space-y-3">
                  {project.questionnaire.map((q, idx) => (
                    <QuestionCard
                      key={q.id}
                      item={q}
                      autoFocus={focusQuestionId === q.id}
                      onChange={(next) => {
                        const list = [...project.questionnaire]
                        list[idx] = next
                        setQuestionnaire(project.id, list)
                      }}
                      onAutosave={() => notifySaved()}
                      onRemove={() =>
                        setQuestionnaire(
                          project.id,
                          project.questionnaire.filter((x) => x.id !== q.id),
                        )
                      }
                      onDuplicate={() => {
                        const copy = {
                          ...q,
                          id: crypto.randomUUID(),
                          number: String(project.questionnaire.length + 1),
                          text: `${q.text || 'Pertanyaan'} (salinan)`,
                        }
                        const list = [...project.questionnaire]
                        list.splice(idx + 1, 0, copy)
                        setQuestionnaire(project.id, list)
                        setFocusQuestionId(copy.id)
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-4">
          <TabHowTo tabId="timeline" />
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Timeline perencanaan</h2>
            <HelpTip topic="timeline" />
          </div>
          {timelineRange ? (
            <p className="mb-1 text-sm font-semibold text-ink-900">{timelineRange}</p>
          ) : null}
          <p className="mb-4 text-sm text-ink-700">
            Jadwal per fase GSBPM (minggu ke-berapa sejak mulai) sebagai alat bantu perencanaan —
            durasinya bukan ketentuan resmi BPS dan bukan syarat ekspor.
          </p>
          {project.timeline.length === 0 ? (
            <p className="text-sm text-ink-600">Belum ada item timeline pada proyek ini.</p>
          ) : (
          <div className="space-y-3">
            {project.timeline.map((t, i) => {
              const span = Math.max(1, t.endWeek - t.startWeek + 1)
              const dates = timelineDates?.[i]
              return (
                <div key={t.id} className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="text-sm font-medium text-ink-900">
                    {t.title}
                    {dates ? (
                      <span className="block text-xs font-normal text-ink-500">
                        {formatDateID(dates.startISO)} – {formatDateID(dates.endISO)}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative h-10 overflow-hidden rounded-xl bg-ink-100">
                    <div
                      className="absolute top-1.5 h-7 whitespace-nowrap rounded-lg bg-ink-900 text-[11px] font-medium leading-7 text-white"
                      style={{
                        left: `min(${((t.startWeek - 1) / timelineWeeks) * 100}%, calc(100% - 64px))`,
                        width: `${(span / timelineWeeks) * 100}%`,
                        minWidth: '64px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                      }}
                    >
                      W{t.startWeek}–{t.endWeek}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </Card>
        </div>
      )}

      {tab === 'metadata' && (
        <div id="focus-metadata" className="space-y-4 scroll-mt-28">
          <TabHowTo tabId="metadata" />
        <div className="grid gap-4 lg:grid-cols-3">
          {(
            [
              { section: 'kegiatan' as const, title: 'MS-Keg', fields: MS_KEG_FIELDS, ref: 'Hal. 59' },
              { section: 'variabel' as const, title: 'MS-Var', fields: MS_VAR_FIELDS, ref: 'Hal. 59' },
              { section: 'indikator' as const, title: 'MS-Ind', fields: MS_IND_FIELDS, ref: 'Hal. 59' },
            ] as const
          ).map(({ section, title, fields, ref }) => {
            const completion = metadataSectionComplete(
              project.metadata[section],
              fields,
            )
            const sectionDone =
              completion.total > 0 && completion.complete === completion.total
            return (
            <Card key={section}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                {sectionDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                    <TickCircle size={12} variant="Bold" color="currentColor" />
                    Lengkap
                  </span>
                ) : (
                  <Badge tone="neutral">
                    {completion.complete}/{completion.total} wajib
                  </Badge>
                )}
                <HelpTip topic="metadata" />
                <PdfRefBadge ref={ref} />
              </div>
              <p className="mb-4 text-xs text-ink-600">
                Perka BPS 5/2020 — atribut metadata {title.toLowerCase()}
              </p>
              {fields.map((f) => {
                const value = project.metadata[section][f.key] ?? ''
                const filled = value.trim().length > 0
                return (
                <Field
                  key={f.key}
                  className="mb-3"
                  helper={f.hint}
                  success={f.required ? filled : undefined}
                  counter={value.length}
                  maxLength={f.multiline ? 500 : 120}
                >
                  <Label>
                    {f.label}
                    {f.required ? <span className="text-danger"> *</span> : null}
                    {filled ? (
                      <TickCircle
                        size={14}
                        variant="Bold"
                        color="#0f7b4c"
                        className="ml-1.5 inline align-text-bottom"
                      />
                    ) : null}
                  </Label>
                  {f.multiline ? (
                    <Textarea
                      value={value}
                      maxLength={500}
                      fieldState={f.required && filled ? 'success' : 'default'}
                      onChange={(e) =>
                        updateMetadata(project.id, section, f.key, e.target.value)
                      }
                      onBlur={() => {
                        markSaved({ silent: true })
                      }}
                      placeholder={f.hint}
                    />
                  ) : (
                    <Input
                      value={value}
                      maxLength={120}
                      fieldState={f.required && filled ? 'success' : 'default'}
                      onChange={(e) =>
                        updateMetadata(project.id, section, f.key, e.target.value)
                      }
                      onBlur={() => {
                        markSaved({ silent: true })
                      }}
                      placeholder={f.hint}
                    />
                  )}
                </Field>
              )})}
            </Card>
            )
          })}
        </div>
        </div>
      )}

      {tab === 'export' && (
        <div className="space-y-4">
          <TabHowTo tabId="export" />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <Card className="h-fit p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="t-section-title">Draf rencana kegiatan</h2>
              <HelpTip topic="export" />
              {project.klasifikasi === 'sektoral' ? <HelpTip topic="rekomendasi" /> : null}
            </div>
            <p className="mt-2 inline-flex rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-700">
              Draf bahan kerja — bukan dokumen resmi BPS
            </p>
            <p className="t-support mt-3">
              Dokumen Word (.docx) disusun di perangkat Anda, tanpa unggahan ke server. Isinya:
            </p>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
              {(
                [
                  ['Identitas kegiatan', project.name],
                  ['Pemeriksaan portal rujukan', portalComplete ? 'Sudah dicatat' : 'Belum dicatat'],
                  ['Perancangan (cara, metode, moda, sampel)', methodLabel(project)],
                  ['Variabel & indikator', `${project.variables.length} variabel · ${project.indicators.length} indikator`],
                  ['Instrumen', `${project.questionnaire.length} pertanyaan`],
                  ...(project.klasifikasi === 'sektoral'
                    ? ([['Draf rekomendasi BPS', project.checklistState['de-12'] ? 'Disiapkan' : 'Belum disiapkan']] as const)
                    : []),
                  ['Timeline', `${project.timeline.length} fase`],
                  ['Checklist GSBPM 5.2', `${progress.done}/${progress.total} butir wajib (${progress.pct}%)`],
                  ['Metadata MS-Keg / MS-Var / MS-Ind', 'Sesuai isian tab Metadata'],
                ] as const
              ).map(([label, value]) => (
                <li key={label} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <span className="text-sm font-medium text-ink-900">{label}</span>
                  <span className="text-xs text-ink-500 sm:text-right">{value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-border pt-5">
              {exportAllowed ? (
                <Button
                  className={cn('w-full sm:w-auto', !exporting && 'success-flash')}
                  loading={exporting}
                  success={exportSuccess}
                  leftIcon={<DocumentDownload size={16} variant="Bold" color="currentColor" />}
                  disabled={exporting}
                  onClick={() => void handleExport()}
                >
                  {exporting ? exportStage ?? 'Menyiapkan dokumen…' : 'Unduh draf perencanaan'}
                </Button>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink-950">
                    {validationIssues.filter((i) => i.severity === 'error').length} hal perlu
                    dilengkapi sebelum draf dapat diunduh
                  </p>
                  <p className="t-support mt-1">
                    Gunakan tombol pada daftar tinjauan untuk membuka bagian yang perlu dilengkapi.
                  </p>
                  <Button
                    className="mt-3 w-full sm:w-auto"
                    variant="secondary"
                    disabled
                    leftIcon={<DocumentDownload size={16} variant="Bold" color="currentColor" />}
                  >
                    Unduh draf perencanaan
                  </Button>
                </div>
              )}
              {exporting && exportStage ? (
                <p className="mt-2 text-xs text-ink-600" aria-live="polite">
                  {exportStage}
                </p>
              ) : null}
            </div>
          </Card>
          <section aria-labelledby="tinjauan-ekspor">
            <h2 id="tinjauan-ekspor" className="t-label mb-3">
              Tinjauan sebelum ekspor
            </h2>
            <ValidationBanner
              issues={validationIssues}
              onNavigate={(t, code) => goTab(t as TabId, code && ISSUE_FOCUS[code] ? `focus-${ISSUE_FOCUS[code]}` : undefined)}
            />
            <p className="t-support mt-4">
              Tinjauan ini dibuat oleh aturan StatPlan untuk membantu kelengkapan draf — bukan
              validasi resmi BPS.
            </p>
          </section>
        </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-4">
          <TabHowTo tabId="activity" />
        <Card className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Riwayat proyek</h2>
            <HelpTip topic="activity" />
          </div>
          <p className="mb-4 text-sm leading-relaxed text-ink-700">
            StatPlan saat ini menyimpan waktu pembuatan dan perubahan proyek di perangkat ini,
            bukan log setiap aktivitas.
          </p>
          <dl className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-ink-50/50 px-4 py-3">
              <dt className="text-xs font-medium text-ink-600">Dibuat</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-950">
                {formatDateTime(project.createdAt)}
              </dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-ink-50/50 px-4 py-3">
              <dt className="text-xs font-medium text-ink-600">Terakhir diubah</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-950">
                {formatDateTime(project.updatedAt)}
              </dd>
            </div>
            {project.portalSdi.checkedAt ? (
              <div className="rounded-xl border border-border/70 bg-ink-50/50 px-4 py-3">
                <dt className="text-xs font-medium text-ink-600">Pemeriksaan portal dicatat</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-950">
                  {formatDateTime(project.portalSdi.checkedAt)}
                </dd>
              </div>
            ) : null}
          </dl>
        </Card>
        </div>
      )}
      </div>
      </div>
    </div>
  )
}
