"use server";

import prisma from "@/lib/prisma";
import { ActionResponse, ApplicationStatus } from "@/types";
import { requireSyncedUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";

export interface OverviewStats {
  resumeCount: number;
  vaultCount: number;
  analysisCount: number;
  applicationCount: number;
}

export async function getOverviewStats(): Promise<ActionResponse<OverviewStats>> {
  try {
    const userId = await requireSyncedUserId();

    const [resumeCount, vaultCount, analysisCount, applicationCount] =
      await Promise.all([
        prisma.resume.count({ where: { userId } }),
        prisma.vaultItem.count({ where: { userId } }),
        prisma.jobAnalysis.count({ where: { userId } }),
        prisma.application.count({ where: { userId } }),
      ]);

    return {
      success: true,
      data: { resumeCount, vaultCount, analysisCount, applicationCount },
    };
  } catch (error) {
    return toActionError(error, "Could not load your stats.");
  }
}

export interface AnalyticsData {
  totals: {
    applications: number;
    analyses: number;
    averageMatchScore: number | null;
    /** Share of applications that reached interview, offer or rejection. */
    responseRate: number | null;
    interviewRate: number | null;
  };
  funnel: { status: ApplicationStatus; label: string; count: number }[];
  applicationsOverTime: { month: string; count: number }[];
  matchScoreTrend: { date: string; score: number; label: string }[];
  scoreDistribution: { bucket: string; count: number }[];
  skillGaps: { skill: string; count: number }[];
  topCompanies: { company: string; count: number }[];
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const FUNNEL_ORDER: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export async function getAnalytics(): Promise<ActionResponse<AnalyticsData>> {
  try {
    const userId = await requireSyncedUserId();

    const [applications, analyses] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        orderBy: { appliedAt: "asc" },
        select: { status: true, appliedAt: true, company: true },
      }),
      prisma.jobAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          matchScore: true,
          createdAt: true,
          jobTitle: true,
          analysisData: true,
        },
      }),
    ]);

    // --- Funnel -------------------------------------------------------------
    const statusCounts = new Map<string, number>();
    for (const app of applications) {
      statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1);
    }
    const funnel = FUNNEL_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: statusCounts.get(status) ?? 0,
    }));

    // --- Applications over time --------------------------------------------
    const byMonth = new Map<string, number>();
    for (const app of applications) {
      const key = app.appliedAt.toISOString().slice(0, 7); // YYYY-MM
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    const applicationsOverTime = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
        count,
      }));

    // --- Match scores -------------------------------------------------------
    const matchScoreTrend = analyses.map((a) => ({
      date: a.createdAt.toISOString().slice(0, 10),
      score: a.matchScore,
      label: a.jobTitle,
    }));

    const buckets = [
      { bucket: "0–39", min: 0, max: 39 },
      { bucket: "40–59", min: 40, max: 59 },
      { bucket: "60–74", min: 60, max: 74 },
      { bucket: "75–89", min: 75, max: 89 },
      { bucket: "90–100", min: 90, max: 100 },
    ];
    const scoreDistribution = buckets.map(({ bucket, min, max }) => ({
      bucket,
      count: analyses.filter((a) => a.matchScore >= min && a.matchScore <= max).length,
    }));

    const averageMatchScore =
      analyses.length > 0
        ? Math.round(
            analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length
          )
        : null;

    // --- Skill gaps ---------------------------------------------------------
    // analysisData is free-form JSON written by the model, so every access is
    // guarded rather than trusted.
    const skillCounts = new Map<string, number>();
    for (const analysis of analyses) {
      const data = analysis.analysisData as { missingSkills?: unknown } | null;
      const missing = Array.isArray(data?.missingSkills) ? data.missingSkills : [];
      for (const raw of missing) {
        if (typeof raw !== "string") continue;
        const skill = raw.trim();
        if (!skill) continue;
        // Normalise case so "React"/"react" are one bar, keeping first spelling.
        const key = skill.toLowerCase();
        skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
      }
    }
    const skillGaps = [...skillCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({
        skill: skill.replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      }));

    // --- Companies ----------------------------------------------------------
    const companyCounts = new Map<string, number>();
    for (const app of applications) {
      const key = app.company.trim();
      if (key) companyCounts.set(key, (companyCounts.get(key) ?? 0) + 1);
    }
    const topCompanies = [...companyCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // --- Rates --------------------------------------------------------------
    // "Sent" excludes saved-but-not-applied rows, which would otherwise drag
    // the rate down for jobs the user never actually applied to.
    const sent = applications.filter((a) => a.status !== "saved").length;
    const interviews = funnel.find((f) => f.status === "interview")!.count;
    const offers = funnel.find((f) => f.status === "offer")!.count;
    const rejected = funnel.find((f) => f.status === "rejected")!.count;

    const responded = interviews + offers + rejected;

    return {
      success: true,
      data: {
        totals: {
          applications: applications.length,
          analyses: analyses.length,
          averageMatchScore,
          responseRate: sent > 0 ? Math.round((responded / sent) * 100) : null,
          interviewRate:
            sent > 0 ? Math.round(((interviews + offers) / sent) * 100) : null,
        },
        funnel,
        applicationsOverTime,
        matchScoreTrend,
        scoreDistribution,
        skillGaps,
        topCompanies,
      },
    };
  } catch (error) {
    return toActionError(error, "Could not load your analytics.");
  }
}
