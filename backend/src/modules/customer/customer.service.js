import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import {

} from './customer.repository.js'
import { nameValidator, emailValidator, phoneNumberValidator } from '../../validations/auth.validators.js';



export const createCustomerService = async (userId, payload) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { organizationId, name, email, phone, source } = payload;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    const nameError = nameValidator(name);
    if (!nameError.valid) {
        throw new ApiError(400, `${nameError.errors.join(", ")}`);
    }

    if (email) {
        const emailError = emailValidator(email);
        if (!emailError.valid) {
            throw new ApiError(400, `${emailError.errors.join(", ")}`);
        }
    }

    if (phone) {
        const phoneError = phoneNumberValidator(phone);
        if (!phoneError.valid) {
            throw new ApiError(400, `${phoneError.errors.join(", ")}`);
        }
    }

    if (source && !["manual", "booking"].includes(source)) {
        throw new ApiError(400, "Invalid source value");
    }

    //check if customer exists
    const existingCustomer = await findCustomerByOrganizationAndEmail(organizationId, email);


}