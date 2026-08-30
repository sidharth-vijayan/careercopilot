"use server";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types";
import { generateAIObject } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import {
  jobDescriptionInput,
  tailoredResumeSchema,
  uuidInput,
  vaultItemInput,
  type TailoredResumeData,
} from "@/lib/schemas";

export interface VaultItem {
  id: string;
  type: string;
  title: string;
  bulletPoints: string[];
  createdAt: string;
}

// 🏦 CRUD: Get all Vault Items
export async function getVaultItems(): Promise<ActionResponse<VaultItem[]>> {
  try {
    const userId = await requireSyncedUserId();

    const items = await prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        bulletPoints: Array.isArray(item.bulletPoints)
          ? (item.bulletPoints as string[])
          : [],
        createdAt: item.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return toActionError(error, "Failed to load Vault items.");
  }
}

// 🏦 CRUD: Save (Create/Update) Vault Item
export async function saveVaultItem(
  id: string | undefined,
  type: "experience" | "project" | "skill",
  title: string,
  bulletPoints: string[]
): Promise<ActionResponse<{ id: string }>> {
  try {
    const userId = await requireWritableUserId();
    const input = vaultItemInput.parse({ id, type, title, bulletPoints });

    if (input.id) {
      // updateMany scoped by userId so another user's row can never be hit.
      const { count } = await prisma.vaultItem.updateMany({
        where: { id: input.id, userId },
        data: {
          type: input.type,
          title: input.title,
          bulletPoints: input.bulletPoints,
        },
      });
      if (count === 0) return { success: false, error: "Vault item not found." };

      revalidatePath("/dashboard/vault");
      return { success: true, data: { id: input.id } };
    }

    const created = await prisma.vaultItem.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        bulletPoints: input.bulletPoints,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/vault");
    return { success: true, data: created };
  } catch (error) {
    return toActionError(error, "Failed to save item.");
  }
}

// 🏦 CRUD: Delete Vault Item
export async function deleteVaultItem(id: string): Promise<ActionResponse<void>> {
  try {
    const userId = await requireWritableUserId();
    const itemId = uuidInput.parse(id);

    const { count } = await prisma.vaultItem.deleteMany({
      where: { id: itemId, userId },
    });
    if (count === 0) return { success: false, error: "Vault item not found." };

    revalidatePath("/dashboard/vault");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Failed to delete item.");
  }
}

// ⚡ AI Tailoring Engine
export async function tailorVaultWithAI(
  jobDescription: string
): Promise<ActionResponse<TailoredResumeData & { id: string }>> {
  try {
    const userId = await requireWritableUserId();
    const jd = jobDescriptionInput.parse(jobDescription);

    // 1. Fetch user's entire experience database (Vault)
    const vaultItems = await prisma.vaultItem.findMany({ where: { userId } });

    if (vaultItems.length === 0) {
      return {
        success: false,
        error:
          "Your Vault is currently empty! Please add your past experiences and skills in the 'The Vault' tab first.",
      };
    }

    // 2. Prepare Vault content for the LLM
    const vaultString = vaultItems
      .map((item) => {
        const bullets = Array.isArray(item.bulletPoints)
          ? (item.bulletPoints as string[]).map((b) => `- ${b}`).join("\n")
          : "";
        return `[ID: ${item.id}] TYPE: ${item.type.toUpperCase()} | TITLE: ${item.title}\n${bullets}`;
      })
      .join("\n\n---\n\n");

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
      "projects": [ /* same shape as experiences */ ],
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
    ${jd.substring(0, 10000)}
    `;

    const { data } = await generateAIObject({
      prompt,
      schema: tailoredResumeSchema,
      userId,
      label: "tailor",
    });

    // 3. Save the tailored draft to the database
    const savedDraft = await prisma.tailoredResume.create({
      data: {
        userId,
        jobTitle: data.jobTitle,
        company: data.company,
        tailoredData: data,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/tailored");

    return { success: true, data: { ...data, id: savedDraft.id } };
  } catch (error) {
    return toActionError(error, "AI tailoring failed. Please try again.");
  }
}
