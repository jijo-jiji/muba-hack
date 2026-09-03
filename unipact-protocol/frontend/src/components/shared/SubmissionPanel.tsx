import { Job } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

/** What the student sent in. Read-only; both sides see the same thing. */
export function SubmissionPanel({ job }: { job: Job }) {
  if (!job.deliverable) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted work</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="whitespace-pre-wrap text-body text-ink">{job.deliverable.summary}</p>
        {job.deliverable.link && (
          <a
            href={job.deliverable.link}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-small text-accent hover:underline"
          >
            {job.deliverable.link}
          </a>
        )}
        <p className="border-t border-line pt-4 text-small text-ink-faint">
          Submitted {new Date(job.deliverable.submittedAt).toLocaleString()} by {job.assignedStudentName}
        </p>
      </CardBody>
    </Card>
  );
}
