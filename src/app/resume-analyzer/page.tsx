"use client";

import {
    ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    CheckCircle,
    Trash2,
    LoaderCircle,
    ArrowLeft,
} from "lucide-react";


import { useRouter } from "next/navigation";


import { apiClient } from "@/lib/api";
import type { Resume } from "@/types/IResume";
import Header from "@/components/Header";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeAnalyzerPage() {
    const router = useRouter();
    const [actionLoadingId, setActionLoadingId] =
        useState<number | null>(null);
    const [resumes, setResumes] =
        useState<Resume[]>([]);
    const [loading, setLoading] =
        useState(true);
    const [uploading, setUploading] =
        useState(false);
    const [error, setError] =
        useState("");
    const [success, setSuccess] =
        useState("");
    const fileInputRef =
        useRef<HTMLInputElement | null>(null);
    // ==========================================
    // LOAD RESUMES
    // ==========================================
    const loadResumes = async () => {
        try {
            setLoading(true);
            setError("");
            const response =
                await apiClient.getMyResumes();
            if (!response.success) {
                throw new Error(
                    response.error ||
                    "Unable to load resumes"
                );
            }
            setResumes(
                response.data || []
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load resumes"
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadResumes();
    }, []);
    // ==========================================
    // HANDLE SET DEFAULT
    // ==========================================
    const handleSetDefault = async (resumeId: number) => {
        try {
            setActionLoadingId(resumeId);
            setError("");
            setSuccess("");
            const response =
                await apiClient.setDefaultResume(resumeId);
            if (!response.success) {
                throw new Error(
                    response.error ||
                    "Unable to set default resume"
                );
            }
            setSuccess("Default resume updated successfully.");
            await loadResumes();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to set default resume"
            );
        } finally {
            setActionLoadingId(null);
        }
    };
    const handleDeleteResume = async (resumeId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this resume? This action cannot be undone."
        );
        if (!confirmed) return;
        try {
            setActionLoadingId(resumeId);
            setError("");
            setSuccess("");
            const response =
                await apiClient.deleteResume(resumeId);
            if (!response.success) {
                throw new Error(
                    response.error ||
                    "Unable to delete resume"
                );
            }
            setSuccess("Resume deleted successfully.");
            await loadResumes();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete resume"
            );
        } finally {
            setActionLoadingId(null);
        }
    };
    // ==========================================
    // UPLOAD RESUME
    // ==========================================
    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        setError("");
        setSuccess("");
        // PDF validation
        if (
            file.type !== "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {
            setError(
                "Only PDF resumes are supported."
            );
            return;
        }
        // Size validation
        if (file.size > MAX_FILE_SIZE) {
            setError(
                "Resume file size must be less than 5 MB."
            );
            return;
        }
        try {
            setUploading(true);
            const response =
                await apiClient.uploadResume(
                    file
                );
            if (
                !response.success ||
                !response.data
            ) {
                throw new Error(
                    response.error ||
                    "Resume upload failed"
                );
            }
            setSuccess(
                "Resume uploaded successfully. AI analysis is processing..."
            );
            setResumes((current) => [
                response.data,
                ...current,
            ]);
            void pollResumeStatus(
                response.data.id
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Resume upload failed"
            );
        } finally {
            setUploading(false);
        }
    };
    // ==========================================
    // POLL PROCESSING STATUS
    // ==========================================
    const pollResumeStatus = async (
        resumeId: number
    ) => {
        const maxAttempts = 30;
        const interval = 3000;
        for (
            let attempt = 0;
            attempt < maxAttempts;
            attempt++
        ) {
            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    interval
                )
            );
            try {
                const response =
                    await apiClient.getMyResumes();
                if (!response.success) {
                    continue;
                }
                const updatedResumes =
                    response.data || [];
                setResumes(updatedResumes);
                const resume =
                    updatedResumes.find(
                        (item) =>
                            item.id === resumeId
                    );
                if (!resume) {
                    continue;
                }
                if (
                    resume.status ===
                    "COMPLETED"
                ) {
                    setSuccess(
                        "Resume analysis completed successfully."
                    );
                    return;
                }
                if (
                    resume.status ===
                    "FAILED"
                ) {
                    setError(
                        "Resume analysis failed. Please try again."
                    );
                    return;
                }
            } catch {
                // Keep polling
            }
        }
        setError(
            "Resume is taking longer than expected. Refresh the page to check its status."
        );
    };
    // ==========================================
    // FILE PICKER
    // ==========================================
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };
    // ==========================================
    // UI
    // ==========================================
    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl">

                {/* HEADER */}
                <Header />



                {/* UPLOAD */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-10 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                            📄
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Upload your resume
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            Upload a PDF resume and
                            our AI will analyze your
                            ATS score, skills,
                            keywords and improvement
                            areas.
                        </p>
                        <button
                            type="button"
                            onClick={
                                openFilePicker
                            }
                            disabled={uploading}
                            className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uploading
                                ? "Uploading..."
                                : "Choose PDF Resume"}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={
                                handleFileChange
                            }
                            className="hidden"
                        />
                        <p className="mt-3 text-xs text-slate-400">
                            PDF only · Maximum 5 MB
                        </p>
                    </div>
                </section>
                {/* SUCCESS  */}
                {success && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                )}
                {/*  ERROR  */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {/* RESUMES */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">
                            My Resumes
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your uploaded
                            resumes and view their
                            analysis.
                        </p>
                    </div>
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                            Loading your resumes...
                        </div>
                    )}
                    {!loading &&
                        resumes.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                <div className="text-3xl">
                                    📄
                                </div>
                                <h3 className="mt-3 font-semibold text-slate-900">
                                    No resumes yet
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Upload your first
                                    PDF resume to
                                    get started.
                                </p>
                            </div>
                        )}
                    {!loading &&
                        resumes.length > 0 && (
                            <div className="grid gap-4">
                                {resumes.map((resume) => (
                                    <ResumeCard
                                        key={resume.id}
                                        resume={resume}
                                        actionLoading={
                                            actionLoadingId === resume.id
                                        }
                                        onSetDefault={handleSetDefault}
                                        onDelete={handleDeleteResume}
                                    />
                                ))}
                            </div>
                        )}
                </section>
            </div>
        </main>
    );
}


