"use client";

import React from "react";
import { Zap, CheckCircle2, Lock, ArrowRight, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { MilestoneAuditResult } from "@/lib/types";
import { ExecutionResult } from "@/hooks/useDualSignSponsoredTx";
import confetti from "canvas-confetti";

interface Step3SettlementProps {
  auditResult: MilestoneAuditResult | null;
  onExecuteSettlement: () => Promise<void>;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  error: string | null;
}

export const Step3Settlement: React.FC<Step3SettlementProps> = ({
  auditResult,
  onExecuteSettlement,
  isExecuting,
  executionResult,
  error,
}) => {
  const isApproved = auditResult?.isApproved ?? false;
  const isSettled = executionResult?.status === "success";

  const handleExecute = async () => {
    await onExecuteSettlement();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#38bdf8", "#c084fc"],
    });
  };

  return (
    <div
      className={`w-full rounded-2xl border backdrop-blur-md p-6 shadow-xl relative transition-all ${
        isSettled
          ? "border-emerald-500/50 bg-slate-900/80 shadow-glow"
          : isApproved
          ? "border-sky-500/40 bg-slate-900/60 shadow-glow-sui"
          : "border-slate-800/80 bg-slate-900/40 opacity-75"
      }`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              isSettled
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : isApproved
                ? "bg-sky-500/20 border border-sky-500/40 text-sky-400"
                : "bg-slate-800 border border-slate-700 text-slate-500"
            }`}
          >
            03
          </div>
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            [STEP 3: GASLESS SETTLEMENT DISBURSEMENT]
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>Sui PTB Gasless Execution</span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Student Payout */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Student Payout (90%)</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            270.00 <span className="text-xs text-slate-400 font-normal">USDC</span>
          </p>
          <span className="text-[11px] text-slate-500 font-mono">
            Direct to zkLogin address
          </span>
        </div>

        {/* Protocol Treasury */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">UniPact Treasury (10%)</span>
          <p className="text-2xl font-bold text-sky-400 font-mono mt-1">
            30.00 <span className="text-xs text-slate-400 font-normal">USDC</span>
          </p>
          <span className="text-[11px] text-slate-500 font-mono">
            Platform audit &amp; relayer fee
          </span>
        </div>

        {/* Gas Fee */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Gas Fee to Student</span>
          <p className="text-2xl font-bold text-purple-400 font-mono mt-1">
            $0.00 <span className="text-xs text-slate-400 font-normal">SUI</span>
          </p>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Sponsored by Relayer
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Success Notification with Live Sui Explorer Link */}
      {isSettled && executionResult && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Atomic PTB Settlement Broadcast Succeeded!</span>
            </div>
            {executionResult.isSimulated && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                Verified PTB Payload
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mb-2">
            Funds split atomically (90% to Student, 10% to Protocol Treasury) and on-chain{" "}
            <code className="text-purple-300">MilestoneAuditedEvent</code> emitted.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-emerald-900/60 text-xs">
            <span className="text-slate-400 truncate max-w-md">
              Digest: <span className="text-emerald-300 font-mono">{executionResult.digest}</span>
            </span>
            <a
              href={executionResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 underline underline-offset-2 whitespace-nowrap"
            >
              <span>View On SuiScan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Execution Button */}
      {!isSettled && (
        <div className="mt-5">
          {!isApproved ? (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>
                Settlement gate is locked. Complete Step 1 &amp; Step 2 to achieve Truth Score &ge; 80%.
              </span>
            </div>
          ) : (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full py-3.5 px-4 rounded-xl font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dual-Signing &amp; Broadcasting PTB to Sui Testnet...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>[ EXECUTE GASLESS SETTLEMENT (PTB) ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
