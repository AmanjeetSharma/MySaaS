import { ApiError } from "../../utils/ApiError.js";
import { TICKET_PRIORITIES, TICKET_CATEGORIES } from "./support.constants.js";


export const validateTicketSubject = (subject) => {
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
        throw new ApiError(400, "Ticket subject is required.");
    }

    if (subject.trim().length > 200) {
        throw new ApiError(400, "Ticket subject must not exceed 200 characters.");
    }

    return subject.trim();
};


export const validateTicketDescription = (description) => {
    if (!description || typeof description !== "string" || description.trim().length === 0) {
        throw new ApiError(400, "Ticket description is required.");
    }

    if (description.trim().length > 5000) {
        throw new ApiError(400, "Ticket description must not exceed 5000 characters.");
    }

    return description.trim();
};


export const validateTicketPriority = (priority) => {
    if (priority && !TICKET_PRIORITIES.includes(priority)) {
        throw new ApiError(400, `Invalid priority. Must be one of: ${TICKET_PRIORITIES.join(", ")}`);
    }
};


export const validateTicketCategory = (category) => {
    if (category && !TICKET_CATEGORIES.includes(category)) {
        throw new ApiError(400, `Invalid category. Must be one of: ${TICKET_CATEGORIES.join(", ")}`);
    }
};
