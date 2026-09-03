"use client";

import React, { useState } from "react";
import { TrustMeshJob, ProjectScope, SoftwareSubType, ZkLoginPersona, ClientAsset } from "@/lib/types";
import {
  Briefcase,
  Code2,
  Video,
  FileText,
  Upload,
  ShieldCheck,
  Sparkles,
  Lock,
  Plus,
  Coins,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  Eye,
  FolderLock,
  Film,
  FileCode,
} from "lucide-react";

interface TrustMeshMarketplaceProps {
  currentPersona: ZkLoginPersona;
  jobs: TrustMeshJob[];
  onSelectJob: (job: TrustMeshJob) => void;
  selectedJobId: string;
  onCreateJob: (newJob: Partial<TrustMeshJob>) => void;
  onAssignSelf: (jobId: string) => void;
}

export function TrustMeshMarketplace({
  currentPersona,
  jobs,
  onSelectJob,
  selectedJobId,
  onCreateJob,
  onAssignSelf,
}: TrustMeshMarketplaceProps) {
  const [filterScope, setFilterScope] = useState<"all" | ProjectScope>("all");
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [selectedAssetRepoJob, setSelectedAssetRepoJob] = useState<TrustMeshJob | null>(null);

  // New Job Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newScope, setNewScope] = useState<ProjectScope>("software_development");
  const [newSubType, setNewSubType] = useState<SoftwareSubType>("HRMS");
  const [newTechStack, setNewTechStack] = useState("Next.js, TypeScript, Sui Move");
  const [newOutcome, setNewOutcome] = useState("Self-service employee automation portal");
  const [newCampaignObj, setNewCampaignObj] = useState("50,000 views on TikTok & IG Reels");
  const [newBudget, setNewBudget] = useState<number>(300);

  const filteredJobs = jobs.filter((j) => filterScope === "all" || j.scope === filterScope);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || newBudget <= 0) return;

    const job: Partial<TrustMeshJob> = {
      title: newTitle,
      description: newDesc,
      scope: newScope,
      budgetUsdc: newBudget,
      escrowVaultId: `0x_vault_${Date.now()}`,
      escrowStatus: "locked",
      companyName: currentPersona.name.includes("Company") || currentPersona.role === "company" ? currentPersona.name : "Maxis Corporate Partner",
      companyEmail: currentPersona.email,
      companyVerification: "corporate_silent",
      status: "open",
      createdAt: Date.now(),
      clientAssets: [
        {
          id: `ca_${Date.now()}_1`,
          name: `${newTitle.replace(/\s+/g, "_")}_Brief.pdf`,
          type: "brief",
          sizeMb: 2.1,
          url: "#",
          uploadedAt: Date.now(),
        },
        ...(newScope === "digital_marketing"
          ? [
              {
                id: `ca_${Date.now()}_2`,
                name: "Raw_Footage_Camera_A_4K.mp4",
                type: "raw_video" as const,
                sizeMb: 54.2,
                url: "#",
                uploadedAt: Date.now(),
              },
            ]
          : []),
      ],
      deliverables: [],
      ...(newScope === "software_development"
        ? {
            softwareSubType: newSubType,
            techStack: newTechStack.split(",").map((s) => s.trim()),
            projectOutcome: newOutcome,
          }
        : {
            campaignObjective: newCampaignObj,
            targetPlatforms: ["TikTok", "Instagram Reels"],
            kpiTargets: "3 finished video cuts + copywriting",
          }),
    };

    onCreateJob(job);
    setIsPostingModalOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-sky-950/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Dual-Scope Talent Marketplace
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
                Sui Escrow Locked
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Software Dev &amp; Digital Marketing Projects
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              Companies post scoped work and lock milestone escrow in testnet USDC. Verified students execute and get audited via Gonka AI.
            </p>
          </div>

          <button
            onClick={() => setIsPostingModalOpen(true)}
            className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post New Project &amp; Escrow
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-2xl bg-slate-900/90 border border-slate-800 p-1">
          <button
            onClick={() => setFilterScope("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
              filterScope === "all"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Work Scopes ({jobs.length})
          </button>

          <button
            onClick={() => setFilterScope("software_development")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
              filterScope === "software_development"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            Software Development
          </button>

          <button
            onClick={() => setFilterScope("digital_marketing")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
              filterScope === "digital_marketing"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            Digital Marketing &amp; Video
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-white">{filteredJobs.length}</strong> active milestones
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          const isSoftware = job.scope === "software_development";

          return (
            <div
              key={job.id}
              className={`p-6 rounded-3xl border transition flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-sky-500/80 shadow-2xl shadow-sky-950/50 ring-1 ring-sky-500/30"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        isSoftware
                          ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {isSoftware ? "Software Development" : "Digital Marketing"}
                    </span>
                    {job.softwareSubType && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {job.softwareSubType}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    ${job.budgetUsdc.toFixed(2)} USDC
                  </div>
                </div>

                {/* Job Title */}
                <h3 className="text-lg font-bold text-white mb-1.5">{job.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-mono leading-relaxed">
                  {job.description}
                </p>

                {/* Company info & verification tag */}
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
                  <span className="text-slate-300 font-semibold">{job.companyName}</span>
                  <span className="text-slate-600">&bull;</span>
                  {job.companyVerification === "corporate_silent" ? (
                    <span className="text-[10px] text-sky-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Silent Verified (@{job.companyEmail.split("@")[1]})
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      SSM Verified
                    </span>
                  )}
                </div>

                {/* Specific tags */}
                {isSoftware && job.techStack && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {!isSoftware && (
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-purple-300 mb-4">
                    <strong>KPI Target:</strong> {job.kpiTargets}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                {/* Client Assets Pill */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setSelectedAssetRepoJob(job)}
                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition"
                  >
                    <FolderLock className="w-3.5 h-3.5" />
                    <span>Client Asset Repository ({job.clientAssets.length} files)</span>
                  </button>

                  <span className="text-slate-500 text-[11px]">
                    Vault: <code className="text-slate-400">{job.escrowVaultId.slice(0, 10)}...</code>
                  </span>
                </div>

                {/* Assignment & Select Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectJob(job)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25"
                        : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isSelected ? "Active in Audit Engine" : "Inspect & Submit Deliverable"}
                  </button>

                  {job.status === "open" && (
                    <button
                      onClick={() => onAssignSelf(job.id)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition"
                    >
                      Claim Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Asset Repository Drawer / Modal */}
      {selectedAssetRepoJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 shadow-2xl shadow-sky-950/50 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Client Asset Repository
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Confidential &bull; Visible only to Company, Admin, and assigned Student Team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetRepoJob(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedAssetRepoJob.clientAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {asset.type === "raw_video" ? (
                      <Film className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : asset.type === "brief" ? (
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-white truncate font-medium">{asset.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-400 text-[11px]">{asset.sizeMb} MB</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800 text-[10px]">
                      Download
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Protected under Malaysian PDPA guidelines. Client retains all intellectual property of raw footage and briefs.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Post New Job Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handlePostSubmit}
            className="relative w-full max-w-xl rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 md:p-7 shadow-2xl shadow-sky-950/60 backdrop-blur-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" />
                Post New Job &amp; Lock Milestone Escrow
              </h3>
              <button
                type="button"
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scope Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewScope("software_development")}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  newScope === "software_development"
                    ? "bg-sky-950/70 border-sky-500 text-white shadow-md shadow-sky-950/40"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Code2 className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-bold">Software Development</div>
                  <div className="text-[10px] text-slate-400">ERP, HRMS, CRM, Automation</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewScope("digital_marketing")}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  newScope === "digital_marketing"
                    ? "bg-purple-950/70 border-purple-500 text-white shadow-md shadow-purple-950/40"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold">Digital Marketing</div>
                  <div className="text-[10px] text-slate-400">Raw Video Footage &amp; Ads</div>
                </div>
              </button>
            </div>

            {/* Common Fields */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Project Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Cafe HRMS & Leave Portal, TikTok Viral Ad Campaign"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Project Scope &amp; Deliverables</label>
              <textarea
                rows={2}
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Detailed project requirements, deliverables, and acceptance criteria for Gonka AI verification..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Scope Specific Fields */}
            {newScope === "software_development" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Sub-Type</label>
                  <select
                    value={newSubType}
                    onChange={(e) => setNewSubType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  >
                    <option value="Landing Page / Website">Landing Page / Website</option>
                    <option value="ERP">ERP System</option>
                    <option value="HRMS">HRMS Portal</option>
                    <option value="CRM">CRM Tool</option>
                    <option value="Custom Automation Tool">Custom Automation Tool</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Tech Stack</label>
                  <input
                    type="text"
                    value={newTechStack}
                    onChange={(e) => setNewTechStack(e.target.value)}
                    placeholder="Next.js, Django, Sui Move"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Campaign Objective &amp; KPIs</label>
                <input
                  type="text"
                  value={newCampaignObj}
                  onChange={(e) => setNewCampaignObj(e.target.value)}
                  placeholder="e.g. 50k views on TikTok, 3 finished vertical reels"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            )}

            {/* Escrow Budget */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Milestone Escrow Deposit (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number"
                  step="10"
                  min="50"
                  value={newBudget}
                  onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                90% ($
                {(newBudget * 0.9).toFixed(2)} USDC) to student upon passing Gonka AI audit &bull; 10% ($
                {(newBudget * 0.1).toFixed(2)} USDC) TrustMesh platform fee.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPostingModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25"
              >
                Deposit Escrow &amp; Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
