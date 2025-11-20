import { getToken } from "./auth";
import { API_BASE_URL } from "../constants/url";
import { logger } from "../utils/logger";

// ===== Types =====

export type DrawType = "SINGLE_WINNER" | "MULTI_WINNER";
export type DrawStatus = "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";

export interface LuckyDraw {
  id: number;
  title: string;
  description: string | null;
  drawType: DrawType;
  startDateTime: string;
  endDateTime: string;
  drawDateTime: string | null;
  status: DrawStatus;
  eligibilityCriteria: string | null;
  maxWinners: number;
  createdById: number;
  createdAt: string;
  prizes?: Prize[];
  entries?: ParticipantEntry[];
}

export interface Prize {
  id: number;
  drawId: number;
  prizeName: string;
  prizeDescription: string | null;
  quantity: number;
  prizeRank: number;
}

export interface ParticipantEntry {
  id: number;
  drawId: number;
  userId: number;
  entryTime: string;
  ticketNumber: string | null;
  isValid: boolean;
  invalidReason: string | null;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface Winner {
  id: number;
  entryId: number;
  prizeId: number;
  winTime: string;
  prize?: Prize;
  entry?: ParticipantEntry;
}

export interface CreateDrawPayload {
  title: string;
  description?: string;
  drawType: DrawType;
  startDateTime: string;
  endDateTime: string;
  maxWinners: number;
  eligibilityCriteria?: string;
}

export interface UpdateDrawPayload {
  title?: string;
  description?: string;
  maxWinners?: number;
  eligibilityCriteria?: string;
}

export interface CreatePrizePayload {
  prizeName: string;
  prizeDescription?: string;
  quantity: number;
  prizeRank: number;
}

export interface UpdatePrizePayload {
  prizeName?: string;
  prizeDescription?: string;
  quantity?: number;
  prizeRank?: number;
}

export interface UserEntryStatus {
  entryStatus: "VALID" | "INVALID";
  ticketNumber: string | null;
}

export interface CreateEntryResponse {
  id: number;
  ticketNumber: string;
  entryTime: string;
  message: string;
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

// ===== Public Draw APIs =====

export async function getDraws(params?: {
  status?: DrawStatus;
  upcoming?: boolean;
  completed?: boolean;
}): Promise<LuckyDraw[]> {
  logger.info("Calling GET /api/draws", params);

  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.upcoming) queryParams.append("upcoming", "true");
  if (params?.completed) queryParams.append("completed", "true");

  const url = `${API_BASE_URL}/api/draws${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<LuckyDraw[]>(res);
}

export async function getDrawDetail(id: number): Promise<LuckyDraw> {
  logger.info("Calling GET /api/draws/:id", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<LuckyDraw>(res);
}

export async function checkUserEntry(id: number): Promise<UserEntryStatus> {
  logger.info("Calling GET /api/draws/:id/entries/me", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/entries/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<UserEntryStatus>(res);
}

export async function createEntry(id: number): Promise<CreateEntryResponse> {
  logger.info("Calling POST /api/draws/:id/entries", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/entries`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse<CreateEntryResponse>(res);
}

export async function getDrawWinners(id: number): Promise<Winner[]> {
  logger.info("Calling GET /api/draws/:id/winners", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/winners`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<Winner[]>(res);
}

// ===== Admin Draw APIs =====

export async function createDraw(
  payload: CreateDrawPayload
): Promise<LuckyDraw> {
  logger.info("Calling POST /api/draws/c", payload);

  const res = await fetch(`${API_BASE_URL}/api/draws/c`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<LuckyDraw>(res);
}

export async function updateDraw(
  id: number,
  payload: UpdateDrawPayload
): Promise<LuckyDraw> {
  logger.info("Calling PATCH /api/draws/:id", id, payload);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<LuckyDraw>(res);
}

export async function changeDrawStatus(
  id: number,
  status: DrawStatus
): Promise<LuckyDraw> {
  logger.info("Calling PATCH /api/draws/:id/status", id, status);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse<LuckyDraw>(res);
}

export async function deleteDraw(id: number): Promise<LuckyDraw> {
  logger.info("Calling DELETE /api/draws/:id", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<LuckyDraw>(res);
}

export async function getDrawParticipants(
  id: number
): Promise<ParticipantEntry[]> {
  logger.info("Calling GET /api/draws/:id/participants", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/participants`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<ParticipantEntry[]>(res);
}

export async function createParticipantEntry(
  drawId: number,
  userId: number
): Promise<ParticipantEntry> {
  logger.info("Calling POST /api/draws/:id/participants", drawId, userId);

  const res = await fetch(`${API_BASE_URL}/api/draws/${drawId}/participants`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });

  return handleResponse<ParticipantEntry>(res);
}

export async function runDraw(id: number): Promise<Winner[]> {
  logger.info("Calling POST /api/draws/:id/run", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/run`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse<Winner[]>(res);
}

// ===== Prize APIs =====

export async function getPrizes(id: number): Promise<Prize[]> {
  logger.info("Calling GET /api/draws/:id/prizes", id);

  const res = await fetch(`${API_BASE_URL}/api/draws/${id}/prizes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<Prize[]>(res);
}

export async function createPrize(
  drawId: number,
  payload: CreatePrizePayload
): Promise<Prize> {
  logger.info("Calling POST /api/draws/:id/prizes", drawId, payload);

  const res = await fetch(`${API_BASE_URL}/api/draws/${drawId}/prizes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<Prize>(res);
}

export async function updatePrize(
  prizeId: number,
  payload: UpdatePrizePayload
): Promise<Prize> {
  logger.info("Calling PATCH /api/draws/prizes/:prizeId", prizeId, payload);

  const res = await fetch(`${API_BASE_URL}/api/draws/prizes/${prizeId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<Prize>(res);
}

export async function deletePrize(prizeId: number): Promise<Prize> {
  logger.info("Calling DELETE /api/draws/prizes/:prizeId", prizeId);

  const res = await fetch(`${API_BASE_URL}/api/draws/prizes/${prizeId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<Prize>(res);
}
