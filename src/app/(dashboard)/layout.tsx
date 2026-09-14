import Link from "next/link";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MobileBottomBar } from "@/components/dashboard/mobile-nav";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { getUserProfile } from "@/actions/user";

/**
 * Every dashboard route reads the session cookie, so none of them can be
 * statically rendered. Declaring it here stops the build from attempting a
 * static pass whose bail-out error would be caught by our own error handler.
 */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved once per navigation on the server and handed to the header, so no
  // page pays for a client-side profile fetch. `router.refresh()` after an AI
  // call re-runs this and updates the quota chip.
  const profileResult = await getUserProfile();
  const profile = profileResult.success ? profileResult.data ?? null : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* The sidebar is ~15 links deep; without this every page starts with a
          tab through all of them. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header profile={profile} />

        {profile?.isDemo && (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-400">
            <span>
              You&apos;re exploring the read-only demo — changes won&apos;t be saved.
            </span>
            <Link href="/signup" className="font-semibold underline underline-offset-2">
              Create a free account
            </Link>
          </div>
        )}

        {/* pb-24 on mobile clears the fixed bottom tab bar. */}
        <main id="main" tabIndex={-1} className="flex-1 overflow-y-auto bg-muted/30 p-4 pb-24 md:p-8">
          {children}
        </main>
      </div>
      <MobileBottomBar />
      <CommandPalette />
    </div>
  );
}
