/**
 * All Guided Mode phases and their official GSBPM 5.2 subprocess cards (44 total).
 * Single lookup used by the phase page, preparation panel, and QA scripts.
 */
import type { GuidedLearningCard, GuidedPhaseIntro } from '@/content/guidedPhaseNeed'
import { GUIDED_NEED_CARDS, GUIDED_NEED_INTRO } from '@/content/guidedPhaseNeed'
import { DESIGN_INTRO, GUIDED_DESIGN_CARDS } from '@/content/guidedPhaseDesign'
import { BUILD_INTRO, GUIDED_BUILD_CARDS } from '@/content/guidedPhaseBuild'
import { COLLECT_INTRO, GUIDED_COLLECT_CARDS } from '@/content/guidedPhaseCollect'
import { GUIDED_PROCESS_CARDS, PROCESS_INTRO } from '@/content/guidedPhaseProcess'
import { ANALYSE_INTRO, GUIDED_ANALYSE_CARDS } from '@/content/guidedPhaseAnalyse'
import { DISSEMINATE_INTRO, GUIDED_DISSEMINATE_CARDS } from '@/content/guidedPhaseDisseminate'
import { EVALUATE_INTRO, GUIDED_EVALUATE_CARDS } from '@/content/guidedPhaseEvaluate'

export type GuidedPhaseContent = {
  intro: GuidedPhaseIntro
  cards: GuidedLearningCard[]
}

export const GUIDED_PHASES: GuidedPhaseContent[] = [
  { intro: GUIDED_NEED_INTRO, cards: GUIDED_NEED_CARDS },
  { intro: DESIGN_INTRO, cards: GUIDED_DESIGN_CARDS },
  { intro: BUILD_INTRO, cards: GUIDED_BUILD_CARDS },
  { intro: COLLECT_INTRO, cards: GUIDED_COLLECT_CARDS },
  { intro: PROCESS_INTRO, cards: GUIDED_PROCESS_CARDS },
  { intro: ANALYSE_INTRO, cards: GUIDED_ANALYSE_CARDS },
  { intro: DISSEMINATE_INTRO, cards: GUIDED_DISSEMINATE_CARDS },
  { intro: EVALUATE_INTRO, cards: GUIDED_EVALUATE_CARDS },
]

export const ALL_GUIDED_CARDS: GuidedLearningCard[] = GUIDED_PHASES.flatMap((p) => p.cards)

export function getGuidedCard(id: string): GuidedLearningCard | undefined {
  return ALL_GUIDED_CARDS.find((c) => c.id === id)
}

/** Next card in the same phase, or undefined at the end of the phase. */
export function nextCardInPhase(id: string): GuidedLearningCard | undefined {
  for (const phase of GUIDED_PHASES) {
    const idx = phase.cards.findIndex((c) => c.id === id)
    if (idx >= 0) return phase.cards[idx + 1]
  }
  return undefined
}
