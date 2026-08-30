"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { ALL_NAV_ITEMS } from "@/components/dashboard/nav-items";

/**
 * ⌘K / Ctrl+K quick navigation.
 *
 * Reads the same NAV_SECTIONS list as the sidebar, so new pages appear here
 * automatically rather than needing a second registration.
 */
export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_NAV_ITEMS;
    return ALL_NAV_ITEMS.filter((item) => item.name.toLowerCase().includes(q));
  }, [query]);

  // Clamped at render rather than reset from an effect: a narrowed result list
  // can leave `highlighted` past the end, and correcting that in an effect
  // would cost an extra render pass on every keystroke.
  const activeIndex = Math.min(highlighted, Math.max(0, results.length - 1));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setHighlighted(0);
          }
          return !wasOpen;
        });
        return;
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focusing an input is a DOM effect, not state synchronisation.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const go = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(Math.min(results.length - 1, activeIndex + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(Math.max(0, activeIndex - 1));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex].href);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick navigation"
        className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Jump to…"
            aria-label="Search pages"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No pages match &ldquo;{query}&rdquo;.
            </li>
          ) : (
            results.map((item, i) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    i === activeIndex
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.name}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
          <kbd className="font-sans font-semibold">↑↓</kbd> to navigate ·{" "}
          <kbd className="font-sans font-semibold">↵</kbd> to open ·{" "}
          <kbd className="font-sans font-semibold">esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
