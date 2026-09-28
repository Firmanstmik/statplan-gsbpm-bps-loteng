import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  generateObjectives,
  generateStarterVariables,
  recommendJenisKegiatan,
} from '@/domain/aiPlanner'
import { defaultMetadataValues, MS_IND_FIELDS, MS_VAR_FIELDS } from '@/domain/metadataSchema'
import {
  exportDemoJson,
  getDemoProjects,
  importDemoJson,
  isDemoProject,
  markDemoCleared,
  markDemoSeeded,
  mergeDemoProjects,
  mergeImportedProjects,
  removeDemoProjects,
  shouldAutoSeed,
  shouldRefreshDemoSeed,
} from '@/demo/seed'
import type {
  DesignSettings,
  GsbpmPhaseId,
  IndicatorDef,
  JenisKegiatan,
  Klasifikasi,
  PortalSdiCheck,
  Project,
  QuestionnaireItem,
  RekomendasiBps,
  TimelineItem,
  VariableDef,
} from '@/domain/types'

function uid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

function defaultTimeline(jenis: JenisKegiatan): TimelineItem[] {
  const phases: { id: GsbpmPhaseId; title: string; start: number; end: number }[] = [
    { id: 'specify_need', title: 'Identifikasi kebutuhan', start: 1, end: 3 },
    { id: 'design', title: 'Perancangan', start: 3, end: 5 },
    { id: 'build', title: 'Pembangunan instrumen', start: 5, end: 7 },
    { id: 'collect', title: 'Pengumpulan data', start: 7, end: 10 },
    { id: 'process', title: 'Pengolahan', start: 10, end: 12 },
    { id: 'analyse', title: 'Analisis', start: 12, end: 14 },
    { id: 'disseminate', title: 'Diseminasi', start: 14, end: 15 },
    { id: 'evaluate', title: 'Evaluasi', start: 15, end: 16 },
  ]
  if (jenis === 'kompromin') {
    phases[2].end = 6
    phases[3].start = 6
    phases[3].end = 8
  }
  return phases.map((p) => ({
    id: uid(),
    title: p.title,
    phaseId: p.id,
    startWeek: p.start,
    endWeek: p.end,
  }))
}

function defaultDesign(jenis: JenisKegiatan): DesignSettings {
  return {
    caraPengumpulan: jenis,
    metodePengumpulan: jenis === 'kompromin' ? '' : 'wawancara',
    modaPengumpulan: jenis === 'kompromin' ? '' : 'capi',
    metodeSampling: '',
    ukuranSampel: '',
  }
}

function defaultPortalSdi(): PortalSdiCheck {
  return {
    checked: false,
    sirusaChecked: false,
    romantikChecked: false,
    notes: '',
  }
}

function defaultRekomendasi(name: string): RekomendasiBps {
  return {
    namaKegiatan: name,
    penyelenggara: '',
    tujuan: '',
    periode: '',
    catatan: '',
  }
}

function migrateMetadata(raw: Partial<Project>): Project['metadata'] {
  const jenis = raw.jenisKegiatan ?? 'survei'
  const name = raw.name ?? 'Proyek'
  const oldKeg = raw.metadata?.kegiatan ?? {}

  if (oldKeg.nama_kegiatan) {
    return {
      kegiatan: oldKeg,
      variabel: raw.metadata?.variabel?.nama_variabel
        ? raw.metadata.variabel
        : Object.fromEntries(MS_VAR_FIELDS.map((f) => [f.key, ''])),
      indikator: raw.metadata?.indikator?.nama_indikator
        ? raw.metadata.indikator
        : Object.fromEntries(MS_IND_FIELDS.map((f) => [f.key, ''])),
    }
  }

  const base = defaultMetadataValues(name, jenis)
  return {
    kegiatan: {
      ...base.kegiatan,
      nama_kegiatan: (oldKeg as Record<string, string>).nama ?? name,
      penyelenggara: (oldKeg as Record<string, string>).penyelenggara ?? '',
      tahun_kegiatan: (oldKeg as Record<string, string>).tahun ?? base.kegiatan.tahun_kegiatan,
      cakupan_wilayah: (oldKeg as Record<string, string>).cakupan ?? '',
      cara_pengumpulan: (oldKeg as Record<string, string>).metode ?? jenis,
    },
    variabel: base.variabel,
    indikator: base.indikator,
  }
}

