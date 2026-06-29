"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/brand-icon";

export function Navbar() {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 md:h-24 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-3.5">
            <BrandIcon size="lg" />
            <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-foreground">CareerCopilot</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-base md:text-lg font-semibold">
          <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">How it Works</Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
        </nav>
        <div className="flex items-center gap-5">
          <ModeToggle />
          <Link href="/signup">
            <Button className="h-12 px-6 text-base font-semibold">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
