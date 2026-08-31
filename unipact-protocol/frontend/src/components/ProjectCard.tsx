"use client";

import React from "react";
import { Briefcase, Building2, Lock, Sparkles, CheckCircle2, Clock } from "lucide-react";

interface ProjectCardProps {
  escrowAmount: number;
  status: "pending_submission" | "auditing" | "audit_passed" | "audit_failed" | "settled";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  escrowAmount,
  status,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "settled":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Milestone Settled On-Chain
          </span>
        );
      case "audit_passed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Audit Passed (Release Ready)
          </span>
        );
      case "auditing":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-400 text-xs font-mono font-medium animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Gonka AI Auditing...
          </span>
        );
      case "audit_failed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5" />
            Revision Required (&lt; 80%)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-mono font-medium">
            <Lock className="w-3.5 h-3.5" />
            Escrow Locked in Shared Vault
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Contract #UP-2026-089</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-mono">
            Tuition ERP — Database Schema &amp; Migration
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        {/* SME Client Info */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono">Client (SME)</p>
            <p className="text-sm font-semibold text-slate-200 font-mono">Alpha Academy Sdn Bhd</p>
          </div>
        </div>

        {/* Locked Escrow Amount */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono">Locked Escrow</p>
            <p className="text-base font-bold text-emerald-400 font-mono">
              {escrowAmount.toFixed(2)} USDC <span className="text-xs text-slate-400 font-normal">($300.00)</span>
            </p>
          </div>
        </div>

        {/* Payout Distribution Breakdown */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono">Split Configuration</p>
            <p className="text-sm font-medium text-slate-200 font-mono">
              90% Student (<span className="text-emerald-400">270 USDC</span>) / 10% Protocol
            </p>
          </div>
        </div>
      </div>

      {/* Agreed Specification Criteria */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-slate-300 font-semibold">Agreed Acceptance Criteria: </span>
          <span>PostgreSQL relational schema (Courses, Students, Invoices), Prisma migrations, &gt;= 85% test coverage.</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 whitespace-nowrap">
          Threshold: 80%
        </span>
      </div>
    </div>
  );
};
