"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth.schema";
import { toast } from "sonner";
import {
  UserRound,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CANDIDATE",
      terms: false,
    },
  });
  // Watch password fields for live UI updates
  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  // Password strength checker
  const getPasswordStrength = (value: string) => {
    if (value.length === 0) {
      return { strength: 0, color: "bg-slate-200", text: "" };
    }
    if (value.length < 6) {
      return { strength: 1, color: "bg-red-500", text: "Weak" };
    }
    if (value.length < 8) {
      return { strength: 2, color: "bg-amber-500", text: "Fair" };
    }
    if (value.length < 10) {
      return { strength: 3, color: "bg-blue-500", text: "Good" };
    }
    return { strength: 4, color: "bg-emerald-500", text: "Strong" };
  };
  const passwordStrength = getPasswordStrength(password);
  // Register handler
  const onSubmit = async (data: RegisterFormValues) => {
    clearErrors("root");
    try {
      const result = await registerUser(
        data.name.trim(),
        data.email.trim(),
        data.password,
        data.role
      );
      if (result.success) {
        toast.success("Account created successfully");
        window.location.href = "/";
        return;
      }
      setError("root.server", {
        type: "server",
        message: "Registration failed. Please try again.",
      });
    } catch (err) {
      setError("root.server", {
        type: "server",
        message:
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.",
      });
    }
  };
  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";
  const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-700";
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <Navbar />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-7 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-6 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] sm:px-8 sm:py-7">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Account
              </h1>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Create your QuickHire account
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* Server Error */}
              {errors.root?.server?.message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{errors.root.server.message}</p>
                </div>
              )}
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("name")}
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      aria-invalid={!!errors.name}
                      onChange={(e) => {
                        register("name").onChange(e);
                        clearErrors("root");
                      }}
                      className={inputClass}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      onChange={(e) => {
                        register("email").onChange(e);
                        clearErrors("root");
                      }}
                      className={inputClass}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter password"
                    aria-invalid={!!errors.password}
                    onChange={(e) => {
                      register("password").onChange(e);
                      clearErrors("root");
                    }}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-slate-100"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Password strength:{" "}
                      <span className="font-medium text-slate-700">
                        {passwordStrength.text}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={labelClass}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    aria-invalid={!!errors.confirmPassword}
                    onChange={(e) => {
                      register("confirmPassword").onChange(e);
                      clearErrors("root");
                    }}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                ) : (
                  confirmPassword && (
                    <p
                      className={`mt-1 text-[10px] font-medium ${password === confirmPassword
                        ? "text-emerald-600"
                        : "text-red-500"
                        }`}
                    >
                      {password === confirmPassword
                        ? "✓ Passwords match"
                        : "✕ Passwords do not match"}
                    </p>
                  )
                )}
              </div>
              {/* Role */}
              <div>
                <label htmlFor="role" className={labelClass}>
                  Role
                </label>
                <div className="relative">
                  <select
                    {...register("role")}
                    id="role"
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="CANDIDATE">
                      Candidate - Looking for jobs
                    </option>
                    <option value="RECRUITER">
                      Recruiter - Posting jobs
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>
              {/* Terms */}
              <div className="flex items-start gap-2 pt-0.5">
                <input
                  {...register("terms")}
                  id="terms"
                  type="checkbox"
                  aria-invalid={!!errors.terms}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 accent-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label
                    htmlFor="terms"
                    className="text-[11px] leading-4 text-slate-600"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.terms.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>
            {/* Login Link */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500 sm:text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
