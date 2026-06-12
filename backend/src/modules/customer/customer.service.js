import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import {
    checkUserOrganizationMembership,
    findCustomerByName,
    findCustomerByEmail,
    findCustomerByPhone,
    createCustomer,
    findCustomerById,
    findCustomerByIdFull,
    findCustomers,
    countCustomers,
    findActivities,
    countActivities,
    getActivitySummary,
    findDeals,
    getDealStatistics,
    getOrgDetails,
} from './customer.repository.js'
import { nameValidator, emailValidator, phoneNumberValidator } from '../../validations/auth.validators.js';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.constants.js';







export const createCustomerService = async (userId, payload) => {
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
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ApiError(400, "Invalid customer ID");
    }

    const customer = await findCustomerByIdFull(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, customer.organization);

    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    console.log(`Customer retrieved | ID: ${customer._id} | Name: ${customer.name} | Organization: ${customer.organization}`);

    return customer;
};









export const deleteCustomerService = async (userId, customerId) => {
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
    customer.deletedAt = new Date();

    try {
        await customer.save();
    } catch (err) {
        console.error("Customer deletion failed:", err);
        throw new ApiError(500, "Failed to delete customer, please try again");
    }

    console.log(`Customer deleted | ID: ${customer._id} | UpdatedBy: ${userId}`);

    return {
        customerId: customer._id,
        message: "Customer has been deleted"
    };
};












export const getAllCustomersOfOrganizationService = async (userId, orgId, query) => {
    const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = query;

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        throw new ApiError(400, "Invalid organization ID");
    }

    const isPartOfOrg = await checkUserOrganizationMembership(userId, orgId);
    if (!isPartOfOrg) {
        throw new ApiError(403, "Access denied: You are not a member of this organization");
    }

    const orgDetails = await getOrgDetails(orgId);

    const filter = {
        organization: orgId,
        isDeleted: false
    };

    if (search?.trim()) {
        const searchTerm = search.trim().replace(/\s+/g, " ");
        filter.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
            { phone: { $regex: searchTerm, $options: "i" } }
        ];
    }

    // pagination
    let pageNum = Number(page) || 1; // if invalid type then use default page 1 & preventing garbage value for page
    let limitNum = Number(limit) || 10; // if invalid type then use default limit 10 & preventing garbage value for limit
    pageNum = Math.max(1, pageNum);
    if (pageNum > 100) {
        throw new ApiError(400, "Page number exceeds maximum allowed limit");
    }
    limitNum = Math.min(100, Math.max(1, limitNum));
    const skip = (pageNum - 1) * limitNum;

    console.log(`--------\npage: ${pageNum} | limit: ${limitNum} | skip: ${skip}`); // debug log 

    // sorting
    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "name",
        "email",
        "phone"
    ];

    const finalSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sort = {
        [finalSortField]: sortOrder === "desc" ? -1 : 1
    };

    try {
        const [customers, total] = await Promise.all([
            findCustomers({
                filter,
                sort,
                skip,
                limit: limitNum
            }),
            countCustomers(filter)
        ]);

        console.log(`Customers retrieved | Organization: ${orgId} | RequestedBy: ${userId} \nCount: ${customers.length} | Total: ${total} | Search: ${search || "N/A"} | Sort: ${finalSortField} ${sortOrder}`);

        return {
            customers,
            organization: orgDetails,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        };
    } catch (err) {
        console.error("Failed to fetch customers:", err);
        throw new ApiError(500, "Failed to retrieve customers, please try again");
    }
};












