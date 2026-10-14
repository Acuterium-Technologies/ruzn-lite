/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA661
 * Protocol: EREBUS-CSE-3A12d-012
 * Name: Legal Intelligence Fusion & Contradiction Penalty Score (LIFP)
 * 
 * Formula:
 * LIFP = [ Σ_m (w_m · S_match,m · φ_m) ] · [ 1 / (1 + λ · D_contradiction) ]
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface MultiSourceLegalInput {
  statuteScore: number;
  caseLawScore: number;
  regulationsScore: number;
  jurisprudenceScore: number;
  contradictionDegree: number; // D_contradiction: 0 (no contradiction) to 1.0 (irreconcilable conflict)
}

export interface FusionScoreResult {
  protocolId: 'EREBUS-CSE-3A12d-012';
  formula: 'EREBUSFORMULA661';
  fusedScore: number; // 0 - 100
  contradictionPenalty: number;
  coherenceStatus: 'HARMONIZED' | 'SUBSTANTIAL_ALIGNMENT' | 'CONTRADICTION_FLAGGED' | 'CRITICAL_CONFLICT';
  justification: string;
}

export function calculateEREBUSFORMULA661(input: MultiSourceLegalInput): FusionScoreResult {
  const consciousness = new ConsciousnessWeight();
  const phi = consciousness.calculatePhi({
    dataQuality: 0.96,
    sourceReliability: 0.95,
    temporalRelevance: 0.94,
    contextAlignment: 0.95,
    modelConfidence: 0.95,
  });

  const weights = {
    statute: 0.40,
    caseLaw: 0.25,
    regulations: 0.20,
    jurisprudence: 0.15,
  };

  const rawWeightedScore = (
    (weights.statute * input.statuteScore) +
    (weights.caseLaw * input.caseLawScore) +
    (weights.regulations * input.regulationsScore) +
    (weights.jurisprudence * input.jurisprudenceScore)
  ) * phi;

  const lambda = 1.5; // Contradiction penalty parameter
  const contradictionPenaltyMultiplier = 1 / (1 + (lambda * Math.max(0, input.contradictionDegree)));
  const fusedScore = parseFloat((rawWeightedScore * contradictionPenaltyMultiplier).toFixed(2));
  const contradictionPenalty = parseFloat(((1 - contradictionPenaltyMultiplier) * 100).toFixed(2));

  let coherenceStatus: FusionScoreResult['coherenceStatus'] = 'HARMONIZED';
  if (input.contradictionDegree > 0.6) coherenceStatus = 'CRITICAL_CONFLICT';
  else if (input.contradictionDegree > 0.3) coherenceStatus = 'CONTRADICTION_FLAGGED';
  else if (input.contradictionDegree > 0.1) coherenceStatus = 'SUBSTANTIAL_ALIGNMENT';

  return {
    protocolId: 'EREBUS-CSE-3A12d-012',
    formula: 'EREBUSFORMULA661',
    fusedScore,
    contradictionPenalty,
    coherenceStatus,
    justification: `دمج المعرفة القانونية المتعددة وتطبيق خوارزمية عقوبة التعارض التشريعي (D_contradiction=${input.contradictionDegree}).`
  };
}
