"use client";

import { useEffect, useState } from "react";
import { Account } from "@/lib/types";
import { getMockUsdcBalance, explorerUrlForDigest } from "@/lib/suiClient";
import { Button } from "@/components/ui/Button";

export function FaucetWidget({ account }: { account: Account }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastDigest, setLastDigest] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      const b = await getMockUsdcBalance(account.address);
      setBalance(b);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [account.address]);

  const requestFaucet = async () => {
    setLoading(true);
    setLastDigest(null);
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientAddress: account.address, amount: 500 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Faucet request failed");
      if (data.digest) setLastDigest(data.digest);
      await fetchBalance();
    } catch (err) {
      console.warn("Faucet request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink flex items-center gap-1.5">
        <span className="text-ink-soft">Testnet USDC:</span>
        <span className="font-semibold text-ink">
          {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "…"}
        </span>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={requestFaucet}
        disabled={loading}
        title="Mint 500 Testnet Mock USDC on Sui"
      >
        {loading ? "Minting…" : "+500 USDC"}
      </Button>

      {lastDigest && (
        <a
          href={explorerUrlForDigest(lastDigest)}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary underline hidden md:inline"
        >
          View Tx
        </a>
      )}
    </div>
  );
}
