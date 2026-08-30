"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Mic,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import {
  answerInterviewQuestion,
  createInterviewSession,
  deleteInterviewSession,
  type InterviewQuestion,
  type InterviewSession,
} from "@/actions/interview";
import type { ResumeSummary } from "@/actions/resumes";
import { JdUrlImport } from "@/components/dashboard/jd-url-import";

interface Props {
  resumes: ResumeSummary[];
  sessions: InterviewSession[];
}

export function InterviewClient({ resumes, sessions }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<InterviewSession | null>(null);

  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center">
        <Mic className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">
          Upload a resume first
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Interview prep builds questions from your resume and the job description
          together, so it needs a resume on file.
        </p>
        <Link href="/dashboard" className={`mt-4 ${buttonVariants({ size: "sm" })}`}>
          Upload a resume
        </Link>
      </div>
    );
  }

  if (active) {
    return (
      <MockInterview
        session={active}
        onBack={() => {
          setActive(null);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <NewSessionForm
        resumes={resumes}
        onCreated={(session) => {
          setActive(session);
          router.refresh();
        }}
      />
      <SessionList sessions={sessions} onOpen={setActive} />
    </div>
  );
}

function NewSessionForm({
  resumes,
  onCreated,
}: {
  resumes: ResumeSummary[];
  onCreated: (s: InterviewSession) => void;
}) {
  const defaultResume = resumes.find((r) => r.isDefault) ?? resumes[0];
  const [resumeId, setResumeId] = useState(defaultResume.id);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await createInterviewSession(
      resumeId,
      jobTitle,
      company,
      jobDescription
    );

    setIsLoading(false);

    if (res.success && res.data) {
      toast("Questions ready", {
        description: `${res.data.questions.length} questions generated.`,
        type: "success",
      });
      onCreated(res.data);
    } else {
      toast("Couldn't generate questions", {
        description: res.error ?? "Please try again.",
        type: "error",
      });
    }
  };

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-foreground">
        Start a mock interview
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        The AI reads your resume against the posting and asks what a real
        interviewer would.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="iv-title" className="mb-1 block text-sm font-medium">
            Job title
          </label>
          <input
            id="iv-title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Backend Engineer Intern"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="iv-company" className="mb-1 block text-sm font-medium">
            Company
          </label>
          <input
            id="iv-company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Razorpay"
            className={inputClass}
          />
        </div>
      </div>

      {resumes.length > 1 && (
        <div className="mt-4">
          <label htmlFor="iv-resume" className="mb-1 block text-sm font-medium">
            Resume
          </label>
          <select
            id="iv-resume"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className={inputClass}
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.originalName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="iv-jd" className="block text-sm font-medium">
            Job description
          </label>
          <JdUrlImport onImport={setJobDescription} />
        </div>
        <textarea
          id="iv-jd"
          required
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full posting here…"
          className="flex min-h-[160px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Writing your questions…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Generate questions
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function SessionList({
  sessions,
  onOpen,
}: {
  sessions: InterviewSession[];
  onOpen: (s: InterviewSession) => void;
}) {
  const router = useRouter();

  if (sessions.length === 0) return null;

  const handleDelete = async (id: string) => {
    const res = await deleteInterviewSession(id);
    if (res.success) {
      toast("Session deleted", { type: "success" });
      router.refresh();
    } else {
      toast("Couldn't delete", { description: res.error, type: "error" });
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Past sessions
      </h3>
      <ul className="space-y-2">
        {sessions.map((session) => {
          const answered = session.questions.filter((q) => q.feedback).length;
          return (
            <li
              key={session.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-4"
            >
              <button
                type="button"
                onClick={() => onOpen(session)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-foreground">
                  {session.jobTitle}{" "}
                  <span className="text-muted-foreground">· {session.company}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {answered} of {session.questions.length} answered ·{" "}
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(session.id)}
                aria-label={`Delete session for ${session.jobTitle}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MockInterview({
  session,
  onBack,
}: {
  session: InterviewSession;
  onBack: () => void;
}) {
  const [questions, setQuestions] = useState(session.questions);
  const [index, setIndex] = useState(0);

  const current = questions[index];
  const answeredCount = questions.filter((q) => q.feedback).length;

  const handleAnswered = (updated: InterviewQuestion) => {
    setQuestions((qs) => qs.map((q) => (q.id === updated.id ? updated : q)));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <p className="text-sm text-muted-foreground">
          {session.jobTitle} · {session.company} — {answeredCount}/{questions.length}{" "}
          answered
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Question ${i + 1}${q.feedback ? ", answered" : ""}`}
            aria-current={i === index ? "true" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
              i === index
                ? "border-primary bg-primary text-primary-foreground"
                : q.feedback
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {q.feedback ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
          </button>
        ))}
      </div>

      <QuestionCard
        key={current.id}
        sessionId={session.id}
        question={current}
        onAnswered={handleAnswered}
      />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function QuestionCard({
  sessionId,
  question,
  onAnswered,
}: {
  sessionId: string;
  question: InterviewQuestion;
  onAnswered: (q: InterviewQuestion) => void;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const feedback = question.feedback;

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await answerInterviewQuestion(sessionId, question.id, answer);
    setIsLoading(false);

    if (res.success && res.data) {
      onAnswered({ ...question, answer: answer.trim(), feedback: res.data });
      router.refresh();
      toast("Feedback ready", { type: "success" });
    } else {
      toast("Couldn't review that", {
        description: res.error ?? "Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            question.category === "technical"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {question.category}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {question.question}
        </h3>
        {question.rationale && (
          <p className="mt-1 text-sm text-muted-foreground">
            Why they&apos;d ask: {question.rationale}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`answer-${question.id}`} className="mb-1 block text-sm font-medium">
          Your answer
        </label>
        <textarea
          id={`answer-${question.id}`}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer out loud, then type roughly what you said…"
          className="flex min-h-[140px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || answer.trim().length < 20}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Reviewing…
            </>
          ) : feedback ? (
            "Re-review my answer"
          ) : (
            "Get feedback"
          )}
        </Button>
      </div>

      {feedback && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {feedback.score}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          {feedback.verdict && (
            <p className="text-sm text-foreground">{feedback.verdict}</p>
          )}

          {feedback.strengths.length > 0 && (
            <FeedbackList title="What worked" items={feedback.strengths} />
          )}
          {feedback.improvements.length > 0 && (
            <FeedbackList title="What to fix" items={feedback.improvements} />
          )}

          {feedback.rewrittenAnswer && (
            <div>
              <h4 className="mb-1 text-sm font-semibold text-foreground">
                A stronger version
              </h4>
              <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {feedback.rewrittenAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-foreground">{title}</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
