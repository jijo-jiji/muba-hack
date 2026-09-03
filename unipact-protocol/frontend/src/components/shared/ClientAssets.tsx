import { FileText } from "lucide-react";
import { ClientAsset } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

const TYPE_LABELS: Record<ClientAsset["type"], string> = {
  brief: "Brief",
  document: "Document",
  brand_asset: "Brand assets",
  raw_video: "Raw footage",
};

/**
 * The files the company shared for a job. The server only sends these to the
 * company that owns the job, the student assigned to it, or an admin, so an
 * unauthorised viewer receives an empty list rather than a hidden one.
 */
export function ClientAssets({ assets }: { assets: ClientAsset[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files from the company</CardTitle>
      </CardHeader>
      <CardBody>
        {assets.length === 0 ? (
          <p className="text-body text-ink-soft">No files were shared for this job.</p>
        ) : (
          <ul className="divide-y divide-line">
            {assets.map((asset) => (
              <li key={asset.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <FileText className="h-4 w-4 shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-ink">{asset.name}</span>
                  <span className="block text-small text-ink-soft">
                    {TYPE_LABELS[asset.type]} · {asset.sizeMb.toFixed(1)} MB
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-line pt-4 text-small text-ink-faint">
          File contents are not stored in this demo. Only the file list is real.
        </p>
      </CardBody>
    </Card>
  );
}
