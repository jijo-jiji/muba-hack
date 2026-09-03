"use client";

import { FormEvent, useState } from "react";
import { Job } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";

/** A student putting their name forward for an open job. */
export function ApplyForm({ job, onApplied }: { job: Job; onApplied: () => void }) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError(null);
    const message = String(new FormData(event.currentTarget).get("message") ?? "");

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      onApplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this job</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={submit} className="space-y-6">
          <Field
            label="Why you"
            htmlFor="message"
            hint="A few sentences on relevant work you have done."
          >
            <Textarea id="message" name="message" required />
          </Field>
          {error && <p className="text-small text-danger">{error}</p>}
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending…" : "Apply"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
