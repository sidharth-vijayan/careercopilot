"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, Sparkles } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import {
  MobileDrawer,
  MobileNavTrigger,
  useMobileDrawer,
} from "@/components/dashboard/mobile-nav";
import { ALL_NAV_ITEMS, isNavItemActive } from "@/components/dashboard/nav-items";
import type { UserProfile } from "@/actions/user";

/**
 * The profile is resolved by the server layout and passed in, rather than
 * fetched here on mount — that removes a request waterfall on every page and
 * stops the header flashing a spinner during navigation.
 */
export function Header({ profile }: { profile: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { open, openDrawer, closeDrawer } = useMobileDrawer();

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".user-menu-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const title =
    ALL_NAV_ITEMS.find((item) => isNavItemActive(item.href, pathname))?.name ??
    "Dashboard";

  const initial =
    profile?.name?.charAt(0).toUpperCase() ??
    profile?.email?.charAt(0).toUpperCase() ??
    "U";

  const quota = profile?.quota;
  const quotaLow = quota ? quota.remaining <= 3 : false;

  return (
    <>
      <header className="flex h-16 items-center justify-between gap-2 border-b bg-card px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNavTrigger onOpen={openDrawer} />
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {quota && !profile?.isDemo && (
            <Link
              href="/dashboard/settings"
              title={`${quota.used} of ${quota.limit} AI generations used today. Resets at midnight UTC.`}
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:inline-flex ${
                quotaLow
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {quota.remaining} left today
            </Link>
          )}

          <ModeToggle />

          <div className="user-menu-container relative">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border shadow-sm transition-colors hover:bg-muted focus:ring-2 focus:ring-primary/20"
            >
              <span className="sr-only">Toggle user menu</span>
              <span className="text-xs font-semibold text-primary">{initial}</span>
            </Button>

            {isOpen && (
              <div className="absolute right-0 z-50 mt-2.5 w-60 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-xl border bg-card p-1.5 shadow-lg duration-150 ease-out">
                <div className="flex flex-col gap-0.5 border-b px-3.5 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="truncate text-sm font-bold text-foreground">
                    {profile?.name || "Professional"}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {profile?.email ?? "—"}
                  </p>
                  {quota && (
                    <p className="mt-2 text-xs text-muted-foreground sm:hidden">
                      {quota.remaining} of {quota.limit} AI generations left today
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 py-1.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="mt-0.5 border-t pt-1.5">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-bold text-destructive transition-all duration-200 hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileDrawer open={open} onClose={closeDrawer} />
    </>
  );
}
