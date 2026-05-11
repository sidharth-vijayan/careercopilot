import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary">CareerCopilot</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">How it Works</Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button variant="secondary" className="hidden sm:flex">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
