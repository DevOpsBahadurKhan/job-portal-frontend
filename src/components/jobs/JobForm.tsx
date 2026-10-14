
"use client";

import { useState } from "react";

interface JobFormProps {
    companyId: number;
    onSuccess?: () => void;
}

interface JobFormData {
    title: string;
    description: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    jobType: string;
    skills: string;
}

const initialForm: JobFormData = {
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "FULL_TIME",
    skills: "",
};

export default function JobForm({
    companyId,
    onSuccess,
}: JobFormProps) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (
        field: keyof JobFormData,
        value: string
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const salaryMin = Number(form.salaryMin);
        const salaryMax = Number(form.salaryMax);

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.location.trim() ||
            !form.skills.trim()
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (
            form.salaryMin === "" ||
            form.salaryMax === "" ||
            !Number.isFinite(salaryMin) ||
            !Number.isFinite(salaryMax) ||
            salaryMin < 0 ||
            salaryMax < 0
        ) {
            setError("Please enter valid salary values.");
            return;
        }

        if (salaryMin > salaryMax) {
            setError("Minimum salary cannot exceed maximum salary.");
            return;
        }

        if (!companyId) {
            setError("Company information is missing.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            location: form.location.trim(),
            salaryMin,
            salaryMax,
            jobType: form.jobType,
            status: "OPEN",
            skills: form.skills.trim(),
            companyId,
        };

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Failed to create job");
            }

            setSuccess("Job posted successfully!");
            setForm(initialForm);
            onSuccess?.();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50";

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div>
                <h2 className="text-xl font-bold text-slate-900">
                    Post a New Job
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Fill in the details to publish a new job opportunity.
                </p>
            </div>

            {error && (
                <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Job title *
                    </label>
                    <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="e.g. UI/UX Designer"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Location *
                    </label>
                    <input
                        className={inputClass}
                        value={form.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="e.g. Remote"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Job type *
                    </label>
                    <select
                        className={inputClass}
                        value={form.jobType}
                        onChange={(e) => handleChange("jobType", e.target.value)}
                        disabled={loading}
                    >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="REMOTE">Remote</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Minimum salary *
                    </label>
                    <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={form.salaryMin}
                        onChange={(e) => handleChange("salaryMin", e.target.value)}
                        placeholder="40000"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Maximum salary *
                    </label>
                    <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={form.salaryMax}
                        onChange={(e) => handleChange("salaryMax", e.target.value)}
                        placeholder="70000"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                        Required skills *
                    </label>
                    <input
                        className={inputClass}
                        value={form.skills}
                        onChange={(e) => handleChange("skills", e.target.value)}
                        placeholder="Figma, Wireframing, Prototyping, UI Design"
                        disabled={loading}
                        required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Separate skills with commas.
                    </p>
                </div>

                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                        Job description *
                    </label>
                    <textarea
                        rows={5}
                        className={inputClass}
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Describe the role, responsibilities and requirements..."
                        disabled={loading}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Publishing..." : "Publish Job"}
                </button>
            </div>
        </form>
    );
}
