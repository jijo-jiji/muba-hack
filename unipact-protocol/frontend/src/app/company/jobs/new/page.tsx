"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

/**
 * Posting a job and funding it are the same action: there is no such thing here
 * as an unfunded job, which is what makes the promise to the student credible.
 */
export default function NewJobPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          scope: form.get("scope"),
          budgetUsdc: Number(form.get("budgetUsdc")),
          tags,
          clientAssets: buildAssetList(String(form.get("assets") ?? "")),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      router.push(`/company/jobs/${data.job.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Post a job"
        description="The budget is locked when you post. It is released only after the work has been checked."
      />

      <form onSubmit={submit}>
        <Card>
          <CardBody className="space-y-6">
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" required maxLength={120} placeholder="Employee leave request portal" />
            </Field>

            <Field
              label="What you need"
              htmlFor="description"
              hint="Be specific. This is what the AI review compares the finished work against."
            >
              <Textarea
                id="description"
                name="description"
                required
                placeholder="A web portal where staff request leave and managers approve it…"
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Kind of work" htmlFor="scope">
                <Select id="scope" name="scope" defaultValue="software_development">
                  <option value="software_development">Software development</option>
                  <option value="digital_marketing">Digital marketing</option>
                </Select>
              </Field>

              <Field label="Budget in USDC" htmlFor="budgetUsdc" hint="Held in escrow until the work passes.">
                <Input id="budgetUsdc" name="budgetUsdc" type="number" min="1" step="1" defaultValue={300} required />
              </Field>
            </div>

            <Field label="Skills or platforms" htmlFor="tags" hint="Comma separated.">
              <Input id="tags" name="tags" placeholder="Next.js, TypeScript, PostgreSQL" />
            </Field>

            <Field
              label="Files you will share"
              htmlFor="assets"
              hint="One file name per line. This demo records the names only, not the file contents."
            >
              <Textarea id="assets" name="assets" placeholder={"Requirements.pdf\nBrand_assets.zip"} />
            </Field>

            {error && <p className="text-small text-danger">{error}</p>}
          </CardBody>

          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Posting…" : "Post and fund"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

/** Turns the textarea of file names into asset records. */
function buildAssetList(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((name) => ({ name, type: guessType(name), sizeMb: 0 }));
}

function guessType(name: string): "brief" | "document" | "brand_asset" | "raw_video" {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".mov")) return "raw_video";
  if (lower.endsWith(".zip") || lower.includes("brand")) return "brand_asset";
  if (lower.includes("brief") || lower.includes("requirement")) return "brief";
  return "document";
}
