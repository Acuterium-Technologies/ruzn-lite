# Ruzn-AI — Repository Rename & Deployment Hardening
## Technical Gap Analysis & Implementation Report

**Prepared for:** Acuterium Technologies
**Subject system:** `ruzn.ai` production platform
**Target action:** Rename `Acuterium-Technologies/ruzn-lite` → `Acuterium-Technologies/Ruzn-AI`, sever residual Manus AI artifacts, and rebind production deployment to the renamed repository
**Status:** Read-only analysis complete. No changes have been made. Implementation pending sign-off.
**Date:** 7 May 2026

---

## 1. Executive Summary

Acuterium-Technologies maintains the live production application `ruzn.ai`, an AI-powered government audit & compliance platform (frontend + Node 20 backend, Postgres+pgvector, Redis, multi-provider LLM orchestration). A prior engagement with Manus AI left the deployment chain pointed at a legacy fork under `majd-ai78`, while active development has continued on `Acuterium-Technologies/ruzn-lite`. Cloudflare and Railway have been recovered into Acuterium control, but several discrepancies remain that must be resolved before the rename to `Ruzn-AI` proceeds, otherwise the rename will surface latent issues as outages.

The single largest finding from this analysis is that **Railway, not Cloudflare Pages, is the apex serving surface for `ruzn.ai`**, and the custom-domain attachment for `ruzn.ai` on the Railway service `heroic-celebration` is currently in a **"Waiting for DNS update"** state. This means production traffic resolution is partly degraded *right now*, independent of the rename. The rename plan must therefore be sequenced after — not before — DNS reconciliation.

This report consolidates current-state inventory, gap analysis, risk register, exact change list, DNS posture, and a sequenced runbook for sign-off.

---

## 2. Current-State Inventory

### 2.1 GitHub
| Item | Value |
|---|---|
| Active repository | `Acuterium-Technologies/ruzn-lite` |
| Default branch | `main` |
| Legacy/Manus-era repository | `majd-ai78/<ruzn-lite or similar>` (still referenced by Manus tooling) |
| In-repo deploy artifacts present | `Dockerfile`, `docker-compose.yml`, `vercel.json`, `package.json`, `drizzle.config.ts` |
| In-repo deploy artifacts **absent** | `wrangler.toml`, `railway.json`, `railway.toml` |
| README repository URL | Placeholder string `https://github.com/YOUR_USERNAME/ruzn-lite.git` (incorrect — appears in two places) |
| Architecture | `client/` (frontend) + `server/` (Express + tRPC + Drizzle), pgvector knowledge layer, multi-provider LLM orchestrator |
| Deployment modes declared | `PUBLIC_MODE`, `GOV_DEMO_MODE`, `SOVEREIGN_MODE` |

### 2.2 Railway
| Item | Value |
|---|---|
| Project | `Ruzn-AI` (display name) |
| Environment | `production` |
| Service | `heroic-celebration` |
| Service ID | `ddc01c27-3e53-469b-98d6-718ffeb25d8b` |
| Project ID | `4e3058a2-8ec6-4b71-a350-f345f3bb8b56` |
| Environment ID | `fd9659a5-3d9b-49e3-857f-2897950b5e73` |
| Connected Git source | `Acuterium-Technologies/ruzn-lite` (branch `main`) |
| Auto-deploy on push | Enabled |
| Wait-for-CI | Not enabled |
| Builder | Dockerfile (auto-detected) |
| Root directory | Not set |
| Watch paths | None configured |
| Healthcheck path | Not configured |
| Restart policy | On failure |
| Region | US West (California) |
| Replicas | 1 (multi-region requires Pro) |
| Resource limits | 8 vCPU / 8 GB (plan ceiling) |
| Public domains attached | `heroic-celebration-production-eab9.up.railway.app`, `ruzn.ai` (port 8080, **Waiting for DNS update**), `majd.chat` (port 8080, **Waiting for DNS update**) |
| Custom domain quota | Hit ("custom domain limit for your plan") |
| Subscription status | **Past due** — banner: "Your subscription is past due. Please pay the outstanding balance to avoid service disruption." |
| Private networking endpoint | `heroic-celebration.railway.internal` |

