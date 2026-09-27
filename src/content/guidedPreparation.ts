/**
 * Unified lookup for guided preparation templates (Phase 1–8).
 */
import { getNeedPreparation } from '@/content/guidedNeedPreparation'
import { getDesignPreparation } from '@/content/guidedDesignPreparation'
import { getBuildPreparation } from '@/content/guidedBuildPreparation'
import { getCollectPreparation } from '@/content/guidedCollectPreparation'
import { getProcessPreparation } from '@/content/guidedProcessPreparation'
import { getAnalysePreparation } from '@/content/guidedAnalysePreparation'
import { getDisseminatePreparation } from '@/content/guidedDisseminatePreparation'
import { getEvaluatePreparation } from '@/content/guidedEvaluatePreparation'
import type { GuidedPreparationDef } from '@/content/guidedNeedPreparation'

export function getPreparation(cardId: string): GuidedPreparationDef | undefined {
  return (
    getNeedPreparation(cardId) ??
    getDesignPreparation(cardId) ??
    getBuildPreparation(cardId) ??
    getCollectPreparation(cardId) ??
    getProcessPreparation(cardId) ??
    getAnalysePreparation(cardId) ??
    getDisseminatePreparation(cardId) ??
    getEvaluatePreparation(cardId)
  )
}

export type { GuidedPreparationDef }
