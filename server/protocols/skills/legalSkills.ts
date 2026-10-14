/**
 * ACUTERIUM TECHNOLOGIES - LAYER 2 SOVEREIGN SKILLS
 * Intent detection, schema template routing, and legal domain context expansion
 */

import schemaTemplates from './schema_templates.json';

export type LegalIntent = 
  | 'general_inquiry' 
  | 'case_advice' 
  | 'law_reference' 
  | 'document_request' 
  | 'procedure_guidance';

export interface IntentMatchResult {
  intent: LegalIntent;
  domain: string;
  confidence: number;
  matchedKeywords: string[];
  template: typeof schemaTemplates[keyof typeof schemaTemplates];
}

export function detectLegalIntent(query: string): IntentMatchResult {
  const normalizedQuery = query.toLowerCase();
  let bestMatch: IntentMatchResult = {
    intent: 'general_inquiry',
    domain: 'civil_law',
    confidence: 0.5,
    matchedKeywords: [],
    template: schemaTemplates.general_inquiry
  };

  let maxScore = -1;

  for (const [intentKey, template] of Object.entries(schemaTemplates)) {
    const matched = template.keywords.filter(kw => normalizedQuery.includes(kw.toLowerCase()));
    const score = matched.length / Math.max(1, template.keywords.length);
    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        intent: intentKey as LegalIntent,
        domain: template.domain,
        confidence: Math.min(0.99, 0.5 + score * 0.5),
        matchedKeywords: matched,
        template: template as typeof schemaTemplates[keyof typeof schemaTemplates]
      };
    }
  }

  return bestMatch;
}

export function getLegalIntentTemplates() {
  return schemaTemplates;
}
