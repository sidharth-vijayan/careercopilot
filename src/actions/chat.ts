"use server";

import { ActionResponse } from "@/types";
import { generateAIContent } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import { requireWritableUserId } from "@/lib/auth";
import { consumeAiCredit } from "@/lib/quota";
import { toActionError } from "@/lib/errors";
import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const questionInput = z
  .string()
  .trim()
  .min(3, "Ask a question first.")
  .max(2000, "That question is too long.");

const historyInput = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(8000),
    })
  )
  // Only the recent turns are sent; the whole transcript would grow the prompt
  // without bound and is mostly irrelevant by then.
  .max(20)
  .default([]);

/**
 * Answer a career question with the user's own resume and Vault as context.
 *
 * Deliberately grounded: the prompt forbids inventing experience the user
 * doesn't have, because the answers here feed straight into what they say to
 * employers.
 */
export async function askCareerQuestion(
  question: string,
  history: ChatMessage[] = []
): Promise<ActionResponse<{ answer: string }>> {
  try {
    const userId = await requireWritableUserId();
    const q = questionInput.parse(question);
    const priorTurns = historyInput.parse(history).slice(-8);

    const [resume, vaultItems] = await Promise.all([
      prisma.resume.findFirst({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: { parsedText: true },
      }),
      prisma.vaultItem.findMany({ where: { userId }, take: 40 }),
    ]);

    const vaultContext = vaultItems
      .map((item) => {
        const bullets = Array.isArray(item.bulletPoints)
          ? (item.bulletPoints as string[]).map((b) => `- ${b}`).join("\n")
          : "";
        return `[${item.type.toUpperCase()}] ${item.title}\n${bullets}`;
      })
      .join("\n\n");

    const transcript = priorTurns
      .map((m) => `${m.role === "user" ? "CANDIDATE" : "COACH"}: ${m.content}`)
      .join("\n\n");

    const prompt = `
You are a blunt, experienced career coach talking to this specific candidate.

Ground every answer in the candidate's actual resume and Vault below. If they
ask whether they're qualified for something, give them a straight answer
including when it's "not yet" — false encouragement wastes their time. Never
invent experience, employers or metrics they haven't given you. If the context
doesn't contain what you'd need, say so and ask for it.

Keep answers under 250 words. Use plain prose or short bullet lists. No preamble,
no "great question", no markdown headers.

--- CANDIDATE'S RESUME ---
${resume?.parsedText?.substring(0, 6000) ?? "No resume uploaded yet."}

--- CANDIDATE'S VAULT ---
${vaultContext ? vaultContext.substring(0, 6000) : "The Vault is empty."}
${transcript ? `\n--- CONVERSATION SO FAR ---\n${transcript}\n` : ""}
--- CANDIDATE'S QUESTION ---
${q}
`;

    await consumeAiCredit(userId);
    const result = await generateAIContent({ prompt, jsonMode: false });

    return { success: true, data: { answer: result.text.trim() } };
  } catch (error) {
    return toActionError(error, "Couldn't answer that. Please try again.");
  }
}
