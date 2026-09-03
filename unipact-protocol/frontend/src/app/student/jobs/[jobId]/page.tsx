"use client";

import Link from "next/link";
import { useJob } from "@/hooks/useJobs";
import { useAccount } from "@/components/shared/SessionProvider";
import {
  canApply,
  canSubmitDeliverable,
  canTriggerAudit,
  canViewAssets,
  canViewAudit,
} from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { JobStatusBadge } from "@/components/shared/JobStatusBadge";
import { JobOverview } from "@/components/shared/JobOverview";
import { ClientAssets } from "@/components/shared/ClientAssets";
import { SubmissionPanel } from "@/components/shared/SubmissionPanel";
import { AuditReport } from "@/components/shared/AuditReport";
import { PaymentPanel } from "@/components/shared/PaymentPanel";
import { ApplyForm } from "@/components/student/ApplyForm";
import { SubmitWorkForm } from "@/components/student/SubmitWorkForm";
import { RunReview } from "@/components/student/RunReview";

export default function StudentJobPage({ params }: { params: { jobId: string } }) {
  const account = useAccount();
  const { job, isLoading, error, refresh } = useJob(params.jobId);

  if (isLoading && !job) return <p className="text-body text-ink-soft">Loading…</p>;

  // The API refuses jobs that are neither open nor assigned to this student.
  if (error || !job) {
    return (
      <div className="space-y-4">
        <h1 className="text-page-title font-semibold">This job is not available</h1>
        <p className="text-body text-ink-soft">{error ?? "It may have been filled or removed."}</p>
        <Link href="/student" className="text-body text-accent hover:underline">
          Back to your dashboard
        </Link>
      </div>
    );
  }

  const isMine = job.assignedStudentId === account.id;
  const hasApplied = job.applications.some((entry) => entry.studentId === account.id);

  return (
    <div className="space-y-8">
      <Link href="/student" className="text-small text-ink-soft hover:text-ink">
        ← Your dashboard
      </Link>

      <PageHeader
        title={job.title}
        description={`Posted by ${job.companyName}`}
        action={<JobStatusBadge status={job.status} />}
      />

      <JobOverview job={job} />

      {canApply(account, job) && <ApplyForm job={job} onApplied={refresh} />}

      {hasApplied && job.status === "open" && (
        <p className="text-body text-ink-soft">
          You have applied. {job.companyName} will pick someone from the applications.
        </p>
      )}

      {!isMine && !hasApplied && job.status !== "open" && (
        <p className="text-body text-ink-soft">This job has already been assigned to someone else.</p>
      )}

      {canViewAssets(account, job) && <ClientAssets assets={job.clientAssets} />}

      <SubmissionPanel job={job} />

      {canSubmitDeliverable(account, job) && <SubmitWorkForm job={job} onSubmitted={refresh} />}

      {canTriggerAudit(account, job) && <RunReview job={job} onReviewed={refresh} />}

      {canViewAudit(account, job) && job.audit && <AuditReport audit={job.audit} />}

      {job.status === "audited" && job.audit?.isApproved && isMine && !job.payment && (
        <p className="text-body text-ink-soft">
          Your work passed. {job.companyName} can now release the payment.
        </p>
      )}

      {job.payment && <PaymentPanel payment={job.payment} />}
    </div>
  );
}
