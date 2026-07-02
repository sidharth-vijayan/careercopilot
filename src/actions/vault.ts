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

// 🏦 CRUD: Get all Vault Items
export async function getVaultItems(): Promise<ActionResponse<any[]>> {
  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    const items = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: items };
  } catch (error: any) {
    console.error("Failed to get Vault items:", error);
    return { success: false, error: "Failed to load Vault items." };
  }
}

// 🏦 CRUD: Save (Create/Update) Vault Item
export async function saveVaultItem(
  id: string | undefined,
  type: "experience" | "project" | "skill",
  title: string,
  bulletPoints: string[]
): Promise<ActionResponse<any>> {
  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (!title.trim()) {
      return { success: false, error: "Title is required." };
    }

    const filteredBullets = bulletPoints.filter(b => b.trim() !== "");

    if (id) {
      // Update
      const existing = await prisma.vaultItem.findUnique({
        where: { id, userId }
      });
      if (!existing) return { success: false, error: "Vault item not found." };

      const updated = await prisma.vaultItem.update({
        where: { id },
        data: {
          type,
          title,
          bulletPoints: filteredBullets
        }
      });
      return { success: true, data: updated };
    } else {
      // Create
      const created = await prisma.vaultItem.create({
        data: {
          userId,
          type,
          title,
          bulletPoints: filteredBullets
        }
      });
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Failed to save Vault item:", error);
    return { success: false, error: "Failed to save item." };
  }
}

// 🏦 CRUD: Delete Vault Item
export async function deleteVaultItem(id: string): Promise<ActionResponse<void>> {
  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    const existing = await prisma.vaultItem.findUnique({
      where: { id, userId }
    });
    if (!existing) return { success: false, error: "Vault item not found." };

    await prisma.vaultItem.delete({
      where: { id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete Vault item:", error);
    return { success: false, error: "Failed to delete item." };
  }
}

// ⚡ AI Tailoring Engine
export async function tailorVaultWithAI(
  jobDescription: string
): Promise<ActionResponse<any>> {
  // At least one AI provider must be configured
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "No AI API key is configured. Set GEMINI_API_KEY or GROQ_API_KEY in your environment." };
  }

  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    // 1. Fetch user's entire experience database (Vault)
    const vaultItems = await prisma.vaultItem.findMany({
      where: { userId }
    });

    if (vaultItems.length === 0) {
      return { 
        success: false, 
        error: "Your Vault is currently empty! Please add your past experiences and skills in the 'The Vault' tab first." 
      };
    }

    // 2. Prepare Vault content for the LLM
    const vaultString = vaultItems.map(item => {
      const bullets = Array.isArray(item.bulletPoints) 
        ? (item.bulletPoints as string[]).map(b => `- ${b}`).join("\n") 
        : "";
      return `[ID: ${item.id}] TYPE: ${item.type.toUpperCase()} | TITLE: ${item.title}\n${bullets}`;
    }).join("\n\n---\n\n");

    const prompt = `
    You are an elite ATS optimizer and professional resume writer.
    Your task is to select and optimize (tailor) the most relevant bullet points from the candidate's "Vault" (Experience/Projects/Skills database) to match the target job description.
    
    INSTRUCTIONS:
    1. Read the target Job Description to identify core keywords, required skills, and key responsibilities.
    2. Review the Candidate's Vault of past experiences, projects, and skills.
    3. SELECT the most relevant items (usually 2-3 work experiences and 1-2 projects, plus matching technical skills) that align best with the role.
    4. OPTIMIZE and rewrite the selected bullet points:
       - Incorporate target job keywords naturally.
       - Use strong action verbs (e.g., 'Architected', 'Spearheaded', 'Optimized').
       - Quantify impact where possible.
       - Do NOT make up new facts or fabricate companies, roles, or metrics. Stay grounded in the original details.
    5. Return ONLY a JSON object matching this exact schema:
    {
      "jobTitle": string, // extracted job title
      "company": string, // extracted company name
      "justification": string, // 2-sentence summary of the tailoring strategy
      "experiences": [
        {
          "vaultItemId": string, // matching VaultItem ID
          "title": string, // experience title
          "originalBullets": string[], // original bullet points selected
          "tailoredBullets": string[] // optimized, tailored bullet points matching the JD
        }
      ],
      "projects": [
        {
          "vaultItemId": string, // matching VaultItem ID
          "title": string, // project title
          "originalBullets": string[], // original bullet points selected
          "tailoredBullets": string[] // optimized, tailored bullet points matching the JD
        }
      ],
      "skills": [
        {
          "category": string, // e.g. "Languages", "Frontend", "Backend", "Cloud & DevOps"
          "items": string[] // relevant technical skill keywords present in the Vault that match the JD
        }
      ]
    }

    --- CANDIDATE VAULT ---
    ${vaultString}

    --- JOB DESCRIPTION ---
    ${jobDescription.substring(0, 10000)}
    `;

    const result = await generateAIContent({ prompt, jsonMode: true });
    console.log(`[tailorVaultWithAI] Fulfilled by: ${result.provider}`);

    const tailoredResult = JSON.parse(result.text);

    // 3. Save the tailored draft to the database
    const savedDraft = await prisma.tailoredResume.create({
      data: {
        userId,
        jobTitle: tailoredResult.jobTitle || "Tailored Position",
        company: tailoredResult.company || "Target Company",
        tailoredData: tailoredResult
      }
    });

    return { 
      success: true, 
      data: {
        id: savedDraft.id,
        ...tailoredResult
      } 
    };
  } catch (error: any) {
    console.error("AI Tailoring failed:", error);
    return { success: false, error: `AI tailoring failed: ${error.message || "Unknown error"}. Please check your API keys.` };
  }
}
