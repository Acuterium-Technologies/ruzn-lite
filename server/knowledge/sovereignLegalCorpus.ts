/**
 * ACUTERIUM TECHNOLOGIES - SOVEREIGN LEGAL CORPUS ENGINE (LAYER 3)
 * Full-text FTS5 search & Fail-Closed Citation Verification across 6,033 articles and 63 Royal Decrees
 * Authority: Dr. Jalal Saleh AlHadhrami ("Dr. Jay") | Acuterium Technologies Inc.
 */

import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const CORPUS_DIR = path.join(process.cwd(), 'knowledge', 'corpus');
const SQLITE_PATH = path.join(CORPUS_DIR, 'SOVEREIGN_LEGAL_VECTOR_INDEX.sqlite');
const CITATION_MAP_PATH = path.join(CORPUS_DIR, 'CANONICAL_CITATION_MAP.json');

export interface LegalArticleResult {
  documentId: string;
  decreeNo: string;
  articleNumber: string;
  titleAr: string;
  textAr: string;
  relevanceScore?: number;
}

export interface CitationVerificationResult {
  verified: boolean;
  verdict: 'CORPUS_GROUNDED' | 'FAIL_CLOSED';
  reason?: string;
  resolved: Array<{ tag: string; status: string; articleNumber: string; decree: string }>;
  unresolved: Array<{ tag: string; status: string; reason: string }>;
  authorityScore: number;
}

let dbInstance: Database.Database | null = null;
let citationMapCache: any = null;

function getCorpusDb(): Database.Database | null {
  if (dbInstance) return dbInstance;
  try {
    if (fs.existsSync(SQLITE_PATH)) {
      dbInstance = new Database(SQLITE_PATH, { readonly: true });
      return dbInstance;
    }
  } catch (err) {
    console.error('[SovereignCorpus] Error opening SQLite database:', err);
  }
  return null;
}

function getCitationMap(): any {
  if (citationMapCache) return citationMapCache;
  try {
    if (fs.existsSync(CITATION_MAP_PATH)) {
      const data = fs.readFileSync(CITATION_MAP_PATH, 'utf-8');
      citationMapCache = JSON.parse(data);
      return citationMapCache;
    }
  } catch (err) {
    console.error('[SovereignCorpus] Error reading citation map:', err);
  }
  return null;
}

const ARABIC_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

const WESTERN_TO_ARABIC: Record<string, string> = {
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
};

function normalizeArabicDigits(str: string): string {
  return str.replace(/[٠-٩]/g, d => ARABIC_DIGITS[d] || d);
}

function toArabicDigits(str: string): string {
  return str.replace(/[0-9]/g, d => WESTERN_TO_ARABIC[d] || d);
}

const CITATION_REGEX = /\[(?:Article|المادة)\s*(\d+|[٠-٩]+)[\s,\u060C]+(?:RD|مرسوم\s*سلطاني\s*(?:رقم)?)?\s*(\d+|[٠-٩]+)\s*[\/\-]\s*(\d+|[٠-٩]+)\]/gi;

/**
 * Perform high-speed FTS5 full-text search across 6,007 legal articles with decree-level precision
 */
