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
      let note = String(body.note ?? "Payment release completed.");

      // If no confirmed digest from client, execute directly on Sui Testnet
      if (!digest && job.audit) {
        const vaultId = job.escrowVaultId || process.env.NEXT_PUBLIC_ESCROW_VAULT_ID;
        if (vaultId) {
          try {
            const onchain = await executeReleaseMilestoneCall(
              vaultId,
              job.audit.gonkaRequestId,
              job.audit.truthScore
            );
            if (onchain.success) {
              digest = onchain.digest;
              explorerUrl = onchain.explorerUrl;
              note = `Confirmed on chain on Sui Testnet: ${onchain.digest.slice(0, 12)}…`;
            }
          } catch (chainErr) {
            console.warn("Server on-chain release execution note:", chainErr);
          }
        }
      }

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
