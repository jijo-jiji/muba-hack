import { ModelInferenceStep } from "@/lib/types";
import { AddressChip } from "@/components/ui/AddressChip";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * The per-model breakdown of a review. Two models look at the work separately
 * and their scores are combined, so this shows what each one said.
 *
 * Timings are shown only for a live call. The canned demo results carry
 * hardcoded latency numbers, and printing those next to a real model name would
 * read as a measurement when nothing was measured.
 */
export function ModelSteps({
  steps,
  showLatency,
}: {
  steps: ModelInferenceStep[];
  showLatency: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <div>
      <SectionLabel>Each model&rsquo;s view</SectionLabel>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={index} className="rounded-card border border-line p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body font-medium text-ink">{step.stepName}</p>
              <p className="text-card-title font-medium text-ink">{step.score}</p>
            </div>

            <p className="mt-1 font-mono text-small text-ink-soft">
              {step.model}
              {showLatency && step.latencyMs ? ` · ${step.latencyMs} ms` : ""}
            </p>

            {step.findings.length > 0 && (
              <ul className="mt-3 space-y-1">
                {step.findings.slice(0, 3).map((finding, findingIndex) => (
                  <li key={findingIndex} className="text-small text-ink-soft">
                    {finding}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-line pt-3">
              <AddressChip label="Request ID" value={step.requestId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
