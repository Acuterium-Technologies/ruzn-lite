# RUZN.AI Legal Document Parsing Report

**Platform:** RUZN-ASI (Acuterium Neural Shard)  
**Jurisdiction:** Sultanate of Oman / GCC  
**Report Generated:** 2026-03-09T12:00:00Z  
**Parsed By:** Claude (Perplexity Computer)  
**Schema Version:** RUZN Legal Document Schema v1.0.0  

---

## Executive Summary

This report documents the parsing of 7 Omani legal source documents into the RUZN.AI Legal Document Schema v1.0.0. The documents span from 1999 to 2024 and cluster around two foundational Omani legal instruments: the Criminal Procedures Law (Royal Decree 97/99) and the Public Prosecution Law (Royal Decree 99/92). Three royal decrees amend specific articles of the Criminal Procedures Law. Two additional documents provide analytical and reference context.

**Total documents parsed:** 7  
**Full text extracted:** 5 (complete)  
**Placeholder/minimal:** 2 (awaiting full extraction)  
**Average confidence score:** 80.0%  
**Schema compliance:** 100% (all required fields present)

---

## Schema Design

### File: `RUZN_LEGAL_SCHEMA_V1.json`

The RUZN.AI Legal Document Schema v1.0.0 was designed from scratch to serve as the canonical schema for the RUZN-ASI sovereign legal AI platform. It was built by combining:

1. **Banaa parsing patterns** from the existing `EXTRACTION_OUTPUT_SCHEMA.json` (Acuterium extraction conventions, entity metadata, confidence scoring)
2. **DB field mapping patterns** from `Schema_Mapping_Output.json` (record_id, article_number, text, status fields)
3. **Legal domain taxonomy** from `schema_templates.json` (domains: civil_law, criminal_law, commercial_law, etc.)
4. **Omani legal document requirements** specific to the GCC/Oman legal system (decree numbering, Hijri/Gregorian dual dating, Official Gazette references, Sharia cross-references)

#### Key Schema Features

| Feature | Implementation |
|---|---|
| Unique ID format | `RUZN-{TYPE_CODE}-{YEAR}-{NUMBER}` |
| Document types | 8 types (royal_decree, law, regulation, ministerial_decision, circular, gazette_entry, legal_commentary, reference_link) |
| Legal domains | 14 domains including public_prosecution, judicial_procedures, sharia_law |
| Dual dating | Hijri + Gregorian year and full date fields |
| Article structure | Nested array with Arabic + English text, amends_article, is_new flag |
| Cross-references | Typed relationships (amends, cites, supersedes, repeals, related, implements) |
| Bilingual search | keywords_ar + keywords_en arrays |
| Vector embeddings | embedding_ready flag + embedding_chunks with model/dimensions |
| PostgreSQL ready | Full SQL DDL for 5 tables in postgres_design_notes |
| RAG config | Chunk size 500 tokens, 50-token overlap, pgvector dimensions 1536 |
| Acuterium integration | Neural shard assignment, hierarchy path, related schemas listed |

#### PostgreSQL Tables

```sql
-- 5 tables for full relational storage
ruzn_legal_documents          -- main document metadata
ruzn_legal_articles           -- FK → document_id, normalized articles
ruzn_legal_cross_references   -- FK → document_id, typed relationships
ruzn_legal_keywords           -- FK → document_id, lang ('ar'|'en')
ruzn_legal_embeddings         -- FK → document_id, pgvector(1536) for RAG
```

---

## Documents Parsed

### 1. Royal Decree 2020/120
**File:** `royal_decree_2020_120.json`  
**ID:** `RUZN-RD-2020-120`  
**Date:** 12 October 2020 / 24 Safar 1442 AH  
**Issuer:** Sultan Haitham bin Tariq  
**Gazette:** Issue 1362  
**Legal Domain:** judicial_procedures  
**Confidence:** 98.5%  

**What it does:**  
Amends Article 221, paragraph 2 of the Criminal Procedures Law (97/99). Introduces two mandatory safeguards before a death penalty (حكم الإعدام) can be issued:
- The Criminal Court must reach a **unanimous decision** (إجماع الآراء). If not unanimous → sentence automatically reduced to life imprisonment (السجن المطلق).
- Before sentencing, the court must send case papers to a **committee chaired by the Grand Mufti** (or deputy) + 2 Sharia experts, who have **60 days** to provide a religious opinion.

