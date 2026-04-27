import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getUser, updateUser } from "./user/user.controller.js";

const router = express.Router();

// Profile routes
router.get("/", verifyToken, getUser);
router.patch("/update", verifyToken, updateUser);

// Sessions routes
// Password routes
// Settings routes

export default router;