// ==========================================
// RESUME CARD
// ==========================================

function ResumeCard({
    resume,
    actionLoading,
    onSetDefault,
    onDelete,
}: {
    resume: Resume;
    actionLoading: boolean;
    onSetDefault: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const router = useRouter();

    const isProcessing =
        resume.status === "PROCESSING";

    const isCompleted =
        resume.status === "COMPLETED";

    const isFailed =
        resume.status === "FAILED";

    const hasAnalysis =
        isCompleted &&
        !!resume.analysis;

    const openAnalysis = () => {
        if (!hasAnalysis) {
            return;
        }

        router.push(
            `/resume-analyzer/${resume.id}`
        );
    };

    return (
        <article
            onClick={openAnalysis}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${hasAnalysis
                ? "cursor-pointer hover:border-violet-300 hover:shadow-md"
                : ""
                }`}
        >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* FILE */}

                <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                        📄
                    </div>

                    <div className="min-w-0">

                        <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-slate-900">
                                {resume.fileName}
                            </h3>

                            {resume.isDefault && (
                                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700">
                                    DEFAULT
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            Uploaded{" "}
                            {new Date(
                                resume.uploadedAt
                            ).toLocaleDateString()}
                        </p>

                        {hasAnalysis && (
                            <p className="mt-2 text-xs font-semibold text-violet-600">
                                View full analysis →
                            </p>
                        )}
                    </div>
                </div>

                {/* STATUS */}

                <div className="flex items-center gap-3">

                    {isProcessing && (
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            ⏳ Processing
                        </span>
                    )}

                    {isFailed && (
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                            Failed
                        </span>
                    )}

                    {hasAnalysis && (
                        <>
                            <ScoreBox
                                label="Overall"
                                value={
                                    resume.analysis!
                                        .overallScore
                                }
                            />

                            <ScoreBox
                                label="ATS"
                                value={
                                    resume.analysis!
                                        .atsScore
                                }
                            />
                        </>
                    )}

                    {isCompleted &&
                        !resume.analysis && (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                                Analysis unavailable
                            </span>
                        )}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {!resume.isDefault && (
                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={(event) => {
                            event.stopPropagation();
                            onSetDefault(resume.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        Set as Default
                    </button>
                )}

                {resume.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="h-4 w-4" />
                        Current Default
                    </span>
                )}

                <button
                    type="button"
                    disabled={actionLoading}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(resume.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                    {actionLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                </button>
            </div>
        </article>

    );
}

// ==========================================
// SCORE BOX
// ==========================================

function ScoreBox({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    return (
        <div className="min-w-[70px] rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p className="text-lg font-bold text-violet-700">
                {value ?? "-"}
            </p>

            <p className="text-[10px] font-medium uppercase text-slate-400">
                {label}
            </p>
        </div>
    );
}