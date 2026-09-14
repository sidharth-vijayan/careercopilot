import { notFound } from "next/navigation";
import Link from "next/link";

import { getSharedResume } from "@/actions/tailored";
import { BrandIcon } from "@/components/brand-icon";

export const metadata = {
  title: "Resume · Recut",
  // A shared resume is a personal document; keep it out of search results even
  // though the link itself is unguessable.
  robots: { index: false, follow: false },
};

export default async function SharedResumePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const shared = await getSharedResume(shareId);

  if (!shared) notFound();

  const { data, ownerName, jobTitle, company } = shared;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <article className="mx-auto max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-10">
        <header className="border-b pb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {ownerName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tailored for {jobTitle} at {company}
          </p>
        </header>

        {data.skills.length > 0 && (
          <Section title="Skills">
            <dl className="space-y-1.5">
              {data.skills.map((group) => (
                <div key={group.category} className="text-sm">
                  <dt className="inline font-semibold text-foreground">
                    {group.category}:{" "}
                  </dt>
                  <dd className="inline text-muted-foreground">
                    {group.items.join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {data.experiences.length > 0 && (
          <Section title="Experience">
            <EntryList entries={data.experiences} />
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="Projects">
            <EntryList entries={data.projects} />
          </Section>
        )}
      </article>

      <footer className="mx-auto mt-6 max-w-3xl text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <BrandIcon size="sm" />
          Built with Recut
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wider text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EntryList({
  entries,
}: {
  entries: { title: string; tailoredBullets: string[]; originalBullets: string[] }[];
}) {
  return (
    <div className="space-y-4">
      {entries.map((entry, i) => {
        const bullets =
          entry.tailoredBullets.length > 0
            ? entry.tailoredBullets
            : entry.originalBullets;
        return (
          <div key={`${entry.title}-${i}`}>
            <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {bullets.map((bullet, j) => (
                <li key={j}>{bullet}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
