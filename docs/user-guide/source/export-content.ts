import { writeFileSync } from 'fs'
import { GUIDED_PHASES } from '../../../src/content/guidedCards'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../../../src/content/faq'
import { getPreparation } from '../../../src/content/guidedPreparation'
import { getDemoProjects } from '../../../src/demo'
import { LANDING_OUTPUTS, HOW_IT_WORKS_STEPS, LANDING_EXAMPLES } from '../../../src/content/landingExamples'
const phases = GUIDED_PHASES.map((p, i) => ({
  n: i + 1,
  title: p.intro.title,
  official: p.intro.officialTitle,
  question: p.intro.question,
  explanation: p.intro.explanation,
  pdfRange: p.intro.pdfRange,
  outputs: p.intro.outputs,
  outputsPage: p.intro.outputsPage,
  cards: p.cards.map((c) => {
    const prep = getPreparation(c.id)
    return { code: c.id.replace('gsbpm-', ''), official: c.officialTitle, title: c.title, page: c.pdfPage, apa: c.apa, prep: prep?.title, evidence: prep?.evidence.map((e) => e.label) ?? [] }
  }),
}))
const skm = getDemoProjects().find((p) => p.id === 'demo-skm-dpmptsp-2026')!
writeFileSync(process.argv[2], JSON.stringify({ phases, faqCats: FAQ_CATEGORIES, faq: FAQ_ITEMS, outputs: LANDING_OUTPUTS, steps: HOW_IT_WORKS_STEPS, examples: LANDING_EXAMPLES, skm: { name: skm.name, description: skm.description, klasifikasi: skm.klasifikasi, jenis: skm.jenisKegiatan, objectives: skm.objectives, design: skm.design, portal: skm.portalSdi.notes, rekom: skm.rekomendasiBps, variables: skm.variables.map((v) => v.name), indicators: skm.indicators.map((x) => x.name), questions: skm.questionnaire.length, timeline: skm.timeline.map((t) => `${t.title} (W${t.startWeek}–${t.endWeek})`) } }, null, 1))
console.log('ok', phases.reduce((a, p) => a + p.cards.length, 0), 'cards', FAQ_ITEMS.length, 'faq')
