# ERTH Knowledge-Base Build Handover

## Ingestion sequence
1. Register file and compute SHA-256.
2. Capture authority, owner, date, language, classification and version.
3. Extract text, tables and images while preserving page references.
4. Split by semantic section, not arbitrary token count.
5. Classify chunks by regulation, strategy, zone, investment, finance, operations, infrastructure, labour, health/pharma, benchmark or risk.
6. Map facts to canonical entities and metrics.
7. Run unit, currency, period, duplicate and contradiction checks.
8. Require human approval for material figures and policy interpretation.
9. Publish approved facts; preserve rejected and superseded values.
10. Re-index only changed content.

## Minimum chunk metadata
`document_id, chunk_id, title, section, page_start, page_end, language, authority, classification, source_date, valid_from, valid_to, evidence_status, confidence, reviewer, sha256, tags, entities, metric_ids`

## Retrieval policy
- Prefer current official Oman and OPAZ sources.
- Filter by access rights before retrieval.
- Return citations with every material claim.
- Distinguish verified, documented, simulated, proposed and assumed evidence.
- Never fill absent figures without an explicit estimate label.

## Stores
- Object store: originals and rendered pages.
- PostgreSQL: canonical metadata, facts, metrics and approvals.
- Vector index: evidence discovery.
- Knowledge graph: zones, projects, investors, sectors, institutions and dependencies.
- Immutable audit store: ingestion, model, calculation, approval and export events.

## Evaluation
Create golden question sets for each zone, sector, law, KPI and workflow. Test citation correctness, retrieval recall, numeric consistency, Arabic quality, access control, freshness and refusal when evidence is absent.
