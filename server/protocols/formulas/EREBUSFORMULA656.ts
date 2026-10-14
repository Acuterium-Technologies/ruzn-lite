/**
 * ACUTERIUM TECHNOLOGIES - EREBUSFORMULA656
 * Protocol: EREBUS-CSE-3A12d-007
 * Name: Legal Entity Risk Composite Score (LEIP)
 * 
 * Formula:
 * ER_entity = Σ_r[w_r · R_r · φ_r] + α·J_jurisdiction + β·O_ownership + γ·S_sanctions + δ·P_PEP
 */

export interface BeneficialOwner {
  name: string;
  ownershipPercentage: number;
  isPEP: boolean;
  isSanctioned: boolean;
  nationality: string;
  isIndirect: boolean;
}

export interface EntityInput {
  entityName: string;
  entityType: 'corporation' | 'llc' | 'partnership' | 'individual' | 'trust' | 'foundation' | 'government';
  registrationCountry: string;
  incorporationDate?: string;
  beneficialOwners?: BeneficialOwner[];
  isPubliclyTraded: boolean;
  hasComplexStructure: boolean;
}

export interface EntityFlag {
  type: 'SANCTIONS' | 'PEP' | 'HIGH_RISK_JURISDICTION' | 'COMPLEX_OWNERSHIP' | 'SHELL_COMPANY_INDICATOR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  source: string;
}

export interface EntityRiskResult {
  protocolId: 'EREBUS-CSE-3A12d-007';
  formula: 'EREBUSFORMULA656';
  ER_entity: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM' | 'LOW';
  riskBreakdown: {
    baseRiskScore: number;
    jurisdictionRisk: number;
    ownershipRisk: number;
    sanctionsRisk: number;
    pepRisk: number;
  };
  flags: EntityFlag[];
  dueDiligenceLevel: 'ENHANCED' | 'STANDARD' | 'SIMPLIFIED';
  recommendations: string[];
}

const JURISDICTION_RISK: Record<string, number> = {
  'OM': 0.15, 'AE': 0.20, 'SA': 0.25, 'QA': 0.20, 'BH': 0.20, 'KW': 0.20,
  'UK': 0.15, 'US': 0.15, 'SG': 0.12, 'PA': 0.65, 'VG': 0.70, 'KY': 0.60,
  'SC': 0.75, 'IR': 0.95, 'KP': 0.98, 'SY': 0.95, 'RU': 0.85, 'DEFAULT': 0.50,
};

const ALPHA = 15, BETA = 20, GAMMA = 30, DELTA = 20;

