"use client";

import { useState } from "react";
import { Account, Job } from "@/lib/types";
import { getAccountKeypair } from "@/lib/zklogin";
import { useDualSignSponsoredTx } from "@/hooks/useDualSignSponsoredTx";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";

/**
 * The company's release button.
 *
 * The transaction is signed here in the browser, because that is where the
 * account's signing key lives. Our relayer pays the network fee, so the company
 * never needs to hold SUI. Whatever comes back — a confirmed transaction or a
 * reason nothing was sent — is written to the job exactly as reported.
 */
export function ReleasePayment({
  account,
  job,
  onReleased,
}: {
  account: Account;
  job: Job;
  onReleased: () => void;
}) {
  const { executeReleaseAuditedMilestone, isExecuting } = useDualSignSponsoredTx();
  const [error, setError] = useState<string | null>(null);

  const platformFee = job.budgetUsdc * 0.1;
  const studentPayout = job.budgetUsdc - platformFee;

  const release = async () => {
    setError(null);
    const keypair = getAccountKeypair(account.id);
    if (!keypair || !job.audit) {
      setError("This account has no signing key.");
      return;
    }

    const outcome = await executeReleaseAuditedMilestone(
      job.audit.gonkaRequestId,
      job.audit.truthScore,
      keypair,
      job.escrowVaultId
    );

    const note =
      outcome.status === "success"
        ? `Confirmed on chain in ${outcome.executionTimeMs} ms.`
        : outcome.reason ?? "The transaction did not complete.";

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "release",
          digest: outcome.digest,
          explorerUrl: outcome.explorerUrl,
          note,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      onReleased();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Release the payment</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat label="To the student" value={`${studentPayout.toFixed(2)} USDC`} note="90% of the budget" />
          <Stat label="Platform fee" value={`${platformFee.toFixed(2)} USDC`} note="10% of the budget" />
          <Stat label="Network fee to you" value="0.00 SUI" note="Covered by TrustMesh" />
        </div>

        <p className="text-body text-ink-soft">
          The work scored {job.audit?.truthScore}, which is at or above the threshold, so the escrow
          will pay out in one step: the student and the platform are paid from the same transaction.
        </p>

        {error && <p className="text-small text-danger">{error}</p>}

        <Button onClick={release} disabled={isExecuting}>
          {isExecuting ? "Releasing…" : "Release payment"}
        </Button>
      </CardBody>
    </Card>
  );
}
