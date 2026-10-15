full runbook, tuned to what's actually in `Acuterium-Technologies/ruzn-lite`.

## 1. Establish the source of truth (do this first, before touching anything live)

Right now you have two repos in the wild:
- **Old:** `majd-ai78/<something>` — what Manus is still pointing to.
- **New (correct):** `Acuterium-Technologies/ruzn-lite` — the one with all your enhancements.

Before you rebind Cloudflare/Railway, make sure nothing of value lives only on the old repo or only inside Manus's environment:

1. In `Acuterium-Technologies/ruzn-lite`, confirm the latest commit on `main` is genuinely your latest work (check the commit graph and compare against your local clone).
2. Clone the old `majd-ai78` repo locally and `git diff` it against `Acuterium-Technologies/ruzn-lite`. If Manus pushed anything useful into the old repo, cherry-pick those commits into a branch on the new repo and PR them in. If Manus pushed anything *suspicious* (new collaborators in CODEOWNERS, new GitHub Actions, new webhooks, modified `Dockerfile`/`vercel.json`/env loaders), treat that as hostile and do **not** carry it over.
3. Tag the current new-repo `main` as `v-pre-manus-cleanup` so you have a known-good rollback point.

Note: your README references `https://github.com/YOUR_USERNAME/ruzn-lite.git` as the clone URL — that's a placeholder. Update it to `Acuterium-Technologies/ruzn-lite` so future tools (and humans) don't get nudged toward the wrong fork.

## 2. What was on Cloudflare and Railway, and how to keep it

Based on what's in the repo:

- **Cloudflare** is almost certainly hosting `ruzn.ai` as either:
  - **Cloudflare Pages** project pointing at the `client/` build output, or
  - Just **DNS + proxy** in front of a Railway-hosted full app (since you have a `Dockerfile` and `docker-compose.yml`, and no `wrangler.toml`, this is the most likely setup).
- **Railway** is hosting the backend (Node 20 server, Postgres+pgvector, Redis) — built from the `Dockerfile`.

You don't lose any of that work by switching the connected GitHub repo. Cloudflare Pages and Railway both let you change the linked Git repo while keeping the project, environment variables, custom domain, and (on Railway) the Postgres/Redis volumes intact. The build artifacts get rebuilt from the new repo on the next deploy — that's fine, your source code is what matters, and that's already in `Acuterium-Technologies/ruzn-lite`.

