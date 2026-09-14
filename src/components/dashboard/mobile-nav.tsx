"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { BrandIcon } from "@/components/brand-icon";
import {
  NAV_SECTIONS,
  PRIMARY_NAV_ITEMS,
  isNavItemActive,
} from "@/components/dashboard/nav-items";

/**
 * Mobile navigation: a bottom bar for the five most-used destinations, plus a
 * full drawer behind the header's menu button for everything else.
 *
 * Before this the dashboard was simply unreachable on a phone — the sidebar was
 * `hidden md:flex` with nothing in its place.
 */
export function MobileNavTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open navigation menu"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Escape to close, and freeze background scrolling while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon size="sm" />
            <span className="font-bold tracking-tight text-foreground">
              Recut
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {NAV_SECTIONS.map((section, i) => (
            <div key={section.label ?? `section-${i}`} className="space-y-1">
              {section.label && (
                <h2 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </h2>
              )}
              {section.items.map((item) => {
                const isActive = isNavItemActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    // Closed from the click rather than a pathname effect:
                    // navigation is the event, so no state sync is needed.
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

/** Persistent bottom tab bar for the primary destinations. */
export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="max-w-full truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Convenience wrapper owning the drawer's open state for the header. */
export function useMobileDrawer() {
  const [open, setOpen] = useState(false);
  return {
    open,
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false),
  };
}
