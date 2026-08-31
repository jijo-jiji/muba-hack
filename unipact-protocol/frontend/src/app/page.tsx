"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BillSplitter } from "@/components/BillSplitter";
import { MerchantPOS } from "@/components/MerchantPOS";
import { GroupLedger } from "@/components/GroupLedger";
import { ZkLoginModal } from "@/components/ZkLoginModal";
import { QRScannerModal } from "@/components/QRScannerModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { FaucetModal } from "@/components/FaucetModal";

// Escrow Engine components
import { ProjectCard } from "@/components/ProjectCard";
import { Step1Submit } from "@/components/Step1Submit";
import { Step2AuditReport } from "@/components/Step2AuditReport";
import { Step3Settlement } from "@/components/Step3Settlement";

// Types & Data
import { ZkLoginPersona, Bill, GroupPool, MerchantQRPayload, MilestoneAuditResult } from "@/lib/types";
import { INITIAL_PERSONAS } from "@/lib/zklogin";
import { INITIAL_GROUP_POOLS } from "@/lib/mockData";
import { useDualSignSponsoredTx } from "@/hooks/useDualSignSponsoredTx";
import { Sparkles, Shield, Layers, Zap, Store, Users, CheckCircle2 } from "lucide-react";

export default function Home() {
  // zkLogin Persona State (defaulting to Bob who has pending repayments)
  const [currentPersona, setCurrentPersona] = useState<ZkLoginPersona>(INITIAL_PERSONAS[1]); // Bob Lee
  const [activeTab, setActiveTab] = useState<"splitter" | "pos" | "ledger" | "escrow">("splitter");

  // Modals
  const [isZkLoginModalOpen, setIsZkLoginModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    title: string;
    totalAmount: number;
    payerAmount: number;
    duesAmount: number;
    payerName: string;
    digest: string;
    executionTimeMs: number;
    isGasSponsored: boolean;
    explorerUrl: string;
  } | null>(null);

  // Group Pool Shared Object State
  const [groupPools, setGroupPools] = useState<GroupPool[]>(INITIAL_GROUP_POOLS);
  const activePool = groupPools[0];

  // Escrow Engine State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<MilestoneAuditResult | null>(null);
  const [projectStatus, setProjectStatus] = useState<
    "pending_submission" | "auditing" | "audit_passed" | "audit_failed" | "settled"
  >("pending_submission");

  // Sponsored PTB Hook
  const {
    executeBillRepayment,
    executeMerchantPayment,
    executeReleaseAuditedMilestone,
    isExecuting,
  } = useDualSignSponsoredTx();

  // Handle Atomic Bill Repayment PTB (<500ms execution)
  const handleSettleBillMember = async (bill: Bill, repayAmount: number, duesAmount: number) => {
    try {
      const res = await executeBillRepayment(
        {
          poolId: activePool.id,
          billId: bill.id,
          payerAddress: bill.payerAddress,
          clubTreasuryAddress: activePool.clubTreasury,
          memberRepayAmountUsdc: repayAmount,
          clubDueAmountUsdc: duesAmount,
        },
        currentPersona.keypair
      );

      const totalPaid = repayAmount + duesAmount;

      // Update Persona Balance
      setCurrentPersona((prev) => ({
        ...prev,
        usdcBalance: Math.max(0, prev.usdcBalance - totalPaid),
      }));

      // Update GroupPool state
      setGroupPools((prevPools) => {
        return prevPools.map((pool) => {
          if (pool.id !== activePool.id) return pool;

          const updatedBills = pool.bills.map((b) => {
            if (b.id !== bill.id) return b;
            const updatedMembers = b.splitMembers.map((m) => {
              if (
                m.address.toLowerCase() === currentPersona.address.toLowerCase() ||
                (currentPersona.id === "bob" && m.name.includes("Bob")) ||
                (currentPersona.id === "charlie" && m.name.includes("Charlie"))
              ) {
                return {
                  ...m,
                  status: "paid" as const,
                  paidTxDigest: res.digest,
                  paidAt: Date.now(),
                };
              }
              return m;
            });
            const repaidCount = updatedMembers.filter((m) => m.status === "paid").length;
            return {
              ...b,
              repaidCount,
              isFullySettled: repaidCount >= b.memberCount,
              splitMembers: updatedMembers,
            };
          });

          // Recalculate member balances
          const updatedMembers = pool.members.map((m) => {
            if (
              m.address.toLowerCase() === currentPersona.address.toLowerCase() ||
              (currentPersona.id === "bob" && m.name.includes("Bob"))
            ) {
              return { ...m, netBalance: m.netBalance + repayAmount };
            }
            if (m.address.toLowerCase() === bill.payerAddress.toLowerCase()) {
              return { ...m, netBalance: m.netBalance - repayAmount };
            }
            return m;
          });

          return {
            ...pool,
            totalSettled: pool.totalSettled + repayAmount,
            treasuryBalance: pool.treasuryBalance + duesAmount,
            bills: updatedBills,
            members: updatedMembers,
          };
        });
      });

      // Trigger high-tech Receipt Modal
      setReceiptData({
        isOpen: true,
        title: `Atomic Repayment for ${bill.title}`,
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

  // Handle Merchant / Club POS QR Payment
  const handleConfirmPOSPayment = async (payload: MerchantQRPayload) => {
    try {
      const res = await executeMerchantPayment(
        {
          merchantAddress: payload.merchantAddress,
          totalAmountUsdc: payload.amount,
          clubTreasuryAddress: activePool.clubTreasury,
          clubDueAmountUsdc: payload.clubDues,
          itemDescription: payload.title,
        },
        currentPersona.keypair
      );

      // Deduct balance
      setCurrentPersona((prev) => ({
        ...prev,
        usdcBalance: Math.max(0, prev.usdcBalance - payload.amount),
      }));

      setIsQRScannerOpen(false);

      // Show receipt
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

  // Handle Creating a new bill
  const handleCreateNewBill = (newBillData: Partial<Bill>) => {
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      poolId: activePool.id,
      title: newBillData.title || "Shared Expense",
      category: newBillData.category || "Dining",
      totalAmount: newBillData.totalAmount || 0,
      payerAddress: newBillData.payerAddress || currentPersona.address,
      payerName: newBillData.payerName || currentPersona.name,
      memberCount: newBillData.memberCount || 3,
      amountPerMember: newBillData.amountPerMember || 0,
      clubDueAmount: newBillData.clubDueAmount || 0,
      repaidCount: 1,
      isFullySettled: false,
      createdAt: Date.now(),
      splitMembers: newBillData.splitMembers || [],
    };

    setGroupPools((prevPools) =>
      prevPools.map((pool) =>
        pool.id === activePool.id
          ? {
              ...pool,
              totalExpenses: pool.totalExpenses + newBill.totalAmount,
              bills: [newBill, ...pool.bills],
            }
          : pool
      )
    );
  };

  // AdminCap actions
  const handleAdminResolveDispute = (billId: string, reason: string) => {
    setGroupPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id !== activePool.id) return pool;
        return {
          ...pool,
          bills: pool.bills.map((b) => (b.id === billId ? { ...b, isFullySettled: true } : b)),
        };
      })
    );
    alert(`Dispute resolved via AdminCap: ${reason}`);
  };

  const handleAdminWithdrawDues = () => {
    const dues = activePool.treasuryBalance;
    setGroupPools((prevPools) =>
      prevPools.map((pool) =>
        pool.id === activePool.id ? { ...pool, treasuryBalance: 0 } : pool
      )
    );
    alert(`Withdrawn $${dues.toFixed(2)} USDC in club treasury dues to ${currentPersona.name}`);
  };

  const handleAdminCloseTab = () => {
    setGroupPools((prevPools) =>
      prevPools.map((pool) =>
        pool.id === activePool.id ? { ...pool, isActive: false } : pool
      )
    );
    alert("Group Tab frozen & closed via AdminCap.");
  };

  // Escrow Audit Handlers
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
        setCurrentPersona((prev) => ({ ...prev, usdcBalance: prev.usdcBalance + 270 }));
        setReceiptData({
          isOpen: true,
          title: "Milestone Payout: 90% Student / 10% Treasury",
          totalAmount: 300.0,
          payerAmount: 270.0,
          duesAmount: 30.0,
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentPersona={currentPersona}
        onOpenZkLoginModal={() => setIsZkLoginModalOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenFaucet={() => setIsFaucetOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Gas Relayer Operational Status Bar */}
      <div className="bg-sky-950/60 border-b border-sky-500/20 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              <strong>Operational Gas Station:</strong> Relayer Active &bull; Dual-Sign Sponsored &bull; 0 SUI User Gas
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>Sui Network: <strong>Testnet / Local</strong></span>
            <span>zkLogin Ephemeral Session: <strong>Valid (Epoch 110)</strong></span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: Atomic Bill Splitter & PTB Builder */}
        {activeTab === "splitter" && (
          <BillSplitter
            currentPersona={currentPersona}
            activePool={activePool}
            onSettleBillMember={handleSettleBillMember}
            onCreateNewBill={handleCreateNewBill}
            isSettling={isExecuting}
          />
        )}

        {/* TAB 2: Merchant & Club POS QR Terminal */}
        {activeTab === "pos" && (
          <MerchantPOS
            currentPersona={currentPersona}
            onSimulateCustomerPayment={handleConfirmPOSPayment}
            isExecutingPayment={isExecuting}
          />
        )}

        {/* TAB 3: Group Ledger & AdminCap Arbitrator */}
        {activeTab === "ledger" && (
          <GroupLedger
            currentPersona={currentPersona}
            activePool={activePool}
            onAdminResolveDispute={handleAdminResolveDispute}
            onAdminWithdrawDues={handleAdminWithdrawDues}
            onAdminCloseTab={handleAdminCloseTab}
          />
        )}

        {/* TAB 4: Freelance Milestone Escrow (Gonka AI) */}
        {activeTab === "escrow" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ProjectCard escrowAmount={300.0} status={projectStatus} />
            <div className="space-y-6">
              <Step1Submit
                onInitiateAudit={handleInitiateAudit}
                isAuditing={isAuditing}
                disabled={projectStatus === "settled"}
              />
              <Step2AuditReport auditResult={auditResult} isAuditing={isAuditing} />
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

        {/* Multi-Track Architecture Highlights for Hackathon Evaluation */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Core Technical Architecture Verification
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Instant zkLogin
              </div>
              <p className="text-slate-400 text-[11px]">
                Google OAuth + Groth16 zkProof deriving deterministic Sui address with zero browser extensions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Gasless Settlements
              </div>
              <p className="text-slate-400 text-[11px]">
                Operational gas station endpoint (<code className="text-emerald-300">/api/sponsor</code>) paying SUI fees so users only spend USDC.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Atomic PTBs (&lt;500ms)
              </div>
              <p className="text-slate-400 text-[11px]">
                Bundles SplitCoins, payer reimbursement, club dues, and Move calls in a single atomic execution.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Dynamic POS QRs
              </div>
              <p className="text-slate-400 text-[11px]">
                Merchant/Club POS terminal generating dynamic QRs and integrated live camera scanner.
              </p>
            </div>
          </div>
        </div>
      </main>

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

      {/* High-Tech Settlement Receipt Modal */}
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
