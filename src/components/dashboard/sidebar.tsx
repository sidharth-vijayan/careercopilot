"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, Settings, Database, Sparkles, MessageSquarePlus, Wand2 } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "The Vault 🏦", href: "/dashboard/vault", icon: Database },
  { name: "Instant Tailor ⚡", href: "/dashboard/tailor", icon: Sparkles },
  { name: "AI Improver 📝", href: "/dashboard/improve", icon: Wand2 },
  { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-4 py-6 hidden md:flex">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8">
        <BrandIcon size="sm" />
        <span className="font-bold text-xl tracking-tight text-foreground">CareerCopilot</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t">
        <a 
          href="mailto:feedback@careercopilot.app?subject=Feedback%20%2F%20Feature%20Request"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Report Bug / Suggest Feature
        </a>
      </div>
    </div>
  );
}
