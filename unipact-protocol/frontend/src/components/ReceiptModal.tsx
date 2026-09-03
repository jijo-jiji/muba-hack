"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Zap, ExternalLink, ShieldCheck, X, ArrowRight, Share2, Receipt } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  totalAmount: number;
  payerAmount: number;
  duesAmount: number;
  payerName: string;
  digest?: string;
  executionTimeMs: number;
  isGasSponsored: boolean;
  explorerUrl?: string;
}

export function ReceiptModal({
  isOpen,
  onClose,
  title,
  totalAmount,
  payerAmount,
  duesAmount,
  payerName,
  digest,
  executionTimeMs,
  isGasSponsored,
  explorerUrl,
}: ReceiptModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#34d399", "#818cf8", "#f472b6"],
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4 animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>

        <h3 className="text-xl font-extrabold text-white">Atomic Settlement Complete!</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">{title}</p>

        {/* Amount Display */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ${totalAmount.toFixed(2)}{" "}
            <span className="text-sm font-semibold text-slate-400">USDC</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Settled in single Programmable Transaction Block
          </div>
        </div>

        {/* Atomic Routing Breakdown */}
        <div className="space-y-2 text-left font-mono text-xs mb-5">
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex justify-between items-center">
            <span className="text-slate-400">Reimbursed Payer ({payerName}):</span>
            <span className="text-sky-300 font-bold">${payerAmount.toFixed(2)} USDC</span>
          </div>

          {duesAmount > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex justify-between items-center">
              <span className="text-slate-400">Club / Platform Treasury Dues:</span>
              <span className="text-purple-300 font-bold">${duesAmount.toFixed(2)} USDC</span>
            </div>
          )}

          {/* Performance & Gasless Badges */}
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex justify-between items-center">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Execution Latency:
            </span>
            <span className="text-white font-bold">{executionTimeMs} ms</span>
          </div>

          {isGasSponsored && (
            <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 flex justify-between items-center">
              <span className="text-sky-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Gas Sponsorship:
              </span>
              <span className="text-sky-300 font-bold">100% Relayer Sponsored (0 SUI)</span>
            </div>
          )}
        </div>

        {/* A digest and explorer link only ever appear for a real confirmed transaction. */}
        <div className="space-y-3">
          {digest && explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>View on SuiScan Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          ) : (
            <div className="w-full py-3 px-4 rounded-xl bg-slate-900 text-slate-400 text-xs font-mono border border-slate-800">
              Simulated locally. No on-chain transaction was submitted.
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
