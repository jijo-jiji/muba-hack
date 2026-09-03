# TrustMesh

Companies fund a student's project up front, and the payment releases itself once the finished work has been checked against what was asked for.

## The problem

Malaysian university students who take on freelance work get paid late or not at all, and they have no way to prove what they have already delivered. Small companies have the mirror problem: they do not want to pay a stranger up front for work that might never arrive, or might arrive half-finished. Both sides end up relying on trust that neither has earned yet.

TrustMesh removes the need for that trust. The company's money is locked before the student starts, so the student can see it is really there. The money only moves after an independent review scores the submitted work against the original brief.

## How it works

1. **Post and fund.** A company describes the work and locks the budget into an escrow vault on Sui. There is no such thing here as an unfunded job.
2. **Get matched.** Students apply. The company picks one and shares the files needed to do the work.
3. **Submit work.** The student hands in a link and a summary of what was built.
4. **Automatic payout.** Gonka Router reviews the submission against the brief and returns a score out of 100. At 80 or above, the company releases the escrow: 90% to the student and 10% to the platform, in a single transaction. The student pays no network fee.

## What is real and what is simulated

We would rather say this plainly than be asked about it.

| Part | Status |
| :--- | :--- |
| Move escrow contract (`release_audited_milestone`, 90/10 split, score gate, event) | Real code, compiles and is ready to deploy |
| Sponsored transaction flow (user signs, relayer pays the fee, both signatures sent together) | Real code end to end |
| On-chain transactions | **Not yet.** No package is deployed and the sponsor wallet is unfunded, so nothing has been broadcast. The app says so on screen and shows no transaction digest or explorer link. |
| Gonka Router review | Real API integration. Without an API key it returns canned results, which the UI labels "Demo data, not a live Gonka call". |
| Sign-in | Simulated. Picking a demo account sets a cookie. Real zkLogin would verify a Google ID token server-side. Addresses are real Sui addresses derived from fixed seeds. |
| Client files | Names only. File contents are not uploaded or stored. |
| USDC balances | Derived from the job records, not read from chain. |
| Job storage | A JSON file on the dev server, shared between browser windows. Not a database. |

Nothing in the app invents data to fill an empty screen. Where there is nothing, it says so.

## Track alignment

**Sui Track 01 — Payments and Stablecoins.** The escrow release is one transaction that pays two parties from one vault: `unipact-protocol/contracts/sources/trustmesh_escrow.move`. Users never hold SUI, because `src/app/api/sponsor/route.ts` attaches the relayer's gas coin and signs for it, and `src/hooks/useDualSignSponsoredTx.ts` sends the user's signature and the relayer's together. Accounts are addressed by zkLogin-style derived addresses rather than a browser wallet extension (`src/lib/zklogin.ts`).

**Sui Track 02 — AI x Sui.** The AI review's output is what authorises the on-chain call. The Gonka request id and the score are passed into `release_audited_milestone` as Move arguments, and the contract itself rejects any score below 80, so the gate is enforced on chain rather than in the UI. The emitted `MilestoneAuditedEvent` carries the request id, meaning any payout can be traced back to the specific review that justified it.

**Gonka Track — AI for Society.** The review in `src/lib/gonkaEvaluator.ts` runs two checks in parallel through Gonka Router: whether everything in the brief is present, and whether the work is genuinely finished rather than placeholders. It exists to protect students from companies that go quiet after receiving work, and companies from submissions that do not match the brief. Only the assigned student can start the review (`src/app/api/audit-milestone/route.ts`), so a company cannot re-run it until it gets an answer it prefers.

## Deployed addresses

Nothing is deployed yet. This section must be filled in before submission:

| | |
| :--- | :--- |
| Sui package ID | not yet deployed |
| Escrow vault object ID | not yet created |
| Treasury address | not yet set |
| Example transaction | none — no transaction has been broadcast |

Until these are filled in, the app will not display a transaction digest or an explorer link anywhere, because there is nothing real to link to.

## Running it locally

```bash
cd unipact-protocol/frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Sign in as a company in one browser window and as a student in another; the two windows share the same job list.

Environment variables are documented in `unipact-protocol/frontend/.env.example`. The app runs with all of them blank — it just cannot reach Sui, and the review returns canned results, both of which it states on screen.

To build the Move package:

```bash
cd unipact-protocol/contracts
sui move build
```

To reset the demo back to its starting jobs, delete `unipact-protocol/frontend/.trustmesh-data.json`.

## Team

| Name | Role |
| :--- | :--- |
| _to fill in_ | _to fill in_ |
| _to fill in_ | _to fill in_ |
| _to fill in_ | _to fill in_ |
| _to fill in_ | _to fill in_ |

## AI tools used

Required by the organizers. Every tool used on this project:

- **Claude (Anthropic)** — generated the initial codebase in the first two commits, and carried out the refactor from commit `8a5b683` onwards: removing fabricated transaction digests, deleting unused features, adding the session and permission layer, splitting the app into company and student routes, rebuilding the design system, and rewriting this README.
- **Gonka Router** — used at runtime as the product's own AI review, not as a development tool.

If any team member used another assistant, add it to this list before submitting.
