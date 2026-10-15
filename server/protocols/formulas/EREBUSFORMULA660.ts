/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA660
 * Protocol: EREBUS-CSE-3A12d-011
 * Name: Third-Party & Counterparty Risk Composite Score (TCRP)
 * 
 * Multi-dimensional vendor due diligence, cybersecurity posture evaluation,
 * financial solvency checks, and portfolio concentration risk optimization.
 * 
 * Mathematical Foundation:
 * TPR_total = Σ_d[w_d · R_d · E_exposure,d · φ_d] · (1 + λ·CC_concentration)
 * 
 * Grounded in:
 * - Royal Decree 36/2008 (Tender Law & Government Procurement Regulations)
 * - Royal Decree 112/2011 (Protection of Public Funds & Avoidance of Conflict of Interest)
 * - Central Bank of Oman (CBO) Outsourcing & Vendor Risk Directives
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface VendorRiskDimension {
  dimension: 'financial' | 'cybersecurity' | 'compliance' | 'operational' | 'reputational';
  name: string;
  weight: number; // Σw_d = 1
  riskScore: number; // 0 - 1
  exposureMagnitude: number; // 0 - 1 (spend, criticality)
  phi?: number;
}

export interface ThirdPartyRiskInput {
  vendorName: string;
  vendorCountry: string;
  commercialRegistrationNo?: string;
  contractSpendOMR: number;
  totalProcurementBudgetOMR?: number;
  isSingleSourceSupplier: boolean;
  hasSubcontractors: boolean;
  dimensions?: VendorRiskDimension[];
  concentrationIndex?: number; // 0 - 1
  lambdaMultiplier?: number;
}

export interface ThirdPartyRiskResult {
  protocolId: 'EREBUS-CSE-3A12d-011';
  formula: 'EREBUSFORMULA660';
  TPR_total: number; // 0 - 100
  riskRating: 'CRITICAL_RISK' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' | 'TIER_1_PREFERRED';
  concentrationRiskFactor: number;
  onboardingDecision: 'APPROVED' | 'CONDITIONAL_APPROVAL' | 'ENHANCED_DUE_DILIGENCE_REQUIRED' | 'REJECTED';
  consciousnessPhi: number;
  dimensionScores: Array<{
    dimension: string;
    name: string;
    score: number;
    weight: number;
  }>;
  procurementDirectives: string[];
  justification: string;
}

