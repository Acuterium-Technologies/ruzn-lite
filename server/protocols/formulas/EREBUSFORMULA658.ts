/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA658
 * Protocol: EREBUS-CSE-3A12d-009
 * Name: Privacy Risk Aggregate Score (DPCP) - Data Protection Impact Assessment (DPIA)
 * 
 * Evaluates personal data protection risks, DPIA obligations, cross-border transfer compliance,
 * and security controls under the Omani Personal Data Protection Law (RD 6/2022) and MTCIT regulations.
 * 
 * Mathematical Foundation:
 * PR_risk = Σ_d[V_volume,d · S_sensitivity,d · E_exposure,d · φ_d] + λ·C_cross-border + μ·T_third-party
 * 
 * Grounded in:
 * - Royal Decree 6/2022 (Personal Data Protection Law - PDPL)
 * - MTCIT Ministerial Decision 34/2024 (Executive Regulations of PDPL)
 * - Oman National Cyber Security Policy & National Data Residency Guidelines
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface DataCategoryExposure {
  categoryId: string;
  name: string;
  volumeNormalized: number; // 0 - 1 (e.g. 0.2 = <1k, 0.5 = 10k, 1.0 = >1M subjects)
  sensitivityLevel: number; // 0 - 1 (biometric/health = 0.95, financial = 0.85, contact = 0.40)
  exposureRisk: number; // 0 - 1 (lack of encryption, public exposure)
  phi?: number;
}

export interface PrivacyRiskInput {
  entityName: string;
  systemOrProjectName: string;
  dataCategories?: DataCategoryExposure[];
  crossBorderTransferOutsideOman: boolean;
  crossBorderHostCountry?: string;
  thirdPartyProcessorsCount?: number;
  hasExplicitUserConsent: boolean;
  hasAppointedDataProtectionOfficer: boolean;
  dataStoredWithinOmanDataPark: boolean;
  description?: string;
}

export interface PrivacyRiskResult {
  protocolId: 'EREBUS-CSE-3A12d-009';
  formula: 'EREBUSFORMULA658';
  PR_risk: number; // 0 - 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  dpiaMandatory: boolean;
  crossBorderTransferCompliant: boolean;
  dataSovereigntyCompliance: boolean;
  consciousnessPhi: number;
  identifiedViolations: string[];
  mitigationDirectives: string[];
  statutoryCitations: string[];
  justification: string;
}

const DEFAULT_DATA_CATEGORIES: DataCategoryExposure[] = [
  {
    categoryId: 'CITIZEN_CIVIL_RECORDS',
    name: 'بيانات الهوية والرقم المدني للمواطنين والمقيمين',
    volumeNormalized: 0.65,
    sensitivityLevel: 0.80,
    exposureRisk: 0.35,
  },
  {
    categoryId: 'FINANCIAL_TRANSACTIONS',
    name: 'البيانات المالية والحسابات المصرفية',
    volumeNormalized: 0.45,
    sensitivityLevel: 0.90,
    exposureRisk: 0.30,
  },
  {
    categoryId: 'COMMUNICATION_LOGS',
    name: 'سجلات التواصل ومعرفات الأجهزة وعناوين IP',
    volumeNormalized: 0.80,
    sensitivityLevel: 0.50,
    exposureRisk: 0.40,
  }
];

