'use client';

import { FormEvent, Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { jobTypeOptions } from "../../components/home/home-data";

const JOBS_PER_PAGE = 10;

type Filters = {
  search: string;
  location: string;
  jobType: string;
  minSalary: string;
};

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
  recruiterId: number;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    name: string;
    description?: string;
    website?: string;
    location?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const EMPTY_FILTERS: Filters = {
  search: '',
  location: '',
  jobType: '',
  minSalary: '',
};

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: JOBS_PER_PAGE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function getInitialFilters(searchParams: { get: (key: string) => string | null }): Filters {
  return {
    search: searchParams.get('search') ?? '',
    location: searchParams.get('location') ?? '',
    jobType: searchParams.get('jobType') ?? '',
    minSalary: searchParams.get('salaryMin') ?? '',
  };
}

function JobsPageContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialFilters = getInitialFilters(searchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');

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
        setError(response.error || 'Failed to fetch jobs');
        setJobs([]);
        setPagination(EMPTY_PAGINATION);
        return;
      }

      const jobsData = Array.isArray(response.data) ? response.data : [];
      setJobs(jobsData);
      setPagination(response.pagination ?? {
        page,
        limit: JOBS_PER_PAGE,
        total: jobsData.length,
        totalPages: jobsData.length > 0 ? 1 : 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      });
    } catch (requestError) {
      console.error('Jobs fetch error:', requestError);
      setError('An error occurred while fetching jobs');
      setJobs([]);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    setDeletingJobId(jobId);
    try {
      const response = await apiClient.deleteJob(jobId);
      if (response.success) {
        setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
        setPagination((currentPagination) => ({
          ...currentPagination,
          total: Math.max(0, currentPagination.total - 1),
        }));
      } else {
        setError(response.error || 'Failed to delete job');
      }
    } catch (requestError) {
      console.error('Job delete error:', requestError);
      setError('An error occurred while deleting job');
    } finally {
      setDeletingJobId(null);
    }
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="mt-2 text-gray-600">Browse through our latest job opportunities</p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filter Jobs</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          </div>
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="e.g. DevOps Developer"
                  value={draftFilters.search}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="e.g. Jaipur, Remote"
                  value={draftFilters.location}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="jobType" className="mb-1 block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                {/* <select
                  id="jobType"
                  name="jobType"
                  value={draftFilters.jobType}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select> */

                  <select
                    id="home-job-type"
                    name="jobType"
                    value={draftFilters.jobType}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    {jobTypeOptions.map((option: { value: string; label: string }) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                }



              </div>

              <div>
                <label htmlFor="minSalary" className="mb-1 block text-sm font-medium text-gray-700">
                  Min Salary
                </label>
                <input
                  type="number"
                  id="minSalary"
                  name="minSalary"
                  min="0"
                  placeholder="e.g. 30000"
                  value={draftFilters.minSalary}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded bg-white py-12 text-center shadow">
            <div className="mb-4 flex justify-center">
              <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              {pagination.total === 0 && Object.values(appliedFilters).some(Boolean)
                ? 'No Jobs Match Your Filters'
                : 'No Jobs Available'}
            </h3>
            <p className="mb-4 text-gray-500">
              {pagination.total === 0 && Object.values(appliedFilters).some(Boolean)
                ? 'Try adjusting your search criteria or clear the filters to see all available jobs.'
                : 'There are currently no job postings available. Check back later or create an account to post jobs.'}
            </p>
            {Object.values(appliedFilters).some(Boolean) && (
              <button onClick={clearFilters} className="font-medium text-blue-600 hover:text-blue-700">
                Clear Filters
              </button>
            )}
            {pagination.total === 0 && !Object.values(appliedFilters).some(Boolean) && (
              <div className="mt-4 space-y-2">
                {isAuthenticated && user?.role === 'RECRUITER' && (
                  <Link href="/dashboard/create-job" className="block font-medium text-blue-600 hover:text-blue-700">
                    Post Your First Job
                  </Link>
                )}
                {!isAuthenticated && (
                  <>
                    <Link href="/register" className="block font-medium text-blue-600 hover:text-blue-700">Create an Account</Link>
                    <Link href="/login" className="block font-medium text-blue-600 hover:text-blue-700">Login to Post Jobs</Link>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    {job.company && <p className="mt-1 text-sm text-gray-600">{job.company.name}</p>}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {job.status}
                  </span>
                </div>
                <p className="mb-4 line-clamp-3 text-gray-600">{job.description}</p>
                <div className="mb-4 space-y-2">
                  <JobMeta icon="location" value={job.location} />
                  <JobMeta icon="salary" value={`$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`} />
                  <JobMeta icon="briefcase" value={job.jobType.replace('_', ' ')} />
                </div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.skills && job.skills.split(',').slice(0, 3).map((skill, index) => (
                      <span key={`${job.id}-${index}`} className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {skill.trim()}
                      </span>
                    ))}
                    {job.skills && job.skills.split(',').length > 3 && (
                      <span className="text-xs text-gray-500">+{job.skills.split(',').length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`/jobs/${job.id}`} className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-white transition-colors hover:bg-blue-700">
                    View Details &amp; Apply
                  </Link>
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/edit-job/${job.id}`} className="flex-1 rounded-md bg-green-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-green-700">Edit</Link>
                      <button onClick={() => handleDeleteJob(job.id)} disabled={deletingJobId === job.id} className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={!pagination.hasPreviousPage || loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <JobsPageContent />
    </Suspense>
  );
}

function JobMeta({ icon, value }: { icon: 'location' | 'salary' | 'briefcase'; value: string }) {
  return (
    <div className="flex items-center text-sm text-gray-500">
      <svg className="mr-2 h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        {icon === 'location' && (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </>
        )}
        {icon === 'salary' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2m0 0V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {icon === 'briefcase' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      </svg>
      {value}
    </div>
  );
}
