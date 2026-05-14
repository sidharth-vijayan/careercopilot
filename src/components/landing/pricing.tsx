"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/signup",
    priceMonthly: "$0",
    description: "Perfect for job seekers starting their search.",
    features: ["3 Resume Scans per month", "Basic ATS Scoring", "Standard AI Feedback"],
    mostPopular: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/signup?plan=pro",
    priceMonthly: "$15",
    description: "Advanced tools for serious professionals.",
    features: [
      "Unlimited Resume Scans",
      "Deep Skill Gap Analysis",
      "AI Bullet Point Rewriter",
      "Application Tracking Board",
      "Priority Email Support"
    ],
    mostPopular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose the right plan for you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          Whether you're casually looking or aggressively applying, we have a plan that fits your needs.
        </p>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 sm:p-10 ${
                tier.mostPopular ? 'ring-2 ring-primary shadow-xl shadow-primary/10' : 'ring-border'
              }`}
            >
              {tier.mostPopular && (
                <p className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold leading-5 text-primary-foreground">
                  Most popular
                </p>
              )}
              <div>
                <h3 id={tier.id} className="text-base font-semibold leading-7 text-foreground">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                  <span className="text-base font-semibold leading-7 text-muted-foreground">/month</span>
                </div>
                <p className="mt-6 text-base leading-7 text-muted-foreground">{tier.description}</p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground sm:mt-10">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                className={`mt-8 w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors ${
                  tier.mostPopular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tier.mostPopular ? "Get started" : "Start for free"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
