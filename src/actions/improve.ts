"use server";

import { ActionResponse } from "@/types";
import { generateAIContent } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUserId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume Feedback — full AI analysis of a resume's quality
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeFeedbackResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  warnings: {
    severity: "low" | "medium" | "high";
    category: string;
    message: string;
    suggestion: string;
  }[];
  formattingChecks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  bulletCritiques: {
    originalBullet: string;
    issue: string;
    improvedVersion: string;
  }[];
}

export async function getResumeFeedback(
  resumeId: string
): Promise<ActionResponse<ResumeFeedbackResult>> {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "No AI API key is configured." };
  }

  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId },
    });
    if (!resume) return { success: false, error: "Resume not found." };

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

    const result = await generateAIContent({ prompt, jsonMode: true });
    console.log(`[getResumeFeedback] Fulfilled by: ${result.provider}`);

    const data = JSON.parse(result.text) as ResumeFeedbackResult;
    return { success: true, data };
  } catch (error: any) {
    console.error("Resume feedback failed:", error);
    return {
      success: false,
      error: `AI analysis failed: ${error.message || "Unknown error"}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bullet Rewriter — generate alternative bullet point versions
// ─────────────────────────────────────────────────────────────────────────────

export interface RewriteOption {
  label: string;
  rewrite: string;
}

export async function rewriteBulletPoint(
  bulletText: string,
  context?: string
): Promise<ActionResponse<RewriteOption[]>> {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "No AI API key is configured." };
  }

  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (!bulletText.trim()) {
      return { success: false, error: "Bullet text is required." };
    }

    const prompt = `
You are an expert resume writer. Rewrite the following resume bullet point in 4 different styles.
Each rewrite should be a single concise bullet point (1–2 lines max).

${context ? `Context about the role/project: ${context}` : ""}

Return ONLY a JSON array matching this schema:
[
  {
    "label": "Quantified Impact",
    "rewrite": string // version emphasizing metrics, numbers, percentages
  },
  {
    "label": "Action-Oriented",
    "rewrite": string // version with strong action verbs (Spearheaded, Architected, etc.)
  },
  {
    "label": "Concise & Punchy",
    "rewrite": string // shorter, tighter version
  },
  {
    "label": "Technical Depth",
    "rewrite": string // version highlighting technical details, tools, and technologies
  }
]

--- ORIGINAL BULLET ---
${bulletText}
`;

    const result = await generateAIContent({ prompt, jsonMode: true });
    console.log(`[rewriteBulletPoint] Fulfilled by: ${result.provider}`);

    const data = JSON.parse(result.text) as RewriteOption[];
    return { success: true, data };
  } catch (error: any) {
    console.error("Bullet rewrite failed:", error);
    return {
      success: false,
      error: `AI rewrite failed: ${error.message || "Unknown error"}`,
    };
  }
}
