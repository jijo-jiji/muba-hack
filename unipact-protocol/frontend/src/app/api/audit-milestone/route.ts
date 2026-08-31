import { NextRequest, NextResponse } from "next/server";
import { auditMilestoneDeliverable } from "@/lib/gonkaEvaluator";

export async function POST(req: NextRequest) {
  try {
    const { spec, submission, preset } = await req.json();
    if (!spec || !submission) {
      return NextResponse.json({ error: "Missing spec or submission content" }, { status: 400 });
    }
    const result = await auditMilestoneDeliverable(spec, submission, preset);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Audit API error:", err);
    return NextResponse.json({ error: err.message || "Audit failed" }, { status: 500 });
  }
}
