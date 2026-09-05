# TrustMesh

**MUBA Hacks 2026** · Sui Track 01 (Payments & Stablecoins) · Sui Track 02 (AI × Sui) · Gonka Track (AI for Society)

Companies fund a student's project up front, and the payment releases itself once the finished work has been checked against what was asked for.

---

## Project description

TrustMesh is a marketplace that connects Malaysian companies with university students for paid project work, built so that neither side has to trust the other.

A company posts a job and locks the budget into an escrow vault on Sui in the same action — there is no such thing here as an unfunded job. A student applies, is accepted, does the work, and submits it. An independent AI review compares the submission against the original brief and scores it out of 100. At 80 or above, the escrow pays out in a single transaction: 90% to the student, 10% to the platform. The student never holds SUI and never pays a network fee.

The score gate is enforced by the Move contract, not by the interface, so the rule holds even if someone bypasses the app entirely.

## Problem statement

Malaysian university students who freelance get paid late or not at all, and they have no credible way to prove what they have already delivered. A screenshot of finished work is not evidence, and a student who is ghosted has no recourse worth the cost of pursuing.

Small companies have the mirror problem. They will not pay a stranger up front for work that might never arrive, or might arrive half-finished, and they have no cheap way to judge quality before paying.

Both sides end up waiting for the other to go first. TrustMesh removes that standoff: the money is locked before the work starts, so the student can see it is really there, and it only moves once the work has been independently checked against the brief. Every completed job leaves an on-chain record the student can point to afterwards.

## How it works

1. **Post and fund.** A company describes the work and locks the budget into an escrow vault on Sui.
2. **Get matched.** Students apply. The company picks one and shares the files needed to do the work.
3. **Submit work.** The student hands in a link and a summary of what was built.
4. **Automatic payout.** Gonka Router reviews the submission against the brief and returns a score out of 100. At 80 or above the company releases the escrow, and the student and the platform are paid from the same transaction.

## Blockchain technology used

| Layer | What we use it for |
| :--- | :--- |
| **Sui (testnet)** | The chain everything settles on. Chosen for its object model: an escrow vault is a shared object that both parties can reference, and the 90/10 payout happens inside one transaction rather than as two transfers that could half-fail. |
| **Move** | `unipact-protocol/contracts/sources/trustmesh_escrow.move` holds the escrow logic. `create_and_deposit` locks a company's funds into a shared `EscrowVault`; `release_audited_milestone` splits and pays out; `refund_client` returns funds if the student never delivers. The 80-point score gate is a Move `assert!`, so it cannot be bypassed from the front end. |
| **Mock USDC** | A 6-decimal test stablecoin (`trustmesh::mock_usdc`) standing in for real USDC on testnet, with a shared `TreasuryCap` so anyone can mint test funds for the demo. |
| **Sponsored transactions** | A relayer wallet pays the network fee so students and companies never need to hold SUI. The user authorises the action, the relayer authorises paying for it, and both signatures travel together. |
| **zkLogin-style addressing** | Accounts are addressed by derived Sui addresses rather than a browser wallet extension, so a student signs in with a familiar account instead of managing a seed phrase. See "What is real and what is simulated" below for exactly how far this is implemented. |
| **On-chain events** | `MilestoneAuditedEvent` records the Gonka request ID, the score, and the amounts alongside the payout, so any payment can be traced back to the specific review that justified it. |

The AI review runs through **Gonka Router**, which dispatches each submission to two independent models (`moonshotai/Kimi-K2.6` and `deepseek-ai/DeepSeek-V4-Flash`) and combines their scores.

## Smart contract addresses (Sui Testnet)

