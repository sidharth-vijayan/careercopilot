"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-44 md:pt-44 md:pb-56">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(60,40,160,0.3),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-balance text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl leading-[1.1] md:leading-[1.05]"
        >
          Land your dream job
          <br />
          with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            AI precision
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-10 max-w-3xl text-xl text-muted-foreground sm:text-2xl leading-relaxed"
        >
          Upload your resume, paste a job description, and let our intelligent engine analyze compatibility, identify skill gaps, and optimize your ATS alignment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 flex flex-col sm:flex-row justify-center gap-6"
        >
          <Link href="/signup">
            <Button size="lg" className="h-15 px-10 text-lg w-full sm:w-auto group font-bold shadow-lg shadow-primary/20 hover:scale-102 transition-transform duration-200">
              Start Optimizing Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/sample-report">
            <Button variant="outline" size="lg" className="h-15 px-10 text-lg w-full sm:w-auto font-bold border-2 hover:scale-102 transition-transform duration-200">
              <FileText className="mr-2 h-5 w-5" />
              View Sample Report
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
