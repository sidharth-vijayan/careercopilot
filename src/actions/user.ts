"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { requireUserProfile, requireWritableUserId } from "@/lib/auth";
import { storagePathFromUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { getQuota, type QuotaStatus } from "@/lib/quota";
import { toActionError } from "@/lib/errors";
import { z } from "zod";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  isDemo: boolean;
  quota: QuotaStatus;
}

/** Empty strings become null so the resume header omits the field entirely. */
const blankToNull = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v.length === 0 ? null : v))
    .nullable()
    .optional();

const profileInput = z.object({
  name: blankToNull(80, "That name is too long."),
  phone: blankToNull(40, "That phone number is too long."),
  location: blankToNull(120, "That location is too long."),
  linkedinUrl: blankToNull(200, "That URL is too long."),
  githubUrl: blankToNull(200, "That URL is too long."),
  websiteUrl: blankToNull(200, "That URL is too long."),
});

export type ProfileInput = z.input<typeof profileInput>;

export async function getUserProfile(): Promise<ActionResponse<UserProfile>> {
  try {
    const user = await requireUserProfile();
    const quota = await getQuota(user.id);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        websiteUrl: user.websiteUrl,
        isDemo: user.isDemo,
        quota,
      },
    };
  } catch (error) {
    return toActionError(error, "Could not load your profile.");
  }
}

export async function updateUserProfile(
  data: ProfileInput
): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const input = profileInput.parse(data);

    await prisma.user.update({ where: { id: userId }, data: input });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not save your settings.");
  }
}

/**
 * Remove the Supabase Auth identity behind `userId`.
 *
 * Supabase Auth and our Postgres `User` table are separate stores, so deleting
 * our row leaves the login — email address and password hash — sitting in the
 * auth store. That is not erasure, and the privacy policy promises erasure.
 *
 * Only the service-role key can delete an auth user, and it is read here on the
 * server and never sent anywhere near the browser. A deployment without the key
 * still deletes everything else and logs what was left behind.
 */
async function deleteAuthUser(userId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "[user] SUPABASE_SERVICE_ROLE_KEY is not set — the auth record for",
      userId,
      "survived account deletion and must be removed by hand."
    );
    return;
  }

  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const admin = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) console.error("[user] auth user delete failed:", error);
}

/** Permanently delete the account and everything it owns. */
export async function deleteAccount(): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();

    // Read the file paths before the rows cascade away. Afterwards nothing
    // points at those objects, and they would sit in the bucket holding the
    // personal data this button just promised to erase.
    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: { fileUrl: true },
    });

    // Every owned table cascades from User via the schema's onDelete rules.
    await prisma.user.delete({ where: { id: userId } });

    const paths = resumes
      .map((r) => storagePathFromUrl(r.fileUrl))
      .filter((path): path is string => path !== null);

    if (paths.length > 0) {
      try {
        // Still signed in at this point, so this runs as the owner under RLS.
        const supabase = await createClient();
        await supabase.storage.from("resumes").remove(paths);
      } catch (storageError) {
        console.warn("[user] orphaned storage objects:", paths, storageError);
      }
    }

    await deleteAuthUser(userId);

    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete your account.");
  }
}

/** Everything we hold about the user, for the settings-page data export. */
export async function exportMyData(): Promise<ActionResponse<string>> {
  try {
    const user = await requireUserProfile();

    const [
      resumes,
      analyses,
      applications,
      vaultItems,
      tailored,
      coverLetters,
      interviewSessions,
    ] = await Promise.all([
      prisma.resume.findMany({ where: { userId: user.id } }),
      prisma.jobAnalysis.findMany({ where: { userId: user.id } }),
      prisma.application.findMany({ where: { userId: user.id } }),
      prisma.vaultItem.findMany({ where: { userId: user.id } }),
      prisma.tailoredResume.findMany({ where: { userId: user.id } }),
      prisma.coverLetter.findMany({ where: { userId: user.id } }),
      prisma.interviewSession.findMany({ where: { userId: user.id } }),
    ]);

    return {
      success: true,
      data: JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          // Everything on the profile row, not a three-field summary: this file
          // is the answer to "give me my data".
          profile: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            location: user.location,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
            websiteUrl: user.websiteUrl,
            createdAt: user.createdAt,
          },
          resumes,
          analyses,
          applications,
          vaultItems,
          tailoredResumes: tailored,
          coverLetters,
          interviewSessions,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return toActionError(error, "Could not export your data.");
  }
}
