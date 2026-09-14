"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import { login, signup } from "@/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  // Matches the 8-character minimum the server enforces in src/actions/auth.ts;
  // a lower one here just moves the rejection to a round-trip later.
  password: z.string().min(8, "Password must be at least 8 characters."),
  consent: z.boolean(),
});

/**
 * Signing up is the point where someone hands over a resume, so the agreement
 * is collected here, explicitly and unticked. A pre-ticked box is not consent.
 *
 * Refined rather than `z.literal(true)` so both schemas still infer the same
 * field types and one useForm can serve either mode.
 */
const signupSchema = loginSchema.refine((v) => v.consent, {
  message: "Please accept the Terms and Privacy Policy to continue.",
  path: ["consent"],
});

type FormValues = z.infer<typeof loginSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const isSignup = mode === "signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: { email: "", password: "", consent: false },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setNotice(null);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      const res = isSignup ? await signup(formData) : await login(formData);

      if (res?.error) {
        toast(isSignup ? "Signup Failed" : "Login Failed", {
          description: res.error,
          type: "error",
        });
      } else if (res?.success) {
        // A successful sign-in redirects, so the only way to land here is the
        // confirm-your-email branch. It used to be swallowed silently.
        const data = res.data as { message?: string } | undefined;
        if (data?.message) setNotice(data.message);
      }
    } catch {
      toast("Error", {
        description: "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

  return (
    <div className="space-y-6">
      {notice && (
        <p
          role="status"
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
        >
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Email address
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Password
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password
                ? "password-error"
                : isSignup
                  ? "password-hint"
                  : undefined
            }
            className={inputClass}
            placeholder="••••••••"
          />
          {errors.password ? (
            <p id="password-error" className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : (
            isSignup && (
              <p id="password-hint" className="mt-1 text-xs text-muted-foreground">
                At least 8 characters.
              </p>
            )
          )}
        </div>

        {isSignup && (
          <div>
            <div className="flex gap-2.5">
              <input
                {...register("consent")}
                id="consent"
                type="checkbox"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label
                htmlFor="consent"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                , and I understand that resume text and job descriptions I submit
                are sent to third-party AI providers (Google and Groq) to be
                processed.
              </label>
            </div>
            {errors.consent && (
              <p id="consent-error" className="mt-1.5 text-sm text-destructive">
                {errors.consent.message}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
        </span>
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-primary hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </div>
    </div>
  );
}
