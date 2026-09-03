import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "devnet" | "localnet") || "testnet";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "";
export const ESCROW_VAULT_ID = process.env.NEXT_PUBLIC_ESCROW_VAULT_ID || "";
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "";
export const USDC_COIN_TYPE = `${PACKAGE_ID}::mock_usdc::MOCK_USDC`;

/**
 * A Sui object id is exactly 32 bytes written as 0x + 64 hex characters.
 * The .env.example ships placeholders like "0x_your_deployed_package_id_here",
 * so we check the shape before trying to talk to the chain. Everything that
 * would broadcast a transaction is gated on this being true.
 */
function isRealObjectId(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value) && !/^0x0+$/.test(value);
}

/** True only when a real escrow package and vault have been deployed and configured. */
export function isEscrowDeployed(): boolean {
  return isRealObjectId(PACKAGE_ID) && isRealObjectId(ESCROW_VAULT_ID);
}

/** Link to a transaction on the public Sui explorer. Only ever call this with a real digest. */
export function explorerUrlForDigest(digest: string): string {
  return `https://suiscan.xyz/${NETWORK}/tx/${digest}`;
}
