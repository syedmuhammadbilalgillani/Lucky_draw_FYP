import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getUserById, updateUser, type User, type UserRole, type UserStatus } from "requests/users";
import { logger } from "utils/logger";

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<{
    fullName?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
  }>({});

  // Fetch user details by ID
  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserById(parseInt(id || "0"));
      setUser(data);
      setFormData({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        status: data.status,
      });
    } catch (err) {
      logger.error("Failed to fetch user:", err);
      setError(err instanceof Error ? err.message : "Error fetching user details.");
    } finally {
      setLoading(false);
    }
  };

  // Update user details
  const handleUpdate = async () => {
    try {
      await updateUser(parseInt(id || "0"), formData);
      navigate("/admin"); // Redirect back to the user list
    } catch (err) {
      logger.error("Failed to update user:", err);
      setError(err instanceof Error ? err.message : "Error updating user details.");
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">User Details</h2>

      {/* Display Error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading user details...</div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block">Full Name</label>
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block">Email</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block">Role</label>
            <select
              value={formData.role || ""}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="p-2 border rounded w-full"
            >
              <option value="ADMIN">Admin</option>
              <option value="PARTICIPANT">Participant</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block">Status</label>
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="p-2 border rounded w-full"
            >
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Update User
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
