
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    ExternalLink,
    LoaderCircle,
    RefreshCw,
    UserRound,
    X,
} from "lucide-react";
import { apiClient } from "@/lib/api";

type ApplicationStatus =
    | "APPLIED"
    | "SHORTLISTED"
    | "REJECTED"
    | "HIRED";

type InterviewMode = "ONLINE" | "PHONE" | "IN_PERSON";

type Application = {
    id: number;
    status: ApplicationStatus;
    createdAt: string;
    coverLetter?: string | null;
    resumeUrl?: string | null;
    candidate?: {
        id: number;
        name?: string;
        email?: string;
    };
    job?: {
        id: number;
        title: string;
        recruiterId?: number;
    };
};

type Interview = {
    id: number;
    scheduledAt: string;
    durationMinutes: number;
    mode: InterviewMode;
    meetingLink?: string | null;
    location?: string | null;
    notes?: string | null;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
};

const STATUSES: ApplicationStatus[] = [
    "APPLIED",
    "SHORTLISTED",
    "REJECTED",
    "HIRED",
];

const emptyInterviewForm = {
    scheduledAt: "",
    durationMinutes: 30,
    mode: "ONLINE" as InterviewMode,
    meetingLink: "",
    location: "",
    notes: "",
};

export default function ApplicationsManagement() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedApplication, setSelectedApplication] =
        useState<Application | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);
    const [showInterviewForm, setShowInterviewForm] = useState(false);
    const [form, setForm] = useState(emptyInterviewForm);
    const [savingInterview, setSavingInterview] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await apiClient.getRecruiterApplications();

            if (!result.success) {
                throw new Error(result.error || "Failed to load applications.");
            }

            setApplications(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplications();
    }, [loadApplications]);

    const loadInterviews = async (applicationId: number) => {
        setInterviewsLoading(true);
        setError("");

        try {
            const result = await apiClient.getApplicationInterviews(applicationId);

            if (!result.success) {
                throw new Error(result.error || "Failed to load interviews.");
            }

            setInterviews(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load interviews."
            );
            setInterviews([]);
        } finally {
            setInterviewsLoading(false);
        }
    };

    const openInterviewPanel = async (application: Application) => {
        setSelectedApplication(application);
        setShowInterviewForm(false);
        setForm(emptyInterviewForm);
        setMessage("");
        await loadInterviews(application.id);
    };

    const handleStatusChange = async (
        applicationId: number,
        status: ApplicationStatus
    ) => {
        setUpdatingId(applicationId);
        setError("");
        setMessage("");

        try {
            const result = await apiClient.updateApplicationStatus(
                applicationId,
                status
            );

            if (!result.success) {
                throw new Error(result.error || "Failed to update status.");
            }

            setApplications((current) =>
                current.map((application) =>
                    application.id === applicationId
                        ? { ...application, status }
                        : application
                )
            );

            setMessage("Application status updated.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleScheduleInterview = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedApplication) return;

        setSavingInterview(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                scheduledAt: new Date(form.scheduledAt).toISOString(),
                durationMinutes: Number(form.durationMinutes),
                mode: form.mode,
                ...(form.meetingLink.trim()
                    ? { meetingLink: form.meetingLink.trim() }
                    : {}),
                ...(form.location.trim()
                    ? { location: form.location.trim() }
                    : {}),
                ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
            };

            const result = await apiClient.createInterview(
                selectedApplication.id,
                payload
            );

            if (!result.success) {
                throw new Error(result.error || "Failed to schedule interview.");
            }

            setMessage("Interview scheduled successfully.");
            setForm(emptyInterviewForm);
            setShowInterviewForm(false);
            await loadInterviews(selectedApplication.id);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to schedule interview."
            );
        } finally {
            setSavingInterview(false);
        }
    };

    const handleCancelInterview = async (interviewId: number) => {
        if (!selectedApplication) return;

        if (!window.confirm("Are you sure you want to cancel this interview?")) {
            return;
        }

        setError("");
        setMessage("");

        const result = await apiClient.cancelInterview(interviewId);

        if (!result.success) {
            setError(result.error || "Failed to cancel interview.");
            return;
        }

        setMessage("Interview cancelled.");
        await loadInterviews(selectedApplication.id);
    };

    const visibleApplications = applications.filter(
        (application) =>
            statusFilter === "ALL" || application.status === statusFilter
    );

    const getResumeUrl = (resumeUrl: string) => {
        if (/^https?:\/\//i.test(resumeUrl)) return resumeUrl;

        const baseUrl = (
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        ).replace(/\/$/, "");

        return `${baseUrl}/${resumeUrl.replace(/^\/+/, "")}`;
    };

    const statusClasses: Record<ApplicationStatus, string> = {
        APPLIED: "bg-blue-50 text-blue-700",
        SHORTLISTED: "bg-amber-50 text-amber-700",
        REJECTED: "bg-red-50 text-red-700",
        HIRED: "bg-emerald-50 text-emerald-700",
    };

    return (
        <section className="space-y-6">

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    {message}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                    <p className="text-sm text-slate-500">Total applications</p>
                    <p className="text-2xl font-bold text-slate-900">
                        {applications.length}
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    aria-label="Filter applications by status"
                >
                    <option value="ALL">All statuses</option>
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.replace("_", " ")}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                    <LoaderCircle className="animate-spin" size={20} />
                    Loading applications...
                </div>
            ) : visibleApplications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <UserRound className="mx-auto mb-3 text-slate-400" size={32} />
                    <h2 className="font-semibold text-slate-800">
                        No applications found
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Applications will appear here when candidates apply to your jobs.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleApplications.map((application) => (
                        <article
                            key={application.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                <div className="flex gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                                        <UserRound size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            {application.candidate?.name || "Candidate"}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {application.candidate?.email || "No email available"}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-700">
                                            {application.job?.title || "Job title unavailable"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Applied{" "}
                                            {application.createdAt
                                                ? new Date(application.createdAt).toLocaleDateString()
                                                : "—"}
                                            {" · "}Application #{application.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[application.status] ||
                                            "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {application.status}
                                    </span>

                                    {application.resumeUrl && (
                                        <a
                                            href={getResumeUrl(application.resumeUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Resume <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {application.coverLetter && (
                                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Cover letter
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                                        {application.coverLetter}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    Status
                                    <select
                                        value={application.status}
                                        disabled={updatingId === application.id}
                                        onChange={(event) =>
                                            void handleStatusChange(
                                                application.id,
                                                event.target.value as ApplicationStatus
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-60"
                                    >
                                        {STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>

                                    {updatingId === application.id && (
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin text-slate-500"
                                        />
                                    )}
                                </label>

                                <button
                                    type="button"
                                    onClick={() => void openInterviewPanel(application)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    <CalendarDays size={16} />
                                    Manage interviews
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Interview management
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedApplication.candidate?.name || "Candidate"} ·{" "}
                                    {selectedApplication.job?.title || "Job"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedApplication(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close interview management"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setMessage("");
                                    setShowInterviewForm((current) => !current);
                                }}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                {showInterviewForm ? "Close form" : "Schedule interview"}
                            </button>
                        </div>

                        {showInterviewForm && (
                            <form
                                onSubmit={handleScheduleInterview}
                                className="mt-5 space-y-4 rounded-xl border border-slate-200 p-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-1.5 text-sm font-medium text-slate-700">
                                        Date and time
                                        <input
                                            type="datetime-local"
                                            required
                                            min={new Date(Date.now() + 60000)
                                                .toISOString()
                                                .slice(0, 16)}
                                            value={form.scheduledAt}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    scheduledAt: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                        />
                                    </label>

                                    <label className="space-y-1.5 text-sm font-medium text-slate-700">
                                        Duration
                                        <select
                                            value={form.durationMinutes}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    durationMinutes: Number(event.target.value),
                                                }))
                                            }
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                        >
                                            {[15, 30, 45, 60, 90, 120].map((minutes) => (
                                                <option key={minutes} value={minutes}>
                                                    {minutes} minutes
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                                    Interview mode
                                    <select
                                        value={form.mode}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                mode: event.target.value as InterviewMode,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                    >
                                        <option value="ONLINE">Online</option>
                                        <option value="PHONE">Phone</option>
                                        <option value="IN_PERSON">In person</option>
                                    </select>
                                </label>

                                {form.mode === "ONLINE" && (
                                    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                                        Meeting link
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://meet.example.com/..."
                                            value={form.meetingLink}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    meetingLink: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                        />
                                    </label>
                                )}

                                {form.mode === "IN_PERSON" && (
                                    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                                        Interview location
                                        <input
                                            required
                                            placeholder="Office address"
                                            value={form.location}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    location: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                        />
                                    </label>
                                )}

                                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                                    Notes (optional)
                                    <textarea
                                        rows={3}
                                        placeholder="Interview agenda or instructions..."
                                        value={form.notes}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                notes: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={savingInterview}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {savingInterview && (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    )}
                                    Confirm interview
                                </button>
                            </form>
                        )}

                        <div className="mt-6">
                            <h3 className="font-semibold text-slate-900">
                                Scheduled interviews
                            </h3>

                            {interviewsLoading ? (
                                <p className="py-6 text-sm text-slate-500">
                                    Loading interviews...
                                </p>
                            ) : interviews.length === 0 ? (
                                <p className="py-6 text-sm text-slate-500">
                                    No interviews scheduled for this application.
                                </p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {interviews.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {new Date(interview.scheduledAt).toLocaleString()}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {interview.durationMinutes} minutes ·{" "}
                                                        {interview.mode.replace("_", " ")}
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                                        {interview.status}
                                                    </p>
                                                    {interview.meetingLink && (
                                                        <a
                                                            href={interview.meetingLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                                                        >
                                                            Open meeting <ExternalLink size={13} />
                                                        </a>
                                                    )}
                                                    {interview.location && (
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            Location: {interview.location}
                                                        </p>
                                                    )}
                                                    {interview.notes && (
                                                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                                            {interview.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                {interview.status === "SCHEDULED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleCancelInterview(interview.id)
                                                        }
                                                        className="h-fit rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
