import { Badge } from "@/components/ui/Badge";
import { JobStatus } from "@/lib/types";

const LABELS: Record<JobStatus, { text: string; tone: "neutral" | "success" | "warning" }> = {
  open: { text: "Open for applications", tone: "neutral" },
  assigned: { text: "In progress", tone: "neutral" },
  submitted: { text: "Awaiting review", tone: "warning" },
  audited: { text: "Reviewed", tone: "warning" },
  paid: { text: "Paid", tone: "success" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { text, tone } = LABELS[status];
  return <Badge tone={tone}>{text}</Badge>;
}