export function calculateEREBUSFORMULA660(input: ThirdPartyRiskInput): ThirdPartyRiskResult {
  const consciousness = new ConsciousnessWeight();
  const phi = consciousness.calculatePhi({
    dataQuality: 0.95,
    sourceReliability: 0.96,
    temporalRelevance: 0.95,
    contextAlignment: 0.94,
    modelConfidence: 0.95,
  });

  const totalBudget = input.totalProcurementBudgetOMR || 1000000;
  const spendRatio = Math.min(1.0, input.contractSpendOMR / totalBudget);
  const singleSourceRisk = input.isSingleSourceSupplier ? 0.35 : 0.05;
  const calculatedConcentration = Math.min(1.0, (spendRatio * 0.7) + singleSourceRisk);
  const CC_concentration = input.concentrationIndex !== undefined ? input.concentrationIndex : calculatedConcentration;

  const defaultDimensions: VendorRiskDimension[] = input.dimensions && input.dimensions.length > 0 ? input.dimensions : [
    {
      dimension: 'financial',
      name: 'الملاءة المالية والقدرة الائتمانية',
      weight: 0.25,
      riskScore: 0.25,
      exposureMagnitude: spendRatio,
    },
    {
      dimension: 'cybersecurity',
      name: 'الأمن السيبراني وسرية البيانات',
      weight: 0.25,
      riskScore: 0.30,
      exposureMagnitude: 0.80,
    },
    {
      dimension: 'compliance',
      name: 'الامتثال القانوني ومكافحة غسل الأموال وتضارب المصالح',
      weight: 0.25,
      riskScore: 0.20,
      exposureMagnitude: 0.90,
    },
    {
      dimension: 'operational',
      name: 'الكفاءة التشغيلية والالتزام بمستويات الخدمة (SLA)',
      weight: 0.15,
      riskScore: 0.28,
      exposureMagnitude: 0.70,
    },
    {
      dimension: 'reputational',
      name: 'السمعة المؤسسية والنزاهة التجارية',
      weight: 0.10,
      riskScore: 0.15,
      exposureMagnitude: 0.60,
    }
  ];

  let weightedSum = 0;
  let totalWeights = 0;
  const dimensionScores: ThirdPartyRiskResult['dimensionScores'] = [];

  for (const d of defaultDimensions) {
    const dimPhi = d.phi || phi;
    const dimVal = d.riskScore * d.exposureMagnitude * dimPhi * 100;
    weightedSum += (d.weight * dimVal);
    totalWeights += d.weight;

    dimensionScores.push({
      dimension: d.dimension,
      name: d.name,
      score: parseFloat(dimVal.toFixed(2)),
      weight: d.weight,
    });
  }

  const baseRisk = totalWeights > 0 ? (weightedSum / totalWeights) : 25;
  const lambda = input.lambdaMultiplier !== undefined ? input.lambdaMultiplier : 0.40;
  const concentrationMultiplier = 1 + (lambda * CC_concentration);

  const TPR_total = parseFloat(Math.min(100, Math.max(0, baseRisk * concentrationMultiplier)).toFixed(2));

  let riskRating: ThirdPartyRiskResult['riskRating'] = 'LOW_RISK';
  if (TPR_total >= 75) riskRating = 'CRITICAL_RISK';
  else if (TPR_total >= 55) riskRating = 'HIGH_RISK';
  else if (TPR_total >= 35) riskRating = 'MEDIUM_RISK';
  else if (TPR_total < 20) riskRating = 'TIER_1_PREFERRED';

  let onboardingDecision: ThirdPartyRiskResult['onboardingDecision'] = 'APPROVED';
  if (riskRating === 'CRITICAL_RISK') onboardingDecision = 'REJECTED';
  else if (riskRating === 'HIGH_RISK') onboardingDecision = 'ENHANCED_DUE_DILIGENCE_REQUIRED';
  else if (riskRating === 'MEDIUM_RISK' || input.isSingleSourceSupplier) onboardingDecision = 'CONDITIONAL_APPROVAL';

  const procurementDirectives: string[] = [];
  if (input.isSingleSourceSupplier) {
    procurementDirectives.push('تجنب الاعتماد على المورد الأوحد واستدراج عروض بديلة وفق [المادة 18، مرسوم سلطاني رقم 36/2008]');
  }
  if (CC_concentration > 0.4) {
    procurementDirectives.push('توزيع حصص التوريد للحد من مخاطر تركز المشتريات الحكومية');
  }
  if (TPR_total >= 40) {
    procurementDirectives.push('اشتراط تقديم ضمان مصرفي نهائي ساري المفعول بنسبة لا تقل عن 10% من قيمة التعاقد');
  } else {
    procurementDirectives.push('إدراج المورد ضمن القائمة البيضاء المعتمدة للمشتريات الاستراتيجية');
  }

  return {
    protocolId: 'EREBUS-CSE-3A12d-011',
    formula: 'EREBUSFORMULA660',
    TPR_total,
    riskRating,
    concentrationRiskFactor: parseFloat(CC_concentration.toFixed(3)),
    onboardingDecision,
    consciousnessPhi: parseFloat(phi.toFixed(3)),
    dimensionScores,
    procurementDirectives,
    justification: `تم تقييم مخاطر الطرف الثالث والمورد "${input.vendorName}" بمعدل مخاطر مركب ${TPR_total}/100 وتصنيف (${riskRating}) وفق بروتوكول EREBUS-CSE-3A12d-011.`
  };
}