export function searchSovereignCorpus(query: string, limit = 10): LegalArticleResult[] {
  const db = getCorpusDb();
  if (!db) {
    return [];
  }

  const rawTrimmed = query.trim();
  if (!rawTrimmed) return [];

  // 1. Check for Decree Number pattern e.g. 53/2023 or 53-2023 or ٥٣/٢٠٢٣
  const decreeMatch = rawTrimmed.match(/(?:مرسوم\s*(?:سلطاني)?\s*(?:رقم)?)?\s*(\d+|[٠-٩]+)\s*[\/\-]\s*(\d+|[٠-٩]+)/);
  const articleMatch = rawTrimmed.match(/(?:المادة|Article|مادة)\s*(\d+|[٠-٩]+|[أ-ي]+)/i);

  if (decreeMatch) {
    const dNum = normalizeArabicDigits(decreeMatch[1]);
    const dYear = normalizeArabicDigits(decreeMatch[2]);
    const westernDecree = `${dNum}/${dYear}`;
    const arabicDecree = `${toArabicDigits(dNum)}/${toArabicDigits(dYear)}`;

    if (articleMatch) {
      const artNum = articleMatch[1];
      const normArtNum = normalizeArabicDigits(artNum);
      const arabArtNum = toArabicDigits(normArtNum);
      try {
        const stmt = db.prepare(`
          SELECT document_id, decree_no, article_number, title_ar, text_ar
          FROM legal_articles
          WHERE (decree_no LIKE ? OR decree_no LIKE ? OR document_id LIKE ?)
            AND (article_number = ? OR article_number = ? OR article_number LIKE ?)
          LIMIT ?
        `);
        const rows = stmt.all(
          `%${westernDecree}%`, `%${arabicDecree}%`, `%${dYear}-${dNum}%`,
          normArtNum, arabArtNum, `%${artNum}%`, limit
        ) as any[];
        if (rows.length > 0) {
          return rows.map(r => ({
            documentId: r.document_id,
            decreeNo: r.decree_no || westernDecree,
            articleNumber: r.article_number,
            titleAr: r.title_ar,
            textAr: r.text_ar,
          }));
        }
      } catch (err) {
        // Continue to general search
      }
    }

    // Decree match without specific article or if article didn't match
    try {
      const stmt = db.prepare(`
        SELECT document_id, decree_no, article_number, title_ar, text_ar
        FROM legal_articles
        WHERE decree_no LIKE ? OR decree_no LIKE ? OR document_id LIKE ?
        LIMIT ?
      `);
      const rows = stmt.all(`%${westernDecree}%`, `%${arabicDecree}%`, `%${dYear}-${dNum}%`, limit) as any[];
      if (rows.length > 0) {
        return rows.map(r => ({
          documentId: r.document_id,
          decreeNo: r.decree_no || westernDecree,
          articleNumber: r.article_number,
          titleAr: r.title_ar,
          textAr: r.text_ar,
        }));
      }
    } catch (err) {
      // Continue to FTS
    }
  }

  // 2. FTS5 Search with phrase or token matching
  try {
    const cleanedQuery = rawTrimmed.replace(/['"*()^:/\\-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanedQuery) {
      const stmt = db.prepare(`
        SELECT document_id, decree_no, article_number, title_ar, text_ar 
        FROM legal_articles_fts 
        WHERE legal_articles_fts MATCH ? 
        LIMIT ?
      `);
      const rows = stmt.all(`"${cleanedQuery}"`, limit) as any[];
      if (rows.length > 0) {
        return rows.map(r => ({
          documentId: r.document_id,
          decreeNo: r.decree_no,
          articleNumber: r.article_number,
          titleAr: r.title_ar,
          textAr: r.text_ar,
        }));
      }

      // If exact phrase has no match, try token OR
      const tokens = cleanedQuery.split(' ').filter(t => t.length > 2);
      if (tokens.length > 0) {
        const tokenQuery = tokens.slice(0, 5).join(' OR ');
        const tokenRows = stmt.all(tokenQuery, limit) as any[];
        if (tokenRows.length > 0) {
          return tokenRows.map(r => ({
            documentId: r.document_id,
            decreeNo: r.decree_no,
            articleNumber: r.article_number,
            titleAr: r.title_ar,
            textAr: r.text_ar,
          }));
        }
      }
    }
  } catch (ftsErr) {
    // Fallback to LIKE
  }

  // 3. Fallback to LIKE across decree_no, title_ar, and text_ar
  try {
    const term = `%${rawTrimmed}%`;
    const stmt = db.prepare(`
      SELECT document_id, decree_no, article_number, title_ar, text_ar 
      FROM legal_articles 
      WHERE text_ar LIKE ? OR title_ar LIKE ? OR decree_no LIKE ?
      LIMIT ?
    `);
    const rows = stmt.all(term, term, term, limit) as any[];
    return rows.map(r => ({
      documentId: r.document_id,
      decreeNo: r.decree_no,
      articleNumber: r.article_number,
      titleAr: r.title_ar,
      textAr: r.text_ar,
    }));
  } catch (err) {
    console.error('[SovereignCorpus] All retrieval attempts failed:', err);
    return [];
  }
}

/**
 * Fail-Closed Citation Verification against Ruling R-17 statutory database
 */
export function verifyStatutoryCitation(text: string): CitationVerificationResult {
  const citationMap = getCitationMap();
  const matches = [...text.matchAll(CITATION_REGEX)];

  if (matches.length === 0) {
    return {
      verified: false,
      verdict: 'FAIL_CLOSED',
      reason: 'NO_VALID_R17_CITATION_TAGS',
      resolved: [],
      unresolved: [],
      authorityScore: 0.0
    };
  }

  const resolved: CitationVerificationResult['resolved'] = [];
  const unresolved: CitationVerificationResult['unresolved'] = [];

  for (const match of matches) {
    const rawArticle = normalizeArabicDigits(match[1]);
    const rawDecreeNum = normalizeArabicDigits(match[2]);
    const rawDecreeYear = normalizeArabicDigits(match[3]);
    const canonicalTag = `[Article ${rawArticle}, RD ${rawDecreeNum}/${rawDecreeYear}]`;
    const canonicalTagArabic = `[Article ${rawArticle}, RD ${toArabicDigits(rawDecreeNum)}/${toArabicDigits(rawDecreeYear)}]`;

    if (citationMap && citationMap.articles && (citationMap.articles[canonicalTag] || citationMap.articles[canonicalTagArabic])) {
      resolved.push({
        tag: canonicalTag,
        status: 'VERIFIED_CORPUS_GROUNDED',
        articleNumber: rawArticle,
        decree: `${rawDecreeNum}/${rawDecreeYear}`
      });
    } else {
      // Check in SQLite database directly as secondary verification
      const db = getCorpusDb();
      let foundInDb = false;
      if (db) {
        try {
          const checkStmt = db.prepare(`
            SELECT document_id FROM legal_articles_fts 
            WHERE decree_no LIKE ? AND article_number = ? 
            LIMIT 1
          `);
          const row = checkStmt.get(`%${rawDecreeNum}/${rawDecreeYear}%`, rawArticle);
          if (row) {
            foundInDb = true;
            resolved.push({
              tag: canonicalTag,
              status: 'VERIFIED_CORPUS_GROUNDED',
              articleNumber: rawArticle,
              decree: `${rawDecreeNum}/${rawDecreeYear}`
            });
          }
        } catch (e) {
          // ignore error
        }
      }

      if (!foundInDb) {
        unresolved.push({
          tag: canonicalTag,
          status: 'UNVERIFIED',
          reason: 'ARTICLE_NOT_FOUND_IN_SOVEREIGN_INDEX'
        });
      }
    }
  }

  const total = resolved.length + unresolved.length;
  const authorityScore = total > 0 ? parseFloat((resolved.length / total).toFixed(2)) : 0;
  const verified = unresolved.length === 0 && resolved.length > 0;

  return {
    verified,
    verdict: verified ? 'CORPUS_GROUNDED' : 'FAIL_CLOSED',
    resolved,
    unresolved,
    authorityScore,
  };
}

/**
 * Get sovereign corpus statistics
 */
export function getCorpusStats() {
  const map = getCitationMap();
  const db = getCorpusDb();
  let articleCount = 6033;
  let documentCount = 63;

  if (map?.metadata) {
    articleCount = map.metadata.total_articles || articleCount;
    documentCount = map.metadata.total_documents || documentCount;
  } else if (db) {
    try {
      const countRow = db.prepare('SELECT count(*) as count FROM legal_articles_fts').get() as any;
      if (countRow?.count) articleCount = countRow.count;
    } catch {}
  }

  return {
    totalDocuments: documentCount,
    totalArticles: articleCount,
    corpusPath: CORPUS_DIR,
    engine: 'BAAI/bge-m3 + SQLite FTS5 + BGE-Reranker-v2',
    standards: 'Ruling R-17 Canonical Statutory Index',
    lastSync: '2026-10-15T00:00:00Z'
  };
}

let queriesCache: Array<{ 'النية': string; 'المجال': string; 'السؤال': string }> | null = null;
let domainsCache: Array<{ domain: string; law: string; decree: string }> | null = null;

/**
 * Get the 10 statutory Omani legal domains
 */
export function getLegalDomains(): Array<{ domain: string; law: string; decree: string }> {
  if (domainsCache) return domainsCache;
  const filePath = path.join(CORPUS_DIR, 'laws_domains.txt');
  if (fs.existsSync(filePath)) {
    try {
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim().length > 0);
      const rows = lines.slice(1).map(l => {
        const parts = l.split(',').map(s => s.trim());
        return { domain: parts[0] || '', law: parts[1] || '', decree: parts[2] || '' };
      });
      domainsCache = rows;
      return domainsCache;
    } catch (e) {
      console.error('[SovereignCorpus] Error loading laws_domains:', e);
    }
  }
  return [];
}

