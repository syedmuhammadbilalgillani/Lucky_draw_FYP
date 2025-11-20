import React from 'react';
import { useAuth } from '../context/auth-context';

export function Profile() {
  const { user, logout, loading, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <p className="text-center text-gray-500">Not logged in</p>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-700">Profile</h2>

      <div className="space-y-2">
        <p className="text-gray-700">
          <strong>ID:</strong> {user.id}
        </p>
        <p className="text-gray-700">
          <strong>Name:</strong> {user.fullName}
        </p>
        <p className="text-gray-700">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-700">
          <strong>Role:</strong> {user.role}
        </p>
        <p className="text-gray-700">
          <strong>Status:</strong> {user.status}
        </p>
      </div>

      <button
        onClick={logout}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md mt-4"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
