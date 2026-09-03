"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, Copy, Check, Terminal, ExternalLink, Cpu } from "lucide-react";
import { MilestoneAuditResult } from "@/lib/types";

interface Step2AuditReportProps {
  auditResult: MilestoneAuditResult | null;
  isAuditing: boolean;
}

export const Step2AuditReport: React.FC<Step2AuditReportProps> = ({
  auditResult,
  isAuditing,
}) => {
  const [copied, setCopied] = useState(false);

  const copyRequestId = () => {
    if (!auditResult?.gonkaRequestId) return;
    navigator.clipboard.writeText(auditResult.gonkaRequestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isAuditing) {
    return (
      <div className="w-full rounded-2xl border border-purple-500/40 bg-slate-900/60 backdrop-blur-md p-6 shadow-glow-gonka">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-mono font-bold text-xs">
            02
          </div>
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            [STEP 2: GONKA FORENSIC AUDIT REPORT]
          </h2>
        </div>

        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-200 font-mono">
            Routing Prompts to Gonka Multi-Model Router...
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
            Model A: Verifying Acceptance Criteria Compliance | Model B: Checking Forensic Code Integrity &amp; Anti-Plagiarism
          </p>
        </div>
      </div>
    );
  }

  if (!auditResult) {
    return (
      <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-mono font-bold text-xs">
            02
          </div>
          <h2 className="text-base font-bold text-slate-500 font-mono uppercase tracking-wider">
            [STEP 2: GONKA FORENSIC AUDIT REPORT]
          </h2>
        </div>
        <div className="py-10 text-center text-slate-500 font-mono text-xs">
          Submit a deliverable in Step 1 to trigger the multi-model Gonka Router audit.
        </div>
      </div>
    );
  }

  const isPassed = auditResult.isApproved;

  return (
    <div
      className={`w-full rounded-2xl border backdrop-blur-md p-6 shadow-xl transition-all ${
        isPassed
          ? "border-emerald-500/40 bg-slate-900/70 shadow-glow"
          : "border-red-500/40 bg-slate-900/70"
      }`}
    >
      {/* Anything that did not come from a real Gonka Router response says so, loudly. */}
      {!auditResult.isLiveGonkaCall && (
        <div className="mb-4 px-3 py-2 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-300 text-xs font-mono">
          Demo data, not a live Gonka call.
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              isPassed
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-red-500/20 border border-red-500/40 text-red-400"
            }`}
          >
            02
          </div>
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            [STEP 2: GONKA FORENSIC AUDIT REPORT]
          </h2>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            isPassed
              ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-400"
              : "bg-red-950/80 border border-red-500/50 text-red-400"
          }`}
        >
          {isPassed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AUDIT PASSED</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>REVISION REQUIRED</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Truth Score Gauge */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Truth / Completion Score</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                isPassed ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
              }`}
            >
              Threshold: 80%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span
              className={`text-4xl font-extrabold font-mono tracking-tight ${
                isPassed ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {auditResult.truthScore}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({isPassed ? "Gate Passed" : "Locked (<80%)"})
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isPassed ? "bg-emerald-500" : "bg-red-500"
              }`}
              style={{ width: `${auditResult.truthScore}%` }}
            ></div>
          </div>
        </div>

        {/* Canonical Gonka Proof ID */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Canonical Gonka Proof</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <p className="text-xs text-slate-500 font-mono">Gonka Request ID:</p>
            <p className="text-sm font-bold text-purple-300 font-mono break-all">
              {auditResult.gonkaRequestId}
            </p>
          </div>
          <button
            onClick={copyRequestId}
            className="flex items-center justify-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Proof ID!" : "Copy Verification Proof"}</span>
          </button>
        </div>

        {/* Dual Model Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-mono">Parallel Routing Breakdown</span>
          <div className="space-y-2 my-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Model A (Scope Adherence):</span>
                <span className="font-bold text-sky-400">{auditResult.scopeScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full"
                  style={{ width: `${auditResult.scopeScore}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Model B (Code Authenticity):</span>
                <span className="font-bold text-purple-400">{auditResult.qualityScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full"
                  style={{ width: `${auditResult.qualityScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Powered by gonkarouter.io (deepseek-v4-flash)
          </span>
        </div>
      </div>

      {/* Forensic Reasoning Trace */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-semibold mb-2.5">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Forensic Reasoning Trace:</span>
        </div>
        <ul className="space-y-2">
          {auditResult.reasoningTrace.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
              <span className={isPassed ? "text-emerald-400 mt-0.5" : "text-red-400 mt-0.5"}>
                {isPassed ? "✓" : "✗"}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
