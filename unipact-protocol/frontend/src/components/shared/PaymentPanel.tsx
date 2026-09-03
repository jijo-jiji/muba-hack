import { ExternalLink } from "lucide-react";
import { PaymentRecord } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { AddressChip } from "@/components/ui/AddressChip";
import { Stat } from "@/components/ui/Stat";

/**
 * What happened when the payment was released.
 *
 * A transaction digest and an explorer link appear here only when a real
 * transaction was broadcast and confirmed. Otherwise the panel says plainly that
 * nothing was submitted on chain, and shows no link at all.
 */
export function PaymentPanel({ payment }: { payment: PaymentRecord }) {
  const wentOnChain = Boolean(payment.digest);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Stat label="To the student (90%)" value={`${payment.studentPayoutUsdc.toFixed(2)} USDC`} />
          <Stat label="Platform fee (10%)" value={`${payment.platformFeeUsdc.toFixed(2)} USDC`} />
        </div>

        {wentOnChain ? (
          <div className="space-y-3 border-t border-line pt-4">
            <AddressChip label="Transaction" value={payment.digest!} />
            {payment.explorerUrl && (
              <a
                href={payment.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-small text-accent hover:underline"
              >
                View on the Sui explorer
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="rounded border border-line bg-page px-4 py-3 text-small text-ink-soft">
            <p className="font-medium text-ink">
              Simulated locally. No on-chain transaction was submitted.
            </p>
            <p className="mt-1">{payment.note}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
