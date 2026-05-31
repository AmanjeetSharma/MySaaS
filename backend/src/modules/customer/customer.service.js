import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import {
    checkUserOrganizationMembership,
    findCustomerByName,
    findCustomerByEmail,
    findCustomerByPhone,
    createCustomer,
    findCustomerById,
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

    let customer;
    try {
        customer = await createCustomer({
            organization: orgId,
            name,
            email: normalizedEmail,
            phone: normalizedPhone,
            source: "manual",
            createdBy: userId
        });
    } catch (err) {
        console.error("Customer creation failed:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[1];// keyPattern has format { organization: 1, email: 1 } or { organization: 1, phone: 1 }
            throw new ApiError(409, `Customer with the same ${field} already exists`);
        }
        throw new ApiError(500, "Failed to create customer, please try again");
    }

    console.log(`Customer created | ID: ${customer._id} | Name: ${customer.name} | Source: ${customer.source} | Organization: ${orgId} | CreatedBy: ${userId}`);

    return {
        customer,
        message: "New customer created successfully"
    }
}











export const updateCustomerService = async (userId, customerId, payload) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await findCustomerById(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, customer.organization);

    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    const updates = {};

    if (payload.name !== undefined) {
        const normalizedName = payload.name?.trim().replace(/\s+/g, " ");// replace multiple spaces with single space

        const nameError = nameValidator(normalizedName);

        if (!nameError.valid) {
            throw new ApiError(400, nameError.errors.join(", "));
        }

        const existingCustomer = await findCustomerByName(customer.organization, normalizedName);

        if (existingCustomer && existingCustomer._id.toString() !== customerId) {
            throw new ApiError(409, "Customer with the same name already exists");
        }

        updates.name = normalizedName;
    }

    if (payload.email !== undefined) {
        const normalizedEmail = payload.email?.trim().toLowerCase() || null;

        if (normalizedEmail && !emailValidator(normalizedEmail)) {
            throw new ApiError(400, "Please enter a valid email address");
        }

        if (normalizedEmail) {
            const existingCustomer = await findCustomerByEmail(customer.organization, normalizedEmail);

            if (existingCustomer && existingCustomer._id.toString() !== customerId) {
                throw new ApiError(409, "Customer with the same email already exists");
            }
        }

        updates.email = normalizedEmail;
    }

    if (payload.phone !== undefined) {
        const normalizedPhone = payload.phone?.trim() || null;

        if (normalizedPhone) {
            const phoneError = phoneNumberValidator(normalizedPhone);

            if (!phoneError.valid) {
                throw new ApiError(400, phoneError.errors.join(", "));
            }

            const existingCustomer = await findCustomerByPhone(customer.organization, normalizedPhone);

            if (existingCustomer && existingCustomer._id.toString() !== customerId) {
                throw new ApiError(409, "Customer with the same phone number already exists");
            }
        }

        updates.phone = normalizedPhone;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "At least one field is required to update");
    }

    updates.updatedBy = userId;

    Object.assign(customer, updates);

    try {
        await customer.save();
    } catch (err) {
        if (err.code === 11000) {
            throw new ApiError(409, "Customer already exists");
        }

        console.error("Customer update failed:", err);

        throw new ApiError(500, "Failed to update customer, please try again");
    }

    const { updatedBy, ...sanitizedUpdates } = updates;
    console.log(`Customer updated | ID: ${customer._id} | UpdatedBy: ${userId} | Updates: ${JSON.stringify(sanitizedUpdates)}`);

    return {
        customer,
        message: `Customer has been updated`
    };
};












export const getCustomerService = async (userId, customerId) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await findCustomerById(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, customer.organization);

    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    return customer;
};









export const removeCustomerService = async (userId, customerId) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await findCustomerById(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, customer.organization);

    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    customer.isDeleted = true;
    customer.updatedBy = userId;

    try {
        await customer.save();
    } catch (err) {
        console.error("Customer removal failed:", err);
        throw new ApiError(500, "Failed to remove customer, please try again");
    }

    console.log(`Customer removed | ID: ${customer._id} | UpdatedBy: ${userId}`);

    return;
};