"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Database,
  FileDown,
  Mic,
  Sparkles,
  Wand2,
} from "lucide-react";

/**
 * The three steps of the core loop, then the tools built on top of it.
 * Ordered so the Vault → Tailor → Send story reads first.
 */
const steps = [
  {
    step: "01",
    name: "Fill your Vault",
    description:
      "Add every role, project and skill once — with all the bullet points, even the ones that won't fit on a one-page resume.",
    icon: Database,
  },
  {
    step: "02",
    name: "Paste a job description",
    description:
      "CareerCopilot reads the posting, picks the most relevant items from your Vault, and rewrites each bullet around the keywords that role actually asks for.",
    icon: Sparkles,
  },
  {
    step: "03",
    name: "Send it",
    description:
      "Export a clean, text-based PDF or DOCX, or publish a link recruiters can open in the browser. Every draft stays saved.",
    icon: FileDown,
  },
];

const tools = [
  {
    name: "AI Improver",
    description:
      "Scores your resume, flags weak bullets by severity, and rewrites them in four styles.",
    icon: Wand2,
  },
  {
    name: "Interview Prep",
    description:
      "Generates the questions this role will actually ask you, then grades your answers.",
    icon: Mic,
  },
  {
    name: "Analytics",
    description:
      "Your pipeline, match-score trend and the skill gaps that keep resurfacing.",
    icon: BarChart3,
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="bg-muted/50 py-24 sm:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <h2 className="text-sm font-bold uppercase leading-7 tracking-wider text-primary">
            How it works
          </h2>
          <p className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            One Vault. Every application.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Most resume tools make you start over for each job. CareerCopilot keeps
            your experience in one place and re-cuts it per role.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <dl className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col rounded-2xl border bg-card p-6"
              >
                <span className="mb-3 text-xs font-bold tracking-widest text-primary">
                  {item.step}
                </span>
                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-foreground">
                  <item.icon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                  {item.name}
                </dt>
                <dd className="mt-3 flex flex-auto flex-col text-base leading-relaxed text-muted-foreground">
                  <p className="flex-auto">{item.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        <div id="features" className="mx-auto mt-20 max-w-5xl scroll-mt-28">
          <h3 className="mb-8 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Also included
          </h3>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-bold text-foreground">
                  <tool.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {tool.name}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
