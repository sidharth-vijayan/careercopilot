"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the dashboard.
 *
 * Without this, an unhandled render error replaces the whole app with Next's
 * default error screen and the only way out is a manual reload. `reset()`
 * re-renders the failed segment while leaving the shell intact.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        This page failed to load. Trying again usually fixes it — if it doesn&apos;t,
        the database or AI provider may be temporarily unavailable.
      </p>
      {error.digest && (
        <code className="mt-3 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          Reference: {error.digest}
        </code>
      )}
      <Button onClick={reset} className="mt-5">
        <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
