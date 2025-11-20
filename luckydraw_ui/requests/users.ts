import { getToken } from "./auth";
import { API_BASE_URL } from "../constants/url";
import { logger } from "../utils/logger";
import type { User, UserRole, UserStatus } from "./auth";

// ===== Types =====

export interface UpdateUserPayload {
  role?: UserRole;
  status?: UserStatus;
  fullName?: string;
  email?: string;
}

export interface GetUsersParams {
  role?: UserRole;
  status?: UserStatus;
}

// ===== Helper Functions =====

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
}

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

// ===== User Management APIs =====

export async function getUsers(
  params?: GetUsersParams
): Promise<User[]> {
  logger.info("Calling GET /api/auth/users", params);

  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/api/auth/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<User[]>(res);
}

export async function getUserById(id: number): Promise<User> {
  logger.info("Calling GET /api/auth/users/:id", id);

  const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<User>(res);
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload
): Promise<User> {
  logger.info("Calling PATCH /api/auth/users/:id", id, payload);

  const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<User>(res);
}

export async function blockUser(id: number): Promise<User> {
  logger.info("Calling DELETE /api/auth/users/:id", id);

  const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<User>(res);
}

