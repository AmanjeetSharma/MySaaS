import express, { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    createDealController,
    updateDealController,
    updateDealStatusController,
    getDealByIdController,
    deleteDealController,
    getAllDealsForOrganizationController,
    getDealActivitiesController
} from "./deal.controller.js";


const router = Router();

router.post("/", verifyToken, createDealController);
router.patch("/:dealId", verifyToken, updateDealController);
router.patch("/:dealId/status", verifyToken, updateDealStatusController);
router.get("/:dealId", verifyToken, getDealByIdController);
router.delete("/:dealId", verifyToken, deleteDealController);
router.get("/", verifyToken, getAllDealsForOrganizationController);
router.get("/:dealId/activities", verifyToken, getDealActivitiesController);

export default router;