import express from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireOrganizationAccess } from '../../middlewares/organizationAccess.middleware.js';
import {
    createAvailabilityController,
    getAvailabilityByServiceIdController,
    updateAvailabilityController,
    deleteAvailabilityController,
} from "./availability.controller.js";

const router = express.Router();

router.post('/:serviceId', verifyToken, requireOrganizationAccess, createAvailabilityController);
router.patch('/:serviceId', verifyToken, requireOrganizationAccess, updateAvailabilityController);
router.get('/:serviceId', verifyToken, requireOrganizationAccess, getAvailabilityByServiceIdController);
router.delete('/:serviceId', verifyToken, requireOrganizationAccess, deleteAvailabilityController);

export default router;