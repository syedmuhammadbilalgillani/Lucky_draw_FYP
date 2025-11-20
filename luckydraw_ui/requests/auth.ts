// src/api/authApi.ts
import Cookies from "js-cookie";
import { logger } from "../utils/logger";


const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "authToken";

// ===== Types =====

export type UserRole = "ADMIN" | "PARTICIPANT";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  lastLogin?: string | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// ===== Token helpers =====

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  if (!token) return;
  logger.debug("Saving token to localStorage");
  Cookies.set(TOKEN_KEY, token);
}

export function clearToken(): void {
  logger.debug("Clearing token from localStorage");
  Cookies.remove(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===== Response helper =====

async function handleResponse<T>(res: Response): Promise<T> {
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    logger.warn("API error response:", res.status, data);
    const message =
      (data as any).message || (data as any).error || "Request failed";
    throw new Error(message);
  }

  logger.debug("API success response:", data);
  return data as T;
}

// ===== API calls =====

export async function registerUser(payload: RegisterPayload): Promise<User> {
  logger.info("Calling POST /api/auth/register", payload.email);

  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<User>(res);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  logger.info("Calling POST /api/auth/", payload.email);

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<LoginResponse>(res);

  if (data.token) {
    setToken(data.token);
  }

  return data;
}

export interface LogoutResponse {
  message: string;
}

export async function logoutUser(): Promise<LogoutResponse> {
  logger.info("Calling POST /api/auth/logout");

  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await handleResponse<LogoutResponse>(res);
  clearToken();
  return data;
}

export async function fetchMe(): Promise<User> {
  logger.info("Calling GET /api/auth/me");

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  return handleResponse<User>(res);
}

export interface UpdateMyProfilePayload {
  fullName?: string;
  email?: string;
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload
): Promise<User> {
  logger.info("Calling PATCH /api/auth/me", payload);

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<User>(res);
}