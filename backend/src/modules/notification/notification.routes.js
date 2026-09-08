import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    getNotificationsController,

    markSelectedNotificationsAsReadController,
    markAllNotificationsAsReadController,

    deleteSelectedNotificationsController,
    deleteAllNotificationsController,
} from "./notification.controller.js";

const router = Router();

router.get("/", verifyToken, getNotificationsController);

router.patch("/read-selected", verifyToken, markSelectedNotificationsAsReadController);
router.patch("/read-all", verifyToken, markAllNotificationsAsReadController);

router.delete("/delete-selected", verifyToken, deleteSelectedNotificationsController);
router.delete("/delete-all", verifyToken, deleteAllNotificationsController);

export default router;
