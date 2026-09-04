import { NextRequest, NextResponse } from "next/server";
import { executeFaucetCall } from "@/lib/server/suiCli";
import { isRealObjectId } from "@/lib/suiClient";

export async function POST(req: NextRequest) {
  try {
    const { recipientAddress, amount = 500 } = await req.json();

    if (!recipientAddress || !isRealObjectId(recipientAddress)) {
      return NextResponse.json(
        { error: "Invalid or missing recipient Sui address." },
        { status: 400 }
      );
    }

    const result = await executeFaucetCall(recipientAddress, amount);

    return NextResponse.json({
      success: true,
      amount,
      digest: result.digest,
      explorerUrl: result.explorerUrl,
      recipient: recipientAddress,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Faucet error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
