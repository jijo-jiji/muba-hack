import { NextRequest, NextResponse } from "next/server";
import { testGonkaConnection } from "@/lib/gonkaEvaluator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const keyFromHeader = req.headers.get("x-gonka-api-key") || undefined;
    const apiKey = body.apiKey || keyFromHeader;
    const result = await testGonkaConnection(apiKey);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: msg, latencyMs: 0 }, { status: 500 });
  }
}