| | |
| :--- | :--- |
| Package ID | [`0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8`](https://suiscan.xyz/testnet/object/0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8) |
| Shared `TreasuryCap` (Mock USDC faucet) | [`0x3014d018f3fe3f0765c0f7aefb989949f26503b3c3ff121f1f83997b8475c877`](https://suiscan.xyz/testnet/object/0x3014d018f3fe3f0765c0f7aefb989949f26503b3c3ff121f1f83997b8475c877) |
| Treasury address (receives the 10% fee) | [`0x07d6119ab3de685fec1cc0fbdb104276291ccdf7e541c89292db779a5cde792b`](https://suiscan.xyz/testnet/account/0x07d6119ab3de685fec1cc0fbdb104276291ccdf7e541c89292db779a5cde792b) |
| Current escrow vault | [`0x1ee720b1b176020f76333ce82b4e28ef64de3f6ceb8245f3d1195dae27aebf22`](https://suiscan.xyz/testnet/object/0x1ee720b1b176020f76333ce82b4e28ef64de3f6ceb8245f3d1195dae27aebf22) |

A vault is **single use by design**: `release_audited_milestone` sets `is_active = false` so a company can never be charged twice for one job. Any vault linked here will therefore read `is_active: false, balance: 0` once its payout has run. That is the contract working, not a broken link. Run `scripts/new-escrow-vault.sh` to create a fresh funded one.

### Example transactions

| | |
| :--- | :--- |
| Package publish | [`AZpJBTzZ7dCADxS2qQnvMGfFfQ6Yd6K8CaKyKikAnu9m`](https://suiscan.xyz/testnet/tx/AZpJBTzZ7dCADxS2qQnvMGfFfQ6Yd6K8CaKyKikAnu9m) |
| Mock USDC faucet mint | [`46G5AsPw6sNdjK3TWVqG87pTzGFqeaCR32P99pms72kp`](https://suiscan.xyz/testnet/tx/46G5AsPw6sNdjK3TWVqG87pTzGFqeaCR32P99pms72kp) |
| Milestone payout, 90/10 split | [`74myhZT5X9mTaD47o8CpuCfBPiYPX9Gy6XvxgCTK3j3Z`](https://suiscan.xyz/testnet/tx/74myhZT5X9mTaD47o8CpuCfBPiYPX9Gy6XvxgCTK3j3Z) |
| Full end-to-end run (live AI review scored 81, then payout) | [`HKajqi4PVB7DvUF53vvpocwV3wkauew2Ui3Kwmr83Qej`](https://suiscan.xyz/testnet/tx/HKajqi4PVB7DvUF53vvpocwV3wkauew2Ui3Kwmr83Qej) |

## What is real and what is simulated

We would rather state this plainly than be asked about it.

| Part | Status |
| :--- | :--- |
| Move escrow contract | **Real.** Deployed on Sui testnet, compiles with `sui move build`, and the score gate is enforced on chain. |
| On-chain payouts | **Real.** Faucet mints and 90/10 milestone payouts have been broadcast and confirmed, with the explorer links above. |
| Gonka Router review | **Real.** Live API calls to two models in parallel. Without an API key the app falls back to canned results, and every screen that shows one labels it "Demo data, not a live Gonka call". |
| USDC balances | **Real.** Read from chain, through the server (see the note on JSON-RPC below). |
| Sponsored transactions | Real code end to end. In this build the release is executed server-side through the Sui CLI using the relayer's key. |
| Sign-in | **Simulated.** Picking a demo account sets a cookie. Production would verify a zkLogin JWT server-side. The addresses are real Sui addresses derived from fixed seeds, so they are stable and spendable, but they are not proof of identity. |
| Client files | Names only. File contents are not uploaded or stored. |
| Job storage | A JSON file on the server, shared between browser windows. Not a database. |

Nothing in the app invents data to fill an empty screen. Where there is nothing, it says so.

**A note on JSON-RPC.** Public Sui testnet fullnodes have disabled JSON-RPC, which is the transport `@mysten/sui` uses from the browser. Balance reads and transaction execution therefore go through our own server, which uses the Sui CLI. This is why the app needs the CLI installed rather than talking to the chain from the browser.

## Track alignment

**Sui Track 01 — Payments and Stablecoins.** The escrow release is one transaction that pays two parties from one vault (`contracts/sources/trustmesh_escrow.move`). Users never hold SUI: the relayer attaches and signs for gas, and the user's signature and the relayer's are submitted together.

**Sui Track 02 — AI × Sui.** The AI review's output is what authorises the on-chain call. The Gonka request ID and the score are passed into `release_audited_milestone` as Move arguments, and the contract rejects any score below 80, so the gate lives on chain rather than in the UI. The emitted event carries the request ID, so any payout traces back to the review that justified it.

**Gonka Track — AI for Society.** The review in `src/lib/gonkaEvaluator.ts` runs two checks in parallel: whether everything in the brief is present, and whether the work is genuinely finished rather than placeholders. Only the assigned student can start a review (`src/app/api/audit-milestone/route.ts`), so a company cannot quietly re-run it until it gets an answer it prefers.

## Setup and installation

### Prerequisites

- **Node.js 18.17 or newer** and npm
- **Sui CLI `testnet-v1.79.0`** — the balance read, the faucet and the on-chain release all go through it

Install the CLI by downloading the release for your platform from [MystenLabs/sui releases](https://github.com/MystenLabs/sui/releases/tag/testnet-v1.79.0) and extracting `sui` (or `sui.exe`) into a `tools/` folder at the repo root, which is where the app looks for it first. Confirm the version matches the one pinned in `Move.lock`:

```bash
./tools/sui.exe --version     # sui 1.79.0-46f18562f1f5
```

The CLI needs a funded testnet wallet to pay gas. On first run it will offer to create one; fund it at [faucet.sui.io](https://faucet.sui.io).

### Run the app

```bash
cd unipact-protocol/frontend
npm install
cp .env.example .env.local     # then fill it in, see below
npm run dev
```

Open <http://localhost:3000>. Sign in as a company in one browser window and as a student in another — both windows share the same job list, which is what makes the two-sided demo work.

### Environment variables

All are documented in `unipact-protocol/frontend/.env.example`. The app starts with every one blank; it simply cannot reach Sui, and the AI review returns canned results — both of which it says on screen.

| Variable | Needed for |
| :--- | :--- |
| `NEXT_PUBLIC_PACKAGE_ID` | Every on-chain call |
| `NEXT_PUBLIC_ESCROW_VAULT_ID` | Releasing a payment |
| `NEXT_PUBLIC_TREASURY_CAP_ID` | The Mock USDC faucet |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Where the 10% fee goes |
| `SPONSOR_PRIVATE_KEY_B64` | The relayer that pays network fees |
| `GONKA_ROUTER_API_KEY` | Live AI reviews; without it, canned results labelled as demo data |

### Build the Move package

```bash
cd unipact-protocol/contracts
sui move build
```

### Resetting between demo runs

A vault is single use, so each full run consumes one. To reset:

```bash
bash scripts/new-escrow-vault.sh 300
# put the printed vault id into NEXT_PUBLIC_ESCROW_VAULT_ID and src/lib/mockData.ts
rm unipact-protocol/frontend/.trustmesh-data.json
```

Then restart the dev server. Do not run `npm run build` while `npm run dev` is running — they share the `.next` directory and the dev server will start serving unstyled pages.

## Demo video

`TrustMesh_E2E_Demo.mp4` at the repo root — a 2m12s walkthrough of the full flow.

## Team members

| Name | Role |
| :--- | :--- |
| **Azizi bin Sahari** — azizisahari79@gmail.com | Team lead. Sui Move contract implementation and testnet deployment, Gonka Router multi-model integration, AI verifier. |
| **Adam Haikal bin Mohd Faizal** — adamhaikal.mf@gmail.com | Application architecture and code quality. Role-based access control, design system, on-chain verification and testing. Documentation. |
| **Amir Hakimi bin Osman** — amiricle2k@gmail.com | Feature development and documentation. |

## AI tools used

Declared as required by the organizers.

- **Gemini / Google Antigravity** — architecture decisions, Sui Move contract implementation, Gonka multi-model integration, UI development.
- **Claude (Anthropic)** — generated the initial codebase, then carried out the refactor from commit `8a5b683` onwards: removing fabricated transaction digests, deleting unused features, adding the session and permission layer, splitting the app into company and student routes, rebuilding the design system, and writing this README.
- **Gonka Router** — used at runtime as the product's own AI review feature, not as a development tool.

If any team member used another assistant, add it here before submitting.
