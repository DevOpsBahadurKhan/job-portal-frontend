'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoadingUsers(true);

        try {
            const response = await apiClient.getUsers();

            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setError(response.error || 'Failed to fetch users');
            }
        } catch {
            setError('An error occurred while fetching users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        setUpdatingUserId(userId);

        try {
            const response = await apiClient.updateUserRole(userId, newRole);

            if (response.success) {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId ? { ...user, role: newRole } : user
                    )
                );
            } else {
                setError(response.error || 'Failed to update user role');
            }
        } catch {
            setError('An error occurred while updating user role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="mb-12">
         
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-3">
                            Total Users
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.length}
                    </div>
                    <div className="text-sm text-gray-500">Registered Users</div>
                </div>

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
                            Recruiters
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.filter((user) => user.role === 'RECRUITER').length}
                    </div>
                    <div className="text-sm text-gray-500">Active Recruiters</div>
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
                            Candidates
                        </h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {users.filter((user) => user.role === 'CANDIDATE').length}
                    </div>
                    <div className="text-sm text-gray-500">Job Seekers</div>
                </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        'ID',
                                        'Name',
                                        'Email',
                                        'Current Role',
                                        'Change Role',
                                        'Created At',
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((userItem) => (
                                    <tr key={userItem.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {userItem.id}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {userItem.name}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {userItem.email}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userItem.role === 'SUPER_ADMIN'
                                                        ? 'bg-red-100 text-red-800'
                                                        : userItem.role === 'ADMIN'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : userItem.role === 'RECRUITER'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {userItem.role}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={userItem.role}
                                                onChange={(e) =>
                                                    handleRoleChange(userItem.id, e.target.value)
                                                }
                                                disabled={updatingUserId === userItem.id}
                                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="CANDIDATE">CANDIDATE</option>
                                                <option value="RECRUITER">RECRUITER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                            </select>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(userItem.createdAt).toLocaleDateString()}
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