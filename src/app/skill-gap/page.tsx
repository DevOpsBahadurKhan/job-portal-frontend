"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import type {
    SkillGapData,
    LearningRoadmapItem,
} from "@/types/ISkillGap";
import Header from "@/components/Header";
function SkillGapContent() {
    const searchParams = useSearchParams();
    const jobIdParam = searchParams.get("jobId");
    const [data, setData] = useState<SkillGapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [jobIdInput, setJobIdInput] = useState(jobIdParam ?? "");
    const loadSkillGap = useCallback(async (jobId?: number) => {
        setLoading(true);
        setError("");
        try {
            const response = await apiClient.getSkillGap(jobId);
            if (!response.success || !response.data) {
                throw new Error(
                    response.error || "Unable to load skill gap analysis."
                );
            }
            setData(response.data);
        } catch (err) {
            setData(null);
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (jobIdParam && !/^[1-9]\d*$/.test(jobIdParam)) {
            setError("Invalid job ID.");
            setLoading(false);
            return;
        }
        void loadSkillGap(
            jobIdParam ? Number(jobIdParam) : undefined
        );
    }, [jobIdParam, loadSkillGap]);
    const handleJobSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = jobIdInput.trim();
        if (!trimmed) {
            void loadSkillGap();
            return;
        }
        if (!/^[1-9]\d*$/.test(trimmed)) {
            setError("Please enter a valid positive job ID.");
            return;
        }
        void loadSkillGap(Number(trimmed));
    };
    if (loading) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12">
                <p className="text-sm text-gray-500">
                    Loading your skill gap analysis...
                </p>
            </main>
        );
    }
    if (error && !data) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="text-2xl font-bold">Skill Gap Analysis</h1>
                <p className="mt-4 text-red-600">{error}</p>
                <button
                    onClick={() =>
                        void loadSkillGap(
                            jobIdParam ? Number(jobIdParam) : undefined
                        )
                    }
                    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white"
                >
                    Try Again
                </button>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                {/* HEADER */}
                <Header />
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Analyze for a Job
                    </h2>
                    <form
                        onSubmit={handleJobSearch}
                        className="mt-4 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={jobIdInput}
                            onChange={(event) => setJobIdInput(event.target.value)}
                            placeholder="Enter job ID, e.g. 11"
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                        >
                            Analyze Job
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setJobIdInput("");
                                void loadSkillGap();
                            }}
                            className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            General Analysis
                        </button>
                    </form>
                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                </section>
                {data && (
                    <>
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Analyzing resume</p>
                            <h2 className="mt-1 break-words text-lg font-semibold text-gray-900">
                                {data.resume.fileName}
                            </h2>
                            {data.targetJob && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Target role:{" "}
                                    <span className="font-medium text-gray-900">
                                        {data.targetJob.title}
                                    </span>
                                </p>
                            )}
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <SummaryCard
                                    title="Your Skills"
                                    count={data.currentSkills.length}
                                    color="blue"
                                />
                                <SummaryCard
                                    title="Matched Skills"
                                    count={data.matchedSkills?.length ?? 0}
                                    color="green"
                                />
                                <SummaryCard
                                    title="Missing Skills"
                                    count={data.missingSkills.length}
                                    color="orange"
                                />
                            </div>
                        </section>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <SkillSection
                                title="Matched Skills"
                                skills={data.matchedSkills ?? []}
                                emptyMessage="Run a job-specific analysis to see matched skills."
                                color="green"
                            />
                            <SkillSection
                                title="Skills to Learn"
                                skills={data.missingSkills}
                                emptyMessage="Great! No missing skills were identified."
                                color="orange"
                            />
                        </div>
                        {data.requiredSkills && (
                            <SkillSection
                                title="Job Required Skills"
                                skills={data.requiredSkills}
                                emptyMessage="No required skills were provided for this job."
                                color="blue"
                            />
                        )}
                        <section className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    AI Learning Roadmap
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    A practical learning plan generated for your identified
                                    skill gaps.
                                </p>
                            </div>
                            {data.learningRoadmap?.length ? (
                                <div className="space-y-5">
                                    {data.learningRoadmap.map((item) => (
                                        <RoadmapCard
                                            key={`${item.skill}-${item.priority}`}
                                            item={item}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
                                    {data.missingSkills.length === 0
                                        ? "No skill gaps found for this analysis."
                                        : "The learning roadmap is unavailable right now. You can retry the analysis."}
                                    {data.missingSkills.length > 0 && (
                                        <button
                                            onClick={() =>
                                                void loadSkillGap(
                                                    data.targetJob?.id
                                                )
                                            }
                                            className="ml-2 font-medium text-blue-600 hover:underline"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Additional Recommendations
                            </h2>
                            {data.recommendations.length > 0 ? (
                                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                                    {data.recommendations.map((recommendation, index) => (
                                        <li key={`${recommendation}-${index}`}>
                                            {recommendation}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">
                                    No additional recommendations are available.
                                </p>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
function SummaryCard({
    title,
    count,
    color,
}: {
    title: string;
    count: number;
    color: "blue" | "green" | "orange";
}) {
    const styles = {
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700",
        orange: "bg-orange-50 text-orange-700",
    };
    return (
        <div className={`rounded-xl p-4 ${styles[color]}`}>
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-2 text-3xl font-bold">{count}</p>
        </div>
    );
}
function SkillSection({
    title,
    skills,
    emptyMessage,
    color,
}: {
    title: string;
    skills: string[];
    emptyMessage: string;
    color: "blue" | "green" | "orange";
}) {
    const styles = {
        blue: "border-blue-200 bg-blue-50 text-blue-800",
        green: "border-green-200 bg-green-50 text-green-800",
        orange: "border-orange-200 bg-orange-50 text-orange-800",
    };
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {skills.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${styles[color]}`}
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="mt-3 text-sm text-gray-500">{emptyMessage}</p>
            )}
        </section>
    );
}
function RoadmapCard({ item }: { item: LearningRoadmapItem }) {
    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Step {item.priority}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                        {item.skill}
                    </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                    {item.estimatedDuration}
                </span>
            </div>
            <div className="mt-5">
                <h4 className="font-semibold text-gray-900">Topics to learn</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                    {item.topicsToLearn.map((topic, index) => (
                        <li key={`${topic}-${index}`}>{topic}</li>
                    ))}
                </ul>
            </div>
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">Practical task</h4>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    {item.practicalTask}
                </p>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-gray-900">Expected outcome</h4>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    {item.expectedOutcome}
                </p>
            </div>
        </article>
    );
}
export default function SkillGapPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-6xl px-4 py-12">
                    <p className="text-sm text-gray-500">
                        Loading skill gap analysis...
                    </p>
                </main>
            }
        >
            <SkillGapContent />
        </Suspense>
    );
}
