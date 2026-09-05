"use client";

import { useState } from "react";
import { MilestoneAuditResult } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/auth/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddressChip } from "@/components/ui/AddressChip";

/** Pulsing green dot + LIVE label shown when a real Gonka call was made */
function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Live</span>
    </span>
  );
}

/** Terminal-style block showing what actually went over the wire */
function GonkaNetworkLog({ audit }: { audit: MilestoneAuditResult }) {
  const [open, setOpen] = useState(true);

  const steps = audit.modelSteps ?? [];
  const ts = audit.auditedAt ? new Date(audit.auditedAt).toISOString() : new Date().toISOString();
  const totalLatency = steps.reduce((s, st) => s + (st.latencyMs ?? 0), 0);

  return (
    <div className="rounded-xl border border-green-800/40 bg-[#0a1a0e] overflow-hidden font-mono text-xs">
      {/* header bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#0d2210] hover:bg-[#112a15] transition-colors"
      >
        <div className="flex items-center gap-3">
          {audit.isLiveGonkaCall ? (
            <LiveIndicator />
          ) : (
            <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase">Demo</span>
          )}
          <span className="text-green-300 font-semibold">Gonka Network Log</span>
          <span className="text-green-700">— api.gonkarouter.io/v1/chat/completions</span>
        </div>
        <div className="flex items-center gap-3 text-green-700">
          {totalLatency > 0 && (
            <span className="text-green-500">{totalLatency}ms total</span>
          )}
          <span>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3 text-green-400">
          {/* Timestamp + source */}
          <div className="text-green-700 text-[11px]">
            <span className="text-green-600">[{ts}]</span>
            {" "}POST https://api.gonkarouter.io/v1/chat/completions
            {" — "}<span className={audit.isLiveGonkaCall ? "text-green-400" : "text-yellow-500"}>
              source: {audit.source}
            </span>
          </div>

          {/* Per-model log entries */}
          {steps.map((step, i) => (
            <div key={i} className="border-t border-green-900/60 pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-green-300 font-semibold">
                  ▶ Step {i + 1}: {step.stepName}
                </span>
                <span className="text-green-600 text-[11px]">
                  {step.latencyMs ? `${step.latencyMs}ms` : ""}
                </span>
              </div>
              <div className="text-[11px] space-y-0.5 pl-3">
                <div>
                  <span className="text-green-700">model:       </span>
                  <span className="text-cyan-300">{step.model}</span>
                </div>
                <div>
                  <span className="text-green-700">request_id:  </span>
                  <span className="text-yellow-300 break-all">{step.requestId}</span>
                </div>
                <div>
                  <span className="text-green-700">score:       </span>
                  <span className={step.score >= PASS_THRESHOLD ? "text-green-300" : "text-red-400"}>
                    {step.score}/100
                  </span>
                </div>
                {step.findings && step.findings.length > 0 && (
                  <div className="pt-1">
                    <span className="text-green-700">findings:</span>
                    {step.findings.slice(0, 3).map((f, fi) => (
                      <div key={fi} className="pl-4 text-green-500">
                        {"→ "}{f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Consensus synthesis */}
          <div className="border-t border-green-900/60 pt-3 space-y-0.5 text-[11px]">
            <div className="text-green-300 font-semibold">◆ Consensus Synthesis</div>
            <div className="pl-3 space-y-0.5">
              {audit.scopeScore !== undefined && (
                <div><span className="text-green-700">scope_score:    </span><span className="text-green-300">{audit.scopeScore}/100</span></div>
              )}
              {audit.qualityScore !== undefined && (
                <div><span className="text-green-700">quality_score:  </span><span className="text-green-300">{audit.qualityScore}/100</span></div>
              )}
              <div><span className="text-green-700">truth_score:    </span>
                <span className={audit.truthScore >= PASS_THRESHOLD ? "text-green-300 font-bold" : "text-red-400 font-bold"}>
                  {audit.truthScore}/100
                </span>
              </div>
              {audit.consensusLevel && (
                <div><span className="text-green-700">consensus:      </span>
                  <span className={audit.consensusLevel === "High" ? "text-green-300" : audit.consensusLevel === "Moderate" ? "text-yellow-300" : "text-red-400"}>
                    {audit.consensusLevel} Agreement
                  </span>
                </div>
              )}
              <div><span className="text-green-700">escrow_unlock:  </span>
                <span className={audit.isApproved ? "text-green-400" : "text-red-400"}>
                  {audit.isApproved ? "true  ✓ threshold met (≥80)" : `false ✗ score below ${PASS_THRESHOLD}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

        {/* Live Gonka Network Log — terminal panel */}
        <GonkaNetworkLog audit={audit} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-ink-faint">
          <span>Inference Gateway: <code className="font-mono text-ink">api.gonkarouter.io/v1</code></span>
          {audit.auditedAt && <span>Audited At: {new Date(audit.auditedAt).toLocaleTimeString()}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