function migrateProject(raw: Partial<Project> & { id: string }): Project {
  const jenis = raw.jenisKegiatan ?? 'survei'
  const name = raw.name ?? 'Proyek tanpa nama'
  const metadata = migrateMetadata({ ...raw, name, jenisKegiatan: jenis })

  return {
    id: raw.id,
    name,
    description: raw.description ?? '',
    topik: raw.topik ?? '',
    estimasiAnggaran: raw.estimasiAnggaran,
    klasifikasi: raw.klasifikasi ?? 'sektoral',
    jenisKegiatan: jenis,
    aiRecommendation: raw.aiRecommendation,
    objectives: raw.objectives ?? [],
    variables: raw.variables ?? [],
    indicators: raw.indicators ?? [],
    timeline: raw.timeline ?? defaultTimeline(jenis),
    questionnaire: raw.questionnaire ?? [],
    design: raw.design ?? defaultDesign(jenis),
    portalSdi: raw.portalSdi ?? defaultPortalSdi(),
    rekomendasiBps: raw.rekomendasiBps ?? defaultRekomendasi(name),
    metadata,
    checklistState: raw.checklistState ?? {},
    currentPhaseId: raw.currentPhaseId ?? 'specify_need',
    status: raw.status ?? 'draft',
    createdAt: raw.createdAt ?? now(),
    updatedAt: raw.updatedAt ?? now(),
  }
}

