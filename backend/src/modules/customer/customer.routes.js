import express from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
    createCustomerController,
    updateCustomerController,
    getCustomerController,
    removeCustomerController,
    getAllCustomersOfOrganizationController,
    getCustomerHistoryController,
    getCustomerDealsController,
    getCustomerAppointmentsController,
} from './customer.controller.js';

    
const router = express.Router();

router.post('/', verifyToken, createCustomerController);
router.patch('/:customerId', verifyToken, updateCustomerController);
router.get('/:customerId', verifyToken, getCustomerController);
router.get('/', verifyToken, getAllCustomersOfOrganizationController);
router.delete('/:customerId', verifyToken, removeCustomerController);
router.get('/:customerId/history', verifyToken, getCustomerHistoryController);
router.get('/:customerId/deals', verifyToken, getCustomerDealsController);
router.get('/:customerId/appointments', verifyToken, getCustomerAppointmentsController);


export default router;