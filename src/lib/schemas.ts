import { z } from "zod";

/**
 * Validation schemas, split by trust level.
 *
 * AI OUTPUT schemas are deliberately *lenient*: models return "85" instead of
 * 85, or a score of 105, and failing the whole response over that would burn a
 * retry for nothing. Coerce and clamp what is safely coercible; only reject
 * what is genuinely unusable.
 *
 * USER INPUT schemas are deliberately *strict*: this is a trust boundary on the
 * public internet, and everything here is either persisted or forwarded to a
 * paid AI provider.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** 0–100, tolerant of stringified and out-of-range values from a model. */
const score = z.coerce
  .number()
  .transform((n) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0))));

/** Model responses sometimes omit a list entirely; treat that as empty. */
const stringList = z.array(z.string()).default([]);

// ---------------------------------------------------------------------------
// AI output — resume ↔ JD analysis
// ---------------------------------------------------------------------------

export const analysisSchema = z.object({
  jobTitle: z.string().default("Unknown Role"),
  company: z.string().default("Unknown Company"),
  matchScore: score,
  summary: z.string().default(""),
  missingSkills: stringList,
  matchingSkills: stringList,
  actionableFeedback: z
    .array(
      z.object({
        category: z.string(),
        suggestion: z.string(),
      })
    )
    .default([]),
});
export type Analysis = z.infer<typeof analysisSchema>;

// ---------------------------------------------------------------------------
// AI output — resume feedback
// ---------------------------------------------------------------------------

export const resumeFeedbackSchema = z.object({
  overallScore: score,
  summary: z.string().default(""),
  strengths: stringList,
  warnings: z
    .array(
      z.object({
        // Models drift to "critical"/"minor"; map anything unknown to medium
        // rather than discarding an otherwise-good response.
        severity: z
          .string()
          .transform((s) => {
            const v = s.toLowerCase();
            return v === "low" || v === "high" ? v : "medium";
          })
          .pipe(z.enum(["low", "medium", "high"])),
        category: z.string(),
        message: z.string(),
        suggestion: z.string(),
      })
    )
    .default([]),
  formattingChecks: z
    .array(
      z.object({
        label: z.string(),
        passed: z.coerce.boolean(),
        detail: z.string().default(""),
      })
    )
    .default([]),
  bulletCritiques: z
    .array(
      z.object({
        originalBullet: z.string(),
        issue: z.string(),
        improvedVersion: z.string(),
      })
    )
    .default([]),
});
export type ResumeFeedback = z.infer<typeof resumeFeedbackSchema>;

// ---------------------------------------------------------------------------
// AI output — bullet rewriter
// ---------------------------------------------------------------------------

/**
 * Wrapped in an object rather than returned as a bare array: Groq's
 * `response_format: json_object` rejects a top-level array, so the original
 * array-shaped prompt could never be served by the fallback provider.
 */
export const bulletRewritesSchema = z.object({
  rewrites: z
    .array(
      z.object({
        label: z.string(),
        rewrite: z.string(),
      })
    )
    .min(1),
});
export type BulletRewrites = z.infer<typeof bulletRewritesSchema>;

// ---------------------------------------------------------------------------
// AI output — tailored resume
// ---------------------------------------------------------------------------

const tailoredEntrySchema = z.object({
  vaultItemId: z.string().default(""),
  title: z.string().default("Untitled"),
  originalBullets: stringList,
  tailoredBullets: stringList,
});

export const tailoredResumeSchema = z.object({
  jobTitle: z.string().default("Tailored Position"),
  company: z.string().default("Target Company"),
  justification: z.string().default(""),
  experiences: z.array(tailoredEntrySchema).default([]),
  projects: z.array(tailoredEntrySchema).default([]),
  skills: z
    .array(
      z.object({
        category: z.string(),
        items: stringList,
      })
    )
    .default([]),
});
export type TailoredResumeData = z.infer<typeof tailoredResumeSchema>;

// ---------------------------------------------------------------------------
// AI output — interview prep
// ---------------------------------------------------------------------------

export const interviewQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        category: z
          .string()
          .transform((s) => (s.toLowerCase().startsWith("tech") ? "technical" : "behavioral"))
          .pipe(z.enum(["technical", "behavioral"])),
        question: z.string(),
        rationale: z.string().default(""),
      })
    )
    .min(1),
});
export type InterviewQuestions = z.infer<typeof interviewQuestionsSchema>;

export const answerFeedbackSchema = z.object({
  score: score,
  verdict: z.string().default(""),
  strengths: stringList,
  improvements: stringList,
  rewrittenAnswer: z.string().default(""),
});
export type AnswerFeedback = z.infer<typeof answerFeedbackSchema>;

// ---------------------------------------------------------------------------
// User input — trust boundary. Strict.
// ---------------------------------------------------------------------------

/** Caps mirror the substring() limits the prompts already apply. */
export const jobDescriptionInput = z
  .string()
  .trim()
  .min(50, "That job description looks too short — paste the full posting.")
  .max(20000, "That job description is too long. Trim it to the essentials.");

export const shortTextInput = z.string().trim().min(1).max(200);
export const optionalShortText = z.string().trim().max(200).optional().or(z.literal(""));

export const bulletInput = z
  .string()
  .trim()
  .min(3, "A bullet point needs at least a few characters.")
  .max(2000, "That bullet point is too long.");

export const vaultItemInput = z.object({
  id: z.string().optional(),
  type: z.enum(["experience", "project", "skill"]),
  title: shortTextInput,
  bulletPoints: z
    .array(z.string().trim().max(2000))
    .max(30, "That's too many bullet points for one item.")
    .transform((list) => list.filter((b) => b.length > 0)),
});
export type VaultItemInput = z.infer<typeof vaultItemInput>;

export const applicationStatusInput = z.enum([
  "applied",
  "interview",
  "offer",
  "rejected",
  "saved",
]);

export const applicationInput = z.object({
  jobTitle: shortTextInput,
  company: shortTextInput,
  status: applicationStatusInput,
  matchScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
  jobDescription: z.string().trim().max(20000).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  appliedAt: z.string().optional(),
});

export const uuidInput = z.string().uuid("That identifier is not valid.");

/**
 * Collapse a ZodError into one human-readable line.
 * Server actions surface a single `error` string, not a field map.
 */
export function firstIssue(error: unknown): string | null {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "That input isn't valid.";
  }
  return null;
}
