'use client';

import { useState } from "react";
import Link from "next/link";
import type { Job } from "./home-data";
import { HomeIcon } from "./home-icons";

interface JobCardProps {
  job: Job;
  featured?: boolean;
}

export default function JobCard({ job, featured = false }: JobCardProps) {
  const [saved, setSaved] = useState(false);

  if (featured) {
    return (
      <article className="rounded-2xl bg-white p-7 shadow-xl ring-1 ring-blue-100 transition hover:-translate-y-1 hover:shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
              {job.logo}
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-sm text-gray-500">{job.company}</p>
              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            </div>
          </div>
          <button
            type="button"
            aria-label={`${saved ? "Remove" : "Save"} ${job.title}`}
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className={`shrink-0 rounded-md p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${saved ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
          >
            <HomeIcon name="bookmark" className="h-5 w-5" filled={saved} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
          <JobMeta icon="location" value={job.location} />
          <JobMeta icon="salary" value={job.salary} />
          <JobMeta icon="briefcase" value={job.jobType} />
          <JobMeta icon="check" value={job.experience} />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
            {job.logo}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={`${saved ? "Remove" : "Save"} ${job.title}`}
          aria-pressed={saved}
          onClick={() => setSaved((current) => !current)}
          className={`shrink-0 rounded-md p-1 text-lg leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${saved ? "text-blue-600" : "text-gray-300 hover:text-blue-600"}`}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <JobMeta icon="location" value={job.location} />
        <JobMeta icon="salary" value={job.salary} />
        <JobMeta icon="briefcase" value={`${job.jobType} · ${job.experience}`} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">{job.posted}</span>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

function JobMeta({ icon, value }: { icon: "location" | "salary" | "briefcase" | "check"; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <HomeIcon name={icon} className="h-4 w-4 shrink-0 text-blue-600" />
      <span className="truncate">{value}</span>
    </div>
  );
}
