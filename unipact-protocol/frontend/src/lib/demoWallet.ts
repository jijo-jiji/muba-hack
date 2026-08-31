import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const LOCAL_STORAGE_KEY = "unipact_demo_user_secret_key";

/**
 * Retrieves or generates an ephemeral / demo student keypair stored in browser localStorage.
 * For hackathon demo day, this guarantees instant zero-friction 1-click execution.
 */
export function getOrCreateDemoKeypair(): Ed25519Keypair {
  if (typeof window === "undefined") {
    return new Ed25519Keypair();
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return Ed25519Keypair.fromSecretKey(stored);
    } catch (e) {
      console.warn("Invalid stored keypair, regenerating...", e);
    }
  }

  const newKeypair = new Ed25519Keypair();
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, newKeypair.getSecretKey());
  } catch (e) {
    console.warn("Failed to store keypair in localStorage:", e);
  }
  return newKeypair;
}

export function resetDemoKeypair(): Ed25519Keypair {
  const newKeypair = new Ed25519Keypair();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newKeypair.getSecretKey());
    } catch (e) {
      console.warn("Failed to reset keypair in localStorage:", e);
    }
  }
  return newKeypair;
}
