import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import {
    checkUserOrganizationMembership,
    findCustomerByName,
    findCustomerByEmail,
    findCustomerByPhone,
    CreateCustomer
} from './customer.repository.js'
import { nameValidator, emailValidator, phoneNumberValidator } from '../../validations/auth.validators.js';



export const createCustomerService = async (userId, payload) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { orgId, name, email, phone, source } = payload;

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, orgId);
    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    const nameError = nameValidator(name);
    if (!nameError.valid) {
        throw new ApiError(400, `${nameError.errors.join(", ")}`);
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    if (normalizedEmail) {
        const emailError = emailValidator(normalizedEmail);
        if (!emailError.valid) {
            throw new ApiError(400, `${emailError.errors.join(", ")}`);
        }
    }

    if (normalizedPhone) {
        const phoneError = phoneNumberValidator(normalizedPhone);
        if (!phoneError.valid) {
            throw new ApiError(400, `${phoneError.errors.join(", ")}`);
        }
    }

    if (!["manual", "booking"].includes(source)) {
        throw new ApiError(400, "Invalid source value");
    }

    //check if customer exists
    const existingCustomer = await findCustomerByName(orgId, name);
    if (existingCustomer) {
        throw new ApiError(409, "Customer with the same name already exists, want to update it instead?");// then we redirect them to update flow
    }

    const existingEmailCustomer = await findCustomerByEmail(orgId, normalizedEmail);
    if (existingEmailCustomer) {
        throw new ApiError(409, "Customer with the same email already exists, want to update it instead?");// then we redirect them to update flow
    }

    const existingPhoneCustomer = await findCustomerByPhone(orgId, normalizedPhone);
    if (existingPhoneCustomer) {
        throw new ApiError(409, "Customer with the same phone number already exists, want to update it instead?");// then we redirect them to update flow
    }

    const customer = await CreateCustomer({
        orgId,
        name,
        email: normalizedEmail,
        phone: normalizedPhone,
        source,
        createdBy: userId
    });

    return {
        customer,
        message: "New customer created successfully"
    }
}