"use client";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  CandidateProfile,
  UpdateCandidateProfile,
  ProfileForm,
  ISctionProps
} from "@/types/IProfile";
const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "REMOTE",
] as const;

const emptyForm: ProfileForm = {
  phone: "",
  headline: "",
  summary: "",
  location: "",
  preferredRoles: "",
  preferredLocations: "",
  preferredJobTypes: "",
  expectedSalaryMin: "",
  expectedSalaryMax: "",
  noticePeriod: "",
};


const profileToForm = (profile: CandidateProfile): ProfileForm => ({
  phone: profile.phone ?? "",
  headline: profile.headline ?? "",
  summary: profile.summary ?? "",
  location: profile.location ?? "",
  preferredRoles: profile.preferredRoles?.join(", ") ?? "",
  preferredLocations: profile.preferredLocations?.join(", ") ?? "",
  preferredJobTypes: profile.preferredJobTypes?.join(", ") ?? "",
  expectedSalaryMin:
    profile.expectedSalaryMin != null
      ? String(profile.expectedSalaryMin)
      : "",
  expectedSalaryMax:
    profile.expectedSalaryMax != null
      ? String(profile.expectedSalaryMax)
      : "",
  noticePeriod: profile.noticePeriod ?? "",
});

const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getChangedFields = (
  original: ProfileForm,
  current: ProfileForm
): UpdateCandidateProfile => {
  const changes: UpdateCandidateProfile = {};
  const stringFields = [
    "phone",
    "headline",
    "summary",
    "location",
    "noticePeriod",
  ] as const;
  stringFields.forEach((field) => {
    if (original[field] !== current[field]) {
      changes[field] = current[field].trim();
    }
  });
  const listFields = [
    "preferredRoles",
    "preferredLocations",
    "preferredJobTypes",
  ] as const;
  listFields.forEach((field) => {
    const oldValue = parseList(original[field]);
    const newValue = parseList(current[field]);
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      if (field === "preferredRoles") {
        changes.preferredRoles = newValue;
      } else if (field === "preferredLocations") {
        changes.preferredLocations = newValue;
      } else {
        changes.preferredJobTypes = newValue;
      }
    }
  });
  const salaryFields = [
    "expectedSalaryMin",
    "expectedSalaryMax",
  ] as const;
  salaryFields.forEach((field) => {
    if (original[field] !== current[field]) {
      const value = current[field].trim();
      const parsedValue = value === "" ? undefined : Number(value);
      if (field === "expectedSalaryMin") {
        changes.expectedSalaryMin = parsedValue;
      } else {
        changes.expectedSalaryMax = parsedValue;
      }
    }
  });
  return changes;
};

function extractProfile(input: unknown): CandidateProfile {
  let current: unknown = input;
  for (let i = 0; i < 5; i++) {
    if (
      !current ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      break;
    }
    const obj = current as Record<string, unknown>;
    if ("id" in obj && "userId" in obj) {
      return obj as unknown as CandidateProfile;
    }
    if (
      obj.candidateProfile &&
      typeof obj.candidateProfile === "object"
    ) {
      current = obj.candidateProfile;
      continue;
    }
    if (
      obj.profile &&
      typeof obj.profile === "object"
    ) {
      current = obj.profile;
      continue;
    }
    if (
      obj.data &&
      typeof obj.data === "object"
    ) {
      current = obj.data;
      continue;
    }
    break;
  }
  toast.error("Unable to find candidate profile in API response.");
throw new Error("Unable to find candidate profile in API response.");
}

