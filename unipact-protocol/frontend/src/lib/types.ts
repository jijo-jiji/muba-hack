/** The three kinds of people who use TrustMesh. */
export type UserRole = "company" | "student" | "admin";

/**
 * A demo account. Deliberately plain JSON so it can live in a cookie and travel
 * between the server and the browser. Signing keys are never stored here; they
 * are re-derived from the account id in lib/zklogin.ts.
 */
export interface Account {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address: string;
  /** Company accounts only: the business posting the work. */
  organisation?: string;
  /** Student accounts only. */
  university?: string;
  course?: string;
}

export type ProjectScope = "software_development" | "digital_marketing";

/** A file the company shares with the student so they can do the work. */
export interface ClientAsset {
  id: string;
  name: string;
  type: "brief" | "document" | "brand_asset" | "raw_video";
  sizeMb: number;
  uploadedAt: number;
}

/** What the student hands back when the work is done. */
export interface Deliverable {
  link: string;
  summary: string;
  submittedAt: number;
}

export interface JobApplication {
  studentId: string;
  studentName: string;
  university: string;
  message: string;
  appliedAt: number;
}

/**
 * How far along a job is. It only ever moves forwards, and each step is taken by
 * a different party, which is what the permission rules are built around.
 */
export type JobStatus =
  | "open" // company funded it, students can apply
  | "assigned" // company accepted a student
  | "submitted" // student sent the work in
  | "audited" // the AI review has run
  | "paid"; // escrow released

/** Money actually leaving escrow. */
export interface PaymentRecord {
  studentPayoutUsdc: number;
  platformFeeUsdc: number;
  releasedAt: number;
  /** Set only when a real transaction was confirmed on Sui. */
  digest?: string;
  /** Set only alongside a real digest. */
  explorerUrl?: string;
  /** Says plainly what happened, including when nothing was broadcast. */
  note: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  scope: ProjectScope;
  /** Software jobs: the stack the company expects. Marketing jobs: the platforms. */
  tags: string[];
  budgetUsdc: number;
  companyId: string;
  companyName: string;
  escrowStatus: "unfunded" | "locked" | "released";
  status: JobStatus;
  assignedStudentId?: string;
  assignedStudentName?: string;
  applications: JobApplication[];
  clientAssets: ClientAsset[];
  deliverable?: Deliverable;
  audit?: MilestoneAuditResult;
  payment?: PaymentRecord;
  createdAt: number;
}

/**
 * Where an audit result came from. Only "live" means a real Gonka Router call
 * happened; everything else is canned data kept so the demo cannot fail on stage.
 */
export type AuditSource = "live" | "demo_preset" | "keyword_fallback";

export interface MilestoneAuditResult {
  /** How closely the submitted work matches what was asked for, 0 to 100. */
  truthScore: number;
  reasoningTrace: string[];
  gonkaRequestId: string;
  isApproved: boolean;
  scopeScore?: number;
  qualityScore?: number;
  auditedAt?: string;
  /** True only when a real Gonka Router API response produced this result. */
  isLiveGonkaCall: boolean;
  source: AuditSource;
}

/**
 * Canned audit outcomes. They exist so a bad venue network cannot kill the live
 * demo. Anything built from these is tagged isLiveGonkaCall: false and the UI
 * labels it as demo data.
 */
export const DEMO_PRESETS = {
  VALID_DELIVERABLE: {
    mockResult: {
      truthScore: 94,
      isApproved: true,
      scopeScore: 95,
      qualityScore: 92,
      reasoningTrace: [
        "Every feature listed in the brief is present and working.",
        "The payment split matches the agreed 90/10 arrangement.",
        "Client files were handled and referenced correctly.",
        "No placeholder or unfinished code was found.",
      ],
      gonkaRequestId: "gnk-req-2026-trustmesh-pass",
      auditedAt: new Date().toISOString(),
      isLiveGonkaCall: false,
      source: "demo_preset" as AuditSource,
    },
  },
  INCOMPLETE_DELIVERABLE: {
    mockResult: {
      truthScore: 42,
      isApproved: false,
      scopeScore: 40,
      qualityScore: 45,
      reasoningTrace: [
        "Core parts of the brief are missing from the submission.",
        "Placeholder TODO comments were found in the submitted code.",
        "Score is below 80, so the payment stays locked.",
      ],
      gonkaRequestId: "gnk-req-2026-trustmesh-reject",
      auditedAt: new Date().toISOString(),
      isLiveGonkaCall: false,
      source: "demo_preset" as AuditSource,
    },
  },
};
