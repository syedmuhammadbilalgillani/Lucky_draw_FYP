import React, { useState, type FormEvent, type ChangeEvent } from "react";
import { useAuth } from "../context/auth-context";
import { logger } from "../utils/logger";
import { type LoginPayload } from "../requests/auth";
import { useNavigate } from "react-router";

export function LoginForm({
  setIsRegister,
}: {
  setIsRegister: (isRegister: boolean) => void;
}) {
  const { login, loading } = useAuth();
  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      logger.info("User logged in from LoginForm");
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      logger.error("Login failed:", message);
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">Login</h2>
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <div className="text-center">
        Don't have an account?{" "}
        <button
          onClick={() => setIsRegister(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          Register
        </button>
      </div>
    </form>
  );
}
