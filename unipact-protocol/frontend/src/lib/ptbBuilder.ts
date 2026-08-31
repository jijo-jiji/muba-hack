import { Transaction } from "@mysten/sui/transactions";

export interface BuildSplitRepaymentParams {
  packageId?: string;
  poolId: string;
  billId: string;
  payerAddress: string;
  clubTreasuryAddress: string;
  memberRepayAmountUsdc: number; // e.g. 20.00
  clubDueAmountUsdc: number; // e.g. 0.50
  userCoinObjectId?: string;
  coinType?: string;
}

export interface BuildMerchantPaymentParams {
  merchantAddress: string;
  totalAmountUsdc: number;
  clubTreasuryAddress?: string;
  clubDueAmountUsdc?: number;
  userCoinObjectId?: string;
  itemDescription?: string;
}

/**
 * Builds the Atomic Bill Repayment PTB:
 * 1. SplitCoins: Splits input coin into repayment share + club dues.
 * 2. TransferObjects: Routes repayment share directly to payer address.
 * 3. TransferObjects: Routes club/platform dues to club treasury.
 * 4. MoveCall (Optional on testnet contract): Updates GroupPool state on-chain.
 */
export function buildSplitRepaymentPTB(params: BuildSplitRepaymentParams): Transaction {
  const tx = new Transaction();
  const packageId = params.packageId || process.env.NEXT_PUBLIC_PACKAGE_ID || "0x_unipact_campus_pkg";
  const coinType = params.coinType || "0x2::sui::SUI"; // Or Mock USDC coin type

  const repayAmountUnits = Math.round(params.memberRepayAmountUsdc * 1_000_000);
  const duesAmountUnits = Math.round(params.clubDueAmountUsdc * 1_000_000);

  // If a specific coin is provided, split it; otherwise split from gas/input coin
  if (params.userCoinObjectId && params.userCoinObjectId.startsWith("0x")) {
    const splitResults = tx.splitCoins(tx.object(params.userCoinObjectId), [
      tx.pure.u64(repayAmountUnits),
      tx.pure.u64(duesAmountUnits),
    ]);

    // Transfer reimbursement to original payer
    tx.transferObjects([splitResults[0]], tx.pure.address(params.payerAddress));

    // Transfer dues to club/platform treasury
    if (duesAmountUnits > 0) {
      tx.transferObjects([splitResults[1]], tx.pure.address(params.clubTreasuryAddress));
    }
  } else {
    // Split directly from primary gas/gasless coin
    const splitResults = tx.splitCoins(tx.gas, [
      tx.pure.u64(repayAmountUnits),
      tx.pure.u64(duesAmountUnits),
    ]);

    // Transfer repayment share to payer
    tx.transferObjects([splitResults[0]], tx.pure.address(params.payerAddress));

    // Transfer platform/club dues to treasury
    if (duesAmountUnits > 0) {
      tx.transferObjects([splitResults[1]], tx.pure.address(params.clubTreasuryAddress));
    }
  }

  // Record Move call if package ID is on-chain (or simulated Move target)
  if (params.poolId && params.poolId.startsWith("0x") && !params.poolId.includes("_demo_")) {
    try {
      tx.moveCall({
        target: `${packageId}::group_pool::settle_member_split`,
        typeArguments: [coinType],
        arguments: [
          tx.object(params.poolId),
          tx.object(params.billId),
          tx.object(params.userCoinObjectId || tx.gas),
        ],
      });
    } catch (e) {
      console.warn("Skipping moveCall attachment for simulated object id:", e);
    }
  }

  return tx;
}

/**
 * Builds the Merchant POS Payment PTB:
 * Executes instant payment to merchant stall + optional club royalty
 */
export function buildMerchantPaymentPTB(params: BuildMerchantPaymentParams): Transaction {
  const tx = new Transaction();
  const totalAmountUnits = Math.round(params.totalAmountUsdc * 1_000_000);
  const duesAmountUnits = Math.round((params.clubDueAmountUsdc || 0) * 1_000_000);
  const merchantAmountUnits = totalAmountUnits - duesAmountUnits;

  if (duesAmountUnits > 0 && params.clubTreasuryAddress) {
    const splitResults = tx.splitCoins(tx.gas, [
      tx.pure.u64(merchantAmountUnits),
      tx.pure.u64(duesAmountUnits),
    ]);
    tx.transferObjects([splitResults[0]], tx.pure.address(params.merchantAddress));
    tx.transferObjects([splitResults[1]], tx.pure.address(params.clubTreasuryAddress));
  } else {
    const splitResults = tx.splitCoins(tx.gas, [tx.pure.u64(totalAmountUnits)]);
    tx.transferObjects([splitResults[0]], tx.pure.address(params.merchantAddress));
  }

  return tx;
}