**Articles extracted:** 2 (operative articles)  
**Source:** `output_mmj4rscx.json` (structured JSON, high quality)  

---

### 2. Royal Decree 2022/69
**File:** `royal_decree_2022_069.json`  
**ID:** `RUZN-RD-2022-069`  
**Date:** 20 October 2022 / 24 Rabi Al-Awwal 1444 AH  
**Issuer:** Sultan Haitham bin Tariq  
**Gazette:** Issue 1464  
**Legal Domain:** judicial_procedures  
**Confidence:** 99.0%  

**What it does:**  
Replaces full texts of Articles 4bis (مكررا) and 164 of the Criminal Procedures Law (97/99):

- **Article 4bis:** Persons harmed by crimes under **Article 230 of the Penal Code** (Royal Decree 7/2018) may file civil cases **directly with the competent court**, bypassing the Public Prosecution as initiator. The court secretariat must still notify the Public Prosecution. Special permission from the **Council of Ministers** is required before suing heads of state administrative units.
- **Article 164:** Updated notification/summons procedures — specifying service channels for state officials, prisoners, military personnel; imposing a **50 OMR fine** for refusal to acknowledge receipt; granting parties the right to inspect case files upon service of summons.

**Articles extracted:** 2 (operative articles + embedded full replacement text)  
**Source:** `output_mmj4nb5f.json` (full Arabic text, 2-page PDF extracted)  

---

### 3. Royal Decree 2024/18
**File:** `royal_decree_2024_018.json`  
**ID:** `RUZN-RD-2024-018`  
**Date:** 25 March 2024 / 14 Ramadan 1445 AH  
**Issuer:** Sultan Haitham bin Tariq  
**Gazette:** Issue 1539  
**Legal Domain:** judicial_procedures  
**Confidence:** 99.0%  

**What it does:**  
Adds a **new paragraph at the end of Article 31** of the Criminal Procedures Law (97/99). The new paragraph authorizes the **Minister of Justice and Legal Affairs** to grant **judicial police powers (صفة الضبطية القضائية)** to certain inspection unit employees of security and safety service institutions — upon request from the head of the relevant regulatory body — within the scope of applicable laws.

**Articles extracted:** 3 (2 operative + 1 appended amendment text)  
**Source:** `output_mmj4pvlv.json` + `royal-decree-2024-018-full-text.txt`  

---

### 4. Public Prosecution Law (قانون الادعاء العام)
**File:** `public_prosecution_law_99_92.json`  
**ID:** `RUZN-LW-1999-92`  
**Date:** 21 November 1999 / 13 Sha'ban 1420 AH  
**Issuer:** Sultan Qaboos bin Said  
**Legal Domain:** public_prosecution  
**Confidence:** 97.5%  

**What it does:**  
Establishes the **Public Prosecution (الادعاء العام)** as an independent institutional body separate from the Royal Oman Police. Core provisions:

| Article(s) | Subject |
|---|---|
| Decree Art. 1 | Establishes the independent Public Prosecution body |
| Art. 1 | Handles public prosecution on behalf of society; supervises judicial police |
| Art. 2 | Royal Oman Police retains jurisdiction over misdemeanors |
| Art. 5 | 7-tier hierarchy: Prosecutor General → Prosecution Assistants |
| Art. 7 | Appointments by Inspector General (senior posts by Royal Decree) |
| Art. 8 | Equated to judges in salary and employment rules |
| Art. 9 | Judicial immunity (except Prosecution Assistants) |
| Arts. 11 | Oath of office before the Sultan |
| Arts. 12-14 | Internal Inspection Directorate |
| Art. 15 | Disciplinary proceedings follow judicial rules |
| Arts. 19-20 | Supreme Court and Courts of Appeal prosecution offices |
| Art. 24 | Sultan exercises Administrative Affairs Council powers during transition |
| Art. 25 | Prosecutor General appoints secretarial/translation staff |

