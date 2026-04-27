import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getUser, updateUser } from "./user/user.controller.js";
import { getUserSessions, logoutSessionById, logoutAllSessions } from "./sessions/sessions.controller.js";

const router = express.Router();

// Profile routes
router.get("/", verifyToken, getUser);
router.patch("/update", verifyToken, updateUser);
// router.post('/avatar', verifyToken, updateUserAvatar);

// Sessions routes
router.get("/sessions", verifyToken, getUserSessions);
router.post("/sessions/logout/:sessionId", verifyToken, logoutSessionById);
router.post("/sessions/logout", verifyToken, logoutAllSessions);
// Password routes
// Settings routes

export default router;