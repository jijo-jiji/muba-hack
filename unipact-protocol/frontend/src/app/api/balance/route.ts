import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { getCoinBalanceViaCli } from "@/lib/server/suiCli";
import { USDC_COIN_TYPE, isRealObjectId, isRealAddress, PACKAGE_ID } from "@/lib/suiClient";

/**
 * The testnet USDC balance for an address, read on the server via Sui CLI.
 *
 * Like the faucet (/api/faucet), this routes through the server because public
 * testnet fullnodes have disabled JSON-RPC for browser @mysten/sui clients.
 */
export async function GET(req: NextRequest) {
  const sessionAccount = readSession();
  const addressParam = req.nextUrl.searchParams.get("address");
  const targetAddress = addressParam || sessionAccount?.address;

  if (!targetAddress) {
    return NextResponse.json(
      { error: "No address specified and not signed in." },
      { status: 400 }
    );
  }

  if (!isRealAddress(targetAddress)) {
    return NextResponse.json(
      { error: "Invalid Sui address format." },
      { status: 400 }
    );
  }

  if (!isRealObjectId(PACKAGE_ID)) {
    return NextResponse.json(
      { error: "No token package is configured, so there is no balance to read." },
      { status: 503 }
    );
  }

  try {
    const balance = await getCoinBalanceViaCli(targetAddress, USDC_COIN_TYPE);
    return NextResponse.json({ balance, address: targetAddress });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetAddress = body.address || readSession()?.address;

    if (!targetAddress || !isRealAddress(targetAddress)) {
      return NextResponse.json(
        { error: "Invalid or missing recipient Sui address." },
        { status: 400 }
      );
    }

    if (!isRealObjectId(PACKAGE_ID)) {
      return NextResponse.json(
        { error: "No token package is configured, so there is no balance to read." },
        { status: 503 }
      );
    }

    const balance = await getCoinBalanceViaCli(targetAddress, USDC_COIN_TYPE);
    return NextResponse.json({ balance, address: targetAddress });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
