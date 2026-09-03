import { Keypair } from "@mysten/sui/cryptography";

export interface ZkLoginPersona {
  id: string;
  name: string;
  email: string;
  address: string;
  avatar: string;
  role: "student" | "payer" | "treasurer" | "merchant" | "company";
  keypair: Keypair;
  usdcBalance: number;
  university?: string;
  clubAffiliation?: string;
}

export type ProjectScope = "software_development" | "digital_marketing";

export type SoftwareSubType = "Landing Page / Website" | "ERP" | "HRMS" | "CRM" | "Custom Automation Tool";

export interface ClientAsset {
  id: string;
  name: string;
  type: "document" | "brand_asset" | "raw_video" | "brief";
  sizeMb: number;
  url: string;
  uploadedAt: number;
}

export interface JobDeliverable {
  id: string;
  title: string;
  type: "github_pr" | "live_demo" | "video_deliverable" | "documentation";
  link: string;
  summary: string;
  submittedAt: number;
}

export interface ProjectReport {
  id: string;
  jobId: string;
  jobTitle: string;
  scope: ProjectScope;
  companyName: string;
  studentName: string;
  studentAddress: string;
  university: string;
  budgetUsdc: number;
  studentPayoutUsdc: number;
  platformFeeUsdc: number;
  truthScore: number;
  gonkaRequestId: string;
  completedAt: string;
  skillsApplied: string[];
  outcomeSummary: string;
}

export interface TrustMeshJob {
  id: string;
  title: string;
  description: string;
  scope: ProjectScope;
  // Software Dev Specific
  softwareSubType?: SoftwareSubType;
  techStack?: string[];
  projectOutcome?: string;
  // Digital Marketing Specific
  campaignObjective?: string;
  targetPlatforms?: string[];
  kpiTargets?: string;
  // Financial & Escrow
  budgetUsdc: number;
  escrowVaultId: string;
  escrowStatus: "unfunded" | "locked" | "released" | "refunded";
  // Company Info
  companyName: string;
  companyEmail: string;
  companyVerification: "corporate_silent" | "ssm_verified" | "pending_ssm";
  // Assignment
  assignedStudent?: {
    id: string;
    name: string;
    email: string;
    address: string;
    university: string;
    avatar: string;
  };
  status: "open" | "matched" | "in_progress" | "audited" | "settled";
  clientAssets: ClientAsset[];
  deliverables: JobDeliverable[];
  projectReport?: ProjectReport;
  createdAt: number;
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
    netBalance: number;
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
    title: "Production ERP & HRMS Leave Module on Sui",
    spec: "Develop a mobile-friendly automation portal integrating company authentication, employee leave requests, approval routing, and gasless audit settlements in testnet USDC.",
    submission: "PR #18 merged to main branch. Implemented Move escrow smart contracts, Gonka Router verification, Sui PTB relayer signing, and client asset repository.",
    mockResult: {
      truthScore: 94,
      isApproved: true,
      scopeScore: 95,
      qualityScore: 92,
      reasoningTrace: [
        "Verified full functional compliance with SME project specification.",
        "Verified gasless PTB execution routing 90% to student and 10% to TrustMesh Treasury.",
        "Verified client asset handling and confidential repository permissions.",
        "Zero placeholder code or unfinished TODO comments detected.",
      ],
      gonkaRequestId: "gnk-req-2026-trustmesh-pass",
      auditedAt: new Date().toISOString(),
    },
  },
  INCOMPLETE_DELIVERABLE: {
    title: "Incomplete / Placeholder Submission",
    spec: "Implement complete milestone deliverable with end-to-end integration and asset verification.",
    submission: "TODO: integrate smart contracts later. Added dummy UI placeholder.",
    mockResult: {
      truthScore: 42,
      isApproved: false,
      scopeScore: 40,
      qualityScore: 45,
      reasoningTrace: [
        "Deficiency: Core milestone contracts and PTB execution blocks are missing.",
        "Deficiency: Found placeholder TODO comments in code files.",
        "Truth score below 80% threshold. Automated PTB release locked.",
      ],
      gonkaRequestId: "gnk-req-2026-trustmesh-reject",
      auditedAt: new Date().toISOString(),
    },
  },
};
