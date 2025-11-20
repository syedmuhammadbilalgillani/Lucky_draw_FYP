import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getUsers, blockUser, type User, type UserRole, type UserStatus } from "requests/users";
import { logger } from "utils/logger";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<{ role?: UserRole; status?: UserStatus }>({});

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(filters);
      setUsers(data);
    } catch (err) {
      logger.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  // Handle blocking a user
  const handleBlockUser = async (id: number) => {
    if (!confirm("Are you sure you want to block this user?")) return;
    
    try {
      await blockUser(id);
      fetchUsers(); // Refresh the list after blocking a user
    } catch (err) {
      logger.error("Failed to block user:", err);
      setError(err instanceof Error ? err.message : "Error blocking user.");
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block">Role</label>
          <select
            value={filters.role || ""}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole || undefined })}
            className="p-2 border rounded"
          >
            <option value="">All</option>
            <option value="ADMIN">Admin</option>
            <option value="PARTICIPANT">Participant</option>
          </select>
        </div>

        <div>
          <label className="block">Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus || undefined })}
            className="p-2 border rounded"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Display Error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.fullName}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">{user.status}</td>
                <td className="border p-2">
                  <Link
                    to={`/admin/user-details/${user.id}`}
                    className="text-blue-500 hover:underline mr-4"
                  >
                    View
                  </Link>
                  {user.status !== "BLOCKED" && (
                    <button
                      onClick={() => handleBlockUser(user.id)}
                      className="text-red-500 hover:underline"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
