"use client";

import Link from "next/link";
import { useJobs } from "@/hooks/useJobs";
import { useAccount } from "@/components/shared/SessionProvider";
import { JobStatusBadge } from "@/components/shared/JobStatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stat } from "@/components/ui/Stat";

export default function CompanyDashboard() {
  const account = useAccount();
  const { jobs, isLoading, error } = useJobs();

  const locked = jobs
    .filter((job) => job.escrowStatus === "locked")
    .reduce((total, job) => total + job.budgetUsdc, 0);
  const paidOut = jobs
    .filter((job) => job.payment)
    .reduce((total, job) => total + (job.payment?.studentPayoutUsdc ?? 0), 0);
  const awaitingYou = jobs.filter((job) => job.status === "audited").length;

  return (
    <div className="space-y-10">
      <PageHeader
        title={account.organisation ?? account.name}
        description="Post a project, lock the budget, and release it once the work has been checked."
        action={<ButtonLink href="/company/jobs/new">Post a job</ButtonLink>}
      />

      <Card>
        <CardBody className="grid gap-8 sm:grid-cols-3">
          <Stat label="Held in escrow" value={`${locked.toFixed(2)} USDC`} />
          <Stat label="Paid to students" value={`${paidOut.toFixed(2)} USDC`} />
          <Stat
            label="Waiting on you"
            value={String(awaitingYou)}
            note={awaitingYou === 1 ? "1 job is reviewed and ready to pay" : "jobs reviewed and ready to pay"}
          />
        </CardBody>
      </Card>

      <section className="space-y-4">
        <h2 className="text-section font-semibold">Your jobs</h2>

        {error && <p className="text-body text-danger">{error}</p>}
        {isLoading && jobs.length === 0 && <p className="text-body text-ink-soft">Loading…</p>}

        {!isLoading && jobs.length === 0 && (
          <EmptyState
            title="You have not posted a job yet"
            description="Describe the work, set a budget, and the money is held until the work is checked."
            action={<ButtonLink href="/company/jobs/new">Post a job</ButtonLink>}
          />
        )}

        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/company/jobs/${job.id}`}
                className="block rounded-card border border-line bg-surface px-6 py-5 transition-colors hover:border-line-strong"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-card-title font-medium text-ink">{job.title}</p>
                    <p className="mt-1 text-small text-ink-soft">
                      {job.budgetUsdc.toFixed(2)} USDC ·{" "}
                      {job.assignedStudentName
                        ? `Assigned to ${job.assignedStudentName}`
                        : `${job.applications.length} ${job.applications.length === 1 ? "application" : "applications"}`}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