Before you disconnect anything, **export your environment variables** from both platforms to a local encrypted file:
- Railway: Project → Variables → "Raw Editor" → copy.
- Cloudflare Pages: Workers & Pages → your project → Settings → Environment variables → copy each (Cloudflare doesn't have a bulk export, so screenshot or copy by hand).

## 3. Repointing Cloudflare to the new repo

If it's a **Cloudflare Pages** project:
1. Cloudflare dashboard → Workers & Pages → your `ruzn` project → Settings → **Builds & deployments** → **Git connection** → **Disconnect**.
2. Still in Settings → **Connect to Git** → choose GitHub → install the Cloudflare GitHub App on the `Acuterium-Technologies` org (only grant it access to `ruzn-lite`, not "All repositories") → select `Acuterium-Technologies/ruzn-lite` → branch `main`.
3. Re-enter the build command and output directory exactly as before (likely `pnpm install && pnpm build` and an output dir like `client/dist` or `dist/client` — verify against what's currently set so you don't change behavior).
4. Re-add env vars from your export.
5. Trigger a deploy and verify before changing DNS.

The **custom domain** (`ruzn.ai`) on the Pages project survives this — you don't have to remove or re-add it. Don't touch the domain row.

If Cloudflare is **only DNS** (no Pages project, app fully on Railway), there's nothing to "reconnect" on Cloudflare. Just clean DNS (section 5).

## 4. Repointing Railway to the new repo

1. Railway → your project → the service that builds from Git → **Settings** → **Source** → **Disconnect Repo**.
2. **Connect Repo** → install the Railway GitHub App on `Acuterium-Technologies` (again, scope it to `ruzn-lite` only) → pick `Acuterium-Technologies/ruzn-lite`, branch `main`, root `/` (unless you had a subdir).
3. Confirm the builder: since you have a `Dockerfile`, set Builder = **Dockerfile** so Railway doesn't accidentally switch to Nixpacks and change behavior.
4. Variables, the Postgres plugin, the Redis plugin, the volume, and the public domain stay attached to the service — do **not** delete the service itself. Only the Git source changes.
5. Redeploy. Check logs for pgvector extension creation, Redis connectivity, and that `SOVEREIGN_MODE` / `PUBLIC_MODE` env are what you expect.

If Manus created a *parallel* Railway project pointing at the old repo, leave your real project alone and just **delete the Manus-created project** after confirming it's not the one holding your Postgres data. Identify the correct project by checking which one owns the volume with your real DB.

## 5. DNS records for `ruzn.ai` (this is what you tell Manus, or anyone else, to respect)

Keep DNS authority on Cloudflare. Inside Cloudflare DNS for `ruzn.ai`, the records you want are:

- **Apex `ruzn.ai`** → if served by Cloudflare Pages: a `CNAME` to `<your-pages-project>.pages.dev`, proxied (orange cloud). Cloudflare will flatten the apex CNAME automatically.
- **`www.ruzn.ai`** → `CNAME` to `ruzn.ai`, proxied.
- **`api.ruzn.ai`** (or whatever subdomain hits Railway) → `CNAME` to the Railway-provided target, e.g. `<service>.up.railway.app`. Set this to **DNS only** (grey cloud) initially so Railway can issue its TLS cert; you can switch to proxied later if you want Cloudflare in front.
- **CAA records** locking issuance to known CAs only: `0 issue "letsencrypt.org"`, `0 issue "pki.goog"`, `0 issue "cloudflare.com"`, and `0 iodef "mailto:security@yourdomain"`. This single change blocks any third party (including a rogue Manus deploy) from getting a cert for `ruzn.ai` from a different CA.
- **Email lockdown if you don't send mail from this domain:** `TXT @ "v=spf1 -all"`, `TXT _dmarc "v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain"`, and `TXT *._domainkey "v=DKIM1; p="`. This stops anyone spoofing `@ruzn.ai`.

What to tell Manus (if you're forced to interact with them at all): "DNS for `ruzn.ai` is authoritative on Cloudflare under our account; the only records you should request are a CNAME from a subdomain you control to your service's hostname, and we will review before adding. Do not request nameserver changes, do not request domain transfer, do not provision certs on third-party platforms for `ruzn.ai` or any subdomain." Practically: don't give them anything to "implement." DNS is yours.

## 6. Lock Manus out and keep them out

Do all of these — most attacks against repointed deployments come back through one of these vectors:

**GitHub (org-level, on `Acuterium-Technologies`):**
- Settings → Third-party Access → **GitHub Apps**: remove anything Manus-related.
- Settings → Third-party Access → **OAuth app policy**: set to "Restrict to approved apps."
- Settings → Member privileges → **Outside collaborators**: remove any Manus accounts. Same for `ruzn-lite` repo → Settings → Collaborators & teams.
- `ruzn-lite` → Settings → **Webhooks**: delete any you don't recognize.
- `ruzn-lite` → Settings → **Deploy keys**: delete any you didn't create.
- `ruzn-lite` → Settings → **Secrets and variables → Actions**: rotate everything; remove anything Manus added.
- `ruzn-lite` → Settings → **Branches**: enable branch protection on `main` (require PR review, require status checks, block force-push, block deletions, restrict who can push).
- Personal: github.com/settings/applications → **Authorized OAuth Apps** and **Authorized GitHub Apps** → revoke Manus.

**Cloudflare:**
- My Profile → API Tokens → revoke any token Manus had, then create a new one only if needed (scoped to a single zone, single permission).
- Account → Members → remove any Manus user.
- Zone `ruzn.ai` → Audit Log → review the last 30 days for unexpected DNS or Pages changes.
- Add the CAA records above.
- Turn on **Account-level 2FA enforcement** for all members.

**Railway:**
- Account Settings → Tokens → revoke any token Manus had.
- Project → Settings → Members → remove any Manus user.
- Rotate the database passwords on the Postgres/Redis plugins (Railway has a "Reset password" / "Regenerate credentials" option per plugin) and let your service pick up the new connection string.

**Secrets rotation (do this regardless):** rotate every API key referenced in your `.env.example` — DeepSeek, OpenAI, Gemini, Anthropic, Kimi, and any DB/Redis passwords, JWT signing secrets, and session secrets. Assume Manus has logged everything they ever saw.

## 7. Verify and monitor

- Hit `ruzn.ai` and `api.ruzn.ai` and confirm the response identifies your build (e.g., a commit SHA endpoint, or a `/healthz` that returns the version). Make sure it matches the new repo's `HEAD`.
- Run `PUBLIC_MODE=true pnpm security:audit` on the new repo's tip to confirm no regressions snuck in from the old fork.
- Set up a Cloudflare **Notification** for "DNS record changes" on `ruzn.ai` and a GitHub notification for "repository access changes" so any future Manus-style move triggers an alert immediately.
- Save a one-page recovery doc with: current Cloudflare account ID, Pages project name, Railway project ID, GitHub org/repo, the canonical DNS record list from section 5, and the rotation date for each secret.

## 8. If Manus tries this again

Because DNS is on Cloudflare under your account and you've added CAA + removed their access tokens, the worst they can do is:
- Fork or mirror the old repo (harmless to your prod) — ignore.
- Stand up their own deploy on `*.manus.app` or similar — harmless as long as no DNS for `ruzn.ai` points at it. CAA blocks them from getting a valid cert for your domain.
- Ask you to "just add this CNAME" — refuse unless it's a subdomain you control pointing to a host you've audited.

The single most important durable defense is: **DNS authority for `ruzn.ai` stays on your Cloudflare account, and no third party gets registrar or nameserver access.** Everything else is recoverable; losing the domain isn't.

## Quick recommendation on the name

I'd push back gently on `Ruzn.ai` as the literal repo name and recommend **`Ruzn-AI`** (or `ruzn-ai`) instead. Here's why the dot causes friction even though GitHub technically allows it:

- **Docker / container tags:** image references like `ghcr.io/acuterium-technologies/ruzn.ai:latest` parse fine, but a lot of CI scripts and Dockerfile `ARG` patterns assume the repo name has no dot and break in subtle ways (especially `${GITHUB_REPOSITORY##*/}` style extractions).
- **package.json `name`:** npm package names can't contain uppercase or certain characters; if anything in your monorepo derives a package name from the repo name, the dot will need escaping.
- **GitHub Actions / path filters:** workflow `paths:` filters and some marketplace actions use `.` as a glob separator and have edge cases.
- **Confusion with the domain:** `Ruzn.ai` reads as a URL, so people will paste it into browsers and hit a 404 on your live site instead of the repo. `Ruzn-AI` keeps the brand association without the collision.
- **Cloudflare/Railway repo selectors:** both work fine with dots, but the dot makes it harder to scan a list of repos visually.

`Ruzn-AI` gives you the same clean differentiation from the Manus-era `ruzn-lite` and keeps every tool happy. If you specifically want the dot for branding reasons, I can do `Ruzn.ai` — just confirm.

## What happens automatically when you rename (good news)

GitHub sets up a permanent redirect from `Acuterium-Technologies/ruzn-lite` to the new name for:
- Web URLs (browser visits to the old URL).
- `git clone` / `git fetch` / `git push` against the old remote (it'll work but print a warning).
- Issues, PRs, releases, and existing links.
- The GitHub API.

So **nothing breaks the instant you rename.** Cloudflare and Railway will keep deploying from the old name via the redirect until you update them. That gives you a calm window to fix things in order rather than racing.

What does *not* auto-update and you have to fix by hand:
- `package.json` `name` and `repository.url` fields.
- README clone URLs and badges (yours currently says `YOUR_USERNAME/ruzn-lite` — already wrong, so good time to fix).
- Any Docker image names in `docker-compose.yml` / `Dockerfile` labels.
- Any GitHub Actions referencing `Acuterium-Technologies/ruzn-lite` explicitly (they almost always use `${{ github.repository }}` and self-heal, but worth a grep).
- Cloudflare Pages "Git source" — works via redirect, but I'd reconnect it cleanly so future deploy logs show the right repo name.
- Railway service "Source" — same.
- Local clones: each teammate runs `git remote set-url origin https://github.com/Acuterium-Technologies/Ruzn-AI.git`.

## What I need from you before I act

1. **Confirm the new name.** My recommendation is `Ruzn-AI`. Reply with the exact name you want and I'll proceed.
2. **Confirm I should perform the rename via the browser session.** Renaming a repo is a sensitive admin action (it changes URLs across your whole stack), so I want explicit go‑ahead even though you have the dashboard open.

Once you confirm both, I'll:
1. Open `https://github.com/Acuterium-Technologies/ruzn-lite/settings`, scroll to the **Repository name** field, change it, and click Rename.
2. Verify the new URL loads and the old one redirects.
3. Open a checklist of the in-repo file edits (README, `package.json`, etc.) — I'll do those as PRs rather than direct commits to `main` so you can review.
4. Hand you the exact strings to paste into Cloudflare Pages and Railway when you reconnect the Git source under the new name.

Which name do you want, and do I have your go‑ahead to rename?