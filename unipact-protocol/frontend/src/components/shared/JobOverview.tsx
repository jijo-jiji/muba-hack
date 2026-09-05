import { Job } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";

const SCOPE_LABELS = {
  software_development: "Software development",
  digital_marketing: "Digital marketing",
} as const;

/** The brief itself: what the company wants, for how much. */
export function JobOverview({ job }: { job: Job }) {
  return (
    <Card>
      <CardBody className="space-y-6">
        <p className="whitespace-pre-wrap text-body text-ink-soft">{job.description}</p>

        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
          <Stat label="Budget" value={`${job.budgetUsdc.toFixed(2)} USDC`} />
          <Stat label="Kind of work" value={SCOPE_LABELS[job.scope]} />
          <Stat
            label="Escrow"
            value={
              job.escrowStatus === "released"
                ? "Released"
                : job.escrowVaultId
                  ? "Locked on Sui"
                  : "Locked"
            }
            note={
              job.depositExplorerUrl ? (
                <a
                  href={job.depositExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-small text-accent hover:underline"
                >
                  View the vault on the Sui explorer
                </a>
              ) : (
                "Held until the work passes"
              )
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}
