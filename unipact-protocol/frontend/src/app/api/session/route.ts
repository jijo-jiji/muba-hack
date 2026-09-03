import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { findAccount } from "@/lib/zklogin";

/** Signs in as one of the seeded demo accounts. */
export async function POST(req: NextRequest) {
  const { accountId } = await req.json();
  const account = findAccount(accountId);
  if (!account) {
    return NextResponse.json({ error: "Unknown account" }, { status: 400 });
  }

  const response = NextResponse.json({ account });
  response.cookies.set(SESSION_COOKIE, account.id, {
    httpOnly: false, // the browser reads this too, and it holds nothing secret
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

/** Signs out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
