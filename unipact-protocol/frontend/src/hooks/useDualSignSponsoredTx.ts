"use client";

import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Keypair } from "@mysten/sui/cryptography";
import { fromBase64, toBase64 } from "@mysten/sui/utils";
import {
  suiClient,
  PACKAGE_ID,
  ESCROW_VAULT_ID,
  TREASURY_ADDRESS,
  USDC_COIN_TYPE,
  isRealObjectId,
  explorerUrlForDigest,
} from "@/lib/suiClient";

interface SponsorApiResponse {
  bytes: string;
  sponsorSignature: string;
  isSimulated?: boolean;
  sponsorAddress?: string;
}

export type ExecutionStatus = "success" | "failure" | "not_executed";

export interface ExecutionResult {
  status: ExecutionStatus;
  digest?: string;
  explorerUrl?: string;
  executionTimeMs: number;
  reason?: string;
  createdVaultId?: string;
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDualSignSponsoredTx() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // 1. Serialise only the transaction kind
      let txKindBase64: string;
      try {
        const kindBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
        txKindBase64 = toBase64(kindBytes);
      } catch (buildError) {
        return notExecuted(`The transaction could not be built: ${describe(buildError)}`);
      }

      // 2. Ask our gas relayer at /api/sponsor to sponsor gas
      let sponsor: SponsorApiResponse | null = null;
      try {
        const response = await fetch("/api/sponsor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txBytes: txKindBase64, sender }),
        });
        if (response.ok) {
          sponsor = await response.json();
        }
      } catch (sponsorError) {
        console.warn("Gas sponsor route unreachable, attempting direct execution:", sponsorError);
      }

      const isSimulated = !sponsor || sponsor.isSimulated;

      if (isSimulated) {
        // Fallback: direct signing with userKeypair if they hold SUI
        try {
          const directExecution = await suiClient.signAndExecuteTransaction({
            signer: userKeypair,
            transaction: tx,
            options: { showEffects: true, showEvents: true, showObjectChanges: true },
          });

          const confirmed = directExecution.effects?.status.status === "success";
          const vaultChange = directExecution.objectChanges?.find(
            (c) => c.type === "created" && c.objectType.includes("::escrow::EscrowVault")
          );
          const createdVaultId =
            vaultChange && "objectId" in vaultChange ? vaultChange.objectId : undefined;

          return finish({
            status: confirmed ? "success" : "failure",
            digest: directExecution.digest,
            explorerUrl: explorerUrlForDigest(directExecution.digest),
            executionTimeMs: Math.round(performance.now() - startedAt),
            reason: confirmed ? undefined : directExecution.effects?.status.error,
            createdVaultId,
          });
        } catch (directErr) {
          return notExecuted(
            `The sponsor wallet is unfunded and direct broadcast failed: ${describe(directErr)}`
          );
        }
      }

      if (!sponsor || !sponsor.bytes) {
        return notExecuted("The gas sponsor service did not return transaction bytes.");
      }

      // 3. User signs sponsored bytes
      let userSignature: string;
      try {
        const signed = await userKeypair.signTransaction(fromBase64(sponsor.bytes));
        userSignature = signed.signature;
      } catch (signError) {
        return notExecuted(`The transaction could not be signed: ${describe(signError)}`);
      }

      // 4. Broadcast with dual signatures
      try {
        const execution = await suiClient.executeTransactionBlock({
          transactionBlock: fromBase64(sponsor.bytes),
          signature: [userSignature, sponsor.sponsorSignature],
          options: { showEffects: true, showEvents: true, showObjectChanges: true },
        });

        const confirmed = execution.effects?.status.status === "success";
        const vaultChange = execution.objectChanges?.find(
          (c) => c.type === "created" && c.objectType.includes("::escrow::EscrowVault")
        );
        const createdVaultId =
          vaultChange && "objectId" in vaultChange ? vaultChange.objectId : undefined;

        return finish({
          status: confirmed ? "success" : "failure",
          digest: execution.digest,
          explorerUrl: explorerUrlForDigest(execution.digest),
          executionTimeMs: Math.round(performance.now() - startedAt),
          reason: confirmed ? undefined : execution.effects?.status.error,
          createdVaultId,
        });
      } catch (broadcastError) {
        return notExecuted(`Sui rejected the transaction: ${describe(broadcastError)}`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Creates an on-chain EscrowVault and locks Mock USDC funds.
   */
  const executeCreateEscrow = async (
    studentAddress: string,
    amountUsdc: number,
    userKeypair: Keypair
  ): Promise<ExecutionResult> => {
    if (!isRealObjectId(PACKAGE_ID)) {
      return {
        status: "not_executed",
        executionTimeMs: 0,
        reason: "Escrow package is not deployed on Sui.",
      };
    }

    const sender = userKeypair.toSuiAddress();
    const coins = await suiClient.getCoins({
      owner: sender,
      coinType: USDC_COIN_TYPE,
    });

    if (!coins.data || coins.data.length === 0) {
      return {
        status: "not_executed",
        executionTimeMs: 0,
        reason:
          "Your wallet holds no testnet Mock USDC. Please use the '+500 USDC' faucet button in the header first.",
      };
    }

    const tx = new Transaction();
    const rawAmount = BigInt(Math.round(amountUsdc * 1_000_000));
    const primaryCoin = tx.object(coins.data[0].coinObjectId);

    if (coins.data.length > 1) {
      tx.mergeCoins(
        primaryCoin,
        coins.data.slice(1).map((c) => tx.object(c.coinObjectId))
      );
    }

    const [splitCoin] = tx.splitCoins(primaryCoin, [tx.pure.u64(rawAmount)]);

    tx.moveCall({
      target: `${PACKAGE_ID}::escrow::create_and_deposit`,
      typeArguments: [USDC_COIN_TYPE],
      arguments: [
        tx.pure.address(studentAddress),
        tx.pure.address(TREASURY_ADDRESS || sender),
        splitCoin,
      ],
    });

    return executeSponsoredTransaction(tx, userKeypair);
  };

  /**
   * Releases an escrow milestone: 90% to the student, 10% to the platform treasury.
   */
  const executeReleaseAuditedMilestone = async (
    gonkaRequestId: string,
    truthScore: number,
    userKeypair: Keypair,
    customVaultId?: string
  ): Promise<ExecutionResult> => {
    const vaultId = customVaultId || ESCROW_VAULT_ID;
    if (!isRealObjectId(PACKAGE_ID) || !isRealObjectId(vaultId)) {
      const outcome: ExecutionResult = {
        status: "not_executed",
        executionTimeMs: 0,
        reason:
          "No escrow package or vault is configured. Please verify NEXT_PUBLIC_PACKAGE_ID and NEXT_PUBLIC_ESCROW_VAULT_ID in .env.local.",
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
        tx.object(vaultId),
        tx.pure.string(gonkaRequestId),
        tx.pure.u8(truthScore),
      ],
    });

    return executeSponsoredTransaction(tx, userKeypair);
  };

  return {
    executeCreateEscrow,
    executeReleaseAuditedMilestone,
    executeSponsoredTransaction,
    isExecuting,
    result,
    error,
  };
}
