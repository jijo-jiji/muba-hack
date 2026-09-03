"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Starts the AI review of a submission.
 *
 * The request goes to our own /api/audit-milestone route, which calls Gonka
 * Router from the server so the API key never reaches the browser. Two reviews
 * run in parallel and are combined into one score out of 100.
 *
 * The two preset buttons exist so the demo can show both outcomes on stage even
 * with no network. Anything they produce is labelled as demo data in the report.
 */
export function RunReview({ job, onReviewed }: { job: Job; onReviewed: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (preset?: "VALID" | "INCOMPLETE") => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/audit-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, preset }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      onReviewed();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get your work reviewed</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <p className="text-body text-ink-soft">
          An independent review compares what you submitted against what the company asked for and
          scores it out of 100. At 80 or above the company can release the payment.
        </p>

        {error && <p className="text-small text-danger">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => run()} disabled={isRunning}>
            {isRunning ? "Reviewing…" : "Run the review"}
          </Button>
          <Button variant="secondary" onClick={() => run("VALID")} disabled={isRunning}>
            Demo: passing result
          </Button>
          <Button variant="secondary" onClick={() => run("INCOMPLETE")} disabled={isRunning}>
            Demo: failing result
          </Button>
        </div>

        <p className="text-small text-ink-faint">
          The two demo buttons return canned results and are labelled as such in the report.
        </p>
      </CardBody>
    </Card>
  );
}
