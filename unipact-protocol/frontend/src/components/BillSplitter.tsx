"use client";

import React, { useState } from "react";
import { ZkLoginPersona, Bill, GroupPool } from "@/lib/types";
import { PTBVisualizer } from "./PTBVisualizer";
import {
  Receipt,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  Split,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  ShieldAlert,
  Coins,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface BillSplitterProps {
  currentPersona: ZkLoginPersona;
  activePool: GroupPool;
  onSettleBillMember: (bill: Bill, repayAmount: number, duesAmount: number) => Promise<void>;
  onCreateNewBill: (newBill: Partial<Bill>) => void;
  isSettling: boolean;
}

export function BillSplitter({
  currentPersona,
  activePool,
  onSettleBillMember,
  onCreateNewBill,
  isSettling,
}: BillSplitterProps) {
  const [selectedBillId, setSelectedBillId] = useState<string>(activePool.bills[0]?.id || "");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPTBPreview, setShowPTBPreview] = useState(true);

  // New Bill Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Bill["category"]>("Dining");
  const [newAmount, setNewAmount] = useState<number>(45.0);
  const [newMemberCount, setNewMemberCount] = useState<number>(3);
  const [newClubDuesBps, setNewClubDuesBps] = useState<number>(250); // 2.5%

  const selectedBill = activePool.bills.find((b) => b.id === selectedBillId) || activePool.bills[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || newAmount <= 0) return;

    const amountPerMember = newAmount / newMemberCount;
    const clubDueAmount = (amountPerMember * (newClubDuesBps / 10000));

    const bill: Partial<Bill> = {
      title: newTitle,
      category: newCategory,
      totalAmount: newAmount,
      payerAddress: currentPersona.address,
      payerName: currentPersona.name,
      memberCount: newMemberCount,
      amountPerMember,
      clubDueAmount,
      repaidCount: 1, // Payer already covered their share
      isFullySettled: false,
      createdAt: Date.now(),
      splitMembers: [
        {
          address: currentPersona.address,
          name: `${currentPersona.name} (Payer)`,
          avatar: currentPersona.avatar,
          amount: amountPerMember,
          dues: clubDueAmount,
          status: "paid",
          paidAt: Date.now(),
        },
        {
          address: "0x2222222222222222222222222222222222222222222222222222222222222222",
          name: "Bob Lee",
          avatar: "👨🏻‍🎓",
          amount: amountPerMember,
          dues: clubDueAmount,
          status: "pending",
        },
        {
          address: "0x3333333333333333333333333333333333333333333333333333333333333333",
          name: "Charlie Wong",
          avatar: "🧑🏽‍💻",
          amount: amountPerMember,
          dues: clubDueAmount,
          status: "pending",
        },
      ],
    };

    onCreateNewBill(bill);
    setIsCreatingNew(false);
    setNewTitle("");
  };

  // Check if current logged-in user owes money on this bill
  const currentMemberSplit = selectedBill?.splitMembers.find(
    (m) => m.address.toLowerCase() === currentPersona.address.toLowerCase() ||
           (currentPersona.id === "bob" && m.name.includes("Bob")) ||
           (currentPersona.id === "charlie" && m.name.includes("Charlie"))
  );

  const isPendingRepayment = currentMemberSplit && currentMemberSplit.status === "pending";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-sky-950/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5" />
                Atomic Bill Splitting via PTBs
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
                &lt;500ms Finality
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Instant Group Tabs &amp; Expense Routing
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              One member covers the invoice. Each repayment executes in a single PTB routing funds to the payer and club treasury.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            {isCreatingNew ? "Close Form" : "Create New Bill Split"}
          </button>
        </div>
      </div>

      {/* New Bill Modal Form */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 backdrop-blur-xl shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-400" />
              New Shared Bill / Invoice
            </h3>
            <span className="text-xs text-slate-400 font-mono">Payer: {currentPersona.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Bill Title / Invoice Description
              </label>
              <input
                type="text"
                placeholder="e.g. Mamak Table #07, AWS Server Hosting, Swag"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="Dining">🍽️ Dining &amp; Food</option>
                <option value="Club Event">🎟️ Club Event &amp; Tickets</option>
                <option value="Hackathon Supplies">💻 Hackathon Supplies &amp; Cloud</option>
                <option value="Campus Market">🛍️ Campus Market &amp; Swag</option>
                <option value="Travel">🚗 Travel &amp; Transport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Total Covered (USDC)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={newAmount}
                onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Number of Members
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={newMemberCount}
                onChange={(e) => setNewMemberCount(parseInt(e.target.value) || 2)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Club / Platform Dues (bps)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                max="1000"
                value={newClubDuesBps}
                onChange={(e) => setNewClubDuesBps(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-purple-400 font-mono text-sm font-bold focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                {newClubDuesBps / 100}% club treasury fee
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
            >
              Publish Bill &amp; Create PTB Split
            </button>
          </div>
        </form>
      )}

      {/* Bill List Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePool.bills.map((bill) => {
          const isSelected = bill.id === selectedBill?.id;
          const userSplit = bill.splitMembers.find(
            (m) => m.address.toLowerCase() === currentPersona.address.toLowerCase() ||
                   (currentPersona.id === "bob" && m.name.includes("Bob"))
          );

          return (
            <button
              key={bill.id}
              onClick={() => setSelectedBillId(bill.id)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-950/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {bill.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{bill.title}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Covered by: <span className="text-slate-300">{bill.payerName}</span>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-lg font-black text-emerald-400">${bill.totalAmount.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500">
                    ${bill.amountPerMember.toFixed(2)} / member
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {bill.repaidCount}/{bill.memberCount} Settled
                  </span>
                </div>

                {userSplit && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      userSplit.status === "paid"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    }`}
                  >
                    {userSplit.status === "paid" ? "Your Share Settled" : "Owes $" + (userSplit.amount + userSplit.dues).toFixed(2)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Bill Breakdown & Interactive Settle */}
      {selectedBill && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 md:p-7 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedBill.title}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                  {selectedBill.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Payer: <span className="text-white font-semibold">{selectedBill.payerName}</span> ({selectedBill.payerAddress.slice(0, 10)}...)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right font-mono">
                <div className="text-xs text-slate-400">Total Invoice</div>
                <div className="text-xl font-black text-emerald-400">${selectedBill.totalAmount.toFixed(2)} USDC</div>
              </div>
            </div>
          </div>

          {/* Itemized breakdown (if any) */}
          {selectedBill.items && selectedBill.items.length > 0 && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-sky-400" />
                Itemized Receipt Breakdown
              </h4>
              <div className="space-y-2">
                {selectedBill.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-mono text-slate-300">
                    <span>{item.name}</span>
                    <span className="font-bold text-white">${item.price.toFixed(2)} USDC</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Settlement Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
              <Split className="w-3.5 h-3.5 text-sky-400" />
              Member Split Breakdown &amp; Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedBill.splitMembers.map((member, idx) => {
                const isPaid = member.status === "paid";
                const isYou =
                  member.address.toLowerCase() === currentPersona.address.toLowerCase() ||
                  (currentPersona.id === "bob" && member.name.includes("Bob")) ||
                  (currentPersona.id === "alice" && member.name.includes("Alice"));

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition ${
                      isPaid
                        ? "bg-slate-900/60 border-emerald-500/30"
                        : "bg-slate-900/90 border-amber-500/40 shadow-md shadow-amber-950/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{member.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            {member.name}
                            {isYou && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {member.address.slice(0, 6)}...
                          </div>
                        </div>
                      </div>

                      {isPaid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 font-mono text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Share:</span>
                        <span className="text-white font-semibold">${member.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-purple-400 text-[11px]">
                        <span>Club Dues:</span>
                        <span>+${member.dues.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 text-slate-200">
                        <span>Total:</span>
                        <span className={isPaid ? "text-emerald-400" : "text-amber-400"}>
                          ${(member.amount + member.dues).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger for Pending Repayment */}
          {isPendingRepayment ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/70 via-indigo-950/50 to-slate-950 border border-sky-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="text-xs font-bold text-sky-300 font-mono uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Your Share is Pending
                </div>
                <div className="text-xl font-extrabold text-white mt-1">
                  Pay ${(currentMemberSplit.amount + currentMemberSplit.dues).toFixed(2)} USDC to {selectedBill.payerName}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Single PTB execution &bull; 0 SUI Gas Fees (Sponsored) &bull; Sub-500ms
                </div>
              </div>

              <button
                onClick={() =>
                  onSettleBillMember(
                    selectedBill,
                    currentMemberSplit.amount,
                    currentMemberSplit.dues
                  )
                }
                disabled={isSettling}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isSettling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Broadcasting PTB...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    Settle My Share ($
                    {(currentMemberSplit.amount + currentMemberSplit.dues).toFixed(2)} USDC)
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You have no pending balance on this bill.</span>
              </div>
              <span className="text-slate-500">Switch persona in header to test member repayment</span>
            </div>
          )}

          {/* PTB Inspector Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowPTBPreview(!showPTBPreview)}
              className="flex items-center gap-2 text-xs font-mono text-sky-400 hover:text-sky-300 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showPTBPreview ? "Hide" : "Inspect"} Programmable Transaction Block (PTB) Commands</span>
              {showPTBPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPTBPreview && (
              <div className="mt-3">
                <PTBVisualizer
                  payerName={selectedBill.payerName}
                  payerAddress={selectedBill.payerAddress}
                  repayAmount={selectedBill.amountPerMember}
                  clubDues={selectedBill.clubDueAmount}
                  clubTreasuryAddress={activePool.clubTreasury}
                  totalAmount={selectedBill.amountPerMember + selectedBill.clubDueAmount}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
