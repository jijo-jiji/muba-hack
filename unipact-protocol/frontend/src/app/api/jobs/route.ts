import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { canBrowseJobs, canPostJob, canViewJob } from "@/lib/auth/permissions";
import { addJob, listJobs } from "@/lib/server/jobStore";
import { ClientAsset, Job, ProjectScope } from "@/lib/types";

/**
 * The jobs this account is allowed to see. A company sees its own jobs, a student
 * sees open jobs plus whatever they were assigned, an admin sees everything.
 */
export async function GET() {
  const account = readSession();
  if (!account) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const visible = listJobs().filter((job) => canViewJob(account, job));
  return NextResponse.json({ jobs: visible, canBrowse: canBrowseJobs(account) });
}

/** Posts a job and locks its budget into escrow. Companies only. */
export async function POST(req: NextRequest) {
  const account = readSession();
  if (!canPostJob(account) || !account) {
    return NextResponse.json({ error: "Only companies can post jobs" }, { status: 403 });
  }

  const body = await req.json();
  const budgetUsdc = Number(body.budgetUsdc);
  if (!body.title || !body.description || !Number.isFinite(budgetUsdc) || budgetUsdc <= 0) {
    return NextResponse.json({ error: "Title, description and a positive budget are required" }, { status: 400 });
  }

  const assets: ClientAsset[] = Array.isArray(body.clientAssets)
    ? body.clientAssets.slice(0, 10).map((asset: { name?: string; type?: string; sizeMb?: number }, i: number) => ({
        id: `asset-${Date.now()}-${i}`,
        name: String(asset.name ?? "Untitled file"),
        type: (asset.type as ClientAsset["type"]) ?? "document",
        sizeMb: Number(asset.sizeMb) || 0,
        uploadedAt: Date.now(),
      }))
    : [];

  const job: Job = {
    id: `job-${Date.now().toString(36)}`,
    title: String(body.title).slice(0, 120),
    description: String(body.description).slice(0, 4000),
    scope: (body.scope as ProjectScope) ?? "software_development",
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 8).map(String) : [],
    budgetUsdc,
    companyId: account.id,
    companyName: account.organisation ?? account.name,
    // Funding is recorded here. Whether real USDC moved is a separate question,
    // answered honestly on the job page.
    escrowStatus: "locked",
    status: "open",
    applications: [],
    clientAssets: assets,
    createdAt: Date.now(),
  };

  addJob(job);
  return NextResponse.json({ job }, { status: 201 });
}
