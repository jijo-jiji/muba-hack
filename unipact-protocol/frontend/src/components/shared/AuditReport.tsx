"use client";

import { useState } from "react";
import { MilestoneAuditResult } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/auth/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddressChip } from "@/components/ui/AddressChip";
import { Meter } from "@/components/ui/Meter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ModelSteps } from "@/components/shared/ModelSteps";

/** Pulsing green dot + LIVE label — rendered when a real Gonka network call was made. */
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

/**
 * Terminal-style network log — shows exactly what went over the wire to gonkarouter.io.
 * Collapsed to a header bar by default; click to expand.
 */
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
          {audit.isLiveGonkaCall ? <LiveIndicator /> : (
            <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase">Demo</span>
          )}
          <span className="text-green-300 font-semibold">Gonka Network Log</span>
          <span className="text-green-700">— api.gonkarouter.io/v1/chat/completions</span>
        </div>
        <div className="flex items-center gap-3 text-green-700">
          {totalLatency > 0 && <span className="text-green-500">{totalLatency}ms total</span>}
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

          {/* Per-model request logs */}
          {steps.map((step, i) => (
            <div key={i} className="border-t border-green-900/60 pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-green-300 font-semibold">▶ Step {i + 1}: {step.stepName}</span>
                {step.latencyMs && <span className="text-green-600 text-[11px]">{step.latencyMs}ms</span>}
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
                      <div key={fi} className="pl-4 text-green-500">→ {f}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Consensus synthesis row */}
          <div className="border-t border-green-900/60 pt-3 space-y-0.5 text-[11px]">
            <div className="text-green-300 font-semibold">◆ Consensus Synthesis</div>
            <div className="pl-3 space-y-0.5">
              {audit.scopeScore !== undefined && (
                <div>
                  <span className="text-green-700">scope_score:    </span>
                  <span className="text-green-300">{audit.scopeScore}/100</span>
                </div>
              )}
              {audit.qualityScore !== undefined && (
                <div>
                  <span className="text-green-700">quality_score:  </span>
                  <span className="text-green-300">{audit.qualityScore}/100</span>
                </div>
              )}
              <div>
                <span className="text-green-700">truth_score:    </span>
                <span className={audit.truthScore >= PASS_THRESHOLD ? "text-green-300 font-bold" : "text-red-400 font-bold"}>
                  {audit.truthScore}/100
                </span>
              </div>
              {audit.consensusLevel && (
                <div>
                  <span className="text-green-700">consensus:      </span>
                  <span className={
                    audit.consensusLevel === "High" ? "text-green-300" :
                    audit.consensusLevel === "Moderate" ? "text-yellow-300" : "text-red-400"
                  }>
                    {audit.consensusLevel} Agreement
                  </span>
                </div>
              )}
              <div>
                <span className="text-green-700">escrow_unlock:  </span>
                <span className={audit.isApproved ? "text-green-400" : "text-red-400"}>
                  {audit.isApproved
                    ? "true  ✓ threshold met (≥80)"
                    : `false ✗ score below ${PASS_THRESHOLD}`}
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
                <li key={index} className="text-body text-ink-soft">{claim}</li>
              ))}
            </ul>
          </div>
        )}

        {audit.reasoningTrace.length > 0 && (
          <div>
            <SectionLabel>What the review found</SectionLabel>
            <ul className="mt-3 space-y-2">
              {audit.reasoningTrace.map((finding, index) => (
                <li key={index} className="text-body text-ink-soft">{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Live Gonka Network Log ── terminal-style proof of real API calls */}
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