**Articles extracted:** 31 (6 decree articles + 25 law articles) — complete  
**Source:** `output_mmj4oqjh.json` + `قانون_الادعاء_العام_full_text.txt` (8,796 bytes, 7 pages)  

---

### 5. Legal Commentary — Statute of Limitations
**File:** `legal_commentary_statute_limitations.json`  
**ID:** `RUZN-LC-2024-001`  
**Type:** legal_commentary  
**Sources:** Qanoon.om (قانون.عُمان), Eastlaws  
**Legal Domain:** public_prosecution  
**Confidence:** 95.0%  

**What it covers:**  
Secondary legal commentary analyzing **Article 15 of the Criminal Procedures Law** — grounds for expiry of public prosecution cases:

| Ground | Detail |
|---|---|
| Death of accused | Expires at any stage |
| General Royal Pardon | By Sultan's Decree |
| Statute of limitations | Felonies: 20 years; Misdemeanors: 3 years; Violations: 1 year |
| Withdrawal of complaint | In applicable crime categories |
| Final judgment | Res judicata |
| Repeal of criminal provision | New law decriminalizes the act |

Additional coverage: interruption of limitation by investigative acts; no suspension possible; special rule for government employee crimes (embezzlement, bribery — limitation starts from end of service); exceptions for state security crimes; confiscation survives expiry of prosecution.

**Articles extracted:** 3 sections  
**Source:** `file1_content.txt` (2.62 KB Arabic .txt file from OneDrive)  

---

### 6. Reference Link — Temporal Protection
**File:** `reference_link_temporal_protection.json`  
**ID:** `RUZN-RL-2024-001`  
**Type:** reference_link  
**Source:** law-yuosif.com  
**Confidence:** 40.0%  

**Status:** Minimal parse. Source was a 221-byte `.txt` file containing only a URL:  
`https://law-yuosif.com/ملف-الحماية-الزمنية-دليل-المحافظة-على/`  

Article content not extracted. URL decoded title suggests coverage of temporal protection (الحماية الزمنية) strategies for preserving legal rights. **Recommended action:** Fetch the URL directly to extract full article content and re-parse as `legal_commentary`.

---

### 7. Criminal Procedures Law 97/99 (PLACEHOLDER)
**File:** `criminal_procedures_law_97_99_placeholder.json`  
**ID:** `RUZN-LW-1999-97`  
**Type:** law (placeholder)  
**Status:** PLACEHOLDER  
**Confidence:** 30.0%  

**Status:** The source PDF (`royal-decree-1999-097.pdf`, 11.8 MB) was too large for the current extraction batch. This placeholder entry captures all metadata inferrable from cross-references in the three amendment decrees. Known amended articles: 15, 31, 70, 71, 164, 221, 4bis.

**Extraction priority: HIGH**  
**Recommended extraction method:** Chunked PDF processing with Arabic OCR (Tesseract + arabic-reshaper/python-bidi, or Azure Form Recognizer). Split into chapter-level chunks of ~500KB for sequential processing.

---

## Cross-Reference Map

```
RUZN-LW-1999-97 (Criminal Procedures Law 97/99)
├── Amended by RUZN-RD-2020-120 → Article 221 para 2 (death penalty)
├── Amended by RUZN-RD-2022-069 → Articles 4bis and 164
└── Amended by RUZN-RD-2024-018 → Article 31 new paragraph

RUZN-LW-1999-92 (Public Prosecution Law 99/92)
├── Cites: Basic Law (RD 96/101), Police Law (RD 90/35)
├── Cites: Royal Oman Police Structure (RD 91/89)
├── Cites: Judicial Authority Law (RD 99/90)
└── Related: Criminal Procedures Law (RD 97/99)

RUZN-RD-2022-069
└── Also cites: Penal Code Article 230 (RD 7/2018) for direct victim filing

RUZN-LC-2024-001
└── Analyzes: Article 15 of Criminal Procedures Law (97/99)

RUZN-RL-2024-001
└── Related topic: Temporal protection / statute of limitations
```

---

## Quality Assessment

