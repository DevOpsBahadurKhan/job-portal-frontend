'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Use user data from AuthContext instead of API call
  const profile = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: (user as any).createdAt || new Date().toISOString()
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">View and manage your account information</p>
          </div>

          {profile ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                    profile.role === 'ADMIN' ? 'bg-orange-100 text-orange-800' :
                    profile.role === 'RECRUITER' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="text-lg text-gray-900">{profile.id}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">{profile.email}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Account Created
                  </label>
                  <p className="text-lg text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <p className="text-lg text-gray-900">{profile.role}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {profile.role === 'CANDIDATE' && (
                  <Link
                    href="/my-applications"
                    className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    View My Applications
                  </Link>
                )}

                {(profile.role === 'RECRUITER' || profile.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Dashboard
                  </Link>
                )}

                {profile.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/companies"
                    className="block w-full text-center bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
                  >
                    Manage Companies
                  </Link>
                )}

                {(profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin"
                    className="block w-full text-center bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={() => router.push('/jobs')}
                  className="block w-full text-center bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Browse Jobs
                </button>

                <button
                  onClick={logout}
                  className="block w-full text-center bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">Unable to load profile information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
