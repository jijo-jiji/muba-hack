import { NextRequest, NextResponse } from "next/server";
import { verifyClaimOrUrl } from "@/lib/gonkaEvaluator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = String(body.input ?? "").trim();
    if (!input) {
      return NextResponse.json({ error: "Input URL, tweet, or text snippet is required." }, { status: 400 });
    }

    const context = body.context ? String(body.context).trim() : undefined;
    const keyFromHeader = req.headers.get("x-gonka-api-key") || undefined;
    const apiKey = body.apiKey || keyFromHeader;

    const result = await verifyClaimOrUrl({
      input,
      context,
      customApiKey: apiKey,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Verification failed: ${msg}` }, { status: 500 });
  }
}
