"use client";

import { createContext, useContext, ReactNode } from "react";
import { Account } from "@/lib/types";

const SessionContext = createContext<Account | null>(null);

/**
 * Makes the signed-in account available to client components.
 *
 * The account itself is read from the session cookie on the server and handed
 * down, so the server and the browser always agree on who is signed in.
 */
export function SessionProvider({
  account,
  children,
}: {
  account: Account | null;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={account}>{children}</SessionContext.Provider>;
}

export function useSession(): Account | null {
  return useContext(SessionContext);
}

/**
 * For pages that sit behind a role guard, where the layout has already redirected
 * anyone without a session.
 */
export function useAccount(): Account {
  const account = useContext(SessionContext);
  if (!account) throw new Error("useAccount was called outside a signed-in area");
  return account;
}
