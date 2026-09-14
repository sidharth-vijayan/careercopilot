"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";

import { BrandIcon } from "@/components/brand-icon";
import { NAV_SECTIONS, isNavItemActive } from "@/components/dashboard/nav-items";
import { SITE } from "@/lib/site";

/**
 * Desktop sidebar. Hidden below `md`, where `MobileNav` takes over — the two
 * render from the same NAV_SECTIONS list.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="px-4 py-6">
        <Link href="/" className="flex items-center gap-2 px-2">
          <BrandIcon size="sm" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Recut
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4" aria-label="Main">
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
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        {/* recut.app is not a domain we own, so the address that used to
            be hardcoded here dropped every report on the floor. */}
        <a
          href={`mailto:${SITE.contactEmail}?subject=Recut%20feedback`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          Report Bug / Suggest Feature
        </a>
      </div>
    </aside>
  );
}
