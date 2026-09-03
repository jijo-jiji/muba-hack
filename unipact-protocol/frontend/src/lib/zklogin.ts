import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Account } from "./types";

/**
 * Demo signing keys are derived from a fixed seed string, so every account keeps
 * the same Sui address across reloads and across both browser windows in the demo.
 *
 * A production build would not do this. Real zkLogin derives the address from a
 * Google ID token plus a fresh ephemeral keypair, and the token is verified on
 * the server. See the honesty note in the app footer.
 */
function deriveKeypair(seed: string): Ed25519Keypair {
  const seedBytes = new TextEncoder().encode(seed.padEnd(32, "0")).slice(0, 32);
  return Ed25519Keypair.fromSecretKey(seedBytes);
}

const SEEDS: Record<string, string> = {
  apex: "trustmesh_company_apex_2026_0001",
  dailybrew: "trustmesh_company_brew_2026_0002",
  bob: "trustmesh_student_boblee_2026_003",
  charlie: "trustmesh_student_charlie_2026_04",
  nurul: "trustmesh_student_nurul_2026_0005",
  admin: "trustmesh_platform_admin_2026_006",
};

/** The signing key for a demo account. Returns null for an unknown id. */
export function getAccountKeypair(accountId: string): Ed25519Keypair | null {
  const seed = SEEDS[accountId];
  return seed ? deriveKeypair(seed) : null;
}

function addressOf(accountId: string): string {
  return deriveKeypair(SEEDS[accountId]).toSuiAddress();
}

/** The accounts offered on the sign-in page. */
export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "apex",
    name: "Priya Ramasamy",
    email: "ops@apexretail.com.my",
    role: "company",
    address: addressOf("apex"),
    organisation: "Apex Retail Solutions Sdn Bhd",
  },
  {
    id: "dailybrew",
    name: "Wei Ming Chong",
    email: "marketing@dailybrew.my",
    role: "company",
    address: addressOf("dailybrew"),
    organisation: "Daily Brew Artisan Cafe",
  },
  {
    id: "bob",
    name: "Bob Lee",
    email: "bob.lee@apu.edu.my",
    role: "student",
    address: addressOf("bob"),
    university: "Asia Pacific University",
    course: "BSc Software Engineering",
  },
  {
    id: "charlie",
    name: "Charlie Wong",
    email: "charlie.w@student.mmu.edu.my",
    role: "student",
    address: addressOf("charlie"),
    university: "Multimedia University",
    course: "BA Digital Media Production",
  },
  {
    id: "nurul",
    name: "Nurul Aisyah",
    email: "nurul.aisyah@siswa.um.edu.my",
    role: "student",
    address: addressOf("nurul"),
    university: "Universiti Malaya",
    course: "BSc Computer Science",
  },
  {
    id: "admin",
    name: "TrustMesh Platform",
    email: "admin@trustmesh.my",
    role: "admin",
    address: addressOf("admin"),
  },
];

export function findAccount(accountId: string): Account | undefined {
  return DEMO_ACCOUNTS.find((account) => account.id === accountId);
}

export function accountsByRole(role: Account["role"]): Account[] {
  return DEMO_ACCOUNTS.filter((account) => account.role === role);
}
