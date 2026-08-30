import { getCoverLetters } from "@/actions/cover-letter";
import { CoverLetterClient } from "@/components/dashboard/cover-letter-client";

export const metadata = {
  title: "Cover Letters · CareerCopilot",
};

export default async function CoverLetterPage() {
  const result = await getCoverLetters();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Cover Letters
        </h2>
        <p className="text-muted-foreground">
          Drafted from your Vault experience and the job description, then saved.
        </p>
      </div>

      <CoverLetterClient letters={result.success ? result.data ?? [] : []} />
    </div>
  );
}
