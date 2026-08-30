import "server-only";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

/**
 * Thrown when there is no signed-in user. Every server action already wraps its
 * body in try/catch and returns `{ success: false, error }`, so throwing here
 * needs no extra handling at the call sites.
 */
export class AuthError extends Error {
  constructor(message = "Unauthorized. Please sign in again.") {
    super(message);
    this.name = "AuthError";
  }
}

/** Thrown when a demo account attempts a write. */
export class DemoError extends Error {
  constructor(message = "This is a read-only demo. Sign up for a free account to make changes.") {
    super(message);
    this.name = "DemoError";
  }
}

/** The signed-in Supabase user, or null. Never throws. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/** The signed-in user's id. Throws AuthError when signed out. */
export async function requireUserId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new AuthError();
  return user.id;
}

/**
 * The signed-in user's id, guaranteeing a matching row exists in our own
 * `User` table first.
 *
 * Supabase Auth and our Postgres `User` table are separate stores: signing up
 * creates the former but not the latter, so any insert carrying a `userId`
 * foreign key fails until the row is synced. Use this in actions that write
 * rows referencing the user; use `requireUserId` for reads.
 */
export async function requireSyncedUserId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new AuthError();

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email! },
  });

  return user.id;
}

/** Like `requireSyncedUserId`, but rejects demo accounts. For write paths. */
export async function requireWritableUserId(): Promise<string> {
  const userId = await requireSyncedUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDemo: true },
  });
  if (user?.isDemo) throw new DemoError();
  return userId;
}

/** Full profile row for the signed-in user, created on first access. */
export async function requireUserProfile() {
  const user = await getSessionUser();
  if (!user) throw new AuthError();

  return prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email! },
  });
}
