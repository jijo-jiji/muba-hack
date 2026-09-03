import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64, toBase64 } from "@mysten/sui/utils";

const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "devnet" | "localnet") || "testnet";
const suiClient = new SuiClient({ url: getFullnodeUrl(NETWORK) });

/**
 * The relayer wallet. It is the only account in the system that ever spends SUI:
 * it pays the network fee on behalf of students and companies, which is what makes
 * the app feel free to use. It must be funded with testnet SUI for anything to
 * actually reach the chain.
 */
function loadSponsorKeypair(): Ed25519Keypair | null {
  const secret = process.env.SPONSOR_PRIVATE_KEY_B64;
  if (!secret || secret.startsWith("your_")) return null;
  try {
    return Ed25519Keypair.fromSecretKey(fromBase64(secret));
  } catch (err) {
    console.warn("SPONSOR_PRIVATE_KEY_B64 is set but could not be parsed:", err);
    return null;
  }
}

/**
 * Responses always carry isSimulated. When it is true the caller must treat the
 * transaction as never having been sent. We never return a fabricated signature
 * or a fabricated address dressed up to look real.
 */
function notSponsored(reason: string) {
  return NextResponse.json({ bytes: "", sponsorSignature: "", isSimulated: true, reason });
}

export async function POST(req: NextRequest) {
  try {
    const { txBytes, sender } = await req.json();
    if (!txBytes || !sender) {
      return NextResponse.json({ error: "Missing txBytes or sender" }, { status: 400 });
    }

    const sponsorKeypair = loadSponsorKeypair();
    if (!sponsorKeypair) {
      return notSponsored("No sponsor wallet is configured (SPONSOR_PRIVATE_KEY_B64 is unset).");
    }
    const sponsorAddress = sponsorKeypair.toSuiAddress();

    // The sponsor needs at least one SUI coin to hand over as the gas payment.
    let gasCoins;
    try {
      const coins = await suiClient.getCoins({ owner: sponsorAddress, coinType: "0x2::sui::SUI" });
      gasCoins = coins.data;
    } catch (rpcError) {
      console.warn("Could not query sponsor gas coins:", rpcError);
      return notSponsored("The Sui RPC endpoint could not be reached to look up sponsor gas coins.");
    }

    if (!gasCoins || gasCoins.length === 0) {
      return notSponsored(
        `The sponsor wallet ${sponsorAddress} holds no ${NETWORK} SUI, so it cannot pay for gas.`
      );
    }

    // Rebuild the user's intended actions, then attach our gas coin and sign for it.
    const tx = Transaction.fromKind(fromBase64(txBytes));
    tx.setSender(sender);
    tx.setGasOwner(sponsorAddress);
    tx.setGasPayment(
      gasCoins.map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      }))
    );
    tx.setGasBudget(25_000_000); // 0.025 SUI

    const finalBytes = await tx.build({ client: suiClient });
    const sponsorSignature = (await sponsorKeypair.signTransaction(finalBytes)).signature;

    return NextResponse.json({
      bytes: toBase64(finalBytes),
      sponsorSignature,
      isSimulated: false,
      sponsorAddress,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Sponsor API error:", message);
    return notSponsored(`The sponsor service failed to prepare the transaction: ${message}`);
  }
}