| Document | Full Text | Articles | Cross-refs | Confidence |
|---|---|---|---|---|
| RD 2020/120 | ✅ Complete | 2/2 | 2 | 98.5% |
| RD 2022/69 | ✅ Complete | 2/2 | 5 | 99.0% |
| RD 2024/18 | ✅ Complete | 3/3 | 2 | 99.0% |
| PP Law 99/92 | ✅ Complete | 31/31 | 5 | 97.5% |
| Legal Commentary | ✅ Complete | 3 sections | 2 | 95.0% |
| Reference Link | ⚠️ URL only | 0 | 1 | 40.0% |
| CPL 97/99 Placeholder | ❌ Pending | 0 | 5 | 30.0% |

**Overall parsing quality: GOOD**  
5 of 7 documents are fully extracted. 2 require follow-up work.

---

## Outstanding Action Items

| Priority | Item | Effort |
|---|---|---|
| HIGH | Extract full text of Criminal Procedures Law 97/99 (11.8 MB PDF) | Large |
| MEDIUM | Fetch and parse law-yuosif.com article on temporal protection | Small |
| MEDIUM | Generate vector embeddings for all 5 complete documents | Medium |
| LOW | Determine exact gazette date for RD 2020/120 (Gazette Issue 1362) | Small |
| LOW | Determine exact gazette date for RD 2022/69 (Gazette Issue 1464) | Small |
| LOW | Determine exact gazette date for PP Law 99/92 | Small |
| LOW | Set `embedding_ready: true` after embedding generation | Automated |

---

## Output Files

| File | Size | Description |
|---|---|---|
| `RUZN_LEGAL_SCHEMA_V1.json` | 17.8 KB | Full JSON Schema definition |
| `royal_decree_2020_120.json` | 6.6 KB | RD 2020/120 parsed document |
| `royal_decree_2022_069.json` | 10.4 KB | RD 2022/69 parsed document |
| `royal_decree_2024_018.json` | 6.4 KB | RD 2024/18 parsed document |
| `public_prosecution_law_99_92.json` | 24.5 KB | PP Law 99/92 — all 31 articles |
| `legal_commentary_statute_limitations.json` | 9.4 KB | Statute of limitations commentary |
| `reference_link_temporal_protection.json` | 3.5 KB | URL reference entry |
| `criminal_procedures_law_97_99_placeholder.json` | 6.0 KB | CPL 97/99 placeholder |
| `RUZN_ALL_DOCUMENTS.json` | 87.6 KB | All 7 documents combined |
| `RUZN_PARSING_REPORT.md` | This file | Parsing summary report |

---

## Schema Usage Notes for RUZN-ASI

### PostgreSQL Ingestion
```sql
-- Index recommendations for production
CREATE INDEX idx_ruzn_docs_type ON ruzn_legal_documents(document_type);
CREATE INDEX idx_ruzn_docs_domain ON ruzn_legal_documents(legal_domain);
CREATE INDEX idx_ruzn_docs_year ON ruzn_legal_documents(year_gregorian);
CREATE INDEX idx_ruzn_docs_status ON ruzn_legal_documents(status);
CREATE INDEX idx_ruzn_docs_parent ON ruzn_legal_documents(parent_decree);
CREATE INDEX idx_ruzn_fulltext_ar ON ruzn_legal_documents USING gin(to_tsvector('arabic', full_text_ar));
CREATE INDEX idx_ruzn_summary_en ON ruzn_legal_documents USING gin(to_tsvector('english', summary_en));
CREATE INDEX idx_ruzn_embeddings_vec ON ruzn_legal_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### RAG Search Strategy
1. For Arabic queries: search `keywords_ar` + trigram match on `full_text_ar`
2. For English queries: search `keywords_en` + FTS on `summary_en`
3. For semantic search: cosine similarity on pgvector embeddings
4. For amendment tracing: query `parent_decree` + `cross_references` join
5. For domain filtering: pre-filter by `legal_domain` before vector search

### Acuterium Integration
- Neural Shard: `RUZN-ASI`
- All documents tagged `embedding_ready: false` — set to `true` after batch embedding run
- Embedding model: `text-embedding-3-small` (1536 dims)
- Chunk strategy: 500 tokens with 50-token overlap, bilingual (Arabic + English summary prefix per chunk)

---

*Report generated by RUZN-ASI Legal Document Parser v1.0.0 | Powered by Acuterium / Perplexity Computer*
