import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { ZkLoginPersona } from "./types";
import { fromBase64, toBase64 } from "@mysten/sui/utils";

// Deterministic seed generation for consistent demo personas
function createPersonaKeypair(seed: string): Ed25519Keypair {
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed.padEnd(32, "0")).slice(0, 32);
  return Ed25519Keypair.fromSecretKey(seedBytes);
}

// Initial demo personas for zero-friction hackathon testing & role switching
export const INITIAL_PERSONAS: ZkLoginPersona[] = [
  {
    id: "alice",
    name: "Alice Tan (Group Leader)",
    email: "alice.tan@apu.edu.my",
    address: createPersonaKeypair("alice_zklogin_demo_seed_2026_01").toSuiAddress(),
    avatar: "👩🏻‍💻",
    role: "payer",
    keypair: createPersonaKeypair("alice_zklogin_demo_seed_2026_01"),
    usdcBalance: 250.0,
  },
  {
    id: "bob",
    name: "Bob Lee (Student Member)",
    email: "bob.lee@apu.edu.my",
    address: createPersonaKeypair("bob_zklogin_demo_seed_2026_02").toSuiAddress(),
    avatar: "👨🏻‍🎓",
    role: "student",
    keypair: createPersonaKeypair("bob_zklogin_demo_seed_2026_02"),
    usdcBalance: 85.0,
  },
  {
    id: "charlie",
    name: "Charlie Wong (Club Member)",
    email: "charlie.w@apu.edu.my",
    address: createPersonaKeypair("charlie_zklogin_demo_seed_2026_03").toSuiAddress(),
    avatar: "🧑🏽‍💻",
    role: "student",
    keypair: createPersonaKeypair("charlie_zklogin_demo_seed_2026_03"),
    usdcBalance: 120.0,
  },
  {
    id: "merchant_dave",
    name: "Dave's Campus Cafe (POS)",
    email: "dave.cafe@campus-eats.my",
    address: createPersonaKeypair("dave_merchant_pos_seed_2026_04").toSuiAddress(),
    avatar: "☕",
    role: "merchant",
    keypair: createPersonaKeypair("dave_merchant_pos_seed_2026_04"),
    usdcBalance: 520.0,
  },
  {
    id: "treasurer_eva",
    name: "Blockchain Club Treasury",
    email: "treasury@sui-club.apu.my",
    address: "0x7777777777777777777777777777777777777777777777777777777777777777",
    avatar: "🏛️",
    role: "treasurer",
    keypair: createPersonaKeypair("treasury_eva_seed_2026_05"),
    usdcBalance: 1450.0,
  },
];

// Ephemeral Key Management for zkLogin
export interface EphemeralSession {
  ephemeralKeypair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  nonce: string;
  createdAt: number;
}

export function generateEphemeralSession(currentEpoch: number = 100): EphemeralSession {
  const ephemeralKeypair = new Ed25519Keypair();
  const maxEpoch = currentEpoch + 10;
  const randomness = Math.floor(Math.random() * 1000000000000000).toString();
  
  // Nonce generation simulation for zkLogin JWT binding
  const nonce = toBase64(ephemeralKeypair.getPublicKey().toRawBytes()).slice(0, 24);

  return {
    ephemeralKeypair,
    maxEpoch,
    randomness,
    nonce,
    createdAt: Date.now(),
  };
}

export function getGoogleOAuthUrl(clientId?: string, redirectUri?: string, nonce?: string): string {
  const cId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "104829104829-campus-demo.apps.googleusercontent.com";
  const rUri = redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "http://localhost:3000/auth/callback");
  const n = nonce || "sui_zklogin_ephemeral_nonce_demo";

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    cId
  )}&response_type=id_token&redirect_uri=${encodeURIComponent(
    rUri
  )}&scope=openid%20email%20profile&nonce=${encodeURIComponent(n)}`;
}
