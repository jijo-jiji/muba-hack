"use client";

import { useEffect, useState } from "react";
import { Account } from "@/lib/types";
import { getMockUsdcBalance, explorerUrlForDigest } from "@/lib/suiClient";
import { Button } from "@/components/ui/Button";

export function FaucetWidget({ account }: { account: Account }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastDigest, setLastDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      <p className="hidden text-small text-ink-soft sm:block">
        <span className="text-ink-faint">USDC</span>{" "}
        <span className="font-mono text-ink">
          {balance !== null
            ? balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "—"}
        </span>
      </p>

      <Button
        variant="secondary"
        size="sm"
        onClick={requestFaucet}
        disabled={loading}
        title="Add 500 testnet USDC to your wallet"
      >
        {loading ? "Adding…" : "Add 500"}
      </Button>

      {lastDigest && (
        <a
          href={explorerUrlForDigest(lastDigest)}
          target="_blank"
          rel="noreferrer"
          className="hidden text-small text-accent hover:underline md:inline"
        >
          View
        </a>
      )}

      {/* The old widget logged failures to the console only, so a click that did
          nothing looked like a click that worked. */}
      {error && (
        <p className="absolute right-0 top-full z-10 mt-2 max-w-xs rounded border border-danger/30 bg-surface px-3 py-2 text-small text-danger shadow-subtle">
          {error}
        </p>
      )}
    </div>
  );
}
