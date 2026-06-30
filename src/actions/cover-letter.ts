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

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<ActionResponse<string>> {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "No AI API key is configured." };
  }

  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Fetch the user's Vault context
    const vaultItems = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const vaultContext = vaultItems.map(item => {
      const bulletPoints = (item.bulletPoints as string[]) || [];
      const content = Array.isArray(bulletPoints) ? bulletPoints.map((bp: string) => `- ${bp}`).join("\n") : "";
      return `[${item.type.toUpperCase()}] ${item.title || "Experience"}\n${content}`;
    }).join("\n\n");

    const prompt = `
    You are an expert career coach and copywriter.
    Write a highly professional, engaging, and concise cover letter for the candidate.
    
    JOB TITLE: ${jobTitle}
    COMPANY: ${company}
    
    --- JOB DESCRIPTION ---
    ${jobDescription.substring(0, 5000)}
    
    --- CANDIDATE'S EXPERIENCE (THE VAULT) ---
    ${vaultContext ? vaultContext.substring(0, 8000) : "The candidate has not provided detailed experience yet, but highlight their enthusiasm to learn and grow."}
    
    INSTRUCTIONS:
    - Return ONLY the cover letter text. No JSON, no markdown fences, no pleasantries like "Here is the letter".
    - Do not use placeholders like "[Your Name]". Write the letter as if ready to send (leave name as a generic sign-off if unknown).
    - Keep it under 400 words. Focus on how the candidate's specific Vault experience perfectly matches the Job Description.
    - Be persuasive, confident, and professional.
    `;

    const result = await generateAIContent({ prompt, jsonMode: false });
    
    return { success: true, data: result.text.trim() };
  } catch (error: any) {
    console.error("Cover Letter Generation failed:", error);
    return { success: false, error: `Generation failed: ${error.message || "Unknown error"}.` };
  }
}
