"use client";

import { useState } from "react";
import { ClaimVerificationResult } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VerificationReport } from "@/components/shared/VerificationReport";
import { BackToDashboard } from "@/components/shared/BackToDashboard";

const SAMPLES = [
  {
    title: "A claim about this project",
    input:
      "TrustMesh holds a company's budget in escrow on Sui and pays the student and the platform from a single transaction once the work passes review.",
    context:
      "The escrow contract published at 0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8 on Sui testnet.",
  },
  {
    title: "A link to submitted work",
    input: "https://github.com/boblee/sui-pay-mobile-app",
    context:
      "The brief asked for a mobile web app with Google sign-in and passing unit tests.",
  },
  {
    title: "A post about a launch",
    input:
      "We shipped independent AI review of freelance work, using two separate models so neither one decides on its own.",
    context: "Gonka Router, which routes each request to more than one model.",
  },
  {
    title: "Unfinished work",
    input: "TODO: connect the wallet here later. Payment data is mocked with a dummy address.",
    context: "The brief asked for working contracts and no placeholders.",
  },
];

export default function VerifyPage() {
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<ClaimVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (claimToVerify?: string, contextToUse?: string) => {
    const text = claimToVerify !== undefined ? claimToVerify : input;
    if (!text.trim()) {
      setError("Paste a link or some text to check.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const apiKey =
        typeof window !== "undefined" ? localStorage.getItem("trustmesh_gonka_api_key") : undefined;
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: text,
          context: contextToUse !== undefined ? contextToUse : context,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const loadPreset = (preset: (typeof SAMPLES)[0]) => {
    setInput(preset.input);
    setContext(preset.context);
    handleVerify(preset.input, preset.context);
  };

  return (
    <div className="space-y-8">
      <BackToDashboard />

      <div className="max-w-3xl space-y-8">
        <PageHeader
          title="Check a claim"
          description="Paste a link or a piece of text and two independent models will judge it against a reference. This is the same review that decides whether a job's escrow pays out."
        />

        <div>
          <SectionLabel>Try one of these</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => loadPreset(sample)}
                disabled={isVerifying}
                className="rounded border border-line bg-surface px-3 py-1.5 text-small text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardBody className="space-y-6">
            <Field
              label="Link or text to check"
              htmlFor="claim-input"
              hint="A repository link, an article, a post, or a statement about finished work."
            >
              <Textarea
                id="claim-input"
                rows={3}
                placeholder="https://github.com/... or a sentence describing what was delivered"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </Field>

            <Field
              label="Check it against (optional)"
              htmlFor="context-input"
              hint="The brief, the requirement, or the source it should match."
            >
              <Textarea
                id="context-input"
                rows={2}
                placeholder="What this should be measured against"
                value={context}
                onChange={(event) => setContext(event.target.value)}
              />
            </Field>

            {error && <p className="text-small text-danger">{error}</p>}
          </CardBody>

          <CardFooter className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-small text-ink-soft">
              Reviewed by <span className="font-mono text-ink">Kimi-K2.6</span> and{" "}
              <span className="font-mono text-ink">DeepSeek-V4</span>
            </p>
            <Button onClick={() => handleVerify()} disabled={isVerifying}>
              {isVerifying ? "Checking…" : "Check it"}
            </Button>
          </CardFooter>
        </Card>

        {result && <VerificationReport result={result} />}
      </div>
    </div>
  );
}
