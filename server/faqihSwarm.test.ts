import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { dispatchAgentSwarm, generateMinisterDailyBrief, SOVEREIGN_AGENTS_ROSTER } from './protocols/swarm/agentSwarm';

describe('Sovereign Multi-Agent Swarm Integration (Layer 7)', () => {
  it('should verify roster contains all 4 sovereign personas', () => {
    expect(SOVEREIGN_AGENTS_ROSTER.faqih_prime).toBeDefined();
    expect(SOVEREIGN_AGENTS_ROSTER.dalil_sidebar).toBeDefined();
    expect(SOVEREIGN_AGENTS_ROSTER.khabeer_ria).toBeDefined();
    expect(SOVEREIGN_AGENTS_ROSTER.nazeha_investigator).toBeDefined();
    expect(SOVEREIGN_AGENTS_ROSTER.dalil_sidebar.protocolId).toContain('ASIP-v2 / ACUTERIUM-SWARM-FTS5-SOVEREIGN');
  });

  it('should dispatch tactical statutory search via Dalil Sidebar', async () => {
    const res = await dispatchAgentSwarm({
      role: 'dalil_sidebar',
      query: 'عقود العمل وإنهاء الخدمة',
      language: 'arabic'
    });

    expect(res.agent.role).toBe('dalil_sidebar');
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0]).toMatch(/\[المادة [^،]+، مرسوم سلطاني رقم/);
  });

  it('should execute live legal analysis via Faqih Prime', async () => {
    const res = await dispatchAgentSwarm({
      role: 'faqih_prime',
      query: 'مسؤولية الشريك في الشركة ذات المسؤولية المحدودة',
      language: 'arabic'
    });

    expect(res.agent.role).toBe('faqih_prime');
    expect(res.summary).toBeDefined();
    expect(res.summary.length).toBeGreaterThan(50);
    expect(res.citations.length).toBeGreaterThan(0);
  }, 20000);

  it('should generate dynamic Minister Daily Brief without static hardcoding', () => {
    const brief = generateMinisterDailyBrief();
    expect(brief.date).toBeDefined();
    expect(brief.totalAlerts).toBeGreaterThanOrEqual(10);
    expect(brief.criticalCases).toBeGreaterThanOrEqual(1);
    expect(brief.recoveredFundsOMR).toBeGreaterThan(0);
    expect(brief.keyDirectives.length).toBeGreaterThanOrEqual(3);
  });
});
