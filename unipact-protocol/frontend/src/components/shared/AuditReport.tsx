import { MilestoneAuditResult } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/auth/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddressChip } from "@/components/ui/AddressChip";
import { Meter } from "@/components/ui/Meter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ModelSteps } from "@/components/shared/ModelSteps";
import { GonkaNetworkLog } from "@/components/shared/GonkaNetworkLog";

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
        <div>
          <CardTitle>AI review</CardTitle>
          <p className="mt-1 text-small text-ink-soft">
            Two models check the work separately and their scores are combined.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {audit.consensusLevel && <Badge>{audit.consensusLevel} agreement</Badge>}
          {audit.isLiveGonkaCall ? (
            <Badge tone="success">Live Gonka call</Badge>
          ) : (
            <Badge tone="warning">Demo data, not a live Gonka call</Badge>
          )}
          <Badge tone={passed ? "success" : "error"}>{passed ? "Passed" : "Needs revision"}</Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-small text-ink-soft">
              Truth Score — how closely the submitted work matches what was asked for
            </p>
            <p className="text-section font-semibold text-ink">{audit.truthScore}/100</p>
          </div>
          <div className="mt-3">
            <Meter value={audit.truthScore} tone={passed ? "success" : "error"} />
          </div>
          <p className="mt-2 text-small text-ink-faint">
            Payment unlocks at {PASS_THRESHOLD} or above.
          </p>
        </div>

        {audit.modelSteps && (
          <ModelSteps steps={audit.modelSteps} showLatency={audit.isLiveGonkaCall} />
        )}

        {audit.extractedClaims && audit.extractedClaims.length > 0 && (
          <div>
            <SectionLabel>Claims found in the submission</SectionLabel>
            <ul className="mt-3 space-y-2">
              {audit.extractedClaims.map((claim, index) => (
                <li key={index} className="text-body text-ink-soft">
                  {claim}
                </li>
              ))}
            </ul>
          </div>
        )}

        {audit.reasoningTrace.length > 0 && (
          <div>
            <SectionLabel>What the review found</SectionLabel>
            <ul className="mt-3 space-y-2">
              {audit.reasoningTrace.map((finding, index) => (
                <li key={index} className="text-body text-ink-soft">
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        <GonkaNetworkLog audit={audit} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <AddressChip label="Gonka request ID" value={audit.gonkaRequestId} />
          {audit.auditedAt && (
            <span className="text-small text-ink-faint">
              {new Date(audit.auditedAt).toLocaleString()}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
