import express, { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createDealController,
    getAllDealsController,
    getDealByIdController,
    updateDealController,
    deleteDealController,
    updateDealStatusController,
    getDealTimelineController,
    getDealActivitiesController
} from "./deal.controller.js";


const router = Router();

router.post("/", verifyToken, createDealController);
router.get("/", verifyToken, getAllDealsController);
router.get("/:dealId", verifyToken, getDealByIdController);
router.put("/:dealId", verifyToken, updateDealController);
router.delete("/:dealId", verifyToken, deleteDealController);
router.patch("/:dealId/status", verifyToken, updateDealStatusController);
router.get("/:dealId/timeline", verifyToken, getDealTimelineController);
router.get("/:dealId/activities", verifyToken, getDealActivitiesController);

export default router;