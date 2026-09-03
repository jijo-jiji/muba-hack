"use client";

import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Keypair } from "@mysten/sui/cryptography";
import { fromBase64, toBase64 } from "@mysten/sui/utils";
import {
  suiClient,
  PACKAGE_ID,
  ESCROW_VAULT_ID,
  USDC_COIN_TYPE,
  isEscrowDeployed,
  explorerUrlForDigest,
} from "@/lib/suiClient";

interface SponsorApiResponse {
  bytes: string;
  sponsorSignature: string;
  isSimulated?: boolean;
  sponsorAddress?: string;
}

/**
 * "not_executed" means nothing was ever sent to Sui. When that is the outcome
 * there is no digest and no explorer link, and the UI must not invent one.
 */
export type ExecutionStatus = "success" | "failure" | "not_executed";

export interface ExecutionResult {
  status: ExecutionStatus;
  /** Present only when a transaction was broadcast and the network confirmed it. */
  digest?: string;
  /** Present only alongside a real digest. */
  explorerUrl?: string;
  /** Real measured duration of the attempt in milliseconds. Never capped or smoothed. */
  executionTimeMs: number;
  /** Plain-language explanation of why nothing was broadcast. */
  reason?: string;
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDualSignSponsoredTx() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs one sponsored transaction end to end.
   *
   * The flow has two signatures, which is why it is called "dual sign":
   *  1. the user signs the action they want to take,
   *  2. our relayer signs to say it will pay the network fee.
   * Sui accepts both together, so the user never needs to hold SUI for gas.
   *
   * Every path that does not end in a confirmed on-chain transaction returns
   * status "not_executed" with a reason. There is deliberately no fallback that
   * makes an unexecuted transaction look successful.
   */
  const executeSponsoredTransaction = async (
    tx: Transaction,
    userKeypair: Keypair
  ): Promise<ExecutionResult> => {
    setIsExecuting(true);
    setError(null);
    setResult(null);
    const startedAt = performance.now();

    const finish = (outcome: ExecutionResult): ExecutionResult => {
      setResult(outcome);
      if (outcome.status !== "success" && outcome.reason) setError(outcome.reason);
      return outcome;
    };

    const notExecuted = (reason: string): ExecutionResult =>
      finish({
        status: "not_executed",
        executionTimeMs: Math.round(performance.now() - startedAt),
        reason,
      });

    try {
      const sender = userKeypair.toSuiAddress();
      tx.setSender(sender);

      // 1. Serialise only the "what to do" half of the transaction. The gas coin
      //    is left out on purpose so the sponsor can attach its own.
      let txKindBase64: string;
      try {
        const kindBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
        txKindBase64 = toBase64(kindBytes);
      } catch (buildError) {
        return notExecuted(`The transaction could not be built: ${describe(buildError)}`);
      }

      // 2. Ask our own relayer at /api/sponsor to attach gas and sign for it.
      let sponsor: SponsorApiResponse;
      try {
        const response = await fetch("/api/sponsor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txBytes: txKindBase64, sender }),
        });
        if (!response.ok) {
          return notExecuted(`The gas sponsor service replied with HTTP ${response.status}.`);
        }
        sponsor = await response.json();
      } catch (sponsorError) {
        return notExecuted(`The gas sponsor service is unreachable: ${describe(sponsorError)}`);
      }

      // The relayer reports honestly whether it had a funded wallet. If the flag
      // is missing we assume the worst, so a silent failure can never read as real.
      const isSimulated = sponsor.isSimulated ?? true;
      if (isSimulated) {
        return notExecuted(
          "The sponsor wallet holds no testnet SUI, so the transaction was prepared but not broadcast."
        );
      }

      // 3. The user signs the fully-formed sponsored bytes.
      let userSignature: string;
      try {
        const signed = await userKeypair.signTransaction(fromBase64(sponsor.bytes));
        userSignature = signed.signature;
      } catch (signError) {
        return notExecuted(`The transaction could not be signed: ${describe(signError)}`);
      }

      // 4. Broadcast with both signatures attached.
      try {
        const execution = await suiClient.executeTransactionBlock({
          transactionBlock: fromBase64(sponsor.bytes),
          signature: [userSignature, sponsor.sponsorSignature],
          options: { showEffects: true, showEvents: true },
        });

        const confirmed = execution.effects?.status.status === "success";
        return finish({
          status: confirmed ? "success" : "failure",
          digest: execution.digest,
          explorerUrl: explorerUrlForDigest(execution.digest),
          executionTimeMs: Math.round(performance.now() - startedAt),
          reason: confirmed ? undefined : execution.effects?.status.error,
        });
      } catch (broadcastError) {
        return notExecuted(`Sui rejected the transaction: ${describe(broadcastError)}`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Releases an escrow milestone: 90% to the student, 10% to the platform treasury,
   * in a single Move call. The Gonka request id and score are written on-chain as
   * part of the release so the payout carries its own evidence.
   */
  const executeReleaseAuditedMilestone = async (
    gonkaRequestId: string,
    truthScore: number,
    userKeypair: Keypair
  ): Promise<ExecutionResult> => {
    if (!isEscrowDeployed()) {
      const outcome: ExecutionResult = {
        status: "not_executed",
        executionTimeMs: 0,
        reason:
          "No escrow package is configured. Set NEXT_PUBLIC_PACKAGE_ID and NEXT_PUBLIC_ESCROW_VAULT_ID to a deployed package to release on-chain.",
      };
      setResult(outcome);
      setError(outcome.reason ?? null);
      return outcome;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow::release_audited_milestone`,
      typeArguments: [USDC_COIN_TYPE],
      arguments: [
        tx.object(ESCROW_VAULT_ID),
        tx.pure.string(gonkaRequestId),
        tx.pure.u8(truthScore),
      ],
    });

    return executeSponsoredTransaction(tx, userKeypair);
  };

  return {
    executeReleaseAuditedMilestone,
    executeSponsoredTransaction,
    isExecuting,
    result,
    error,
  };
}
