"use server";

import { ActionResponse } from "@/types";
import { generateAIObject } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { requireSyncedUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import { analysisSchema, jobDescriptionInput, type Analysis } from "@/lib/schemas";

export async function analyzeResumeWithAI(
  resumeId: string,
  jobDescription: string,
  overrideResumeText?: string
): Promise<ActionResponse<Analysis & { id: string }>> {
  try {
    const userId = await requireSyncedUserId();
    const jd = jobDescriptionInput.parse(jobDescription);

    let resumeText = overrideResumeText;

    // Always confirm the resume belongs to this user, even when the caller
    // supplies the text: resumeId is written to the analysis row.
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { id: true, parsedText: true },
    });
    if (!resume) return { success: false, error: "Resume not found." };
    if (!resumeText) resumeText = resume.parsedText;

    if (!resumeText?.trim()) {
      return {
        success: false,
        error:
          "We couldn't read any text from that resume. Try re-uploading it, or paste the text manually.",
      };
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
    ${jd.substring(0, 10000)}
    `;

    const { data } = await generateAIObject({
      prompt,
      schema: analysisSchema,
      userId,
      label: "analyze",
    });

    const saved = await prisma.jobAnalysis.create({
      data: {
        userId,
        resumeId: resume.id,
        jobTitle: data.jobTitle,
        company: data.company,
        jobDescription: jd,
        matchScore: data.matchScore,
        analysisData: data,
      },
      select: { id: true },
    });

    return { success: true, data: { ...data, id: saved.id } };
  } catch (error) {
    return toActionError(error, "The analysis failed. Please try again.");
  }
}
