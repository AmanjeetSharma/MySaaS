import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getUser } from "./profile/profile.controller.js";

const router = express.Router();

// Profile routes
router.get("/", verifyToken, getUser);


// Sessions routes
// Password routes
// Settings routes

export default router;