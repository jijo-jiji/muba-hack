import { NextRequest, NextResponse } from "next/server";
import { auditMilestoneDeliverable } from "@/lib/gonkaEvaluator";
import { readSession } from "@/lib/auth/session";
import { canTriggerAudit } from "@/lib/auth/permissions";
import { getJob, updateJob } from "@/lib/server/jobStore";

/**
 * Runs the AI review of a submission and stores the result on the job.
 *
 * Only the student who was given the job (or an admin) can start it, and only
 * once work has actually been submitted. The company cannot start it, so it
 * cannot quietly re-run the review until it gets an answer it prefers.
 */
export async function POST(req: NextRequest) {
  const account = readSession();
  if (!account) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { jobId, preset } = await req.json();
  const job = getJob(String(jobId ?? ""));
  if (!job) return NextResponse.json({ error: "No such job" }, { status: 404 });

  if (!canTriggerAudit(account, job)) {
    return NextResponse.json({ error: "You cannot start the review for this job" }, { status: 403 });
  }
  if (!job.deliverable) {
    return NextResponse.json({ error: "Nothing has been submitted yet" }, { status: 400 });
  }

  // The brief is what the company asked for; the submission is what came back.
  const brief = `${job.title}\n\n${job.description}`;
  const submission = `${job.deliverable.summary}\n\nLink: ${job.deliverable.link || "(none provided)"}`;

  try {
    const audit = await auditMilestoneDeliverable(brief, submission, preset);
    const saved = updateJob(job.id, (current) => ({ ...current, status: "audited", audit }));
    return NextResponse.json({ audit, job: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `The review could not be completed: ${message}` }, { status: 500 });
  }
}
