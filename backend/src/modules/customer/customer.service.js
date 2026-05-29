import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import {
    checkUserOrganizationMembership,
    findCustomerByName,
    findCustomerByEmail,
    findCustomerByPhone,
    createCustomer
} from './customer.repository.js'
import { nameValidator, emailValidator, phoneNumberValidator } from '../../validations/auth.validators.js';



export const createCustomerService = async (userId, payload) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { orgId, name, email, phone } = payload;

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
        if (!emailValidator(normalizedEmail)) {
            throw new ApiError(400, "Please enter a valid email address");
        }
    }

    if (normalizedPhone) {
        const phoneError = phoneNumberValidator(normalizedPhone);
        if (!phoneError.valid) {
            throw new ApiError(400, `${phoneError.errors.join(", ")}`);
        }
    }

    //check if customer exists
    const existingCustomer = await findCustomerByName(orgId, name);
    if (existingCustomer) {
        throw new ApiError(409, "Customer with the same name already exists, want to update it instead?");// then we redirect them to update flow
    }

    if (normalizedEmail) {
        const existingEmailCustomer = await findCustomerByEmail(orgId, normalizedEmail);
        if (existingEmailCustomer) {
            throw new ApiError(409, "Customer with the same email already exists, want to update it instead?");// then we redirect them to update flow
        }
    }

    if (normalizedPhone) {
        const existingPhoneCustomer = await findCustomerByPhone(orgId, normalizedPhone);
        if (existingPhoneCustomer) {
            throw new ApiError(409, "Customer with the same phone number already exists, want to update it instead?");// then we redirect them to update flow
        }
    }

    const customer = await createCustomer({
        organization: orgId,
        name,
        email: normalizedEmail,
        phone: normalizedPhone,
        source: "manual",
        createdBy: userId
    });

    if (!customer) {
        throw new ApiError(500, "Failed to create customer");
    }

    console.log(`Customer created | ID: ${customer._id} | Name: ${customer.name} | Source: ${customer.source} | Organization: ${orgId} | CreatedBy: ${userId}`);

    return {
        customer,
        message: "New customer created successfully"
    }
}