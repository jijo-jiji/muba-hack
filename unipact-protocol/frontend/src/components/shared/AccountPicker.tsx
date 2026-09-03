"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Account } from "@/lib/types";
import { Avatar } from "@/components/ui/PageHeader";
import { truncateMiddle } from "@/components/ui/AddressChip";

const DASHBOARD: Record<Account["role"], string> = {
  company: "/company",
  student: "/student",
  admin: "/admin",
};

/** One group of demo accounts on the sign-in page. */
export function AccountPicker({ heading, accounts }: { heading: string; accounts: Account[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (account: Account) => {
    setBusyId(account.id);
    setError(null);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id }),
      });
      if (!response.ok) throw new Error("Sign in failed");
      router.push(DASHBOARD[account.role]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusyId(null);
    }
  };

  if (accounts.length === 0) return null;

  return (
    <section>
      <h2 className="text-small font-medium uppercase tracking-wide text-ink-faint">{heading}</h2>
      <ul className="mt-3 space-y-2">
        {accounts.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              onClick={() => signIn(account)}
              disabled={busyId !== null}
              className="flex w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong disabled:opacity-60"
            >
              <Avatar name={account.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-medium text-ink">{account.name}</span>
                <span className="block truncate text-small text-ink-soft">
                  {account.email}
                  {account.organisation ? ` · ${account.organisation}` : ""}
                  {account.university ? ` · ${account.university}` : ""}
                </span>
              </span>
              <span className="hidden font-mono text-small text-ink-faint sm:block">
                {truncateMiddle(account.address)}
              </span>
              <span className="text-small text-ink-soft">
                {busyId === account.id ? "Signing in…" : "Sign in with Google"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-small text-danger">{error}</p>}
    </section>
  );
}
