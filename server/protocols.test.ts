import { describe, it, expect } from 'vitest';
import {
  calculateEREBUSFORMULA650,
  calculateEREBUSFORMULA651,
  calculateEREBUSFORMULA652,
  calculateEREBUSFORMULA653,
  calculateEREBUSFORMULA654,
  calculateEREBUSFORMULA655,
  calculateEREBUSFORMULA656,
  calculateEREBUSFORMULA657,
  calculateEREBUSFORMULA658,
  calculateEREBUSFORMULA659,
  calculateEREBUSFORMULA660,
  calculateEREBUSFORMULA661,
  initializeEREBUSProtocols,
  EREBUS_VERSION,
  EREBUS_FORMULA_METADATA,
} from './protocols';

describe('EREBUS Sovereign Protocols Suite (12 Formulas)', () => {
  it('should verify EREBUS_VERSION contains all 12 protocols and formulas', () => {
    expect(EREBUS_VERSION.protocols).toBe(12);
    expect(EREBUS_VERSION.formulas).toBe(12);
    expect(EREBUS_VERSION.version).toContain('SOVEREIGN');
    expect(() => initializeEREBUSProtocols()).not.toThrow();
  });

  it('should calculate EREBUSFORMULA650 (Legal Precedent Relevance)', () => {
    const results = calculateEREBUSFORMULA650([
      {
        docId: 'DOC-OM-001',
        title: 'حكم المحكمة العليا رقم 124/2023',
        snippet: 'في شأن حماية الأموال العامة والمشتريات وتطبيق المادة 12 من قانون المناقصات',
        jurisdiction: 'OM',
        courtLevel: 'supreme',
        publishedDate: '2023-05-15',
        citationCount: 15,
        semanticSimilarity: 0.92,
      }
    ], { isOmaniCase: true });

    expect(results.length).toBe(1);
    expect(results[0].R_legal).toBeGreaterThan(0);
    expect(results[0].jurisdiction).toBe('OM');
  });

  it('should calculate EREBUSFORMULA651 (Regulatory Compliance Risk)', () => {
    const res = calculateEREBUSFORMULA651({
      text: 'شبهة اختلاس وتزوير في فواتير توريدات حكومية وتضارب مصالح لمسؤول في بلدية مسقط',
      entityType: 'government',
      maturityLevel: 'managed',
    });

    expect(res.RC_risk).toBeGreaterThan(0);
    expect(res.detectedRisks.length).toBeGreaterThan(0);
    expect(['CRITICAL', 'HIGH', 'MEDIUM']).toContain(res.riskCategory);
  });

  it('should calculate EREBUSFORMULA652 (Contract Risk Aggregate - CARP)', () => {
    const res = calculateEREBUSFORMULA652({
      contractTitle: 'عقد توريد أنظمة رقمية وتقنية',
      contractType: 'procurement',
      text: 'ينص العقد على unlimited liability للطرف الأول وخضوع النزاع إلى foreign jurisdiction ودون سقف للمسؤولية',
      deviationScore: 0.35,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-003');
    expect(res.formula).toBe('EREBUSFORMULA652');
    expect(res.CR_total).toBeGreaterThan(0);
    expect(res.clauseBreakdown.length).toBeGreaterThan(0);
    expect(res.negotiationTalkingPoints.length).toBeGreaterThan(0);
  });

  it('should calculate EREBUSFORMULA653 (Legislative Impact & Priority - LITP)', () => {
    const res = calculateEREBUSFORMULA653({
      title: 'مشروع قرار وزاري بتعديل اشتراطات التراخيص التجارية',
      type: 'ministerial_decision',
      text: 'يُلغى كل ما يخالف أحكام هذا القرار مع عدم الإخلال بقانون حماية المال العام وتجنب تضارب المصالح مرسوم سلطاني رقم 112/2011',
      targetSectors: ['التجارة والصناعة', 'الخدمات اللوجستية'],
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-004');
    expect(res.LITP_score).toBeGreaterThan(0);
    expect(res.detectedConflicts.length).toBeGreaterThanOrEqual(1);
  });

  it('should calculate EREBUSFORMULA654 (Litigation Outcome Prediction - LSPP)', () => {
    const res = calculateEREBUSFORMULA654({
      caseTitle: 'دعوى مطالبة بمستحقات مقاولة وتوريد',
      caseType: 'commercial',
      courtLevel: 'investment_court',
      venue: 'Muscat',
      claimAmountOMR: 120000,
      factsSummary: 'تم إبرام العقد وتوثيق محاضر الاستلام الجزئي بمستند رسمي مع إشعار بالوفاء المالي وفق الميعاد المحدد',
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-005');
    expect(res.winProbability).toBeGreaterThan(0.5);
    expect(res.damagesEstimationOMR.expected).toBeGreaterThan(0);
    expect(res.statutoryCitations.length).toBeGreaterThan(0);
  });

  it('should calculate EREBUSFORMULA655 (Compliance Assurance Composite - CAAP)', () => {
    const res = calculateEREBUSFORMULA655({
      entityName: 'الشركة العمانية لإدارة المطارات',
      entityCategory: 'state_owned_enterprise',
      auditYear: 2026,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-006');
    expect(res.CA_score).toBeGreaterThan(0);
    expect(res.totalControlsTested).toBeGreaterThan(0);
    expect(res.assuranceLevel).toBeDefined();
  });

  it('should calculate EREBUSFORMULA656 (Legal Entity Risk Composite - LEIP)', () => {
    const res = calculateEREBUSFORMULA656({
      entityName: 'شركة الخليج للاستشارات الدولية ش.م.م',
      entityType: 'llc',
      registrationCountry: 'OM',
      isPubliclyTraded: false,
      hasComplexStructure: false,
    });

    expect(res.ER_entity).toBeGreaterThan(0);
    expect(res.riskCategory).toBeDefined();
  });

  it('should calculate EREBUSFORMULA657 (Regulatory Change Priority - RCMP-2)', () => {
    const res = calculateEREBUSFORMULA657({
      decreeOrDecisionTitle: 'تحديث اللائحة التنفيذية لقانون حماية المستهلك',
      enactmentDate: '2026-01-01',
      effectiveDate: '2026-06-01',
      gracePeriodDays: 90,
      affectedDepartments: ['الشؤون القانونية', 'الرقابة والتفتيش', 'حماية المستهلك'],
      mandatoryActionsCount: 4,
      maxPenaltyOMR: 20000,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-008');
    expect(res.RCMP_score).toBeGreaterThan(0);
    expect(res.urgencyTier).toBeDefined();
    expect(res.actionChecklist.length).toBeGreaterThan(0);
  });

  it('should calculate EREBUSFORMULA658 (Privacy Risk Aggregate - DPCP / DPIA)', () => {
    const res = calculateEREBUSFORMULA658({
      entityName: 'البنك الوطني العماني',
      systemOrProjectName: 'تطبيق الخدمات المصرفية الرقمية',
      crossBorderTransferOutsideOman: true,
      hasExplicitUserConsent: false,
      hasAppointedDataProtectionOfficer: true,
      dataStoredWithinOmanDataPark: false,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-009');
    expect(res.PR_risk).toBeGreaterThan(0);
    expect(res.dpiaMandatory).toBe(true);
    expect(res.statutoryCitations).toContain('[المادة 23، مرسوم سلطاني رقم 6/2022 (نقل البيانات خارج السلطنة)]');
  });

  it('should calculate EREBUSFORMULA659 (Regulatory Impact Assessment - RIA Vision 2040)', () => {
    const res = calculateEREBUSFORMULA659({
      legislativeText: 'مشروع قانون تنظيم الطاقة المتجددة والهيدروجين الأخضر',
      title: 'قانون الطاقة المتجددة',
      legislationType: 'law',
      issuingAuthority: 'وزارة الطاقة والمعادن',
      affectedSectors: ['الطاقة', 'الصناعة', 'الاستثمار'],
      vision2040Pillars: ['economic_diversification', 'environment_natural_resources'],
    });

    expect(res.RIA_score).toBeGreaterThan(0);
    expect(res.vision2040Alignment.overallAlignment).toBeGreaterThan(0);
  });

  it('should calculate EREBUSFORMULA660 (Third-Party Risk Composite - TCRP)', () => {
    const res = calculateEREBUSFORMULA660({
      vendorName: 'Global Cloud Systems FZ-LLC',
      vendorCountry: 'AE',
      contractSpendOMR: 450000,
      totalProcurementBudgetOMR: 1200000,
      isSingleSourceSupplier: true,
      hasSubcontractors: true,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-011');
    expect(res.TPR_total).toBeGreaterThan(0);
    expect(res.dimensionScores.length).toBe(5);
    expect(res.procurementDirectives.length).toBeGreaterThan(0);
  });

  it('should calculate EREBUSFORMULA661 (Fusion Contradiction Penalty - LIFP)', () => {
    const res = calculateEREBUSFORMULA661({
      statuteScore: 92,
      caseLawScore: 85,
      regulationsScore: 88,
      jurisprudenceScore: 78,
      contradictionDegree: 0.45,
    });

    expect(res.protocolId).toBe('EREBUS-CSE-3A12d-012');
    expect(res.fusedScore).toBeGreaterThan(0);
    expect(res.contradictionPenalty).toBeGreaterThan(0);
    expect(res.coherenceStatus).toBe('CONTRADICTION_FLAGGED');
  });

  it('should retrieve suggested queries from the 227-query bank and legal domains', async () => {
    const { getSuggestedQueries, getLegalDomains } = await import('./knowledge/sovereignLegalCorpus');
    
    const domains = getLegalDomains();
    expect(domains.length).toBe(10);
    expect(domains[0].domain).toBe('Civil Law');

    const allQueries = getSuggestedQueries({ limit: 10 });
    expect(allQueries.totalAvailable).toBe(45);
    expect(allQueries.returnedCount).toBe(10);
    expect(allQueries.queries.length).toBe(10);

    const laborQueries = getSuggestedQueries({ domain: 'القانون_العمالي', limit: 5 });
    expect(laborQueries.queries.length).toBeGreaterThan(0);
    expect(laborQueries.queries[0]['المجال']).toBe('القانون_العمالي');
  });
});
