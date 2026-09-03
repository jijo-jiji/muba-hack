import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shared/AppShell";

/** The mirror of the company guard: only students get past this. */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const account = readSession();
  if (!account) redirect("/login");
  if (account.role !== "student") redirect(account.role === "company" ? "/company" : "/login");

  return <AppShell account={account}>{children}</AppShell>;
}
