/**
 * Ruzn-Lite Knowledge Base Module (MySQL - Legacy/Manual)
 * 
 * ⚠️ DEPRECATION NOTICE:
 * This module is legacy/manual keyword KB (MySQL full-text search).
 * For production regulatory clause retrieval, use the PGVector semantic search:
 *   - import { getKnowledgeProvider } from '../knowledge/providers'
 *   - provider.search({ query: "..." })
 * 
 * This module is kept for:
 * - Internal notes and manual annotations
 * - Backward compatibility
 * - Simple full-text fallback when PGVector is unavailable
 * 
 * Set INTERNAL_NOTES_MODE=true to enable this module.
 * 
 * Original features:
 * - Full-text search in Arabic and English
 * - Document management
 * - Version control
 * - PDF parsing and ingestion
 */

import { getDb } from './connection';
import { knowledgeBase, documentVersions } from '../../drizzle/schema';
import { eq, like, or, desc, sql, and } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════
// INTERNAL NOTES MODE CHECK
// ═══════════════════════════════════════════════════════════════
function checkInternalNotesMode() {
  if (process.env.INTERNAL_NOTES_MODE !== "true") {
    console.warn(
      "⚠️ MySQL knowledge module called but INTERNAL_NOTES_MODE is not enabled. " +
      "For production RAG, use server/knowledge/ (PGVector)."
    );
  }
}

// Types
export interface KnowledgeEntry {
  id: number;
  title: string;
  titleArabic?: string | null;
  content: string;
  contentArabic?: string | null;
  category: 'law' | 'regulation' | 'policy' | 'procedure' | 'report' | 'guideline';
  source: string;
  referenceNumber?: string | null;
  effectiveDate?: Date | null;
  keywords: string | null; // JSON string array stored in DB
  keywordsArabic?: string | null; // JSON string array stored in DB
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  entry: KnowledgeEntry;
  relevanceScore: number;
  matchedKeywords: string[];
  snippet: string;
}

