import express from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getUser, updateUser, updateUserAvatar, deleteUserAvatar } from "./user/user.controller.js";
import { getUserSessions, logoutSessionById, logoutAllSessions } from "./sessions/sessions.controller.js";

const router = express.Router();

// Profile routes
router.get("/", verifyToken, getUser);
router.patch("/me", verifyToken, updateUser);
router.patch('/me/avatar', upload.single('avatar'), verifyToken, updateUserAvatar);
router.delete('/me/avatar', verifyToken, deleteUserAvatar);

// Sessions routes
router.get("/sessions", verifyToken, getUserSessions);
router.post("/sessions/logout/:sessionId", verifyToken, logoutSessionById);
router.post("/sessions/logout", verifyToken, logoutAllSessions);

// Password routes
// Settings routes

export default router;