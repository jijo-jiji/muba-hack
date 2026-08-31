"use client";

import React, { useState } from "react";
import { GitPullRequest, FileText, Play, CheckCircle, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { DEMO_PRESETS } from "@/lib/types";

interface Step1SubmitProps {
  onInitiateAudit: (spec: string, submission: string, preset?: "VALID" | "INCOMPLETE") => Promise<void>;
  isAuditing: boolean;
  disabled?: boolean;
}

export const Step1Submit: React.FC<Step1SubmitProps> = ({
  onInitiateAudit,
  isAuditing,
  disabled,
}) => {
  const [prLink, setPrLink] = useState(
    "https://github.com/azizi/tuition-erp-backend/pull/4"
  );
  const [studentNotes, setStudentNotes] = useState(
    "Completed PostgreSQL schema, migrations, seed data, and unit test coverage verified at 91%."
  );
  const [selectedPreset, setSelectedPreset] = useState<"VALID" | "INCOMPLETE" | null>("VALID");

  const handleApplyPreset = (preset: "VALID" | "INCOMPLETE") => {
    setSelectedPreset(preset);
    if (preset === "VALID") {
      setPrLink("https://github.com/azizi/tuition-erp-backend/pull/4");
      setStudentNotes(
        "Completed PostgreSQL schema with Courses, Students, Invoices, Prisma migrations, and 91% unit test coverage."
      );
    } else {
      setPrLink("https://github.com/azizi/tuition-erp-backend/pull/5");
      setStudentNotes(
        "Draft work in progress. Invoices entity still TODO, migrations skipped, test suite incomplete."
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionCombined = `PR URL: ${prLink}\nNotes & Summary: ${studentNotes}`;
    onInitiateAudit(
      DEMO_PRESETS.VALID_DELIVERABLE.spec,
      submissionCombined,
      selectedPreset || undefined
    );
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl relative">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
            01
          </div>
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            [STEP 1: SUBMIT DELIVERABLE]
          </h2>
        </div>

        {/* Demo Fast Toggles for Live Pitching */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Pitch Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset("VALID")}
            className={`text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              selectedPreset === "VALID"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-glow"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Valid (94%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("INCOMPLETE")}
            className={`text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              selectedPreset === "INCOMPLETE"
                ? "bg-red-500/20 text-red-300 border border-red-500/50"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Incomplete (54%)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Deliverable Link */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
            <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
            Deliverable Repository / PR Link:
          </label>
          <input
            type="url"
            required
            value={prLink}
            onChange={(e) => {
              setPrLink(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder="https://github.com/org/repo/pull/1"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Student Notes */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Student Submission Notes &amp; Proof of Work:
          </label>
          <textarea
            rows={3}
            required
            value={studentNotes}
            onChange={(e) => {
              setStudentNotes(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder="Describe database tables implemented, migration status, test suites..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isAuditing || disabled}
          className="w-full py-3 px-4 rounded-xl font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white shadow-glow-gonka disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Gonka Router Ingesting &amp; Auditing Models...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>[ INITIATE GONKA AUDIT ]</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
