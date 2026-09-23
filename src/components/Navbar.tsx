'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const linkClassName = 'rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <nav className="relative z-30 bg-white shadow-sm" aria-label="Primary navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex min-w-0 items-center">
            <Link href="/" className="flex shrink-0 items-center px-0 sm:px-4" onClick={closeMobileMenu}>
              <span className="text-xl font-bold text-gray-900">Job Portal</span>
            </Link>
            <div className="ml-2 hidden items-center space-x-1 md:flex">
              <Link href="/jobs" className={linkClassName}>Jobs</Link>
              {isAuthenticated && isRecruiter && (
                <>
                  <Link href="/dashboard" className={linkClassName}>Dashboard</Link>
                  <Link href="/dashboard/create-job" className={linkClassName}>Post Job</Link>
                </>
              )}
              {isAuthenticated && isAdmin && (
                <>
                  <Link href="/companies" className={linkClassName}>Companies</Link>
                  <Link href="/admin" className={linkClassName}>Admin</Link>
                </>
              )}
              {isAuthenticated && user?.role === 'CANDIDATE' && (
                <Link href="/my-applications" className={linkClassName}>My Applications</Link>
              )}
            </div>
          </div>

          <div className="hidden items-center space-x-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link href="/profile" className={linkClassName}>Profile</Link>
                <span className="max-w-40 truncate px-2 text-sm text-gray-700">Welcome, {user?.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClassName}>Login</Link>
                <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Register</Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
          >
            <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-navigation" className="border-t border-gray-100 pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              <MobileLink href="/jobs" onClick={closeMobileMenu}>Jobs</MobileLink>
              {isAuthenticated && isRecruiter && (
                <>
                  <MobileLink href="/dashboard" onClick={closeMobileMenu}>Dashboard</MobileLink>
                  <MobileLink href="/dashboard/create-job" onClick={closeMobileMenu}>Post Job</MobileLink>
                </>
              )}
              {isAuthenticated && isAdmin && (
                <>
                  <MobileLink href="/companies" onClick={closeMobileMenu}>Companies</MobileLink>
                  <MobileLink href="/admin" onClick={closeMobileMenu}>Admin</MobileLink>
                </>
              )}
              {isAuthenticated && user?.role === 'CANDIDATE' && (
                <MobileLink href="/my-applications" onClick={closeMobileMenu}>My Applications</MobileLink>
              )}
              <div className="mt-2 border-t border-gray-100 pt-2">
                {isAuthenticated ? (
                  <>
                    <MobileLink href="/profile" onClick={closeMobileMenu}>Profile</MobileLink>
                    <div className="px-3 py-2 text-sm text-gray-600">Welcome, {user?.name}</div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="mt-1 w-full rounded-md bg-red-600 px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink href="/login" onClick={closeMobileMenu}>Login</MobileLink>
                    <Link href="/register" onClick={closeMobileMenu} className="mt-1 block rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Register</Link>
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

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      {children}
    </Link>
  );
}
