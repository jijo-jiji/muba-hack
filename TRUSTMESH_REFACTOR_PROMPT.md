# Refactor Brief: TrustMesh (MUBA Hacks 2026)

You are working in the `muba-hack` repository. Read this entire brief before writing any code.

---

## 0. Context you need

**What this project is:** TrustMesh is a hackathon submission for MUBA Hacks 2026. It connects Malaysian university students with companies (SMEs) for paid freelance project work. The company locks USDC into a Sui escrow vault up front, the student submits their deliverable, an AI reviews the work through Gonka Router, and if the work passes, the payment releases itself on-chain (90% to the student, 10% platform fee).

**Hard deadlines:**
- Code submission: 5 September 2026, 11:59 PM MYT (Devfolio)
- Live pitch at APU: 6 September 2026. Five minute presentation, five minute Q&A, live working demo required.

**Tracks being targeted:** Sui Track 01 (Payments & Stablecoins), Sui Track 02 (AI x Sui), Gonka Track (AI for Society).

**Who wrote the current code:** It was generated largely by an AI in two big commits and the team does not fully understand it. Your job is to make it something four students can read, explain out loud in Q&A, and demo live without embarrassment. Favour clarity over cleverness everywhere.

**Rules the hackathon organizers enforce:** commit history is inspected, code must be written during the event window (26 Aug onwards, already satisfied), and every AI tool used must be declared in the submission. So make frequent, granular, honestly-described commits as you work. Do not squash everything into one commit.

---

## 1. Read these files first

Before changing anything, read and build a mental model of:

```
TRUSTMESH_MASTER_SRS.md                                  # the spec the code is supposed to implement
README.md                                                # currently overclaims, will be rewritten
unipact-protocol/frontend/src/app/page.tsx               # 496 lines, the entire app lives here
unipact-protocol/frontend/src/lib/types.ts               # 226 lines, all domain types
unipact-protocol/frontend/src/lib/zklogin.ts             # persona definitions
unipact-protocol/frontend/src/lib/mockData.ts            # seed jobs and pools
unipact-protocol/frontend/src/hooks/useDualSignSponsoredTx.ts  # transaction execution, has serious bugs
unipact-protocol/frontend/src/lib/gonkaEvaluator.ts      # Gonka Router integration
unipact-protocol/frontend/src/components/Header.tsx      # persona switcher
unipact-protocol/frontend/tailwind.config.js             # current theme
unipact-protocol/frontend/src/app/globals.css            # current theme
unipact-protocol/contracts/sources/                      # Move contracts
```

---

## 2. What is wrong right now (the diagnosis)

Do not skip this section. It explains why the work below is ordered the way it is.

**2.1 There is no access control at all.** `currentPersona` is React state in `page.tsx`, flipped from a dropdown in the header. All five tabs render for every persona. A "student" can post jobs and fund escrow, a "merchant" can release escrow payments. Across all 4,184 lines of frontend there are exactly two role checks, and one of them (`TrustMeshMarketplace.tsx` line 71) tests `currentPersona.role === "company"` when no persona in the app is ever assigned the role `"company"`, so it is dead code.

**2.2 The code does not implement its own spec.** `TRUSTMESH_MASTER_SRS.md` describes three roles (Company, Student, Admin/Matchmaker), company verification via SSM certificate upload, student university verification, and admin-driven job matching. None of that exists in the code. Meanwhile the code contains a bill splitter, a merchant POS with QR code generation, a camera QR scanner, and a group ledger, none of which are meaningfully in the SRS. The current app is the older "UniPact bill splitter" demo with a marketplace tab appended next to it, not a marketplace built from the spec.

**2.3 The single-dashboard design destroys the pitch.** The product story is a three-party trust story: a company afraid the student will disappear, a student afraid of not getting paid, and an AI referee that settles it. That story only works if a judge watches money move between separate parties in separate sessions. Today the demo is one person clicking "post job", then "submit work", then "release payment" in the same window. The first Q&A question will be "who is clicking that?" and there is no answer. Fixing roles is a pitch fix, not just an architecture fix.

**2.4 The app fabricates on-chain proof.** See section 6. This is the highest severity issue in the repository and must be fixed regardless of what else gets done.

**2.5 The UI and the writing are AI slop.** Dark navy background with three overlapping neon radial gradients, glow shadows, animated shimmer gradient text, emoji avatars, confetti on success, and copy full of phrases like "dual-model forensic audit" and "operational gas station relayer" that the team cannot defend in Q&A.

