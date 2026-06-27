"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import { getUserProfile } from "@/actions/user";
import { LogOut, Settings, User, Loader2 } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<{ name: string | null; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the logged-in user profile details on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          setUserData({
            name: response.data.name,
            email: response.data.email,
          });
        }
      } catch (err) {
        console.error("Failed to load user profile in header:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Gracefully close the dropdown menu when clicking outside of it
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // Extract avatar initial letter
  const getInitial = () => {
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    if (userData?.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ModeToggle />
        
        {/* User Account Menu Container */}
        <div className="relative user-menu-container">
          <Button 
            variant="secondary" 
            onClick={() => setIsOpen(!isOpen)}
            className="relative h-9 w-9 rounded-full border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors focus:ring-2 focus:ring-primary/20"
          >
            <span className="sr-only">Toggle User Menu</span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="font-semibold text-xs text-primary">{getInitial()}</span>
            )}
          </Button>

          {/* Stateful Dropdown Popover */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-60 rounded-xl border bg-card p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150 ease-out origin-top-right">
              {/* User Identity Details */}
              <div className="px-3.5 py-3 border-b flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Signed in as
                </p>
                {isLoading ? (
                  <div className="space-y-1.5 py-1">
                    <div className="h-3 bg-muted rounded animate-pulse w-32" />
                    <div className="h-2.5 bg-muted rounded animate-pulse w-40" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-foreground truncate">
                      {userData?.name || "Professional"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {userData?.email || "user@example.com"}
                    </p>
                  </>
                )}
              </div>

              {/* Menu Links */}
              <div className="py-1.5 flex flex-col gap-0.5">
                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="border-t pt-1.5 mt-0.5">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
