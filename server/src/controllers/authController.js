// controllers/authController.js
import { prisma } from "../config/db.js";
import {
  generateAuthToken,
  getSafeUser,
  hashPassword,
  validateLoginPayload,
  validateRegisterPayload,
  verifyPassword,
} from "../helpers/authHelpers.js";
import logger from "../lib/logger.js";

export async function register(req, res) {
  logger.info("POST /api/auth/register");

  const errors = validateRegisterPayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { fullName, email, password } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing)
    return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "PARTICIPANT",
      status: "ACTIVE",
    },
  });

  logger.info("User registered:", user.id);
  res.json(getSafeUser(user));
}

export async function login(req, res) {
  logger.info("POST /api/auth/login");

  const errors = validateLoginPayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  logger.info("User logged in:", user.id);

  const token = generateAuthToken(user);

  res.json({
    user: getSafeUser(user),
    token,
  });
}

export async function logout(req, res) {
  logger.info("POST /api/auth/logout");

  // For JWT: client should just drop token
  res.json({ message: "Logged out" });
}

export async function getMe(req, res) {
  logger.info("GET /api/auth/me");
  res.json(getSafeUser(req.user));
}

// Update current user's own profile
export async function updateMyProfile(req, res) {
  logger.info("PATCH /api/auth/me");
  const { fullName, email } = req.body;
  const userId = req.user.id;

  try {
    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        email: email || undefined,
      },
    });

    res.json(getSafeUser(updatedUser));
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// List users with filters (role, status)
export const getUsers = async (req, res) => {
  const { role, status } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        role: role || undefined,
        status: status || undefined,
      },
    });
    res.json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get a user's details by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Update user role, status, or basic info
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, status, fullName, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        role: role || undefined,
        status: status || undefined,
        fullName: fullName || undefined,
        email: email || undefined,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Soft delete / block a user
export const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const blockedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "BLOCKED", // Soft delete by setting status to 'BLOCKED'
      },
    });

    res.json(blockedUser);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to block user" });
  }
};