### 2.3 Live site
| Item | Value |
|---|---|
| URL | `https://ruzn.ai/` |
| Page title | `Ruzn-Lite | رُزن` |
| Currently serving | The expected Ruzn product page (Arabic + English UI, request-access flow, `info@ruzn.ai`) |
| Branding | Still labelled "Ruzn-Lite" in `<title>` and headings; "رُزن لايت" in Arabic copy |

### 2.4 Cloudflare
Not directly inspected in this session (no Cloudflare tab open). Inferred role: DNS authority for `ruzn.ai`. No evidence in the Railway view that Cloudflare Pages is serving the apex. Confirmation required (see §4 Gap G-7).

### 2.5 Manus AI footprint (suspected, requires verification)
- Old repo `majd-ai78/<repo>` still on the internet and possibly still referenced by Manus deploy targets.
- Possible Manus-installed GitHub App on the org or on the legacy fork.
- Possible Manus-issued Railway/Cloudflare API tokens (if any were ever created).
- Unknown whether Manus has retained a local clone of the codebase. Assume yes for threat-modeling purposes.

---

## 3. Gap Analysis

| ID | Gap | Evidence | Severity | Blocks rename? |
|---|---|---|---|---|
| **G-1** | `ruzn.ai` custom domain on Railway is in "Waiting for DNS update" state | Railway settings panel | High | Yes — must be resolved first; rename will mask the diagnostic signal |
| **G-2** | `majd.chat` is attached as a custom domain to the same service | Railway settings panel | High | Yes — unauthorized/legacy domain co-tenant; must be removed or justified before lockdown |
| **G-3** | Railway subscription is past due | Billing banner | Critical | Yes — service disruption risk during the rename window |
| **G-4** | README contains placeholder clone URL `YOUR_USERNAME/ruzn-lite` | `README.md` | Medium | No, but should be fixed in the same PR as the rename |
| **G-5** | Repo lacks `railway.json` / `railway.toml` config-as-code | Repo file list | Medium | No, but recommended before rename so deployment config is reproducible |
| **G-6** | No healthcheck path configured on Railway service | Railway settings panel | Medium | No, but rename without it means a bad deploy is detected by users, not the platform |
| **G-7** | Cloudflare role for the apex is unconfirmed (DNS only vs Pages) | No Cloudflare tab open | Medium | Yes — must be confirmed before changing nameserver-side records |
| **G-8** | No watch paths on Railway → every commit rebuilds the whole image | Railway settings panel | Low | No |
| **G-9** | Branch protection on `main` not confirmed | GitHub repo not yet inspected at Settings level | Medium | No, but should land before opening the renamed repo to broader use |
| **G-10** | `Wait for CI` is disabled on Railway → unverified code can deploy | Railway settings panel | Medium | No, but worth enabling alongside rename |
| **G-11** | Manus AI's residual access (GitHub Apps, OAuth, deploy keys, webhooks, collaborators, tokens) not audited in this session | Out of scope of read-only pass | High | Yes — rename without revocation lets Manus follow the redirect |
| **G-12** | Site `<title>` and copy still say "Ruzn-Lite / رُزن لايت" while the new repo will be `Ruzn-AI` | `ruzn.ai` HTML | Low | No, but creates brand inconsistency post-rename |
| **G-13** | Railway custom-domain quota already hit | Railway settings panel | Low | No, but means `majd.chat` removal is required to add any future domain (e.g., `api.ruzn.ai`) |
| **G-14** | `package.json` `name` / `repository.url` fields not yet inspected | Repo not opened at file level in this pass | Medium | No, but part of the rename PR |

---

## 4. Discrepancies Between Stated Intent and Observed State

