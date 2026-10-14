"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSubmitted(false);
        setLoading(true);

        try {
            const response = await apiClient.forgotPassword(email.trim());

            if (!response.success) {
                const errorMessage =
                    typeof response.error === "string"
                        ? response.error
                        : "Unable to send the reset email. Please try again.";

                throw new Error(errorMessage);
            }

            setSubmitted(true);
        } catch (err: unknown) {
            let errorMessage =
                "Unable to send the reset email. Please try again.";

            if (err instanceof Error && err.message) {
                errorMessage = err.message;
            } else if (typeof err === "string" && err.trim()) {
                errorMessage = err;
            } else if (err && typeof err === "object") {
                const apiError = err as {
                    message?: unknown;
                    error?: unknown;
                    response?: {
                        data?: {
                            message?: unknown;
                        };
                    };
                };

                if (
                    typeof apiError.response?.data?.message === "string"
                ) {
                    errorMessage = apiError.response.data.message;
                } else if (
                    typeof apiError.message === "string" &&
                    apiError.message
                ) {
                    errorMessage = apiError.message;
                } else if (
                    typeof apiError.error === "string" &&
                    apiError.error
                ) {
                    errorMessage = apiError.error;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f9ff] px-4 py-12">
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

            <section className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_-28px_rgba(37,70,140,0.22)] backdrop-blur-xl sm:p-10">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-blue-700"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                <div className="mt-9">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Forgot your password?
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Enter your registered email address and we’ll send you a reset link.
                    </p>
                </div>

                {submitted ? (
                    <div
                        role="status"
                        className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={22}
                                className="mt-0.5 shrink-0 text-emerald-700"
                            />

                            <div>
                                <h2 className="font-semibold text-emerald-950">
                                    Check your email
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-emerald-900">
                                    If an account exists for this email, a reset link will be sent.
                                    Check your inbox and spam folder.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSubmitted(false);
                                setError("");
                            }}
                            className="mt-5 border-t border-emerald-200 pt-4 text-sm font-semibold text-emerald-900 transition hover:text-emerald-950"
                        >
                            Try another email →
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-800"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                required
                                maxLength={254}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? "forgot-password-error" : undefined}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>

                        {error && (
                            <p
                                id="forgot-password-error"
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Sending reset link..." : "Send reset link"}
                        </button>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-700">
                    Remember your password?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                        Sign in
                    </Link>
                </div>
            </section>
        </main>
    );
}