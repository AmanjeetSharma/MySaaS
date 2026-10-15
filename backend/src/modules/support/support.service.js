import { ApiError } from "../../utils/ApiError.js";
import { createTicket } from "./support.repository.js";
import {
    validateTicketSubject,
    validateTicketDescription,
    validateTicketPriority,
    validateTicketCategory,
} from "./support.helper.js";
import logger from "#/config/logger.js";


export const createTicketService = async ({
    subject,
    description,
    priority,
    category,
    userId,
    organizationId,
}) => {

    const sanitizedSubject = validateTicketSubject(subject);
    const sanitizedDescription = validateTicketDescription(description);
    validateTicketPriority(priority);
    validateTicketCategory(category);

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required.");
    }

    let ticket;

    try {
        ticket = await createTicket({
            organization: organizationId,
            createdBy: userId,
            subject: sanitizedSubject,
            description: sanitizedDescription,
            priority: priority || "MEDIUM",
            category: category || "GENERAL",
        });

    } catch (err) {
        logger.error(
            {
                error: err.message,
                stack: err.stack,
            },
            "support.ticket_create_failed"
        );

        throw new ApiError(500, "Failed to create support ticket. Please try again.");
    }

    logger.info(
        {
            ticketId: ticket._id,
            subject: ticket.subject,
            priority: ticket.priority,
            category: ticket.category,
        },
        "support.ticket_created"
    );

    return { ticket };
};