export function calculateEREBUSFORMULA658(input: PrivacyRiskInput): PrivacyRiskResult {
  const consciousness = new ConsciousnessWeight();
  const phi = consciousness.calculatePhi({
    dataQuality: 0.95,
    sourceReliability: 0.96,
    temporalRelevance: 0.95,
    contextAlignment: 0.95,
    modelConfidence: 0.95,
  });

  const categories = input.dataCategories && input.dataCategories.length > 0 ? input.dataCategories : DEFAULT_DATA_CATEGORIES;
  
  let baseSum = 0;
  for (const cat of categories) {
    const catPhi = cat.phi || phi;
    const catScore = cat.volumeNormalized * cat.sensitivityLevel * cat.exposureRisk * catPhi * 100;
    baseSum += catScore;
  }
  const normalizedBase = categories.length > 0 ? (baseSum / categories.length) : 25;

  // Cross-border transfer outside Oman penalty (RD 6/2022 Art. 23)
  const lambda = 25.0;
  const crossBorderPenalty = (input.crossBorderTransferOutsideOman && !input.dataStoredWithinOmanDataPark) ? lambda : 0;

  // Third party processor risk (RD 6/2022 Art. 19)
  const mu = 15.0;
  const thirdPartyRisk = Math.min(1.0, ((input.thirdPartyProcessorsCount || 0) * 0.25)) * mu;

  // Mitigating control deductions (Consent & DPO)
  let mitigations = 0;
  if (input.hasExplicitUserConsent) mitigations += 12;
  if (input.hasAppointedDataProtectionOfficer) mitigations += 10;
  if (input.dataStoredWithinOmanDataPark) mitigations += 15;

  const rawRisk = normalizedBase + crossBorderPenalty + thirdPartyRisk - mitigations;
  const PR_risk = parseFloat(Math.min(100, Math.max(5, rawRisk)).toFixed(2));

  let riskLevel: PrivacyRiskResult['riskLevel'] = 'LOW';
  if (PR_risk >= 75) riskLevel = 'CRITICAL';
  else if (PR_risk >= 55) riskLevel = 'HIGH';
  else if (PR_risk >= 40) riskLevel = 'ELEVATED';
  else if (PR_risk >= 25) riskLevel = 'MODERATE';

  const dpiaMandatory = PR_risk >= 50 || categories.some(c => c.sensitivityLevel >= 0.85) || input.crossBorderTransferOutsideOman;
  const crossBorderTransferCompliant = !input.crossBorderTransferOutsideOman || input.dataStoredWithinOmanDataPark;
  const dataSovereigntyCompliance = input.dataStoredWithinOmanDataPark;

  const identifiedViolations: string[] = [];
  const mitigationDirectives: string[] = [];

  if (input.crossBorderTransferOutsideOman && !input.dataStoredWithinOmanDataPark) {
    identifiedViolations.push('نقل بيانات شخصية خارج الحدود العمانية دون ترخيص كتابي صريح من وزارة النقل والاتصالات وتقنية المعلومات');
    mitigationDirectives.push('إعادة توطين استضافة البيانات والنسخ الاحتياطية داخل مراكز البيانات السيادية في سلطنة عُمان (Oman Data Park)');
  }
  if (!input.hasExplicitUserConsent) {
    identifiedViolations.push('معالجة بيانات دون الحصول على الموافقة الصريحة المسبقة من صاحب البيانات');
    mitigationDirectives.push('تحديث سياسة الخصوصية وإدراج نموذج موافقة صريح متوافق مع [المادة 5، مرسوم سلطاني رقم 6/2022]');
  }
  if (!input.hasAppointedDataProtectionOfficer && dpiaMandatory) {
    mitigationDirectives.push('تعيين مسؤول حماية بيانات شخصية (DPO) معتمد ومؤهل');
  }

  const statutoryCitations: string[] = [
    '[المادة 5، مرسوم سلطاني رقم 6/2022 (شروط المعالجة والموافقة)]',
    '[المادة 23، مرسوم سلطاني رقم 6/2022 (نقل البيانات خارج السلطنة)]',
    '[قرار وزاري رقم 34/2024 (اللائحة التنفيذية لقانون حماية البيانات الشخصية)]'
  ];

  return {
    protocolId: 'EREBUS-CSE-3A12d-009',
    formula: 'EREBUSFORMULA658',
    PR_risk,
    riskLevel,
    dpiaMandatory,
    crossBorderTransferCompliant,
    dataSovereigntyCompliance,
    consciousnessPhi: parseFloat(phi.toFixed(3)),
    identifiedViolations,
    mitigationDirectives,
    statutoryCitations,
    justification: `تم احتساب مؤشر مخاطر الخصوصية وحماية البيانات الشخصية بقيمة ${PR_risk}/100 وفق بروتوكول EREBUS-CSE-3A12d-009 وأحكام المرسوم السلطاني رقم 6/2022.`
  };
}
