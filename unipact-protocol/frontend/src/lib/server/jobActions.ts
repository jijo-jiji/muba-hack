import { Account, Job, PaymentRecord } from "@/lib/types";
import {
  canAcceptApplicant,
  canApply,
  canReleasePayment,
  canSubmitDeliverable,
} from "@/lib/auth/permissions";

export interface ActionFailure {
  error: string;
  status: number;
}

export type ActionResult = { job: Job } | ActionFailure;

export function isFailure(result: ActionResult): result is ActionFailure {
  return "error" in result;
}

const PLATFORM_FEE_RATE = 0.1;

/** A student puts their name forward for an open job. */
export function applyToJob(account: Account, job: Job, message: string): ActionResult {
  if (!canApply(account, job)) {
    return { error: "You cannot apply to this job", status: 403 };
  }
  return {
    job: {
      ...job,
      applications: [
        ...job.applications,
        {
          studentId: account.id,
          studentName: account.name,
          university: account.university ?? "",
          message: message.slice(0, 1000),
          appliedAt: Date.now(),
        },
      ],
    },
  };
}

/** The company picks one applicant. The job then belongs to that student alone. */
export function acceptApplicant(account: Account, job: Job, studentId: string): ActionResult {
  if (!canAcceptApplicant(account, job)) {
    return { error: "You cannot accept applicants for this job", status: 403 };
  }
  const application = job.applications.find((entry) => entry.studentId === studentId);
  if (!application) {
    return { error: "That student did not apply for this job", status: 400 };
  }
  return {
    job: {
      ...job,
      status: "assigned",
      assignedStudentId: application.studentId,
      assignedStudentName: application.studentName,
    },
  };
}

/** The assigned student sends the finished work in. */
export function submitDeliverable(
  account: Account,
  job: Job,
  link: string,
  summary: string
): ActionResult {
  if (!canSubmitDeliverable(account, job)) {
    return { error: "You cannot submit work for this job", status: 403 };
  }
  if (!summary.trim()) {
    return { error: "Describe what you delivered", status: 400 };
  }
  return {
    job: {
      ...job,
      status: "submitted",
      deliverable: { link: link.trim(), summary: summary.trim(), submittedAt: Date.now() },
    },
  };
}

/**
 * Records a released payment. The transaction itself is signed and broadcast in
 * the company's browser, because that is where the signing key is; this only
 * writes down what happened. Digest and explorer link are stored only when the
 * browser reports a confirmed transaction, so an unbroadcast release is recorded
 * as exactly that.
 */
export function recordRelease(
  account: Account,
  job: Job,
  outcome: { digest?: string; explorerUrl?: string; note: string }
): ActionResult {
  if (!canReleasePayment(account, job)) {
    return { error: "This job is not cleared for payment", status: 403 };
  }

  const platformFeeUsdc = Number((job.budgetUsdc * PLATFORM_FEE_RATE).toFixed(2));
  const studentPayoutUsdc = Number((job.budgetUsdc - platformFeeUsdc).toFixed(2));

  const payment: PaymentRecord = {
    studentPayoutUsdc,
    platformFeeUsdc,
    releasedAt: Date.now(),
    digest: outcome.digest,
    explorerUrl: outcome.digest ? outcome.explorerUrl : undefined,
    note: outcome.note,
  };

  return { job: { ...job, status: "paid", escrowStatus: "released", payment } };
}
