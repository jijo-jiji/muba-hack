"use client";

import { useState } from "react";
import { ClaimVerificationResult } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Textarea } from "@/components/ui/Field";
import { AddressChip } from "@/components/ui/AddressChip";
import Link from "next/link";

const SAMPLES = [
  {
    title: "Sui Escrow & Deliverable Claim",
    input: "TrustMesh Move smart contracts enforce an atomic 90/10 milestone escrow payout on Sui Testnet with gasless sponsored PTBs.",
    context: "Sui Move escrow repository on package 0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8.",
  },
  {
    title: "GitHub Deliverable URL",
    input: "https://github.com/boblee/sui-pay-mobile-app",
    context: "Completed Next.js mobile web app with Sui Move zkLogin wallet connector and passed unit tests.",
  },
  {
    title: "Web3 Hackathon Tweet",
    input: "We deployed decentralized milestone audits on gonkarouter.io combining Moonshot Kimi-K2.6 and DeepSeek-V4 for cross-model neutrality.",
    context: "Gonka Router official inference gateway supporting multi-model consensus verification.",
  },
  {
    title: "Incomplete / Placeholder Code",
    input: "TODO: connect Sui wallet here later. Mocking payment data for demo with dummy test address.",
    context: "Client brief strictly requires production Sui Move contracts and zero placeholder mocks.",
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
      setError("Please paste a URL, tweet, or text snippet to verify.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("trustmesh_gonka_api_key") : undefined;
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

  const loadPreset = (preset: typeof SAMPLES[0]) => {
    setInput(preset.input);
    setContext(preset.context);
    handleVerify(preset.input, preset.context);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Gonka Decentralized Verifier"
        description="Cross-verify any URL, tweet, or text claim using multi-model consensus on the official Gonka Network gateway (gonkarouter.io)."
        action={
          <div className="flex items-center gap-2">
            <Badge tone="success">Gateway: gonkarouter.io</Badge>
            <Badge tone="neutral">Consensus: Multi-Model</Badge>
          </div>
        }
      />

      {/* Preset Quick Selectors for Judges */}
      <div className="space-y-2">
        <p className="text-small font-medium text-ink-soft">Quick sample claims for judging:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(sample)}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs text-ink hover:border-accent hover:text-accent transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardBody className="space-y-6">
          <Field
            label="Claim, URL, or Text Snippet"
            htmlFor="claim-input"
            hint="Paste any GitHub repository link, article URL, social tweet, or deliverable statement."
          >
            <Textarea
              id="claim-input"
              rows={3}
              placeholder="e.g. https://github.com/... or 'TrustMesh smart contracts enforce a 90/10 milestone escrow release on Sui Testnet...'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Field>

          <Field
            label="Optional Reference Context or Specification"
            htmlFor="context-input"
            hint="Reference document, client brief, or source criteria to verify against."
          >
            <Textarea
              id="context-input"
              rows={2}
              placeholder="Optional: Enter context, benchmark requirement, or brief..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </Field>

          {error && <p className="text-small text-danger">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span>Models:</span>
              <code className="font-mono text-ink">moonshotai/Kimi-K2.6</code>
              <span>&</span>
              <code className="font-mono text-ink">deepseek-ai/DeepSeek-V4</code>
            </div>
            <Button onClick={() => handleVerify()} disabled={isVerifying}>
              {isVerifying ? "Verifying across models…" : "Verify via Gonka Consensus"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Result Dashboard */}
      {result && (
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <CardTitle>Verification Report</CardTitle>
              <p className="text-small text-ink-soft">
                Multi-model consensus evaluation report generated via Gonka Network
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={result.verdict === "Verified True" ? "success" : result.verdict === "Partially Verified" ? "warning" : "error"}>
                {result.verdict}
              </Badge>
              <Badge tone="neutral">Consensus: {result.consensusLevel}</Badge>
              {!result.isLiveGonkaCall && <Badge tone="warning">Demo Data</Badge>}
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Truth Score Banner */}
            <div className="rounded-xl border border-line bg-page/40 p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-body font-semibold text-ink">Consensus Truth Score</h3>
                  <p className="text-small text-ink-soft">
                    Combined factual fidelity and scope authenticity from independent inference runs
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-extrabold ${result.truthScore >= 80 ? "text-success" : result.truthScore >= 50 ? "text-amber-500" : "text-danger"}`}>
                    {result.truthScore}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line/50">
                <div
                  className={`h-full transition-all duration-700 ${result.truthScore >= 80 ? "bg-success" : result.truthScore >= 50 ? "bg-amber-500" : "bg-danger"}`}
                  style={{ width: `${result.truthScore}%` }}
                />
              </div>
            </div>

            {/* Extracted Claims */}
            {result.extractedClaims && result.extractedClaims.length > 0 && (
              <div>
                <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
                  Extracted Factual Claims
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {result.extractedClaims.map((claim, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-line bg-page/30 p-3 text-xs text-ink"
                    >
                      <span className="text-accent font-bold">#{idx + 1}</span>
                      <span>{claim}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transparency UI: Specific Gonka Request IDs */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
                  Transparency Dashboard: Decentralized Inference Steps
                </p>
                <span className="text-xs text-ink-faint">Official gonkarouter.io Gateway</span>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {result.modelSteps.map((step, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-page/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-small font-medium text-ink">{step.stepName}</span>
                      <span className="text-body font-bold text-accent">{step.score}%</span>
                    </div>
                    <div className="text-xs font-mono text-ink-soft">
                      Model: <span className="text-ink font-semibold">{step.model}</span>
                      {step.latencyMs ? ` · ${step.latencyMs}ms` : ""}
                    </div>
                    {step.findings && step.findings.length > 0 && (
                      <ul className="text-xs text-ink-soft space-y-1 list-disc pl-4">
                        {step.findings.map((finding, fIdx) => (
                          <li key={fIdx}>{finding}</li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-2 border-t border-line/60">
                      <AddressChip label="Gonka Request ID" value={step.requestId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning Trace */}
            {result.reasoningTrace.length > 0 && (
              <div>
                <p className="text-small font-semibold uppercase tracking-wider text-ink-soft">
                  Consensus Reasoning Trace
                </p>
                <ul className="mt-2 space-y-2 rounded-xl border border-line bg-page/30 p-4">
                  {result.reasoningTrace.map((point, index) => (
                    <li key={index} className="text-body text-ink-soft flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sui Escrow Bridge Callout */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-small font-semibold text-ink">Ready for On-Chain Settlement on Sui?</h4>
                <p className="text-xs text-ink-soft">
                  Verified claims with Truth Scores ≥ 80% automatically qualify for Sui Testnet escrow payout release.
                </p>
              </div>
              <Link href="/company/jobs/new">
                <Button size="sm">Post & Fund Job on Sui</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
