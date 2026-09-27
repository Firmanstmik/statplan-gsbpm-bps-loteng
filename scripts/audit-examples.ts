import { GUIDED_NEED_CARDS } from '../src/content/guidedPhaseNeed'
import { GUIDED_DESIGN_CARDS } from '../src/content/guidedPhaseDesign'
import { GUIDED_BUILD_CARDS } from '../src/content/guidedPhaseBuild'
import { GUIDED_COLLECT_CARDS } from '../src/content/guidedPhaseCollect'
import { GUIDED_PROCESS_CARDS } from '../src/content/guidedPhaseProcess'
import { GUIDED_ANALYSE_CARDS } from '../src/content/guidedPhaseAnalyse'
import { GUIDED_DISSEMINATE_CARDS } from '../src/content/guidedPhaseDisseminate'
import { GUIDED_EVALUATE_CARDS } from '../src/content/guidedPhaseEvaluate'
import type { GuidedLearningCard } from '../src/content/guidedPhaseNeed'

const phases: [string, GuidedLearningCard[]][] = [
  ['1', GUIDED_NEED_CARDS],
  ['2', GUIDED_DESIGN_CARDS],
  ['3', GUIDED_BUILD_CARDS],
  ['4', GUIDED_COLLECT_CARDS],
  ['5', GUIDED_PROCESS_CARDS],
  ['6', GUIDED_ANALYSE_CARDS],
  ['7', GUIDED_DISSEMINATE_CARDS],
  ['8', GUIDED_EVALUATE_CARDS],
]

for (const [p, cards] of phases) {
  for (const c of cards) {
    const full = Boolean(
      (c.contohDetail && c.contohDetail.length) ||
        (c.materiExamples && c.materiExamples.length),
    )
    const lessons = Boolean(c.lessonPoints && c.lessonPoints.length)
    const oneLine = c.contoh.trim().split(/\n/).length === 1 && c.contoh.length < 100 && !full
    console.log(
      `${c.code}\t${c.contohClass}\tpg=${c.pdfPage ?? '-'}\tfull=${full ? 'Y' : 'N'}\tlesson=${lessons ? 'Y' : 'N'}\ttpl=Y\toneline=${oneLine ? 'Y' : 'N'}\t${c.title}`,
    )
  }
  console.log(`--- phase ${p} ---`)
}
