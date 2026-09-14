import Link from "next/link";

import { BrandIcon } from "@/components/brand-icon";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/terms#refunds", label: "Refunds" },
  { href: "/cookies", label: "Cookies" },
];

/**
 * Site footer. Carries the operator details and the legal links, which need to
 * be reachable from every public page rather than buried on one.
 */
export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandIcon size="sm" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Write your experience once, tailor it to every job. Run as a free
              personal project by {SITE.operator} in {SITE.location}.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Contact:{" "}
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {SITE.contactEmail}
              </a>
            </p>
          </div>

          <nav aria-label="Legal">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SITE.repoUrl}
                  className="text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                >
                  Source code
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE.operator}. {SITE.name} gives
          AI-generated writing suggestions. It is not a recruitment agency and
          does not provide legal, immigration or career-outcome guarantees.
        </p>
      </div>
    </footer>
  );
}
