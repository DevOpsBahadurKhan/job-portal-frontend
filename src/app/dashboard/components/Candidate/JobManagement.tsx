'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

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
    company?: {
        id: number;
        name: string;
    };
}

export default function JobManagement() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [error, setError] = useState('');
    const [deletingJobId, setDeletingJobId] = useState<number | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoadingJobs(true);

        try {
            const response = await apiClient.getJobs({ page: 1, limit: 100 });

            if (response.success && response.data) {
                const jobsData = Array.isArray(response.data) ? response.data : [];
                setJobs(jobsData);
            } else {
                setError(response.error || 'Failed to fetch jobs');
            }
        } catch {
            setError('An error occurred while fetching jobs');
        } finally {
            setLoadingJobs(false);
        }
    };

    const handleDeleteJob = async (jobId: number) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        setDeletingJobId(jobId);

        try {
            const response = await apiClient.deleteJob(jobId);

            if (response.success) {
                setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
            } else {
                setError(response.error || 'Failed to delete job');
            }
        } catch {
            setError('An error occurred while deleting job');
        } finally {
            setDeletingJobId(null);
        }
    };

    return (
        <div className="mb-12">
           
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Quick Stats for Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-3">
                            Total Jobs
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
                    <div className="text-sm text-gray-500">Active Job Postings</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-3">
                            Active Companies
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {new Set(jobs.map((job) => job.companyId)).size}
                    </div>
                    <div className="text-sm text-gray-500">Companies Hiring</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-yellow-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-3">
                            Platform Status
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-green-600">Healthy</div>
                    <div className="text-sm text-gray-500">
                        All Systems Operational
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            {loadingJobs ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">No jobs found on the platform.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        'ID',
                                        'Job Title',
                                        'Company',
                                        'Location',
                                        'Type',
                                        'Salary',
                                        'Status',
                                        'Actions',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${heading === 'Actions' ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {job.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {job.title}
                                            </div>
                                            <div className="text-sm text-gray-500 line-clamp-1">
                                                {job.description}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {job.company?.name || 'N/A'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {job.location}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {job.jobType.replace('_', ' ')}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${job.salaryMin.toLocaleString()} - $
                                            {job.salaryMax.toLocaleString()}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800'
                                                        : job.status === 'CLOSED'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteJob(job.id)}
                                                disabled={deletingJobId === job.id}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}