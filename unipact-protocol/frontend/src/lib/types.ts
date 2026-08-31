import { Keypair } from "@mysten/sui/cryptography";

export interface ZkLoginPersona {
  id: string;
  name: string;
  email: string;
  address: string;
  avatar: string;
  role: "student" | "payer" | "treasurer" | "merchant";
  keypair: Keypair;
  usdcBalance: number;
}

export interface ItemizedEntry {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // member addresses
}

export interface SplitMemberStatus {
  address: string;
  name: string;
  avatar: string;
  amount: number;
  dues: number;
  status: "pending" | "paid" | "disputed";
  paidTxDigest?: string;
  paidAt?: number;
}

export interface Bill {
  id: string;
  poolId: string;
  title: string;
  category: "Dining" | "Club Event" | "Hackathon Supplies" | "Campus Market" | "Travel";
  totalAmount: number;
  payerAddress: string;
  payerName: string;
  memberCount: number;
  amountPerMember: number;
  clubDueAmount: number;
  repaidCount: number;
  isFullySettled: boolean;
  createdAt: number;
  items?: ItemizedEntry[];
  splitMembers: SplitMemberStatus[];
}

export interface GroupPool {
  id: string;
  name: string;
  creator: string;
  clubTreasury: string;
  clubFeeBps: number; // e.g. 250 for 2.5%
  totalExpenses: number;
  totalSettled: number;
  treasuryBalance: number;
  isActive: boolean;
  bills: Bill[];
  members: {
    address: string;
    name: string;
    avatar: string;
    netBalance: number; // positive = owed money, negative = owes money
  }[];
}

export interface MerchantQRPayload {
  type: "merchant_pos" | "group_bill";
  version: "1.0";
  poolId?: string;
  billId?: string;
  merchantAddress: string;
  merchantName: string;
  title: string;
  amount: number;
  clubDues: number;
  category: string;
  expiresAt: number;
  items?: { name: string; price: number; qty: number }[];
}

export interface PTBExecutionResult {
  digest: string;
  executionTimeMs: number;
  gasSponsored: boolean;
  sponsorAddress: string;
  totalPaid: number;
  payerAmount: number;
  duesAmount: number;
  status: "success" | "failed";
  explorerUrl?: string;
  billId?: string;
  poolId?: string;
}

export interface MilestoneAuditResult {
  truthScore: number;
  reasoningTrace: string[];
  gonkaRequestId: string;
  isApproved: boolean;
  scopeScore?: number;
  qualityScore?: number;
  auditedAt?: string;
}

export const DEMO_PRESETS = {
  VALID_DELIVERABLE: {
    title: "Production Sui PTB Gas Relayer & Frontend UI",
    spec: "Develop a mobile-friendly Next.js web interface integrating zkLogin, dual-signed sponsored transactions, and atomic PTB settlements in testnet USDC.",
    submission: "PR #14 merged to main. Implemented Move contracts (GroupPool, Bill, AdminCap), @mysten/sui PTB builders, /api/sponsor gas relayer endpoint, and camera QR scanner.",
    mockResult: {
      truthScore: 94,
      isApproved: true,
      scopeScore: 95,
      qualityScore: 92,
      reasoningTrace: [
        "Verified zkLogin integration with deterministic address derivation and ephemeral keypair session binding.",
        "Validated sponsored PTB builder bundling coin splits, payer reimbursement, and MoveCall in a single transaction.",
        "Verified camera QR scanner and dynamic merchant POS checkout interfaces.",
        "Zero placeholder code or missing dependencies detected.",
      ],
      gonkaRequestId: "gnk-req-2026-unipact-pass",
      auditedAt: new Date().toISOString(),
    },
  },
  INCOMPLETE_DELIVERABLE: {
    title: "Incomplete / Placeholder Submission",
    spec: "Implement full end-to-end atomic split repayment with dual-signed sponsored transactions.",
    submission: "TODO: write Move contracts later. Added a placeholder button that does not execute on-chain.",
    mockResult: {
      truthScore: 42,
      isApproved: false,
      scopeScore: 40,
      qualityScore: 45,
      reasoningTrace: [
        "Deficiency: Crucial Move smart contracts and PTB execution blocks are missing.",
        "Deficiency: Placeholder TODO remarks found in source files.",
        "Truth score below 80% threshold. Automated PTB release locked.",
      ],
      gonkaRequestId: "gnk-req-2026-unipact-reject",
      auditedAt: new Date().toISOString(),
    },
  },
};
