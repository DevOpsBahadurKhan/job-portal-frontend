
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient  as api} from "@/lib/api";
import type { Plan } from "@/types/IPlan";

function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price / 100);
}

export default function PricingPage() {
    const router = useRouter();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadPlans() {
            try {
                setLoading(true);
                setError("");

                const response = await api.getPlans();

                if (!response.success) {
                    throw new Error("Unable to load pricing plans.");
                }

                const availablePlans = Array.isArray(response.data)
                    ? response.data
                    : [];

                if (!cancelled) {
                    setPlans(
                        availablePlans.filter((plan) =>
                            ["FREE", "STARTER", "GROWTH"].includes(
                                plan.name.toUpperCase()
                            )
                        )
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load pricing plans."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadPlans();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-6xl animate-pulse">
                    <div className="mx-auto mb-4 h-8 w-64 rounded bg-slate-200" />
                    <div className="mx-auto mb-12 h-4 w-80 max-w-full rounded bg-slate-200" />
                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-96 rounded-2xl border bg-white"
                            />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mb-8 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                    ← Back to Dashboard
                </button>

                <header className="mb-12 text-center">
                    <p className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                        QUIREHIRE PLANS
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Choose the right plan
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                        Get more from QuireHire with a plan that fits your goals.
                    </p>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {error}
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!error && plans.length === 0 && (
                    <p className="rounded-xl border bg-white p-8 text-center text-slate-600">
                        No plans are available right now.
                    </p>
                )}

                <div className="grid items-stretch gap-6 md:grid-cols-3">
                    {plans.map((plan) => {
                        const growth = plan.name.toUpperCase() === "GROWTH";
                        const free = plan.price === 0;

                        const features = [
                            `${plan.maxAiMessages} AI Assistant uses/month`,
                            `${plan.maxResumeAnalyses} Resume analyses/month`,
                            `${plan.maxSkillGapAnalyses} Skill gap analyses/month`,
                            `${plan.maxCareerGuidance} Career Guidance uses/month`,
                            `${plan.maxActiveJobs} maximum active jobs`,
                        ];

                        return (
                            <article
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${growth
                                    ? "border-indigo-500 ring-2 ring-indigo-100"
                                    : "border-slate-200"
                                    }`}
                            >
                                {growth && (
                                    <span className="absolute -top-3 right-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                                        RECOMMENDED
                                    </span>
                                )}

                                <h2 className="text-xl font-bold text-slate-900">
                                    {plan.name}
                                </h2>

                                <p className="mt-2 min-h-10 text-sm text-slate-500">
                                    {plan.description}
                                </p>

                                <div className="mt-5 flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {formatPrice(plan.price, plan.currency)}
                                    </span>

                                    {!free && (
                                        <span className="text-sm text-slate-500">
                                            /month
                                        </span>
                                    )}
                                </div>

                                <div className="my-7 border-t border-slate-100" />

                                <p className="mb-4 text-sm font-semibold text-slate-800">
                                    What&apos;s included
                                </p>

                                <ul className="flex-1 space-y-4">
                                    {features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex gap-3 text-sm text-slate-600"
                                        >
                                            <span className="font-bold text-emerald-600">
                                                ✓
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => {
                                        if (free) {
                                            router.push("/dashboard");
                                        } else {
                                            router.push(`/checkout?planId=${plan.id}`);
                                        }
                                    }}
                                    className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${growth
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                                        }`}
                                >
                                    {free ? "Continue with Free" : `Choose ${plan.name}`}
                                </button>
                            </article>
                        );
                    })}
                </div>

                <p className="mt-10 text-center text-sm text-slate-500">
                    Secure payments powered by Razorpay.
                </p>
            </div>
        </main>
    );
}
