import { computeProjectProgress } from './gsbpm'
import {
  MS_IND_FIELDS,
  MS_KEG_FIELDS,
  MS_VAR_FIELDS,
  metadataSectionComplete,
} from './metadataSchema'
import type { Project } from './types'

export interface ValidationIssue {
  code: string
  message: string
  severity: 'error' | 'warning'
  tab?: string
}

const MIN_CHECKLIST_PCT = 80

export function requiresRekomendasiBps(project: Project): boolean {
  return project.klasifikasi === 'sektoral'
}

export function validateProject(project: Project): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!project.portalSdi.sirusaChecked || !project.portalSdi.romantikChecked) {
    issues.push({
      code: 'portal_sdi',
      message:
        'Pemeriksaan portal rujukan statistik belum lengkap. Wajib konfirmasi pengecekan sirusa.web.bps.go.id dan romantik.bps.go.id (serta portal SDI bila relevan) sesuai Specify Need 1.5, Materi Proses Bisnis hal. 15.',
      severity: 'error',
      tab: 'workflow',
    })
  }

  const progress = computeProjectProgress(
    project.jenisKegiatan,
    project.klasifikasi,
    project.checklistState,
  )
  if (progress.total > 0 && progress.pct < MIN_CHECKLIST_PCT) {
    issues.push({
      code: 'checklist_incomplete',
      message: `Checklist wajib baru ${progress.pct}% (${progress.done}/${progress.total}). Minimal ${MIN_CHECKLIST_PCT}% untuk ekspor draf.`,
      severity: 'error',
      tab: 'checklist',
    })
  }

  if (!project.checklistState['sn-10']) {
    issues.push({
      code: 'jenis_undocumented',
      message: 'Keputusan jenis kegiatan (survei/sensus/kompromin) belum ditandai pada checklist 1.5.',
      severity: 'warning',
      tab: 'workflow',
    })
  }

  if (requiresRekomendasiBps(project)) {
    if (!project.checklistState['de-12']) {
      issues.push({
        code: 'rekomendasi_required',
        message:
          'Penyelenggara statistik sektoral perlu menyiapkan pengajuan rekomendasi kegiatan statistik ke BPS (Design 2.6, PDF hal. 17 & 23).',
        severity: 'error',
        tab: 'workflow',
      })
    }
    if (!project.rekomendasiBps.namaKegiatan.trim()) {
      issues.push({
        code: 'rekomendasi_form',
        message: 'Formulir draf rekomendasi ke BPS belum diisi (nama kegiatan).',
        severity: 'warning',
        tab: 'export',
      })
    }
  }

  const keg = metadataSectionComplete(project.metadata.kegiatan, MS_KEG_FIELDS)
  if (keg.complete < keg.total) {
    issues.push({
      code: 'metadata_keg',
      message: `Metadata Statistik Kegiatan (MS-Keg) belum lengkap: ${keg.complete}/${keg.total} kolom wajib.`,
      severity: 'error',
      tab: 'metadata',
    })
  }

  const varMeta = metadataSectionComplete(project.metadata.variabel, MS_VAR_FIELDS)
  if (varMeta.complete < varMeta.total) {
    issues.push({
      code: 'metadata_var',
      message: `Metadata Statistik Variabel (MS-Var) belum lengkap: ${varMeta.complete}/${varMeta.total} kolom wajib.`,
      severity: 'warning',
      tab: 'metadata',
    })
  }

  const indMeta = metadataSectionComplete(project.metadata.indikator, MS_IND_FIELDS)
  if (indMeta.complete < indMeta.total) {
    issues.push({
      code: 'metadata_ind',
      message: `Metadata Statistik Indikator (MS-Ind) belum lengkap: ${indMeta.complete}/${indMeta.total} kolom wajib.`,
      severity: 'warning',
      tab: 'metadata',
    })
  }

  if (project.variables.length === 0) {
    issues.push({
      code: 'no_variables',
      message: 'Daftar variabel masih kosong (Design 2.2).',
      severity: 'warning',
      tab: 'variables',
    })
  } else if (project.variables.some((v) => !v.definition.trim())) {
    issues.push({
      code: 'variable_def',
      message: 'Beberapa variabel belum memiliki definisi (kondef).',
      severity: 'warning',
      tab: 'variables',
    })
  }

  if (!project.design.caraPengumpulan) {
    issues.push({
      code: 'design_cara',
      message: 'Cara pengumpulan data belum ditetapkan (Design 2.3).',
      severity: 'warning',
      tab: 'design',
    })
  }

  if (project.jenisKegiatan !== 'kompromin') {
    if (project.questionnaire.length === 0) {
      issues.push({
        code: 'no_questionnaire',
        message: 'Rancangan instrumen (kuesioner/panduan) belum disusun.',
        severity: 'warning',
        tab: 'instruments',
      })
    }
  }

  if (project.jenisKegiatan === 'survei') {
    if (!project.checklistState['de-8'] || !project.checklistState['de-9']) {
      issues.push({
        code: 'sampling_design',
        message: 'Kerangka sampel / metode sampling belum ditandai lengkap (Design 2.4).',
        severity: 'warning',
        tab: 'workflow',
      })
    }
  }

  return issues
}

export function canExport(project: Project): boolean {
  return validateProject(project).filter((i) => i.severity === 'error').length === 0
}

export function countVisibleRequiredChecklist(project: Project) {
  return computeProjectProgress(
    project.jenisKegiatan,
    project.klasifikasi,
    project.checklistState,
  )
}
