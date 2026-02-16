"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getRouteForRole(role: string): string {
  switch (role) {
    case "superadmin":
    case "admin":
      return "/admin";
    case "mentor":
      return "/mentor";
    default:
      return "/dashboard";
  }
}

interface LoginFormProps {
  onSwitch: () => void;
}

export function LoginForm({ onSwitch }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(data.email, data.password);
    setIsLoading(false);

    if (success) {
      const currentUser = useAuthStore.getState().user;
      toast.success("Welcome back!");
      router.push(getRouteForRole(currentUser?.role ?? "student"));
    } else {
      toast.error("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="h-11"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
          className="h-11"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>Demo accounts</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <DemoButton label="Student" email="alex@example.com" />
          <DemoButton label="Admin" email="sarah@example.com" />
          <DemoButton label="Mentor" email="david@example.com" />
          <DemoButton label="SuperAdmin" email="superadmin@codepath.com" />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:underline"
        >
          Sign up as a student
        </button>
      </p>
    </form>
  );
}

function DemoButton({ label, email }: { label: string; email: string }) {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleClick = () => {
    login(email, "demo123");
    const currentUser = useAuthStore.getState().user;
    toast.success(`Logged in as ${label}`);
    router.push(getRouteForRole(currentUser?.role ?? "student"));
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="text-xs"
    >
      {label}
    </Button>
  );
}
