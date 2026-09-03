"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { TrustMeshMarketplace } from "@/components/TrustMeshMarketplace";
import { StudentPortfolioModal } from "@/components/StudentPortfolioModal";
import { BillSplitter } from "@/components/BillSplitter";
import { MerchantPOS } from "@/components/MerchantPOS";
import { GroupLedger } from "@/components/GroupLedger";
import { ZkLoginModal } from "@/components/ZkLoginModal";
import { QRScannerModal } from "@/components/QRScannerModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { FaucetModal } from "@/components/FaucetModal";

// Escrow & Gonka AI Audit components
import { ProjectCard } from "@/components/ProjectCard";
import { Step1Submit } from "@/components/Step1Submit";
import { Step2AuditReport } from "@/components/Step2AuditReport";
import { Step3Settlement } from "@/components/Step3Settlement";

// Types & Initial Data
import {
  ZkLoginPersona,
  Bill,
  GroupPool,
  MerchantQRPayload,
  MilestoneAuditResult,
  TrustMeshJob,
} from "@/lib/types";
import { INITIAL_PERSONAS } from "@/lib/zklogin";
import { INITIAL_TRUSTMESH_JOBS, INITIAL_GROUP_POOLS } from "@/lib/mockData";
import { useDualSignSponsoredTx } from "@/hooks/useDualSignSponsoredTx";
import { buildSplitRepaymentPTB, buildMerchantPaymentPTB } from "@/lib/ptbBuilder";
import { Sparkles, Shield, Layers, Zap, Store, Users, Briefcase, Award } from "lucide-react";