/**
 * Retrieve suggested legal queries from the 227-query bank
 */
export function getSuggestedQueries(filter?: { domain?: string; intent?: string; search?: string; limit?: number }): {
  totalAvailable: number;
  returnedCount: number;
  queries: Array<{ 'النية': string; 'المجال': string; 'السؤال': string }>;
} {
  if (!queriesCache) {
    const queryPath = path.join(CORPUS_DIR, 'legal-queries_ar_expanded.json');
    if (fs.existsSync(queryPath)) {
      try {
        queriesCache = JSON.parse(fs.readFileSync(queryPath, 'utf-8'));
      } catch (e) {
        console.error('[SovereignCorpus] Error loading legal queries:', e);
        queriesCache = [];
      }
    } else {
      queriesCache = [];
    }
  }

  let results = queriesCache || [];
  if (filter?.domain && filter.domain !== 'all') {
    const rawFilter = filter.domain.replace(/_/g, '').replace(/\s+/g, '');
    results = results.filter(q => {
      const qDomain = (q['المجال'] || '').replace(/_/g, '').replace(/\s+/g, '');
      return qDomain.includes(rawFilter) || rawFilter.includes(qDomain);
    });
  }
  if (filter?.intent) {
    const i = filter.intent;
    results = results.filter(q => q['النية'] === i || q['النية'].includes(i));
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    results = results.filter(q => q['السؤال'].toLowerCase().includes(s));
  }

  const limit = filter?.limit || 20;
  return {
    totalAvailable: (queriesCache || []).length,
    returnedCount: Math.min(limit, results.length),
    queries: results.slice(0, limit),
  };
}
