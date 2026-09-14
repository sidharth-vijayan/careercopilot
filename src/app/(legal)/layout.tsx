import Link from "next/link";

import { BrandIcon } from "@/components/brand-icon";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";

/**
 * Shared chrome and prose styling for the legal pages.
 *
 * The typography is applied with descendant selectors here rather than by
 * adding @tailwindcss/typography for three static pages.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandIcon size="sm" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              CareerCopilot
            </span>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main
        id="main"
        className="container mx-auto flex-1 px-4 py-12 md:px-8 md:py-16"
      >
        <article
          className="mx-auto max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground
            [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2
            [&_dd]:mb-3 [&_dd]:mt-0.5
            [&_dt]:font-semibold [&_dt]:text-foreground
            [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:sm:text-4xl
            [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground
            [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
            [&_li]:mb-1.5
            [&_p]:mb-4
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
            [&_td]:border-t [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top
            [&_th]:border-b [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground
            [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
        >
          {children}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
