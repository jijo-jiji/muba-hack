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
import { executeReleaseMilestoneCall } from "@/lib/server/suiCli";
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
    case "release": {
      let digest = typeof body.digest === "string" && body.digest ? body.digest : undefined;
      let explorerUrl = typeof body.explorerUrl === "string" && body.explorerUrl ? body.explorerUrl : undefined;
      let note = digest ? String(body.note ?? "Confirmed on chain.") : "";

      // The browser cannot reach Sui directly (public fullnodes dropped JSON-RPC),
      // so when it comes back without a digest we run the release here instead.
      if (!digest && job.audit) {
        const vaultId = job.escrowVaultId || process.env.NEXT_PUBLIC_ESCROW_VAULT_ID;
        if (!vaultId) {
          note = "No escrow vault is configured for this job, so nothing was submitted on chain.";
        } else {
          try {
            const onchain = await executeReleaseMilestoneCall(
              vaultId,
              job.audit.gonkaRequestId,
              job.audit.truthScore
            );
            if (onchain.success) {
              digest = onchain.digest;
              explorerUrl = onchain.explorerUrl;
              note = `Confirmed on chain in transaction ${onchain.digest}.`;
            } else {
              note = "Sui accepted the transaction but reported it as failed.";
            }
          } catch (chainErr) {
            // Never let a failed release read as a completed one.
            const reason = chainErr instanceof Error ? chainErr.message : String(chainErr);
            console.warn("On-chain release failed:", reason);
            note = `Not submitted on chain: ${reason}`;
          }
        }
      }

      if (!note) note = "No on-chain transaction was submitted.";

      result = recordRelease(account, job, {
        digest,
        explorerUrl,
        note,
      });
      break;
    }
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
