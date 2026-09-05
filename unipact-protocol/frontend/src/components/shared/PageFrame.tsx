import Link from "next/link";
import { ReactNode } from "react";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shared/AppShell";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Wraps a page that anyone can open, signed in or not.
 *
 * Signed in, it keeps the normal app header so the page feels like part of the
 * app and you can navigate away without being dumped on the marketing page.
 * Signed out, it gets a plain public header instead.
 */
export function PageFrame({ children }: { children: ReactNode }) {
  const account = readSession();

  if (account) {
    return <AppShell account={account}>{children}</AppShell>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <Link href="/" className="text-card-title font-semibold text-ink">
            TrustMesh
          </Link>
          <ButtonLink href="/login" size="sm">
            Sign in
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-content px-6 py-6 text-small text-ink-soft">
          Demo authentication. Production would verify the zkLogin JWT server-side.
        </div>
      </footer>
    </div>
  );
}