export interface DocumentVersion {
  id: number;
  knowledgeId: number;
  version: number;
  content: string;
  changedBy: string;
  changeDescription: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// SOVEREIGN FALLBACK KNOWLEDGE BASE (Authentic Oman Legal Corpus)
// ═══════════════════════════════════════════════════════════════
export const SOVEREIGN_FALLBACK_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 1,
    title: "State Audit Law - Royal Decree 111/2011",
    titleArabic: "قانون الرقابة المالية والإدارية للدولة - المرسوم السلطاني رقم 111/2011",
    category: "law",
    source: "الجريدة الرسمية (Official Gazette)",
    referenceNumber: "RD 111/2011",
    effectiveDate: new Date("2011-10-19"),
    content: "The State Audit Institution has legal personality and financial and administrative independence, reporting directly to His Majesty the Sultan. Article 8 defines core objectives: Protection of public funds, verification of compliance with laws and regulations, avoidance of conflicts of interest, transparency in financial and administrative transactions, and preventive oversight. Members possess judicial police authority (صفة الضبطية القضائية) under Article 7.",
    contentArabic: "يتمتع جهاز الرقابة المالية والإدارية للدولة بالشخصية الاعتبارية والاستقلال المالي والإداري ويتبع جلالة السلطان مباشرة. تحدد المادة 8 أهداف الجهاز الأساسية: حماية الأموال العامة للدولة وتجنب وقوع تضارب المصالح والتحقق من تطبيق القوانين واللوائح والالتزام بمبدأ الشفافية وإرساء الرقابة الوقائية. ويمنح القانون بموجب المادة 7 أعضاء الجهاز صفة الضبطية القضائية في تطبيق أحكامه.",
    keywords: JSON.stringify(["audit", "state audit", "royal decree 111/2011", "public funds", "judicial authority", "oversight"]),
    keywordsArabic: JSON.stringify(["رقابة", "جهاز الرقابة", "مرسوم سلطاني 111/2011", "أموال عامة", "ضبطية قضائية", "نزاهة"]),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 2,
    title: "Protection of Public Funds and Avoidance of Conflict of Interest - Royal Decree 112/2011",
    titleArabic: "قانون حماية المال العام وتجنب تضارب المصالح - المرسوم السلطاني رقم 112/2011",
    category: "law",
    source: "الجريدة الرسمية (Official Gazette)",
    referenceNumber: "RD 112/2011",
    effectiveDate: new Date("2011-10-19"),
    content: "Comprehensive statutory framework criminalizing embezzlement, bribery, abuse of public position (Article 7, 1-3 years imprisonment), failure to report violations (Article 5), mediation/representation in government transactions (Article 8), personal use of public assets (Article 9), and conflict of interest through equity ownership in supervised firms (Article 11). Mandatory financial disclosure enforced under Article 12.",
    contentArabic: "القانون المنظم لحماية المال العام وتجريم التعدي عليه أو إهداره؛ حيث تنص المادة 4 على حرمة المال العام، والمادة 5 على وجوب الإبلاغ الفوري عن المخالفات، والمادة 7 على تجريم استغلال المنصب لتحقيق منفعة شخصية (عقوبة السجن من سنة إلى ثلاث سنوات)، والمادة 8 على حظر الوساطة والمحاباة، والمادة 11 على حظر تملك أسهم في شركات خاضعة للرقابة، مع فرض إقرار الذمة المالية بموجب المادة 12 والعزل ومصادرة الأموال.",
    keywords: JSON.stringify(["public funds", "conflict of interest", "royal decree 112/2011", "embezzlement", "bribery", "abuse of position", "penalties"]),
    keywordsArabic: JSON.stringify(["حماية المال العام", "تضارب المصالح", "مرسوم 112/2011", "اختلاس", "رشوة", "استغلال منصب", "إقرار الذمة المالية"]),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 3,
    title: "National Integrity Plan 2022-2030",
    titleArabic: "الخطة الوطنية لتعزيز النزاهة ومكافحة الفساد 2022-2030",
    category: "policy",
    source: "جهاز الرقابة المالية والإدارية للدولة",
    referenceNumber: "NIP-2022-2030",
    effectiveDate: new Date("2022-01-01"),
    content: "Sovereign 10-year roadmap aligned with Oman Vision 2040 governance pillars. Establishes institutional performance baselines, private sector business integrity standards, automated whistleblower protections, digital asset verification pipelines, and multi-agency anti-fraud taskforces.",
    contentArabic: "خارطة الطريق الوطنية الاستراتيجية المعتمدة لتحقيق مستهدفات رؤية عُمان 2040 في محور الحوكمة الرشيدة وسيادة القانون. ترتكز على خمسة محاور: تطوير الأطر التشريعية، رفع كفاءة الأجهزة الحكومية، تعزيز النزاهة في القطاع الخاص والمناقصات، ترسيخ الشراكة المجتمعية، وتعزيز التعاون الدولي لاسترداد الأصول المنهوبة.",
    keywords: JSON.stringify(["integrity plan", "vision 2040", "governance", "anti-corruption", "strategy", "compliance"]),
    keywordsArabic: JSON.stringify(["خطة النزاهة", "رؤية عمان 2040", "حوكمة", "مكافحة الفساد", "استراتيجية", "امتثال"]),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 4,
    title: "State Audit Institution Annual Report 2024 - Executive Brief",
    titleArabic: "ملخص التقرير السنوي لجهاز الرقابة المالية والإدارية 2024",
    category: "report",
    source: "التقرير السنوي لجهاز الرقابة 2024",
    referenceNumber: "OSAI-AR-2024",
    effectiveDate: new Date("2024-12-31"),
    content: "Key operational metrics for fiscal year 2024: OMR 25,000,000 in direct recovered public funds, 72 financial and administrative cases investigated, 25 high-priority conviction referrals submitted to Public Prosecution, with 88% digital audit coverage across ministries and state-owned enterprises.",
    contentArabic: "أبرز مؤشرات الأداء السنوي لعام 2024: استرداد وتحصيل ما يربو على 25 مليون ريال عماني لصالح الخزانة العامة، وبحث 72 ملفاً وقضية مخالفات مالية وإدارية، وإحالة 25 قضية مشددة إلى الادعاء العام، وتحقيق نسبة 88% في تغطية التدقيق الرقمي الذكي للمشتريات والمناقصات الحكومية.",
    keywords: JSON.stringify(["annual report 2024", "recoveries", "prosecution", "statistics", "kpis"]),
    keywordsArabic: JSON.stringify(["تقرير سنوي 2024", "أموال مستردة", "ادعاء عام", "إحصائيات", "مؤشرات"]),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 5,
    title: "State Audit Institution Annual Report 2023 - Case Studies & Recoveries",
    titleArabic: "ملخص التقرير السنوي لجهاز الرقابة المالية والإدارية 2023",
    category: "report",
    source: "التقرير السنوي لجهاز الرقابة 2023",
    referenceNumber: "OSAI-AR-2023",
    effectiveDate: new Date("2023-12-31"),
    content: "Executive brief on 2023 audit investigations: OMR 17.8 million recovered, landmark bribery and money-laundering convictions in state fisheries and telecom holdings, 14 executive removals, and implementation of early warning anomaly detection.",
    contentArabic: "ملخص مخرجات الفحص الرقابي لعام 2023: استرداد 17.8 مليون ريال عماني، وتوثيق أحكام إدانة قضائية نهائية في قضايا غسيل أموال ورشوة بشركات حكومية، وعزل 14 مسؤولاً من الوظيفة العامة ومصادرة أموال غير مشروعة.",
    keywords: JSON.stringify(["annual report 2023", "recoveries", "convictions", "fisheries", "bribery"]),
    keywordsArabic: JSON.stringify(["تقرير سنوي 2023", "استرداد أموال", "إدانات", "رشوة", "غسيل أموال"]),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 6,
    title: "State Audit Institution Annual Report 2022 - Procurement Compliance",
    titleArabic: "ملخص التقرير السنوي لجهاز الرقابة المالية والإدارية 2022",
    category: "report",
    source: "التقرير السنوي لجهاز الرقابة 2022",
    referenceNumber: "OSAI-AR-2022",
    effectiveDate: new Date("2022-12-31"),
    content: "Focus on procurement integrity and tender law violations: OMR 12.4 million recovered, 95 compliance audits, and enforcement of strict penalties for tender manipulation and contractor favoritism across regional municipalities.",
    contentArabic: "مخرجات الرقابة على المناقصات والعقود الحكومية لعام 2022: استرداد 12.4 مليون ريال، وتنفيذ 95 مهمة فحص وتدقيق، ورصد مخالفات ترسية وإسناد غير قانوني وإحالة المتورطين للمحاكمة العاجلة.",
    keywords: JSON.stringify(["annual report 2022", "procurement", "tenders", "municipalities", "compliance"]),
    keywordsArabic: JSON.stringify(["تقرير سنوي 2022", "مناقصات", "مشتريات", "بلديات", "امتثال"]),
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 7,
    title: "OSAI Complete Sovereign Legislative Intelligence Taxonomy",
    titleArabic: "المصفوفة التشريعية الموحدة لتصنيف البلاغات والمخالفات",
    category: "guideline",
    source: "Acuterium / Ruzn Sovereign Knowledge Core",
    referenceNumber: "RZN-TAXONOMY-V4",
    effectiveDate: new Date("2024-06-01"),
    content: "Standard operational taxonomy mapping: 1) Embezzlement (90-100 risk), 2) Bribery (90-100 risk), 3) Conflict of Interest (70-89 risk), 4) Abuse of Position (70-89 risk), 5) Forgery (70-89 risk), 6) Tender Law Violations (60-79 risk), 7) Administrative Negligence (40-59 risk), 8) Failure to Report (40-59 risk).",
    contentArabic: "المصفوفة التشغيلية المعتمدة لمنصة رُزن: تصنيف المخاطر الثماني وأوزانها الخوارزمية ومواد الإحالة القانونية من المرسومين السلطانيين 111/2011 و 112/2011 وقانون الجزاء وقانون المناقصات وقانون مكافحة غسل الأموال.",
    keywords: JSON.stringify(["taxonomy", "risk scoring", "classification", "statutory penalties", "sovereign"]),
    keywordsArabic: JSON.stringify(["تصنيف المخاطر", "أوزان خوارزمية", "مصفوفة قانونية", "عقوبات", "سيادي"]),
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2026-01-01")
  },
  {
    id: 8,
    title: "EREBUS-659 Protocol: Regulatory Impact Assessment Guidelines",
    titleArabic: "بروتوكول EREBUS-659: معايير تقييم الأثر التشريعي والتنظيمي (RIA)",
    category: "procedure",
    source: "Acuterium Technologies Intelligence Unit",
    referenceNumber: "EREBUS-RIA-2026",
    effectiveDate: new Date("2026-01-01"),
    content: "Multi-dimensional scoring methodology assessing new legislation against Oman Vision 2040: Diversified & Sustainable Economy (Economy), Human Capital & Capabilities (Society), Accountable Governance & Rule of Law (Governance), and Environmental Sustainability (Environment). Produces auditable legislative impact scores (0-100) and actionable policy recommendations.",
    contentArabic: "المنهجية الخوارزمية الشاملة لتقييم الأثر التشريعي والتنظيمي وفق بروتوكول إريبوس-659، حيث يتم فحص مشروعات القوانين واللوائح وقياس مواءمتها لمحاور رؤية عُمان 2040 (الاقتصاد المستدام، الإنسان والمجتمع، الحوكمة الرشيدة، البيئة المستدامة) وتوليد درجات تقييم رقمية وتوصيات وقائية قابلة للتنفيذ الفوري.",
    keywords: JSON.stringify(["erebus", "ria", "vision 2040", "regulatory impact assessment", "governance", "algorithm"]),
    keywordsArabic: JSON.stringify(["إريبوس", "تقييم الأثر", "رؤية عمان 2040", "تشريعات", "حوكمة", "خوارزمية"]),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01")
  }
];

