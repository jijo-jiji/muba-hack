import { ClaimVerificationResult } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import { ModelSteps } from "@/components/shared/ModelSteps";

function verdictTone(verdict: ClaimVerificationResult["verdict"]) {
  if (verdict === "Verified True") return "success" as const;
  if (verdict === "Partially Verified") return "warning" as const;
  return "error" as const;
}

/** The result panel of the claim checker. */
export function VerificationReport({ result }: { result: ClaimVerificationResult }) {
  const tone = verdictTone(result.verdict);

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Result</CardTitle>
          <p className="mt-1 text-small text-ink-soft">
            Two models checked this separately and their scores were combined.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{result.consensusLevel} agreement</Badge>
          {!result.isLiveGonkaCall && <Badge tone="warning">Demo data, not a live Gonka call</Badge>}
          <Badge tone={tone}>{result.verdict}</Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-small text-ink-soft">
              Truth Score — how well the claim holds up against the reference
            </p>
            <p className="text-section font-semibold text-ink">{result.truthScore}/100</p>
          </div>
          <div className="mt-3">
            <Meter value={result.truthScore} tone={tone} />
          </div>
          <p className="mt-2 text-small text-ink-faint">
            A score of 80 or above is treated as verified.
          </p>
        </div>

        {result.extractedClaims.length > 0 && (
          <div>
            <SectionLabel>Claims found in the text</SectionLabel>
            <ol className="mt-3 space-y-2">
              {result.extractedClaims.map((claim, index) => (
                <li key={index} className="flex gap-3 text-body text-ink-soft">
                  <span className="font-mono text-small text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{claim}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <ModelSteps steps={result.modelSteps} showLatency={result.isLiveGonkaCall} />

        {result.reasoningTrace.length > 0 && (
          <div>
            <SectionLabel>How they reached that</SectionLabel>
            <ul className="mt-3 space-y-2">
              {result.reasoningTrace.map((point, index) => (
                <li key={index} className="text-body text-ink-soft">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div>
            <p className="text-body font-medium text-ink">Want this run on real work?</p>
            <p className="mt-1 text-small text-ink-soft">
              The same check decides whether a job&rsquo;s escrow pays out.
            </p>
          </div>
          <ButtonLink href="/company/jobs/new" variant="secondary" size="sm">
            Post a job
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
