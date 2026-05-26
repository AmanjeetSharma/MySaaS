import express, { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createActivityController,
    updateActivityController,
    deleteActivityController,
    getAllActivitiesController,
    getActivityByIdController,
} from "./activity.controller.js";

const router = Router();

router.post("/", verifyToken, createActivityController);
router.patch("/:activityId", verifyToken, updateActivityController);// for re editing activity notes, like discord messages edit
router.delete("/:activityId", verifyToken, deleteActivityController);// for deleting activity notes, like discord messages delete
router.get("/", verifyToken, getAllActivitiesController);// only for dashboard feeds
router.get("/:activityId", verifyToken, getActivityByIdController); // not useful for now, but may be used in future

export default router;