export function calculateEREBUSFORMULA656(input: EntityInput): EntityRiskResult {
  const flags: EntityFlag[] = [];

  const entityTypeRisk: Record<string, number> = {
    'corporation': 0.20, 'llc': 0.30, 'partnership': 0.35, 'individual': 0.25,
    'trust': 0.50, 'foundation': 0.45, 'government': 0.15,
  };
  let baseRiskScore = entityTypeRisk[input.entityType] || 0.30;
  
  if (input.incorporationDate) {
    const ageYears = (new Date().getTime() - new Date(input.incorporationDate).getTime()) / 
                     (1000 * 60 * 60 * 24 * 365);
    if (ageYears < 1) baseRiskScore += 0.20;
    else if (ageYears < 3) baseRiskScore += 0.10;
  }

  if (input.isPubliclyTraded) baseRiskScore *= 0.7;

  const J_jurisdiction = JURISDICTION_RISK[input.registrationCountry.toUpperCase()] || 
                         JURISDICTION_RISK['DEFAULT'];
  if (J_jurisdiction > 0.6) {
    flags.push({
      type: 'HIGH_RISK_JURISDICTION',
      severity: J_jurisdiction > 0.8 ? 'CRITICAL' : 'HIGH',
      description: `الكيان مسجل في ولاية قضائية عالية المخاطر: ${input.registrationCountry}`,
      source: 'تقييم مخاطر FATF/OECD',
    });
  }

  let O_ownership = 0;
  let S_sanctions = 0;
  let P_PEP = 0;

  if (input.beneficialOwners && input.beneficialOwners.length > 0) {
    const totalIdentified = input.beneficialOwners.reduce((sum, o) => sum + o.ownershipPercentage, 0);
    const indirectCount = input.beneficialOwners.filter(o => o.isIndirect).length;
    O_ownership = (100 - totalIdentified) / 100 + (indirectCount * 0.15);
    O_ownership = Math.min(1.0, O_ownership);

    const sanctionedOwners = input.beneficialOwners.filter(o => o.isSanctioned);
    if (sanctionedOwners.length > 0) {
      S_sanctions = sanctionedOwners.reduce((sum, o) => sum + (o.ownershipPercentage / 100), 0);
      S_sanctions = Math.min(1.0, S_sanctions);
      flags.push({
        type: 'SANCTIONS',
        severity: 'CRITICAL',
        description: `تم رصد ${sanctionedOwners.length} مالك مستفيد مدرج على قوائم العقوبات`,
        source: 'قوائم العقوبات الأممية والوطنية',
      });
    }

    const pepOwners = input.beneficialOwners.filter(o => o.isPEP);
    if (pepOwners.length > 0) {
      P_PEP = pepOwners.reduce((sum, o) => sum + (o.ownershipPercentage / 100) * 0.5, 0);
      P_PEP = Math.min(1.0, P_PEP);
      flags.push({
        type: 'PEP',
        severity: P_PEP > 0.5 ? 'HIGH' : 'MEDIUM',
        description: `تم تحديد ${pepOwners.length} شخص معرض سياسياً (PEP) في هيكل الملكية`,
        source: 'فحص قاعدة بيانات الشخصيات المعرضة سياسياً',
      });
    }
  }

  if (input.hasComplexStructure) {
    O_ownership = Math.min(1.0, O_ownership + 0.3);
    flags.push({
      type: 'COMPLEX_OWNERSHIP',
      severity: 'MEDIUM',
      description: 'هيكل ملكية معقد يتطلب عناية واجبة مشددة',
      source: 'التحليل الهيكلي',
    });
  }

  const ER_entity = (baseRiskScore * 20) + (ALPHA * J_jurisdiction) + (BETA * O_ownership) + 
                    (GAMMA * S_sanctions) + (DELTA * P_PEP);
  const normalizedER = Math.min(100, Math.max(0, ER_entity));

  let riskCategory: EntityRiskResult['riskCategory'] = 'LOW';
  if (normalizedER >= 80 || S_sanctions > 0) riskCategory = 'CRITICAL';
  else if (normalizedER >= 60) riskCategory = 'HIGH';
  else if (normalizedER >= 40) riskCategory = 'ELEVATED';
  else if (normalizedER >= 20) riskCategory = 'MEDIUM';

  let dueDiligenceLevel: EntityRiskResult['dueDiligenceLevel'] = 'STANDARD';
  if (riskCategory === 'CRITICAL' || riskCategory === 'HIGH' || flags.length > 2) {
    dueDiligenceLevel = 'ENHANCED';
  } else if (riskCategory === 'LOW' && flags.length === 0) {
    dueDiligenceLevel = 'SIMPLIFIED';
  }

  const recommendations: string[] = [];
  if (S_sanctions > 0) recommendations.push('إيقاف فوري للتعامل: وجود مخاطر عقوبات تتطلب تصريحاً قانونياً عاجلاً');
  if (P_PEP > 0) recommendations.push('تطبيق إجراءات العناية الواجبة المشددة تجاه الأشخاص المعرضين سياسياً');
  if (O_ownership > 0.5) recommendations.push('التحقق من المالكين المستفيدين عبر سجلات تجارية موثقة');
  if (J_jurisdiction > 0.5) recommendations.push('مراقبة متقدمة للعمليات العابرة للحدود مع ولايات مرتفعة المخاطر');
  if (dueDiligenceLevel === 'ENHANCED') recommendations.push('اشتراط موافقة الإدارة العليا وفق المرسوم السلطاني 30/2016');

  return {
    protocolId: 'EREBUS-CSE-3A12d-007',
    formula: 'EREBUSFORMULA656',
    ER_entity: parseFloat(normalizedER.toFixed(2)),
    riskCategory,
    riskBreakdown: {
      baseRiskScore: parseFloat((baseRiskScore * 20).toFixed(2)),
      jurisdictionRisk: parseFloat((ALPHA * J_jurisdiction).toFixed(2)),
      ownershipRisk: parseFloat((BETA * O_ownership).toFixed(2)),
      sanctionsRisk: parseFloat((GAMMA * S_sanctions).toFixed(2)),
      pepRisk: parseFloat((DELTA * P_PEP).toFixed(2)),
    },
    flags,
    dueDiligenceLevel,
    recommendations,
  };
}
