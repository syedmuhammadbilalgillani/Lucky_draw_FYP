import React, { useState, useEffect } from "react";
import { useAuth } from "context/auth-context";
import { fetchMe, updateMyProfile, logoutUser, type User } from "requests/auth";
import { logger } from "utils/logger";
import { useNavigate } from "react-router";
import { User as UserIcon, Mail, Calendar, Shield, Edit2, Save, X, LogOut } from "lucide-react";

const ParticipantProfile: React.FC = () => {
  const { user: contextUser, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUserState] = useState<User | null>(contextUser || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userData = await fetchMe();
        setUserState(userData);
        updateUser(userData); // Update context
        setFormData({
          fullName: userData.fullName,
          email: userData.email,
        });
      } catch (err) {
        logger.error("Failed to fetch profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    // If context user exists, use it; otherwise fetch
    if (contextUser) {
      setUserState(contextUser);
      setFormData({
        fullName: contextUser.fullName,
        email: contextUser.email,
      });
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [contextUser, updateUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const updatedUser = await updateMyProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      });
      setUserState(updatedUser);
      updateUser(updatedUser); // Update the context
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      logger.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
      });
    }
    setIsEditing(false);
    setError("");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      logger.error("Failed to logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <span className="mr-2">✓</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <UserIcon className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-4 py-2 w-full max-w-md"
                        placeholder="Full Name"
                      />
                    ) : (
                      user.fullName
                    )}
                  </h2>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <Mail className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-4 py-2 flex-1 max-w-md"
                        placeholder="Email"
                      />
                    ) : (
                      <span>{user.email}</span>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Account Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID</span>
                    <span className="font-medium text-gray-800">#{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Account Activity
                </h3>
                <div className="space-y-3">
                  {user.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-800">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user.lastLogin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-medium text-gray-800">
                        {new Date(user.lastLogin).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfile;

