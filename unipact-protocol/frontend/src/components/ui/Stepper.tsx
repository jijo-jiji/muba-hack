export interface Step {
  title: string;
  description: string;
}

/** Numbered 01 / 02 / 03 steps, as on the reference site. */
export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="font-mono text-small text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-3 text-card-title font-medium text-ink">{step.title}</h3>
          <p className="mt-2 text-body text-ink-soft">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
