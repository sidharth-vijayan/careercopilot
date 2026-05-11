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
    <section id="features" className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Optimize faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to get hired
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            CareerCopilot provides a comprehensive suite of AI-driven tools to ensure your resume always stands out to recruiters and passes ATS filters.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
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
