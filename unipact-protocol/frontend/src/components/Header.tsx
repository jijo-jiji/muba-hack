"use client";

import React from "react";
import { ZkLoginPersona } from "@/lib/types";
import {
  Shield,
  Zap,
  Coins,
  QrCode,
  Layers,
  Store,
  Users,
  ChevronDown,
  Sparkles,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

interface HeaderProps {
  currentPersona: ZkLoginPersona;
  onOpenZkLoginModal: () => void;
  onOpenQRScanner: () => void;
  onOpenFaucet: () => void;
  activeTab: "splitter" | "pos" | "ledger" | "escrow";
  onChangeTab: (tab: "splitter" | "pos" | "ledger" | "escrow") => void;
}

export function Header({
  currentPersona,
  onOpenZkLoginModal,
  onOpenQRScanner,
  onOpenFaucet,
  activeTab,
  onChangeTab,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-1 ring-white/20">
              <Zap className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  UniPact <span className="text-sky-400">Sui</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                zkLogin &bull; Gasless PTB Settlements &bull; POS QRs
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => onChangeTab("splitter")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                activeTab === "splitter"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Bill Splitter &amp; PTBs
            </button>

            <button
              onClick={() => onChangeTab("pos")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                activeTab === "pos"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Merchant / Club POS
            </button>

            <button
              onClick={() => onChangeTab("ledger")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                activeTab === "ledger"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Group Ledger
            </button>

            <button
              onClick={() => onChangeTab("escrow")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                activeTab === "escrow"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Freelance Escrow
            </button>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Live Camera QR Scanner Trigger */}
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-mono font-semibold transition"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Stablecoin Balance & Faucet */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
              <div className="px-2.5 py-1 text-xs font-mono">
                <span className="text-slate-400 mr-1">$</span>
                <span className="font-bold text-emerald-400">
                  {currentPersona.usdcBalance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">USDC</span>
              </div>
              <button
                onClick={onOpenFaucet}
                className="p-1 rounded-lg hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition"
                title="Claim Free Testnet USDC"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* zkLogin Persona Profile Dropdown Trigger */}
            <button
              onClick={onOpenZkLoginModal}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-left transition ring-1 ring-sky-500/20"
            >
              <div className="text-xl p-1 rounded-xl bg-slate-800">
                {currentPersona.avatar}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[120px]">
                  {currentPersona.name.split(" ")[0]}
                </div>
                <div className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  zkLogin
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-900 text-xs font-mono">
          <button
            onClick={() => onChangeTab("splitter")}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === "splitter" ? "bg-sky-500/20 text-sky-300" : "text-slate-400"
            }`}
          >
            Bill Splitter
          </button>
          <button
            onClick={() => onChangeTab("pos")}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === "pos" ? "bg-sky-500/20 text-sky-300" : "text-slate-400"
            }`}
          >
            Merchant POS
          </button>
          <button
            onClick={() => onChangeTab("ledger")}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === "ledger" ? "bg-sky-500/20 text-sky-300" : "text-slate-400"
            }`}
          >
            Group Ledger
          </button>
          <button
            onClick={() => onChangeTab("escrow")}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === "escrow" ? "bg-sky-500/20 text-sky-300" : "text-slate-400"
            }`}
          >
            Escrow Engine
          </button>
        </div>
      </div>
    </header>
  );
}
