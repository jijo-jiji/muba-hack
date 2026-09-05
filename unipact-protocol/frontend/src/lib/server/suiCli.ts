import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function findSuiExe(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "..", "tools", "sui.exe"),
    path.resolve(process.cwd(), "..", "tools", "sui.exe"),
    path.resolve(process.cwd(), "tools", "sui.exe"),
    "sui.exe",
  ];

  const fs = require("node:fs");
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return "sui.exe";
}

const SUI_EXE = findSuiExe();
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8";
const TREASURY_CAP_ID = process.env.NEXT_PUBLIC_TREASURY_CAP_ID || "0x3014d018f3fe3f0765c0f7aefb989949f26503b3c3ff121f1f83997b8475c877";

/**
 * Runs the Sui CLI and turns a failure into something a person can act on.
 *
 * execFile puts the whole command line in err.message and the actual reason in
 * err.stderr, so without this the UI showed a wall of hex and no explanation.
 */
async function runSui(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync(SUI_EXE, args);
    return stdout;
  } catch (err) {
    const failure = err as { stdout?: string; stderr?: string; message?: string; code?: string };
    // The Sui CLI reports failures on stdout, not stderr, so check both.
    const detail = `${failure.stdout ?? ""}\n${failure.stderr ?? ""}`.trim();

    if (failure.code === "ENOENT") {
      throw new Error(
        "The Sui CLI was not found. Put sui.exe in the repo's tools/ folder, then restart the dev server."
      );
    }
    if (/insufficient SUI balance/i.test(detail)) {
      throw new Error(
        "The wallet the Sui CLI signs with has no testnet SUI, so it cannot pay the network fee. " +
          "Fund it at faucet.sui.io and try again."
      );
    }
    if (detail) {
      // First non-empty line is the useful one; the rest is a usage dump.
      const line = detail
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)[0];
      throw new Error(line ?? detail);
    }
    throw new Error(failure.message ?? "The Sui CLI call failed.");
  }
}

interface CliCallResult {
  digest: string;
  effects?: { status?: { status?: string } };
}

function parseCliJson(stdout: string): CliCallResult {
  const start = stdout.indexOf("{");
  if (start === -1) {
    throw new Error(`The Sui CLI returned output we could not read: ${stdout.slice(0, 200)}`);
  }
  const parsed = JSON.parse(stdout.substring(start)) as Partial<CliCallResult>;
  if (typeof parsed.digest !== "string") {
    // No digest means nothing was confirmed, and we never invent one.
    throw new Error("The Sui CLI reported no transaction digest, so nothing was confirmed on chain.");
  }
  return { digest: parsed.digest, effects: parsed.effects };
}

function matchesCoinType(a: string, b: string): boolean {
  if (a.toLowerCase() === b.toLowerCase()) return true;
  const partsA = a.split("::");
  const partsB = b.split("::");
  if (partsA.length === 3 && partsB.length === 3) {
    const sameModule = partsA[1].toLowerCase() === partsB[1].toLowerCase();
    const sameStruct = partsA[2].toLowerCase() === partsB[2].toLowerCase();
    try {
      const addrA = BigInt(partsA[0]);
      const addrB = BigInt(partsB[0]);
      return sameModule && sameStruct && addrA === addrB;
    } catch {
      return false;
    }
  }
  return false;
}

const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const inFlightBalance = new Map<string, Promise<number>>();
const CACHE_TTL_MS = 4000;

/**
 * Reads an address's balance of one coin type through the CLI.
 *
 * The browser cannot do this any more: @mysten/sui talks JSON-RPC to the public
 * fullnode, and testnet fullnodes have turned JSON-RPC off. The CLI uses a
 * transport that still works, so balance reads go through the server.
 *
 * Returns the amount in whole coins. Throws rather than returning 0 on failure,
 * because a zero balance and an unreachable network must not look the same.
 */
export async function getCoinBalanceViaCli(address: string, coinType: string): Promise<number> {
  const cacheKey = `${address.toLowerCase()}::${coinType.toLowerCase()}`;
  const now = Date.now();
  const cached = balanceCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.balance;
  }

  const existingPromise = inFlightBalance.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }

  const fetchPromise = (async () => {
    try {
      const stdout = await runSui(["client", "balance", address, "--json"]);
      const start = stdout.indexOf("[");
      if (start === -1) throw new Error("The Sui CLI returned no balance data.");

      const parsed = JSON.parse(stdout.substring(start)) as unknown;
      // Shape: [ [ { balance: { coinType, balance } } ], hasMore ]
      const groups = Array.isArray(parsed) && Array.isArray(parsed[0]) ? parsed[0] : [];

      for (const entry of groups) {
        const balance = (entry as { balance?: { coinType?: string; balance?: string } })?.balance;
        if (balance?.coinType && typeof balance.balance === "string") {
          if (matchesCoinType(balance.coinType, coinType)) {
            const val = Number(BigInt(balance.balance)) / 1_000_000;
            balanceCache.set(cacheKey, { balance: val, timestamp: Date.now() });
            return val;
          }
        }
      }
      balanceCache.set(cacheKey, { balance: 0, timestamp: Date.now() });
      return 0; // The address genuinely holds none of this coin.
    } finally {
      inFlightBalance.delete(cacheKey);
    }
  })();

  inFlightBalance.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function executeFaucetCall(recipient: string, amountUsdc: number = 500): Promise<{
  success: boolean;
  digest: string;
  explorerUrl: string;
}> {
  const rawAmount = String(Math.round(amountUsdc * 1_000_000));
  const args = [
    "client",
    "call",
    "--package",
    PACKAGE_ID,
    "--module",
    "mock_usdc",
    "--function",
    "faucet",
    "--args",
    TREASURY_CAP_ID,
    rawAmount,
    recipient,
    "--gas-budget",
    "50000000",
    "--json",
  ];

  const result = parseCliJson(await runSui(args));

  // Invalidate any cached balance for this recipient so fresh reads see the minted coins
  balanceCache.forEach((_, key) => {
    if (key.startsWith(recipient.toLowerCase())) {
      balanceCache.delete(key);
    }
  });

  return {
    success: result.effects?.status?.status === "success",
    digest: result.digest,
    explorerUrl: `https://suiscan.xyz/testnet/tx/${result.digest}`,
  };
}

export async function executeReleaseMilestoneCall(
  vaultId: string,
  gonkaRequestId: string,
  truthScore: number
): Promise<{
  success: boolean;
  digest: string;
  explorerUrl: string;
}> {
  const typeArg = `${PACKAGE_ID}::mock_usdc::MOCK_USDC`;
  const args = [
    "client",
    "call",
    "--package",
    PACKAGE_ID,
    "--module",
    "escrow",
    "--function",
    "release_audited_milestone",
    "--type-args",
    typeArg,
    "--args",
    vaultId,
    gonkaRequestId,
    String(truthScore),
    "--gas-budget",
    "50000000",
    "--json",
  ];

  const result = parseCliJson(await runSui(args));

  return {
    success: result.effects?.status?.status === "success",
    digest: result.digest,
    explorerUrl: `https://suiscan.xyz/testnet/tx/${result.digest}`,
  };
}
