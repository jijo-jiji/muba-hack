import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { canViewAssets, canViewJob } from "@/lib/auth/permissions";
import { getJob, updateJob } from "@/lib/server/jobStore";
import {
  acceptApplicant,
  applyToJob,
  isFailure,
  recordRelease,
  submitDeliverable,
} from "@/lib/server/jobActions";
import { Account, Job } from "@/lib/types";

interface RouteContext {
  params: { jobId: string };
}

/**
 * A student who is not on this job must not learn what is in the client files,
 * so we strip them rather than relying on the page not to render them.
 */
function forViewer(job: Job, account: Account): Job {
  return canViewAssets(account, job) ? job : { ...job, clientAssets: [] };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const account = readSession();
  if (!account) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const job = getJob(params.jobId);
  if (!job) return NextResponse.json({ error: "No such job" }, { status: 404 });
  if (!canViewJob(account, job)) {
    return NextResponse.json({ error: "This job is not yours" }, { status: 403 });
  }

  return NextResponse.json({ job: forViewer(job, account) });
}

/**
 * All the ways a job can move forward. Each action re-checks permissions on the
 * server; the UI hiding a button is never the only thing preventing an action.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const account = readSession();
  if (!account) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const job = getJob(params.jobId);
  if (!job) return NextResponse.json({ error: "No such job" }, { status: 404 });

  const body = await req.json();

  let result;
  switch (body.action) {
    case "apply":
      result = applyToJob(account, job, String(body.message ?? ""));
      break;
    case "accept":
      result = acceptApplicant(account, job, String(body.studentId ?? ""));
      break;
    case "submit":
      result = submitDeliverable(account, job, String(body.link ?? ""), String(body.summary ?? ""));
      break;
    case "release":
      result = recordRelease(account, job, {
        digest: typeof body.digest === "string" ? body.digest : undefined,
        explorerUrl: typeof body.explorerUrl === "string" ? body.explorerUrl : undefined,
        note: String(body.note ?? "No detail recorded."),
      });
      break;
    default:
      return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
  }

  if (isFailure(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const saved = updateJob(job.id, () => result.job);
  if (!saved) return NextResponse.json({ error: "No such job" }, { status: 404 });
  return NextResponse.json({ job: forViewer(saved, account) });
}
