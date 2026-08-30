"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types";
import { generateAIContent } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { consumeAiCredit } from "@/lib/quota";
import { toActionError } from "@/lib/errors";
import { jobDescriptionInput, shortTextInput, uuidInput } from "@/lib/schemas";

export interface SavedCoverLetter {
  id: string;
  jobTitle: string;
  company: string;
  content: string;
  createdAt: string;
}

/**
 * Generate a cover letter from the user's Vault and persist it.
 *
 * Persisting matters: generation costs an AI credit and several seconds, and
 * before this the result lived only in component state — closing the tab threw
 * it away.
 */
export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<ActionResponse<SavedCoverLetter>> {
  try {
    const userId = await requireWritableUserId();
    const title = shortTextInput.parse(jobTitle);
    const employer = shortTextInput.parse(company);
    const jd = jobDescriptionInput.parse(jobDescription);

    const vaultItems = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const vaultContext = vaultItems
      .map((item) => {
        const bulletPoints = (item.bulletPoints as string[]) || [];
        const content = Array.isArray(bulletPoints)
          ? bulletPoints.map((bp: string) => `- ${bp}`).join("\n")
          : "";
        return `[${item.type.toUpperCase()}] ${item.title || "Experience"}\n${content}`;
      })
      .join("\n\n");

    const prompt = `
    You are an expert career coach and copywriter.
    Write a highly professional, engaging, and concise cover letter for the candidate.

    JOB TITLE: ${title}
    COMPANY: ${employer}

    --- JOB DESCRIPTION ---
    ${jd.substring(0, 5000)}

    --- CANDIDATE'S EXPERIENCE (THE VAULT) ---
    ${vaultContext ? vaultContext.substring(0, 8000) : "The candidate has not provided detailed experience yet, but highlight their enthusiasm to learn and grow."}

    INSTRUCTIONS:
    - Return ONLY the cover letter text. No JSON, no markdown fences, no pleasantries like "Here is the letter".
    - Do not use placeholders like "[Your Name]". Write the letter as if ready to send (leave name as a generic sign-off if unknown).
    - Keep it under 400 words. Focus on how the candidate's specific Vault experience perfectly matches the Job Description.
    - Be persuasive, confident, and professional.
    `;

    // Prose, not JSON, so this bypasses generateAIObject — charge explicitly.
    await consumeAiCredit(userId);
    const result = await generateAIContent({ prompt, jsonMode: false });

    const saved = await prisma.coverLetter.create({
      data: {
        userId,
        jobTitle: title,
        company: employer,
        jobDescription: jd,
        content: result.text.trim(),
      },
    });

    revalidatePath("/dashboard/cover-letter");

    return {
      success: true,
      data: {
        id: saved.id,
        jobTitle: saved.jobTitle,
        company: saved.company,
        content: saved.content,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Cover letter generation failed. Please try again.");
  }
}

export async function getCoverLetters(): Promise<ActionResponse<SavedCoverLetter[]>> {
  try {
    const userId = await requireSyncedUserId();

    const letters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: letters.map((l) => ({
        id: l.id,
        jobTitle: l.jobTitle,
        company: l.company,
        content: l.content,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return toActionError(error, "Could not load your cover letters.");
  }
}

export async function deleteCoverLetter(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const letterId = uuidInput.parse(id);

    // deleteMany scoped by userId: a delete for someone else's row affects
    // zero rows instead of throwing, and cannot touch data it shouldn't.
    const { count } = await prisma.coverLetter.deleteMany({
      where: { id: letterId, userId },
    });
    if (count === 0) return { success: false, error: "Cover letter not found." };

    revalidatePath("/dashboard/cover-letter");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete that cover letter.");
  }
}
