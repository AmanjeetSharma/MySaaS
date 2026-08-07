import express from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    createAvailabilityController,
    getAvailabilityByServiceIdController,
    updateAvailabilityController,
    deleteAvailabilityController,
} from "./availability.controller.js";

const router = express.Router();

router.post('/:serviceId', verifyToken, createAvailabilityController);
router.patch('/:serviceId', verifyToken, updateAvailabilityController);
router.get('/:serviceId', verifyToken, getAvailabilityByServiceIdController);
router.delete('/:serviceId', verifyToken, deleteAvailabilityController);

export default router;
