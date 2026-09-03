import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/shared/AppShell";

/** Only the platform account gets past this. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = readSession();
  if (!account) redirect("/login");
  if (account.role !== "admin") {
    redirect(account.role === "company" ? "/company" : "/student");
  }

  return <AppShell account={account}>{children}</AppShell>;
}
