import Link from "next/link";
import { listJobs } from "@/lib/server/jobStore";
import { TREASURY_ADDRESS, isRealAddress } from "@/lib/suiClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddressChip } from "@/components/ui/AddressChip";
import { JobStatusBadge } from "@/components/shared/JobStatusBadge";

/**
 * The platform's view of everything on the marketplace.
 *
 * This is read-only on purpose. Account verification and dispute resolution are
 * in the spec but are not built, and there is no treasury withdrawal to offer
 * because the Move contract pays the platform fee straight to the treasury
 * address as part of the release. Rather than show buttons that do nothing, the
 * page says which of those exist and which do not.
 */
export default function AdminDashboard() {
  const jobs = listJobs();

  const locked = jobs
    .filter((job) => job.escrowStatus === "locked")
    .reduce((total, job) => total + job.budgetUsdc, 0);
  const feesEarned = jobs.reduce((total, job) => total + (job.payment?.platformFeeUsdc ?? 0), 0);
  const paidJobs = jobs.filter((job) => job.status === "paid").length;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Platform"
        description="Every job on TrustMesh, across all companies and students."
      />

      <Card>
        <CardBody className="grid gap-8 sm:grid-cols-4">
          <Stat label="Jobs posted" value={String(jobs.length)} />
          <Stat label="Jobs paid out" value={String(paidJobs)} />
          <Stat label="Held in escrow" value={`${locked.toFixed(2)} USDC`} />
          <Stat label="Platform fees earned" value={`${feesEarned.toFixed(2)} USDC`} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treasury</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-body text-ink-soft">
            There is nothing to withdraw here. The escrow contract sends the 10% fee directly to the
            treasury address in the same transaction that pays the student, so fees never sit in a
            platform balance waiting to be collected.
          </p>
          {isRealAddress(TREASURY_ADDRESS) ? (
            <AddressChip label="Treasury address" value={TREASURY_ADDRESS} />
          ) : (
            <p className="text-small text-ink-faint">
              No treasury address is configured yet. Set NEXT_PUBLIC_TREASURY_ADDRESS in .env.local
              to a real Sui address.
            </p>
          )}
        </CardBody>
      </Card>

      <section className="space-y-4">
        <h2 className="text-section font-semibold">All jobs</h2>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs have been posted yet" />
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="rounded-card border border-line bg-surface px-6 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-card-title font-medium text-ink">{job.title}</p>
                    <p className="mt-1 text-small text-ink-soft">
                      {job.companyName} · {job.budgetUsdc.toFixed(2)} USDC
                      {job.assignedStudentName ? ` · ${job.assignedStudentName}` : ""}
                    </p>
                    {job.audit && (
                      <p className="mt-1 text-small text-ink-faint">
                        Reviewed {job.audit.truthScore}/100
                        {job.audit.isLiveGonkaCall ? "" : " (demo data)"}
                        {job.payment && !job.payment.digest
                          ? " · payment not submitted on chain"
                          : ""}
                      </p>
                    )}
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Not built</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-body text-ink-soft">
            The spec also gives this account company verification against SSM records, student
            university verification, and dispute resolution. None of those are implemented, and
            there is no data behind them, so they are named here rather than mocked up.
          </p>
          <Link href="/" className="mt-4 inline-block text-small text-accent hover:underline">
            Back to the landing page
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