/**
 * Search knowledge base with full-text and keyword matching
 */
export async function searchKnowledgeBase(
  query: string,
  options: {
    limit?: number;
    category?: KnowledgeEntry['category'];
    language?: 'arabic' | 'english' | 'both';
    minRelevance?: number;
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 5,
    category,
    language = 'both',
    minRelevance = 0.1
  } = options;

  const isArabicQuery = /[\u0600-\u06FF]/.test(query);
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  try {
    const db = getDb();
    if (db) {
      const conditions = [];
      if (language === 'both' || language === 'english') {
        conditions.push(
          like(knowledgeBase.content, `%${query}%`),
          like(knowledgeBase.title, `%${query}%`)
        );
      }
      if (language === 'both' || language === 'arabic') {
        conditions.push(
          like(knowledgeBase.contentArabic, `%${query}%`),
          like(knowledgeBase.titleArabic, `%${query}%`)
        );
      }
      const whereClause = category 
        ? and(or(...conditions), eq(knowledgeBase.category, category))
        : or(...conditions);

      const results = await db
        .select()
        .from(knowledgeBase)
        .where(whereClause)
        .limit(limit * 2);

      if (results && results.length > 0) {
        const scoredResults: SearchResult[] = results.map((entry: any) => {
          let score = 0;
          const matchedKeywords: string[] = [];
          if (entry.title?.toLowerCase().includes(query.toLowerCase())) score += 0.4;
          if (entry.titleArabic?.includes(query)) score += 0.4;
          const content = isArabicQuery ? entry.contentArabic : entry.content;
          if (content) {
            const contentLower = content.toLowerCase();
            searchTerms.forEach(term => {
              const count = (contentLower.match(new RegExp(term, 'g')) || []).length;
              if (count > 0) {
                score += Math.min(count * 0.05, 0.3);
                matchedKeywords.push(term);
              }
            });
          }
          const snippet = generateSnippet(isArabicQuery ? entry.contentArabic : entry.content, query, 200);
          return {
            entry: entry as KnowledgeEntry,
            relevanceScore: Math.min(score, 1),
            matchedKeywords: [...new Set(matchedKeywords)],
            snippet
          };
        });

        const filtered = scoredResults
          .filter(r => r.relevanceScore >= minRelevance)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, limit);
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (error) {
    console.warn("[Knowledge] DB search failed, searching sovereign fallback:", error);
  }

  // Fallback search over SOVEREIGN_FALLBACK_KNOWLEDGE
  let fallbackEntries = [...SOVEREIGN_FALLBACK_KNOWLEDGE];
  if (category) {
    fallbackEntries = fallbackEntries.filter(e => e.category === category);
  }

  const scoredFallback: SearchResult[] = fallbackEntries.map(entry => {
    let score = 0;
    const matchedKeywords: string[] = [];
    if (entry.title.toLowerCase().includes(query.toLowerCase())) score += 0.4;
    if (entry.titleArabic?.includes(query)) score += 0.4;
    const content = isArabicQuery ? (entry.contentArabic || '') : entry.content;
    if (content.toLowerCase().includes(query.toLowerCase())) score += 0.3;
    searchTerms.forEach(t => {
      if (content.toLowerCase().includes(t)) {
        score += 0.1;
        matchedKeywords.push(t);
      }
    });
    const snippet = generateSnippet(isArabicQuery ? entry.contentArabic : entry.content, query, 200);
    return {
      entry,
      relevanceScore: Math.min(score > 0 ? score : 0.2, 1),
      matchedKeywords,
      snippet
    };
  });

  return scoredFallback
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

/**
 * Generate a snippet around the matched query
 */
function generateSnippet(
  content: string | null | undefined,
  query: string,
  maxLength: number
): string {
  if (!content) return '';
  
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);
  
  if (index === -1) {
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 150);
  
  let snippet = content.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Get all knowledge entries with Sovereign Fallback
 */
export async function getAllKnowledge(
  options: {
    category?: KnowledgeEntry['category'];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ entries: KnowledgeEntry[]; total: number }> {
  const { category, limit = 50, offset = 0 } = options;

  try {
    const db = getDb();
    if (db) {
      const whereClause = category 
        ? eq(knowledgeBase.category, category) 
        : undefined;

      const [entries, countResult] = await Promise.all([
        db
          .select()
          .from(knowledgeBase)
          .where(whereClause)
          .orderBy(desc(knowledgeBase.updatedAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(knowledgeBase)
          .where(whereClause)
      ]);

      if (entries && entries.length > 0) {
        return {
          entries: entries as KnowledgeEntry[],
          total: countResult[0]?.count || entries.length
        };
      }
    }
  } catch (error) {
    console.warn("[Knowledge] DB fetch failed or empty, serving Sovereign Knowledge Base:", error);
  }

  // Resilient fallback to Sovereign Knowledge Base
  let filtered = [...SOVEREIGN_FALLBACK_KNOWLEDGE];
  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }

  return {
    entries: filtered.slice(offset, offset + limit),
    total: filtered.length
  };
}

/**
 * Get knowledge entry by ID
 */
export async function getKnowledgeById(id: number): Promise<KnowledgeEntry | null> {
  try {
    const db = getDb();
    if (db) {
      const [entry] = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.id, id))
        .limit(1);
      
      if (entry) return entry as KnowledgeEntry;
    }
  } catch (error) {
    console.warn("[Knowledge] DB getKnowledgeById failed:", error);
  }

  return SOVEREIGN_FALLBACK_KNOWLEDGE.find(e => e.id === id) || null;
}

// Input type for creating entries (accepts arrays for keywords)
export interface CreateKnowledgeInput {
  title: string;
  titleArabic?: string;
  content: string;
  contentArabic?: string;
  category: 'law' | 'regulation' | 'policy' | 'procedure' | 'report' | 'guideline';
  source: string;
  referenceNumber?: string;
  effectiveDate?: Date;
  keywords: string[];
  keywordsArabic?: string[];
}

/**
 * Create new knowledge entry
 */
export async function createKnowledgeEntry(
  data: CreateKnowledgeInput
): Promise<KnowledgeEntry> {
  const db = getDb();
  
  const [result] = await db
    .insert(knowledgeBase)
    .values({
      title: data.title,
      titleArabic: data.titleArabic || null,
      content: data.content,
      contentArabic: data.contentArabic || null,
      category: data.category,
      source: data.source,
      referenceNumber: data.referenceNumber || null,
      effectiveDate: data.effectiveDate || null,
      keywords: JSON.stringify(data.keywords),
      keywordsArabic: data.keywordsArabic ? JSON.stringify(data.keywordsArabic) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  
  const inserted = await getKnowledgeById(result.insertId);
  if (!inserted) throw new Error('Failed to create knowledge entry');
  
  return inserted;
}

/**
 * Update knowledge entry with version tracking
 */
export async function updateKnowledgeEntry(
  id: number,
  data: Partial<KnowledgeEntry>,
  changedBy: string,
  changeDescription: string
): Promise<KnowledgeEntry> {
  const db = getDb();
  
  // Get current entry for versioning
  const current = await getKnowledgeById(id);
  if (!current) throw new Error(`Knowledge entry ${id} not found`);
  
  // Save current version
  await db.insert(documentVersions).values({
    knowledgeId: id,
    version: await getNextVersion(id),
    content: current.content,
    contentArabic: current.contentArabic,
    changedBy,
    changeDescription,
    createdAt: new Date()
  });
  
  // Update entry
  await db
    .update(knowledgeBase)
    .set({
      ...data,
      keywords: data.keywords ? JSON.stringify(data.keywords) : undefined,
      keywordsArabic: data.keywordsArabic ? JSON.stringify(data.keywordsArabic) : undefined,
      updatedAt: new Date()
    })
    .where(eq(knowledgeBase.id, id));
  
  const updated = await getKnowledgeById(id);
  if (!updated) throw new Error('Failed to update knowledge entry');
  
  return updated;
}

/**
 * Get next version number for an entry
 */
async function getNextVersion(knowledgeId: number): Promise<number> {
  const db = getDb();
  
  const [result] = await db
    .select({ maxVersion: sql<number>`COALESCE(MAX(version), 0)` })
    .from(documentVersions)
    .where(eq(documentVersions.knowledgeId, knowledgeId));
  
  return (result?.maxVersion || 0) + 1;
}

/**
 * Get version history for a knowledge entry
 */
export async function getVersionHistory(knowledgeId: number): Promise<DocumentVersion[]> {
  const db = getDb();
  
  const versions = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.knowledgeId, knowledgeId))
    .orderBy(desc(documentVersions.version));
  
  return versions as DocumentVersion[];
}

/**
 * Restore a previous version
 */
export async function restoreVersion(
  knowledgeId: number,
  version: number,
  restoredBy: string
): Promise<KnowledgeEntry> {
  const db = getDb();
  
  // Get the version to restore
  const [versionToRestore] = await db
    .select()
    .from(documentVersions)
    .where(
      and(
        eq(documentVersions.knowledgeId, knowledgeId),
        eq(documentVersions.version, version)
      )
    )
    .limit(1);
  
  if (!versionToRestore) {
    throw new Error(`Version ${version} not found for knowledge entry ${knowledgeId}`);
  }
  
  // Update with restored content
  return await updateKnowledgeEntry(
    knowledgeId,
    {
      content: versionToRestore.content,
      contentArabic: versionToRestore.contentArabic ?? undefined
    },
    restoredBy,
    `Restored from version ${version}`
  );
}

/**
 * Delete knowledge entry
 */
export async function deleteKnowledgeEntry(id: number): Promise<void> {
  const db = getDb();
  
  // Delete versions first (foreign key)
  await db
    .delete(documentVersions)
    .where(eq(documentVersions.knowledgeId, id));
  
  // Delete entry
  await db
    .delete(knowledgeBase)
    .where(eq(knowledgeBase.id, id));
}

/**
 * Build augmented prompt with knowledge context
 * Used for RAG (Retrieval Augmented Generation)
 */
export async function buildAugmentedPrompt(
  basePrompt: string,
  userQuery: string,
  options: {
    maxResults?: number;
    language?: 'arabic' | 'english' | 'both';
  } = {}
): Promise<string> {
  const { maxResults = 3, language = 'both' } = options;
  
  // Search for relevant knowledge
  const results = await searchKnowledgeBase(userQuery, {
    limit: maxResults,
    language,
    minRelevance: 0.2
  });
  
  if (results.length === 0) {
    return basePrompt;
  }
  
  // Build context section
  const contextParts = results.map((r, i) => {
    const entry = r.entry;
    const title = language === 'arabic' && entry.titleArabic 
      ? entry.titleArabic 
      : entry.title;
    const content = language === 'arabic' && entry.contentArabic
      ? entry.contentArabic
      : entry.content;
    
    return `[${i + 1}] ${title} (${entry.source}):\n${r.snippet}`;
  });
  
  const contextSection = language === 'arabic'
    ? `\n\nالسياق ذو الصلة:\n${contextParts.join('\n\n')}`
    : `\n\nRelevant Context:\n${contextParts.join('\n\n')}`;
  
  return basePrompt + contextSection;
}

/**
 * Seed knowledge base with sample legal documents
 * Run this during initial setup
 * 
 * NOTE: Only seeds in GOV_DEMO_MODE. In PUBLIC_MODE, demo content
 * should not be present.
 */
export async function seedKnowledgeBase(): Promise<void> {
  // ═══════════════════════════════════════════════════════════════
  // MODE CHECK: Only seed demo content in GOV_DEMO_MODE
  // ═══════════════════════════════════════════════════════════════
  const govDemoMode = process.env.GOV_DEMO_MODE === "true";
  const publicMode = process.env.PUBLIC_MODE === "true";
  
  if (!govDemoMode || publicMode) {
    console.log("⏭️  Skipping demo seed data (PUBLIC_MODE or GOV_DEMO_MODE not enabled)");
    console.log("   Set GOV_DEMO_MODE=true and PUBLIC_MODE=false to seed demo content.");
    return;
  }
  
  checkInternalNotesMode();
  const db = getDb();
  
  const documents = [
    {
      title: 'Sample Audit Law - Financial Oversight',
      titleArabic: 'قانون الرقابة المالية - نموذج',
      content: `The Audit Authority has legal personality and financial and administrative independence...`,
      contentArabic: `جهاز الرقابة له الشخصية الاعتبارية والاستقلال المالي والإداري...`,
      category: 'law' as const,
      source: 'Official Gazette',
      referenceNumber: 'SAMPLE-001',
      keywords: ['audit', 'financial oversight', 'administrative oversight', 'governance'],
      keywordsArabic: ['رقابة', 'مالية', 'إدارية', 'حوكمة']
    },
    {
      title: 'Sample Decree - Protection of Public Funds',
      titleArabic: 'مرسوم نموذجي - حماية المال العام',
      content: `Public funds are inviolable and must be preserved. Article 4 establishes the sanctity of public funds...`,
      contentArabic: `للأموال العامة حرمتها ويجب المحافظة عليها. المادة 4 تنص على حرمة المال العام...`,
      category: 'law' as const,
      source: 'Official Gazette',
      referenceNumber: 'SAMPLE-002',
      keywords: ['public funds', 'embezzlement', 'conflict of interest', 'bribery'],
      keywordsArabic: ['مال عام', 'اختلاس', 'تضارب مصالح', 'رشوة']
    }
    // Add more documents as needed
  ];

  for (const doc of documents) {
    try {
      await createKnowledgeEntry(doc);
      console.log(`✅ Seeded: ${doc.title}`);
    } catch (error) {
      console.error(`Failed to seed ${doc.title}:`, error);
    }
  }
}
