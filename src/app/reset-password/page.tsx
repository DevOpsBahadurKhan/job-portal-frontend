"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3.5 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const passwordStrength = [
        password.length >= 8,
        /[A-Z]/.test(password) && /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    const strengthLabel = [
        "Enter a password",
        "Weak",
        "Fair",
        "Good",
        "Strong",
    ][password ? passwordStrength : 0];

    const strengthColor = [
        "bg-slate-200",
        "bg-red-500",
        "bg-amber-500",
        "bg-blue-500",
        "bg-emerald-500",
    ][password ? passwordStrength : 0];

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!token) {
            setError("Reset link is missing. Please request a new one.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        newPassword: password,
                    }),
                }
            );

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    "Unable to reset password. Please try again."
                );
            }

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            let message = "Something went wrong. Please try again.";

            if (err instanceof Error && err.message) {
                message = err.message;
            } else if (typeof err === "string" && err.trim()) {
                message = err;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8ff] px-4 py-10 sm:py-14">
            {/* Ambient background */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/40 blur-3xl" />

            <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_-28px_rgba(37,70,140,0.25)] backdrop-blur-xl sm:p-9">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500" />

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                {/* Brand icon */}
                <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-sm">
                    {success ? (
                        <CheckCircle2 size={27} />
                    ) : (
                        <KeyRound size={27} />
                    )}
                </div>

                <div className="mt-6">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        <Sparkles size={13} />
                        Account security
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {success
                            ? "Password updated!"
                            : "Create a new password"}
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        {success
                            ? "Your password has been reset successfully. You can now sign in using your new credentials."
                            : "Choose a strong, unique password to keep your QuickHire account secure."}
                    </p>
                </div>

                {success ? (
                    <div className="mt-8">
                        <div
                            role="status"
                            className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4"
                        >
                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    className="mt-0.5 shrink-0 text-emerald-700"
                                    size={22}
                                />
                                <div>
                                    <h2 className="font-semibold text-emerald-950">
                                        Password changed successfully
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                                        Your account is ready. Sign in again with your new password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/login"
                            className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
                        >
                            Go to login
                        </Link>
                    </div>
                ) : !token ? (
                    <div
                        role="alert"
                        className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
                    >
                        <div className="flex items-start gap-3">
                            <LockKeyhole
                                className="mt-0.5 shrink-0 text-red-600"
                                size={21}
                            />
                            <div>
                                <h2 className="font-semibold text-red-950">
                                    Invalid reset link
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-red-800">
                                    The reset token is missing. Request a new password reset link to continue.
                                </p>
                                <Link
                                    href="/forgot-password"
                                    className="mt-4 inline-flex font-semibold text-red-800 underline underline-offset-4 transition hover:text-red-950"
                                >
                                    Request a new link
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                New password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    maxLength={128}
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your new password"
                                    aria-describedby="password-strength"
                                    className={`${inputClassName} pr-12`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            <div id="password-strength" className="mt-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-slate-500">
                                        Password strength
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        {strengthLabel}
                                    </span>
                                </div>

                                <div className="mt-2 grid grid-cols-4 gap-1.5">
                                    {[0, 1, 2, 3].map((segment) => (
                                        <div
                                            key={segment}
                                            className={`h-1.5 rounded-full transition-colors duration-200 ${password && segment < passwordStrength
                                                    ? strengthColor
                                                    : "bg-slate-200"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Use at least 8 characters, uppercase and lowercase letters,
                                    a number, and a symbol for a stronger password.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Confirm new password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    maxLength={128}
                                    value={confirmPassword}
                                    onChange={(event) => {
                                        setConfirmPassword(event.target.value);
                                        setError("");
                                    }}
                                    placeholder="Re-enter your new password"
                                    aria-invalid={Boolean(
                                        confirmPassword && password !== confirmPassword
                                    )}
                                    className={`${inputClassName} pr-12 ${confirmPassword && password !== confirmPassword
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                            : ""
                                        }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((value) => !value)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {confirmPassword && (
                                <p
                                    className={`mt-2 flex items-center gap-1.5 text-xs ${password === confirmPassword
                                            ? "text-emerald-700"
                                            : "text-red-600"
                                        }`}
                                >
                                    {password === confirmPassword ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Passwords match
                                        </>
                                    ) : (
                                        "Passwords do not match"
                                    )}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !password ||
                                !confirmPassword ||
                                password !== confirmPassword
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Updating password...
                                </>
                            ) : (
                                <>
                                    <LockKeyhole size={17} />
                                    Update password
                                </>
                            )}
                        </button>
                    </form>
                )}

                {!success && token && (
                    <div className="mt-7 flex items-start justify-center gap-2 border-t border-slate-100 pt-5">
                        <ShieldCheck
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                        />
                        <p className="text-center text-xs leading-5 text-slate-500">
                            Your reset link expires in 15 minutes and can only be used once.
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center text-xs text-slate-400">
                    Secure password recovery · QuickHire
                </div>
            </section>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#f6f8ff] px-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/90 px-5 py-4 shadow-lg shadow-blue-900/5">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
                        <p className="text-sm font-medium text-slate-600">
                            Loading password reset...
                        </p>
                    </div>
                </main>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}