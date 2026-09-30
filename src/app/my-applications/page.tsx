
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
  id: number;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: string;
  createdAt: string;

  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;

    company?: {
      name: string;
    };
  };
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'CANDIDATE') {
      router.push('/jobs');
      return;
    }

    fetchApplications();
  }, [isAuthenticated, user, router]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.getMyApplications();

      if (response.success && response.data) {
        setApplications(response.data);
      } else {
        setError(
          response.error || 'Failed to fetch applications'
        );
      }
    } catch {
      setError('An error occurred while fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800';

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';

      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800';

      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';

      case 'REJECTED':
        return 'bg-red-100 text-red-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (
    salaryMin: number | null,
    salaryMax: number | null
  ) => {
    if (salaryMin == null && salaryMax == null) {
      return 'Salary not specified';
    }

    const formatAmount = (amount: number) =>
      amount.toLocaleString('en-IN');

    if (salaryMin != null && salaryMax != null) {
      return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)}`;
    }

    if (salaryMin != null) {
      return `From ${formatAmount(salaryMin)}`;
    }

    return `Up to ${formatAmount(salaryMax!)}`;
  };

  // Construct the full backend URL for the uploaded resume.
  const getResumeUrl = (resumeUrl: string) => {
    if (resumeUrl.startsWith('http://') ||
      resumeUrl.startsWith('https://')) {
      return resumeUrl;
    }

    return `${API_URL.replace(/\/$/, '')}/${resumeUrl.replace(/^\//, '')}`;
  };

  if (!isAuthenticated || user?.role !== 'CANDIDATE') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Applications
            </h1>

            <p className="mt-2 text-gray-600">
              Track your job applications and view submitted resumes.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between gap-4">
            <p>{error}</p>

            <button
              onClick={fetchApplications}
              className="text-sm font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />

            <p className="mt-4 text-gray-600">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-4">📄</div>

            <h2 className="text-xl font-semibold text-gray-900">
              No applications yet
            </h2>

            <p className="text-gray-600 mt-2 mb-6">
              You haven't applied to any jobs yet.
            </p>

            <Link
              href="/jobs"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          /* Applications List */
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition"
              >
                {/* Job Title and Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.job.title}
                    </h3>

                    {application.job.company && (
                      <p className="text-gray-600 mt-1">
                        {application.job.company.name}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Job Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="h-5 w-5 mr-2 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                    <span>{application.job.location || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="h-5 w-5 mr-2 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    <span>
                      {formatSalary(
                        application.job.salaryMin,
                        application.job.salaryMax
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="h-5 w-5 mr-2 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>

                    <span>
                      Applied on{' '}
                      {new Date(application.createdAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter
                  </h4>

                  {application.coverLetter ? (
                    <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                      {application.coverLetter}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No cover letter submitted.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">

                  <Link
                    href={`/jobs/${application.job.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    View Job Details
                  </Link>

                  {application.resumeUrl ? (
                    <a
                      href={getResumeUrl(application.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z"
                        />
                      </svg>

                      View Resume
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">
                      No resume uploaded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}