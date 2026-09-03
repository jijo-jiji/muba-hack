"use client";

import { FormEvent, useState } from "react";
import { Job } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

/**
 * Handing the finished work in. The summary written here is what the AI review
 * compares against the company's brief, so it is worth being specific.
 */
export function SubmitWorkForm({ job, onSubmitted }: { job: Job; onSubmitted: () => void }) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          link: form.get("link"),
          summary: form.get("summary"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSending(false);
    }
  };

  const isResubmission = job.status === "audited";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isResubmission ? "Submit revised work" : "Submit your work"}</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} className="space-y-6">
          <Field
            label="What you delivered"
            htmlFor="summary"
            hint="List what you built against each thing the company asked for."
          >
            <Textarea id="summary" name="summary" required defaultValue={job.deliverable?.summary ?? ""} />
          </Field>

          <Field label="Link" htmlFor="link" hint="A repository, a pull request, a deployed site, or a folder of files.">
            <Input id="link" name="link" type="url" defaultValue={job.deliverable?.link ?? ""} placeholder="https://" />
          </Field>

          {error && <p className="text-small text-danger">{error}</p>}

          <Button type="submit" disabled={isSending}>
            {isSending ? "Submitting…" : "Submit"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
