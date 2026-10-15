# RUZN.AI Layered Model-and-Agent Matrix

**Canonical Acuterium Reference Architecture Pack**

This document defines the formal RUZN.AI layered model-and-agent matrix, operating-mode policy framework, model assignment logic, and canonical Acuterium reference architecture. It is written as a sovereign-first legal intelligence architecture standard for internal Acuterium use and downstream implementation.[page:17][file:31][file:35]

## Purpose

RUZN.AI is best implemented as a layered legal intelligence system rather than a single-model assistant, because the approved architecture already separates user interaction, orchestration, cognition, knowledge, and infrastructure into distinct tiers coordinated by Q-ARC and governed by Acuterium protocols.[file:31][file:35] The current models repository contains a mixed intake set of open-source candidates, including code-llama, deepseek-moe, DeepSeek-R1-Distill-Qwen-14B-Uncensored, llama-3, MythoMax-L2-13B-Uncensored, Pygmalion-2-13B-Uncensored, and Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, which should be treated as a candidate bank rather than a production-approved legal stack.[page:17]

## Architectural principles

RUZN.AI should remain Arabic-first, sovereign-first, retrieval-grounded, protocol-governed, and self-improving through controlled feedback rather than uncontrolled self-modification.[file:31][file:35] External frontier models may exist only inside tightly bounded hybrid escalation lanes, while primary legal reasoning, citation grounding, and sensitive matter handling should remain inside Acuterium-controlled infrastructure.[file:31][file:35]

## Golden Acuterium ranking schema

The model-ranking framework for RUZN.AI should use weighted operational criteria instead of raw benchmark prestige, because legal deployment quality depends on controllability and sovereignty as much as raw reasoning.[file:31][file:35]

| Criterion | Description | Weight | Notes |
|---|---|---:|---|
| Arabic professionalism | Ability to produce formal, professional legal Arabic | 15 | Core for RUZN mission |
| Arabic dialect recognition | Ability to normalize GCC/Omani dialect into legal register | 8 | Important for intake and adaptation |
| Legal-domain controllability | Suitability for legal fine-tuning and citation discipline | 15 | High-risk domain requirement |
| Reasoning depth | Multi-step legal and policy reasoning performance | 12 | Critical for analysis and RIA |
| Sovereign deployability | Ability to host, quantize, and operate locally | 12 | Essential for sovereign mode |
| Guardrail governability | Responsiveness to APMS, PSI-DOMINION, and policy overlays | 10 | Important for QA enforcement |
| RAG compatibility | Reliability when grounded on vector/KG retrieval | 8 | Mandatory for answer traceability |
| Structured output discipline | JSON, tables, workflow outputs, and deterministic formatting | 6 | Important for enterprise flows |
| Cost-efficiency | Inference footprint relative to output value | 6 | Matters for scale |
| Cross-shard interoperability | Suitability for Q-ARC, CogniMesh, and AcutLinks workflows | 8 | Important for Acuterium ecosystem |

## Candidate model inventory

The current visible model inventory in the shared OneDrive models folder is shown below.[page:17]

| Candidate model/folder | Visible status | Intake classification | RUZN suitability |
|---|---|---|---|
| code-llama | 1 item [page:17] | Engineering support candidate | Limited to developer/copilot sublayer |
| deepseek-moe | 1 item [page:17] | R&D candidate | Possible future routed specialist |
| DeepSeek-R1-Distill-Qwen-14B-Uncensored | 2 items [page:17] | High-value reasoning candidate | Strong legal reasoning/RIA core candidate |
| llama-3 | 0 items [page:17] | Undefined placeholder | Cannot assign until exact checkpoint is known |
| MythoMax-L2-13B-Uncensored | 6 items [page:17] | Conversational/uncensored candidate | Not recommended for professional legal core |
| Pygmalion-2-13B-Uncensored | 1 item [page:17] | Conversational/roleplay candidate | Exclude from legal production stack |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 0 items [page:17] | Bilingual base candidate | Strong front-line assistant/drafting candidate after domestication |

## Candidate scoring matrix

The following scoring matrix applies the Golden Acuterium ranking logic to the visible candidate set. Scores are strategic deployment scores on a 10-point basis and should be treated as architecture-assignment guidance rather than benchmark claims.[page:17][file:31][file:35]