1. **Stated:** "Manus has been purged from everywhere." **Observed:** The Railway service is *still building from a repo path that Manus is known to have touched* (the repo name `ruzn-lite` is the same name Manus used). Purge is therefore not yet complete at the deployment-binding layer; only at the GitHub source-of-truth layer.
2. **Stated:** "ruzn.ai is on Cloudflare and Railway." **Observed:** Railway holds the custom domain attachment for the apex `ruzn.ai`, not just a subdomain. Cloudflare's role appears to be DNS only. This needs explicit confirmation, because the recovery procedure differs sharply between "Cloudflare Pages serving apex" and "Cloudflare DNS pointing at Railway."
3. **Stated:** New repo is `Acuterium-Technologies/ruzn-lite`. **Observed:** Project display name in Railway is already `Ruzn-AI`, suggesting the rename intention has already been partially propagated at the platform layer ahead of the GitHub rename. This is fine but worth noting — it confirms `Ruzn-AI` is the agreed-on canonical name.
4. **Stated:** Site is "Ruzn" / production. **Observed:** Live site title and Arabic copy still read "Ruzn-Lite / رُزن لايت," which is a content-layer discrepancy with the repo rename target.
5. **Stated:** `majd-ai78` is the old repo. **Observed:** A `majd.chat` custom domain is attached to the same Railway service as `ruzn.ai`. The shared `majd` token suggests a possible link to the old account/owner; this must be reviewed for whether it's intentional (legitimate second product) or residual (cleanup target).

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Service disruption from past-due Railway billing during rename window | Medium | High (full outage of `ruzn.ai`) | Settle billing **before** any rename action |
| `ruzn.ai` DNS state worsens after rename (Railway treats reconnect as new domain attempt) | Medium | High | Resolve DNS to "active" state before rename |
| Manus retains GitHub redirect-following access (App still installed on org) | Medium | High (Manus could push to renamed repo if collaborator access wasn't revoked) | Audit and revoke before rename |
| `majd.chat` domain belongs to a third party who could redirect traffic | Low–Medium | Medium | Verify ownership; if not Acuterium's, detach immediately |
| Hitting Railway custom-domain quota blocks adding `api.ruzn.ai` later | Already realised | Medium | Detach unused domains first |
| Rename breaks any external CI/integration that hardcoded the repo path | Low | Medium | Grep config files; rely on GitHub redirects as a 30-day buffer |
| Local clones across team get out of sync | Low | Low | One-line `git remote set-url` notice to all contributors |
| Brand inconsistency between repo `Ruzn-AI` and product copy `Ruzn-Lite` | Already realised | Low | Update site copy in same release window |

---

## 6. Dependency Map for the Rename

```
[Settle Railway billing]                  ← prerequisite, blocks everything
        │
        ▼
[Confirm Cloudflare role: DNS-only vs Pages]
        │
        ▼
[Resolve ruzn.ai "Waiting for DNS update" + decide on majd.chat]
        │
        ▼
[Audit + revoke Manus access on GitHub / Railway / Cloudflare]
        │
        ▼
[Pre-rename PR on Acuterium-Technologies/ruzn-lite:
   • Fix README clone URLs
   • Update package.json name + repository.url
   • Add railway.json (config-as-code)
   • Add healthcheck endpoint + path
   • Add CONTRIBUTING/SECURITY references that won't break]
        │
        ▼
[Snapshot: tag main as v-pre-rename]
        │
        ▼
[Rename ruzn-lite → Ruzn-AI on GitHub]
        │
        ▼
[Reconnect Railway service Source to Acuterium-Technologies/Ruzn-AI]
        │
        ▼
[Verify deploy + healthcheck + ruzn.ai serving]
        │
        ▼
[Lock down: branch protection, scoped GitHub App access, CAA records,
 token rotation, Cloudflare audit-log notifications]
        │
        ▼
[Update product copy: Ruzn-Lite → Ruzn / Ruzn-AI on the site itself]
```

---

## 7. Exact Change List

### 7.1 Platform changes (manual, one-time)
1. **Railway:** Pay outstanding balance.
2. **Railway → Service `heroic-celebration` → Networking:** Resolve `ruzn.ai` DNS state. Required CNAME or A target shown by Railway under "Show DNS records" must be reflected in Cloudflare DNS (proxy off / DNS-only for cert issuance).
3. **Railway → Service → Networking:** Decide on `majd.chat`:
   - If Acuterium-owned and intentional → leave; document it.
   - If legacy / not Acuterium-owned → **Disconnect**.
4. **Railway → Service → Settings → Source:** Will be reconnected to `Acuterium-Technologies/Ruzn-AI` after GitHub rename. Builder remains Dockerfile, branch remains `main`, root directory remains unset (unless §7.2 introduces a monorepo split).
5. **Railway → Service → Deploy:** Set Healthcheck Path to `/healthz` (after §7.2 adds the endpoint). Enable **Wait for CI**.
6. **GitHub → `Acuterium-Technologies/ruzn-lite` → Settings → General → Repository name:** Change to `Ruzn-AI`. Confirm.
7. **GitHub → Settings → Branches:** Add a protection rule on `main` (require PR + 1 review, require status checks, block force-push, block deletions).
8. **GitHub → Org Settings → Third-party Access (GitHub Apps + OAuth Apps):** Audit list; revoke anything Manus-related; restrict OAuth apps to approved-only.
9. **GitHub → Repo Settings → Webhooks / Deploy keys / Collaborators / Actions secrets:** Audit and remove anything not recognised; rotate Actions secrets.
10. **Cloudflare → DNS for `ruzn.ai`:** Verify CNAME/A points to Railway target; add CAA records (`letsencrypt.org`, `pki.goog`, `cloudflare.com`); add SPF/DMARC/DKIM-null if email is not used.
11. **Cloudflare → My Profile → API Tokens & Account → Members:** Revoke any Manus-era token/member; rotate remaining tokens.

### 7.2 In-repository changes (single PR, opened *before* the rename)
| File | Change |
|---|---|
| `README.md` | Replace both occurrences of `https://github.com/YOUR_USERNAME/ruzn-lite.git` with `https://github.com/Acuterium-Technologies/Ruzn-AI.git`; update repo name/headings from `Ruzn-Lite` to `Ruzn-AI` where appropriate; keep "Ruzn-Lite" only where it refers to the *product tier* (the PoV product line referenced in the site). |
| `package.json` | Update `name` (e.g., `"ruzn-ai"`) and `repository.url` to the new GitHub URL. |
| `railway.json` *(new)* | Add config-as-code: builder `DOCKERFILE`, healthcheck path `/healthz`, restart policy on-failure, watch paths limited to `server/**`, `client/**`, `Dockerfile`, `package.json`, `pnpm-lock.yaml`. |
| `server/routers/health.ts` *(new, or wherever appropriate)* | Add `/healthz` returning `{status:'ok', commit: process.env.GIT_COMMIT_SHA}`. |
| `Dockerfile` | Inject `GIT_COMMIT_SHA` build arg so `/healthz` can return it. |
| `.github/workflows/*.yml` | Grep for hardcoded `Acuterium-Technologies/ruzn-lite`; replace with `${{ github.repository }}` where present; otherwise update string. |
| `docker-compose.yml` | Update `image:` / `container_name:` if they reference `ruzn-lite`. |
| `vercel.json` | Review (since Vercel is not the production target, decide whether to remove it to avoid confusion or keep it for previews). |

### 7.3 Site/content changes (separate PR, after rename)
| Asset | Change |
|---|---|
| Frontend `<title>` | `Ruzn-Lite | رُزن` → `Ruzn | رُزن` (or `Ruzn-AI | رُزن`) |
| Arabic hero copy | Decide whether `رُزن لايت` (PoV tier) and `رُزن-ASI` (full platform) are still the public product naming; align with new repo identity |
| Footer | Confirm "© 2024" → current year |

---

## 8. DNS & Security Posture (target end-state)

### 8.1 DNS records on Cloudflare for `ruzn.ai`
| Type | Name | Target | Proxy | Purpose |
|---|---|---|---|---|
| CNAME (or flattened A) | `@` | Railway-supplied target for the service | DNS-only initially; proxied later if desired | Serves apex via Railway |
| CNAME | `www` | `ruzn.ai` | Proxied | www redirect |
| CNAME | `api` | (future) Railway target for backend split | DNS-only | Reserved for backend separation |
| CAA | `@` | `0 issue "letsencrypt.org"` | n/a | Restrict cert issuance |
| CAA | `@` | `0 issue "pki.goog"` | n/a | Restrict cert issuance |
| CAA | `@` | `0 issue "cloudflare.com"` | n/a | Restrict cert issuance |
| CAA | `@` | `0 iodef "mailto:security@acuterium.tech"` | n/a | Issuance violation reports |
| TXT | `@` | `v=spf1 -all` | n/a | Block spoofing if no email is sent from apex |
| TXT | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc@acuterium.tech` | n/a | Reject spoofed mail |
| TXT | `*._domainkey` | `v=DKIM1; p=` | n/a | Null DKIM lockdown |

### 8.2 Authorization posture
- **Registrar:** Acuterium-only access. No third party (including Manus) holds registrar credentials or transfer-auth codes.
- **Nameservers:** Cloudflare. Authoritative for `ruzn.ai`.
- **GitHub App scope:** Cloudflare's and Railway's GitHub Apps scoped to `Ruzn-AI` only (not "All repositories").
- **Branch protection:** `main` protected; PR + review required.
- **Tokens:** Cloudflare and Railway API tokens rotated post-rename; least-privilege scoping.

---

## 9. Sequenced Implementation Runbook (for execution after sign-off)

> Each step is gated on the prior step. Estimated total wall-clock: 90–150 minutes excluding billing settlement. Each step is reversible up to step 7.

| # | Step | Owner | Verification |
|---|---|---|---|
| 1 | Settle Railway past-due balance | You | Banner removed; service "Active" |
| 2 | Confirm Cloudflare role for apex (DNS-only vs Pages); export DNS zone | You | Zone file saved locally |
| 3 | Audit Manus access on GitHub (Apps, OAuth, collabs, webhooks, deploy keys, Actions secrets) | You / me read-only assist | Empty inventory of Manus artifacts |
| 4 | Audit Manus access on Railway (members, tokens) and Cloudflare (members, tokens) | You / me read-only assist | Empty inventory |
| 5 | Resolve `ruzn.ai` "Waiting for DNS update" state (DNS record matches Railway target, cert issued) | You | Domain shows "Active" in Railway |
| 6 | Decide on `majd.chat`; detach if not Acuterium's | You | Domain list contains only intended domains |
| 7 | Open and merge **pre-rename PR** (README, `package.json`, `railway.json`, `/healthz`) | Me (draft PRs) + you (review/merge) | CI green; deploy succeeds; `/healthz` returns `ok` |
| 8 | Tag `main` as `v-pre-rename` | You | Tag visible on GitHub |
| 9 | Rename `ruzn-lite` → `Ruzn-AI` on GitHub | You (one click; I can navigate to Settings) | New URL loads; old URL redirects |
| 10 | In Railway service Source, **Disconnect** then **Connect** to `Acuterium-Technologies/Ruzn-AI`, branch `main`, builder Dockerfile | You | New deploy triggered from new repo identity |
| 11 | Verify production: `curl https://ruzn.ai/healthz` returns the expected commit SHA | You / me | Matches new repo `HEAD` |
| 12 | Apply branch protection on `main`; restrict GitHub Apps; rotate tokens; add CAA records | You | Settings reflect target state |
| 13 | Set Cloudflare notifications: DNS record changes, zone setting changes | You | Notification rules enabled |
| 14 | Open and merge **content/branding PR** (site title, footer year, Arabic copy review) | Me (draft) + you (review/merge) | Live site reflects new naming |
| 15 | Communications: announce rename to team; each contributor runs `git remote set-url origin https://github.com/Acuterium-Technologies/Ruzn-AI.git` | You | Acknowledgements collected |

---

## 10. Open Questions Before Implementation

1. **`majd.chat`** — is this an Acuterium-owned domain pointing to a legitimate second product on the same Railway service, or a residual Manus-era artifact to be removed? *(Affects step 6.)*
2. **Cloudflare role** — please confirm whether there is a Cloudflare Pages project for `ruzn.ai`, or if Cloudflare is purely DNS in front of Railway. *(Affects steps 2 and 5.)*
3. **Email on `ruzn.ai`** — does Acuterium send email from `info@ruzn.ai`? If yes, the SPF/DMARC/DKIM null-lockdown in §8.1 must be replaced with real records pointing at the actual mail provider.
4. **Subdomain plan** — should the backend be split to `api.ruzn.ai` now (recommended) or kept on apex? *(Affects custom-domain quota and §7.1 step 3.)*
5. **Branding** — should the live site keep "Ruzn-Lite / رُزن لايت" as a product *tier* name (your own taxonomy explicitly says "رُزن لايت → رُزن-ASI"), or be rebranded to plain "Ruzn"? The repo rename to `Ruzn-AI` is independent of either choice but the answer affects §7.3.
6. **Healthcheck endpoint** — `/healthz` is the proposal; any preference for `/api/health`, `/_status`, or another path that fits your existing router conventions?

---

## 11. Sign-off

This report is intended as a freeze-point. Once you confirm:
- The new repository name is `Ruzn-AI` (confirmed).
- The answers to §10 (1–6).
- That you authorize execution starting from step 1 of §9.

…I will execute the steps that are safe for me to execute (read-only navigation, drafting the pre-rename PR text, verification checks) and prompt you explicitly before each step that requires admin authority (billing, rename, disconnect/reconnect, token rotation).

No actions have been taken in this session. Awaiting your sign-off and answers to §10.