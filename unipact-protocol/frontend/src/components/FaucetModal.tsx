"use client";

import React, { useState } from "react";
import { X, Coins, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Keypair } from "@mysten/sui/cryptography";

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKeypair: Keypair | null;
  onMintSuccess: (amount: number) => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  userKeypair,
  onMintSuccess,
}) => {
  const [mintAmount, setMintAmount] = useState(300);
  const [isMinting, setIsMinting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleMint = async () => {
    setIsMinting(true);
    setMsg(null);

    try {
      // Simulate or call local faucet
      await new Promise((resolve) => setTimeout(resolve, 800));
      onMintSuccess(mintAmount);
      setMsg({
        type: "success",
        text: `Successfully credited ${mintAmount} Mock USDC to your demo address!`,
      });
      setTimeout(() => {
        onClose();
        setMsg(null);
      }, 1200);
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to mint mock USDC" });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl relative font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">UniPact Testnet Faucet</h3>
            <p className="text-xs text-slate-400">Mint Mock USDC for Hackathon Testing</p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Recipient Address:</label>
            <input
              type="text"
              readOnly
              value={userKeypair?.toSuiAddress() || "Not Connected"}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono truncate"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Mint Amount (USDC):</label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 300, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMintAmount(amt)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                    mintAmount === amt
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  +{amt} USDC
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                msg.type === "success"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/60 border border-red-500/40 text-red-300"
              }`}
            >
              {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleMint}
          disabled={isMinting}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isMinting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
          <span>[ MINT TESTNET USDC ]</span>
        </button>
      </div>
    </div>
  );
};
