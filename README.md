# muba-hack

## UniPact Sui &mdash; Gasless zkLogin Bill Splitter & Merchant POS

> **MUBA Hacks 2026 Submission**  
> Instant zkLogin Onboarding &bull; Gasless Sponsored PTBs &bull; Dynamic Merchant/Club POS QRs &bull; Shared GroupPool Ledger &bull; AI-Audited Milestone Escrow

---

## ⚡ Core Features

1. **Instant zkLogin Onboarding**:
   - Web2 Google OAuth sign-in with ephemeral Ed25519 session management.
   - Groth16 zero-knowledge proof generation deriving deterministic Sui addresses without seed phrases or browser extension installs.

2. **Gasless Stablecoin Settlements**:
   - Backend gas station / relayer (`/api/sponsor`) maintaining an operational SUI gas pool.
   - Dual-signature PTB flow: User signs sender intent, Relayer signs gas payment. Users only see and spend their testnet USDC.

3. **Atomic Bill Splitting via PTBs (`<500ms`)**:
   - Single-transaction Programmable Transaction Blocks bundling:
     - `SplitCoins(Coin<USDC>, [payerShare, clubDues])`
     - Direct repayment routing to original payer address.
     - Platform/club treasury dues routing.
     - Move call to `group_pool::settle_member_split` updating shared ledger state atomically.

4. **Merchant & Club POS QR Terminal**:
   - **Dynamic QR Generator**: Generates payment request QR codes for campus stalls, student club dues, and dining tabs.
   - **Mobile Camera QR Scanner**: In-browser camera scanner with instant PTB pre-fill and one-tap gasless execution.

5. **Sui Move Smart Contracts (`contracts/sources/`)**:
   - `group_pool.move`: `GroupPool` shared object, `Bill` struct, and `AdminCap` capability pattern for dispute arbitration.
   - `unipact_escrow.move`: Milestone vault escrow with Gonka AI verification.

---

## 🚀 Quick Start

### 1. Frontend & Relayer Setup
```bash
cd unipact-protocol/frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Move Contracts
```bash
cd unipact-protocol/contracts
sui move build
sui move test
```

---

## 📁 Repository Structure

```
├── contracts/
│   ├── Move.toml
│   └── sources/
│       ├── group_pool.move       # Shared GroupPool, Bill, and AdminCap contracts
│       └── unipact_escrow.move   # Milestone escrow & Mock USDC
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── sponsor/      # Relayer Gas Station sponsorship API
│   │   │   │   └── audit-milestone/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Main dApp interface
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navigation, zkLogin badge, gasless status
│   │   │   ├── BillSplitter.tsx  # Atomic bill split & PTB execution
│   │   │   ├── MerchantPOS.tsx   # Dynamic QR code terminal
│   │   │   ├── QRScannerModal.tsx# Camera QR scanner
│   │   │   ├── GroupLedger.tsx   # Shared ledger balance matrix
│   │   │   ├── PTBVisualizer.tsx # Step-by-step PTB command inspector
│   │   │   ├── ZkLoginModal.tsx  # Google zkLogin & persona switcher
│   │   │   └── ReceiptModal.tsx  # Sub-500ms receipt confirmation
│   │   ├── hooks/
│   │   │   └── useDualSignSponsoredTx.ts # Dual-sign sponsored transaction hook
│   │   └── lib/
│   │       ├── ptbBuilder.ts     # PTB transaction builder
│   │       ├── zklogin.ts        # zkLogin & ephemeral key manager
│   │       └── types.ts
│   └── package.json
└── README.md
```
