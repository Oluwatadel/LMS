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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitch: () => void;
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviousStudent, setIsPreviousStudent] = useState(false);
  const registerUser = useAuthStore((s) => s.register);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = registerUser(data.name, data.email, data.password);
    setIsLoading(false);

    if (success) {
      if (isPreviousStudent) {
        toast.success(
          "Welcome back! Your account has been created. You can now access your certificates."
        );
      } else {
        toast.success("Account created successfully! Start learning.");
      }
      router.push("/dashboard");
    } else {
      toast.error("An account with this email already exists. Try signing in.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          Registration is for <span className="font-medium text-foreground">students only</span>. Admins and mentors are managed internally.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register("name")}
          className="h-11"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
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
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Create a password"
          {...register("password")}
          className="h-11"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
          className="h-11"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="previous"
          checked={isPreviousStudent}
          onCheckedChange={(v) => setIsPreviousStudent(v === true)}
        />
        <Label htmlFor="previous" className="text-sm font-normal text-muted-foreground cursor-pointer">
          I am a previous student and want to download my certificate
        </Label>
      </div>

      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create student account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
