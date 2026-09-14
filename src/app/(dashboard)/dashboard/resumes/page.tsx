import { getResumes } from "@/actions/resumes";
import { ResumesClient } from "@/components/dashboard/resumes-client";

export const metadata = {
  title: "My Resumes · Recut",
};

export default async function ResumesPage() {
  const result = await getResumes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          My Resumes
        </h2>
        <p className="text-muted-foreground">
          Your uploaded resumes. The default one is used across the dashboard.
        </p>
      </div>

      {result.success ? (
        <ResumesClient resumes={result.data ?? []} />
      ) : (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error}
        </div>
      )}
    </div>
  );
}
