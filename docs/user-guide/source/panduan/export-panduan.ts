// Exports every app text the Panduan Penggunaan cites, straight from source (no hand-copied content).
// npx vite-node docs/user-guide/source/panduan/export-panduan.ts <out.json>
import { writeFileSync } from 'fs'
import { GUIDED_PHASES } from '../../../../src/content/guidedCards'
import { getPreparation } from '../../../../src/content/guidedPreparation'
import { GSBPM_PHASES } from '../../../../src/domain/gsbpm'
import { VALIDATION_GUIDANCE } from '../../../../src/content/validationGuidance'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../../../../src/content/faq'
import { MS_IND_FIELDS, MS_KEG_FIELDS, MS_VAR_FIELDS } from '../../../../src/domain/metadataSchema'
import { EXAMPLE_JOURNEYS, EXAMPLE_WALKTHROUGH_STEPS } from '../../../../src/content/exampleJourney'
import { HOW_IT_WORKS_STEPS, LANDING_EXAMPLES, LANDING_OUTPUTS } from '../../../../src/content/landingExamples'
import { GUIDED_STEPS, STORY_EXAMPLE } from '../../../../src/content/guidedJourney'
import { DURATION_PRESET_MONTHS, PHASE_PLAN_WEIGHTS } from '../../../../src/content/planningTimeline'
import { getDemoProjects } from '../../../../src/demo'

const phases = GUIDED_PHASES.map((ph, i) => {
  const domain = GSBPM_PHASES[i]!
  return {
    n: i + 1,
    id: ph.intro.phaseId,
    title: ph.intro.title,
    official: ph.intro.officialTitle,
    question: ph.intro.question,
    explanation: ph.intro.explanation,
    gsbpmNote: ph.intro.gsbpmNote,
    pdfRange: ph.intro.pdfRange,
    outputs: ph.intro.outputs,
    outputsPage: ph.intro.outputsPage,
    purpose: domain.purpose,
    cards: ph.cards.map((c) => {
      const prep = getPreparation(c.id)
      const sp = domain.subProcesses.find((s) => s.code === c.code)
      return {
        code: c.code,
        official: c.officialTitle,
        title: c.title,
        page: c.pdfPage,
        apa: c.apa,
        materiPoints: c.materiPoints ?? [],
        contoh: c.contoh,
        contohClass: c.contohClass,
        contohDetail: c.contohDetail ?? [],
        lessonPoints: c.lessonPoints ?? [],
        materiLesson: c.materiLesson ?? prep?.materiLesson ?? '',
        materiExamples: (c.materiExamples ?? prep?.materiExamples ?? []).map((m) => ({ title: m.title, page: m.pdfPage ?? null })),
        buktiIntro: c.buktiIntro ?? '',
        prep: prep
          ? {
              title: prep.title,
              explanation: prep.explanation,
              sourceLabel: prep.sourceLabel,
              disclaimer: prep.disclaimer,
              fields: prep.fields.map((f) => ({
                label: f.label,
                kind: f.kind,
                required: !!f.required,
                hint: f.hint ?? '',
                options: (f.options ?? []).map((o) => o.label),
                columns: (f.columns ?? []).map((col) => col.label),
                conditional: !!f.visibleWhen,
              })),
              evidence: prep.evidence.map((e) => ({ label: e.label, page: e.pdfPage ?? null })),
              educationalNote: prep.educationalNote ?? '',
            }
          : null,
        checklist: (sp?.checklist ?? []).map((it) => ({
          label: it.label,
          required: it.required,
          jenis: it.jenis ?? null,
          klasifikasi: it.klasifikasi ?? null,
        })),
        skipWhen: sp?.skipWhen ?? null,
      }
    }),
  }
})

const skm = getDemoProjects().find((p) => p.id === 'demo-skm-dpmptsp-2026')!
const out = {
  phases,
  validation: VALIDATION_GUIDANCE,
  faqCats: FAQ_CATEGORIES,
  faq: FAQ_ITEMS,
  metadata: { keg: MS_KEG_FIELDS, var: MS_VAR_FIELDS, ind: MS_IND_FIELDS },
  examples: EXAMPLE_JOURNEYS.map((e) => ({
    slug: e.slug,
    title: e.title,
    jenis: e.jenis,
    whatToKnow: e.whatToKnow,
    plannedResult: e.plannedResult,
    howDataObtained: e.howDataObtained,
    whyConducted: e.whyConducted,
    takeaways: e.takeaways,
  })),
  walkthroughSteps: EXAMPLE_WALKTHROUGH_STEPS,
  landing: { outputs: LANDING_OUTPUTS, steps: HOW_IT_WORKS_STEPS, examples: LANDING_EXAMPLES },
  intake: { steps: GUIDED_STEPS, storyExample: STORY_EXAMPLE, presets: DURATION_PRESET_MONTHS, weights: PHASE_PLAN_WEIGHTS },
  skm: {
    name: skm.name,
    description: skm.description,
    objectives: skm.objectives,
    design: skm.design,
    variables: skm.variables.slice(0, 4).map((v) => ({ name: v.name, definition: v.definition, type: v.type, scale: v.scale, unit: v.unit, example: v.exampleValue, missing: v.missingValueRule })),
    indicators: skm.indicators.map((i) => ({ name: i.name, formula: i.formula, related: i.relatedVariables })),
    questions: skm.questionnaire.slice(0, 6).map((q) => ({ number: q.number, text: q.text, type: q.type, options: q.options ?? [] })),
  },
}
writeFileSync(process.argv[2]!, JSON.stringify(out, null, 1))
console.log('phases', phases.length, 'cards', phases.reduce((a, p) => a + p.cards.length, 0), 'with prep', phases.reduce((a, p) => a + p.cards.filter((c) => c.prep).length, 0), 'faq', FAQ_ITEMS.length)
