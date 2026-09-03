import Link from "next/link";
import { accountsByRole } from "@/lib/zklogin";
import { AccountPicker } from "@/components/shared/AccountPicker";

export const metadata = { title: "Sign in | TrustMesh" };

/**
 * The demo sign-in page. The product uses zkLogin, so signing in is presented as
 * a Google sign-in, but there is no OAuth round trip here: picking an account
 * sets a cookie. The note at the bottom says so.
 */
export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <Link href="/" className="text-card-title font-semibold text-ink">
        TrustMesh
      </Link>

      <h1 className="mt-10 text-page-title font-semibold">Sign in</h1>
      <p className="mt-2 text-body text-ink-soft">
        Choose an account to continue. Companies post and pay for work; students do it.
      </p>

      <div className="mt-8 space-y-8">
        <AccountPicker heading="Companies" accounts={accountsByRole("company")} />
        <AccountPicker heading="Students" accounts={accountsByRole("student")} />
        <AccountPicker heading="Platform" accounts={accountsByRole("admin")} />
      </div>

      <p className="mt-10 border-t border-line pt-6 text-small text-ink-soft">
        Demo authentication. Production would verify the zkLogin JWT server-side. Wallet addresses
        below are derived from a fixed seed so they stay the same every time you sign in.
      </p>
    </div>
  );
}
