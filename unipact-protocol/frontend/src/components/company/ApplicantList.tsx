"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/PageHeader";

/** The students who applied, and the company's choice between them. */
export function ApplicantList({
  job,
  canAccept,
  onAccepted,
}: {
  job: Job;
  canAccept: boolean;
  onAccepted: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accept = async (studentId: string) => {
    setBusyId(studentId);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", studentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Applications ({job.applications.length})
        </CardTitle>
      </CardHeader>
      <CardBody>
        {job.applications.length === 0 ? (
          <p className="text-body text-ink-soft">
            No one has applied yet. Students see this job on their dashboard as soon as it is posted.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {job.applications.map((application) => (
              <li key={application.studentId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <Avatar name={application.studentName} />
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-ink">{application.studentName}</p>
                  <p className="text-small text-ink-soft">{application.university}</p>
                  {application.message && (
                    <p className="mt-2 text-body text-ink-soft">{application.message}</p>
                  )}
                </div>
                {canAccept && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId !== null}
                    onClick={() => accept(application.studentId)}
                  >
                    {busyId === application.studentId ? "Accepting…" : "Accept"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-4 text-small text-danger">{error}</p>}
      </CardBody>
    </Card>
  );
}
