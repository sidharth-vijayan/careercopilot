import { getAnalytics } from "@/actions/stats";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";

export const metadata = {
  title: "Analytics · CareerCopilot",
};

export default async function AnalyticsPage() {
  const result = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h2>
        <p className="text-muted-foreground">
          What your applications and analyses say about your search.
        </p>
      </div>

      {result.success && result.data ? (
        <AnalyticsClient data={result.data} />
      ) : (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error ?? "Could not load your analytics."}
        </div>
      )}
    </div>
  );
}