---

## 3. Target architecture

### 3.1 Routes

Replace the single-page five-tab app with real routes using the Next.js App Router.

| Route | Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Landing page. Explains the product, two CTAs: "I'm a Company" and "I'm a Student". |
| `/login` | Public | Choose account and sign in (see 3.3). Redirects to the correct dashboard by role. |
| `/company` | Company only | Post jobs, fund escrow, review submissions and AI audit reports, authorize release. |
| `/student` | Student only | Browse and apply for jobs, access client assets, submit deliverables, see earnings. |
| `/portfolio/[studentId]` | Public | Shareable proof-of-work page for a student. |
| `/admin` | Admin only | Lowest priority, build only if time remains. Verify accounts, resolve disputes, treasury. |

`page.tsx` must end up small. Any file over roughly 250 lines should be split.

### 3.2 Suggested file layout

```
unipact-protocol/frontend/src/
  app/
    layout.tsx
    page.tsx                       # landing page
    login/page.tsx
    company/layout.tsx             # role guard for company
    company/page.tsx               # job list + escrow overview
    company/jobs/new/page.tsx      # post a job, fund escrow
    company/jobs/[jobId]/page.tsx  # submission + audit report + release action
    student/layout.tsx             # role guard for student
    student/page.tsx               # matched jobs + earnings
    student/jobs/[jobId]/page.tsx  # asset access + deliverable submission
    portfolio/[studentId]/page.tsx
    api/audit-milestone/route.ts   # add role check
    api/sponsor/route.ts
  lib/
    auth/session.ts                # session read/write, role helpers
    auth/permissions.ts            # single source of truth for who can do what
    ...existing lib files
  components/
    ui/                            # Button, Card, Badge, Input, Field, Stat, EmptyState
    company/
    student/
    shared/
```

### 3.3 Session and role model

There is no real backend auth and you should not pretend otherwise.

- Create a `SessionProvider` React context holding `{ address, email, name, role }` where `role` is `"company" | "student" | "admin"`.
- Persist the session in a cookie (so route guards can read it) plus context for the client.
- `/login` presents a small set of seeded demo accounts, clearly grouped by role, styled like a "Sign in with Google" flow since the product uses zkLogin. Keep the existing deterministic keypair derivation in `lib/zklogin.ts` so addresses stay stable across reloads.
- Each dashboard segment gets a `layout.tsx` that reads the session and redirects to `/login` if the role does not match. A student navigating to `/company` must be bounced, not shown a hidden tab.
- Add an honest label somewhere in the UI footer: "Demo authentication. Production would verify the zkLogin JWT server-side." Do not claim security you have not built.

### 3.4 Permission matrix

Put this in `lib/auth/permissions.ts` as actual exported functions, and enforce it in both the UI and the API routes. Do not scatter role checks inline.

| Action | Company | Student | Admin |
| :--- | :---: | :---: | :---: |
| Post job and fund escrow | Yes | No | No |
| Upload client assets | Yes (own jobs) | No | Yes |
| Browse open jobs | No | Yes | Yes |
| Apply for a job | No | Yes | No |
| Accept an applicant | Yes (own jobs) | No | Yes |
| View client assets | Yes (own jobs) | Yes (assigned jobs only) | Yes |
| Submit deliverable | No | Yes (assigned jobs only) | No |
| Trigger AI audit | No | Yes (on own submission) | Yes |
| View audit report | Yes (own jobs) | Yes (own submissions) | Yes |
| Authorize payment release | Yes (own jobs, score >= 80) | No | No |
| Withdraw treasury fees | No | No | Yes |

The "assigned jobs only" constraints matter. A student must not be able to open another student's job by editing the URL. Enforce ownership, not just role.

### 3.5 The demo this architecture is built for

The pitch is two browser windows side by side, company on the left, student on the right. Design every decision so that flow is smooth:

1. Company posts a job and funds escrow with USDC.
2. Student (other window) sees the job, applies. Company accepts.
3. Student downloads the client brief, submits a deliverable.
4. AI audit runs through Gonka Router and returns a score with reasoning.
5. Company sees the report, clicks release.
6. Payment splits on-chain. Both windows update. Explorer link works.

Make sure state changes in one window become visible in the other after a refresh at minimum. Shared state via a small server-side store or a JSON file is acceptable; polling every few seconds is a bonus, not a requirement.

---

## 4. Delete this code

The following features are not in the SRS, do not serve any of the three tracks, and consume demo time and reviewer attention. Delete the files and every reference to them.

