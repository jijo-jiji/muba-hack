import Link from "next/link";
import { notFound } from "next/navigation";
import { findAccount } from "@/lib/zklogin";
import { listJobs } from "@/lib/server/jobStore";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/PageHeader";
import { AddressChip } from "@/components/ui/AddressChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stat } from "@/components/ui/Stat";

/**
 * A student's public record. Anyone with the link can open it, signed in or not,
 * which is the point: it is proof of work you can send to someone.
 *
 * Only jobs that were actually paid appear here.
 */
export default function PortfolioPage({ params }: { params: { studentId: string } }) {
  const student = findAccount(params.studentId);
  if (!student || student.role !== "student") notFound();

  const completed = listJobs().filter(
    (job) => job.assignedStudentId === student.id && job.status === "paid"
  );
  const earned = completed.reduce((total, job) => total + (job.payment?.studentPayoutUsdc ?? 0), 0);

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <Link href="/" className="text-card-title font-semibold text-ink">
        TrustMesh
      </Link>

      <header className="mt-12 flex items-center gap-4">
        <Avatar name={student.name} className="h-12 w-12 text-body" />
        <div>
          <h1 className="text-page-title font-semibold">{student.name}</h1>
          <p className="mt-1 text-body text-ink-soft">
            {student.course} · {student.university}
          </p>
        </div>
      </header>

      <Card className="mt-8">
        <CardBody className="grid gap-8 sm:grid-cols-3">
          <Stat label="Jobs completed" value={String(completed.length)} />
          <Stat label="Earned" value={`${earned.toFixed(2)} USDC`} />
          <Stat label="Wallet" value={<AddressChip value={student.address} />} />
        </CardBody>
      </Card>

      <h2 className="mt-16 text-section font-semibold">Completed work</h2>
      <div className="mt-4">
        {completed.length === 0 ? (
          <EmptyState
            title="No completed jobs yet"
            description="Jobs appear here once the company has released the payment."
          />
        ) : (
          <ul className="space-y-3">
            {completed.map((job) => (
              <li key={job.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-card-title font-medium text-ink">{job.title}</p>
                        <p className="mt-1 text-small text-ink-soft">{job.companyName}</p>
                      </div>
                      {job.audit && (
                        <Badge tone={job.audit.isLiveGonkaCall ? "success" : "warning"}>
                          Reviewed {job.audit.truthScore}/100
                          {job.audit.isLiveGonkaCall ? "" : " · demo data"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-body text-ink-soft">{job.description}</p>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-small font-medium text-ink">
                          {job.payment?.studentPayoutUsdc.toFixed(2)} USDC
                        </span>
                        {job.audit?.gonkaRequestId && (
                          <span className="text-xs text-ink-soft bg-surface-elevated px-2 py-0.5 rounded font-mono border border-border">
                            Proof: {job.audit.gonkaRequestId.slice(0, 16)}…
                          </span>
                        )}
                      </div>
                      {job.payment?.explorerUrl ? (
                        <a
                          href={job.payment.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-small text-accent hover:underline"
                        >
                          View the payment on the Sui explorer
                        </a>
                      ) : (
                        <span className="text-small text-ink-faint">
                          Simulated locally. No on-chain transaction was submitted.
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-16 border-t border-line pt-6 text-small text-ink-soft">
        Demo authentication. Production would verify the zkLogin JWT server-side.
      </p>
    </div>
  );
}
