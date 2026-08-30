"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import { uuidInput } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export interface ResumeSummary {
  id: string;
  originalName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
  analysisCount: number;
  /**
   * Full extracted text. Carried in full rather than as a preview excerpt:
   * the resume editor round-trips this value back through updateResumeText,
   * so a truncated copy here would silently overwrite the stored resume.
   */
  parsedText: string;
}

export async function getResumes(): Promise<ActionResponse<ResumeSummary[]>> {
  try {
    const userId = await requireSyncedUserId();

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { analyses: true } } },
    });

    return {
      success: true,
      data: resumes.map((r) => ({
        id: r.id,
        originalName: r.originalName,
        fileUrl: r.fileUrl,
        isDefault: r.isDefault,
        createdAt: r.createdAt.toISOString(),
        analysisCount: r._count.analyses,
        parsedText: r.parsedText,
      })),
    };
  } catch (error) {
    return toActionError(error, "Could not load your resumes.");
  }
}

/** Mark one resume as the default used by Overview and Interview Prep. */
export async function setDefaultResume(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const resumeId = uuidInput.parse(id);

    const owned = await prisma.resume.count({ where: { id: resumeId, userId } });
    if (owned === 0) return { success: false, error: "Resume not found." };

    // Clear then set, in one transaction so there is never a moment with two
    // defaults (or none) visible to a concurrent read.
    await prisma.$transaction([
      prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.resume.updateMany({
        where: { id: resumeId, userId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/dashboard/resumes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not set that resume as default.");
  }
}

export async function deleteResume(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const resumeId = uuidInput.parse(id);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { id: true, fileUrl: true, isDefault: true },
    });
    if (!resume) return { success: false, error: "Resume not found." };

    // Analyses cascade via the schema's onDelete rule.
    await prisma.resume.delete({ where: { id: resume.id } });

    // Remove the stored file too, so deleting a resume doesn't quietly leave
    // the PDF sitting in the bucket forever. Storage failing is not worth
    // failing the whole delete over — the row is already gone.
    const objectPath = storagePathFromUrl(resume.fileUrl);
    if (objectPath) {
      try {
        const supabase = await createClient();
        await supabase.storage.from("resumes").remove([objectPath]);
      } catch (storageError) {
        console.warn("[resumes] orphaned storage object:", objectPath, storageError);
      }
    }

    // Deleting the default leaves the account with none; promote the newest.
    if (resume.isDefault) {
      const next = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await prisma.resume.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/dashboard/resumes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete that resume.");
  }
}

/**
 * Resolve the in-bucket object path for a stored resume.
 *
 * Uploads save `storageData.path` (e.g. "<userId>/<uuid>.pdf"), but rows
 * written by earlier versions may hold a full public URL, so accept both.
 */
function storagePathFromUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  const marker = "/object/public/resumes/";
  const idx = fileUrl.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(fileUrl.slice(idx + marker.length));

  // Already a bare path; anything else (an unrecognised URL) is not ours.
  return fileUrl.startsWith("http") ? null : fileUrl;
}
