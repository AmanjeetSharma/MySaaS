import express from "express";
import {
    createTicketController,
    // getTicketsController,
    // getTicketByIdController,
    // updateTicketController,
    // deleteTicketController,
} from "./support.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createTicketController);

// router.get("/", getTicketsController);

// router.get("/:ticketId", getTicketByIdController);

// router.patch("/:ticketId", updateTicketController);

// router.delete("/:ticketId", deleteTicketController);


export default router;