export default function Home() {
  // zkLogin Persona (defaulting to Bob Lee, verified student talent)
  const [currentPersona, setCurrentPersona] = useState<ZkLoginPersona>(INITIAL_PERSONAS[1]);
  const [activeTab, setActiveTab] = useState<"marketplace" | "escrow" | "splitter" | "pos" | "ledger">("marketplace");

  // TrustMesh Jobs State
  const [jobs, setJobs] = useState<TrustMeshJob[]>(INITIAL_TRUSTMESH_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(INITIAL_TRUSTMESH_JOBS[0].id);
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Modals
  const [isZkLoginModalOpen, setIsZkLoginModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    title: string;
    totalAmount: number;
    payerAmount: number;
    duesAmount: number;
    payerName: string;
    digest?: string;
    executionTimeMs: number;
    isGasSponsored: boolean;
    explorerUrl?: string;
  } | null>(null);

  // Group Pool Shared Object State (for Team Splits)
  const [groupPools, setGroupPools] = useState<GroupPool[]>(INITIAL_GROUP_POOLS);
  const activePool = groupPools[0];

  // Escrow & Gonka AI State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<MilestoneAuditResult | null>(null);
  const [projectStatus, setProjectStatus] = useState<
    "pending_submission" | "auditing" | "audit_passed" | "audit_failed" | "settled"
  >("pending_submission");

  // Sponsored PTB Hook
  const {
    executeSponsoredTransaction,
    executeReleaseAuditedMilestone,
    isExecuting,
  } = useDualSignSponsoredTx();

  // Create New Job Handler
  const handleCreateJob = (newJobData: Partial<TrustMeshJob>) => {
    const job: TrustMeshJob = {
      id: `job_${Date.now()}`,
      title: newJobData.title || "Custom Project",
      description: newJobData.description || "",
      scope: newJobData.scope || "software_development",
      budgetUsdc: newJobData.budgetUsdc || 300,
      escrowVaultId: `0x_vault_${Date.now()}`,
      escrowStatus: "locked",
      companyName: newJobData.companyName || "Corporate Partner",
      companyEmail: newJobData.companyEmail || currentPersona.email,
      companyVerification: newJobData.companyVerification || "corporate_silent",
      status: "open",
      clientAssets: newJobData.clientAssets || [],
      deliverables: [],
      createdAt: Date.now(),
      ...(newJobData.scope === "software_development"
        ? {
            softwareSubType: newJobData.softwareSubType || "HRMS",
            techStack: newJobData.techStack || ["Next.js", "TypeScript"],
            projectOutcome: newJobData.projectOutcome || "Automation portal",
          }
        : {
            campaignObjective: newJobData.campaignObjective || "Brand Awareness",
            targetPlatforms: ["TikTok", "Instagram Reels"],
            kpiTargets: "3 edited reels",
          }),
    };

    setJobs((prev) => [job, ...prev]);
    setSelectedJobId(job.id);
  };

  const handleAssignSelf = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "in_progress",
              assignedStudent: {
                id: currentPersona.id,
                name: currentPersona.name,
                email: currentPersona.email,
                address: currentPersona.address,
                university: currentPersona.university || "Asia Pacific University (APU)",
                avatar: currentPersona.avatar,
              },
            }
          : j
      )
    );
    setSelectedJobId(jobId);
    setActiveTab("escrow");
  };

  // Gonka Forensic Audit Submission Handler
  const handleInitiateAudit = async (spec: string, submission: string, preset?: "VALID" | "INCOMPLETE") => {
    setIsAuditing(true);
    setProjectStatus("auditing");
    setAuditResult(null);

    try {
      const res = await fetch("/api/audit-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, submission, preset }),
      });

      if (!res.ok) throw new Error("Audit API call failed");
      const result: MilestoneAuditResult = await res.json();
      setAuditResult(result);
      setProjectStatus(result.isApproved ? "audit_passed" : "audit_failed");
    } catch (e: any) {
      console.error("Audit failure:", e);
    } finally {
      setIsAuditing(false);
    }
  };

  // Gasless Escrow Milestone Release Handler (90% Student / 10% Treasury)
  const handleExecuteEscrowSettlement = async () => {
    if (!auditResult) return;
    try {
      const res = await executeReleaseAuditedMilestone(
        auditResult.gonkaRequestId,
        auditResult.truthScore,
        currentPersona.keypair
      );

      if (res.status === "success") {
        setProjectStatus("settled");
        const totalBudget = selectedJob.budgetUsdc;
        const studentPayout = totalBudget * 0.9;
        const platformFee = totalBudget * 0.1;

        setCurrentPersona((prev) => ({
          ...prev,
          usdcBalance: prev.usdcBalance + studentPayout,
        }));

        setJobs((prev) =>
          prev.map((j) => (j.id === selectedJobId ? { ...j, status: "settled" } : j))
        );

        setReceiptData({
          isOpen: true,
          title: `Milestone Release: ${selectedJob.title}`,
          totalAmount: totalBudget,
          payerAmount: studentPayout,
          duesAmount: platformFee,
          payerName: currentPersona.name,
          digest: res.digest,
          executionTimeMs: res.executionTimeMs,
          isGasSponsored: true,
          explorerUrl: res.explorerUrl,
        });
      }
    } catch (e) {
      console.error("Escrow settlement failed:", e);
    }
  };

  // Team Split PTB Handler
  const handleSettleBillMember = async (bill: Bill, repayAmount: number, duesAmount: number) => {
    try {
      const res = await executeSponsoredTransaction(
        buildSplitRepaymentPTB({
          poolId: activePool.id,
          billId: bill.id,
          payerAddress: bill.payerAddress,
          clubTreasuryAddress: activePool.clubTreasury,
          memberRepayAmountUsdc: repayAmount,
          clubDueAmountUsdc: duesAmount,
        }),
        currentPersona.keypair
      );

      const totalPaid = repayAmount + duesAmount;

      setCurrentPersona((prev) => ({
        ...prev,
        usdcBalance: Math.max(0, prev.usdcBalance - totalPaid),
      }));

      setReceiptData({
        isOpen: true,
        title: `Team Split Settlement: ${bill.title}`,
        totalAmount: totalPaid,
        payerAmount: repayAmount,
        duesAmount: duesAmount,
        payerName: bill.payerName,
        digest: res.digest,
        executionTimeMs: res.executionTimeMs,
        isGasSponsored: true,
        explorerUrl: res.explorerUrl,
      });
    } catch (err: any) {
      console.error("Bill settlement failed:", err);
    }
  };

  // POS Payment Handler
  const handleConfirmPOSPayment = async (payload: MerchantQRPayload) => {
    try {
      const res = await executeSponsoredTransaction(
        buildMerchantPaymentPTB({
          merchantAddress: payload.merchantAddress,
          totalAmountUsdc: payload.amount,
          clubTreasuryAddress: activePool.clubTreasury,
          clubDueAmountUsdc: payload.clubDues,
          itemDescription: payload.title,
        }),
        currentPersona.keypair
      );

      setCurrentPersona((prev) => ({
        ...prev,
        usdcBalance: Math.max(0, prev.usdcBalance - payload.amount),
      }));

      setIsQRScannerOpen(false);

      setReceiptData({
        isOpen: true,
        title: `POS Checkout: ${payload.title}`,
        totalAmount: payload.amount,
        payerAmount: payload.amount - (payload.clubDues || 0),
        duesAmount: payload.clubDues || 0,
        payerName: payload.merchantName,
        digest: res.digest,
        executionTimeMs: res.executionTimeMs,
        isGasSponsored: true,
        explorerUrl: res.explorerUrl,
      });
    } catch (err: any) {
      console.error("Merchant payment failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentPersona={currentPersona}
        onOpenZkLoginModal={() => setIsZkLoginModalOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Gas Relayer & Network Operational Bar */}
      <div className="bg-sky-950/60 border-b border-sky-500/20 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              <strong>TrustMesh Relayer:</strong> Operational Gas Pool Active &bull; 0 SUI Gas Fees &bull; Testnet USDC Escrow
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>Sui Testnet: <strong>Connected</strong></span>
            <span>Gonka Router: <strong>api.gonkarouter.io</strong></span>
            <span>zkLogin Ephemeral Session: <strong>Active</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: Talent Marketplace & Jobs */}
        {activeTab === "marketplace" && (
          <TrustMeshMarketplace
            currentPersona={currentPersona}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectJob={(j) => {
              setSelectedJobId(j.id);
              setActiveTab("escrow");
            }}
            onCreateJob={handleCreateJob}
            onAssignSelf={handleAssignSelf}
          />
        )}

        {/* TAB 2: AI Milestone Audit & Escrow (Gonka Router) */}
        {activeTab === "escrow" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ProjectCard
              escrowAmount={selectedJob.budgetUsdc}
              status={projectStatus}
            />

            <div className="space-y-6">
              <Step1Submit
                onInitiateAudit={handleInitiateAudit}
                isAuditing={isAuditing}
                disabled={projectStatus === "settled"}
              />

              <Step2AuditReport
                auditResult={auditResult}
                isAuditing={isAuditing}
              />

              <Step3Settlement
                auditResult={auditResult}
                onExecuteSettlement={handleExecuteEscrowSettlement}
                isExecuting={isExecuting}
                executionResult={null}
                error={null}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Atomic PTB Settlements */}
        {activeTab === "splitter" && (
          <BillSplitter
            currentPersona={currentPersona}
            activePool={activePool}
            onSettleBillMember={handleSettleBillMember}
            onCreateNewBill={() => {}}
            isSettling={isExecuting}
          />
        )}

        {/* TAB 4: Merchant & Club POS QR Codes */}
        {activeTab === "pos" && (
          <MerchantPOS
            currentPersona={currentPersona}
            onSimulateCustomerPayment={handleConfirmPOSPayment}
            isExecutingPayment={isExecuting}
          />
        )}

        {/* TAB 5: Team Ledger & AdminCap Arbitrator */}
        {activeTab === "ledger" && (
          <GroupLedger
            currentPersona={currentPersona}
            activePool={activePool}
            onAdminResolveDispute={() => {}}
            onAdminWithdrawDues={() => {}}
            onAdminCloseTab={() => {}}
          />
        )}

        {/* Multi-Track Architecture Highlights for MUBA Hacks 2026 Evaluation */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              MUBA Hacks 2026 Architectural Evaluation Matrix
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Sui Track 01: Stablecoins
              </div>
              <p className="text-slate-400 text-[11px]">
                Zero-friction zkLogin, gas-sponsored relayer (<code className="text-sky-300">/api/sponsor</code>), and atomic 90/10 milestone splits in testnet USDC.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Sui Track 02: AI × Sui
              </div>
              <p className="text-slate-400 text-[11px]">
                Dynamic PTB builder translating deliverable audits into on-chain Move calls with embedded Gonka Request IDs.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Gonka Track: AI for Society
              </div>
              <p className="text-slate-400 text-[11px]">
                Impartial verification via Gonka Router (<code className="text-purple-300">gonkarouter.io</code>) preventing SME ghosting and guaranteeing fair payouts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Talent Model v3.0
              </div>
              <p className="text-slate-400 text-[11px]">
                Individual university talent verification, client asset repository (raw video), and automated project reports.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Verifiable Student Portfolio Modal */}
      <StudentPortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        student={currentPersona}
        completedJobs={jobs.filter((j) => j.status === "settled")}
      />

      {/* zkLogin Authentication Modal */}
      <ZkLoginModal
        isOpen={isZkLoginModalOpen}
        onClose={() => setIsZkLoginModalOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
      />

      {/* Mobile Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onConfirmPayment={handleConfirmPOSPayment}
        isExecuting={isExecuting}
      />

      {/* Settlement Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={receiptData.isOpen}
          onClose={() => setReceiptData(null)}
          title={receiptData.title}
          totalAmount={receiptData.totalAmount}
          payerAmount={receiptData.payerAmount}
          duesAmount={receiptData.duesAmount}
          payerName={receiptData.payerName}
          digest={receiptData.digest}
          executionTimeMs={receiptData.executionTimeMs}
          isGasSponsored={receiptData.isGasSponsored}
          explorerUrl={receiptData.explorerUrl}
        />
      )}

      {/* Faucet Modal */}
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
        userKeypair={currentPersona.keypair}
        onMintSuccess={(amt) =>
          setCurrentPersona((prev) => ({ ...prev, usdcBalance: prev.usdcBalance + amt }))
        }
      />
    </div>
  );
}
