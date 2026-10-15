/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA655
 * Protocol: EREBUS-CSE-3A12d-006
 * Name: Compliance Assurance Composite Score (CAAP)
 * 
 * Continuous automated control testing, audit trail generation, and compliance assurance
 * against INTOSAI-P1 / ISSAI auditing standards and Omani State Audit Law.
 * 
 * Mathematical Foundation:
 * CA_score = Σ_c[w_c · T_test-result,c · E_evidence-quality,c · F_frequency,c · φ_c] - λ·Σ(D_deficiency)
 * 
 * Grounded in:
 * - Royal Decree 111/2011 (State Audit Law)
 * - Royal Decree 112/2011 (Protection of Public Funds Law)
 * - INTOSAI-P1 & ISSAI Standards for Supreme Audit Institutions
 * - ISO 37001 (Anti-Bribery Management Systems) & ISO 37301 (Compliance Management)
 */

import { ConsciousnessWeight } from '../core/ConsciousnessWeight';

export interface AuditControlTest {
  controlId: string;
  name: string;
  category: 'financial_reporting' | 'procurement_oversight' | 'payroll_hr' | 'inventory_assets' | 'it_security' | 'governance';
  riskWeight: number; // 0 - 1
  testResult: 0 | 1; // 1 = Pass, 0 = Fail
  evidenceQuality: number; // 0 - 1
  monitoringFrequency: number; // e.g. 1.0 = real-time, 0.8 = daily, 0.6 = monthly
  isDeficiency?: boolean;
  deficiencySeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ComplianceAssuranceInput {
  entityName: string;
  entityCategory: 'ministry' | 'public_authority' | 'state_owned_enterprise' | 'joint_venture';
  auditYear?: number;
  controls?: AuditControlTest[];
  deficiencyPenaltyMultiplier?: number; // lambda default 5.0
  notes?: string;
}

export interface ComplianceAssuranceResult {
  protocolId: 'EREBUS-CSE-3A12d-006';
  formula: 'EREBUSFORMULA655';
  CA_score: number; // 0 - 100
  assuranceLevel: 'FULL_ASSURANCE' | 'SUBSTANTIAL' | 'MODERATE' | 'LIMITED' | 'UNSATISFACTORY';
  totalControlsTested: number;
  passedControlsCount: number;
  deficienciesIdentified: number;
  deficiencyPenaltyDeduction: number;
  consciousnessPhi: number;
  deficienciesList: Array<{
    controlId: string;
    description: string;
    severity: string;
    statutoryRef: string;
  }>;
  correctiveActions: string[];
  justification: string;
}

const DEFAULT_AUDIT_CONTROLS: AuditControlTest[] = [
  {
    controlId: 'CTL-PRC-01',
    name: 'فصل المهام بين لجان فتح المظاريف والترسية',
    category: 'procurement_oversight',
    riskWeight: 0.25,
    testResult: 1,
    evidenceQuality: 0.95,
    monitoringFrequency: 1.0,
  },
  {
    controlId: 'CTL-FIN-02',
    name: 'المطابقة الدورية بين الأرصدة المصرفية والسجلات المحاسبية',
    category: 'financial_reporting',
    riskWeight: 0.20,
    testResult: 1,
    evidenceQuality: 0.90,
    monitoringFrequency: 0.9,
  },
  {
    controlId: 'CTL-GOV-03',
    name: 'تحديث سجل إقرارات الذمة المالية وتجنب تضارب المصالح',
    category: 'governance',
    riskWeight: 0.20,
    testResult: 1,
    evidenceQuality: 0.85,
    monitoringFrequency: 0.8,
  },
  {
    controlId: 'CTL-AST-04',
    name: 'الجرد الفعلي السنوي للأصول الثابتة والمخازن الحكومية',
    category: 'inventory_assets',
    riskWeight: 0.18,
    testResult: 1,
    evidenceQuality: 0.80,
    monitoringFrequency: 0.7,
  },
  {
    controlId: 'CTL-IT-05',
    name: 'حماية سجلات التدقيق الرقمية (Immutable Audit Trail) وسجلات الوصول',
    category: 'it_security',
    riskWeight: 0.17,
    testResult: 1,
    evidenceQuality: 0.95,
    monitoringFrequency: 1.0,
  }
];

export function calculateEREBUSFORMULA655(input: ComplianceAssuranceInput): ComplianceAssuranceResult {
  const consciousness = new ConsciousnessWeight();
  const phi = consciousness.calculatePhi({
    dataQuality: 0.95,
    sourceReliability: 0.97,
    temporalRelevance: 0.95,
    contextAlignment: 0.94,
    modelConfidence: 0.96,
  });

  const controls = input.controls && input.controls.length > 0 ? input.controls : DEFAULT_AUDIT_CONTROLS;
  const lambda = input.deficiencyPenaltyMultiplier || 6.0;

  let weightedSum = 0;
  let totalWeight = 0;
  let passedCount = 0;
  let deficiencySum = 0;
  const deficienciesList: ComplianceAssuranceResult['deficienciesList'] = [];

  for (const c of controls) {
    totalWeight += c.riskWeight;
    const testScore = c.testResult * c.evidenceQuality * c.monitoringFrequency * phi * 100;
    weightedSum += (c.riskWeight * testScore);

    if (c.testResult === 1) {
      passedCount++;
    } else {
      const sev = c.deficiencySeverity || 'HIGH';
      const severityMultiplier = sev === 'CRITICAL' ? 2.5 : (sev === 'HIGH' ? 1.5 : 1.0);
      deficiencySum += severityMultiplier;

      deficienciesList.push({
        controlId: c.controlId,
        description: `إخفاق في اختبار الرقابة: ${c.name}`,
        severity: sev,
        statutoryRef: '[المادة 8، مرسوم سلطاني رقم 111/2011]',
      });
    }
  }

  const baseAssurance = totalWeight > 0 ? (weightedSum / totalWeight) : 70;
  const deficiencyDeduction = deficiencySum * lambda;
  const CA_score = parseFloat(Math.min(100, Math.max(0, baseAssurance - deficiencyDeduction)).toFixed(2));

  let assuranceLevel: ComplianceAssuranceResult['assuranceLevel'] = 'LIMITED';
  if (CA_score >= 90) assuranceLevel = 'FULL_ASSURANCE';
  else if (CA_score >= 75) assuranceLevel = 'SUBSTANTIAL';
  else if (CA_score >= 60) assuranceLevel = 'MODERATE';
  else if (CA_score < 40) assuranceLevel = 'UNSATISFACTORY';

  const correctiveActions: string[] = [];
  if (deficienciesList.length > 0) {
    correctiveActions.push(`معالجة ${deficienciesList.length} ملاحظات رقابية قبل الزيارة التفتيشية لجهاز الرقابة المالية والإدارية للدولة`);
    correctiveActions.push('إلزام مسؤولي الأقسام المعنية بتقديم خطة تصحيحية خلال 14 يوماً');
  } else {
    correctiveActions.push('الحفاظ على وتيرة التدقيق الآلي والتوثيق المستمر للأدلة الإثباتية');
  }

  return {
    protocolId: 'EREBUS-CSE-3A12d-006',
    formula: 'EREBUSFORMULA655',
    CA_score,
    assuranceLevel,
    totalControlsTested: controls.length,
    passedControlsCount: passedCount,
    deficienciesIdentified: deficienciesList.length,
    deficiencyPenaltyDeduction: parseFloat(deficiencyDeduction.toFixed(2)),
    consciousnessPhi: parseFloat(phi.toFixed(3)),
    deficienciesList,
    correctiveActions,
    justification: `حقق الكيان "${input.entityName}" مؤشر تأكيد امتثال ورِقابة بمقدار ${CA_score}/100 بتصنيف (${assuranceLevel}) وفق معايير بروتوكول EREBUS-CSE-3A12d-006.`
  };
}