| Model | Arabic professionalism | Legal controllability | Reasoning depth | Sovereign deployability | Guardrail governability | RAG compatibility | Cost-efficiency | Ecosystem fit | Weighted recommendation |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| DeepSeek-R1-Distill-Qwen-14B | 8 | 8 | 9 | 7 | 7 | 8 | 6 | 8 | Primary legal reasoning and RIA engine |
| Qwen3.5-9B | 8 | 8 | 7 | 9 | 8 | 8 | 9 | 8 | Primary assistant, drafting, and intake engine |
| deepseek-moe | 7 | 6 | 8 | 5 | 6 | 7 | 4 | 8 | Future specialist node, not phase-one core |
| code-llama | 3 | 4 | 6 | 8 | 7 | 5 | 8 | 7 | Internal engineering and code operations only |
| llama-3 unknown | 6 | 6 | 7 | 7 | 6 | 7 | 7 | 6 | Hold until exact checkpoint confirmed |
| MythoMax-L2-13B | 4 | 3 | 5 | 7 | 3 | 4 | 6 | 3 | Exclude from RUZN legal core |
| Pygmalion-2-13B | 2 | 2 | 4 | 7 | 2 | 3 | 6 | 2 | Exclude from RUZN legal core |

## Formal model assignment policy

RUZN.AI should not expose raw uncensored model behavior directly to end users, even when using high-value open-source checkpoints, because legal systems require professional tone, citation traceability, and bounded action behavior.[file:31][file:35] All approved base models should therefore pass through Acuterium domestication, including protocol infusion, legal tuning, Arabic register correction, APMS/PSI-DOMINION QA overlays, and output validation under PIF.[file:31][file:35]

## Layered model-and-agent matrix

| RUZN layer | Functional purpose | Primary in-house model/system | Secondary/fallback | Required agent skills | Notes |
|---|---|---|---|---|---|
| Experience layer | User chat, drafting UX, intake, multilingual interaction | Qwen3.5-9B RUZN-tuned | Smaller local assistant variant | Arabic dialect normalization, OCR intake, speech intake, session memory, professional tone adaptation | Front-line user experience layer |
| Intake classification layer | Request typing, risk tagging, jurisdiction recognition | Lightweight routing/classifier models under Q-ARC | Rules-based fallback | Dialect recognition, matter classification, urgency scoring, sensitivity tagging | Deterministic policy-first behavior |
| Orchestration layer | Tool choice, workflow routing, policy enforcement | Q-ARC | Dairan-MOE advisory routing | Task decomposition, chain routing, escalation control, audit trace generation | No single LLM should govern this layer alone |
| Legal reasoning layer | Legal QA, synthesis, explanation, citation-grounded analysis | DeepSeek-R1-Distill-Qwen-14B RUZN Legal | Qwen3.5-9B for lower-complexity tasks | Legal QA, precedent mapping, legal summarization, bilingual explanation | Core analytical engine |
| Drafting layer | Contracts, memos, notices, structured legal output | Qwen3.5-9B DraftOps adapter | External style polisher in hybrid mode | Contract drafting, clause rewrite, legal memo drafting, style formalization | Fast, scalable, high-volume generation |
| RIA / policy simulation layer | Legislative change simulation and impact studies | DeepSeek-R1-Distill-Qwen-14B | Future larger strategic reasoning model | Regulatory impact simulation, scenario testing, cross-domain modeling | Specialized government and policy layer |
| Retrieval / evidence layer | RAG, precedent retrieval, semantic search, knowledge graph lookups | Vector DB + legal KG + reranker | Full-text legacy search fallback | Citation assembly, evidence extraction, article mapping, chronology building | Truth and grounding layer |
| Verification / QA layer | Hallucination control, citation verification, policy compliance | PIF + APMS + PSI-DOMINION + verifier models | Human reviewer tier | Citation checking, contradiction detection, style QA, compliance scoring | Must remain auditable |
| Cross-domain federation layer | Secure calls to other Acuterium systems | CogniMesh + AcutLinks | Restricted external connectors in hybrid mode | Finance link, cyber link, enterprise link, evidence-share policy wrappers | Enables multi-shard reasoning |
| Learning / improvement layer | Controlled self-improvement, feedback logging, change control | CogniMesh -> Dairan-MOE -> Baranurion -> Barzach | Human approval gate | Self-assessment, delta packaging, changelog generation, repo QA propagation | No uncontrolled self-modification |
| Engineering layer | Internal repo automation and code workflows | code-llama | Human developer review | Code generation, ETL scripting, migration support, infra automation | Internal-only support function |

