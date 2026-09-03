"use client";

import React, { useState } from "react";
import { ZkLoginPersona, TrustMeshJob } from "@/lib/types";
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Download,
  FileCheck,
  Code2,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Share2,
  Copy,
  Check,
} from "lucide-react";

interface StudentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: ZkLoginPersona;
  completedJobs: TrustMeshJob[];
}

export function StudentPortfolioModal({
  isOpen,
  onClose,
  student,
  completedJobs,
}: StudentPortfolioModalProps) {
  const [copied, setCopied] = useState(false);
  const [viewingReport, setViewingReport] = useState<TrustMeshJob | null>(null);

  if (!isOpen) return null;

  const publicUrl = `https://trustmesh.network/portfolio/${student.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 md:p-8 shadow-2xl shadow-sky-950/60 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <div className="text-5xl p-3.5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl shadow-sky-500/10">
            {student.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white truncate">{student.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Student
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              {student.university || "Asia Pacific University (APU)"} &bull; {student.email}
            </p>
            <p className="text-[11px] text-sky-400 font-mono truncate mt-0.5">
              Sui Address: {student.address}
            </p>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Link Copied!" : "Share Profile"}
          </button>
        </div>

        {/* Verifiable Credentials & Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Gonka AI Proofs</div>
              <div className="text-sm font-bold text-white">100% Audit Pass</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Verified Earnings</div>
              <div className="text-sm font-bold text-emerald-400">
                ${student.usdcBalance.toFixed(2)} USDC
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Reputation Score</div>
              <div className="text-sm font-bold text-purple-300">98 / 100</div>
            </div>
          </div>
        </div>

        {/* Completed Projects & Project Reports */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            Verified Completed Projects &amp; Reports
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    Software Development &bull; HRMS
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    HRMS &amp; Employee Leave Management System
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Client: Apex Retail Solutions &bull; Budget: $300.00 USDC
                  </p>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Truth Score: 94%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Next.js", "TypeScript", "Tailwind CSS", "Sui Move"].map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500 truncate">
                  Gonka Request ID: <code className="text-slate-400">gnk-req-2026-trustmesh-pass</code>
                </span>

                <button
                  onClick={() =>
                    setViewingReport({
                      id: "rep_1",
                      title: "HRMS & Employee Leave Management System",
                      description: "Self-service employee leave portal",
                      scope: "software_development",
                      budgetUsdc: 300,
                      escrowVaultId: "0x_vault_hrms",
                      escrowStatus: "released",
                      companyName: "Apex Retail Solutions",
                      companyEmail: "ops@apexretail.com.my",
                      companyVerification: "corporate_silent",
                      status: "settled",
                      clientAssets: [],
                      deliverables: [],
                      createdAt: Date.now(),
                    })
                  }
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Project Report PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Report Modal Preview */}
        {viewingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg rounded-3xl border border-sky-500/50 bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Automated Project Report (PDF Preview)
                </h3>
                <button
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white text-slate-900 font-sans text-xs space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900">
                      TRUSTMESH PROJECT REPORT
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Decentralized Freelance Milestone Completion Certificate
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    VERIFIED ON SUI
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div><strong>Project:</strong> {viewingReport.title}</div>
                  <div><strong>Client:</strong> {viewingReport.companyName}</div>
                  <div><strong>Student Engineer:</strong> {student.name} ({student.university})</div>
                  <div><strong>Total Payout:</strong> $270.00 USDC (90%)</div>
                  <div><strong>Platform Dues:</strong> $30.00 USDC (10%)</div>
                  <div><strong>Gonka Audit Verification ID:</strong> gnk-req-2026-trustmesh-pass</div>
                  <div><strong>Forensic Truth Score:</strong> 94 / 100 (Pass)</div>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t font-mono">
                  Cryptographically settled via Sui Programmable Transaction Block. Verified immutable proof.
                </div>
              </div>

              <button
                onClick={() => {
                  alert("Project Report downloaded as PDF!");
                  setViewingReport(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs font-mono"
              >
                Save Official PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
