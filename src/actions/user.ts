"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { requireUserProfile, requireWritableUserId } from "@/lib/auth";
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

/** Permanently delete the account and everything it owns. */
export async function deleteAccount(): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();

    // Every owned table cascades from User via the schema's onDelete rules.
    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete your account.");
  }
}

/** Everything we hold about the user, for the settings-page data export. */
export async function exportMyData(): Promise<ActionResponse<string>> {
  try {
    const user = await requireUserProfile();

    const [resumes, analyses, applications, vaultItems, tailored, coverLetters] =
      await Promise.all([
        prisma.resume.findMany({ where: { userId: user.id } }),
        prisma.jobAnalysis.findMany({ where: { userId: user.id } }),
        prisma.application.findMany({ where: { userId: user.id } }),
        prisma.vaultItem.findMany({ where: { userId: user.id } }),
        prisma.tailoredResume.findMany({ where: { userId: user.id } }),
        prisma.coverLetter.findMany({ where: { userId: user.id } }),
      ]);

    return {
      success: true,
      data: JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          profile: { id: user.id, email: user.email, name: user.name },
          resumes,
          analyses,
          applications,
          vaultItems,
          tailoredResumes: tailored,
          coverLetters,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return toActionError(error, "Could not export your data.");
  }
}
