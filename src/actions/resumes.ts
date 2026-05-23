"use server";

import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ActionResponse } from "@/types";

async function getUserId() {
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
  return user?.id;
}

export async function getResumes(): Promise<ActionResponse<any[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { analyses: true }
        }
      }
    });

    return { success: true, data: resumes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteResume(id: string): Promise<ActionResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Delete related analyses first
    await prisma.jobAnalysis.deleteMany({
      where: { resumeId: id, userId }
    });

    await prisma.resume.delete({
      where: { id, userId }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
