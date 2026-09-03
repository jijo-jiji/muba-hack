import { Account, Job } from "@/lib/types";

/**
 * One place that answers "is this person allowed to do this?".
 *
 * Every rule below is checked twice: once in the UI so we do not show a button
 * that cannot work, and once in the API route so that hiding the button is not
 * the only thing stopping someone. Several rules are about ownership rather than
 * role: a student may submit work, but only on the job they were actually given,
 * so changing the job id in the URL gets them nowhere.
 */

export const PASS_THRESHOLD = 80;

type Maybe<T> = T | null | undefined;

function is(account: Maybe<Account>, role: Account["role"]): boolean {
  return account?.role === role;
}

function ownsJob(account: Maybe<Account>, job: Maybe<Job>): boolean {
  return Boolean(account && job && job.companyId === account.id);
}

function isAssignedTo(account: Maybe<Account>, job: Maybe<Job>): boolean {
  return Boolean(account && job && job.assignedStudentId === account.id);
}

/** Post a job and lock the budget into escrow. */
export function canPostJob(account: Maybe<Account>): boolean {
  return is(account, "company");
}

/** Attach client files to a job. */
export function canUploadAssets(account: Maybe<Account>, job: Maybe<Job>): boolean {
  return is(account, "admin") || ownsJob(account, job);
}

/** See the list of open jobs. */
export function canBrowseJobs(account: Maybe<Account>): boolean {
  return is(account, "student") || is(account, "admin");
}

/** Apply for a job. Only students, only jobs still open, and not twice. */
export function canApply(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!is(account, "student") || !job || job.status !== "open") return false;
  return !job.applications.some((application) => application.studentId === account!.id);
}

/** Accept one of the applicants. */
export function canAcceptApplicant(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!job || job.status !== "open") return false;
  return is(account, "admin") || ownsJob(account, job);
}

/** Open the company's files for a job. Students only get this for their own job. */
export function canViewAssets(account: Maybe<Account>, job: Maybe<Job>): boolean {
  return is(account, "admin") || ownsJob(account, job) || isAssignedTo(account, job);
}

/** Send the finished work in. Only the student who was given the job. */
export function canSubmitDeliverable(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!job) return false;
  return is(account, "student") && isAssignedTo(account, job) && job.status === "assigned";
}

/** Start the AI review. The student does this on their own submission. */
export function canTriggerAudit(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!job || job.status !== "submitted") return false;
  return is(account, "admin") || (is(account, "student") && isAssignedTo(account, job));
}

/** Read the AI review once it exists. */
export function canViewAudit(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!job?.audit) return false;
  return is(account, "admin") || ownsJob(account, job) || isAssignedTo(account, job);
}

/**
 * Release the money. The company that funded the job, and only once the review
 * has scored the work at or above the threshold.
 */
export function canReleasePayment(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!job || job.status !== "audited" || !job.audit) return false;
  return ownsJob(account, job) && job.audit.truthScore >= PASS_THRESHOLD;
}

/** Take the platform's share out of the treasury. */
export function canWithdrawTreasury(account: Maybe<Account>): boolean {
  return is(account, "admin");
}

/** Open a job's detail page at all. Used by both dashboards to reject URL guessing. */
export function canViewJob(account: Maybe<Account>, job: Maybe<Job>): boolean {
  if (!account || !job) return false;
  if (account.role === "admin") return true;
  if (account.role === "company") return ownsJob(account, job);
  // A student sees a job if it is theirs, or if it is still open to apply for.
  return isAssignedTo(account, job) || job.status === "open";
}
