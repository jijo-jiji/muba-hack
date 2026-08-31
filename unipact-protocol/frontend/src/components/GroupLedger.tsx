"use client";

import React, { useState } from "react";
import { ZkLoginPersona, GroupPool, Bill } from "@/lib/types";
import {
  Users,
  ShieldCheck,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lock,
  Download,
  CheckCircle2,
  Cpu,
  Sparkles,
} from "lucide-react";

interface GroupLedgerProps {
  currentPersona: ZkLoginPersona;
  activePool: GroupPool;
  onAdminResolveDispute: (billId: string, reason: string) => void;
  onAdminWithdrawDues: () => void;
  onAdminCloseTab: () => void;
}

export function GroupLedger({
  currentPersona,
  activePool,
  onAdminResolveDispute,
  onAdminWithdrawDues,
  onAdminCloseTab,
}: GroupLedgerProps) {
  const [disputeReason, setDisputeReason] = useState("");
  const [selectedDisputeBill, setSelectedDisputeBill] = useState(activePool.bills[0]?.id || "");

  const isGroupAdminOrTreasurer =
    currentPersona.address.toLowerCase() === activePool.creator.toLowerCase() ||
    currentPersona.address.toLowerCase() === activePool.clubTreasury.toLowerCase() ||
    currentPersona.role === "treasurer" ||
    currentPersona.id === "alice" ||
    currentPersona.id === "treasurer_eva";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-sky-950/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                GroupPool Shared Object &bull; Move Layer
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                AdminCap Pattern
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Shared Ledger &amp; Balance Matrix
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              On-chain shared state tracking group tabs, participant debts, and club treasury dues.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-right">
            <div className="text-slate-400">Pool Object ID</div>
            <div className="text-sky-300 font-bold truncate max-w-[200px]">{activePool.id}</div>
          </div>
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Expenses</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ${activePool.totalExpenses.toFixed(2)}{" "}
            <span className="text-sm text-slate-400 font-normal">USDC</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {activePool.bills.length} active bills in pool
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Settled (PTBs)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${activePool.totalSettled.toFixed(2)}{" "}
            <span className="text-sm text-slate-400 font-normal">USDC</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {Math.round((activePool.totalSettled / (activePool.totalExpenses || 1)) * 100)}% settled rate
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Club Treasury Balance</div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">
            ${activePool.treasuryBalance.toFixed(2)}{" "}
            <span className="text-sm text-slate-400 font-normal">USDC</span>
          </div>
          <div className="text-[11px] text-purple-300 font-mono mt-1">
            {activePool.clubFeeBps / 100}% club royalty fee
          </div>
        </div>
      </div>

      {/* Participant Balance Matrix */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          Participant Net Balance Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePool.members.map((member, idx) => {
            const isOwed = member.netBalance > 0;
            const isSettled = member.netBalance === 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  isOwed
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : isSettled
                    ? "bg-slate-900/40 border-slate-800"
                    : "bg-amber-950/20 border-amber-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{member.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{member.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {member.address.slice(0, 10)}...
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center font-mono">
                  <span className="text-[11px] text-slate-400">
                    {isOwed ? "To Receive:" : isSettled ? "Settled:" : "Owed to Pool:"}
                  </span>
                  <span
                    className={`text-sm font-black ${
                      isOwed ? "text-emerald-400" : isSettled ? "text-slate-400" : "text-amber-400"
                    }`}
                  >
                    {isOwed ? `+$${member.netBalance.toFixed(2)}` : `-$${Math.abs(member.netBalance).toFixed(2)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AdminCap Dispute & Treasury Controls (Capability Pattern) */}
      <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                AdminCap Arbitrator &amp; Treasury Controls
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Granted to Group Creator / Club Treasurer via Sui Capability Pattern
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
              isGroupAdminOrTreasurer
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
          >
            {isGroupAdminOrTreasurer ? "AdminCap Detected" : "AdminCap Required"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dispute Arbitration */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Settle Disputed Bill / Tab
            </div>
            <select
              value={selectedDisputeBill}
              onChange={(e) => setSelectedDisputeBill(e.target.value)}
              disabled={!isGroupAdminOrTreasurer}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
            >
              {activePool.bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (${b.totalAmount.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Resolution note (e.g. Member refunded offline)"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              disabled={!isGroupAdminOrTreasurer}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
            />
            <button
              onClick={() => onAdminResolveDispute(selectedDisputeBill, disputeReason)}
              disabled={!isGroupAdminOrTreasurer || !disputeReason}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition disabled:opacity-40"
            >
              Execute Admin Dispute Resolution
            </button>
          </div>

          {/* Treasury Dues Withdrawal & Tab Close */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              Club Treasury Dues Vault
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex justify-between items-center">
              <span className="text-slate-400">Available Dues:</span>
              <span className="text-purple-300 font-black text-sm">
                ${activePool.treasuryBalance.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAdminWithdrawDues}
                disabled={!isGroupAdminOrTreasurer || activePool.treasuryBalance <= 0}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition disabled:opacity-40"
              >
                Withdraw Dues
              </button>
              <button
                onClick={onAdminCloseTab}
                disabled={!isGroupAdminOrTreasurer}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition disabled:opacity-40"
              >
                Close Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
