
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Globe,
  Pencil,
  Trash2,
  Plus,
  X,
  RefreshCw,
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Company {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt?: string;
}

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  location: string;
}

const initialForm: CompanyFormData = {
  name: "",
  description: "",
  website: "",
  location: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

export default function CompanyManagement() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const role = user?.role;
  const isRecruiter = role === "RECRUITER";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const canManageCompanies = isRecruiter || isAdmin;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [formData, setFormData] =
    useState<CompanyFormData>(initialForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompanies = useCallback(
    async (isRefresh = false) => {
      if (!canManageCompanies) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        if (isRecruiter) {
          // Recruiter ko platform ki saari companies nahi,
          // sirf uski own company fetch karni hai.
          const response = await apiClient.getMyCompany();

          if (response.success && response.data) {
            const data = response.data as Company | { company?: Company };
            const company =
              "company" in data ? data.company : data;

            setCompanies(company ? [company] : []);
            return;
          }

          const message = response.error || "Failed to load your company.";
          const normalizedMessage = message.toLowerCase();

          // Backend agar company absent hone par 404 deta hai,
          // to recruiter ko create-company state dikhayenge.
          const companyMissing =
            normalizedMessage.includes("404") ||
            normalizedMessage.includes("not found") ||
            normalizedMessage.includes("no company");

          if (companyMissing) {
            setCompanies([]);
          } else {
            setError(message);
          }

          return;
        }

        const response = await apiClient.listCompanies();

        if (response.success && response.data) {
          const data = response.data as
            | Company[]
            | { companies?: Company[] };

          const list = Array.isArray(data)
            ? data
            : data.companies ?? [];

          setCompanies(list);
        } else {
          setError(response.error || "Failed to load companies.");
        }
      } catch {
        setError("Something went wrong while loading companies.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canManageCompanies, isRecruiter]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!canManageCompanies) {
      router.replace("/jobs");
      return;
    }

    void fetchCompanies();
  }, [
    authLoading,
    isAuthenticated,
    canManageCompanies,
    router,
    fetchCompanies,
  ]);

  const resetForm = () => {
    setFormData(initialForm);
    setFormError("");
    setShowCreateForm(false);
    setEditCompany(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    setFormError("");
    setFormData(initialForm);
    setEditCompany(null);
    setShowCreateForm(true);
  };

  const openEditForm = (company: Company) => {
    setError("");
    setSuccess("");
    setFormError("");
    setShowCreateForm(false);
    setEditCompany(company);
    setFormData({
      name: company.name,
      description: company.description ?? "",
      website: company.website ?? "",
      location: company.location ?? "",
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError("");
    setError("");
    setSuccess("");

    const name = formData.name.trim();

    if (!name) {
      setFormError("Company name is required.");
      return;
    }

    const payload = {
      name,
      description: formData.description.trim(),
      website: formData.website.trim(),
      location: formData.location.trim(),
    };

    if (
      payload.website &&
      !/^https?:\/\//i.test(payload.website)
    ) {
      setFormError("Website URL must start with https:// or http://.");
      return;
    }

    setFormLoading(true);

    try {
      const response = editCompany
        ? await apiClient.updateCompany(editCompany.id, payload)
        : await apiClient.createCompany(payload);

      if (!response.success) {
        setFormError(
          response.error ||
          `Failed to ${editCompany ? "update" : "create"} company.`
        );
        return;
      }

      const wasEditing = Boolean(editCompany);

      resetForm();

      setSuccess(
        wasEditing
          ? "Company updated successfully."
          : "Company created successfully."
      );

      await fetchCompanies(true);
    } catch {
      setFormError(
        `Something went wrong while ${editCompany ? "updating" : "creating"
        } the company.`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (company: Company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(company.id);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.deleteCompany(company.id);

      if (!response.success) {
        setError(response.error || "Failed to delete company.");
        return;
      }

      setCompanies((current) =>
        current.filter((item) => item.id !== company.id)
      );

      if (editCompany?.id === company.id) {
        resetForm();
      }

      setSuccess("Company deleted successfully.");
    } catch {
      setError("Something went wrong while deleting the company.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      company.name.toLowerCase().includes(query) ||
      (company.location ?? "").toLowerCase().includes(query) ||
      (company.description ?? "").toLowerCase().includes(query)
    );
  });

  if (authLoading || loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading companies...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canManageCompanies) {
    return null;
  }

  return (
    <section className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="h-4 w-4" />
            {isRecruiter ? "Recruiter Dashboard" : "Administration"}
            <span>/</span>
            <span className="text-slate-700">Companies</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {isRecruiter ? "My Company" : "Company Management"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isRecruiter
              ? "Manage your company profile and business details."
              : "View and manage companies registered on the platform."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void fetchCompanies(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {(!isRecruiter || companies.length === 0) && (
            <button
              type="button"
              onClick={openCreateForm}
              disabled={Boolean(editCompany) || formLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {(showCreateForm || editCompany) && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                {editCompany ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  {editCompany ? "Edit Company" : "Create Company"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fields marked * are required.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={formLoading}
              aria-label="Close form"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Company Name *
                </label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. Acme Technologies"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  maxLength={150}
                  autoComplete="organization"
                />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="text"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.location}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Website</label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        website: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={4}
                  placeholder="Tell candidates about your company, team and work culture..."
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  maxLength={2000}
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {formData.description.length}/2000
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={formLoading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formLoading && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {formLoading
                  ? editCompany
                    ? "Updating..."
                    : "Creating..."
                  : editCompany
                    ? "Save Changes"
                    : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isRecruiter ? "My Company" : "Total Companies"}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {companies.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {isRecruiter
                  ? companies.length
                    ? "Company profile registered"
                    : "No company profile yet"
                  : "Registered on the platform"}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Profile Status
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {companies.length ? "Registered" : "Not registered"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {companies.length
                  ? "Your company details are available."
                  : "Create a company profile to get started."}
              </p>
            </div>

            <div
              className={`rounded-2xl p-3 ${companies.length
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
                }`}
            >
              {companies.length ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              {isRecruiter ? "Company Details" : "All Companies"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isRecruiter
                ? "Review and update your company information."
                : "Search and manage registered company profiles."}
            </p>
          </div>

          {!isRecruiter && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search companies..."
                className={`${inputClass} py-2.5 pl-9`}
              />
            </div>
          )}
        </div>

        {companies.length === 0 ? (
          <div className="px-5 py-14 text-center sm:px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Building2 className="h-8 w-8" />
            </div>

            <h3 className="font-semibold text-slate-900">
              {isRecruiter
                ? "Create your company profile"
                : "No companies found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {isRecruiter
                ? "Add your company details to get started with company and job management."
                : "There are no registered companies yet. Create one to get started."}
            </p>

            {!showCreateForm && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Company
              </button>
            )}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            No companies match "{searchTerm}".
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    {!isRecruiter && (
                      <th className="px-6 py-4 font-semibold">Owner ID</th>
                    )}
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {company.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                              {company.description || "No description added"}
                            </p>
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                Visit website
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {company.location || "Not specified"}
                        </span>
                      </td>

                      {!isRecruiter && (
                        <td className="px-6 py-4 text-sm text-slate-600">
                          #{company.ownerId}
                        </td>
                      )}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(company)}
                            disabled={formLoading || deletingId !== null}
                            title="Edit company"
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(company)}
                            disabled={
                              deletingId !== null || formLoading
                            }
                            title="Delete company"
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === company.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-4 p-4 md:hidden">
              {filteredCompanies.map((company) => (
                <article
                  key={company.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {company.name}
                      </h3>
                      <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                        {company.description || "No description added"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      {company.location || "Location not specified"}
                    </p>

                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 break-all text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4 shrink-0" />
                        {company.website}
                      </a>
                    )}

                    {!isRecruiter && (
                      <p className="text-xs text-slate-400">
                        Owner ID: {company.ownerId}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(company)}
                      disabled={formLoading || deletingId !== null}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(company)}
                      disabled={deletingId !== null || formLoading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === company.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {refreshing && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Refreshing company data...
          </div>
        )}
      </div>
    </section>
  );
}
