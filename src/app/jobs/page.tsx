"use client";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  SlidersHorizontal,
  Bell,
  TrendingUp,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { jobTypeOptions } from "../../components/home/home-data";
import JobCard, { Job } from "@/components/jobs/JobCard";
import DeleteJobDialog from "@/components/jobs/DeleteJobDialog";
const JOBS_PER_PAGE = 10;
type PopularSearch = {
  keyword: string;
  searchCount: number;
};
type TopCompany = {
  id: number;
  name: string;
  location: string | null;
  website: string | null;
  openJobsCount: number;
};
type Filters = {
  search: string;
  location: string;
  jobType: string;
  minSalary: string;
};
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
const EMPTY_FILTERS: Filters = {
  search: "",
  location: "",
  jobType: "",
  minSalary: "",
};
const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: JOBS_PER_PAGE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};
function getInitialFilters(searchParams: {
  get: (key: string) => string | null;
}): Filters {
  return {
    search: searchParams.get("search") ?? "",
    location: searchParams.get("location") ?? "",
    jobType: searchParams.get("jobType") ?? "",
    minSalary: searchParams.get("salaryMin") ?? "",
  };
}
function JobsPageContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialFilters = getInitialFilters(searchParams);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);
  const [deletingJobId, setDeletingJobId] =
    useState<string | null>(null);
  const [selectedDeleteJob, setSelectedDeleteJob] =
    useState<Job | null>(null);
  const [draftFilters, setDraftFilters] =
    useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);
  const canManage =
    user?.role === "RECRUITER" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getPublicJobs({
        page,
        limit: JOBS_PER_PAGE,
        search: appliedFilters.search.trim() || undefined,
        location: appliedFilters.location.trim() || undefined,
        jobType: appliedFilters.jobType || undefined,
        salaryMin: appliedFilters.minSalary
          ? Number(appliedFilters.minSalary)
          : undefined,
      });
      if (!response.success) {
        setError(response.error || "Failed to fetch jobs");
        setJobs([]);
        setPagination(EMPTY_PAGINATION);
        return;
      }
      const jobsData = Array.isArray(response.data)
        ? response.data
        : [];
      setJobs(jobsData);
      setPagination(
        response.pagination ?? {
          page,
          limit: JOBS_PER_PAGE,
          total: jobsData.length,
          totalPages: jobsData.length > 0 ? 1 : 0,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        }
      );
    } catch (requestError) {
      console.error("Jobs fetch error:", requestError);
      setError("An error occurred while fetching jobs");
      setJobs([]);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);
  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);
  useEffect(() => {
    let cancelled = false;
    const loadSearchInsights = async () => {
      setInsightsLoading(true);
      try {
        const [searchResponse, companyResponse] = await Promise.all([
          apiClient.getPopularSearches(8),
          apiClient.getTopCompanies(5),
        ]);
        if (cancelled) return;
        if (searchResponse.success) {
          setPopularSearches(
            Array.isArray(searchResponse.data) ? searchResponse.data : []
          );
        } else {
          console.error("Popular searches fetch failed:", searchResponse.error);
        }
        if (companyResponse.success) {
          setTopCompanies(
            Array.isArray(companyResponse.data) ? companyResponse.data : []
          );
        } else {
          console.error("Top companies fetch failed:", companyResponse.error);
        }
      } catch (requestError) {
        if (!cancelled) {
          console.error("Failed to load search insights:", requestError);
        }
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    };
    void loadSearchInsights();
    return () => {
      cancelled = true;
    };
  }, []);
  // Handle filter input changes
  const handleFilterChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };
  // Submit search and filters
  const handleFilterSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const keyword = draftFilters.search.trim();
    // Track actual keyword searches without blocking job search
    if (keyword) {
      void apiClient.trackSearch(keyword).then((response) => {
        if (!response.success) {
          console.error(
            "Search tracking failed:",
            response.error
          );
        }
      }).catch((error) => {
        console.error("Search tracking failed:", error);
      });
    }
    setPage(1);
    setAppliedFilters(draftFilters);
    setMobileFiltersOpen(false);
  };
  // Clear all filters
  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };
  // Handle Popular Searches click
  const handlePopularSearch = (value: string) => {
    const nextFilters = {
      ...draftFilters,
      search: value,
    };
    // Track the selected popular keyword
    void apiClient.trackSearch(value).then((response) => {
      if (!response.success) {
        console.error(
          "Popular search tracking failed:",
          response.error
        );
      }
    }).catch((error) => {
      console.error("Popular search tracking failed:", error);
    });
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
  };
  // Delete job
  const handleDeleteJob = async () => {
    if (!selectedDeleteJob) return;

    const jobId = selectedDeleteJob.id;
    setDeletingJobId(jobId);
    setError("");

    try {
      const numericJobId = Number(jobId);

      if (!Number.isFinite(numericJobId) || numericJobId <= 0) {
        setError("Invalid job ID.");
        return;
      }

      const response = await apiClient.deleteJob(numericJobId);
      if (response.success) {
        setJobs((current) =>
          current.filter((job) => job.id !== jobId)
        );
        setPagination((current) => ({
          ...current,
          total: Math.max(0, current.total - 1),
        }));
        setSelectedDeleteJob(null);
      } else {
        setError(response.error || "Failed to delete job");
      }
    } catch (requestError) {
      console.error("Job delete error:", requestError);
      setError("An error occurred while deleting job");
    } finally {
      setDeletingJobId(null);
    }
  };
  const hasFilters = Object.values(appliedFilters).some(Boolean);
  const renderFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Filters
        </h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>
      <form onSubmit={handleFilterSubmit} className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Job Type
          </h3>
          <div className="space-y-2">
            {jobTypeOptions
              .filter((option) => option.value)
              .map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"
                >
                  <input
                    type="radio"
                    name="jobType"
                    value={option.value}
                    checked={draftFilters.jobType === option.value}
                    onChange={handleFilterChange}
                    className="h-4 w-4 accent-blue-600"
                  />
                  {option.label}
                </label>
              ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Location
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="location"
              value={draftFilters.location}
              onChange={handleFilterChange}
              placeholder="Search location..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Enter a city or remote location
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Salary Range
          </h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              ₹
            </span>
            <input
              type="number"
              name="minSalary"
              min="0"
              value={draftFilters.minSalary}
              onChange={handleFilterChange}
              placeholder="Minimum salary"
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Hero */}
        <section className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/80 px-5 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Find Your Dream Job
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                Explore thousands of opportunities from top companies.
              </p>
            </div>
            <form
              onSubmit={handleFilterSubmit}
              className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[850px] xl:grid-cols-[1.5fr_1fr_1fr_auto]"
            >
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                <Search className="h-5 w-5 shrink-0 text-slate-500" />
                <input
                  type="text"
                  name="search"
                  value={draftFilters.search}
                  onChange={handleFilterChange}
                  placeholder="Job title, keywords, or company"
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                <MapPin className="h-5 w-5 shrink-0 text-slate-500" />
                <input
                  type="text"
                  name="location"
                  value={draftFilters.location}
                  onChange={handleFilterChange}
                  placeholder="Location"
                  className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="relative flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                <BriefcaseBusiness className="h-5 w-5 shrink-0 text-slate-500" />
                <select
                  name="jobType"
                  value={draftFilters.jobType}
                  onChange={handleFilterChange}
                  className="w-full appearance-none bg-transparent py-3 pr-5 text-sm text-slate-600 outline-none"
                >
                  {jobTypeOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        </section>
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Main Three Column Layout */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_310px]">
          {/* Desktop Filters */}
          <aside className="hidden rounded-xl border border-slate-200 bg-white p-5 lg:block">
            {renderFilters()}
          </aside>
          {/* Mobile Filters */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              <ChevronDown
                className={`h-4 w-4 transition ${mobileFiltersOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {mobileFiltersOpen && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
                {renderFilters()}
              </div>
            )}
          </div>
          {/* Job Results */}
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {pagination.total} Jobs Found
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {hasFilters
                    ? "Results matching your search"
                    : "Explore available opportunities"}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading jobs...
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  {hasFilters
                    ? "No Jobs Match Your Filters"
                    : "No Jobs Available"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {hasFilters
                    ? "Try adjusting your search criteria or clear the filters to see all available jobs."
                    : "There are currently no job postings available. Check back later."}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </button>
                )}
                {pagination.total === 0 && !hasFilters && (
                  <div className="mt-5 space-y-2">
                    {isAuthenticated && user?.role === "RECRUITER" && (
                      <Link
                        href="/dashboard/create-job"
                        className="block text-sm font-semibold text-blue-600"
                      >
                        Post Your First Job
                      </Link>
                    )}
                    {!isAuthenticated && (
                      <>
                        <Link
                          href="/register"
                          className="block text-sm font-semibold text-blue-600"
                        >
                          Create an Account
                        </Link>
                        <Link
                          href="/login"
                          className="block text-sm font-semibold text-blue-600"
                        >
                          Login to Post Jobs
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                  >
                    <JobCard
                      job={job}
                      canManage={canManage}
                      isDeleting={deletingJobId === String(job.id)}
                      onDelete={() => setSelectedDeleteJob(job)}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Pagination */}
            {!loading && jobs.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  disabled={!pagination.hasPreviousPage || loading}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {pagination.page} of{" "}
                  {Math.max(pagination.totalPages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
          {/* Right Sidebar */}
          <aside className="hidden space-y-4 xl:block">
            {/* Job Alerts */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-slate-800" />
                <h2 className="font-bold text-slate-900">
                  Job Alerts
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Get notified about new jobs that match your preferences.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                }}
                className="mt-4 space-y-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email for job alerts"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled
                  title="Job alert API is not connected yet"
                  className="w-full cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-70"
                >
                  Create Job Alert
                </button>
              </form>
              <p className="mt-2 text-xs text-slate-400">
                Alert registration is not connected yet.
              </p>
            </section>
            {/* Popular Searches */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-slate-800" />
                <h2 className="font-bold text-slate-900">
                  Popular Searches
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {insightsLoading ? (
                  <p className="text-sm text-slate-500">Loading popular searches...</p>
                ) : popularSearches.length > 0 ? (
                  popularSearches.map((item) => (
                    <button
                      type="button"
                      key={item.keyword}
                      onClick={() => handlePopularSearch(item.keyword)}
                      title={`${item.searchCount} searches`}
                      className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-blue-100 hover:text-blue-700"
                    >
                      {item.keyword}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No popular searches available yet.</p>
                )}
              </div>
            </section>
            {/* Top Companies */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-slate-800" />
                  <h2 className="font-bold text-slate-900">
                    Top Companies
                  </h2>
                </div>
                <Link
                  href="/companies"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  View All
                </Link>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Discover companies and explore their job openings.
              </p>
              <div className="mt-4 space-y-3">
                {insightsLoading ? (
                  <p className="text-sm text-slate-500">Loading companies...</p>
                ) : topCompanies.length > 0 ? (
                  topCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="rounded-lg border border-slate-100 p-3 transition hover:border-blue-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {company.name}
                          </p>
                          {company.location && (
                            <p className="mt-1 text-xs text-slate-500">
                              {company.location}
                            </p>
                          )}
                          <p className="mt-1 text-xs font-medium text-blue-600">
                            {company.openJobsCount} open{" "}
                            {company.openJobsCount === 1 ? "job" : "jobs"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No companies available yet.</p>
                )}
              </div>
              <Link
                href="/companies"
                className="mt-4 block rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Explore Companies
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <DeleteJobDialog
        isOpen={Boolean(selectedDeleteJob)}
        jobTitle={selectedDeleteJob?.title ?? ""}
        isDeleting={deletingJobId !== null}
        onClose={() => setSelectedDeleteJob(null)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
export default function JobsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);
  if (loading || !isAuthenticated) {
    return <div className="min-h-screen bg-slate-50" />;
  }
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50" />}
    >
      <JobsPageContent />
    </Suspense>
  );
}
