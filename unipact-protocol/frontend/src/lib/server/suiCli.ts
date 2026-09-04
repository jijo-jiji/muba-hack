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

  const { stdout } = await execFileAsync(SUI_EXE, args);
  const jsonIndex = stdout.indexOf("{");
  if (jsonIndex === -1) {
    throw new Error(`Unexpected CLI output: ${stdout}`);
  }
  const result = JSON.parse(stdout.substring(jsonIndex));

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

  const { stdout } = await execFileAsync(SUI_EXE, args);
  const jsonIndex = stdout.indexOf("{");
  if (jsonIndex === -1) {
    throw new Error(`Unexpected CLI output: ${stdout}`);
  }
  const result = JSON.parse(stdout.substring(jsonIndex));

  return {
    success: result.effects?.status?.status === "success",
    digest: result.digest,
    explorerUrl: `https://suiscan.xyz/testnet/tx/${result.digest}`,
  };
}
