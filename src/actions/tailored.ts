"use server";

import crypto from "crypto";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import { tailoredResumeSchema, uuidInput, type TailoredResumeData } from "@/lib/schemas";

export interface TailoredDraft {
  id: string;
  jobTitle: string;
  company: string;
  shareId: string | null;
  createdAt: string;
  data: TailoredResumeData | null;
}

/** Stored JSON predates the current schema in some rows, so parse defensively. */
function parseDraftData(raw: unknown): TailoredResumeData | null {
  const parsed = tailoredResumeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function getTailoredResumes(): Promise<ActionResponse<TailoredDraft[]>> {
  try {
    const userId = await requireSyncedUserId();

    const drafts = await prisma.tailoredResume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: drafts.map((d) => ({
        id: d.id,
        jobTitle: d.jobTitle,
        company: d.company,
        shareId: d.shareId,
        createdAt: d.createdAt.toISOString(),
        data: parseDraftData(d.tailoredData),
      })),
    };
  } catch (error) {
    return toActionError(error, "Could not load your tailored resumes.");
  }
}

export async function deleteTailoredResume(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const draftId = uuidInput.parse(id);

    const { count } = await prisma.tailoredResume.deleteMany({
      where: { id: draftId, userId },
    });
    if (count === 0) return { success: false, error: "Draft not found." };

    revalidatePath("/dashboard/tailored");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete that draft.");
  }
}

/**
 * Publish or unpublish a draft at /r/<shareId>.
 *
 * The id is a fresh 16-byte random token rather than the row's UUID, so a
 * public link can be revoked (and re-issued as a different URL) without the
 * draft's primary key ever being guessable from it.
 */
export async function setTailoredResumeShared(
  id: string,
  shared: boolean
): Promise<ActionResponse<{ shareId: string | null }>> {
  try {
    const userId = await requireWritableUserId();
    const draftId = uuidInput.parse(id);

    const draft = await prisma.tailoredResume.findFirst({
      where: { id: draftId, userId },
      select: { id: true, shareId: true },
    });
    if (!draft) return { success: false, error: "Draft not found." };

    // Re-publishing keeps the existing link so previously shared URLs survive.
    const shareId = shared
      ? (draft.shareId ?? crypto.randomBytes(16).toString("hex"))
      : null;

    await prisma.tailoredResume.update({
      where: { id: draft.id },
      data: { shareId },
    });

    revalidatePath("/dashboard/tailored");
    return { success: true, data: { shareId } };
  } catch (error) {
    return toActionError(error, "Could not update sharing for that draft.");
  }
}

/** Public read for /r/[shareId]. Intentionally unauthenticated. */
export async function getSharedResume(shareId: string): Promise<{
  jobTitle: string;
  company: string;
  ownerName: string;
  data: TailoredResumeData;
} | null> {
  // Guard the shape before querying so arbitrary path segments never reach the DB.
  if (!/^[a-f0-9]{32}$/.test(shareId)) return null;

  const draft = await prisma.tailoredResume.findUnique({
    where: { shareId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!draft) return null;

  const data = parseDraftData(draft.tailoredData);
  if (!data) return null;

  return {
    jobTitle: draft.jobTitle,
    company: draft.company,
    // Only the display name is exposed publicly — never the account email.
    ownerName: draft.user.name?.trim() || "Candidate",
    data,
  };
}
