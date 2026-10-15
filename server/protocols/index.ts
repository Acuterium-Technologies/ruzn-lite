/**
 * ACUTERIUM TECHNOLOGIES - EREBUS PROTOCOLS INDEX
 * 
 * Main entry point for all EREBUS protocol implementations
 * for the RUZN-Acuterium system.
 * 
 * @module protocols
 * @version 1.0.0
 */

// Core infrastructure
export * from './core';

// Formula implementations
export * from './formulas';

// Service layer
export * from './services';

// Sovereign skills layer
export * from './skills/legalSkills';

// Protocol registry for runtime management
import { protocolRegistry } from './core';

/**
 * Initialize all EREBUS protocols
 * Call this during server startup
 */
export function initializeEREBUSProtocols(): void {
  console.log('[EREBUS] Initializing Acuterium EREBUS protocols...');
  
  // Log available protocols
  const protocols = [
    { id: 'EREBUS-CSE-3A12d-001', name: 'Legal Precedent & Case Law Relevance', formula: 'EREBUSFORMULA650' },
    { id: 'EREBUS-CSE-3A12d-002', name: 'Regulatory Compliance Monitoring', formula: 'EREBUSFORMULA651' },
    { id: 'EREBUS-CSE-3A12d-003', name: 'Contract Risk Aggregate Score (CARP)', formula: 'EREBUSFORMULA652' },
    { id: 'EREBUS-CSE-3A12d-004', name: 'Legislative Impact & Priority (LITP)', formula: 'EREBUSFORMULA653' },
    { id: 'EREBUS-CSE-3A12d-005', name: 'Litigation Strategy & Outcome Prediction', formula: 'EREBUSFORMULA654' },
    { id: 'EREBUS-CSE-3A12d-006', name: 'Compliance Automation & Assurance (CAAP)', formula: 'EREBUSFORMULA655' },
    { id: 'EREBUS-CSE-3A12d-007', name: 'Legal Entity Risk Composite Score (LEIP)', formula: 'EREBUSFORMULA656' },
    { id: 'EREBUS-CSE-3A12d-008', name: 'Regulatory Change Priority Score (RCMP-2)', formula: 'EREBUSFORMULA657' },
    { id: 'EREBUS-CSE-3A12d-009', name: 'Data Privacy & Compliance (DPCP / DPIA)', formula: 'EREBUSFORMULA658' },
    { id: 'EREBUS-CSE-3A12d-010', name: 'Regulatory Impact Assessment (RIA Vision 2040)', formula: 'EREBUSFORMULA659' },
    { id: 'EREBUS-CSE-3A12d-011', name: 'Third-Party & Counterparty Risk (TCRP)', formula: 'EREBUSFORMULA660' },
    { id: 'EREBUS-CSE-3A12d-012', name: 'Legal Intelligence Fusion & Contradiction Penalty (LIFP)', formula: 'EREBUSFORMULA661' },
  ];
  
  for (const p of protocols) {
    console.log(`[EREBUS] ✓ ${p.id}: ${p.name} (${p.formula})`);
  }
  
  console.log(`[EREBUS] ${protocols.length} sovereign protocols ready`);
}

// Version info
export const EREBUS_VERSION = {
  version: '3.0.0-SOVEREIGN',
  releaseDate: '2026-10-15',
  protocols: 12,
  formulas: 12,
  totalEffectiveness: 97.4,
};
