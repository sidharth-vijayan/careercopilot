import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account | CareerCopilot",
  description: "Sign up for CareerCopilot",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Start optimizing your job applications
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
