"use client";

import Link from "next/link";
import {
    MapPin,
    BriefcaseBusiness,
    IndianRupee,
    Pencil,
    Trash2,
    ArrowUpRight,
} from "lucide-react";

interface JobCardProps {
    job: {
        id: string;
        title: string;
        description: string;
        location: string;
        salaryMin?: number | null;
        salaryMax?: number | null;
        jobType: string;
        status: string;
        skills: string;
    };
    canManage: boolean;
    isDeleting: boolean;
    onDelete: (jobId: string) => void;
}

export default function JobCard({
    job,
    canManage,
    isDeleting,
    onDelete,
}: JobCardProps) {
    const salary =
        job.salaryMin != null && job.salaryMax != null
            ? `₹${ job.salaryMin.toLocaleString("en-IN") } - ₹${ job.salaryMax.toLocaleString("en-IN") } `
            : job.salaryMin != null
              ? `From ₹${ job.salaryMin.toLocaleString("en-IN") } `
              : job.salaryMax != null
                ? `Up to ₹${ job.salaryMax.toLocaleString("en-IN") } `
                : "Not disclosed";

    const statusStyles =
        job.status === "OPEN"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : job.status === "CLOSED"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-100 text-slate-600";

    const skills =
        job.skills
            ?.split(",")
            .map((skill) => skill.trim())
            .filter(Boolean) ?? [];

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                        {job.title}
                    </h3>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{job.location}</span>
                    </p>
                </div>

                {/* Status Badge */}
                <span
                    className={`inline - flex shrink - 0 items - center rounded - full border px - 2.5 py - 1 text - [11px] font - semibold tracking - wide ${ statusStyles } `}
                >
                    <span
                        className={`mr - 1.5 h - 1.5 w - 1.5 rounded - full ${
    job.status === "OPEN"
        ? "bg-emerald-500"
        : job.status === "CLOSED"
            ? "bg-red-500"
            : "bg-slate-400"
} `}
                    />
                    {job.status}
                </span>
            </div>

            {/* Description */}
            <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">
                {job.description}
            </p>

            {/* Skills */}
            {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((skill, index) => (
                        <span
                            key={`${ skill } -${ index } `}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 sm:text-xs"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            <div className="my-3 border-t border-slate-100" />

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{salary.replace(/^₹/, "")}</span>
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        <BriefcaseBusiness className="h-3 w-3" />
                        {job.jobType.replaceAll("_", " ")}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Job Details */}
                    <Link
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`View details for ${ job.title }`}
                    >
                        View Job Details
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>

                    {/* Recruiter/Admin Actions */}
                    {canManage && (
                        <>
                            <Link
                                href={`/ jobs / ${ job.id } / edit`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Link>

                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => onDelete(job.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
