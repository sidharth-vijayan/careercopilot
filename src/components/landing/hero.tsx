"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(60,40,160,0.3),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-primary/20 bg-primary/10 px-7 py-2 backdrop-blur transition-all hover:bg-primary/20 cursor-pointer mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-primary">
            CareerCopilot 2.0 is now live
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Land your dream job with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            AI precision
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Upload your resume, paste a job description, and let our intelligent engine analyze compatibility, identify skill gaps, and optimize your ATS alignment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto group">
              Start Optimizing Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              View Sample Report
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
