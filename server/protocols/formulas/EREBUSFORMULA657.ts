/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA657
 * Protocol: EREBUS-CSE-3A12d-008
 * Name: Regulatory Change Priority Score (RCMP-2)
 * 
 * Formula:
 * RCMP_2 = Σ_c[w_c · U_urgency,c · S_scope,c · P_penalty,c · φ_c] / (1 + T_grace)
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface RegulatoryChangeInput {
  decreeOrDecisionTitle: string;
  enactmentDate: string;
  effectiveDate: string;
  gracePeriodDays: number;
  maxPenaltyOMR?: number;
  affectedDepartments: string[];
  mandatoryActionsCount: number;
}

export interface RegulatoryChangeResult {
  protocolId: 'EREBUS-CSE-3A12d-008';
  formula: 'EREBUSFORMULA657';
  RCMP_score: number;
  urgencyTier: 'IMMEDIATE_ENFORCEMENT' | 'HIGH_PREPARATION' | 'TRANSITIONAL' | 'MONITORED';
  daysRemaining: number;
  actionChecklist: string[];
  justification: string;
}

export function calculateEREBUSFORMULA657(input: RegulatoryChangeInput): RegulatoryChangeResult {
  const consciousness = new ConsciousnessWeight();
  const phi = consciousness.calculatePhi({
    dataQuality: 0.95,
    sourceReliability: 0.95,
    temporalRelevance: 0.98,
    contextAlignment: 0.92,
    modelConfidence: 0.95,
  });

  const now = new Date();
  const effective = new Date(input.effectiveDate);
  const diffTime = effective.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const U_urgency = daysRemaining <= 14 ? 1.0 : daysRemaining <= 60 ? 0.75 : daysRemaining <= 180 ? 0.50 : 0.25;
  const S_scope = Math.min(1.0, (input.affectedDepartments.length * 0.2) + (input.mandatoryActionsCount * 0.05));
  const P_penalty = input.maxPenaltyOMR && input.maxPenaltyOMR > 10000 ? 0.95 : 0.60;
  const T_grace = Math.min(2.0, input.gracePeriodDays / 180);

  const rawScore = ((0.4 * U_urgency) + (0.35 * S_scope) + (0.25 * P_penalty)) * phi * (100 / (1 + T_grace * 0.3));
  const RCMP_score = parseFloat(Math.min(100, Math.max(0, rawScore)).toFixed(2));

  let urgencyTier: RegulatoryChangeResult['urgencyTier'] = 'MONITORED';
  if (RCMP_score >= 80 || daysRemaining <= 14) urgencyTier = 'IMMEDIATE_ENFORCEMENT';
  else if (RCMP_score >= 60 || daysRemaining <= 60) urgencyTier = 'HIGH_PREPARATION';
  else if (RCMP_score >= 40) urgencyTier = 'TRANSITIONAL';

  const actionChecklist = [
    `مواءمة السياسات الداخلية للدوائر المعنية (${input.affectedDepartments.join(', ')})`,
    `توفيق الأوضاع خلال المهلة النظامية المتبقية (${daysRemaining} يوماً)`,
    `توثيق الإجراءات التنفيذية تفادياً للغرامات المالية المقررة`
  ];

  return {
    protocolId: 'EREBUS-CSE-3A12d-008',
    formula: 'EREBUSFORMULA657',
    RCMP_score,
    urgencyTier,
    daysRemaining,
    actionChecklist,
    justification: `تقييم أولوية التغيير التشريعي لـ "${input.decreeOrDecisionTitle}" وفق بروتوكول EREBUS-CSE-3A12d-008.`
  };
}
