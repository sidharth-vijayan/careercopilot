"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ActionResponse, ApplicationStatus, Application } from "@/types";
import { requireSyncedUserId, requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import { applicationInput, applicationStatusInput, uuidInput } from "@/lib/schemas";

type ApplicationRow = {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  matchScore: number | null;
  appliedAt: Date;
  notes: string | null;
  jobDescription: string | null;
};

function toApplication(app: ApplicationRow): Application {
  return {
    id: app.id,
    jobTitle: app.jobTitle,
    company: app.company,
    status: app.status as ApplicationStatus,
    matchScore: app.matchScore ?? undefined,
    appliedAt: app.appliedAt.toISOString(),
    notes: app.notes ?? undefined,
    jobDescription: app.jobDescription ?? undefined,
  };
}

export async function getApplications(): Promise<ActionResponse<Application[]>> {
  try {
    const userId = await requireSyncedUserId();

    const apps = await prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: "desc" },
    });

    return { success: true, data: apps.map(toApplication) };
  } catch (error) {
    return toActionError(error, "Could not load your applications.");
  }
}

export async function createApplication(
  data: Omit<Application, "id">
): Promise<ActionResponse<Application>> {
  try {
    const userId = await requireWritableUserId();
    const input = applicationInput.parse(data);

    const app = await prisma.application.create({
      data: {
        userId,
        jobTitle: input.jobTitle,
        company: input.company,
        status: input.status,
        matchScore: input.matchScore ?? null,
        jobDescription: input.jobDescription ?? null,
        // An absent or unparseable date falls back to now rather than writing
        // an Invalid Date, which Postgres rejects outright.
        appliedAt: parseDate(input.appliedAt),
        notes: input.notes ?? null,
      },
    });

    revalidatePath("/dashboard/applications");
    return { success: true, data: toApplication(app) };
  } catch (error) {
    return toActionError(error, "Could not save that application.");
  }
}

function parseDate(value?: string): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const appId = uuidInput.parse(id);
    const nextStatus = applicationStatusInput.parse(status);

    const { count } = await prisma.application.updateMany({
      where: { id: appId, userId },
      data: { status: nextStatus },
    });
    if (count === 0) return { success: false, error: "Application not found." };

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not update that application.");
  }
}

export async function updateApplicationDetails(
  id: string,
  data: Partial<Omit<Application, "id">>
): Promise<ActionResponse<Application>> {
  try {
    const userId = await requireWritableUserId();
    const appId = uuidInput.parse(id);
    const input = applicationInput.partial().parse(data);

    const { count } = await prisma.application.updateMany({
      where: { id: appId, userId },
      data: {
        jobTitle: input.jobTitle,
        company: input.company,
        status: input.status,
        appliedAt: input.appliedAt ? parseDate(input.appliedAt) : undefined,
        notes: input.notes ?? undefined,
      },
    });
    if (count === 0) return { success: false, error: "Application not found." };

    const updated = await prisma.application.findUniqueOrThrow({ where: { id: appId } });

    revalidatePath("/dashboard/applications");
    return { success: true, data: toApplication(updated) };
  } catch (error) {
    return toActionError(error, "Could not update that application.");
  }
}

export async function deleteApplication(id: string): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const appId = uuidInput.parse(id);

    const { count } = await prisma.application.deleteMany({
      where: { id: appId, userId },
    });
    if (count === 0) return { success: false, error: "Application not found." };

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not delete that application.");
  }
}
