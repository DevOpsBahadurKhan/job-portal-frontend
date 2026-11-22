'use client';

import type { FormEvent } from "react";
import { HomeIcon } from "./home-icons";
import { jobTypeOptions } from "./home-data";

interface HomeSearchPanelProps {
  keyword: string;
  location: string;
  jobType: string;
  popularTerms: readonly string[];
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onPopularTermClick: (term: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function HomeSearchPanel({
  keyword,
  location,
  jobType,
  popularTerms,
  onKeywordChange,
  onLocationChange,
  onJobTypeChange,
  onPopularTermClick,
  onSubmit,
}: HomeSearchPanelProps) {
  return (
    <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8" aria-label="Search for jobs">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block text-left" htmlFor="home-job-keyword">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Job Title / Keyword
              </span>
              <span className="relative block">
                <HomeIcon
                  name="search"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="home-job-keyword"
                  name="search"
                  type="text"
                  placeholder="e.g. Node.js Developer"
                  value={keyword}
                  onChange={(event) => onKeywordChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </span>
            </label>

            <label className="block text-left" htmlFor="home-job-location">
              <span className="mb-2 block text-sm font-medium text-gray-700">Location</span>
              <span className="relative block">
                <HomeIcon
                  name="location"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="home-job-location"
                  name="location"
                  type="text"
                  placeholder="e.g. Remote, New York"
                  value={location}
                  onChange={(event) => onLocationChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </span>
            </label>

            <label className="block text-left" htmlFor="home-job-type">
              <span className="mb-2 block text-sm font-medium text-gray-700">Job Type</span>
              <select
                id="home-job-type"
                name="jobType"
                value={jobType}
                onChange={(event) => onJobTypeChange(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {jobTypeOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-left">
              <span className="text-sm text-gray-500">Popular:</span>
              {popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onPopularTermClick(term)}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {term}
                </button>
              ))}
            </div>
            <button
              className="shrink-0 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              type="submit"
            >
              Search Jobs
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