## Required marketplace skills catalogue

RUZN.AI should rely on marketplace skills as auditable agent capabilities mounted behind Q-ARC instead of relying on hidden prompt improvisation, because skills are easier to version, govern, and propagate across shards.[file:35]

| Skill family | Required for RUZN | Purpose |
|---|---|---|
| Arabic dialect normalization | Yes | Converts Omani/GCC dialect to legal-grade professional Arabic |
| Legal citation validation | Yes | Ensures every legal claim can be grounded and traced |
| Contract clause analytics | Yes | Clause detection, conflict analysis, obligations extraction |
| OCR and document parsing | Yes | Handles PDF, image, DOCX, PPTX, XLSX legal artifacts |
| Legal chronology builder | Yes | Builds timelines for cases, filings, decrees, and evidence |
| Regulatory impact simulator | Yes | Supports RIA, policy what-if analysis, and cross-domain modeling |
| Precedent mapper | Yes | Connects provisions, amendments, cases, and citations |
| Enterprise redaction | Yes | Sanitizes data before hybrid escalation |
| Arabic/English legal translation | Yes | Preserves legal meaning across bilingual workflows |
| Risk and compliance scoring | Yes | Drives APMS and PSI-DOMINION enforcement |
| Changelog and governance logger | Yes | Packages approved improvements for Barzach |
| Repo QA propagator | Yes | Pushes approved updates through neural shards and repositories |

## Operating-mode policy framework

RUZN.AI should support three primary operating modes so that one canonical architecture can serve public, enterprise, sovereign, and highly sensitive environments without fragmenting the overall platform design.[file:31][file:35]

| Operating mode | Local models | External models | Data handling | Allowed behaviors | Typical use |
|---|---|---|---|---|---|
| Sovereign mode | Primary | Optional, redacted only | Sensitive corpus remains local | Retrieval-grounded answers, bounded hybrid escalation through Q-ARC | Government, courts, regulated enterprise |
| Hybrid mode | Primary + cloud burst | Allowed through policy gateway | Redaction, minimization, and tagging required | External second opinions, polish, overflow handling, multilingual support | Commercial scale and mixed workloads |
| Air-gapped mode | Exclusive local only | None | Fully local, offline packages only | No external calls, no cloud APIs, deterministic local-only execution | Judicial, defense, and ultra-sensitive deployments |

## External model boundary policy

External LLMs should be used only as bounded augmentation, never as the sovereign source of truth for RUZN.AI, because your prior architecture explicitly treats local and external engines as a hybrid balance rather than a replacement for sovereign control.[file:31][file:35] Acceptable external use cases are limited to advanced synthesis, overflow handling, multilingual refinement beyond Arabic-English, and comparative second-opinion review on sanitized inputs, while raw sovereign corpora, confidential client matter data, or internal governance state must never leave Acuterium-controlled environments.[file:31][file:35]

## Canonical Acuterium reference architecture

The canonical reference architecture below aligns RUZN.AI with the Acuterium ecosystem and the broader decentralized infrastructure you described.[file:31][file:35]

| Architecture tier | Canonical component | Primary responsibility | RUZN role |
|---|---|---|---|
| Interface tier | RUZN Portal / Workspace UI | Chat, drafting, uploads, workflow entry | User interaction surface |
| Security and orchestration tier | Q-ARC + Q-ENC + QMP | Routing, encryption, messaging, workflow control | Core command and policy layer |
| Cognitive tier | RUZN Legal Core + DraftOps + RIA Engine | Legal reasoning, drafting, simulation | Main intelligence layer |
| Integrity tier | PIF + APMS + PSI-DOMINION | Output validation, policy QA, anomaly detection | Trust and quality layer |
| Knowledge tier | Vector DB + legal KG + full-text search | Corpus grounding, evidence retrieval, semantic context | Legal memory and retrieval layer |
| Federation tier | CogniMesh + AcutLinks | Cross-shard communication and specialist federation | Multi-domain extension layer |
| Improvement tier | Dairan-MOE + Baranurion + Barzach | Feedback aggregation, controlled improvement, changelog authority | Evolution and governance layer |
| Infrastructure tier | Sovereign compute, hybrid burst nodes, air-gapped clusters | Runtime hosting and scaling | Deployment substrate |

