"use client";

import { motion } from "framer-motion";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Every line here has to be defensible.
 *
 * This page used to promise "unlimited" usage "forever" while the app enforced
 * a hard daily AI cap — an advertised claim the product contradicted on day
 * one. The limit is now stated up front instead, and the feature list names
 * only things that actually ship.
 */
const features = [
  "Vault: store every role, project and skill once",
  "Tailor a resume to any job description",
  "Match score, missing skills and ATS warnings",
  "Bullet rewrites in four styles",
  "Cover letter drafts",
  "Interview questions, with feedback on your answers",
  "Application tracker and pipeline analytics",
  "PDF and DOCX export, plus a shareable link",
];

/** Mirrors DAILY_AI_LIMIT in src/lib/quota.ts — the deployed default. */
const DAILY_LIMIT_COPY = "20 AI generations a day";

export function Pricing() {
  return (
    <section id="pricing" className="py-32 sm:py-44">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-lg font-bold leading-7 text-primary tracking-wider uppercase">Pricing</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
            Free, with a daily limit.
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xl leading-relaxed text-muted-foreground">
          Every feature is available at no cost. The AI runs on the maintainer&apos;s
          own API keys, so each account gets {DAILY_LIMIT_COPY} — enough for a
          real day of applying, and honest about where the ceiling is.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-20 max-w-xl sm:mt-24"
        >
          <div className="relative flex flex-col justify-between rounded-3xl bg-background p-10 ring-2 ring-primary shadow-2xl shadow-primary/15 sm:p-12 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" aria-hidden="true" />

            <div className="relative">
              <h3 className="text-xl font-bold leading-7 text-foreground">
                Free plan
              </h3>

              <div className="mt-6 flex items-baseline gap-x-2.5">
                <span className="text-6xl font-extrabold tracking-tight text-foreground">₹0</span>
                <span className="text-lg font-semibold leading-7 text-muted-foreground">
                  no card required
                </span>
              </div>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                There is no paid tier and no trial. Nothing in the product asks
                for a payment method.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 px-5 py-4">
                <Zap className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                <p className="text-base font-semibold text-foreground">
                  {DAILY_LIMIT_COPY}, resetting at midnight UTC. Browsing,
                  editing and exporting are unlimited.
                </p>
              </div>

              <ul role="list" className="mt-8 space-y-4 text-base leading-7 text-muted-foreground sm:mt-10">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-start">
                    <Check className="mt-1.5 h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                CareerCopilot drafts and rewrites — it does not apply for you and
                cannot promise an interview. Check everything it writes before
                you send it. Full detail in the{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <Link href="/signup" className="mt-10">
              <Button className="w-full h-15 text-lg font-bold shadow-md group hover:scale-102 transition-transform duration-200">
                Create a free account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
