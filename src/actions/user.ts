"use server";

import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ActionResponse } from "@/types";

async function getUserIdAndSupabase() {
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
  return { userId: user?.id, user };
}

export async function getUserProfile(): Promise<ActionResponse<any>> {
  try {
    const { userId, user } = await getUserIdAndSupabase();
    if (!userId || !user) return { success: false, error: "Unauthorized" };

    let dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: user.email!,
        }
      });
    }

    return { success: true, data: dbUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(data: { name: string }): Promise<ActionResponse> {
  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