## Controlled self-assessment and self-enhancement

RUZN.AI should support autonomous self-assessment but only through controlled governance channels, because legal infrastructure benefits from continuous improvement but cannot tolerate unlogged, autonomous model drift.[file:31][file:35] The approved loop should therefore run as: RUZN execution -> PIF scoring -> signed feedback event into CogniMesh -> Dairan-MOE aggregation -> Baranurion approval packaging -> Barzach changelog registration -> repo and shard QA propagation.[file:31][file:35]

## Self-improvement event flow

| Step | Component | Action | Output |
|---|---|---|---|
| 1 | RUZN runtime | Executes task and records evidence | Task trace |
| 2 | PIF | Scores answer quality, citation integrity, contradiction risk, latency, Arabic professionalism | Integrity report |
| 3 | CogniMesh | Publishes signed evaluation event | Shared feedback event |
| 4 | Dairan-MOE | Aggregates deltas across shards and tasks | Candidate improvement package |
| 5 | Baranurion | Reviews and authorizes approved changes | Controlled update directive |
| 6 | Barzach | Stores formal changelog and governance record | Immutable improvement ledger |
| 7 | Repo QA propagation | Pushes updates to skills, prompts, protocols, neural shards, and repos | Ecosystem-wide synchronized update |

## Recommended deployment decision

Based on the current visible model warehouse, RUZN.AI should adopt a two-core in-house model strategy in phase one: Qwen3.5-9B as the primary bilingual interaction and drafting engine, and DeepSeek-R1-Distill-Qwen-14B as the primary legal reasoning and RIA engine.[page:17] code-llama should remain internal-only for engineering workflows, deepseek-moe should stay in the R&D lane until hardware and routing value are validated, and MythoMax/Pygmalion should be excluded from the professional legal production stack.[page:17]

## Implementation roadmap

| Phase | Objective | Key outputs |
|---|---|---|
| Phase 1 | Candidate sanitization and model domestication | Rename, retune, protocol infusion, APMS/PSI-DOMINION overlays |
| Phase 2 | Layer deployment and routing setup | Q-ARC routing tables, RUZN layer assignment, mode policies |
| Phase 3 | Skills marketplace integration | Legal, Arabic, QA, redaction, chronology, simulation skills |
| Phase 4 | Improvement mesh activation | PIF telemetry, CogniMesh events, Dairan-MOE aggregation |
| Phase 5 | Governance hardening | Baranurion approval workflows, Barzach changelog authority |
| Phase 6 | Production rollout | Sovereign, hybrid, and air-gapped RUZN deployment packs |

## Final reference table

| Domain need | Best layer | Recommended primary model/system | Reason |
|---|---|---|---|
| Arabic legal chat | Experience layer | Qwen3.5-9B RUZN-tuned | Best balance of deployability, bilingual interaction, and drafting speed |
| Deep legal analysis | Legal reasoning layer | DeepSeek-R1-Distill-Qwen-14B | Strongest visible reasoning candidate for multi-step analysis |
| Contract drafting | Drafting layer | Qwen3.5-9B DraftOps | Efficient and controllable after domestication |
| Regulatory simulation | RIA layer | DeepSeek-R1-Distill-Qwen-14B | Better suited to scenario reasoning |
| Grounded citations | Retrieval/evidence layer | Vector DB + legal KG + verifier stack | Truth must come from corpus, not raw model memory |
| Safety and QA | Verification layer | PIF + APMS + PSI-DOMINION | Governance must be protocolized and auditable |
| Cross-domain consultation | Federation layer | CogniMesh + AcutLinks | Preserves specialization while enabling collaboration |
| Controlled evolution | Improvement layer | Dairan-MOE + Baranurion + Barzach | Enables safe self-improvement with changelog authority |

