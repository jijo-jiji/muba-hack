import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "devnet" | "localnet") || "testnet";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "";
export const ESCROW_VAULT_ID = process.env.NEXT_PUBLIC_ESCROW_VAULT_ID || "";
export const TREASURY_CAP_ID = process.env.NEXT_PUBLIC_TREASURY_CAP_ID || "";
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "";
export const USDC_COIN_TYPE = `${PACKAGE_ID}::mock_usdc::MOCK_USDC`;

/**
 * A Sui object id is exactly 32 bytes written as 0x + 64 hex characters.
 */
export function isRealObjectId(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value) && !/^0x0+$/.test(value);
}

/**
 * A Sui account address has the same shape as an object id.
 */
export const isRealAddress = isRealObjectId;

/** True only when a real escrow package and vault have been deployed and configured. */
export function isEscrowDeployed(): boolean {
  return isRealObjectId(PACKAGE_ID) && isRealObjectId(ESCROW_VAULT_ID);
}

/** Link to a transaction on the public Sui explorer. Only ever call this with a real digest. */
export function explorerUrlForDigest(digest: string): string {
  return `https://suiscan.xyz/${NETWORK}/tx/${digest}`;
}

/** Link to an object on the public Sui explorer. */
export function explorerUrlForObject(objectId: string): string {
  return `https://suiscan.xyz/${NETWORK}/object/${objectId}`;
}

/**
 * Reads the live on-chain MOCK_USDC balance for any address.
 * Routes through the server (/api/balance) in the browser to avoid public JSON-RPC deprecation.
 */
export async function getMockUsdcBalance(address: string): Promise<number> {
  if (!isRealAddress(address) || !isRealObjectId(PACKAGE_ID)) return 0;
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/balance?address=${encodeURIComponent(address)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.balance === "number") return data.balance;
      }
    } catch (err) {
      console.warn("Could not query USDC balance via /api/balance:", err);
    }
  }
  try {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType: USDC_COIN_TYPE,
    });
    const totalRaw = coins.data.reduce((acc, c) => acc + BigInt(c.balance), BigInt(0));
    return Number(totalRaw) / 1_000_000;
  } catch (err) {
    console.warn("Could not query USDC balance for", address, err);
    return 0;
  }
}

/**
 * Reads the live on-chain SUI balance for any address.
 */
export async function getSuiBalance(address: string): Promise<number> {
  if (!isRealAddress(address)) return 0;
  try {
    const balance = await suiClient.getBalance({
      owner: address,
      coinType: "0x2::sui::SUI",
    });
    return Number(BigInt(balance.totalBalance)) / 1_000_000_000;
  } catch (err) {
    console.warn("Could not query SUI balance for", address, err);
    return 0;
  }
}
