import { MilestoneAuditResult } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/auth/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddressChip } from "@/components/ui/AddressChip";

/**
 * The result of the AI review.
 *
 * The Truth Score is how closely the submitted work matches what was asked for.
 * A score of 80 or above unlocks the payment; below that the money stays in escrow.
 */
export function AuditReport({ audit }: { audit: MilestoneAuditResult }) {
  const passed = audit.truthScore >= PASS_THRESHOLD;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>AI review</CardTitle>
        <div className="flex items-center gap-2">
          {!audit.isLiveGonkaCall && <Badge tone="warning">Demo data, not a live Gonka call</Badge>}
          <Badge tone={passed ? "success" : "error"}>
            {passed ? "Passed" : "Needs revision"}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-small text-ink-soft">
              Truth Score — how closely the submitted work matches what was asked for
            </p>
            <p className="text-section font-semibold text-ink">{audit.truthScore}/100</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-page">
            <div
              className={passed ? "h-full bg-success" : "h-full bg-danger"}
              style={{ width: `${audit.truthScore}%` }}
            />
          </div>
          <p className="mt-2 text-small text-ink-faint">
            Payment unlocks at {PASS_THRESHOLD} or above.
          </p>
        </div>

        {(audit.scopeScore !== undefined || audit.qualityScore !== undefined) && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-small text-ink-soft">Check 1 — everything asked for is there</dt>
              <dd className="mt-1 text-card-title font-medium text-ink">{audit.scopeScore ?? "—"}/100</dd>
            </div>
            <div>
              <dt className="text-small text-ink-soft">Check 2 — the work is finished, not placeholders</dt>
              <dd className="mt-1 text-card-title font-medium text-ink">{audit.qualityScore ?? "—"}/100</dd>
            </div>
          </dl>
        )}

        {audit.reasoningTrace.length > 0 && (
          <div>
            <p className="text-small font-medium text-ink">What the review found</p>
            <ul className="mt-2 space-y-2">
              {audit.reasoningTrace.map((finding, index) => (
                <li key={index} className="text-body text-ink-soft">
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-line pt-4">
          <AddressChip label="Gonka request ID" value={audit.gonkaRequestId} />
        </div>
      </CardBody>
    </Card>
  );
}
