"use client";

import { useSession } from "@/components/shared/SessionProvider";
import { BackLink } from "@/components/ui/BackLink";

const HOME = {
  company: { href: "/company", label: "Your jobs" },
  student: { href: "/student", label: "Your dashboard" },
  admin: { href: "/admin", label: "Platform" },
} as const;

/**
 * Back out of a page that both signed-in and signed-out people can reach.
 *
 * Signed in it returns you to your own dashboard, not to the marketing page,
 * which is what used to happen and made it look like you had been signed out.
 */
export function BackToDashboard() {
  const account = useSession();
  const target = account ? HOME[account.role] : { href: "/", label: "TrustMesh" };
  return <BackLink href={target.href}>{target.label}</BackLink>;
}
