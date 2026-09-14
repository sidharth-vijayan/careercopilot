import { NextResponse, type NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Keeps the Supabase project from being paused.
 *
 * Supabase pauses free-tier projects after ~7 days without activity, and
 * purges them a few months later — which is how the first incarnation of this
 * project lost all its data. A single query a day is enough to count as
 * activity, so `vercel.json` points a daily cron at this route.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when that
 * variable is set on the project. Without it the route is still harmless, but
 * setting it stops strangers opening a database connection on your behalf.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    // Worth a loud log: if this fails for a week the project gets paused.
    console.error("[keepalive] database ping failed:", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
