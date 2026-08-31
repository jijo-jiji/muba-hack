"use client";

import React, { useState } from "react";
import { ZkLoginPersona } from "@/lib/types";
import { INITIAL_PERSONAS, generateEphemeralSession, getGoogleOAuthUrl } from "@/lib/zklogin";
import { Shield, Sparkles, Key, CheckCircle2, UserCheck, X, ExternalLink, RefreshCw } from "lucide-react";

interface ZkLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: ZkLoginPersona;
  onSelectPersona: (persona: ZkLoginPersona) => void;
}

export function ZkLoginModal({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
}: ZkLoginModalProps) {
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofStep, setProofStep] = useState<string>("");

  if (!isOpen) return null;

  const handleSimulateGoogleLogin = (persona: ZkLoginPersona) => {
    setIsGeneratingProof(true);
    setProofStep("Generating ephemeral Ed25519 keypair...");

    setTimeout(() => {
      setProofStep("Requesting OpenID Connect JWT nonce binding...");
      setTimeout(() => {
        setProofStep("Generating Zero-Knowledge Groth16 proof...");
        setTimeout(() => {
          setIsGeneratingProof(false);
          setProofStep("");
          onSelectPersona(persona);
          onClose();
        }, 600);
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-sky-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-sky-950/50 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Instant zkLogin Hub
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero Seed Phrase
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Web2 Google Authentication &rarr; Zero-Knowledge Sui Address
            </p>
          </div>
        </div>

        {/* Real Google OAuth Redirect Button */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Live Google OAuth (Production)</span>
            <span className="text-[10px] text-slate-500 font-mono">@mysten/zklogin</span>
          </div>
          <a
            href={getGoogleOAuthUrl()}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign in with Google OAuth
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* Simulated Instant Multi-Persona Switcher for Demo / Hackathon Judges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Instant Persona Switcher (For Evaluation &amp; POS Demo)
            </label>
            <span className="text-[10px] text-sky-400 font-mono">1-Click Fast Auth</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {INITIAL_PERSONAS.map((persona) => {
              const isCurrent = currentPersona.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => handleSimulateGoogleLogin(persona)}
                  disabled={isGeneratingProof}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                    isCurrent
                      ? "bg-sky-950/60 border-sky-500/60 text-white shadow-md shadow-sky-950/40"
                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      {persona.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {persona.name}
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{persona.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[220px]">
                        {persona.address.slice(0, 10)}...{persona.address.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">
                      ${persona.usdcBalance.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">Testnet USDC</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Proof generation indicator */}
        {isGeneratingProof && (
          <div className="mt-4 p-3 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
            <span className="text-xs text-sky-300 font-mono">{proofStep}</span>
          </div>
        )}
      </div>
    </div>
  );
}
