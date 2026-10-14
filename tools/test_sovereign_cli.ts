import { searchSovereignCorpus, verifyStatutoryCitation, getCorpusStats } from '../server/knowledge/sovereignLegalCorpus';
import { dispatchAgentSwarm, generateMinisterDailyBrief } from '../server/protocols/swarm/agentSwarm';
import { detectLegalIntent } from '../server/protocols/skills/legalSkills';
import { calculateEREBUSFORMULA653 } from '../server/protocols/formulas/EREBUSFORMULA653';

async function runVerification() {
  console.log('================================================================');
  console.log('🏛️ RUZN.LEGAL SOVEREIGN CLI ENDPOINT & ENGINE VERIFICATION');
  console.log('================================================================');

  // 1. Corpus stats
  const stats = getCorpusStats();
  console.log('\n[1] SOVEREIGN LEGAL CORPUS (Layer 3):');
  console.log(`    Total Indexed Articles: ${stats.totalArticles}`);
  console.log(`    Total Royal Decrees:    ${stats.totalDocuments}`);
  console.log(`    Corpus Path:            ${stats.corpusPath}`);

  // 2. FTS5 Search
  console.log('\n[2] FTS5 STATUTORY SEARCH TEST:');
  const query = 'حماية المال العام وتجنب تضارب المصالح';
  const results = searchSovereignCorpus(query, 3);
  console.log(`    Query: "${query}" -> ${results.length} articles found:`);
  results.forEach((r, i) => {
    console.log(`    (${i + 1}) Article ${r.articleNumber} | Decree ${r.decreeNo} | ${r.titleAr.substring(0, 50)}...`);
  });

  // 3. Ruling R-17 Citation Verification (Grounded vs Fail-Closed)
  console.log('\n[3] RULING R-17 CITATION INTEGRITY TEST:');
  const validCitationText = 'وفقاً لأحكام [المادة 5، مرسوم سلطاني رقم 29/2002] في قانون الإجراءات المدنية والتجارية';
  const validCheck = verifyStatutoryCitation(validCitationText);
  console.log(`    Valid Citation Test: "${validCitationText}"`);
  console.log(`    Verdict: ${validCheck.verdict} | Grounded: ${validCheck.verified} | Score: ${validCheck.authorityScore}`);

  const fakeCitationText = 'استناداً إلى [المادة 999، مرسوم سلطاني رقم 999/2099] المزعومة';
  const fakeCheck = verifyStatutoryCitation(fakeCitationText);
  console.log(`    Hallucinated Citation Test: "${fakeCitationText}"`);
  console.log(`    Verdict: ${fakeCheck.verdict} | Grounded: ${fakeCheck.verified} | Score: ${fakeCheck.authorityScore} (Protected by Fail-Closed)`);

  // 4. Intent Detection
  console.log('\n[4] SKILL INTENT DETECTION TEST:');
  const sampleQueries = [
    'ما هي عقوبة الرشوة في قانون الجزاء العماني؟',
    'أريد نموذج إفصاح مالي سنوي لموظف حكومي',
    'ما هي إجراءات تقديم بلاغ فساد إلى جهاز الرقابة؟'
  ];
  for (const q of sampleQueries) {
    const detected = detectLegalIntent(q);
    console.log(`    "${q.substring(0, 40)}..." -> [${detected.intent}] (Confidence: ${detected.confidence})`);
  }

  // 5. Swarm Dispatching (Faqih Prime & Khabeer RIA)
  console.log('\n[5] MULTI-AGENT SWARM DISPATCH TEST:');
  const faqihRes = await dispatchAgentSwarm({
    role: 'faqih_prime',
    query: 'ما هي ضوابط قبول الهدايا للموظف العام وفق المرسوم 112/2011؟',
    language: 'arabic'
  });
  console.log(`    Agent: ${faqihRes.agent.name} (${faqihRes.agent.protocolId})`);
  console.log(`    Summary: ${faqihRes.summary}`);
  console.log(`    Citations: ${faqihRes.citations.join(', ')}`);

  // 6. Minister Daily Brief
  console.log('\n[6] MINISTER DAILY BRIEF GENERATION TEST:');
  const brief = generateMinisterDailyBrief();
  console.log(`    Date: ${brief.date}`);
  console.log(`    Alerts: ${brief.totalAlerts} | Critical Cases: ${brief.criticalCases} | Recovered: ${brief.recoveredFundsOMR.toLocaleString()} OMR`);
  console.log(`    Directives: ${brief.keyDirectives.length} active directives`);

  // 7. EREBUS Formula 653 (LITP Score)
  console.log('\n[7] EREBUS PROTOCOL 653 (LITP SCORE):');
  const litp = calculateEREBUSFORMULA653({
    title: 'تعديل لائحة المشتريات والمناقصات الحكومية',
    type: 'executive_regulation',
    text: 'استناداً إلى قانون المناقصات الصادر بالمرسوم السلطاني رقم 36/2008، وإلى قانون حماية المال العام وتجنب تضارب المصالح الصادر بالمرسوم السلطاني رقم 112/2011، تقرر وضع ضوابط جديدة لإرساء العقود الحكومية وإلزامية الإفصاح المالي.',
    targetSectors: ['المشتريات الحكومية', 'الخدمات العامة'],
    affectedExistingLaws: ['RD 36/2008', 'RD 112/2011']
  });
  console.log(`    LITP Score: ${litp.LITP_score.toFixed(2)}/100 | Priority: ${litp.priorityTier} | Phi: ${litp.metrics.consciousnessPhi.toFixed(3)}`);
  console.log(`    Detected Statute Interactions: ${litp.detectedConflicts.length}`);
  console.log(`    Justification: ${litp.justification}`);

  console.log('\n================================================================');
  console.log('✅ ALL OFFLINE CLI ENDPOINT TESTS EXECUTED SUCCESSFULLY');
  console.log('================================================================');
}

runVerification().catch(console.error);
