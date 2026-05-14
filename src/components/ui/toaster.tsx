"use client";

import { useToastStore } from "@/lib/store/toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const isError = t.type === "error";
          const isSuccess = t.type === "success";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md ${
                isError
                  ? "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20"
                  : isSuccess
                  ? "border-green-500/30 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                  : "border-border bg-background/80 text-foreground"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle className="h-5 w-5" />
                ) : isSuccess ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold leading-none tracking-tight">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-sm opacity-90">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
