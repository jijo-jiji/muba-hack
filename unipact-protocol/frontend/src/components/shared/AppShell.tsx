"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Account } from "@/lib/types";
import { Avatar } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { AddressChip } from "@/components/ui/AddressChip";
import { FaucetWidget } from "@/components/shared/FaucetWidget";
import { GonkaConfigModal } from "@/components/shared/GonkaConfigModal";

/** The frame around every signed-in page: a header, the content, and the footer note. */
export function AppShell({
  account,
  children,
}: {
  account: Account;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const signOut = async () => {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const home = account.role === "company" ? "/company" : account.role === "student" ? "/student" : "/admin";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <Link href={home} className="text-card-title font-bold text-ink hover:text-accent transition-colors">
              TrustMesh
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-small">
              <Link href={home} className="text-ink-soft hover:text-ink transition-colors font-medium">
                Jobs & Escrow
              </Link>
              <Link
                href="/verify"
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent hover:bg-accent/20 transition-all font-medium"
              >
                <span>🔍</span>
                <span>AI Verifier</span>
              </Link>
            </nav>
            <GonkaConfigModal />
          </div>
          <div className="flex items-center gap-4">
            <FaucetWidget account={account} />
            <div className="hidden text-right sm:block">
              <p className="text-small font-medium text-ink">{account.name}</p>
              <p className="text-small text-ink-soft">
                {account.organisation ?? account.university ?? "Platform admin"}
              </p>
            </div>
            <Avatar name={account.name} />
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-6 py-6 text-small text-ink-soft">
          <p>
            Demo authentication. Production would verify the zkLogin JWT server-side.
          </p>
          <AddressChip label="Your address" value={account.address} />
        </div>
      </footer>
    </div>
  );
}
