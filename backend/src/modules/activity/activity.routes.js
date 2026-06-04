import express, { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createActivityController,
    updateActivityController,
    deleteActivityController,
    getAllActivitiesController,
} from "./activity.controller.js";

const router = Router();

router.post("/", verifyToken, createActivityController);
router.patch("/:activityId", verifyToken, updateActivityController);
router.delete("/:activityId", verifyToken, deleteActivityController);
router.get("/", verifyToken, getAllActivitiesController);// for dashboard feeds(only)

export default router;