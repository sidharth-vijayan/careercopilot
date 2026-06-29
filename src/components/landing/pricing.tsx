"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  "Unlimited Resume Scans",
  "AI-Powered ATS Scoring",
  "Deep Skill Gap Analysis",
  "Actionable AI Feedback",
  "Application Tracking Board",
  "Resume Keyword Optimizer",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 sm:py-44">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-lg font-bold leading-7 text-primary tracking-wider uppercase">Pricing</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
            Completely free. No catches.
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xl leading-relaxed text-muted-foreground">
          Every feature, unlimited usage, zero cost. We believe everyone deserves access to powerful career tools.
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
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <h3 className="text-xl font-bold leading-7 text-foreground">
                Free Forever
              </h3>

              <div className="mt-6 flex items-baseline gap-x-2.5">
                <span className="text-6xl font-extrabold tracking-tight text-foreground">₹0</span>
                <span className="text-lg font-semibold leading-7 text-muted-foreground">forever</span>
              </div>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Full access to every feature with unlimited usage. No credit card required, no hidden fees, no trial period.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 px-5 py-4">
                <Zap className="h-6 w-6 text-primary shrink-0" />
                <p className="text-base font-semibold text-foreground">
                  Unlimited scans, unlimited analyses — use it as much as you need.
                </p>
              </div>

              <ul role="list" className="mt-8 space-y-4 text-base leading-7 text-muted-foreground sm:mt-10">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-center">
                    <Check className="h-5.5 w-5.5 flex-none text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="mt-10">
              <Button className="w-full h-15 text-lg font-bold shadow-md group hover:scale-102 transition-transform duration-200">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
