"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiClient } from "@/lib/api";
import type { ResumeAnalysisResponse } from "@/types/IResume";

export default function ResumeAnalysisPage() {
    const params = useParams();
    const router = useRouter();

    const resumeId = Number(params.resumeId);

    const [data, setData] =
        useState<ResumeAnalysisResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!Number.isInteger(resumeId)) {
            setError("Invalid resume ID");
            setLoading(false);
            return;
        }

        const loadAnalysis = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await apiClient.getResumeAnalysis(resumeId);

                if (!response.success || !response.data) {
                    throw new Error(
                        response.error ||
                        "Unable to load resume analysis"
                    );
                }

                setData(response.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load resume analysis"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadAnalysis();
    }, [resumeId]);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            Loading your resume analysis...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/resume-analyzer")
                        }
                        className="mb-6 text-sm font-medium text-violet-600 hover:text-violet-700"
                    >
                        ← Back to Resumes
                    </button>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h1 className="font-semibold text-red-800">
                            Unable to load analysis
                        </h1>

                        <p className="mt-2 text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!data) {
        return null;
    }

    const { resume, analysis } = data;

    // ==========================================
    // ANALYSIS NOT AVAILABLE
    // ==========================================

    if (!analysis) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/resume-analyzer")
                        }
                        className="mb-6 text-sm font-medium text-violet-600 hover:text-violet-700"
                    >
                        ← Back to Resumes
                    </button>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
                        <div className="text-4xl">📄</div>

                        <h1 className="mt-4 text-xl font-semibold text-slate-900">
                            Analysis not available
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            This resume does not have an AI
                            analysis yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Resume status: {resume.status}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/resume-analyzer")
                        }
                        className="mb-5 text-sm font-medium text-violet-600 transition hover:text-violet-700"
                    >
                        ← Back to Resumes
                    </button>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                                Career AI
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                Resume Analysis
                            </h1>

                            <p className="mt-2 max-w-2xl truncate text-sm text-slate-500">
                                {resume.fileName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                AI Model
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {analysis.aiModel || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ==========================================
                    SCORE CARDS
                ========================================== */}

                <div className="grid gap-5 md:grid-cols-2">
                    <ScoreCard
                        title="Overall Score"
                        score={analysis.overallScore}
                        description="Overall resume quality"
                        icon="★"
                    />

                    <ScoreCard
                        title="ATS Score"
                        score={analysis.atsScore}
                        description="Applicant tracking compatibility"
                        icon="✓"
                    />
                </div>

                {/* ==========================================
                    SUMMARY
                ========================================== */}

                <Section title="AI Summary">
                    <p className="leading-7 text-slate-600">
                        {analysis.summary ||
                            "No summary available."}
                    </p>
                </Section>

                {/* ==========================================
                    STRENGTHS / WEAKNESSES
                ========================================== */}

                <div className="grid gap-5 lg:grid-cols-2">
                    <ListSection
                        title="Strengths"
                        items={analysis.strengths}
                        type="success"
                    />

                    <ListSection
                        title="Weaknesses"
                        items={analysis.weaknesses}
                        type="warning"
                    />
                </div>

                {/* ==========================================
                    SUGGESTIONS
                ========================================== */}

                <ListSection
                    title="Improvement Suggestions"
                    items={analysis.suggestions}
                    type="info"
                />

                {/* ==========================================
                    SKILLS
                ========================================== */}

                <div className="grid gap-5 lg:grid-cols-2">
                    <TagSection
                        title="Detected Skills"
                        items={analysis.skills}
                        variant="success"
                    />

                    <TagSection
                        title="Missing Skills"
                        items={analysis.missingSkills}
                        variant="warning"
                    />
                </div>

                {/* ==========================================
                    KEYWORDS
                ========================================== */}

                <div className="grid gap-5 lg:grid-cols-2">
                    <TagSection
                        title="Detected Keywords"
                        items={analysis.keywords}
                        variant="info"
                    />

                    <TagSection
                        title="Missing Keywords"
                        items={analysis.missingKeywords}
                        variant="warning"
                    />
                </div>

                {/* ==========================================
                    EXPERIENCE
                ========================================== */}

                <AnalysisObjectSection
                    title="Experience Analysis"
                    data={analysis.experienceAnalysis}
                />

                {/* ==========================================
                    EDUCATION
                ========================================== */}

                <AnalysisObjectSection
                    title="Education Analysis"
                    data={analysis.educationAnalysis}
                />

                {/* ==========================================
                    PROJECTS
                ========================================== */}

                <AnalysisObjectSection
                    title="Projects Analysis"
                    data={analysis.projectsAnalysis}
                />

                {/* ==========================================
                    AI USAGE
                ========================================== */}

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Analysis Metadata
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <MetaItem
                            label="Input Tokens"
                            value={analysis.inputTokens}
                        />

                        <MetaItem
                            label="Output Tokens"
                            value={analysis.outputTokens}
                        />

                        <MetaItem
                            label="Total Tokens"
                            value={analysis.totalTokens}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({
    title,
    score,
    description,
    icon,
}: {
    title: string;
    score: number | null;
    description: string;
    icon: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-5">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-4xl font-bold text-violet-700">
                        {score ?? "-"}
                        {score !== null && (
                            <span className="text-lg font-medium text-slate-400">
                                /100
                            </span>
                        )}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <span className="text-2xl font-bold text-violet-700">
                        {icon}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ======================================================
// COMMON SECTION
// ======================================================

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
                {title}
            </h2>

            <div className="mt-4">
                {children}
            </div>
        </section>
    );
}

// ======================================================
// LIST SECTION
// ======================================================

function ListSection({
    title,
    items,
    type,
}: {
    title: string;
    items: string[] | null;
    type: "success" | "warning" | "info";
}) {
    const values = items || [];

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
                {title}
            </h2>

            {values.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                    No information available.
                </p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {values.map((item, index) => (
                        <li
                            key={`${item}-${index}`}
                            className="flex gap-3 text-sm leading-6 text-slate-600"
                        >
                            <span
                                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${type === "success"
                                        ? "bg-emerald-500"
                                        : type === "warning"
                                            ? "bg-amber-500"
                                            : "bg-violet-500"
                                    }`}
                            />

                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ======================================================
// TAG SECTION
// ======================================================

function TagSection({
    title,
    items,
    variant,
}: {
    title: string;
    items: string[] | null;
    variant: "success" | "warning" | "info";
}) {
    const values = items || [];

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
                {title}
            </h2>

            {values.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                    No information available.
                </p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                    {values.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${variant === "success"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : variant === "warning"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-violet-50 text-violet-700"
                                }`}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}

// ======================================================
// OBJECT ANALYSIS
// ======================================================

function AnalysisObjectSection({
    title,
    data,
}: {
    title: string;
    data:
    | {
        summary?: string;
        strengths?: string[];
        gaps?: string[];
        improvements?: string[];
    }
    | null;
}) {
    if (!data) {
        return null;
    }

    let secondaryItems: string[] = [];
    let secondaryTitle = "";

    if (data.gaps?.length) {
        secondaryItems = data.gaps;
        secondaryTitle = "Gaps";
    } else if (data.improvements?.length) {
        secondaryItems = data.improvements;
        secondaryTitle = "Improvements";
    } else if (data.strengths?.length) {
        secondaryItems = data.strengths;
        secondaryTitle = "Strengths";
    }

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
                {title}
            </h2>

            {data.summary && (
                <p className="mt-4 leading-7 text-slate-600">
                    {data.summary}
                </p>
            )}

            {secondaryItems.length > 0 && (
                <div className="mt-5">
                    <h3 className="text-sm font-semibold text-slate-700">
                        {secondaryTitle}
                    </h3>

                    <ul className="mt-3 space-y-2">
                        {secondaryItems.map(
                            (item, index) => (
                                <li
                                    key={`${item}-${index}`}
                                    className="text-sm leading-6 text-slate-600"
                                >
                                    • {item}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </section>
    );
}

// ======================================================
// METADATA
// ======================================================

function MetaItem({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
                {value ?? "-"}
            </p>
        </div>
    );
}