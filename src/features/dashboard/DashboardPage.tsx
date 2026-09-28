import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Add, ArrowRight2, Book1, Refresh2, TickCircle, Trash } from 'iconsax-react'
import { isDemoProject, isReviewStatusStale } from '@/demo'
import { buildDashboardBundle } from '@/demo/dashboard'
import { computeProjectProgress, GSBPM_PHASES } from '@/domain/gsbpm'
import type { Project } from '@/domain/types'
import { canExport } from '@/domain/validation'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/store/toastStore'
import { Badge, ProgressBar } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { HelpTip } from '@/components/ui/HelpTip'
import { buildAttentionItems, nextActionForProject, sortProjectsForDashboard } from '@/lib/projectAttention'
import { LANDING_EXAMPLES } from '@/content/landingExamples'
import { VALIDATION_GUIDANCE } from '@/content/validationGuidance'
import { formatDate, jenisLabel, statusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * Proyek saya — where to continue, what needs attention, and where to learn.
 * Uses persisted project data only: no invented activity, export, or approval history.
 */

const demoBadgeClass = 'border border-dashed border-ink-300 bg-surface text-ink-600'

function phaseTitle(project: Project): string {
  return GSBPM_PHASES.find((p) => p.id === project.currentPhaseId)?.titleId ?? '—'
}

function ProjectRow({
  project,
  onDelete,
}: {
  project: Project
  onDelete: () => void
}) {
  const navigate = useNavigate()
  const progress = computeProjectProgress(project.jenisKegiatan, project.klasifikasi, project.checklistState)
  const exportReady = canExport(project)
  const stale = isReviewStatusStale(project)
  const next = nextActionForProject(project)
  const demo = isDemoProject(project)

  return (
    <li className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-center">
      <div className="min-w-0">
        <Link
          to={`/app/projects/${project.id}`}
          className="focus-ring rounded text-[15px] font-semibold leading-snug text-ink-950 hover:underline"
        >
          {project.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="brand">{jenisLabel(project.jenisKegiatan)}</Badge>
          <Badge tone={stale ? 'warning' : 'neutral'}>{stale ? 'Perlu dilengkapi' : statusLabel(project.status)}</Badge>
          {exportReady ? <Badge tone="success">Siap diekspor</Badge> : null}
          {demo ? <Badge className={demoBadgeClass}>Demo · contoh ilustratif</Badge> : null}
        </div>
        <p className="mt-1.5 text-xs text-ink-500">
          Fase {phaseTitle(project)} · disimpan {formatDate(project.updatedAt)}
        </p>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-ink-600">
          <span>Checklist wajib</span>
          <span className="font-semibold tabular-nums text-ink-900">{progress.pct}%</span>
        </div>
        <ProgressBar value={progress.pct} premium={progress.pct >= 80} label={`Progres ${project.name}`} />
        <p className="mt-1.5 truncate text-xs text-ink-600" title={next.label}>
          Berikutnya: <span className="font-medium text-ink-900">{next.label}</span>
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 md:flex-none"
          aria-label={`Buka ${project.name}: ${next.label}`}
          onClick={() => navigate(next.href)}
        >
          Buka
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Hapus proyek ${project.name}`}
          tooltip="Hapus proyek"
          onClick={onDelete}
        >
          <Trash size={18} color="currentColor" className="text-danger" aria-hidden />
        </Button>
      </div>
    </li>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const projects = useAppStore((s) => s.projects)
  const deleteProject = useAppStore((s) => s.deleteProject)
  const loadDemoData = useAppStore((s) => s.loadDemoData)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const [confirm, setConfirm] = useState<null | { kind: 'load' | 'reset' | 'delete'; name?: string; id?: string }>(null)

  const bundle = useMemo(() => buildDashboardBundle(projects), [projects])
  const needAttention = useMemo(() => buildAttentionItems(projects), [projects])
  const ordered = useMemo(() => sortProjectsForDashboard(projects), [projects])
  const userProjects = ordered.filter((p) => !isDemoProject(p))
  const demoProjects = ordered.filter(isDemoProject)
  const hasDemo = demoProjects.length > 0
  const continueProject =
    [...userProjects].filter((p) => p.status !== 'archived').sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0] ??
    null
  const { stats, readyForReviewProjects } = bundle

  function runConfirm() {
    if (!confirm) return
    if (confirm.kind === 'load') {
      loadDemoData()
      toast('Data demo berhasil diperbarui tanpa mengubah proyek Anda')
    } else if (confirm.kind === 'reset') {
      resetDemo()
      toast('Data demo berhasil dibersihkan')
    } else if (confirm.kind === 'delete' && confirm.id) {
      deleteProject(confirm.id)
      toast('Proyek berhasil dihapus')
    }
    setConfirm(null)
  }

  const continueNext = continueProject ? nextActionForProject(continueProject) : null
  const continueProgress = continueProject
    ? computeProjectProgress(continueProject.jenisKegiatan, continueProject.klasifikasi, continueProject.checklistState)
    : null

  return (
    <div className="space-y-12">
      {/* 1. Context */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="t-eyebrow mb-2">Proyek saya</p>
          <h1 className="t-page-title">
            {userProjects.length ? 'Lanjutkan rencana Anda' : 'Mulai rencana kegiatan pertama Anda'}
          </h1>
          <p className="t-body mt-2">
            {userProjects.length
              ? 'Lihat proyek yang sedang disusun, apa yang masih perlu dilengkapi, dan langkah berikutnya.'
              : 'Belum tahu harus mulai dari mana? Pelajari contoh terlebih dahulu, atau langsung ceritakan kebutuhan Anda.'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 whitespace-nowrap sm:flex-row">
          <Button
            leftIcon={<Add size={16} color="currentColor" aria-hidden />}
            onClick={() => navigate('/app/new')}
          >
            Rencana baru
          </Button>
          <Button variant="secondary" onClick={() => navigate('/contoh/skm')}>
            Pelajari contoh
          </Button>
        </div>
      </header>

      {/* 2. Continue */}
      {continueProject && continueNext && continueProgress ? (
        <section aria-labelledby="lanjutkan-heading" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div className="min-w-0">
              <h2 id="lanjutkan-heading" className="t-label">
                Lanjutkan pekerjaan
              </h2>
              <p className="mt-2 font-display text-xl font-semibold leading-snug text-ink-950 sm:text-2xl">
                {continueProject.name}
              </p>
              <p className="t-support mt-1">
                {jenisLabel(continueProject.jenisKegiatan)} · fase {phaseTitle(continueProject)} · disimpan{' '}
                {formatDate(continueProject.updatedAt)}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => navigate(`/app/projects/${continueProject.id}/guided`)}
                  rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />}
                >
                  Lanjutkan di Mode Terpandu
                </Button>
                <Button variant="ghost" onClick={() => navigate(continueNext.href)}>
                  Buka ruang kerja
                </Button>
              </div>
            </div>
            <div className="rounded-xl bg-surface-muted p-4">
              <div className="mb-1.5 flex justify-between text-xs text-ink-600">
                <span>Checklist wajib</span>
                <span className="font-semibold tabular-nums text-ink-900">
                  {continueProgress.done}/{continueProgress.total}
                </span>
              </div>
              <ProgressBar value={continueProgress.pct} label="Progres checklist wajib" />
              <p className="mt-3 text-xs text-ink-500">Langkah berikutnya</p>
              <p className="text-sm font-semibold text-ink-950">{continueNext.label}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          {/* 3. Projects */}
          <section aria-labelledby="daftar-proyek-heading">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="daftar-proyek-heading" className="t-section-title">
                Proyek Anda
              </h2>
              <span className="text-sm text-ink-500">{userProjects.length} proyek</span>
            </div>
            {userProjects.length ? (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {userProjects.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    onDelete={() => setConfirm({ kind: 'delete', id: p.id, name: p.name })}
                  />
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center">
                <p className="text-[15px] font-semibold text-ink-950">Belum ada proyek Anda</p>
                <p className="t-support mx-auto mt-1 max-w-md">
                  Mulai dari contoh untuk melihat bentuk kegiatannya, atau ceritakan kebutuhan Anda
                  sendiri. Anda bisa mengubah semuanya nanti.
                </p>
                <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={() => navigate('/app/new')}>Ceritakan kebutuhan saya</Button>
                  <Button variant="secondary" onClick={() => navigate('/contoh/skm')}>
                    Pelajari contoh dulu
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="demo-heading">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id="demo-heading" className="t-section-title">
                  Proyek demo
                </h2>
                <p className="t-support mt-0.5">
                  Contoh ilustratif untuk latihan — terpisah dari proyek Anda.
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!hasDemo) {
                      loadDemoData()
                      toast('Data demo berhasil ditambahkan tanpa mengubah proyek Anda')
                    } else setConfirm({ kind: 'load' })
                  }}
                >
                  {hasDemo ? 'Perbarui demo' : 'Muat demo'}
                </Button>
                {hasDemo ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Refresh2 size={14} color="currentColor" aria-hidden />}
                    onClick={() => setConfirm({ kind: 'reset' })}
                  >
                    Bersihkan data demo
                  </Button>
                ) : null}
              </div>
            </div>
            {hasDemo ? (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {demoProjects.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    onDelete={() => setConfirm({ kind: 'delete', id: p.id, name: p.name })}
                  />
                ))}
              </ul>
            ) : (
              <p className="t-support rounded-2xl border border-border bg-surface px-5 py-4">
                Belum ada proyek demo. Muat demo untuk melihat contoh proyek yang sudah terisi.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          {/* 4. Attention */}
          <section aria-labelledby="perhatian-heading">
            <div className="mb-3 flex items-center gap-2">
              <h2 id="perhatian-heading" className="t-label">
                Perlu perhatian
              </h2>
              <HelpTip topic="export" />
            </div>
            {needAttention.length === 0 ? (
              <p className="flex items-start gap-2 rounded-2xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-ink-800">
                <TickCircle size={18} variant="Bold" color="currentColor" className="mt-0.5 shrink-0 text-success" aria-hidden />
                Tidak ada hal yang perlu ditindaklanjuti.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {needAttention.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      className="focus-ring block px-4 py-3 transition-colors hover:bg-surface-muted"
                      aria-label={`${item.projectName}: ${item.action}`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.severity === 'error' ? 'bg-danger' : 'bg-warning')}
                        />
                        <span className="text-sm font-semibold text-ink-950">
                          {VALIDATION_GUIDANCE[item.code]?.title ?? item.action}
                        </span>
                      </span>
                      <span className="mt-0.5 block pl-3.5 text-xs text-ink-600">
                        {item.projectName}
                        {item.isDemo ? ' · demo' : ''}
                        {item.extraCount > 0 ? ` · +${item.extraCount} lainnya` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="ringkasan-heading">
            <h2 id="ringkasan-heading" className="t-label mb-3">
              Ringkasan
            </h2>
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border text-center">
              {[
                ['Proyek', stats.total],
                ['Siap ditinjau', stats.readyForReview],
                ['Siap diekspor', stats.exportReady],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-2 py-3">
                  <dd className="font-display text-xl font-semibold tabular-nums text-ink-950">{value}</dd>
                  <dt className="mt-0.5 text-[11px] text-ink-500">{label}</dt>
                </div>
              ))}
            </dl>
            {readyForReviewProjects.length ? (
              <ul className="mt-3 space-y-1">
                {readyForReviewProjects.map((p) => (
                  <li key={p.projectId}>
                    <Link
                      to={`/app/projects/${p.projectId}`}
                      className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-900 hover:bg-surface-muted"
                    >
                      <TickCircle size={14} variant="Bold" color="currentColor" className="shrink-0 text-success" aria-hidden />
                      <span className="truncate">{p.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
              “Siap ditinjau” dan “siap diekspor” dihitung dari isian proyek saat ini — bukan
              persetujuan BPS.
            </p>
          </section>

          {/* 5. Examples */}
          <section aria-labelledby="contoh-heading">
            <h2 id="contoh-heading" className="t-label mb-3">
              Belajar dari contoh
            </h2>
            <ul className="space-y-2">
              {LANDING_EXAMPLES.map((ex) => (
                <li key={ex.slug}>
                  <Link
                    to={`/contoh/${ex.slug}`}
                    className="focus-ring group flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong"
                  >
                    <Book1 size={18} color="currentColor" className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink-950 group-hover:underline">{ex.title}</span>
                      <span className="block text-xs text-ink-500">{jenisLabel(ex.jenis)} · contoh ilustratif</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'load'}
        title="Perbarui data demo?"
        description="Proyek contoh akan diperbarui ke versi terbaru. Proyek yang Anda buat sendiri tidak akan diubah atau dihapus."
        confirmLabel="Perbarui data demo"
        cancelLabel="Batalkan"
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
      <ConfirmDialog
        open={confirm?.kind === 'reset'}
        title="Bersihkan data demo?"
        description="Proyek contoh akan dihapus. Proyek yang Anda buat sendiri tidak akan terpengaruh. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Bersihkan data demo"
        cancelLabel="Batalkan"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title="Hapus proyek?"
        description={`Apakah Anda yakin ingin menghapus proyek “${confirm?.name ?? ''}”?`}
        confirmLabel="Hapus"
        cancelLabel="Batalkan"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  )
}
