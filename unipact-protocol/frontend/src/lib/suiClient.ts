import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "devnet" | "localnet") || "testnet";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ESCROW_VAULT_ID = process.env.NEXT_PUBLIC_ESCROW_VAULT_ID || "0x0000000000000000000000000000000000000000000000000000000000000000";
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x7777777777777777777777777777777777777777777777777777777777777777";
export const USDC_COIN_TYPE = `${PACKAGE_ID}::mock_usdc::MOCK_USDC`;
