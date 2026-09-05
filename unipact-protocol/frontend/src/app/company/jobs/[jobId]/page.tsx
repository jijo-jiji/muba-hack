"use client";

import Link from "next/link";
import { useJob } from "@/hooks/useJobs";
import { useAccount } from "@/components/shared/SessionProvider";
import { canAcceptApplicant, canReleasePayment, canViewAudit } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackLink } from "@/components/ui/BackLink";
import { JobStatusBadge } from "@/components/shared/JobStatusBadge";
import { JobOverview } from "@/components/shared/JobOverview";
import { ClientAssets } from "@/components/shared/ClientAssets";
import { SubmissionPanel } from "@/components/shared/SubmissionPanel";
import { AuditReport } from "@/components/shared/AuditReport";
import { PaymentPanel } from "@/components/shared/PaymentPanel";
import { ApplicantList } from "@/components/company/ApplicantList";
import { ReleasePayment } from "@/components/company/ReleasePayment";

export default function CompanyJobPage({ params }: { params: { jobId: string } }) {
  const account = useAccount();
  const { job, isLoading, error, refresh } = useJob(params.jobId);

  if (isLoading && !job) return <p className="text-body text-ink-soft">Loading…</p>;

  // The API refuses jobs this company does not own, so a guessed URL lands here.
  if (error || !job) {
    return (
      <div className="space-y-4">
        <h1 className="text-page-title font-semibold">This job is not available</h1>
        <p className="text-body text-ink-soft">{error ?? "It may have been removed."}</p>
        <Link href="/company" className="text-body text-accent hover:underline">
          Back to your jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackLink href="/company">Your jobs</BackLink>

      <PageHeader title={job.title} action={<JobStatusBadge status={job.status} />} />

      <JobOverview job={job} />

      {job.status === "open" && (
        <ApplicantList job={job} canAccept={canAcceptApplicant(account, job)} onAccepted={refresh} />
      )}

      {job.assignedStudentName && job.status !== "open" && (
        <p className="text-body text-ink-soft">
          Assigned to <span className="font-medium text-ink">{job.assignedStudentName}</span>.
        </p>
      )}

      <ClientAssets assets={job.clientAssets} />

      <SubmissionPanel job={job} />

      {job.status === "assigned" && (
        <p className="text-body text-ink-soft">
          Waiting for {job.assignedStudentName} to submit the work.
        </p>
      )}

      {job.status === "submitted" && (
        <p className="text-body text-ink-soft">
          The work has been submitted. The AI review runs next, started by the student.
        </p>
      )}

      {canViewAudit(account, job) && job.audit && <AuditReport audit={job.audit} />}

      {canReleasePayment(account, job) && (
        <ReleasePayment account={account} job={job} onReleased={refresh} />
      )}

      {job.status === "audited" && job.audit && !canReleasePayment(account, job) && (
        <p className="text-body text-ink-soft">
          The score is below the threshold, so the money stays in escrow until the student submits
          revised work.
        </p>
      )}

      {job.payment && <PaymentPanel payment={job.payment} />}
    </div>
  );
}