interface AppState {
  projects: Project[]
  createProject: (input: {
    name: string
    description: string
    topik: string
    klasifikasi: Klasifikasi
    estimasiAnggaran?: string
    dataAvailable?: boolean
    needCoverage?: 'sample' | 'full' | 'admin'
  }) => Project
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  toggleChecklist: (projectId: string, itemId: string) => void
  setPhase: (projectId: string, phaseId: GsbpmPhaseId) => void
  setJenis: (projectId: string, jenis: JenisKegiatan) => void
  upsertVariable: (projectId: string, variable: VariableDef) => void
  removeVariable: (projectId: string, variableId: string) => void
  setVariables: (projectId: string, variables: VariableDef[]) => void
  setIndicators: (projectId: string, indicators: IndicatorDef[]) => void
  setQuestionnaire: (projectId: string, items: QuestionnaireItem[]) => void
  setDesign: (projectId: string, design: DesignSettings) => void
  setPortalSdi: (projectId: string, portal: PortalSdiCheck) => void
  setRekomendasiBps: (projectId: string, rekomendasi: RekomendasiBps) => void
  setTimeline: (projectId: string, timeline: TimelineItem[]) => void
  updateMetadata: (
    projectId: string,
    section: 'kegiatan' | 'variabel' | 'indikator',
    key: string,
    value: string,
  ) => void
  getProject: (id: string) => Project | undefined
  loadDemoData: () => void
  resetDemo: () => void
  exportDemoBundle: () => string
  importDemoBundle: (raw: string) => void
  /** Import a project received via share link (new id). */
  importSharedProject: (shared: Project) => Project
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],

      getProject: (id) => get().projects.find((p) => p.id === id),

      createProject: (input) => {
        const recommendation = recommendJenisKegiatan({
          description: `${input.name} ${input.description} ${input.topik}`,
          dataAvailable: input.dataAvailable,
          needCoverage: input.needCoverage,
        })
        const jenis = recommendation.jenis
        const starters = generateStarterVariables(input.topik)
        const project: Project = {
          id: uid(),
          name: input.name.trim(),
          description: input.description.trim(),
          topik: input.topik.trim(),
          estimasiAnggaran: input.estimasiAnggaran?.trim() || undefined,
          klasifikasi: input.klasifikasi,
          jenisKegiatan: jenis,
          aiRecommendation: recommendation,
          objectives: generateObjectives(input.topik, jenis),
          variables: starters.map((v) => ({ id: uid(), ...v })),
          indicators: [
            {
              id: uid(),
              name: `Indikator utama ${input.topik}`,
              formula: 'Diturunkan dari variabel terkait sesuai kondef',
              relatedVariables: starters.slice(0, 2).map((v) => v.name),
            },
          ],
          timeline: defaultTimeline(jenis),
          questionnaire:
            jenis === 'kompromin'
              ? []
              : [
                  {
                    id: uid(),
                    number: '1',
                    text: `Apakah unit terkait dengan ${input.topik}?`,
                    type: 'tertutup',
                    options: ['Ya', 'Tidak'],
                  },
                  {
                    id: uid(),
                    number: '2',
                    text: 'Sebutkan informasi utama yang relevan.',
                    type: 'terbuka',
                  },
                ],
          design: defaultDesign(jenis),
          portalSdi: defaultPortalSdi(),
          rekomendasiBps: {
            ...defaultRekomendasi(input.name.trim()),
            penyelenggara: input.klasifikasi === 'sektoral' ? 'OPD penyelenggara' : '',
          },
          metadata: defaultMetadataValues(input.name.trim(), jenis),
          checklistState: {},
          currentPhaseId: 'specify_need',
          status: 'draft',
          createdAt: now(),
          updatedAt: now(),
        }
        set((s) => ({ projects: [project, ...s.projects] }))
        return project
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: now() } : p,
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      toggleChecklist: (projectId, itemId) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              checklistState: {
                ...p.checklistState,
                [itemId]: !p.checklistState[itemId],
              },
              status: 'in_progress',
              updatedAt: now(),
            }
          }),
        })),

      setPhase: (projectId, phaseId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, currentPhaseId: phaseId, updatedAt: now() }
              : p,
          ),
        })),

      setJenis: (projectId, jenis) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p
            const design: DesignSettings = {
              ...defaultDesign(jenis),
              metodeSampling: p.design.metodeSampling,
              ukuranSampel: p.design.ukuranSampel,
            }
            let questionnaire = p.questionnaire
            if (jenis === 'kompromin') {
              questionnaire = []
            } else if (questionnaire.length === 0) {
              questionnaire = [
                {
                  id: uid(),
                  number: '1',
                  text: `Apakah unit terkait dengan ${p.topik}?`,
                  type: 'tertutup',
                  options: ['Ya', 'Tidak'],
                },
                {
                  id: uid(),
                  number: '2',
                  text: 'Sebutkan informasi utama yang relevan.',
                  type: 'terbuka',
                },
              ]
            }
            return {
              ...p,
              jenisKegiatan: jenis,
              objectives: generateObjectives(p.topik, jenis),
              design,
              questionnaire,
              metadata: {
                ...p.metadata,
                kegiatan: {
                  ...p.metadata.kegiatan,
                  cara_pengumpulan: jenis,
                },
              },
              updatedAt: now(),
            }
          }),
        })),

      upsertVariable: (projectId, variable) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p
            const exists = p.variables.some((v) => v.id === variable.id)
            return {
              ...p,
              variables: exists
                ? p.variables.map((v) => (v.id === variable.id ? variable : v))
                : [...p.variables, variable],
              updatedAt: now(),
            }
          }),
        })),

      removeVariable: (projectId, variableId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  variables: p.variables.filter((v) => v.id !== variableId),
                  updatedAt: now(),
                }
              : p,
          ),
        })),

      setVariables: (projectId, variables) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, variables, updatedAt: now() } : p,
          ),
        })),

      setIndicators: (projectId, indicators) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, indicators, updatedAt: now() } : p,
          ),
        })),

      setQuestionnaire: (projectId, items) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, questionnaire: items, updatedAt: now() } : p,
          ),
        })),

      setDesign: (projectId, design) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, design, updatedAt: now() } : p,
          ),
        })),

      setPortalSdi: (projectId, portal) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, portalSdi: portal, updatedAt: now() } : p,
          ),
        })),

      setRekomendasiBps: (projectId, rekomendasi) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, rekomendasiBps: rekomendasi, updatedAt: now() } : p,
          ),
        })),

      setTimeline: (projectId, timeline) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, timeline, updatedAt: now() } : p,
          ),
        })),

      updateMetadata: (projectId, section, key, value) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              metadata: {
                ...p.metadata,
                [section]: { ...p.metadata[section], [key]: value },
              },
              updatedAt: now(),
            }
          }),
        })),

      loadDemoData: () => {
        set((state) => ({
          projects: mergeDemoProjects(state.projects, getDemoProjects()),
        }))
        markDemoSeeded()
      },

      resetDemo: () => {
        set((state) => ({
          projects: removeDemoProjects(state.projects),
        }))
        markDemoCleared()
      },

      exportDemoBundle: () =>
        exportDemoJson(get().projects.filter(isDemoProject)),

      importDemoBundle: (raw) => {
        const importedProjects = importDemoJson(raw).map((p) =>
          migrateProject(p as Partial<Project> & { id: string }),
        )
        set((state) => ({
          projects: mergeImportedProjects(state.projects, importedProjects),
        }))
        markDemoSeeded()
      },

      importSharedProject: (shared) => {
        const project = migrateProject({
          ...shared,
          id: uid(),
          createdAt: now(),
          updatedAt: now(),
          status: shared.status ?? 'draft',
        })
        set((s) => ({ projects: [project, ...s.projects] }))
        return project
      },
    }),
    {
      name: 'bps-statplan-v2',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { projects?: Partial<Project>[] }
        if (!state.projects) return { projects: [] }
        return {
          projects: state.projects.map((p) => migrateProject(p as Partial<Project> & { id: string })),
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Hydration runs inside create(), so assigning here only updates memory. Re-set through the
        // store afterwards so persist actually writes the seeded/migrated list (otherwise the demo flag
        // is saved but the demos are not, and they vanish on reload).
        const commit = (projects: Project[]) => {
          state.projects = projects
          queueMicrotask(() => useAppStore.setState({ projects }))
        }

        const looksLikeDemo = state.projects.some(isDemoProject)
        if (shouldRefreshDemoSeed() && looksLikeDemo) {
          commit(mergeDemoProjects(state.projects, getDemoProjects()))
          markDemoSeeded()
          return
        }

        if (state.projects.length > 0) return
        try {
          const v1Raw = localStorage.getItem('bps-statplan-v1')
          if (v1Raw) {
            const parsed = JSON.parse(v1Raw) as { state?: { projects?: Partial<Project>[] } }
            const legacy = parsed.state?.projects ?? []
            if (legacy.length > 0) {
              commit(legacy.map((p) => migrateProject(p as Partial<Project> & { id: string })))
              return
            }
          }
        } catch {
          /* ignore corrupt legacy storage */
        }
        if (shouldAutoSeed()) {
          commit(getDemoProjects())
          markDemoSeeded()
        }
      },
    },
  ),
)
