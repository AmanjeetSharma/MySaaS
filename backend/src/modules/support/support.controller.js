import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createTicketService } from "./support.service.js";


export const createTicketController = asyncHandler(async (req, res) => {
    const { subject, description, priority, category } = req.body;

    const data = await createTicketService({
        subject,
        description,
        priority,
        category,
        userId: req.user._id,
        organizationId: req.user.organizationId,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Support ticket created successfully."
        )
    );
});


// export const getTicketsController = asyncHandler(async (req, res) => {
//     const data = await getTicketsService({
//         organizationId: req.user.organizationId,
//         query: req.query,
//     });

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             null,
//             "Support tickets fetched successfully."
//         )
//     );
// });


// export const getTicketByIdController = asyncHandler(async (req, res) => {
//     const { ticketId } = req.params;

//     const data = await getTicketByIdService({
//         ticketId,
//         organizationId: req.user.organizationId,
//     });

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             null,
//             "Support ticket fetched successfully."
//         )
//     );
// });


// export const updateTicketController = asyncHandler(async (req, res) => {
//     const { ticketId } = req.params;
//     const updates = req.body;

//     const data = await updateTicketService({
//         ticketId,
//         updates,
//         organizationId: req.user.organizationId,
//     });

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             null,
//             "Support ticket updated successfully."
//         )
//     );
// });


// export const deleteTicketController = asyncHandler(async (req, res) => {
//     const { ticketId } = req.params;

//     const data = await deleteTicketService({
//         ticketId,
//         organizationId: req.user.organizationId,
//     });

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             null,
//             "Support ticket deleted successfully."
//         )
//     );
// });
