"use server";

import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/types";
import { z } from "zod";

export { createClient };

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200, "That password is too long."),
});

/**
 * Mirror the Supabase Auth user into our own `User` table.
 *
 * The two stores are independent: Supabase owns credentials, Postgres owns
 * application data. Any row with a `userId` foreign key fails to insert until
 * this row exists, so it is created at the first moment we hold a session.
 */
async function syncUserRow(id: string, email: string) {
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, email },
  });
}

export async function login(formData: FormData): Promise<ActionResponse> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    try {
      await syncUserRow(data.user.id, data.user.email!);
    } catch (dbError) {
      console.error("[auth] user sync failed on login:", dbError);
      return {
        success: false,
        error: "Signed in, but the database is unreachable. Please try again shortly.",
      };
    }
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData): Promise<ActionResponse> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  // With email confirmation enabled, signUp returns a user but no session.
  // Redirecting to /dashboard would bounce straight back to /login with no
  // explanation, so say what actually needs to happen instead.
  if (!data.session) {
    return {
      success: true,
      data: {
        message:
          "Check your inbox to confirm your email address, then sign in.",
        requiresConfirmation: true,
      },
    };
  }

  if (data.user) {
    try {
      await syncUserRow(data.user.id, data.user.email!);
    } catch (dbError) {
      console.error("[auth] user sync failed on signup:", dbError);
      return {
        success: false,
        error: "Account created, but the database is unreachable. Try signing in shortly.",
      };
    }
  }

  redirect("/dashboard");
}

/**
 * Sign in to the shared, read-only demo account.
 *
 * Recruiters and first-time visitors will not create an account to look at a
 * portfolio project, so the entire product has to be reachable without one.
 * The demo user is flagged `isDemo`, which makes every write path refuse.
 */
export async function loginAsDemo(): Promise<ActionResponse> {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    return {
      success: false,
      error: "The demo account isn't configured on this deployment.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth] demo sign-in failed:", error);
    return { success: false, error: "The demo is temporarily unavailable." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
