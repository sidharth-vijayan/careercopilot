import { getTailoredResumes } from "@/actions/tailored";
import { TailoredClient } from "@/components/dashboard/tailored-client";

export const metadata = {
  title: "Tailored Drafts · Recut",
};

export default async function TailoredPage() {
  const result = await getTailoredResumes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Tailored Drafts
        </h2>
        <p className="text-muted-foreground">
          Every resume Instant Tailor has built for you. Export as PDF or DOCX, or
          publish a link.
        </p>
      </div>

      {result.success ? (
        <TailoredClient drafts={result.data ?? []} />
      ) : (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error}
        </div>
      )}
    </div>
  );
}
