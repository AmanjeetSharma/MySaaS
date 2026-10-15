import { Ticket } from "./support.model.js";

export const createTicket = async (ticketData) => {
    return Ticket.create(ticketData);
};
