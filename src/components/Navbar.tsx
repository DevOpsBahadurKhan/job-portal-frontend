"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";
const linkClassName =
  "rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
interface MobileLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}
function MobileLink({ href, onClick, children }: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </Link>
  );
}
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isRecruiter = user?.role === "RECRUITER";
  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isCandidate = user?.role === "CANDIDATE";
  const closeMobileMenu = () => setMobileOpen(false);
  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    logout();
  };
  // Avatar and user details
  const userWithImage = user as
    | (typeof user & {
      image?: string | null;
      avatarUrl?: string | null;
      email?: string | null;
    })
    | null;
  const rawAvatarUrl =
    profilePhoto ||
    userWithImage?.image ||
    userWithImage?.avatarUrl ||
    null;
  const avatarUrl = rawAvatarUrl
    ? rawAvatarUrl.startsWith("http://") ||
      rawAvatarUrl.startsWith("https://")
      ? rawAvatarUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${rawAvatarUrl.startsWith("/") ? "" : "/"}${rawAvatarUrl}`
    : null;
  const userName = user?.name || "User";
  const userEmail = userWithImage?.email || "";
  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  useEffect(() => {
    if (!isAuthenticated) {
      setProfilePhoto(null);
      return;
    }
    const loadProfilePhoto = async () => {
      try {
        const response = await apiClient.getMyCandidateProfile();
        if (!response.success || !response.data) {
          return;
        }
        const data = response.data as any;
        const photo =
          data?.candidateProfile?.avatarUrl ||
          data?.avatarUrl ||
          data?.user?.candidateProfile?.avatarUrl ||
          null;
        setProfilePhoto(photo);
      } catch (error) {
        console.error(
          "❌ Failed to load navbar profile photo:",
          error
        );
      }
    };
    loadProfilePhoto();
  }, [isAuthenticated]);
  // Close dropdown on outside click or Escape*
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  // Hide navbar on login and registration pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }
  return (
    <nav
      className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md"
      aria-label="Primary navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between">
          {/* {* /\* Logo and desktop links */}
          <div className="flex min-w-0 items-center">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex shrink-0 items-center"
            >
              <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                Quick<span className="text-blue-600">Hire</span>
              </span>
            </Link>
            <div className="ml-5 hidden items-center gap-1 lg:ml-8 md:flex">
              {/* {* /\* AI Assistant  */}
              {isAuthenticated && (
                <Link
                  href="/ai-assistant"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
                    <path d="m18.36 5.64-1.42 1.42M7.05 16.95l-1.41 1.41m12.72 0-1.41-1.41M7.05 7.05 5.64 5.64" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Hire Assist
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
                    AI
                  </span>
                </Link>
              )}
            </div>
          </div>
          {/* {* /\* Desktop actions  */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Open profile menu"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-full border border-transparent p-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${userName}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-semibold text-gray-700 lg:block">
                    {userName}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                      }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {/* { Profile dropdown } */}
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/70"
                  >
                    {/* { User information } */}
                    <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-base font-bold text-blue-700">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {userName}
                          </p>
                          {userEmail && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {userEmail}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] font-semibold capitalize text-blue-600">
                            {user?.role?.replace("_", " ").toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        role="menuitem"
                        className="mt-4 block w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-center text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                      >
                        View profile
                      </Link>
                    </div>
                    {/* {* Role-based menu links  /*} */}
                    <div className="p-2">
                      {isCandidate && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
                          >
                            <svg
                              className="h-4 w-4 text-gray-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="3" />
                              <path d="M3 9h18M9 21V9" />
                            </svg>
                           Candidate Dashboard
                          </Link>
                        </>
                      )}
                      {isRecruiter && (
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
                        >
                          <svg
                            className="h-4 w-4 text-gray-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <rect x="3" y="7" width="18" height="14" rx="2" />
                            <path d="M8 7V4h8v3M3 12h18" />
                          </svg>
                          Recruiter Dashboard
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
                        >
                          <svg
                            className="h-4 w-4 text-gray-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    {/* {* /\* Logout*} */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M10 17l5-5-5-5m5 5H3" />
                          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={linkClassName}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          {/* {* /\* Mobile menu toggle */}
          <button
            type="button"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl p-2.5 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* {* /\* Mobile navigation  */}
        {mobileOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-gray-100 pb-4 pt-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              <MobileLink href="/jobs" onClick={closeMobileMenu}>
                Jobs
              </MobileLink>
              {isAuthenticated && (
                <MobileLink
                  href="/ai-assistant"
                  onClick={closeMobileMenu}
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3v2m0 14v2m9-9h-2M5 12H3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  AI Assistant
                </MobileLink>
              )}
              {isAuthenticated && isRecruiter && (
                <>
                  <MobileLink href="/dashboard" onClick={closeMobileMenu}>
                    Dashboard
                  </MobileLink>
                  <MobileLink
                    href="/dashboard/create-job"
                    onClick={closeMobileMenu}
                  >
                    Post Job
                  </MobileLink>
                </>
              )}
              {isAuthenticated && isAdmin && (
                <>
                  <MobileLink href="/companies" onClick={closeMobileMenu}>
                    Companies
                  </MobileLink>
                  <MobileLink
                    href="/dashboard/AdminDashboard"
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </MobileLink>
                </>
              )}
              <div className="mt-2 border-t border-gray-100 pt-3">
                {isAuthenticated ? (
                  <>
                    {/* {* /\* Mobile user information  *} */}
                    <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {userName}
                        </p>
                        {userEmail && (
                          <p className="truncate text-xs text-gray-500">
                            {userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <MobileLink href="/profile" onClick={closeMobileMenu}>
                      My Profile
                    </MobileLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M10 17l5-5-5-5m5 5H3" />
                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink href="/login" onClick={closeMobileMenu}>
                      Login
                    </MobileLink>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="mt-2 block rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
