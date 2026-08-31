"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ZkLoginPersona, MerchantQRPayload } from "@/lib/types";
import {
  QrCode,
  Sparkles,
  Store,
  Receipt,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Plus,
  RefreshCw,
} from "lucide-react";

interface MerchantPOSProps {
  currentPersona: ZkLoginPersona;
  onSimulateCustomerPayment: (payload: MerchantQRPayload) => void;
  isExecutingPayment: boolean;
}

const PRESET_PRODUCTS = [
  { title: "APU Blockchain Club 2026 Annual Membership", category: "Club Event", amount: 15.0, dues: 0.5, icon: "🎟️" },
  { title: "Campus Hackathon Swag & T-Shirt", category: "Campus Market", amount: 20.0, dues: 0.5, icon: "👕" },
  { title: "Dave's Cafe Special: Chicken Chop + Drink", category: "Dining", amount: 8.5, dues: 0.25, icon: "🍗" },
  { title: "Mamak Bistro: Table #07 Group Bill", category: "Dining", amount: 60.0, dues: 1.5, icon: "🍛" },
];

export function MerchantPOS({
  currentPersona,
  onSimulateCustomerPayment,
  isExecutingPayment,
}: MerchantPOSProps) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PRODUCTS[0]);
  const [customTitle, setCustomTitle] = useState(selectedPreset.title);
  const [customAmount, setCustomAmount] = useState<number>(selectedPreset.amount);
  const [customDues, setCustomDues] = useState<number>(selectedPreset.dues);
  const [copied, setCopied] = useState(false);

  const qrPayload: MerchantQRPayload = {
    type: "merchant_pos",
    version: "1.0",
    merchantAddress: currentPersona.address,
    merchantName: currentPersona.name,
    title: customTitle,
    amount: customAmount,
    clubDues: customDues,
    category: selectedPreset.category,
    expiresAt: Date.now() + 3600 * 1000,
  };

  const payloadString = JSON.stringify(qrPayload);

  const handleSelectPreset = (preset: typeof PRESET_PRODUCTS[0]) => {
    setSelectedPreset(preset);
    setCustomTitle(preset.title);
    setCustomAmount(preset.amount);
    setCustomDues(preset.dues);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-sky-950/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                Merchant &amp; Student Club POS Terminal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
                Sui Sponsored Gasless
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Dynamic QR Code Checkout
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              Campus stalls and student clubs display static or dynamic QRs that pre-fill sponsored PTBs on mobile browsers.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-3xl">{currentPersona.avatar}</div>
            <div>
              <div className="text-xs text-slate-400 font-mono">Merchant / Organizer</div>
              <div className="text-sm font-bold text-white truncate max-w-[180px]">
                {currentPersona.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Preset & Custom Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Preset Buttons */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Select Campus Preset or Custom Invoice
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_PRODUCTS.map((p, idx) => {
                const isSelected = customTitle === p.title;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-sky-950/70 border-sky-500/60 text-white shadow-md shadow-sky-950/30"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.title}</div>
                      <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                        ${p.amount.toFixed(2)} USDC
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Item / Ticket / Tab Description
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Total Bill Amount (USDC)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Club / Platform Dues (USDC)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customDues}
                    onChange={(e) => setCustomDues(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-purple-400 font-mono text-sm font-bold focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Net to Merchant:</span>
                <span className="text-white font-bold">${(customAmount - customDues).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Club Treasury Dues:</span>
                <span className="text-purple-300 font-bold">${customDues.toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview: High-Res Dynamic QR Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full rounded-3xl border border-sky-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-sky-950/40 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Scan to Pay via zkLogin
              </span>
            </div>

            {/* QR Code Container with sleek white backing */}
            <div className="p-4 rounded-2xl bg-white shadow-xl shadow-sky-500/10 border-4 border-sky-500/20 my-2">
              <QRCodeSVG
                value={payloadString}
                size={210}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-base font-bold text-white">{customTitle}</h3>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ${customAmount.toFixed(2)} <span className="text-sm font-normal text-slate-400">USDC</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Merchant: {currentPersona.name}
              </p>
            </div>

            {/* Copy Payload / Deep Link */}
            <div className="w-full mt-5 pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={handleCopyPayload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copied ? "Copied Payload!" : "Copy QR JSON"}
              </button>

              {/* Instant 1-Tap Customer Checkout Simulation */}
              <button
                onClick={() => onSimulateCustomerPayment(qrPayload)}
                disabled={isExecutingPayment}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
              >
                {isExecutingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    Test 1-Tap Pay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
