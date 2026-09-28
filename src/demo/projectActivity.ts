import type { ActivityLogItem, Project } from '@/domain/types'
import { buildDemoActivityLog } from './activity'

/** Per-project activity: seeded log + derived milestones from project state. */
export function getProjectActivity(project: Project): ActivityLogItem[] {
  const seeded = buildDemoActivityLog([project]).filter((a) => a.projectId === project.id)

  const derived: ActivityLogItem[] = [
    {
      id: `${project.id}-created`,
      projectId: project.id,
      projectName: project.name,
      action: 'Proyek dibuat',
      detail: 'Workspace perencanaan dibuka',
      at: project.createdAt,
      actor: project.rekomendasiBps.penyelenggara || 'OPD',
    },
    {
      id: `${project.id}-updated`,
      projectId: project.id,
      projectName: project.name,
      action: 'Proyek diperbarui',
      detail: 'Perubahan terakhir tersimpan di perangkat',
      at: project.updatedAt,
      actor: project.rekomendasiBps.penyelenggara || 'OPD',
    },
  ]

  if (project.portalSdi.checked || (project.portalSdi.sirusaChecked && project.portalSdi.romantikChecked)) {
    derived.push({
      id: `${project.id}-portal`,
      projectId: project.id,
      projectName: project.name,
      action: 'Portal SDI dikonfirmasi',
      detail: 'Pengecekan sirusa & romantik dicatat',
      at: project.portalSdi.checkedAt ?? project.updatedAt,
      actor: project.rekomendasiBps.penyelenggara || 'OPD',
    })
  }

  if (project.metadata.kegiatan.nama_kegiatan?.trim()) {
    derived.push({
      id: `${project.id}-meta`,
      projectId: project.id,
      projectName: project.name,
      action: 'Metadata dilengkapi',
      detail: 'MS-Keg tersedia untuk tinjauan',
      at: project.updatedAt,
      actor: project.rekomendasiBps.penyelenggara || 'OPD',
    })
  }

  if (project.checklistState['de-12']) {
    derived.push({
      id: `${project.id}-rek`,
      projectId: project.id,
      projectName: project.name,
      action: 'Rekomendasi BPS disiapkan',
      detail: 'Checklist Design 2.6 ditandai selesai',
      at: project.updatedAt,
      actor: project.rekomendasiBps.penyelenggara || 'OPD',
    })
  }

  if (project.status === 'ready_for_review') {
    derived.push({
      id: `${project.id}-export`,
      projectId: project.id,
      projectName: project.name,
      action: 'Ekspor / siap tinjau',
      detail: 'Status proyek siap ditinjau BPS',
      at: project.updatedAt,
      actor: 'StatPlan',
    })
  }

  const merged = [...seeded, ...derived]
  const seen = new Set<string>()
  return merged
    .filter((a) => {
      const key = `${a.action}-${a.at.slice(0, 13)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1))
}
