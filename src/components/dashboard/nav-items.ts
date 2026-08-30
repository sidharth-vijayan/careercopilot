import {
  BarChart3,
  Briefcase,
  Database,
  FileText,
  LayoutDashboard,
  Layers,
  MessageCircle,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Shown on the mobile bottom bar (space for 5). */
  primary?: boolean;
}

export interface NavSection {
  label: string | null;
  items: NavItem[];
}

/**
 * Single source of truth for dashboard navigation, shared by the desktop
 * sidebar, the mobile drawer and the command palette — so a new page is added
 * in exactly one place.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard, primary: true },
    ],
  },
  {
    label: "Build",
    items: [
      { name: "The Vault", href: "/dashboard/vault", icon: Database, primary: true },
      { name: "Instant Tailor", href: "/dashboard/tailor", icon: Sparkles, primary: true },
      { name: "Tailored Drafts", href: "/dashboard/tailored", icon: Layers },
    ],
  },
  {
    label: "Improve",
    items: [
      { name: "AI Improver", href: "/dashboard/improve", icon: Wand2 },
      { name: "Interview Prep", href: "/dashboard/interview", icon: Mic, primary: true },
      { name: "Cover Letters", href: "/dashboard/cover-letter", icon: MessageSquare },
      { name: "Ask AI", href: "/dashboard/chat", icon: MessageCircle },
    ],
  },
  {
    label: "Track",
    items: [
      { name: "Applications", href: "/dashboard/applications", icon: Briefcase, primary: true },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Files",
    items: [
      { name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/** The five destinations shown in the mobile bottom bar. */
export const PRIMARY_NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter((i) => i.primary);

/**
 * Whether `href` is the active route.
 *
 * "/dashboard" would prefix-match every child route, so the index is compared
 * exactly and only deeper routes use prefix matching.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
