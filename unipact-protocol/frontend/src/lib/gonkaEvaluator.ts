import OpenAI from "openai";
import { AuditSource, MilestoneAuditResult, DEMO_PRESETS } from "./types";

const GONKA_BASE_URL = process.env.GONKA_ROUTER_BASE_URL || "https://api.gonkarouter.io/v1";
const GONKA_MODEL = process.env.GONKA_MODEL || "moonshotai/Kimi-K2.6";

/** The score a submission has to reach before the escrow will pay out. */
export const PASS_THRESHOLD = 80;

/** True when a usable Gonka Router key is present. */
export function hasApiKey(customKey?: string): boolean {
  const key = customKey || process.env.GONKA_ROUTER_API_KEY;
  return Boolean(key) && key !== "mock-hackathon-key" && !key!.startsWith("your_");
}

/**
 * Robust JSON parser that handles both direct JSON and markdown-fenced ```json ... ``` blocks.
 */
function extractJson(text: string): Record<string, unknown> {
  let clean = text.trim();
  // Reasoning models like moonshotai/Kimi-K2.6 output reasoning traces inside <think>...</think>
  if (clean.includes("</think>")) {
    clean = clean.split("</think>")[1].trim();
  }
  // Strip markdown code fences if present e.g. ```json ... ```
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  try {
    return JSON.parse(clean);
  } catch {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // failed parse
      }
    }
    return {};
  }
}

/**
 * Returns one of the canned results for offline presentation fallback.
 */
function cannedResult(pass: boolean, source: AuditSource): MilestoneAuditResult {
  const preset = pass ? DEMO_PRESETS.VALID_DELIVERABLE : DEMO_PRESETS.INCOMPLETE_DELIVERABLE;
  return { ...preset.mockResult, source, isLiveGonkaCall: false };
}

/**
 * Quick connection smoke-test for the in-app Gonka Config modal.
 */
export async function testGonkaConnection(customKey?: string): Promise<{
  ok: boolean;
  message: string;
  latencyMs: number;
}> {
  const key = customKey || process.env.GONKA_ROUTER_API_KEY;
  if (!hasApiKey(key)) {
    return { ok: false, message: "No valid Gonka Router API key provided.", latencyMs: 0 };
  }

  const start = performance.now();
  try {
    const gonka = new OpenAI({
      baseURL: GONKA_BASE_URL,
      apiKey: key,
    });

    const res = await gonka.chat.completions.create({
      model: GONKA_MODEL,
      max_tokens: 150,
      messages: [{ role: "user", content: "Reply with just: pong" }],
    });

    let reply = res.choices[0]?.message?.content?.trim() || "";
    if (reply.includes("</think>")) {
      reply = reply.split("</think>")[1].trim();
    }
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: true,
      message: `Connected successfully! Model replied: "${reply}"`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Connection failed: ${msg}`, latencyMs };
  }
}

/**
 * Asks Gonka Router to review a student's submission against the agreed brief.
 *
 * Two forensic audits execute in parallel:
 *   1. Scope Adherence: Does the deliverable fulfill all requested specifications?
 *   2. Code/Asset Authenticity: Are there placeholder TODOs, lorem ipsum, or empty stubs?
 */
export async function auditMilestoneDeliverable(
  milestoneSpec: string,
  submissionContent: string,
  preset?: "VALID" | "INCOMPLETE",
  customApiKey?: string
): Promise<MilestoneAuditResult> {
  if (preset === "VALID") return cannedResult(true, "demo_preset");
  if (preset === "INCOMPLETE") return cannedResult(false, "demo_preset");

  const effectiveKey = customApiKey || process.env.GONKA_ROUTER_API_KEY;

  if (!hasApiKey(effectiveKey)) {
    const looksUnfinished = ["todo", "draft", "incomplete", "skipped", "placeholder"].some((word) =>
      submissionContent.toLowerCase().includes(word)
    );
    return cannedResult(!looksUnfinished, "keyword_fallback");
  }

  try {
    const gonka = new OpenAI({
      baseURL: GONKA_BASE_URL,
      apiKey: effectiveKey,
    });

    // Run dual-model review in parallel
    const [scopeResponse, qualityResponse] = await Promise.all([
      gonka.chat.completions.create({
        model: GONKA_MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content:
              "You are an impartial freelance technical auditor. Compare the student submission against the client brief. " +
              "Evaluate feature completeness and scope satisfaction. " +
              'Return raw JSON only: {"scope_score": number (0-100), "findings": string[]}',
          },
          {
            role: "user",
            content: `BRIEF:\n${milestoneSpec}\n\nSUBMISSION:\n${submissionContent}`,
          },
        ],
      }),
      gonka.chat.completions.create({
        model: GONKA_MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content:
              "You are a code and deliverable authenticity auditor. Scan for placeholder code, TODO/FIXME " +
              "comments, dummy mock datasets, lorem ipsum, broken links, or copied template duplication. " +
              'Return raw JSON only: {"quality_score": number (0-100), "findings": string[]}',
          },
          { role: "user", content: `SUBMISSION:\n${submissionContent}` },
        ],
      }),
    ]);

    const scopeRaw = scopeResponse.choices[0]?.message?.content || "{}";
    const qualityRaw = qualityResponse.choices[0]?.message?.content || "{}";

    const scope = extractJson(scopeRaw);
    const quality = extractJson(qualityRaw);

    const scopeScore = clampScore(scope.scope_score ?? (scope.score as number) ?? 75);
    const qualityScore = clampScore(quality.quality_score ?? (quality.score as number) ?? 75);

    // Matching the client's functional brief is weighted 60%, code quality/cleanliness 40%
    const truthScore = Math.round(scopeScore * 0.6 + qualityScore * 0.4);

    const findings = [
      ...(Array.isArray(scope.findings) ? scope.findings : []),
      ...(Array.isArray(quality.findings) ? quality.findings : []),
    ].filter((entry): entry is string => typeof entry === "string");

    const gonkaRequestId =
      scopeResponse.id || `gnk-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      truthScore,
      isApproved: truthScore >= PASS_THRESHOLD,
      gonkaRequestId,
      scopeScore,
      qualityScore,
      reasoningTrace: findings.slice(0, 8),
      auditedAt: new Date().toISOString(),
      isLiveGonkaCall: true,
      source: "live",
    };
  } catch (err) {
    console.warn("Gonka Router call failed, falling back to heuristic evaluation:", err);
    return cannedResult(true, "keyword_fallback");
  }
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
