"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MilestoneAuditResult } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/auth/permissions";

/**
 * What actually went over the wire to Gonka Router for this review.
 *
 * It is here so a judge can ask "how do you know?" and get an answer rather than
 * a score with no provenance. Monospace, because it is a log; everything else
 * follows the normal palette.
 *
 * Timings appear only for a live call. The canned demo results carry hardcoded
 * latencies, and printing those as if they were measured is the kind of claim
 * this project exists to avoid.
 */
export function GonkaNetworkLog({ audit }: { audit: MilestoneAuditResult }) {
  const [open, setOpen] = useState(false);

  const steps = audit.modelSteps ?? [];
  const timestamp = audit.auditedAt ? new Date(audit.auditedAt).toISOString() : null;
  const totalLatency = steps.reduce((sum, step) => sum + (step.latencyMs ?? 0), 0);
  const showTimings = audit.isLiveGonkaCall;

  return (
    <div className="rounded-card border border-line">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
          )}
          <span className="text-small font-medium text-ink">Request log</span>
          <span className="font-mono text-small text-ink-faint">api.gonkarouter.io/v1</span>
        </span>
        {showTimings && totalLatency > 0 && (
          <span className="font-mono text-small text-ink-soft">{totalLatency} ms</span>
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4 font-mono text-small">
          <Row label="endpoint" value="POST /v1/chat/completions" />
          {timestamp && <Row label="at" value={timestamp} />}
          <Row
            label="source"
            value={audit.source}
            tone={audit.isLiveGonkaCall ? "ink" : "warning"}
          />

          {steps.map((step, index) => (
            <div key={index} className="space-y-1 border-t border-line pt-4">
              <p className="font-sans text-small font-medium text-ink">
                Step {index + 1} — {step.stepName}
              </p>
              <Row label="model" value={step.model} />
              <Row label="request_id" value={step.requestId} />
              <Row
                label="score"
                value={`${step.score}/100`}
                tone={step.score >= PASS_THRESHOLD ? "success" : "error"}
              />
              {showTimings && step.latencyMs ? (
                <Row label="latency" value={`${step.latencyMs} ms`} />
              ) : null}
            </div>
          ))}

          <div className="space-y-1 border-t border-line pt-4">
            <p className="font-sans text-small font-medium text-ink">Combined</p>
            {audit.scopeScore !== undefined && (
              <Row label="scope_score" value={`${audit.scopeScore}/100`} />
            )}
            {audit.qualityScore !== undefined && (
              <Row label="quality_score" value={`${audit.qualityScore}/100`} />
            )}
            <Row
              label="truth_score"
              value={`${audit.truthScore}/100`}
              tone={audit.isApproved ? "success" : "error"}
            />
            {audit.consensusLevel && <Row label="consensus" value={audit.consensusLevel} />}
            <Row
              label="escrow_unlock"
              value={
                audit.isApproved
                  ? `true — ${PASS_THRESHOLD} or above`
                  : `false — below ${PASS_THRESHOLD}`
              }
              tone={audit.isApproved ? "success" : "error"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const TONES = {
  ink: "text-ink",
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
} as const;

function Row({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="flex flex-wrap gap-x-3">
      <span className="w-32 shrink-0 text-ink-faint">{label}</span>
      <span className={`break-all ${TONES[tone]}`}>{value}</span>
    </div>
  );
}