```
unipact-protocol/frontend/src/components/BillSplitter.tsx     (511 lines)
unipact-protocol/frontend/src/components/QRScannerModal.tsx   (351 lines)
unipact-protocol/frontend/src/components/MerchantPOS.tsx      (269 lines)
unipact-protocol/frontend/src/components/GroupLedger.tsx      (258 lines)
```

That is roughly 1,389 lines removed. The escrow payout already demonstrates everything Sui Track 01 asks for: gasless sponsored transactions, zkLogin onboarding, and an atomic stablecoin split. The POS and bill splitter add nothing to that argument.

Also remove:
- The `canvas-confetti` dependency and every usage of it.
- The `html5-qrcode` and `qrcode.react` dependencies once the QR features are gone.
- Any now-unused types in `types.ts` (`MerchantQRPayload`, `Bill`, `GroupPool` and friends) and their seed data in `mockData.ts`.
- The `merchant` and `treasurer` persona roles, unless `treasurer` becomes `admin`.

Keep `contracts/sources/group_pool.move` on disk (deleting deployed-ready Move code is riskier than leaving it), but stop referencing it from the frontend and do not mention it in the README.

**Repository hygiene:** move `srs.docx`, `srs_dump.txt`, `UniPact_SRS_v3_0.docx`, `UniPact_SRS_v3_0_dump.txt`, `TRUSTMESH_MASTER_SRS.md` and the stray `word/` directory into a `docs/` folder at the repo root. The root of the repo should show a clean README, a docs folder, and the protocol folder.

---

## 5. Visual redesign

The current theme must go. Reference aesthetic is **https://www.unipact.my/** (visit it if you can). It is minimal, light, professional, heavy on whitespace, with numbered process steps and restrained typography. Think a well-made B2B startup site, not a crypto dashboard.

### 5.1 Delete these visual patterns entirely

- The dark `#090d16` background and the three radial neon gradients in `globals.css`.
- `shadow-glow`, `shadow-glow-sui`, `shadow-glow-gonka`, `pulse-glow`, `shimmer-text` and every animation keyframe supporting them.
- Gradient text of any kind.
- The tri-colour scheme (emerald brand + `sui` blue + `gonka` purple used simultaneously).
- Emoji used as UI elements or avatars (`👩🏻‍💻`, `☕`, `🏛️`, `🎓`, and the `🌟 🏆 📦 🚀` headers in the README). Use initials-based avatars and `lucide-react` icons at small sizes instead.
- Confetti, pulsing, glowing, or bouncing on success states.
- Icons attached to every single label. Icons are for navigation and status only.

### 5.2 The new design system

Define this in `tailwind.config.js` and `globals.css` and use it consistently. Do not introduce colours outside this list.

**Colour**
```
Page background      #FAFAF9   (warm off-white)
Surface / card       #FFFFFF
Border               #E7E5E4
Border strong        #D6D3D1
Text primary         #1C1917
Text secondary       #57534E
Text muted           #A8A29E
Primary action bg    #1C1917   (near-black button, white text)
Primary action hover #292524
Link / accent        #2563EB   (used sparingly, links and selected states only)
Success              #15803D
Warning              #B45309
Error                #B91C1C
```

Status colours appear only in small badges and text, never as large background fills, never with glows.

**Typography**
- One sans-serif family for everything. Inter is fine, but load it self-hosted or fall back to a system stack, because `next/font` fetching from Google Fonts at build time will fail on unreliable venue wifi and break your build the night before the deadline.
- Weights: 400, 500, 600 only. Never 700+ for body or headings under 32px.
- Scale: hero 48px/600, page title 30px/600, section 22px/600, card title 16px/500, body 15px/400, small 13px/400.
- Monospace only for wallet addresses, transaction digests, and Gonka request IDs, at 13px. Truncate long hashes in the middle (`0x1a2b...9f8e`) with a copy button.

**Layout and shape**
- Max content width 1120px, centred, 24px horizontal padding.
- 8px spacing scale. Be generous: 64px to 96px between landing page sections, 24px to 32px inside cards.
- Border radius 6px for cards and buttons, 4px for inputs. No pill shapes except small status tags.
- Borders over shadows. Default card is `1px solid #E7E5E4` on white with no shadow. Maximum permitted shadow is `0 1px 2px rgba(0,0,0,0.04)`.
- Light theme only. Do not build a dark mode.

