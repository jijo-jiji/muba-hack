import { cookies } from "next/headers";
import { Account, UserRole } from "@/lib/types";
import { findAccount } from "@/lib/zklogin";

export const SESSION_COOKIE = "trustmesh_session";

/**
 * The session is just the id of the demo account that signed in. Route guards on
 * the server read this cookie; the browser gets the same account through
 * SessionProvider. There is no token to verify because there is no real backend
 * auth here, and the footer says so.
 */
export function readSession(): Account | null {
  const accountId = cookies().get(SESSION_COOKIE)?.value;
  if (!accountId) return null;
  return findAccount(accountId) ?? null;
}

/** The signed-in account, or null when the role does not match what a page requires. */
export function readSessionWithRole(role: UserRole): Account | null {
  const account = readSession();
  return account && account.role === role ? account : null;
}
