"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { askCareerQuestion, type ChatMessage } from "@/actions/chat";

const SUGGESTIONS = [
  "Am I qualified for a backend engineer role yet?",
  "What should I learn next to be more hireable?",
  "Which of my projects is strongest, and why?",
  "How do I explain my career gap in an interview?",
];

export function ChatClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput("");

    // Capture the history before appending, so the request carries the turns
    // that preceded this question rather than the question itself.
    const priorHistory = messages;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setIsLoading(true);

    const res = await askCareerQuestion(trimmed, priorHistory);

    setIsLoading(false);

    if (res.success && res.data) {
      setMessages((m) => [...m, { role: "assistant", content: res.data!.answer }]);
      router.refresh();
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[420px] flex-col rounded-xl border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <Sparkles
              className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold text-foreground">
              Ask about your career
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Answers are grounded in your resume and Vault, so they&apos;re about
              you — not generic advice.
            </p>
            <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Thinking…
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter inserts a newline.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask anything about your career…"
          aria-label="Your question"
          className="max-h-32 min-h-[42px] flex-1 resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="h-[42px]">
          <Send className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
