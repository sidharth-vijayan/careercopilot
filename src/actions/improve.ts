"use server";

import { ActionResponse } from "@/types";
import { generateAIObject } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { requireSyncedUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import {
  bulletInput,
  bulletRewritesSchema,
  optionalShortText,
  resumeFeedbackSchema,
  type ResumeFeedback,
} from "@/lib/schemas";

export type { ResumeFeedback } from "@/lib/schemas";
/** @deprecated Use `ResumeFeedback`. Kept so existing imports keep compiling. */
export type ResumeFeedbackResult = ResumeFeedback;

export interface RewriteOption {
  label: string;
  rewrite: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume Feedback — full AI analysis of a resume's quality
// ─────────────────────────────────────────────────────────────────────────────

export async function getResumeFeedback(
  resumeId: string
): Promise<ActionResponse<ResumeFeedback>> {
  try {
    const userId = await requireSyncedUserId();

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { parsedText: true },
    });
    if (!resume) return { success: false, error: "Resume not found." };

    if (!resume.parsedText?.trim()) {
      return {
        success: false,
        error: "We couldn't read any text from that resume. Try re-uploading it.",
      };
    }

    const prompt = `
You are an elite resume reviewer, ATS expert, and career coach.
Analyze the following resume text and return ONLY a JSON object matching this exact schema:

{
  "overallScore": number, // 0-100
  "summary": string, // 2-3 sentence executive summary of resume quality
  "strengths": string[], // 3-5 things the resume does well
  "warnings": [
    {
      "severity": "low" | "medium" | "high",
      "category": string, // e.g. "Impact", "Brevity", "Keywords", "Formatting", "Structure"
      "message": string, // what's wrong
      "suggestion": string // specific fix
    }
  ], // 3-6 actionable warnings
  "formattingChecks": [
    {
      "label": string, // e.g. "Contact Information", "Consistent Tense", "Quantified Impact"
      "passed": boolean,
      "detail": string // explanation
    }
  ], // 5-8 formatting/structural checks
  "bulletCritiques": [
    {
      "originalBullet": string, // a weak bullet point from the resume (verbatim)
      "issue": string, // what's wrong with it
      "improvedVersion": string // a better rewrite
    }
  ] // pick the 3-5 weakest bullet points and improve them
}

--- RESUME ---
${resume.parsedText.substring(0, 12000)}
`;

    const { data } = await generateAIObject({
      prompt,
      schema: resumeFeedbackSchema,
      userId,
      label: "resume-feedback",
    });

    return { success: true, data };
  } catch (error) {
    return toActionError(error, "The resume review failed. Please try again.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bullet Rewriter — generate alternative bullet point versions
// ─────────────────────────────────────────────────────────────────────────────

export async function rewriteBulletPoint(
  bulletText: string,
  context?: string
): Promise<ActionResponse<RewriteOption[]>> {
  try {
    const userId = await requireSyncedUserId();
    const bullet = bulletInput.parse(bulletText);
    const ctx = optionalShortText.parse(context ?? "");

    const prompt = `
You are an expert resume writer. Rewrite the following resume bullet point in 4 different styles.
Each rewrite should be a single concise bullet point (1–2 lines max).

${ctx ? `Context about the role/project: ${ctx}` : ""}

Return ONLY a JSON object matching this schema:
{
  "rewrites": [
    { "label": "Quantified Impact", "rewrite": string },  // emphasizes metrics, numbers, percentages
    { "label": "Action-Oriented",   "rewrite": string },  // strong action verbs (Spearheaded, Architected, ...)
    { "label": "Concise & Punchy",  "rewrite": string },  // shorter, tighter version
    { "label": "Technical Depth",   "rewrite": string }   // highlights technical details, tools, technologies
  ]
}

--- ORIGINAL BULLET ---
${bullet}
`;

    const { data } = await generateAIObject({
      prompt,
      schema: bulletRewritesSchema,
      userId,
      label: "bullet-rewrite",
    });

    return { success: true, data: data.rewrites };
  } catch (error) {
    return toActionError(error, "The rewrite failed. Please try again.");
  }
}
