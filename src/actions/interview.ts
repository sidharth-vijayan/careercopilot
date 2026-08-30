"use server";

import crypto from "crypto";

import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/types";
import { generateAIObject } from "@/lib/ai-provider";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import {
  answerFeedbackSchema,
  interviewQuestionsSchema,
  jobDescriptionInput,
  shortTextInput,
  uuidInput,
  type AnswerFeedback,
} from "@/lib/schemas";

export interface InterviewQuestion {
  id: string;
  category: "technical" | "behavioral";
  question: string;
  rationale: string;
  answer?: string;
  feedback?: AnswerFeedback;
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  createdAt: string;
}

/** Narrow the free-form `questions` JSON column back to our shape. */
function parseQuestions(raw: unknown): InterviewQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (q): q is InterviewQuestion =>
      !!q && typeof q === "object" && typeof (q as InterviewQuestion).id === "string"
  );
}

export async function createInterviewSession(
  resumeId: string,
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<ActionResponse<InterviewSession>> {
  try {
    const userId = await requireWritableUserId();
    const id = uuidInput.parse(resumeId);
    const title = shortTextInput.parse(jobTitle);
    const employer = shortTextInput.parse(company);
    const jd = jobDescriptionInput.parse(jobDescription);

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      select: { parsedText: true },
    });
    if (!resume) return { success: false, error: "Resume not found." };

    const prompt = `
You are a senior hiring manager preparing to interview this candidate for the role below.

Generate 8 interview questions this specific candidate is likely to be asked:
- 4 technical questions drawn from the skills the job requires, weighted toward gaps
  or claims in the candidate's resume that an interviewer would probe.
- 4 behavioral questions grounded in the candidate's actual experience.
- Ask what a real interviewer would ask. No generic filler like "tell me about yourself"
  unless the resume genuinely invites it.

Return ONLY a JSON object matching this schema:
{
  "questions": [
    {
      "category": "technical" | "behavioral",
      "question": string,   // the question itself
      "rationale": string   // one sentence: why this candidate gets asked this
    }
  ]
}

ROLE: ${title} at ${employer}

--- JOB DESCRIPTION ---
${jd.substring(0, 8000)}

--- CANDIDATE RESUME ---
${resume.parsedText.substring(0, 8000)}
`;

    const { data } = await generateAIObject({
      prompt,
      schema: interviewQuestionsSchema,
      userId,
      label: "interview-questions",
    });

    const questions: InterviewQuestion[] = data.questions.map((q) => ({
      id: crypto.randomUUID(),
      category: q.category,
      question: q.question,
      rationale: q.rationale,
    }));

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        jobTitle: title,
        company: employer,
        jobDescription: jd,
        // Prisma's Json input type doesn't accept a typed array directly.
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard/interview");

    return {
      success: true,
      data: {
        id: session.id,
        jobTitle: session.jobTitle,
        company: session.company,
        questions,
        createdAt: session.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Could not generate interview questions.");
  }
}

export async function answerInterviewQuestion(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<ActionResponse<AnswerFeedback>> {
  try {
    const userId = await requireWritableUserId();
    const id = uuidInput.parse(sessionId);

    const trimmed = answer.trim();
    if (trimmed.length < 20) {
      return {
        success: false,
        error: "Write a bit more before asking for feedback — at least a couple of sentences.",
      };
    }
    if (trimmed.length > 5000) {
      return { success: false, error: "That answer is too long." };
    }

    const session = await prisma.interviewSession.findFirst({
      where: { id, userId },
    });
    if (!session) return { success: false, error: "Interview session not found." };

    const questions = parseQuestions(session.questions);
    const target = questions.find((q) => q.id === questionId);
    if (!target) return { success: false, error: "Question not found." };

    const prompt = `
You are an experienced interview coach giving direct, useful feedback.

Evaluate the candidate's answer to this ${target.category} interview question for the
role of ${session.jobTitle} at ${session.company}.

Judge it the way an interviewer would: is it specific, structured, and evidenced?
For behavioral answers, look for concrete situation/action/result structure. For
technical answers, look for correctness and depth. Be honest — an inflated score
is useless to the candidate.

Return ONLY a JSON object matching this schema:
{
  "score": number,             // 0-100, how well this answer would land in a real interview
  "verdict": string,           // one blunt sentence summarising the answer's quality
  "strengths": string[],       // 1-3 things the answer genuinely does well
  "improvements": string[],    // 2-4 specific, actionable fixes
  "rewrittenAnswer": string    // a stronger version, using ONLY facts the candidate gave
}

--- QUESTION ---
${target.question}

--- CANDIDATE'S ANSWER ---
${trimmed}
`;

    const { data: feedback } = await generateAIObject({
      prompt,
      schema: answerFeedbackSchema,
      userId,
      label: "interview-feedback",
    });

    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, answer: trimmed, feedback } : q
    );

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { questions: updated as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/dashboard/interview");
    return { success: true, data: feedback };
  } catch (error) {
    return toActionError(error, "Could not review that answer.");
  }
}

export async function getInterviewSessions(): Promise<
  ActionResponse<InterviewSession[]>
> {
  try {
    const userId = await requireSyncedUserId();

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return {
      success: true,
      data: sessions.map((s) => ({
        id: s.id,
        jobTitle: s.jobTitle,
        company: s.company,
        questions: parseQuestions(s.questions),
        createdAt: s.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return toActionError(error, "Could not load your interview sessions.");
  }
}

export async function deleteInterviewSession(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const sessionId = uuidInput.parse(id);

    const { count } = await prisma.interviewSession.deleteMany({
      where: { id: sessionId, userId },
    });
    if (count === 0) return { success: false, error: "Session not found." };

    revalidatePath("/dashboard/interview");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete that session.");
  }
}
