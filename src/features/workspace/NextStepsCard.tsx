import { ISSUE_FOCUS } from '@/lib/projectAttention'
import { ArrowRight2 } from 'iconsax-react'
import { getProjectNextSteps, type WorkspaceTabId } from '@/content/howToWork'
import type { Project } from '@/domain/types'
import { Card, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HelpTip } from '@/components/ui/HelpTip'
import { cn } from '@/lib/utils'
import { VALIDATION_GUIDANCE } from '@/content/validationGuidance'

/** Prefer the specific review title over generic “Wajib dilengkapi”. */
function stepTitle(s: { id: string; title: string }) {
  return VALIDATION_GUIDANCE[s.id]?.title ?? s.title
}

const tabLabel: Record<WorkspaceTabId, string> = {
  workflow: 'Alur kerja',
  checklist: 'Checklist',
  design: 'Perancangan',
  variables: 'Variabel',
  instruments: 'Instrumen',
  timeline: 'Timeline',
  metadata: 'Metadata',
  activity: 'Riwayat',
  export: 'Ekspor',
}

function focusForStep(id: string, tab: WorkspaceTabId): string | undefined {
  const target = ISSUE_FOCUS[id]
  if (target) return `focus-${target}`
  if (tab === 'checklist' || id === 'checklist_incomplete') return 'focus-checklist'
  if (tab === 'metadata' || id.startsWith('metadata_')) return 'focus-metadata'
  return 'workspace-tab-panel'
}

function priorityLabel(priority: 'wajib' | 'disarankan' | 'selesai') {
  if (priority === 'wajib') return 'Perlu dilengkapi'
  if (priority === 'selesai') return 'Siap'
  return 'Perlu ditinjau'
}

export function NextStepsCard({
  project,
  onGoTab,
}: {
  project: Project
  onGoTab: (tab: WorkspaceTabId, focusId?: string) => void
}) {
  const steps = getProjectNextSteps(project)
  const ready = steps.some((s) => s.priority === 'selesai' && s.id === 'export-ready')
  const primary = steps[0]
  const rest = steps.slice(1)

  if (!primary) return null

  return (
    <Card
      className={cn(
        'mb-6',
        ready ? 'border-success/20 bg-success-soft/20' : undefined,
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="t-label">
          {ready ? 'Siap ekspor' : 'Langkah berikutnya'}
        </p>
        <HelpTip topic="how_to" />
        <Badge
          tone={
            primary.priority === 'wajib'
              ? 'warning'
              : primary.priority === 'selesai'
                ? 'success'
                : 'gold'
          }
        >
          {priorityLabel(primary.priority)}
        </Badge>
      </div>
      <h2 className="text-base font-semibold tracking-tight text-ink-950 sm:text-lg">
        {stepTitle(primary)}
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-700">{primary.detail}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          className="w-full sm:w-auto"
          variant={ready ? 'secondary' : primary.priority === 'wajib' ? 'primary' : 'secondary'}
          rightIcon={<ArrowRight2 size={14} variant="Bold" color="currentColor" aria-hidden />}
          onClick={() => onGoTab(primary.tab, focusForStep(primary.id, primary.tab))}
        >
          Buka {tabLabel[primary.tab]}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onGoTab('export')}>
          Lihat tinjauan lengkap
        </Button>
      </div>
      {rest.length > 0 ? (
        <ul className="mt-4 space-y-1 border-t border-border/70 pt-3">
          {rest.map((s, i) => (
            <li
              key={`${s.id}-${i}`}
              className="flex flex-wrap items-start justify-between gap-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-ink-900">{stepTitle(s)}</span>
                  <Badge
                    tone={
                      s.priority === 'wajib'
                        ? 'warning'
                        : s.priority === 'selesai'
                          ? 'success'
                          : 'gold'
                    }
                  >
                    {priorityLabel(s.priority)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{s.detail}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGoTab(s.tab, focusForStep(s.id, s.tab))}
              >
                Buka {tabLabel[s.tab]}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
