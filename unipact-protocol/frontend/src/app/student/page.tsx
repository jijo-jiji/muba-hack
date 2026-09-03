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
import { Job } from "@/lib/types";

export default function StudentDashboard() {
  const account = useAccount();
  const { jobs, isLoading, error } = useJobs();

  const mine = jobs.filter((job) => job.assignedStudentId === account.id);
  const open = jobs.filter((job) => job.status === "open");
  const earned = mine.reduce((total, job) => total + (job.payment?.studentPayoutUsdc ?? 0), 0);
  const pending = mine
    .filter((job) => job.status !== "paid")
    .reduce((total, job) => total + job.budgetUsdc * 0.9, 0);

  return (
    <div className="space-y-10">
      <PageHeader
        title={account.name}
        description={`${account.course ?? "Student"} · ${account.university ?? ""}`}
        action={
          <ButtonLink href={`/portfolio/${account.id}`} variant="secondary">
            View your public profile
          </ButtonLink>
        }
      />

      <Card>
        <CardBody className="grid gap-8 sm:grid-cols-3">
          <Stat label="Earned" value={`${earned.toFixed(2)} USDC`} />
          <Stat label="Waiting on work in progress" value={`${pending.toFixed(2)} USDC`} />
          <Stat label="Jobs you are on" value={String(mine.length)} />
        </CardBody>
      </Card>

      {error && <p className="text-body text-danger">{error}</p>}

      <section className="space-y-4">
        <h2 className="text-section font-semibold">Your jobs</h2>
        {mine.length === 0 ? (
          <EmptyState
            title="You are not on a job yet"
            description="Apply to something below. The budget is already locked in escrow before you start."
          />
        ) : (
          <JobList jobs={mine} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-section font-semibold">Open jobs</h2>
        {isLoading && jobs.length === 0 && <p className="text-body text-ink-soft">Loading…</p>}
        {!isLoading && open.length === 0 ? (
          <EmptyState
            title="No open jobs right now"
            description="New jobs appear here within a few seconds of a company posting one."
          />
        ) : (
          <JobList jobs={open} showCompany />
        )}
      </section>
    </div>
  );
}

function JobList({ jobs, showCompany }: { jobs: Job[]; showCompany?: boolean }) {
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/student/jobs/${job.id}`}
            className="block rounded-card border border-line bg-surface px-6 py-5 transition-colors hover:border-line-strong"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-card-title font-medium text-ink">{job.title}</p>
                <p className="mt-1 text-small text-ink-soft">
                  {(job.budgetUsdc * 0.9).toFixed(2)} USDC to you
                  {showCompany ? ` · ${job.companyName}` : ""}
                </p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
