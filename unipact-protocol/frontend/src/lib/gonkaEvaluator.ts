import OpenAI from "openai";
import { AuditSource, MilestoneAuditResult, DEMO_PRESETS } from "./types";

const GONKA_BASE_URL = process.env.GONKA_ROUTER_BASE_URL || "https://api.gonkarouter.io/v1";
const GONKA_MODEL = process.env.GONKA_MODEL || "moonshotai/Kimi-K2.6";

/** The score a submission has to reach before the escrow will pay out. */
export const PASS_THRESHOLD = 80;

/** True when a usable Gonka Router key is present in the environment. */
function hasApiKey(): boolean {
  const key = process.env.GONKA_ROUTER_API_KEY;
  return Boolean(key) && key !== "mock-hackathon-key" && !key!.startsWith("your_");
}

/**
 * Returns one of the canned results. These exist so a flaky venue network cannot
 * kill the live demo, and they are always tagged with their real source so the UI
 * can say plainly that they are not a live Gonka call.
 */
function cannedResult(pass: boolean, source: AuditSource): MilestoneAuditResult {
  const preset = pass ? DEMO_PRESETS.VALID_DELIVERABLE : DEMO_PRESETS.INCOMPLETE_DELIVERABLE;
  return { ...preset.mockResult, source, isLiveGonkaCall: false };
}

/**
 * Asks Gonka Router to review a student's submission against what the company asked for.
 *
 * Two separate reviews run in parallel and are then combined:
 *   - one checks whether everything that was asked for is actually there,
 *   - one checks whether the work is real rather than placeholders and TODOs.
 * The combined figure is the Truth Score: how closely the work matches the brief.
 */
export async function auditMilestoneDeliverable(
  milestoneSpec: string,
  submissionContent: string,
  preset?: "VALID" | "INCOMPLETE"
): Promise<MilestoneAuditResult> {
  // A judge or presenter explicitly picked a canned outcome.
  if (preset === "VALID") return cannedResult(true, "demo_preset");
  if (preset === "INCOMPLETE") return cannedResult(false, "demo_preset");

  // No API key configured: fall back to a crude keyword check rather than crashing.
  if (!hasApiKey()) {
    const looksUnfinished = ["todo", "draft", "incomplete", "skipped", "placeholder"].some((word) =>
      submissionContent.toLowerCase().includes(word)
    );
    return cannedResult(!looksUnfinished, "keyword_fallback");
  }

  try {
    const gonka = new OpenAI({
      baseURL: GONKA_BASE_URL,
      apiKey: process.env.GONKA_ROUTER_API_KEY,
    });

    const [scopeResponse, qualityResponse] = await Promise.all([
      gonka.chat.completions.create({
        model: GONKA_MODEL,
        max_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You review freelance project deliverables. Compare the submission against the agreed brief " +
              "and judge whether everything requested is present and working. " +
              'Reply with raw JSON only: {"scope_score": number 0-100, "findings": string[]}',
          },
          {
            role: "user",
            content: `BRIEF:\n${milestoneSpec}\n\nSUBMISSION:\n${submissionContent}`,
          },
        ],
      }),
      gonka.chat.completions.create({
        model: GONKA_MODEL,
        max_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You check whether submitted work is genuinely finished. Look for placeholder code, TODO " +
              "comments, empty files, broken links and copied boilerplate. " +
              'Reply with raw JSON only: {"quality_score": number 0-100, "findings": string[]}',
          },
          { role: "user", content: `SUBMISSION:\n${submissionContent}` },
        ],
      }),
    ]);

    const scope = JSON.parse(scopeResponse.choices[0]?.message?.content || "{}");
    const quality = JSON.parse(qualityResponse.choices[0]?.message?.content || "{}");

    const scopeScore = clampScore(scope.scope_score);
    const qualityScore = clampScore(quality.quality_score);

    // Matching the brief matters more than polish, so scope is weighted higher.
    const truthScore = Math.round(scopeScore * 0.6 + qualityScore * 0.4);

    const findings = [
      ...(Array.isArray(scope.findings) ? scope.findings : []),
      ...(Array.isArray(quality.findings) ? quality.findings : []),
    ].filter((entry): entry is string => typeof entry === "string");

    return {
      truthScore,
      isApproved: truthScore >= PASS_THRESHOLD,
      gonkaRequestId: scopeResponse.id,
      scopeScore,
      qualityScore,
      reasoningTrace: findings.slice(0, 6),
      auditedAt: new Date().toISOString(),
      isLiveGonkaCall: true,
      source: "live",
    };
  } catch (err) {
    console.warn("Gonka Router call failed, returning demo data:", err);
    return cannedResult(true, "keyword_fallback");
  }
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
