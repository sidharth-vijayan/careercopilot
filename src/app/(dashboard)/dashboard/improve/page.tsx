import { getResumes } from "@/actions/resumes";
import { ImproveClient } from "@/components/dashboard/improve-client";

export default async function ImprovePage() {
  const res = await getResumes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          AI Resume Improver
        </h2>
        <p className="text-muted-foreground">
          Get AI-powered feedback on your resume and rewrite weak bullet points
          instantly.
        </p>
      </div>

      <ImproveClient initialResumes={res.success ? res.data ?? [] : []} />
    </div>
  );
}
