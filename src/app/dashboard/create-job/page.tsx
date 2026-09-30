'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: number;
  name: string;
  description: string;
  website: string;
  location: string;
  ownerId: number;
}

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  location: string;
}

const EMPTY_COMPANY_FORM: CompanyFormData = {
  name: '',
  description: '',
  website: '',
  location: '',
};

export default function CreateJobPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>(EMPTY_COMPANY_FORM);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: 'FULL_TIME',
    status: 'OPEN',
    skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [creatingCompany, setCreatingCompany] = useState(false);

  const fetchCompany = useCallback(async () => {
    setLoadingCompany(true);
    try {
      const response = await apiClient.getMyCompany();
      if (response.success && response.data) {
        setCompany(response.data);
        setError('');
      } else {
        setCompany(null);
      }
    } catch (requestError) {
      console.error('Failed to load recruiter company:', requestError);
      setCompany(null);
    } finally {
      setLoadingCompany(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role !== 'RECRUITER' && user?.role !== 'SUPER_ADMIN') {
      router.replace('/jobs');
      return;
    }

    void fetchCompany();
  }, [authLoading, fetchCompany, isAuthenticated, router, user?.role]);

  const handleCreateCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setCreatingCompany(true);

    try {
      const response = await apiClient.createCompany(companyFormData);
      if (response.success && response.data) {
        setCompany(response.data);
        setCompanyFormData(EMPTY_COMPANY_FORM);
      } else {
        setError(response.error || 'Failed to create company profile');
      }
    } catch (requestError) {
      console.error('Company creation error:', requestError);
      setError('An error occurred while creating your company profile');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!company) {
      setError('Create your company profile before posting a job');
      return;
    }

    const salaryMin = Number(formData.salaryMin);
    const salaryMax = Number(formData.salaryMax);

    if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin < 0 || salaryMax < salaryMin) {
      setError('Enter a valid salary range where the maximum is greater than or equal to the minimum');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        salaryMin,
        salaryMax,
        jobType: formData.jobType,
        status: formData.status,
        skills: formData.skills.trim(),
        companyId: company.id,
      });

      if (response.success) {
        router.push('/dashboard');
      } else {
        setError(response.error || 'Failed to create job');
      }
    } catch (requestError) {
      console.error('Job creation error:', requestError);
      setError('An error occurred while creating the job');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompany) {
    return (
      <PageShell>
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading company information...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Recruiter workspace</p>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="mt-2 text-gray-600">Fill in the details to publish a new opportunity.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
            {error}
          </div>
        )}

        {!company ? (
          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8" aria-labelledby="company-profile-title">
            <div className="mb-6">
              <h2 id="company-profile-title" className="text-xl font-bold text-gray-900">Create your company profile first</h2>
              <p className="mt-2 text-gray-600">Jobs are linked to your company so candidates know who is hiring. You only need to do this once.</p>
            </div>
            <form onSubmit={handleCreateCompany} className="space-y-5">
              <CompanyInput
                id="company-name"
                label="Company Name"
                placeholder="e.g. Acme Technologies"
                value={companyFormData.name}
                onChange={(value) => setCompanyFormData((current) => ({ ...current, name: value }))}
              />
              <div>
                <label htmlFor="company-description" className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  id="company-description"
                  rows={4}
                  required
                  value={companyFormData.description}
                  onChange={(event) => setCompanyFormData((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your company, mission, and culture..."
                />
              </div>
              <CompanyInput
                id="company-website"
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={companyFormData.website}
                onChange={(value) => setCompanyFormData((current) => ({ ...current, website: value }))}
              />
              <CompanyInput
                id="company-location"
                label="Location"
                placeholder="e.g. Bengaluru, Mumbai, Remote"
                value={companyFormData.location}
                onChange={(value) => setCompanyFormData((current) => ({ ...current, location: value }))}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={creatingCompany}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingCompany ? 'Creating profile...' : 'Create Company Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-5" aria-labelledby="company-summary-title">
              <p className="text-sm font-medium text-blue-700">Posting as</p>
              <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 id="company-summary-title" className="text-xl font-bold text-gray-900">{company.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{company.location}</p>
                </div>
                <button type="button" onClick={() => router.push('/dashboard')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Manage company →</button>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-lg sm:p-8">
              <JobInput id="title" label="Job Title" required placeholder="e.g. Senior Backend Developer" value={formData.title} onChange={(value) => setFormData((current) => ({ ...current, title: value }))} />
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea id="description" rows={6} required value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Describe the role, responsibilities, and requirements..." />
              </div>
              <JobInput id="location" label="Location" required placeholder="e.g. Remote, Bengaluru, Mumbai" value={formData.location} onChange={(value) => setFormData((current) => ({ ...current, location: value }))} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <JobInput id="salaryMin" label="Minimum Salary" type="number" required min="0" placeholder="60000" value={formData.salaryMin} onChange={(value) => setFormData((current) => ({ ...current, salaryMin: value }))} />
                <JobInput id="salaryMax" label="Maximum Salary" type="number" required min="0" placeholder="90000" value={formData.salaryMax} onChange={(value) => setFormData((current) => ({ ...current, salaryMax: value }))} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <JobSelect id="jobType" label="Job Type" value={formData.jobType} onChange={(value) => setFormData((current) => ({ ...current, jobType: value }))} options={[['FULL_TIME', 'Full Time'], ['PART_TIME', 'Part Time'], ['CONTRACT', 'Contract'], ['INTERNSHIP', 'Internship']]} />
                <JobSelect id="status" label="Status" value={formData.status} onChange={(value) => setFormData((current) => ({ ...current, status: value }))} options={[['OPEN', 'Open'], ['CLOSED', 'Closed']]} />
              </div>
              <JobInput id="skills" label="Required Skills" required placeholder="e.g. Node.js, Express, MySQL" value={formData.skills} onChange={(value) => setFormData((current) => ({ ...current, skills: value }))} helpText="Separate skills with commas" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Creating...' : 'Create Job'}</button>
                <button type="button" onClick={() => router.push('/dashboard')} className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">Cancel</button>
              </div>
            </form>
          </>
        )}
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function CompanyInput({ id, label, type = 'text', placeholder, value, onChange }: { id: string; label: string; type?: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input id={id} type={type} required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder={placeholder} />
    </div>
  );
}

function JobInput({ id, label, type = 'text', required = false, min, placeholder, value, onChange, helpText }: { id: string; label: string; type?: string; required?: boolean; min?: string; placeholder: string; value: string; onChange: (value: string) => void; helpText?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">{label}{required ? ' *' : ''}</label>
      <input id={id} type={type} required={required} min={min} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder={placeholder} />
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}

function JobSelect({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">{label} *</label>
      <select id={id} required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </div>
  );
}
