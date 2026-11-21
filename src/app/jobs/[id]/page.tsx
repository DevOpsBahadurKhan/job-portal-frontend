'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Resume,
  ResumeMatch,
} from "@/types/IResume";

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
  createdAt: string;
  updatedAt: string;
  companyId: number;
  recruiterId: number;
  company?: {
    id: number;
    name: string;
    description: string;
    website: string;
    location: string;
  };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const [matching, setMatching] =
    useState(false);

  const [resumeMatch, setResumeMatch] =
    useState<ResumeMatch | null>(null);

  const [candidateResumes, setCandidateResumes] =
    useState<Resume[]>([]);

  const [selectedResumeId, setSelectedResumeId] =
    useState<number | null>(null);

  const [loadingResumes, setLoadingResumes] =
    useState(false);

  const [matchError, setMatchError] =
    useState("");

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [jobId, setJobId] = useState<string>('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    location: '',
    salaryMin: 0,
    salaryMax: 0,
    jobType: '',
    status: '',
    skills: ''
  });

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    params.then(p => {
      setJobId(p.id);
      fetchJob(p.id);
    });
  }, []);

  useEffect(() => {
    if (!jobId || !isAuthenticated || user?.role !== 'CANDIDATE') {
      setHasApplied(false);
      setCheckingApplication(false);
      return;
    }

    let cancelled = false;

    const checkApplicationStatus = async () => {
      setCheckingApplication(true);
      try {
        const response = await apiClient.getMyApplications();
        if (cancelled) return;

        if (response.success && Array.isArray(response.data)) {
          const applied = response.data.some(
            (application: { jobId: number | string }) =>
              Number(application.jobId) === Number(jobId)
          );
          setHasApplied(applied);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to check application status:', err);
        }
      } finally {
        if (!cancelled) setCheckingApplication(false);
      }
    };

    checkApplicationStatus();

    return () => {
      cancelled = true;
    };
  }, [jobId, isAuthenticated, user?.role]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.role !== "CANDIDATE"
    ) {
      return;
    }


    const loadCandidateResumes =
      async () => {
        try {
          setLoadingResumes(true);

          const response =
            await apiClient.getMyResumes();

          if (
            !response.success ||
            !response.data
          ) {
            return;
          }

          const resumes =
            response.data.filter(
              (resume) =>
                resume.status ===
                "COMPLETED"
            );

          setCandidateResumes(
            resumes
          );

          // Prefer default resume
          const defaultResume =
            resumes.find(
              (resume) =>
                resume.isDefault
            );

          if (defaultResume) {
            setSelectedResumeId(
              defaultResume.id
            );
          } else if (
            resumes.length > 0
          ) {
            setSelectedResumeId(
              resumes[0].id
            );
          }
        } catch (error) {
          console.error(
            "Failed to load resumes:",
            error
          );
        } finally {
          setLoadingResumes(false);
        }
      };

    void loadCandidateResumes();
  }, [
    isAuthenticated,
    user?.role,
  ]);

  const handleResumeMatch = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "CANDIDATE") {
      return;
    }

    if (!selectedResumeId) {
      setMatchError(
        "Please select a resume first."
      );
      return;
    }

    if (!jobId) {
      setMatchError(
        "Job information is not available."
      );
      return;
    }

    try {
      setMatching(true);
      setMatchError("");
      setResumeMatch(null);

      const response =
        await apiClient.matchResumeWithJob(
          selectedResumeId,
          Number(jobId)
        );

      if (
        !response.success ||
        !response.data
      ) {
        throw new Error(
          response.error ||
          "Unable to match resume with this job"
        );
      }

      setResumeMatch(
        response.data
      );
    } catch (error) {
      setMatchError(
        error instanceof Error
          ? error.message
          : "Unable to calculate resume match"
      );
    } finally {
      setMatching(false);
    }
  };

  const fetchJob = async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.getJob(parseInt(id));
      if (response.success && response.data) {
        setJob(response.data);
        setEditData({
          title: response.data.title,
          description: response.data.description,
          location: response.data.location,
          salaryMin: response.data.salaryMin,
          salaryMax: response.data.salaryMax,
          jobType: response.data.jobType,
          status: response.data.status,
          skills: response.data.skills
        });
      } else {
        setError(response.error || 'Failed to fetch job details');
      }
    } catch (err) {
      setError('An error occurred while fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }

    setApplying(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      formData.append('file', resumeFile);

      const response = await apiClient.applyForJob(
        Number(jobId),
        formData
      );

      if (response.success) {
        setApplicationSuccess(true);
        setHasApplied(true);
        setShowApplicationForm(false);
        setCoverLetter('');
        setResumeFile(null);
      } else {
        setError(response.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('An error occurred while submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);
    try {
      const response = await apiClient.updateJob(parseInt(jobId), editData);
      if (response.success) {
        setJob(response.data);
        setShowEditForm(false);
      } else {
        setError(response.error || 'Failed to update job');
      }
    } catch (err) {
      setError('An error occurred while updating job');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <Link
            href="/jobs"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/jobs"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {applicationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Application submitted successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.company && (
                <p className="text-xl text-gray-600">{job.company.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                job.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {job.status}
              </span>
              {(user?.role === 'RECRUITER' || user?.role === 'SUPER_ADMIN') && job.recruiterId === user.id && (
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  {showEditForm ? 'Cancel' : 'Edit Job'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-4">
              <svg className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-semibold">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-4">
              <svg className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Salary</p>
                <p className="font-semibold">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-4">
              <svg className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Job Type</p>
                <p className="font-semibold">{job.jobType.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-4">
              <svg className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Posted</p>
                <p className="font-semibold">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-3">
              {job.skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:shadow-md transition-shadow"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {isAuthenticated &&
            user?.role === "CANDIDATE" && (
              <div className="mb-8 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-8">

                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
                      🎯
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Resume Match
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        See how well your resume
                        matches this job.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RESUME SELECT */}

                {loadingResumes ? (
                  <div className="rounded-xl bg-white p-4 text-sm text-gray-500">
                    Loading your resumes...
                  </div>
                ) : candidateResumes.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">

                    <p className="font-semibold text-amber-800">
                      No completed resume found
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Upload and analyze a resume
                      before checking your job match.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/resume-analyzer"
                        )
                      }
                      className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Go to Resume Analyzer
                    </button>

                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                      <div className="flex-1">
                        <label
                          htmlFor="resume-match"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Select Resume
                        </label>

                        <select
                          id="resume-match"
                          value={
                            selectedResumeId ??
                            ""
                          }
                          onChange={(event) => {
                            setSelectedResumeId(
                              Number(
                                event.target
                                  .value
                              )
                            );

                            setResumeMatch(
                              null
                            );

                            setMatchError(
                              ""
                            );
                          }}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">
                            Select a resume
                          </option>

                          {candidateResumes.map(
                            (resume) => (
                              <option
                                key={
                                  resume.id
                                }
                                value={
                                  resume.id
                                }
                              >
                                {resume.fileName}
                                {resume.isDefault
                                  ? " — Default"
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleResumeMatch
                        }
                        disabled={
                          matching ||
                          !selectedResumeId
                        }
                        className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {matching
                          ? "Analyzing..."
                          : "Check Resume Match"}
                      </button>

                    </div>

                    {/* ERROR */}

                    {matchError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {matchError}
                      </div>
                    )}

                    {/* RESULT */}

                    {resumeMatch && (
                      <ResumeMatchResult
                        match={resumeMatch}
                      />
                    )}
                  </>
                )}
              </div>
            )}

          {job.company && (
            <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Company</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{job.company.description}</p>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 bg-white rounded-lg p-3">
                  <svg className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.company.location}
                </div>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700 bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          )}

          {showEditForm && (user?.role === 'RECRUITER' || user?.role === 'SUPER_ADMIN') && job.recruiterId === user.id && (
            <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                    <select
                      value={editData.jobType}
                      onChange={(e) => setEditData({ ...editData, jobType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Salary</label>
                    <input
                      type="number"
                      value={editData.salaryMin}
                      onChange={(e) => setEditData({ ...editData, salaryMin: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Salary</label>
                    <input
                      type="number"
                      value={editData.salaryMax}
                      onChange={(e) => setEditData({ ...editData, salaryMax: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={editData.skills}
                    onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Node.js, Express, MySQL"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Job'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {(!isAuthenticated || user?.role === 'CANDIDATE') && (
            <div>
              {hasApplied ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-green-100 text-green-800 py-4 px-6 rounded-xl font-semibold text-lg cursor-not-allowed"
                >
                  Already Applied
                </button>
              ) : !showApplicationForm ? (
                <button
                  type="button"
                  disabled={checkingApplication}
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login');
                    } else {
                      setShowApplicationForm(true);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingApplication
                    ? 'Checking application...'
                    : isAuthenticated
                      ? 'Apply for this Job'
                      : 'Login to Apply'}
                </button>
              ) : (
                <form onSubmit={handleApply} className="space-y-6">
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={5}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Tell us why you're interested in this role..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="resume" className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Resume (PDF)
                    </label>
                    <input
                      type="file"
                      id="resume"
                      name="file"
                      accept=".pdf,application/pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) {
                          setResumeFile(null);
                          return;
                        }

                        if (file.type !== 'application/pdf') {
                          setError('Only PDF files are allowed');
                          e.target.value = '';
                          setResumeFile(null);
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          setError('Resume must be smaller than 5 MB');
                          e.target.value = '';
                          setResumeFile(null);
                          return;
                        }

                        setError('');
                        setResumeFile(file);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    {resumeFile && (
                      <p className="mt-2 text-sm text-green-700">
                        Selected: {resumeFile.name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      PDF only. Maximum size 5 MB.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={applying || !resumeFile}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function ResumeMatchResult({
  match,
}: {
  match: ResumeMatch;
}) {
  const score =
    match.matchScore ?? 0;

  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
        ? "text-blue-600"
        : score >= 40
          ? "text-amber-600"
          : "text-red-600";

  const scoreBackground =
    score >= 80
      ? "bg-emerald-50 border-emerald-200"
      : score >= 60
        ? "bg-blue-50 border-blue-200"
        : score >= 40
          ? "bg-amber-50 border-amber-200"
          : "bg-red-50 border-red-200";

  return (
    <div className="mt-6 border-t border-violet-100 pt-6">

      {/* SCORE */}

      <div
        className={`rounded-2xl border p-6 ${scoreBackground}`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Resume Match Score
            </p>

            <p
              className={`mt-1 text-5xl font-bold ${scoreColor}`}
            >
              {score}
              <span className="text-2xl text-gray-400">
                /100
              </span>
            </p>
          </div>

          <div className="text-sm text-gray-600">
            {score >= 80
              ? "Excellent match"
              : score >= 60
                ? "Good match"
                : score >= 40
                  ? "Moderate match"
                  : "Low match"}
          </div>
        </div>
      </div>

      {/* SKILLS */}

      <div className="mt-5 grid gap-5 md:grid-cols-2">

        {/* MATCHED */}

        <div className="rounded-xl border border-emerald-200 bg-white p-5">

          <h3 className="font-semibold text-gray-900">
            ✓ Matched Skills
          </h3>

          {match.matchedSkills &&
            match.matchedSkills.length >
            0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {match.matchedSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No matched skills found.
            </p>
          )}
        </div>

        {/* MISSING */}

        <div className="rounded-xl border border-red-200 bg-white p-5">

          <h3 className="font-semibold text-gray-900">
            ! Missing Skills
          </h3>

          {match.missingSkills &&
            match.missingSkills.length >
            0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {match.missingSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No missing skills.
            </p>
          )}
        </div>
      </div>

      {/* KEYWORDS */}

      {(match.matchedKeywords?.length ||
        match.missingKeywords?.length) && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">
                Matched Keywords
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  match.matchedKeywords ||
                  []
                ).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">
                Missing Keywords
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  match.missingKeywords ||
                  []
                ).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

      {/* RECOMMENDATIONS */}

      {match.recommendations &&
        match.recommendations.length >
        0 && (
          <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-5">

            <h3 className="font-semibold text-gray-900">
              Recommendations
            </h3>

            <ul className="mt-3 space-y-2">
              {match.recommendations.map(
                (
                  recommendation,
                  index
                ) => (
                  <li
                    key={`${recommendation}-${index}`}
                    className="text-sm leading-6 text-gray-700"
                  >
                    •{" "}
                    {
                      recommendation
                    }
                  </li>
                )
              )}
            </ul>

          </div>
        )}
    </div>
  );
}