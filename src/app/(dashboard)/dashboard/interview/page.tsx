import { getResumes } from "@/actions/resumes";
import { getInterviewSessions } from "@/actions/interview";
import { InterviewClient } from "@/components/dashboard/interview-client";

export const metadata = {
  title: "Interview Prep · Recut",
};

export default async function InterviewPage() {
  const [resumesResult, sessionsResult] = await Promise.all([
    getResumes(),
    getInterviewSessions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Interview Prep
        </h2>
        <p className="text-muted-foreground">
          Practice the questions this role will actually ask you, and get graded on
          your answers.
        </p>
      </div>

      <InterviewClient
        resumes={resumesResult.success ? resumesResult.data ?? [] : []}
        sessions={sessionsResult.success ? sessionsResult.data ?? [] : []}
      />
    </div>
  );
}
