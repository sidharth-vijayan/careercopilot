"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { loginAsDemo } from "@/actions/auth";

/**
 * Landing hero, built around the Vault → Tailor loop rather than a generic
 * "AI resume tool" pitch — that loop is the actual product idea, and it is what
 * differentiates this from every other resume checker.
 *
 * The demo button matters as much as the copy: most visitors will not create an
 * account to evaluate a product, so the whole app has to be reachable without one.
 */
export function Hero() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDemo = () => {
    setError(null);
    startTransition(async () => {
      const res = await loginAsDemo();
      // A successful demo sign-in redirects, so reaching here means it failed.
      if (res && !res.success) setError(res.error ?? "The demo is unavailable.");
    });
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-32 md:pt-40 md:pb-44">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(60,40,160,0.3),rgba(255,255,255,0))]" />

      <div className="container mx-auto px-4 text-center md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-6 w-fit rounded-full border bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur"
        >
          Write your experience once. Tailor it to every job.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl md:leading-[1.05]"
        >
          Stop rewriting your
          <br />
          resume{" "}
          <span className="bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent dark:to-blue-400">
            from scratch
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Keep every job, project and skill you&apos;ve ever had in your Vault. Paste a
          job description and Recut picks the relevant pieces, rewrites them
          for that role, and hands you a resume to send.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="group h-14 w-full px-9 text-base font-bold shadow-lg shadow-primary/20 transition-transform duration-200 hover:scale-102 sm:w-auto"
            >
              Start free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={handleDemo}
            disabled={isPending}
            className="h-14 w-full border-2 px-9 text-base font-bold transition-transform duration-200 hover:scale-102 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Opening demo…
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                Try the live demo
              </>
            )}
          </Button>
        </motion.div>

        <p className="mt-4 text-sm text-muted-foreground">
          No signup needed for the demo — a real working account, read-only.
        </p>

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}{" "}
            <Link href="/sample-report" className="underline underline-offset-2">
              View a sample report instead
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
