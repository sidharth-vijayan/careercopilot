import "server-only";

import prisma from "@/lib/prisma";

/**
 * Per-user daily cap on AI calls.
 *
 * The app runs on the owner's own Gemini/Groq keys, so without a cap a single
 * signed-up stranger looping the bullet rewriter can exhaust the free tier and
 * take the app down for everyone. Override with DAILY_AI_LIMIT.
 */
export const DAILY_AI_LIMIT = Number(process.env.DAILY_AI_LIMIT ?? 20);

export class QuotaError extends Error {
  constructor(limit: number) {
    super(
      `You've used all ${limit} AI generations for today. The quota resets at midnight UTC.`
    );
    this.name = "QuotaError";
  }
}

/** Midnight UTC of the current day — the bucket key for the rolling quota. */
function currentBucket(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
}

/** Read-only view of today's usage. Safe to call from the UI. */
export async function getQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiCallsDate: true, aiCallsCount: true },
  });

  const bucket = currentBucket();
  // A stale bucket means the counter belongs to a previous day; treat as zero.
  const isStale =
    !user?.aiCallsDate || user.aiCallsDate.getTime() !== bucket.getTime();
  const used = isStale ? 0 : (user?.aiCallsCount ?? 0);

  return {
    used,
    limit: DAILY_AI_LIMIT,
    remaining: Math.max(0, DAILY_AI_LIMIT - used),
  };
}

/**
 * Reserve one AI call for `userId`, or throw QuotaError if the day is spent.
 * Call this *before* hitting a provider so a rejected request costs nothing.
 *
 * ponytail: two guarded UPDATEs rather than a transaction. The increment is
 * atomic (`count < limit` is evaluated by Postgres), so the cap can never be
 * exceeded; the only race is a same-millisecond rollover granting one extra
 * call at midnight. Wrap both in an interactive transaction if that ever
 * matters.
 */
export async function consumeAiCredit(userId: string): Promise<QuotaStatus> {
  const bucket = currentBucket();

  // Roll the counter over to today. Matches both a stale date and a fresh user
  // whose aiCallsDate is still NULL (SQL `NULL != value` is unknown, not true,
  // so the null case must be spelled out or new users would never reset).
  await prisma.user.updateMany({
    where: {
      id: userId,
      OR: [{ aiCallsDate: null }, { aiCallsDate: { not: bucket } }],
    },
    data: { aiCallsDate: bucket, aiCallsCount: 0 },
  });

  const claimed = await prisma.user.updateMany({
    where: { id: userId, aiCallsDate: bucket, aiCallsCount: { lt: DAILY_AI_LIMIT } },
    data: { aiCallsCount: { increment: 1 } },
  });

  if (claimed.count === 0) throw new QuotaError(DAILY_AI_LIMIT);

  return getQuota(userId);
}
