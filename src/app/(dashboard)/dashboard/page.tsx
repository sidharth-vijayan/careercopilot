import { getResumes } from "@/actions/resumes";
import { getOverviewStats } from "@/actions/stats";
import {
  OnboardingChecklist,
  OverviewClient,
} from "@/components/dashboard/overview-client";

export const metadata = {
  title: "Overview · CareerCopilot",
};

export default async function DashboardPage() {
  const [resumesResult, statsResult] = await Promise.all([
    getResumes(),
    getOverviewStats(),
  ]);

  const resumes = resumesResult.success ? resumesResult.data ?? [] : [];
  const stats = statsResult.success ? statsResult.data : undefined;

  return (
    <div className="space-y-6">
      {stats && (
        <OnboardingChecklist
          hasResume={stats.resumeCount > 0}
          vaultCount={stats.vaultCount}
          hasAnalysis={stats.analysisCount > 0}
        />
      )}

      {!resumesResult.success && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {resumesResult.error}
        </div>
      )}

      <OverviewClient resumes={resumes} />
    </div>
  );
}
