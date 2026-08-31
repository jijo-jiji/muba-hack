"use client";

import React, { useState, useEffect, useRef } from "react";
import { MerchantQRPayload } from "@/lib/types";
import {
  Camera,
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (payload: MerchantQRPayload) => void;
  isExecuting: boolean;
}

export function QRScannerModal({
  isOpen,
  onClose,
  onConfirmPayment,
  isExecuting,
}: QRScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [scannedPayload, setScannedPayload] = useState<MerchantQRPayload | null>(null);
  const [manualText, setManualText] = useState("");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const html5QrCodeRef = useRef<any>(null);

  // Pre-fill demo QR payloads for quick 1-click test in desktop browsers
  const DEMO_QR_PRESETS: MerchantQRPayload[] = [
    {
      type: "merchant_pos",
      version: "1.0",
      merchantAddress: "0x4444444444444444444444444444444444444444444444444444444444444444",
      merchantName: "Dave's Campus Cafe (POS)",
      title: "Table #07 Supper - Mamak Bistro",
      amount: 20.5,
      clubDues: 0.5,
      category: "Dining",
      expiresAt: Date.now() + 3600 * 1000,
    },
    {
      type: "merchant_pos",
      version: "1.0",
      merchantAddress: "0x7777777777777777777777777777777777777777777777777777777777777777",
      merchantName: "Blockchain Club Treasury",
      title: "APU Tech Fest 2026 Ticket Pass",
      amount: 25.0,
      clubDues: 1.0,
      category: "Club Event",
      expiresAt: Date.now() + 3600 * 1000,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedPayload(null);
      setScannerError(null);
      return;
    }

    if (activeTab === "camera") {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    try {
      setScannerError(null);
      setIsScanningActive(true);
      const { Html5Qrcode } = await import("html5-qrcode");
      
      const scannerId = "qr-reader-target";
      const qrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        (errorMessage) => {
          // Frame error (normal when QR not in frame)
        }
      );
    } catch (err: any) {
      console.warn("Camera init failed, fallback available:", err);
      setScannerError(
        "Camera stream unavailable (permissions or no webcam). You can use the Quick Test Payloads or paste JSON."
      );
      setIsScanningActive(false);
    }
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        }).catch(() => {});
      } catch (e) {}
    }
    setIsScanningActive(false);
  };

  const handleSuccessfulScan = (text: string) => {
    try {
      const parsed = JSON.parse(text) as MerchantQRPayload;
      if (parsed.merchantAddress && parsed.amount) {
        setScannedPayload(parsed);
        stopCamera();
      } else {
        throw new Error("Invalid payload format");
      }
    } catch (e) {
      setScannerError("Scanned text is not a valid Sui POS payload.");
    }
  };

  const handleManualParse = () => {
    try {
      const parsed = JSON.parse(manualText) as MerchantQRPayload;
      setScannedPayload(parsed);
      setScannerError(null);
    } catch (e) {
      setScannerError("Invalid JSON string. Please check format.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-sky-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-sky-950/50 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Mobile POS QR Scanner
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Auto PTB Pre-fill
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Scan table tabs, club dues, or merchant QR codes
            </p>
          </div>
        </div>

        {/* View Selection Tabs */}
        {!scannedPayload && (
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 mb-4">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center justify-center gap-1.5 ${
                activeTab === "camera"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
            <button
              onClick={() => {
                stopCamera();
                setActiveTab("manual");
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center justify-center gap-1.5 ${
                activeTab === "manual"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Quick Presets / Paste
            </button>
          </div>
        )}

        {/* Scanner Body */}
        {!scannedPayload ? (
          <div className="space-y-4">
            {activeTab === "camera" ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] p-2">
                <div id="qr-reader-target" className="w-full max-w-[280px]" />
                {scannerError && (
                  <div className="p-3 text-xs text-amber-300 font-mono text-center flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{scannerError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1-Click Quick Presets for Demo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 font-mono">
                    Instant Demo QR Codes (Click to load):
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {DEMO_QR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setScannedPayload(preset)}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{preset.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {preset.merchantName} &bull; {preset.category}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          ${preset.amount.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paste JSON */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1 block font-mono">
                    Or Paste Payload JSON:
                  </label>
                  <textarea
                    rows={3}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder='{"merchantAddress":"0x...","amount":20.50,"title":"Table #07"}'
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleManualParse}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-white transition"
                  >
                    Parse Payload
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Scanned Payload Confirmation View */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                <span className="text-xs font-bold text-sky-300 font-mono uppercase tracking-wider">
                  Pre-filled Sponsored PTB
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Verified QR
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">{scannedPayload.title}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Recipient: <span className="text-slate-300">{scannedPayload.merchantName}</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  Address: {scannedPayload.merchantAddress}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Merchant Amount:</span>
                  <span className="font-bold text-white">
                    ${(scannedPayload.amount - (scannedPayload.clubDues || 0)).toFixed(2)} USDC
                  </span>
                </div>
                {scannedPayload.clubDues > 0 && (
                  <div className="flex justify-between text-purple-300">
                    <span>Club / Platform Dues:</span>
                    <span className="font-bold">${scannedPayload.clubDues.toFixed(2)} USDC</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-white">Total Owed:</span>
                  <span className="text-emerald-400">${scannedPayload.amount.toFixed(2)} USDC</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Gas Sponsored by Relayer &bull; 0 SUI Gas Fees</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setScannedPayload(null)}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition"
              >
                Rescan
              </button>

              <button
                onClick={() => onConfirmPayment(scannedPayload)}
                disabled={isExecuting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Broadcasting Dual-Signed PTB...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    Authorize &amp; Pay ${scannedPayload.amount.toFixed(2)} USDC
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
