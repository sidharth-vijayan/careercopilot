import { ZodError } from "zod";

import { AuthError, DemoError } from "@/lib/auth";
import { QuotaError } from "@/lib/quota";
import { AIError } from "@/lib/ai-provider";
import { firstIssue } from "@/lib/schemas";
import type { ActionResponse } from "@/types";

/**
 * Map a thrown error to the `{ success: false, error }` shape every server
 * action returns.
 *
 * Errors we raise deliberately (validation, auth, quota, AI) carry messages
 * written for the user and are passed through. Anything else is a bug or an
 * infrastructure failure: it gets logged in full server-side and replaced with
 * a generic line, so database errors and connection strings never reach the
 * browser.
 *
 * Generic in T purely so it slots into any action's declared return type — it
 * only ever produces the error branch, which carries no `data`.
 */
export function toActionError<T = never>(
  error: unknown,
  fallback: string
): ActionResponse<T> {
  if (error instanceof ZodError) {
    return { success: false, error: firstIssue(error) ?? fallback };
  }

  if (
    error instanceof AuthError ||
    error instanceof DemoError ||
    error instanceof QuotaError ||
    error instanceof AIError
  ) {
    return { success: false, error: error.message };
  }

  console.error(`[action] ${fallback}:`, error);
  return { success: false, error: fallback };
}
