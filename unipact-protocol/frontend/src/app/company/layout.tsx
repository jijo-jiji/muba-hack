import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shared/AppShell";

/**
 * The guard for everything under /company. It runs on the server before any
 * company page renders, so a student who types /company into the address bar is
 * redirected rather than shown a page with hidden buttons.
 */
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const account = readSession();
  if (!account) redirect("/login");
  if (account.role !== "company") redirect(account.role === "student" ? "/student" : "/login");

  return <AppShell account={account}>{children}</AppShell>;
}
