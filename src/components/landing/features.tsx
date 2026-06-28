"use client";

import { motion } from "framer-motion";
import { CheckCircle, FileSearch, LineChart, Target } from "lucide-react";

const features = [
  {
    name: "Intelligent ATS Scoring",
    description: "Get an instant ATS compatibility score based on industry-standard parsing algorithms and keyword matching.",
    icon: Target,
  },
  {
    name: "Skill Gap Analysis",
    description: "Identify exactly which skills you are missing from the job description and learn how to acquire them.",
    icon: FileSearch,
  },
  {
    name: "Actionable Insights",
    description: "Receive line-by-line recommendations to improve your bullet points and highlight your impact.",
    icon: CheckCircle,
  },
  {
    name: "Application Tracking",
    description: "Keep track of all your job applications, interview stages, and notes in one organized dashboard.",
    icon: LineChart,
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 sm:py-44 bg-muted/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <h2 className="text-lg font-bold leading-7 text-primary tracking-wider uppercase">Optimize faster</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
            Everything you need to get hired
          </p>
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            CareerCopilot provides a comprehensive suite of AI-driven tools to ensure your resume always stands out to recruiters and passes ATS filters.
          </p>
        </div>
        <div className="mx-auto mt-24 max-w-3xl sm:mt-28 lg:mt-32 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-20 lg:max-w-none lg:grid-cols-4 lg:gap-x-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-4.5 text-xl font-bold leading-7 text-foreground">
                  <feature.icon className="h-7 w-7 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-5 flex flex-auto flex-col text-lg leading-relaxed text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
