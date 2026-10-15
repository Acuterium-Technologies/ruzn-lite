/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA653
 * Protocol: EREBUS-CSE-3A12d-004
 * Name: Legislative Impact & Priority Score (LITP) - Resolution Impact Assessment & Legislative Engineering
 * 
 * Used for legislative engineering, cross-checking laws/regulations for conflicts/contradictions,
 * and evaluating downstream impact of new royal decrees, ministerial resolutions, and judicial circulars.
 * 
 * Formula:
 * LITP = [ (w_s · S_scope + w_c · C_conflict + w_b · B_burden + w_k · K_complexity) · φ ] · V_vision2040
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface LegislativeResolutionInput {
  title: string;
  type: 'royal_decree' | 'ministerial_decision' | 'judicial_circular' | 'executive_regulation';
  number?: string;
  year?: number;
  text: string;
  targetSectors?: string[];
  affectedExistingLaws?: string[];
}

export interface DownstreamConflict {
  lawId: string;
  lawName: string;
  article: string;
  conflictType: 'direct_contradiction' | 'ambiguity' | 'repeal_implied' | 'procedural_gap';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface LegislativeImpactResult {
  protocolId: 'EREBUS-CSE-3A12d-004';
  formula: 'EREBUSFORMULA653';
  LITP_score: number; // 0 - 100
  priorityTier: 'IMMEDIATE_ACTION' | 'HIGH_PRIORITY' | 'STANDARD_REVIEW' | 'ROUTINE';
  metrics: {
    scopeScore: number;
    conflictPotential: number;
    stakeholderBurden: number;
    implementationComplexity: number;
    vision2040Multiplier: number;
    consciousnessPhi: number;
  };
  detectedConflicts: DownstreamConflict[];
  recommendations: string[];
  justification: string;
}

const EXISTING_STATUTE_REGISTRY = [
  { id: 'RD 111/2011', name: 'قانون الرقابة المالية والإدارية للدولة', keywords: ['111/2011', 'رقابة', 'الرقابة', 'audit', 'financial oversight'] },
  { id: 'RD 112/2011', name: 'قانون حماية المال العام وتجنب تضارب المصالح', keywords: ['112/2011', 'مال عام', 'المال العام', 'تضارب مصالح', 'تضارب المصالح', 'حماية المال العام', 'public funds', 'conflict of interest'] },
  { id: 'RD 35/2025', name: 'قانون إنشاء محكمة الاستثمار والتجارة', keywords: ['35/2025', 'استثمار', 'الاستثمار', 'تجارة', 'محكمة الاستثمار', 'investment court', 'commercial litigation'] },
  { id: 'RD 53/2023', name: 'قانون العمل العماني', keywords: ['53/2023', 'عمل', 'العمل', 'عمال', 'إضراب', 'labor', 'wages', 'employment'] },
  { id: 'RD 18/2019', name: 'قانون الشركات التجارية', keywords: ['18/2019', 'شركات', 'الشركات', 'commercial companies', 'llc', 'joint stock'] },
  { id: 'RD 2/2025', name: 'القانون المصرفي العماني المحدث', keywords: ['2/2025', 'مصارف', 'المصارف', 'بنوك', 'البنوك', 'banking', 'cbo', 'مركزي'] },
  { id: 'RD 7/2018', name: 'قانون الجزاء العماني', keywords: ['7/2018', 'جزاء', 'الجزاء', 'عقوبة', 'العقوبات', 'penal', 'criminal'] },
  { id: 'RD 30/2016', name: 'قانون مكافحة غسل الأموال وتمويل الإرهاب', keywords: ['30/2016', 'غسل أموال', 'غسل الأموال', 'aml', 'cft'] },
  { id: 'RD 36/2008', name: 'قانون المناقصات ولائحته التنفيذية', keywords: ['36/2008', 'مناقصات', 'المناقصات', 'tenders', 'procurement'] },
];

export function calculateEREBUSFORMULA653(input: LegislativeResolutionInput): LegislativeImpactResult {
  const consciousness = new ConsciousnessWeight();
  const safeText = input.text || '';
  const phi = consciousness.calculatePhi({
    dataQuality: safeText.length > 500 ? 0.95 : 0.75,
    sourceReliability: 0.95,
    temporalRelevance: 0.95,
    contextAlignment: 0.90,
    modelConfidence: 0.95,
  });

  const textLower = safeText.toLowerCase();
  const detectedConflicts: DownstreamConflict[] = [];

  // Cross-check for statute interactions and potential conflicts
  for (const statute of EXISTING_STATUTE_REGISTRY) {
    const hits = statute.keywords.filter(k => textLower.includes(k) || safeText.includes(k));
    if (hits.length > 0) {
      const hasConflictKeywords = /خلافاً|مع عدم الإخلال|يلغى كل ما يخالف|استثناء|contradict|repeal|supersede/.test(input.text);
      if (hasConflictKeywords) {
        detectedConflicts.push({
          lawId: statute.id,
          lawName: statute.name,
          article: 'الأحكام العامة والمواد التنسيقية',
          conflictType: 'repeal_implied',
          severity: 'HIGH',
          explanation: `احتمالية تعارض تشريعي أو إلغاء ضمني مع أحكام ${statute.name} (${statute.id}) يتطلب تكييفاً صريحاً في نصوص الإصدار.`
        });
      }
    }
  }

  // Calculate Sub-Scores
  const scopeScore = Math.min(100, Math.max(20, (input.text.length / 50) + (input.targetSectors?.length || 1) * 15));
  const conflictPotential = Math.min(100, detectedConflicts.length * 25 + 10);
  const stakeholderBurden = textLower.includes('غرامة') || textLower.includes('رسوم') || textLower.includes('التزام') ? 75 : 40;
  const implementationComplexity = input.type === 'royal_decree' ? 85 : 55;
  const vision2040Multiplier = 1.15; // High priority strategic alignment

  // Formula aggregation
  const weightedSum = (0.25 * scopeScore) + (0.35 * conflictPotential) + (0.20 * stakeholderBurden) + (0.20 * implementationComplexity);
  const rawScore = weightedSum * phi * (vision2040Multiplier / 1.15);
  const LITP_score = parseFloat(Math.min(100, Math.max(0, rawScore)).toFixed(2));

  let priorityTier: LegislativeImpactResult['priorityTier'] = 'ROUTINE';
  if (LITP_score >= 80) priorityTier = 'IMMEDIATE_ACTION';
  else if (LITP_score >= 60) priorityTier = 'HIGH_PRIORITY';
  else if (LITP_score >= 40) priorityTier = 'STANDARD_REVIEW';

  const recommendations: string[] = [
    'إجراء تدقيق تشريعي متقاطع مع المواد ذات الصلة لتفادي التنازع القضائي',
    'إصدار مذكرة تفسيرية توضح التوافق مع رؤية عُمان 2040 ومحاور الاقتصاد والتنمية',
    'إدراج نصوص توفيقية صريحة في مادة النشر وسريان المفعول'
  ];

  if (detectedConflicts.length > 0) {
    recommendations.unshift(`معالجة ${detectedConflicts.length} تعارضات تشريعية محتملة مع القوانين النافذة`);
  }

  return {
    protocolId: 'EREBUS-CSE-3A12d-004',
    formula: 'EREBUSFORMULA653',
    LITP_score,
    priorityTier,
    metrics: {
      scopeScore: parseFloat(scopeScore.toFixed(2)),
      conflictPotential: parseFloat(conflictPotential.toFixed(2)),
      stakeholderBurden: parseFloat(stakeholderBurden.toFixed(2)),
      implementationComplexity: parseFloat(implementationComplexity.toFixed(2)),
      vision2040Multiplier,
      consciousnessPhi: parseFloat(phi.toFixed(3)),
    },
    detectedConflicts,
    recommendations,
    justification: `تم احتساب مؤشر الأثر التشريعي والأولويات (LITP) وفق المعايير السيادية EREBUS-CSE-3A12d-004 لمسودة القرار/المرسوم "${input.title}".`
  };
}
