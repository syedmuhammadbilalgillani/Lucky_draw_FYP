// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import logger from "../lib/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    logger.warn("Missing or invalid Authorization header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    logger.debug("Token verified for userId:", payload.sub);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      logger.warn("User not found for token sub:", payload.sub);
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error("JWT error:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
