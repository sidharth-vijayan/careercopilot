import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | CareerCopilot",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
