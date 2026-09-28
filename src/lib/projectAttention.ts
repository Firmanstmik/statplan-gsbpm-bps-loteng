import { isDemoProject } from '@/demo/seed'
import type { Project } from '@/domain/types'
import { canExport, validateProject, type ValidationIssue } from '@/domain/validation'

export const ATTENTION_LIMIT = 5

const ISSUE_ACTION: Record<string, string> = {
  portal_sdi: 'Lengkapi pemeriksaan portal',
  checklist_incomplete: 'Lengkapi checklist',
  jenis_undocumented: 'Dokumentasikan jenis kegiatan',
  rekomendasi_required: 'Tandai persiapan rekomendasi',
  rekomendasi_form: 'Lengkapi draf rekomendasi',
  metadata_keg: 'Lengkapi metadata kegiatan',
  metadata_var: 'Lengkapi metadata variabel',
  metadata_ind: 'Lengkapi metadata indikator',
  no_variables: 'Tambah variabel',
  variable_def: 'Lengkapi definisi variabel',
  design_cara: 'Tetapkan cara pengumpulan',
  no_questionnaire: 'Susun instrumen',
  sampling_design: 'Lengkapi rancangan sampel',
}

const ISSUE_RANK: Record<string, number> = {
  portal_sdi: 0,
  checklist_incomplete: 1,
  rekomendasi_required: 2,
  metadata_keg: 3,
  rekomendasi_form: 4,
  no_variables: 5,
  variable_def: 6,
  design_cara: 7,
  no_questionnaire: 8,
  sampling_design: 9,
  jenis_undocumented: 10,
  metadata_var: 11,
  metadata_ind: 12,
}

export interface AttentionItem {
  id: string
  projectId: string
  projectName: string
  isDemo: boolean
  code: string
  action: string
  description: string
  severity: ValidationIssue['severity']
  extraCount: number
  href: string
  updatedAt: string
}

export interface ProjectNextAction {
  label: string
  href: string
}

function uniqueIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    if (seen.has(issue.code)) return false
    seen.add(issue.code)
    return true
  })
}

function issuePriority(code: string, severity: ValidationIssue['severity']): number {
  const severityRank = severity === 'error' ? 0 : 1
  return severityRank * 100 + (ISSUE_RANK[code] ?? 50)
}

function pickPrimaryIssue(issues: ValidationIssue[]): ValidationIssue | null {
  if (issues.length === 0) return null
  const sorted = [...issues].sort((a, b) => {
    const rank = issuePriority(a.code, a.severity) - issuePriority(b.code, b.severity)
    if (rank !== 0) return rank
    return a.code.localeCompare(b.code)
  })
  return sorted[0] ?? null
}

export function projectHref(projectId: string, tab?: string): string {
  // A bare workspace URL opens the default tab (Timeline), so every named tab is explicit.
  if (!tab) return `/app/projects/${projectId}`
  return `/app/projects/${projectId}?tab=${tab}`
}

export function nextActionForProject(project: Project): ProjectNextAction {
  const issues = uniqueIssues(validateProject(project))
  const primary = pickPrimaryIssue(issues)
  if (primary) {
    return {
      label: ISSUE_ACTION[primary.code] ?? 'Periksa validasi',
      href: projectHref(project.id, primary.tab),
    }
  }
  if (canExport(project)) {
    return { label: 'Siap diekspor', href: projectHref(project.id, 'export') }
  }
  return { label: 'Lanjutkan perencanaan', href: projectHref(project.id) }
}

function errorCount(issues: ValidationIssue[]): number {
  return issues.filter((issue) => issue.severity === 'error').length
}

function compareAttention(a: AttentionItem, b: AttentionItem): number {
  const severity = Number(a.severity !== 'error') - Number(b.severity !== 'error')
  if (severity !== 0) return severity
  const rank =
    issuePriority(a.code, a.severity) - issuePriority(b.code, b.severity)
  if (rank !== 0) return rank
  const demo = Number(a.isDemo) - Number(b.isDemo)
  if (demo !== 0) return demo
  if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1
  return a.projectId.localeCompare(b.projectId)
}

export function buildAttentionItems(
  projects: Project[],
  limit = ATTENTION_LIMIT,
): AttentionItem[] {
  const items: AttentionItem[] = []

  for (const project of projects) {
    if (project.status === 'archived') continue
    const issues = uniqueIssues(validateProject(project))
    const primary = pickPrimaryIssue(issues)
    if (!primary) continue
    items.push({
      id: `${project.id}:${primary.code}`,
      projectId: project.id,
      projectName: project.name,
      isDemo: isDemoProject(project),
      code: primary.code,
      action: ISSUE_ACTION[primary.code] ?? 'Periksa validasi',
      description: primary.message,
      severity: primary.severity,
      extraCount: issues.length - 1,
      href: projectHref(project.id, primary.tab),
      updatedAt: project.updatedAt,
    })
  }

  return items.sort(compareAttention).slice(0, limit)
}

function statusRank(status: Project['status']): number {
  switch (status) {
    case 'in_progress':
      return 1
    case 'draft':
      return 2
    case 'ready_for_review':
      return 3
    case 'archived':
      return 4
    default:
      return 5
  }
}

export function sortProjectsForDashboard(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const archived = Number(a.status === 'archived') - Number(b.status === 'archived')
    if (archived !== 0) return archived

    const aIssues = uniqueIssues(validateProject(a))
    const bIssues = uniqueIssues(validateProject(b))
    const aErrors = errorCount(aIssues)
    const bErrors = errorCount(bIssues)
    const blocking = Number(bErrors > 0) - Number(aErrors > 0)
    if (blocking !== 0) return blocking
    if (aErrors !== bErrors) return bErrors - aErrors

    const status = statusRank(a.status) - statusRank(b.status)
    if (status !== 0) return status

    const warnings = Number(bIssues.length > 0) - Number(aIssues.length > 0)
    if (warnings !== 0) return warnings

    const demo = Number(isDemoProject(a)) - Number(isDemoProject(b))
    if (demo !== 0) return demo

    if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1
    return a.id.localeCompare(b.id)
  })
}
