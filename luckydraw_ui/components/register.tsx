import React, { useState, type FormEvent, type ChangeEvent } from "react";
import { useAuth } from "../context/auth-context";
import { logger } from "../utils/logger";
import { type RegisterPayload, type User } from "../requests/auth";

export function RegisterForm({
  setIsRegister,
}: {
  setIsRegister: (isRegister: boolean) => void;
}) {
  const { register, loading } = useAuth();
  const [form, setForm] = useState<RegisterPayload>({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const newUser: User = await register(form);
      logger.info("User registered from RegisterForm:", newUser.id);
      setSuccessMsg("Registration successful. You can now log in.");
      setIsRegister(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Register failed";
      logger.error("Register failed:", message);
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">Register</h2>

      <div>
        <label className="block text-gray-700">Full Name</label>
        <input
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-gray-700">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="text-center">
        Return to{" "}
        <button
          onClick={() => setIsRegister(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          Login
        </button>
      </div>
    </form>
  );
}