**Components to build in `components/ui/`**
`Button` (primary / secondary / ghost, three sizes), `Card`, `Badge` (neutral / success / warning / error), `Input`, `Textarea`, `Select`, `Field` (label + hint + error), `Stat` (label above value), `EmptyState`, `Stepper` (numbered 01/02/03 like the reference site), `AddressChip` (truncated mono + copy), `PageHeader`.

### 5.3 Landing page

Build `/` in the style of the reference site:

1. Header: wordmark on the left, "For Companies" and "For Students" links, one primary CTA on the right.
2. Hero: one clear headline, one supporting sentence, two CTAs. Follow the reference site's tone, for example "Post a job. Get matched. Pay only for verified work."
3. How it works: four numbered steps (01 through 04) reading Post and fund, Get matched, Submit work, Automatic payout.
4. A short section explaining the escrow guarantee in plain language.
5. A quiet technical strip near the bottom naming Sui, zkLogin and Gonka Router for the judges, without shouting.
6. Minimal footer.

No hero animation, no floating blobs, no gradient mesh.

---

## 6. Integrity fixes (highest priority, do these first)

These are not style issues. If a judge clicks a dead explorer link during Q&A, the team is defending its honesty rather than its product.

**6.1 Stop generating fake transaction digests.**
In `unipact-protocol/frontend/src/hooks/useDualSignSponsoredTx.ts`, several code paths generate a random 64-character hex string, label it a transaction digest, set `status: "success"`, and render a link to `https://suiscan.xyz/testnet/tx/{fake digest}`. That link resolves to nothing.

Required behaviour: a digest and an explorer link may only ever be shown when a real transaction was broadcast and confirmed on chain. If execution did not happen, return an explicit `status: "not_executed"` and render a neutral panel reading "Simulated locally. No on-chain transaction was submitted." with no digest and no explorer link.

**6.2 Fix the always-true simulation flag.**
`let isSimulated = sponsorData.isSimulated || true;` evaluates to `true` in every case, because `false || true === true`. It should be `const isSimulated = sponsorData.isSimulated ?? true;` or simply read the flag directly.

**6.3 Remove the fabricated latency number.**
`const executionTimeMs = Math.min(480, Math.max(160, ...))` forces every measurement into a "sub-500ms" window, so a real three second execution displays as 480ms, while the README advertises sub-500ms settlement as a headline feature. Report the actual measured duration, whatever it is. If it is slower than claimed, change the claim, not the measurement.

**6.4 Label demo audit results.**
`lib/gonkaEvaluator.ts` falls back to `DEMO_PRESETS` with the hardcoded request ID `gnk-req-2026-trustmesh-pass` when no API key is set. Keep the fallback (it protects the live demo) but the UI must show a visible "Demo data, not a live Gonka call" badge whenever a preset or keyword fallback was used. Only real API responses may be presented as real. Add a boolean like `isLiveGonkaCall` to the audit result type and render it.

**6.5 Fix the Move package build.**
`contracts/sources/unipact_escrow.move` is a duplicate of `contracts/sources/trustmesh_escrow.move`, declaring the same `escrow` and `mock_usdc` module names. Both `unipact` and `trustmesh` named addresses are set to `0x0` in `Move.toml`, so both resolve to the same package address and produce duplicate module definitions. Delete `unipact_escrow.move` and remove the `unipact = "0x0"` entry from `Move.toml`. Then run `sui move build` and report the result.

**6.6 Do not invent new fallbacks.** While refactoring, do not add any new code path that produces plausible-looking fake data to keep a screen from looking empty. Empty states are fine and you are building an `EmptyState` component for exactly that reason.

---

## 7. Language cleanup

Every user-facing string and the README must be readable by a non-crypto person. Apply these replacements and use the same judgement everywhere else.

| Current | Replace with |
| :--- | :--- |
| AI-Audited Student Talent Marketplace & Trustless Escrow Protocol | Get paid for freelance work, automatically |
| Dual-Model Forensic Audit | AI review (two independent checks) |
| Operational Gas Station Relayer | Network fees are covered for you |
| Atomic PTB Settlement / Atomic $1 \rightarrow N$ payout | One-step payment split |
| Zero-Friction zkLogin | Sign in with Google |
| Trustless settlement protocol | Escrow that releases itself |
| Verifiable Student Portfolio | Proof of work you can share |
| Impartial Milestone Audit | Independent check of the delivered work |
| Cryptographic Gate / Settlement Gate | Payment unlocks at 80% or above |

Keep the term **Truth Score**, because the Gonka track explicitly asks for a 0 to 100 truth score, but explain it in the UI as "how closely the submitted work matches what was asked for".

