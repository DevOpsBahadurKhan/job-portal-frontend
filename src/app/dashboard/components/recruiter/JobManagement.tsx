
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    X,
    MapPin,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Building2,
    IndianRupee,
} from "lucide-react";

import { apiClient } from "@/lib/api";

interface Company {
    id: number;
    name: string;
    description?: string | null;
    website?: string | null;
    location?: string | null;
}

interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    jobType: string;
    status: string;
    skills: string;
    companyId: number;
    createdAt?: string;
    company?: {
        id: number;
        name: string;
    };
}

interface JobFormData {
    title: string;
    description: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    jobType: string;
    status: string;
    skills: string;
}

const initialForm: JobFormData = {
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "FULL_TIME",
    status: "OPEN",
    skills: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

function getJobList(data: unknown): Job[] {
    if (Array.isArray(data)) return data as Job[];

    if (data && typeof data === "object") {
        const result = data as {
            jobs?: Job[];
            data?: Job[];
            results?: Job[];
        };

        if (Array.isArray(result.jobs)) return result.jobs;
        if (Array.isArray(result.results)) return result.results;
        if (Array.isArray(result.data)) return result.data;
    }

    return [];
}

function getCompany(data: unknown): Company | null {
    if (!data || typeof data !== "object") return null;

    const result = data as Company | { company?: Company };

    if ("company" in result) return result.company ?? null;

    return "id" in result ? (result as Company) : null;
}

export default function JobManagement() {
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [viewingJob, setViewingJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState<JobFormData>(initialForm);

    const fetchJobs = useCallback(async (refresh = false) => {
        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            // Recruiter ki company identify karo.
            const companyResponse = await apiClient.getMyCompany();

            if (!companyResponse.success || !companyResponse.data) {
                setCompany(null);
                setJobs([]);
                setError(
                    companyResponse.error ||
                    "Company profile nahi mili. Pehle company create karein."
                );
                return;
            }

            const currentCompany = getCompany(companyResponse.data);

            if (!currentCompany?.id) {
                setCompany(null);
                setJobs([]);
                setError("Valid company details nahi mili.");
                return;
            }

            setCompany(currentCompany);

            // Sirf recruiter ki company ke jobs fetch karo.
            const response = await apiClient.getJobs({
                page: 1,
                limit: 100,
                companyId: currentCompany.id,
            });

            if (!response.success) {
                setError(response.error || "Failed to load jobs.");
                setJobs([]);
                return;
            }

            const jobList = getJobList(response.data);

            // API response mein company relation missing ho tab bhi
            // current company ka naam UI mein available rahega.
            setJobs(
                jobList.map((job) => ({
                    ...job,
                    company: job.company ?? {
                        id: currentCompany.id,
                        name: currentCompany.name,
                    },
                }))
            );
        } catch {
            setError("Jobs load karte waqt error aaya.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void fetchJobs();
    }, [fetchJobs]);

    const resetForm = () => {
        setFormData(initialForm);
        setEditingJob(null);
        setShowForm(false);
        setFormError("");
    };

    const openCreateForm = () => {
        setError("");
        setSuccess("");
        setViewingJob(null);
        setEditingJob(null);
        setFormData(initialForm);
        setFormError("");
        setShowForm(true);
    };

    const openEditForm = (job: Job) => {
        setError("");
        setSuccess("");
        setViewingJob(null);
        setEditingJob(job);
        setFormError("");

        setFormData({
            title: job.title ?? "",
            description: job.description ?? "",
            location: job.location ?? "",
            salaryMin: String(job.salaryMin ?? ""),
            salaryMax: String(job.salaryMax ?? ""),
            jobType: job.jobType ?? "FULL_TIME",
            status: job.status ?? "ACTIVE",
            skills: job.skills ?? "",
        });

        setShowForm(true);
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setFormError("");
        setError("");
        setSuccess("");

        if (!company?.id) {
            setFormError("Job post karne se pehle company profile create karein.");
            return;
        }

        const salaryMin = Number(formData.salaryMin);
        const salaryMax = Number(formData.salaryMax);

        if (!formData.title.trim()) {
            setFormError("Job title required hai.");
            return;
        }

        if (!formData.description.trim()) {
            setFormError("Job description required hai.");
            return;
        }

        if (!formData.location.trim()) {
            setFormError("Job location required hai.");
            return;
        }

        if (
            formData.salaryMin.trim() === "" ||
            formData.salaryMax.trim() === "" ||
            !Number.isFinite(salaryMin) ||
            !Number.isFinite(salaryMax) ||
            salaryMin < 0 ||
            salaryMax < salaryMin
        ) {
            setFormError("Valid salary range enter karein.");
            return;
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            salaryMin,
            salaryMax,
            jobType: formData.jobType,
            status: formData.status,
            skills: formData.skills.trim(),
            companyId: company.id,
        };

        setSaving(true);

        try {
            const response = editingJob
                ? await apiClient.updateJob(editingJob.id, payload)
                : await apiClient.createJob(payload);

            if (!response.success) {
                setFormError(
                    response.error ||
                    `Job ${editingJob ? "update" : "create"} nahi ho saka.`
                );
                return;
            }

            const wasEditing = Boolean(editingJob);

            resetForm();

            setSuccess(
                wasEditing
                    ? "Job updated successfully."
                    : "Job created successfully."
            );

            await fetchJobs(true);
        } catch {
            setFormError(
                `Job ${editingJob ? "update" : "create"} karte waqt error aaya.`
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (job: Job) => {
        const confirmed = window.confirm(
            `"${job.title}" job delete karna chahte hain?`
        );

        if (!confirmed) return;

        setDeletingId(job.id);
        setError("");
        setSuccess("");

        try {
            const response = await apiClient.deleteJob(job.id);

            if (!response.success) {
                setError(response.error || "Job delete nahi ho saka.");
                return;
            }

            setJobs((current) =>
                current.filter((item) => item.id !== job.id)
            );

            if (viewingJob?.id === job.id) {
                setViewingJob(null);
            }

            if (editingJob?.id === job.id) {
                resetForm();
            }

            setSuccess("Job deleted successfully.");
        } catch {
            setError("Job delete karte waqt error aaya.");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const query = searchTerm.trim().toLowerCase();

        return (
            job.title.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query) ||
            job.jobType.toLowerCase().includes(query) ||
            (job.skills ?? "").toLowerCase().includes(query)
        );
    });

    const activeJobs = jobs.filter(
        (job) => job.status === "ACTIVE" || job.status === "OPEN"
    ).length;

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                Loading jobs...
            </div>
        );
    }

    return (
        <section className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                        <BriefcaseBusiness className="h-4 w-4" />
                        Recruiter / Job Management
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Job Management
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Create, manage and track your job postings.
                    </p>

                    {company && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <Building2 className="h-4 w-4" />
                            {company.name}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => void fetchJobs(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        disabled={!company || saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Create Job
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Jobs"
                    value={jobs.length}
                    icon={<BriefcaseBusiness className="h-5 w-5" />}
                />
                <StatCard
                    label="Active Jobs"
                    value={activeJobs}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                />
                <StatCard
                    label="Company"
                    value={company ? company.name : "Missing"}
                    icon={<Building2 className="h-5 w-5" />}
                />
            </div>

            {/* Create / Edit form */}
            {showForm && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                {editingJob ? "Edit Job" : "Create New Job"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Company: {company?.name ?? "Not available"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                            aria-label="Close form"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                        {formError && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Job Title *</label>
                                <input
                                    className={inputClass}
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Senior Node.js Developer"
                                    required
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Location *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className={`${inputClass} pl-10`}
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                location: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. Jaipur / Remote"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Job Type *</label>
                                <select
                                    className={inputClass}
                                    value={formData.jobType}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            jobType: e.target.value,
                                        }))
                                    }
                                    required
                                >
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="INTERNSHIP">Internship</option>
                                    <option value="REMOTE">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Minimum Salary (₹) *</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className={`${inputClass} pl-10`}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.salaryMin}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                salaryMin: e.target.value,
                                            }))
                                        }
                                        placeholder="300000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Maximum Salary (₹) *</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className={`${inputClass} pl-10`}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.salaryMax}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                salaryMax: e.target.value,
                                            }))
                                        }
                                        placeholder="600000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status *</label>
                                <select
                                    className={inputClass}
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    required
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Required Skills</label>
                                <input
                                    className={inputClass}
                                    value={formData.skills}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            skills: e.target.value,
                                        }))
                                    }
                                    placeholder="Node.js, Express, MySQL"
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    Comma-separated skills.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Job Description *</label>
                                <textarea
                                    className={`${inputClass} resize-y`}
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Responsibilities, requirements and qualifications..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving && (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                )}
                                {saving
                                    ? "Saving..."
                                    : editingJob
                                        ? "Save Changes"
                                        : "Publish Job"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View details */}
            {viewingJob && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-start justify-between border-b border-slate-100 p-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                                Job Details
                            </p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">
                                {viewingJob.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {viewingJob.company?.name ?? company?.name}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setViewingJob(null)}
                            aria-label="Close job details"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Detail label="Location" value={viewingJob.location} />
                            <Detail
                                label="Job Type"
                                value={viewingJob.jobType.replaceAll("_", " ")}
                            />
                            <Detail
                                label="Status"
                                value={viewingJob.status}
                            />
                            <Detail
                                label="Minimum Salary"
                                value={`₹${viewingJob.salaryMin.toLocaleString("en-IN")}`}
                            />
                            <Detail
                                label="Maximum Salary"
                                value={`₹${viewingJob.salaryMax.toLocaleString("en-IN")}`}
                            />
                            <Detail
                                label="Required Skills"
                                value={viewingJob.skills || "Not specified"}
                            />
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-slate-900">
                                Description
                            </h3>
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                {viewingJob.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => openEditForm(viewingJob)}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Job
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleDelete(viewingJob)}
                                disabled={deletingId === viewingJob.id}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs list */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="font-semibold text-slate-900">Your Job Postings</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {jobs.length} job{jobs.length === 1 ? "" : "s"} found
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            className={`${inputClass} py-2.5 pl-9`}
                            type="search"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {jobs.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                        <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                        <h3 className="font-semibold text-slate-900">No jobs yet</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Create your first job posting to get started.
                        </p>
                        {company && (
                            <button
                                type="button"
                                onClick={openCreateForm}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Create First Job
                            </button>
                        )}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <p className="px-5 py-12 text-center text-sm text-slate-500">
                        No jobs match "{searchTerm}".
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Job</th>
                                    <th className="px-5 py-4 font-semibold">Location</th>
                                    <th className="px-5 py-4 font-semibold">Salary</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/70">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">
                                                {job.title}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {job.jobType.replaceAll("_", " ")}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {job.location}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            ₹{job.salaryMin.toLocaleString("en-IN")} – ₹
                                            {job.salaryMax.toLocaleString("en-IN")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${job.status === "ACTIVE" || job.status === "OPEN"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : job.status === "CLOSED"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1.5">
                                                <ActionButton
                                                    label="View job"
                                                    onClick={() => setViewingJob(job)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </ActionButton>

                                                <ActionButton
                                                    label="Edit job"
                                                    onClick={() => openEditForm(job)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </ActionButton>

                                                <ActionButton
                                                    label="Delete job"
                                                    danger
                                                    disabled={deletingId === job.id}
                                                    onClick={() => void handleDelete(job)}
                                                >
                                                    {deletingId === job.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {refreshing && (
                    <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                        Updating job list...
                    </div>
                )}
            </div>
        </section>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

function ActionButton({
    children,
    label,
    onClick,
    danger = false,
    disabled = false,
}: {
    children: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-lg border p-2 transition disabled:opacity-50 ${danger
                    ? "border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
        >
            {children}
        </button>
    );
}