export const getCustomerTimelineService = async (userId, customerId, query) => {
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

    const {
        page = 1,
        limit = 10,
        type,
        startDate,
        endDate
    } = query;

    const filter = {
        organization: customer.organization,
        customer: customerId
    };

    if (type?.trim()) {
        const normalizedType = type.trim().toLowerCase();
        if (!ACTIVITY_TYPES.includes(normalizedType)) {
            throw new ApiError(400, `Invalid activity type filter. Allowed values are: ${ACTIVITY_TYPES.join(", ")}`);
        }
        filter.type = normalizedType;
    }

    // date range filtering
    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            const parsedStartDate = new Date(startDate);
            if (isNaN(parsedStartDate.getTime())) {
                throw new ApiError(400, "Invalid start date");
            }
            filter.createdAt.$gte = parsedStartDate;
        }

        if (endDate) {
            const parsedEndDate = new Date(endDate);
            if (isNaN(parsedEndDate.getTime())) {
                throw new ApiError(400, "Invalid end date");
            }
            filter.createdAt.$lte = parsedEndDate;
        }

        if (
            filter.createdAt.$gte && filter.createdAt.$lte && filter.createdAt.$gte > filter.createdAt.$lte) {
            throw new ApiError(400, "Start date cannot be later than end date");
        }
    }

    // pagination
    let pageNum = Number(page) || 1;
    let limitNum = Number(limit) || 20;
    pageNum = Math.max(1, pageNum);
    if (pageNum > 100) {
        throw new ApiError(400, "Page number exceeds maximum allowed limit");
    }
    limitNum = Math.min(50, Math.max(1, limitNum));
    const skip = (pageNum - 1) * limitNum;

    try {
        const activities = await findActivities({
            filter,
            skip,
            limit: limitNum
        });

        const total = await countActivities(filter);
        const summary = await getActivitySummary(filter);

        console.log(`Customer timeline retrieved | CustomerID: ${customerId} | RequestedBy: ${userId} | Count: ${activities.length} | Total: ${total}`);

        return {
            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            },
            summary: summary[0] || {
                totalActivities: 0,
                uniqueDealsCount: 0,
                activityTypes: []
            },
            activities,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        };
    } catch (err) {
        console.error("Failed to fetch customer timeline:", err);
        throw new ApiError(500, "Failed to retrieve customer timeline, please try again");
    }
};













export const getCustomerDealsService = async (userId, customerId, query) => {
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

    const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = query;

    const filter = {
        organization: customer.organization,
        customer: customerId,
        isDeleted: false
    };

    if (status) {
        const normalizedStatus = status.trim().toLowerCase();
        const allowedStatuses = ["active", "won", "lost"];
        if (!allowedStatuses.includes(normalizedStatus)) {
            throw new ApiError(400, `Invalid status filter. Allowed values are: ${allowedStatuses.join(", ")}`);
        }

        filter.status = normalizedStatus;
    }

    if (search && search.trim()) {
        const safeSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .split(/\s+/)
            .join('.*'); // allows "crm pro" → "crm.*pro"

        filter.title = {
            $regex: safeSearch,
            $options: "i"
        };
    }

    // pagination
    let pageNum = Number(page) || 1; // if invalid type then use default page 1 & preventing garbage value for page
    let limitNum = Number(limit) || 10; // if invalid type then use default limit 10 & preventing garbage value for limit
    pageNum = Math.max(1, pageNum);
    if (pageNum > 100) {
        throw new ApiError(400, "Page number exceeds maximum allowed limit");
    }
    limitNum = Math.min(50, Math.max(1, limitNum));
    const skip = (pageNum - 1) * limitNum;

    // sorting
    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "latestInteractionAt",
        "closedAt",
        "title"
    ];

    const finalSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sort = {};
    sort[finalSortField] = sortOrder === "desc" ? -1 : 1;

    console.log(`--------\nPage: ${pageNum} | limit: ${limitNum} | skip: ${skip} | sort: ${finalSortField || "createdAt"} ${sortOrder || "asc"}\nSearch: ${search || "N/A"}`); // debug log

    try {
        // running these in parallel to optimize performance
        const [deals, statistics] = await Promise.all([
            findDeals({
                filter,
                sort,
                skip,
                limit: limitNum
            }),
            getDealStatistics(filter)
        ]);

        const statsMap = {
            active: 0,
            won: 0,
            lost: 0,
            total: 0
        };

        statistics.forEach(stat => {
            if (stat._id === "active") statsMap.active = stat.count;
            if (stat._id === "won") statsMap.won = stat.count;
            if (stat._id === "lost") statsMap.lost = stat.count;
        });

        statsMap.total = statsMap.active + statsMap.won + statsMap.lost;

        console.log(`Customer deals retrieved | CustomerID: ${customerId} | RequestedBy: ${userId} | Count: ${deals.length} | Total: ${statsMap.total}`);

        return {
            customer: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            },

            statistics: statsMap,

            deals,

            pagination: {
                page: pageNum,
                limit: limitNum,
                total: statsMap.total,
                totalPages: Math.ceil(statsMap.total / limitNum)
            }
        };
    } catch (error) {
        console.error("Failed to fetch customer deals:", error);
        throw new ApiError(500, error.message || "Failed to retrieve customer deals, please try again");
    }
};