Also strip all LaTeX-style math notation (`$<500$ms`, `$\ge 80\%$`, `$1 \rightarrow N$`) from the README and SRS. It reads as machine-generated and no human writes that in a project README.

---

## 8. README rewrite

Rewrite `README.md` from scratch, after the code works, describing only what actually runs. Structure:

1. One sentence on what it does, in plain English.
2. The problem, in two or three sentences, with the student freelancer angle.
3. How it works, four numbered steps.
4. What is real and what is simulated, stated openly in a small table. Judges respect this and it protects you in Q&A.
5. Track alignment: three short paragraphs, one per track, each pointing at specific files or transactions rather than adjectives.
6. Deployed addresses: Sui package ID, escrow vault object ID, treasury address, plus at least one real testnet transaction digest with a working explorer link.
7. Local setup: the exact commands, and the required environment variables.
8. Team members and their roles.
9. AI tools declaration (required by the organizers). List every tool used, including the AI that generated the initial codebase and this refactor.

No emoji headers. No mermaid diagram longer than ten nodes. One architecture diagram maximum.

---

## 9. Order of work

Do these in order and commit after each numbered step.

1. **Integrity fixes** (section 6). Small, high value, protects the team immediately.
2. **Delete dead features** (section 4). Makes everything after this faster.
3. **Session, permissions and route guards** (section 3.3, 3.4).
4. **Split the dashboards** into `/company` and `/student` with real routes and ownership checks.
5. **Design system and component library** (section 5.2), then restyle the dashboards.
6. **Landing page** (section 5.3).
7. **Language cleanup** (section 7).
8. **README rewrite** (section 8).
9. `/admin` route, only if everything above is finished and tested.

If you run short on time, stop after step 7. A clean two-role app with honest transaction handling beats a five-role app that fakes digests.

---

## 10. Constraints

- **Do not rewrite the Move contracts.** Only delete the duplicate file and fix `Move.toml`. The escrow logic is sound.
- **Do not add npm dependencies** beyond what is already installed, other than removing the ones listed in section 4. The App Router covers routing, and cookie handling is built in.
- **Do not use `next/font` with Google Fonts.** It requires network access at build time and will fail on venue wifi. Self-host or use a system font stack.
- **TypeScript must stay strict and clean.** `npx tsc --noEmit` currently passes with zero errors. It must still pass when you are done.
- **Keep every file under about 250 lines.** If a component grows past that, split it. The team has to be able to read this.
- **Comment the non-obvious parts** in plain language, especially the sponsored transaction flow and the Gonka audit call, because team members will be asked to explain those out loud.
- **Commit granularly** with honest messages. The organizers inspect commit history.

---

## 11. Definition of done

Verify each of these and report the results:

```bash
# From unipact-protocol/frontend
npx tsc --noEmit          # must pass with zero errors
npm run build             # must succeed
npm run dev               # must start cleanly

# From unipact-protocol/contracts
sui move build            # must compile after the duplicate module is deleted
```

Manual checks:

- [ ] Visiting `/company` while logged in as a student redirects away. Same for the reverse.
- [ ] A student cannot open another student's job by changing the URL.
- [ ] The full flow works across two browser windows: post job, apply, accept, submit, audit, release.
- [ ] No transaction digest or explorer link appears anywhere unless a real transaction was confirmed on chain.
- [ ] Any audit result produced from a preset or fallback is visibly labelled as demo data.
- [ ] These greps return nothing:
  ```bash
  grep -rn "shimmer-text\|pulse-glow\|shadow-glow" unipact-protocol/frontend/src
  grep -rn "canvas-confetti" unipact-protocol/frontend/src
  grep -rn "Math.min(480" unipact-protocol/frontend/src
  ```
- [ ] The README describes only behaviour that actually exists in the code.

---

## 12. Report back

When you finish, summarise in plain language:

1. What you changed, grouped by the sections above.
2. Anything you could not complete and why.
3. Every remaining piece of fake, simulated or placeholder behaviour still in the codebase, listed explicitly, so the team knows exactly what they must not claim on stage.
4. The exact steps the team still has to do by hand: deploying the Move package to testnet, filling in `PACKAGE_ID`, `ESCROW_VAULT_ID`, `TREASURY_ADDRESS`, `GONKA_ROUTER_API_KEY` and `SPONSOR_PRIVATE_KEY_B64` in `.env.local`, and funding the sponsor wallet with testnet SUI.
