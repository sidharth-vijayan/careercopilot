import { getResumes } from "@/actions/resumes";
import { ResumesClient } from "@/components/dashboard/resumes-client";

export default async function ResumesPage() {
  const res = await getResumes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          My Resumes
        </h2>
        <p className="text-muted-foreground">
          View and manage your uploaded resumes and their analysis history.
        </p>
      </div>

      <ResumesClient initialResumes={res.success ? res.data ?? [] : []} />
    </div>
  );
}
