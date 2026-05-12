import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button variant="secondary" className="relative h-8 w-8 rounded-full border border-border">
          <span className="sr-only">User Menu</span>
          <span className="font-medium text-xs">U</span>
        </Button>
      </div>
    </header>
  );
}
