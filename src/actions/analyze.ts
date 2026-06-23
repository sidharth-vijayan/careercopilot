"use server";

import { ActionResponse } from "@/types";
import { generateAIContent } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUserIdAndSupabase() {
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
  return { userId: user?.id };
}

export async function analyzeResumeWithAI(
  resumeId: string, 
  jobDescription: string,
  overrideResumeText?: string
): Promise<ActionResponse<any>> {
  // At least one AI provider must be configured
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "No AI API key is configured. Set GEMINI_API_KEY or GROQ_API_KEY in your environment." };
  }

  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    let resumeText = overrideResumeText;

    if (!resumeText) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId }
      });
      if (!resume) {
        return { success: false, error: "Resume not found" };
      }
      resumeText = resume.parsedText;
    }

    const prompt = `
    You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
    Analyze the candidate's resume against the provided job description.
    
    Return ONLY a JSON object matching this exact schema:
    {
      "jobTitle": string, // the job title/role extracted from the job description (e.g., "Software Engineering Intern")
      "company": string, // the company name extracted from the job description, if missing use "Unknown"
      "matchScore": number, // an integer from 0 to 100 representing how well the resume matches the JD
      "summary": string, // a 2-sentence summary of the candidate's fit
      "missingSkills": string[], // top 5 critical skills missing from the resume
      "matchingSkills": string[], // top 5 critical skills present in both
      "actionableFeedback": [
        {
          "category": string, // e.g., "Experience", "Formatting", "Impact"
          "suggestion": string // specific advice to improve the resume
        }
      ]
    }

    --- RESUME ---
    ${resumeText.substring(0, 10000)}

    --- JOB DESCRIPTION ---
    ${jobDescription.substring(0, 10000)}
    `;

    const result = await generateAIContent({ prompt, jsonMode: true });
    console.log(`[analyzeResumeWithAI] Fulfilled by: ${result.provider}`);

    const data = JSON.parse(result.text);

    // Save analysis to DB
    await prisma.jobAnalysis.create({
      data: {
        userId,
        resumeId,
        jobTitle: data.jobTitle || "Unknown Role",
        company: data.company || "Unknown Company",
        jobDescription,
        matchScore: data.matchScore || 0,
        analysisData: data
      }
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    return { success: false, error: `AI analysis failed: ${error.message || "Unknown error"}. Please check your API keys.` };
  }
}
