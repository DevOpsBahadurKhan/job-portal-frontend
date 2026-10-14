
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

const stats = [
    { label: "Total Users", value: 1250 },
    { label: "Total Jobs", value: 340 },
    { label: "Companies", value: 85 },
    { label: "Open Jobs", value: 210 },
];

type UsageItem = {
    used: number;
    limit: number;
    remaining: number;
};

type UsageData = {
    plan: {
        id: number;
        name: string;
    };
    usage: {
        aiAssistant: UsageItem;
        resumeAnalysis: UsageItem;
        skillGapAnalysis: UsageItem;
        careerGuidance: UsageItem;
    };
    usagePeriod: {
        start: string;
        end: string;
    };
};

const features = [
    {
        key: "aiAssistant",
        title: "AI Job Assistant",
        description: "Get help with job searches and career questions.",
        href: "/ai-assistant",
    },
    {
        key: "resumeAnalysis",
        title: "Resume Analyzer",
        description: "Analyze your resume and improve its quality.",
        href: "/resume-analyzer",
    },
    {
        key: "skillGapAnalysis",
        title: "Skill Gap Analysis",
        description: "Identify skills you need for your target role.",
        href: "/skill-gap",
    },
    {
        key: "careerGuidance",
        title: "Career Guidance",
        description: "Explore career paths and personalized roadmaps.",
        href: "/career-guidance",
    },
] as const;

export default function CandidateOverview() {
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsage = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiClient.getMyUsage();

            if (!response.success || !response.data) {
                throw new Error(response.error || "Unable to load AI usage.");
            }

            setUsageData(response.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load AI usage."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsage();
    }, [loadUsage]);

    return (
        <div className="space-y-8">
            {/* Existing statistics - preserved */}
            <section>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <p className="text-sm text-slate-500">{stat.label}</p>
                            <h2 className="mt-4 text-3xl font-bold text-slate-900">
                                {stat.value.toLocaleString()}
                            </h2>
                        </div>
                    ))}
                </div>
            </section>

            {/* New AI usage section */}
            <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            AI Usage & Plan
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Track your AI feature usage and remaining monthly quota.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadUsage()}
                        disabled={loading}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Refreshing..." : "Refresh usage"}
                    </button>
                </div>

                {loading && !usageData ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Loading your AI usage...
                    </div>
                ) : error && !usageData ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={() => void loadUsage()}
                            className="mt-3 text-sm font-semibold text-red-800 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : usageData ? (
                    <>
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-indigo-700">Current plan</p>
                                <h3 className="mt-1 text-2xl font-bold text-indigo-950">
                                    {usageData.plan.name}
                                </h3>
                                <p className="mt-1 text-sm text-indigo-800">
                                    Usage resets according to your billing period.
                                </p>
                            </div>

                            <Link
                                href="/pricing"
                                className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:mt-0"
                            >
                                Upgrade plan
                            </Link>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-amber-700">
                                Latest refresh failed: {error}
                            </p>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            {features.map((feature) => {
                                const item = usageData.usage[feature.key];
                                const percentage =
                                    item.limit > 0
                                        ? Math.min(100, (item.used / item.limit) * 100)
                                        : 0;
                                const limitReached = item.remaining <= 0;

                                return (
                                    <div
                                        key={feature.key}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {feature.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {feature.description}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${limitReached
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                                    }`}
                                            >
                                                {limitReached ? "Limit reached" : "Available"}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-600">
                                                Monthly usage
                                            </span>
                                            <span className="text-sm font-bold text-slate-900">
                                                {item.used} / {item.limit}
                                            </span>
                                        </div>

                                        <div
                                            className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
                                            role="progressbar"
                                            aria-label={`${feature.title} usage`}
                                            aria-valuemin={0}
                                            aria-valuemax={item.limit}
                                            aria-valuenow={Math.min(item.used, item.limit)}
                                        >
                                            <div
                                                className={`h-full rounded-full transition-all ${limitReached ? "bg-red-500" : "bg-indigo-600"
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <p className="text-sm text-slate-500">
                                                {item.remaining} uses remaining
                                            </p>

                                            <Link
                                                href={feature.href}
                                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                            >
                                                Open feature →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-500">
                            Period:{" "}
                            {new Date(usageData.usagePeriod.start).toLocaleDateString()} –{" "}
                            {new Date(usageData.usagePeriod.end).toLocaleDateString()}
                        </p>
                    </>
                ) : null}
            </section>
        </div>
    );
}
