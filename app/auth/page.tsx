"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Code2, BookOpen, Award, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      const route =
        user.role === "admin" || user.role === "superadmin"
          ? "/admin"
          : user.role === "mentor"
          ? "/mentor"
          : "/dashboard";
      router.push(route);
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
        <div>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">
              CodePath
            </span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold leading-tight text-balance text-sidebar-foreground">
            Learn to code with interactive lessons and hands-on assignments.
          </h1>
          <div className="space-y-4">
            <Feature
              icon={<BookOpen className="h-5 w-5" />}
              title="Video Lessons"
              description="Watch structured courses from industry experts"
            />
            <Feature
              icon={<Code2 className="h-5 w-5" />}
              title="In-App Code Editor"
              description="Practice coding right inside the platform"
            />
            <Feature
              icon={<Award className="h-5 w-5" />}
              title="Earn Certificates"
              description="Complete tracks and earn verified certificates"
            />
          </div>
        </div>

        <p className="text-sm text-sidebar-foreground/50">
          Built for developers, by developers.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center gap-3 lg:hidden mb-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Code2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  CodePath
                </span>
              </Link>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue your learning journey"
                : "Start your coding journey today"}
            </p>
          </div>

          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-primary">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sidebar-foreground">{title}</p>
        <p className="text-sm text-sidebar-foreground/60">{description}</p>
      </div>
    </div>
  );
}
