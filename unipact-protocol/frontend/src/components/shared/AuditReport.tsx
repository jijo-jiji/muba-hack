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
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <CardTitle>Gonka AI Multi-Model Audit</CardTitle>
          <p className="text-small text-ink-soft">
            Decentralized cross-model verification via official inference gateway (gonkarouter.io)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {audit.consensusLevel && (
            <Badge tone="neutral">
              Consensus: {audit.consensusLevel} Agreement
            </Badge>
          )}
          {!audit.isLiveGonkaCall ? (
            <Badge tone="warning">Demo data, not a live Gonka call</Badge>
          ) : (
            <Badge tone="success">Live Multi-Model Consensus</Badge>
          )}
          <Badge tone={passed ? "success" : "error"}>
            {passed ? "Approved (≥80%)" : "Needs Revision (<80%)"}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-body font-medium text-ink">
                Truth Score
              </p>
              <p className="text-small text-ink-soft">
                Synthesized consensus score across independent frontier model evaluations
              </p>
            </div>
            <p className={`text-section font-bold ${passed ? "text-success" : "text-danger"}`}>
              {audit.truthScore}%
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-page">
            <div
              className={passed ? "h-full bg-success transition-all duration-500" : "h-full bg-danger transition-all duration-500"}
              style={{ width: `${audit.truthScore}%` }}
            />
          </div>
          <p className="mt-2 text-small text-ink-faint">
            Smart contract escrow unlocks payment at {PASS_THRESHOLD}% or above.
          </p>
        </div>

        {/* Multi-Model Inference Steps & Transparency */}
        {audit.modelSteps && audit.modelSteps.length > 0 && (
          <div>
            <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
              Decentralized Inference Steps & Consensus
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {audit.modelSteps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-line bg-page/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-small font-medium text-ink">{step.stepName}</span>
                    <span className="text-body font-bold text-accent">{step.score}%</span>
                  </div>
                  <p className="text-xs font-mono text-ink-faint">
                    Model: <span className="text-ink">{step.model}</span> {step.latencyMs ? `(${step.latencyMs}ms)` : ""}
                  </p>
                  {step.findings && step.findings.length > 0 && (
                    <ul className="text-xs text-ink-soft space-y-1 list-disc pl-4 pt-1">
                      {step.findings.slice(0, 2).map((f, fIdx) => (
                        <li key={fIdx}>{f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="pt-2 border-t border-line/60">
                    <AddressChip label="Gonka Request ID" value={step.requestId} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Verifiable Claims */}
        {audit.extractedClaims && audit.extractedClaims.length > 0 && (
          <div>
            <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
              Extracted Factual Claims
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {audit.extractedClaims.map((claim, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg border border-line bg-page px-3 py-1 text-xs text-ink"
                >
                  ✓ {claim}
                </span>
              ))}
            </div>
          </div>
        )}

        {audit.reasoningTrace.length > 0 && (
          <div>
            <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
              Consensus Reasoning Trace
            </p>
            <ul className="mt-2 space-y-2 rounded-xl border border-line bg-page/30 p-4">
              {audit.reasoningTrace.map((finding, index) => (
                <li key={index} className="text-body text-ink-soft flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-ink-faint">
          <span>Inference Gateway: <code className="font-mono text-ink">api.gonkarouter.io/v1</code></span>
          {audit.auditedAt && <span>Audited At: {new Date(audit.auditedAt).toLocaleTimeString()}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
