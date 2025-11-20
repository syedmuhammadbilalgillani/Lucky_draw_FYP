import express from "express";
import {
  getDraws,
  getDrawDetail,
  checkUserEntry,
  createEntry,
  getDrawWinners,
  createDraw,
  updateDraw,
  changeDrawStatus,
  deleteDraw,
  getDrawParticipants,
  createParticipantEntry,
  runDraw,
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
} from "../controllers/drawController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getDraws);
router.get("/:id", getDrawDetail);
router.get("/:id/winners", getDrawWinners);

// Authenticated participant routes
router.get("/:id/entries/me", authMiddleware, checkUserEntry);
router.post("/:id/entries", authMiddleware, createEntry);

// Admin routes (all require authentication)
router.post("/c", authMiddleware, createDraw);
router.patch("/:id", authMiddleware, updateDraw);
router.patch("/:id/status", authMiddleware, changeDrawStatus);
router.delete("/:id", authMiddleware, deleteDraw);
router.get("/:id/participants", authMiddleware, getDrawParticipants);
router.post("/:id/participants", authMiddleware, createParticipantEntry);
router.post("/:id/run", authMiddleware, runDraw);

// Prize routes (all require authentication)
router.get("/:id/prizes", authMiddleware, getPrizes);
router.post("/:id/prizes", authMiddleware, createPrize);
router.patch("/prizes/:prizeId", authMiddleware, updatePrize);
router.delete("/prizes/:prizeId", authMiddleware, deletePrize);

export default router;
