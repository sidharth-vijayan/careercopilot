"use server";

import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ActionResponse, ApplicationStatus, Application } from "@/types";

async function getUserId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function getApplications(): Promise<ActionResponse<Application[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const apps = await prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    });

    // Map Prisma models back to the Application type
    const mappedApps = apps.map(app => ({
      id: app.id,
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status as ApplicationStatus,
      matchScore: app.matchScore || undefined,
      appliedAt: app.appliedAt.toISOString(),
      notes: app.notes || undefined,
      jobDescription: app.jobDescription || undefined,
    }));

    return { success: true, data: mappedApps };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createApplication(data: Omit<Application, "id">): Promise<ActionResponse<Application>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Ensure user exists in Prisma DB (syncing from Supabase)
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      // Fetch user details from supabase
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
          }
        });
      }
    }

    const app = await prisma.application.create({
      data: {
        userId,
        jobTitle: data.jobTitle,
        company: data.company,
        status: data.status,
        matchScore: data.matchScore,
        jobDescription: data.jobDescription,
        appliedAt: new Date(data.appliedAt),
        notes: data.notes,
      }
    });

    return { success: true, data: { ...data, id: app.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<ActionResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.application.update({
      where: { id, userId },
      data: { status }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApplicationDetails(
  id: string,
  data: Partial<Omit<Application, "id" | "userId">>
): Promise<ActionResponse<Application>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const updated = await prisma.application.update({
      where: { id, userId },
      data: {
        jobTitle: data.jobTitle,
        company: data.company,
        status: data.status,
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
        notes: data.notes,
      }
    });

    const mapped: Application = {
      id: updated.id,
      jobTitle: updated.jobTitle,
      company: updated.company,
      status: updated.status as ApplicationStatus,
      matchScore: updated.matchScore || undefined,
      appliedAt: updated.appliedAt.toISOString(),
      notes: updated.notes || undefined,
      jobDescription: updated.jobDescription || undefined,
    };

    return { success: true, data: mapped };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteApplication(id: string): Promise<ActionResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.application.delete({
      where: { id, userId }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
