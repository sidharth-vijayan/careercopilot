import { NextResponse, type NextRequest } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

/**
 * Keeps the Supabase project from being paused, and reports why if it can't.
 *
 * Supabase pauses free-tier projects after ~7 days without activity, and
 * purges them a few months later — which is how the first incarnation of this
 * project lost all its data. A single query a day counts as activity, so
 * `vercel.json` points a daily cron here.
 *
 * Uses `pg` directly rather than Prisma: this only needs `select 1`, and the
 * raw driver's error codes say *why* a connection failed.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when that
 * variable is set on the project. Without it the route still works, but
 * setting it stops strangers opening a database connection on your behalf.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Read the same variable two ways. A literal `process.env.DATABASE_URL` can
  // be replaced by the bundler at build time; a computed key cannot, so it is
  // always read from the live process. If these disagree, the value was
  // inlined during the build — which is what happens to a variable marked
  // "Sensitive" in Vercel, since those are withheld from the build step.
  const inlined = process.env.DATABASE_URL;
  const atRuntime = process.env[["DATABASE", "URL"].join("_")];

  const connectionString = inlined || atRuntime;
  // Lengths, not values: "absent" and "present but empty" are different
  // faults with the same symptom, and a length gives that away without
  // printing a password into a response body.
  const env = {
    inlined: inlined === undefined ? "absent" : inlined.length,
    atRuntime: atRuntime === undefined ? "absent" : atRuntime.length,
  };

  if (!connectionString) {
    return NextResponse.json(
      { ok: false, reason: "DATABASE_URL is not set", env },
      { status: 503 }
    );
  }

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 8000 });
  try {
    await pool.query("select 1");
    return NextResponse.json({ ok: true, at: new Date().toISOString(), env });
  } catch (error) {
    // Worth a loud log: if this fails for a week the project gets paused.
    console.error("[keepalive] database ping failed:", error);

    // The code is safe to return — ENOTFOUND / ECONNREFUSED / 28P01 say
    // whether the host is wrong, refused, or the password rejected. The
    // message is withheld, because that one can carry the connection string.
    const code =
      error instanceof Error && "code" in error ? String(error.code) : "unknown";
    return NextResponse.json({ ok: false, code, env }, { status: 503 });
  } finally {
    await pool.end().catch(() => {});
  }
}