function extractProfilePhoto(input: unknown): string | null {
  let current: unknown = input;
  for (let i = 0; i < 5; i++) {
    if (
      !current ||
      typeof current !== "object" ||
      Array.isArray(current)
    ) {
      break;
    }
    const obj = current as Record<string, unknown>;
    if (
      typeof obj.avatarUrl === "string" &&
      obj.avatarUrl.trim()
    ) {
      return obj.avatarUrl;
    }
    if (
      typeof obj.profilePhoto === "string" &&
      obj.profilePhoto.trim()
    ) {
      return obj.profilePhoto;
    }
    if (
      obj.candidateProfile &&
      typeof obj.candidateProfile === "object"
    ) {
      current = obj.candidateProfile;
      continue;
    }
    if (
      obj.user &&
      typeof obj.user === "object"
    ) {
      current = obj.user;
      continue;
    }
    if (
      obj.data &&
      typeof obj.data === "object"
    ) {
      current = obj.data;
      continue;
    }
    break;
  }
  return null;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed";
const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

function SectionHeading({
  title,
  description,
  icon,
}: ISctionProps) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}


export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] =
    useState<CandidateProfile | null>(null);
  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);
  const [photoUploading, setPhotoUploading] =
    useState(false);
  const [form, setForm] =
    useState<ProfileForm>(emptyForm);
  const [originalForm, setOriginalForm] =
    useState<ProfileForm>(emptyForm);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [editing, setEditing] =
    useState(false);
  const loadProfile = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.getMyCandidateProfile();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to load profile");
      }
      const data = extractProfile(response.data);
      const formData = profileToForm(data);
      const photo = extractProfilePhoto(response.data);
      setProfile(data);
      setProfilePhoto(photo);
      setForm(formData);
    } catch (error) {
      console.error("Failed to load candidate profile:", error);
      toast.error(error instanceof Error
        ? error.message
        : "Unable to load profile");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  const handleChange = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };
  const handleJobTypeChange = (
    type: (typeof JOB_TYPES)[number],
    checked: boolean
  ) => {
    const selected =
      parseList(form.preferredJobTypes);
    const updated = checked
      ? [...selected, type]
      : selected.filter(
        (item) => item !== type
      );
    handleChange(
      "preferredJobTypes",
      [...new Set(updated)].join(", ")
    );
  };
  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];
    if (!file) {
      return;
    }
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    const maxSize =
      5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setPhotoUploading(true);
    try {
      const response =
        await apiClient.updateProfilePhoto(
          file
        );
      if (
        !response.success
      ) {
        throw new Error(
          response.message ||
          "Unable to update profile photo"
        );
      }
      const updatedPhoto =
        extractProfilePhoto(
          response.data
        );
      if (updatedPhoto) {
        setProfilePhoto(
          updatedPhoto
        );
      }
      toast.success("Profile photo updated successfully.");
      await loadProfile();
    } catch (err) {
      toast.error(err instanceof Error
        ? err.message
        : "Something went wrong while updating profile photo");
    } finally {
      setPhotoUploading(false);
      event.target.value = "";
    }
  };
  const handleCancel = () => {
    setForm(originalForm);
    setEditing(false);
  };
  const handleSave = async () => {
    const selectedJobTypes =
      parseList(
        form.preferredJobTypes
      );
    const invalidJobTypes =
      selectedJobTypes.filter(
        (type) =>
          !JOB_TYPES.includes(
            type as (typeof JOB_TYPES)[number]
          )
      );
    if (invalidJobTypes.length > 0) {
      toast.error(`Invalid job types: ${invalidJobTypes.join(
        ", "
      )}`);
      return;
    }
    const changes =
      getChangedFields(
        originalForm,
        form
      );
    if (
      Object.keys(changes).length === 0
    ) {
      toast.success("No changes to save.");
      setEditing(false);
      return;
    }
    if (
      (changes.expectedSalaryMin != null &&
        changes.expectedSalaryMin < 0) ||
      (changes.expectedSalaryMax != null &&
        changes.expectedSalaryMax < 0)
    ) {
      toast.error("Salary cannot be negative.");
      return;
    }
    const minSalary =
      changes.expectedSalaryMin !==
        undefined
        ? changes.expectedSalaryMin
        : profile?.expectedSalaryMin;
    const maxSalary =
      changes.expectedSalaryMax !==
        undefined
        ? changes.expectedSalaryMax
        : profile?.expectedSalaryMax;
    if (
      minSalary != null &&
      maxSalary != null &&
      minSalary > maxSalary
    ) {
      toast.error("Minimum salary cannot exceed maximum salary.");
      return;
    }
    setSaving(true);
    try {
      const response =
        await apiClient.updateMyCandidateProfile(
          changes
        );
      if (
        !response.success ||
        !response.data
      ) {
        throw new Error(
          response.message ||
          "Unable to update profile"
        );
      }
      const updatedProfile =
        extractProfile(
          response.data
        );
      const updatedForm =
        profileToForm(
          updatedProfile
        );
      setProfile(
        updatedProfile
      );
      setForm(updatedForm);
      setOriginalForm(
        updatedForm
      );
      setEditing(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error
        ? err.message
        : "Something went wrong while updating profile");
    } finally {
      setSaving(false);
    }
  };
  const fields = [
    {
      label: "Phone number",
      key: "phone",
      placeholder:
        "Enter your phone number",
      type: "tel",
      icon: "☎",
    },
    {
      label:
        "Professional headline",
      key: "headline",
      placeholder:
        "e.g. Node.js Backend Developer",
      type: "text",
      icon: "✦",
    },
    {
      label: "Current location",
      key: "location",
      placeholder:
        "e.g. Bhilwara, Rajasthan",
      type: "text",
      icon: "⌖",
    },
    {
      label: "Notice period",
      key: "noticePeriod",
      placeholder:
        "e.g. Immediate, 30 days",
      type: "text",
      icon: "◷",
    },
    {
      label: "Preferred roles",
      key: "preferredRoles",
      placeholder:
        "Node.js Developer, Backend Developer",
      type: "text",
      icon: "⌘",
    },
    {
      label: "Preferred locations",
      key: "preferredLocations",
      placeholder:
        "Jaipur, Remote, Delhi",
      type: "text",
      icon: "⌖",
    },
  ] as const;
  const getInitial = () =>
    user?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-52 rounded-lg bg-slate-200" />
          <div className="h-44 rounded-3xl bg-white" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 rounded-3xl bg-white" />
            <div className="h-96 rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-500">
                Dashboard
              </span>
              <span className="text-slate-300">
                /
              </span>
              <span className="text-indigo-600">
                My Profile
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>
            <p className="text-sm text-slate-500">
              Manage your personal details and career preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 sm:h-28">
            <div className="pointer-events-none absolute -right-10 -top-24 h-60 w-60 rounded-full border-[28px] border-white/10" />
          </div>
          <div className="relative px-5 pb-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative z-10 -mt-12 sm:-mt-14">
                  <label
                    htmlFor="profile-photo"
                    title="Change profile photo"
                    className="relative block h-20 w-20 cursor-pointer overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-md sm:h-24 sm:w-24 sm:text-3xl"
                  >
                    {profilePhoto ? (
                      <img
                        src={
                          profilePhoto.startsWith("http\://") ||
                            profilePhoto.startsWith("https\://")
                            ? profilePhoto
                            : `${process.env.NEXT_PUBLIC_API_URL}${profilePhoto.startsWith("/") ? "" : "/"}${profilePhoto}`
                        }
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                        onLoad={(event) => {
                          console.log("✅ PROFILE IMAGE LOADED:", event.currentTarget.src);
                        }}
                        onError={(event) => {
                          console.error(
                            "❌ PROFILE IMAGE FAILED:",
                            event.currentTarget.src
                          );
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {getInitial()}
                      </div>
                    )}
                    {photoUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      </div>
                    )}
                    {!photoUploading && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/45 px-1 py-1 text-center text-[10px] font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                        Change photo
                      </div>
                    )}
                  </label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={photoUploading}
                    className="hidden"
                  />
                </div>
                <div className="min-w-0 pt-2">
                  <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    {user?.name || "User"}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {user?.email || ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                      {user?.role?.toLowerCase() ||
                        "candidate"}
                    </span>
                    {profile?.location && (
                      <span className="text-xs text-slate-500">
                        ⌖ {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
                >
                  <span aria-hidden="true">
                    ✎
                  </span>
                  Edit profile
                </button>
              )}
            </div>
          </div>
        </section>
        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                title="Personal information"
                description="Your contact details and professional identity."
                icon="♙"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                {fields.slice(0, 4).map(
                  (field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={field.key}
                        className={labelClass}
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.key}
                        type={field.type}
                        value={form[field.key]}
                        onChange={(event) =>
                          handleChange(
                            field.key,
                            event.target.value
                          )
                        }
                        disabled={
                          !editing || saving
                        }
                        placeholder={
                          field.placeholder
                        }
                        className={inputClass}
                      />
                    </div>
                  )
                )}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                title="Professional summary"
                description="Tell recruiters about your experience, skills and career goals."
                icon="✧"
              />
              <label
                htmlFor="summary"
                className={labelClass}
              >
                About you
              </label>
              <textarea
                id="summary"
                rows={7}
                value={form.summary}
                onChange={(event) =>
                  handleChange(
                    "summary",
                    event.target.value
                  )
                }
                disabled={!editing || saving}
                placeholder="Write a short summary about your experience, technical skills and career goals..."
                className={`${inputClass} min-h-40 resize-y leading-6`}
              />
              <p className="mt-2 text-right text-xs text-slate-400">
                {form.summary.length} characters
              </p>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                title="Job preferences"
                description="Help us find opportunities that match your goals."
                icon="⌘"
              />
              <div className="space-y-5">
                {fields.slice(4).map(
                  (field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={field.key}
                        className={labelClass}
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.key}
                        type={field.type}
                        value={form[field.key]}
                        onChange={(event) =>
                          handleChange(
                            field.key,
                            event.target.value
                          )
                        }
                        disabled={
                          !editing || saving
                        }
                        placeholder={
                          field.placeholder
                        }
                        className={inputClass}
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        Separate multiple values with commas.
                      </p>
                    </div>
                  )
                )}
              </div>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className={labelClass}>
                  Preferred job types
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((type) => {
                    const checked =
                      parseList(
                        form.preferredJobTypes
                      ).includes(type);
                    return (
                      <label
                        key={type}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${checked
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          } ${!editing || saving
                            ? "cursor-not-allowed opacity-75"
                            : ""
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={
                            !editing || saving
                          }
                          onChange={(event) =>
                            handleJobTypeChange(
                              type,
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {type.replaceAll(
                          "_",
                          " "
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                title="Salary expectations"
                description="Set your preferred compensation range."
                icon="₹"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <label
                    htmlFor="expectedSalaryMin"
                    className={labelClass}
                  >
                    Minimum salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      ₹
                    </span>
                    <input
                      id="expectedSalaryMin"
                      type="number"
                      min="0"
                      value={
                        form.expectedSalaryMin
                      }
                      onChange={(event) =>
                        handleChange(
                          "expectedSalaryMin",
                          event.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="300000"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="expectedSalaryMax"
                    className={labelClass}
                  >
                    Maximum salary
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      ₹
                    </span>
                    <input
                      id="expectedSalaryMax"
                      type="number"
                      min="0"
                      value={
                        form.expectedSalaryMax
                      }
                      onChange={(event) =>
                        handleChange(
                          "expectedSalaryMax",
                          event.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="600000"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                Enter your expected salary in annual terms, using the
                same currency and units as your existing profile data.
              </p>
            </section>
          </div>
        </div>
        {editing && (
          <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:justify-between sm:px-6">
            <div className="mb-3 sm:mb-0">
              <p className="text-sm font-bold text-slate-800">
                Unsaved changes
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Save your updates or discard your edits.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
