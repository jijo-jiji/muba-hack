"use client";

import React from "react";
import { ArrowDown, CheckCircle2, Cpu, ShieldCheck, Zap, Split, ArrowRight, Layers } from "lucide-react";

interface PTBVisualizerProps {
  payerName: string;
  payerAddress: string;
  repayAmount: number;
  clubDues: number;
  clubTreasuryAddress: string;
  totalAmount: number;
}

export function PTBVisualizer({
  payerName,
  payerAddress,
  repayAmount,
  clubDues,
  clubTreasuryAddress,
  totalAmount,
}: PTBVisualizerProps) {
  return (
    <div className="rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Atomic Programmable Transaction Block (PTB)
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Single-transaction execution &bull; All-or-nothing atomicity &bull; &lt;500ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
          <Zap className="w-3 h-3" />
          Sub-500ms Target
        </div>
      </div>

      {/* Commands Sequence */}
      <div className="space-y-3 font-mono text-xs">
        {/* Command 1 */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
            CMD 0
          </span>
          <div className="flex-1">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <Split className="w-3.5 h-3.5 text-sky-400" />
              tx.splitCoins(Coin&lt;USDC&gt;, [${repayAmount.toFixed(2)}, ${clubDues.toFixed(2)}])
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Splits the input stablecoin into repayment share and club/platform treasury fee.
            </p>
          </div>
        </div>

        {/* Command 2 */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            CMD 1
          </span>
          <div className="flex-1">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              tx.transferObjects([splitCoins[0]], {payerName})
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5 truncate">
              Routes ${repayAmount.toFixed(2)} USDC directly to payer:{" "}
              <span className="text-slate-300">{payerAddress.slice(0, 12)}...{payerAddress.slice(-6)}</span>
            </p>
          </div>
        </div>

        {/* Command 3 */}
        {clubDues > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              CMD 2
            </span>
            <div className="flex-1">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                tx.transferObjects([splitCoins[1]], ClubTreasury)
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                Routes ${clubDues.toFixed(2)} USDC dues to club pool:{" "}
                <span className="text-slate-300">{clubTreasuryAddress.slice(0, 10)}...</span>
              </p>
            </div>
          </div>
        )}

        {/* Command 4 */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            CMD {clubDues > 0 ? "3" : "2"}
          </span>
          <div className="flex-1">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              tx.moveCall(&quot;group_pool::settle_member_split&quot;)
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Atomically increments repaid count, decrements debt, and emits <code className="text-emerald-300">SplitSettledEvent</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Signature Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Dual Sign: User Sender Key + Relayer Gas Sponsor</span>
        </div>
        <div className="text-emerald-400 font-semibold">
          User Gas Cost: $0.00 (Gasless)
        </div>
      </div>
    </div>
  );
}
